import { quote, getPackage } from '../shared/catalog.mjs';
import { slotIsBookable, slotsFor, formatDate, formatTime } from '../shared/schedule.mjs';
import * as store from './_lib/store.mjs';
import { createCheckoutSession, stripeConfigured, verifyWebhook } from './_lib/stripe.mjs';

/* ============================================================================
   HANDLERS
   ----------------------------------------------------------------------------
   Plain functions: `(input) => { status, body }`. No framework, no request
   object, no response object — which is what lets the same four handlers run
   behind the little server in `server.mjs`, a Vercel function, a Netlify
   function or a Cloudflare Worker without being rewritten for each.

   THE RULE THIS FILE EXISTS TO ENFORCE: the browser sends CHOICES, and the
   server decides PRICE and AVAILABILITY. Nothing a customer can edit in
   devtools is ever trusted.
   ========================================================================= */

const MAX_NOTE = 2000;

const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max);

/** Rejects anything that is not a plain 'YYYY-MM-DD'. */
const isIsoDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? ''));
const isTime = (v) => /^\d{2}:\d{2}$/.test(String(v ?? ''));

function validEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

/* ---------------------------------------------------------------------------
   GET /availability?from=…&to=…
   ------------------------------------------------------------------------ */

export async function getAvailability({ query }) {
  const from = isIsoDate(query.from) ? query.from : null;
  const to = isIsoDate(query.to) ? query.to : null;
  if (!from || !to) {
    return { status: 400, body: { ok: false, error: 'from and to must be YYYY-MM-DD dates.' } };
  }

  const booked = (await store.occupied()).filter((b) => b.date >= from && b.date <= to);
  // Only the shape of the diary goes out — dates, times and durations. Never a
  // customer name, address or email: this endpoint is public.
  return { status: 200, body: { ok: true, booked } };
}

/* ---------------------------------------------------------------------------
   POST /bookings
   ------------------------------------------------------------------------ */

export async function postBooking({ body, origin }) {
  const packageId = clean(body.packageId, 60);
  const addonIds = Array.isArray(body.addonIds) ? body.addonIds.slice(0, 20).map((a) => clean(a, 60)) : [];
  const sizeTierId = clean(body.sizeTierId, 60);
  const miles = Number(body.miles) || 0;
  const date = clean(body.date, 10);
  const time = clean(body.time, 5);
  const c = body.customer ?? {};

  const customer = {
    name: clean(c.name, 120),
    email: clean(c.email, 200).toLowerCase(),
    phone: clean(c.phone, 40),
    address: clean(c.address, 300),
    propertyType: clean(c.propertyType, 80),
    squareFeet: clean(c.squareFeet, 20),
    notes: clean(c.notes, MAX_NOTE),
  };

  if (!isIsoDate(date) || !isTime(time)) {
    return { status: 400, body: { ok: false, error: 'That date or time was not understood.' } };
  }
  if (!customer.name) return { status: 400, body: { ok: false, error: 'A name is required.' } };
  if (!validEmail(customer.email)) {
    return { status: 400, body: { ok: false, error: 'A valid email address is required.' } };
  }
  if (customer.phone.replace(/\D/g, '').length < 10) {
    return { status: 400, body: { ok: false, error: 'A valid phone number is required.' } };
  }
  if (!customer.address) {
    return { status: 400, body: { ok: false, error: 'The property address is required.' } };
  }

  const pkg = getPackage(packageId);
  if (!pkg) return { status: 400, body: { ok: false, error: 'That package does not exist.' } };
  if (pkg.quoteOnly) {
    return { status: 400, body: { ok: false, error: `${pkg.name} is quoted per project, not booked online.` } };
  }

  // THE PRICE. Worked out here, from the catalogue, ignoring anything the
  // browser may have claimed a total was.
  const priced = quote({ packageId, addonIds, sizeTierId, miles });
  if (!priced.ok) return { status: 400, body: { ok: false, error: priced.error } };
  if (priced.totalCents <= 0) {
    return { status: 400, body: { ok: false, error: 'That order came to nothing. Please start again.' } };
  }

  // A first check, so an obviously-taken slot is refused before Stripe is
  // involved. The check that actually matters happens inside the store lock.
  const firstLook = slotIsBookable(date, time, priced.minutes, await store.occupied());
  if (!firstLook.ok) {
    return { status: 409, body: { ok: false, error: firstLook.reason } };
  }

  const reference = store.reference();
  const record = {
    reference,
    status: 'pending',
    packageId,
    packageName: pkg.name,
    addonIds: priced.addonIds,
    sizeTierId: priced.sizeTierId,
    miles,
    date,
    time,
    minutes: priced.minutes,
    subtotalCents: priced.subtotalCents,
    taxCents: priced.taxCents,
    totalCents: priced.totalCents,
    dueNowCents: priced.dueNowCents,
    currency: 'usd',
    customer,
    createdAt: Date.now(),
    paidAt: null,
    stripeSessionId: null,
  };

  // The real guard. It runs with the lock held, against the committed list, so
  // two requests for the same slot cannot both pass it — whichever gets the
  // lock second sees the first one's booking and is refused.
  const written = await store.add(record, (existing) => {
    const taken = existing
      .filter((b) => b.status === 'pending' || b.status === 'confirmed')
      .map((b) => ({ date: b.date, time: b.time, minutes: b.minutes }));
    const verdict = slotIsBookable(date, time, priced.minutes, taken);
    return { ok: verdict.ok, reason: verdict.reason };
  });

  if (!written.ok) {
    return { status: 409, body: { ok: false, error: written.error } };
  }

  // No Stripe configured: the booking is held, but say so rather than
  // pretending a payment happened.
  if (!stripeConfigured()) {
    return {
      status: 200,
      body: {
        ok: true,
        reference,
        quote: priced,
        demo: true,
        error: undefined,
      },
    };
  }

  try {
    const session = await createCheckoutSession({
      quote: priced,
      reference,
      customer,
      successUrl: `${origin}/book/confirmed?ref=${reference}`,
      cancelUrl: `${origin}/book?cancelled=${reference}`,
      describe: {
        packageName: pkg.name,
        date: formatDate(date),
        time: formatTime(time),
      },
    });
    await store.update(reference, { stripeSessionId: session.id });
    return { status: 200, body: { ok: true, reference, checkoutUrl: session.url, quote: priced } };
  } catch (e) {
    // The hold is released immediately. Leaving a pending booking behind after
    // a failed checkout would block a slot nobody is buying.
    await store.update(reference, { status: 'cancelled', cancelReason: 'checkout-failed' });
    return {
      status: 502,
      body: { ok: false, error: `Payment could not be started: ${e.message}` },
    };
  }
}

