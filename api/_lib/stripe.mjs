import { createHmac, timingSafeEqual } from 'node:crypto';

/* ============================================================================
   STRIPE
   ----------------------------------------------------------------------------
   Talks to Stripe's REST API with `fetch`. There is no SDK dependency, because
   two endpoints and a signature check do not justify one.

   THE SECRET KEY IS READ FROM THE ENVIRONMENT AND NEVER LEAVES THIS FILE.
   It is not passed to a handler, not logged, and not echoed in an error.
   ========================================================================= */

const API = 'https://api.stripe.com/v1';

function secretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set.');
  if (key.startsWith('pk_')) {
    throw new Error('STRIPE_SECRET_KEY holds a publishable key. It needs the secret key (sk_...).');
  }
  return key;
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isTestMode() {
  return (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_test_');
}

/** Stripe takes form-encoded bodies, including for nested fields. */
function encode(obj, prefix = '') {
  const parts = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === 'object') parts.push(encode(item, `${key}[${i}]`));
        else parts.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(item)}`);
      });
    } else if (typeof v === 'object') {
      parts.push(encode(v, key));
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
    }
  }
  return parts.filter(Boolean).join('&');
}

async function call(path, body, idempotencyKey) {
  const headers = {
    Authorization: `Bearer ${secretKey()}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  // Without this, a retried request could charge someone twice.
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  const res = await fetch(`${API}${path}`, { method: 'POST', headers, body: encode(body) });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message ?? `Stripe returned ${res.status}.`;
    throw new Error(message);
  }
  return data;
}

/**
 * A Checkout Session for one booking.
 *
 * Every line comes from the server's own quote. The browser sends selections,
 * never amounts, so the figure charged is the figure the catalogue produces.
 * Card details are entered on Stripe's page, which is what keeps this site
 * out of PCI scope entirely.
 */
export async function createCheckoutSession({ quote, reference, customer, successUrl, cancelUrl, describe }) {
  const dueNow = quote.dueNowCents ?? quote.totalCents;

  // Two cases, and they must not be mixed up.
  //
  // Charging the whole job: itemise it, so the receipt reads like the review
  // screen did — package, size, each add-on, travel, then tax as its own line.
  // Tax is a line item rather than a Stripe Tax calculation so that the total
  // Stripe charges is arithmetically identical to the total we displayed.
  //
  // Charging a deposit (DEPOSIT.mode === 'percent'): the itemised lines add up
  // to the WHOLE job, not to the deposit, so itemising would overcharge. One
  // line, named for what it is, and the balance stated in the description.
  const line_items =
    dueNow === quote.totalCents
      ? [
          ...quote.lines.map((line) => ({
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: line.amountCents,
              product_data: { name: line.label },
            },
          })),
          ...(quote.taxCents > 0
            ? [
                {
                  quantity: 1,
                  price_data: {
                    currency: 'usd',
                    unit_amount: quote.taxCents,
                    product_data: { name: quote.taxLabel ?? 'Sales tax' },
                  },
                },
              ]
            : []),
        ]
      : [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: dueNow,
              product_data: {
                name: `Deposit — ${describe.packageName}`,
                description: `Balance of ${((quote.totalCents - dueNow) / 100).toFixed(2)} USD due on delivery.`,
              },
            },
          },
        ];

  // A last check that what we are about to charge is what we worked out.
  const charged = line_items.reduce((sum, li) => sum + li.price_data.unit_amount * li.quantity, 0);
  if (charged !== dueNow) {
    throw new Error(
      `Refusing to charge: line items total ${charged} but the quote says ${dueNow}.`,
    );
  }

  const session = await call(
    '/checkout/sessions',
    {
      mode: 'payment',
      line_items,
      customer_email: customer.email || undefined,
      client_reference_id: reference,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        reference,
        date: describe.date,
        time: describe.time,
        package: describe.packageName,
        address: (customer.address ?? '').slice(0, 480),
        phone: (customer.phone ?? '').slice(0, 40),
        name: (customer.name ?? '').slice(0, 120),
      },
      payment_intent_data: {
        description: `${describe.packageName} — ${describe.date} ${describe.time} — ${reference}`,
      },
    },
    // One key per booking reference: a double-submit cannot create two sessions.
    `booking-${reference}`,
  );

  return { id: session.id, url: session.url };
}

/**
 * Verifies a webhook actually came from Stripe.
 *
 * Without this check the endpoint would accept anyone's POST claiming a
 * payment succeeded, which is the single most common way these are abused.
 */
export function verifyWebhook(rawBody, signatureHeader, toleranceSeconds = 300) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set.');
  if (!signatureHeader) throw new Error('Missing Stripe-Signature header.');

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i), p.slice(i + 1)];
    }),
  );

  const timestamp = Number(parts.t);
  if (!timestamp) throw new Error('Malformed Stripe-Signature header.');

  // Rejects a replayed request captured earlier.
  const age = Math.abs(Date.now() / 1000 - timestamp);
  if (age > toleranceSeconds) throw new Error('Webhook timestamp is outside the tolerance window.');

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const provided = parts.v1 ?? '';

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(provided, 'utf8');
  // Compare in constant time so the endpoint does not leak the signature
  // one byte at a time to anyone measuring how long it takes to answer.
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error('Webhook signature did not match.');
  }

  return JSON.parse(rawBody);
}