/* ---------------------------------------------------------------------------
   GET /bookings/:reference
   ------------------------------------------------------------------------ */

export async function getBooking({ params }) {
  const booking = await store.find(clean(params.reference, 20).toUpperCase());
  if (!booking) return { status: 404, body: { ok: false, error: 'No booking with that reference.' } };

  // Enough to render a confirmation, and nothing more. The address, phone
  // number and notes are not returned: a reference is short enough to guess.
  return {
    status: 200,
    body: {
      ok: true,
      reference: booking.reference,
      status: booking.status,
      date: booking.date,
      time: booking.time,
      packageName: booking.packageName,
      totalCents: booking.totalCents,
      paid: booking.status === 'confirmed',
      customerFirstName: (booking.customer?.name ?? '').split(' ')[0] ?? '',
    },
  };
}

/* ---------------------------------------------------------------------------
   POST /webhook  — Stripe tells us the payment landed.
   ------------------------------------------------------------------------ */

export async function postWebhook({ rawBody, headers }) {
  let event;
  try {
    event = verifyWebhook(rawBody, headers['stripe-signature']);
  } catch (e) {
    // 400, deliberately: Stripe retries on 5xx, and a bad signature will never
    // become a good one.
    return { status: 400, body: { ok: false, error: e.message } };
  }

  const type = event.type;
  const session = event.data?.object ?? {};
  const reference = session.client_reference_id ?? session.metadata?.reference;

  if (!reference) return { status: 200, body: { ok: true, ignored: 'no reference' } };

  if (type === 'checkout.session.completed' && session.payment_status === 'paid') {
    await store.update(reference, {
      status: 'confirmed',
      paidAt: Date.now(),
      stripePaymentIntent: session.payment_intent ?? null,
      amountPaidCents: session.amount_total ?? null,
    });
    return { status: 200, body: { ok: true, confirmed: reference } };
  }

  if (type === 'checkout.session.expired') {
    const booking = await store.find(reference);
    // Only release a hold that is still a hold. A confirmed booking whose
    // session later expires must not be cancelled.
    if (booking?.status === 'pending') {
      await store.update(reference, { status: 'expired' });
    }
    return { status: 200, body: { ok: true, expired: reference } };
  }

  return { status: 200, body: { ok: true, ignored: type } };
}

/* ---------------------------------------------------------------------------
   GET /admin/bookings — everything, including customer details.
   Requires the admin token. Without one set, the endpoint is off entirely.
   ------------------------------------------------------------------------ */

export async function getAdminBookings({ headers, query }) {
  const token = process.env.KM_ADMIN_TOKEN;
  if (!token) {
    return { status: 503, body: { ok: false, error: 'Admin API is disabled: KM_ADMIN_TOKEN is not set.' } };
  }
  const provided = headers['authorization']?.replace(/^Bearer\s+/i, '') ?? query.token ?? '';
  if (provided !== token) {
    return { status: 401, body: { ok: false, error: 'Not authorised.' } };
  }
  const bookings = await store.all();
  return { status: 200, body: { ok: true, bookings } };
}

/* ---------------------------------------------------------------------------
   GET /slots?date=…&minutes=…  — used by the admin view.
   ------------------------------------------------------------------------ */

export async function getSlots({ query }) {
  const date = isIsoDate(query.date) ? query.date : null;
  const minutes = Math.max(30, Number(query.minutes) || 90);
  if (!date) return { status: 400, body: { ok: false, error: 'date must be YYYY-MM-DD.' } };
  const slots = slotsFor(date, minutes, await store.occupied());
  return { status: 200, body: { ok: true, date, minutes, slots } };
}
