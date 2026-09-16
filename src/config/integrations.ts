/* ============================================================================
   INTEGRATIONS — THE ONLY FILE YOU EDIT TO GO LIVE
   ----------------------------------------------------------------------------
   Out of the box both the diary and the deposit are demonstrations: nothing is
   booked and no money moves. Fill in the two values below (or set the matching
   environment variables) and the site switches to the real thing on its own.

   Neither integration needs a server, a database, or an API key in the browser.
   A booking is an embedded page from your scheduler; a payment is a redirect to
   a link your payment provider hosts. No card number ever touches this code.

   ── BOOKING ───────────────────────────────────────────────────────────────
   Cal.com    Create an event type, then take the part of its public address
              after cal.com — for example `elena/viewing`.
   Calendly   Same idea: from calendly.com/elena/viewing, take `elena/viewing`.

   ── PAYMENTS ──────────────────────────────────────────────────────────────
   Stripe     Dashboard → Payment links → New. Set the amount, switch on
              "Collect customer address" if you want it, and copy the
              https://buy.stripe.com/... address. One link per residence is
              tidiest, because each deposit is a different amount.

   Test it with Stripe in test mode first. A link created in test mode only
   ever accepts test cards, so you can click the whole flow safely.
   ========================================================================= */

export type BookingProvider = 'demo' | 'cal' | 'calendly';
export type PaymentProvider = 'demo' | 'stripe';

const env = import.meta.env;

export interface BookingConfig {
  provider: BookingProvider;
  /** `user/event` — never the full https:// address. */
  link: string;
}

export interface PaymentConfig {
  provider: PaymentProvider;
  /** A payment link per residence slug. Most specific wins. */
  links: Record<string, string>;
  /** Used for any residence without its own link. */
  fallbackLink: string;
}

export const BOOKING: BookingConfig = {
  provider: (env.VITE_BOOKING_PROVIDER as BookingProvider) || 'demo',
  link: env.VITE_BOOKING_LINK || '',
};

export const PAYMENTS: PaymentConfig = {
  provider: (env.VITE_PAYMENT_PROVIDER as PaymentProvider) || 'demo',
  links: {
    'casa-aurelia': env.VITE_STRIPE_LINK_CASA_AURELIA || '',
    'the-ridge-house': env.VITE_STRIPE_LINK_RIDGE_HOUSE || '',
    'villa-no-17': env.VITE_STRIPE_LINK_VILLA_17 || '',
    'the-glass-house': env.VITE_STRIPE_LINK_GLASS_HOUSE || '',
  },
  fallbackLink: env.VITE_STRIPE_LINK_DEFAULT || '',
};

/* ---------------------------------------------------------------------------
   Resolution
   ------------------------------------------------------------------------ */

export function bookingIsLive(): boolean {
  return BOOKING.provider !== 'demo' && BOOKING.link.trim().length > 0;
}

/** The address the scheduler is embedded from, with our own styling applied. */
export function bookingEmbedUrl(opts: {
  name?: string;
  email?: string;
  notes?: string;
}): string | null {
  if (!bookingIsLive()) return null;
  const path = BOOKING.link.replace(/^https?:\/\/[^/]+\//, '').replace(/^\/+|\/+$/g, '');

  if (BOOKING.provider === 'cal') {
    const q = new URLSearchParams({
      embed: 'inline',
      // Cal reads these as its own theme tokens; they are hex without the hash.
      'theme': 'light',
      'brandColor': '9B7C4E',
      'layout': 'month_view',
    });
    if (opts.name) q.set('name', opts.name);
    if (opts.email) q.set('email', opts.email);
    if (opts.notes) q.set('notes', opts.notes);
    return `https://cal.com/${path}?${q.toString()}`;
  }

  const q = new URLSearchParams({
    embed_type: 'Inline',
    embed_domain: typeof window === 'undefined' ? 'localhost' : window.location.hostname,
    hide_gdpr_banner: '1',
    background_color: 'f4f1ea',
    text_color: '1c1b17',
    primary_color: '9b7c4e',
  });
  if (opts.name) q.set('name', opts.name);
  if (opts.email) q.set('email', opts.email);
  if (opts.notes) q.set('a1', opts.notes);
  return `https://calendly.com/${path}?${q.toString()}`;
}

/** The same booking page, for opening in a tab when the frame is refused. */
export function bookingDirectUrl(): string | null {
  if (!bookingIsLive()) return null;
  const path = BOOKING.link.replace(/^https?:\/\/[^/]+\//, '').replace(/^\/+|\/+$/g, '');
  return BOOKING.provider === 'cal'
    ? `https://cal.com/${path}`
    : `https://calendly.com/${path}`;
}

export function paymentIsLive(slug: string): boolean {
  return PAYMENTS.provider === 'stripe' && paymentLinkFor(slug) !== null;
}

export function paymentLinkFor(slug: string): string | null {
  const own = PAYMENTS.links[slug]?.trim();
  if (own) return own;
  const fallback = PAYMENTS.fallbackLink.trim();
  return fallback || null;
}

/**
 * Hands the buyer to the provider's own checkout, carrying what we already
 * know so they do not retype it. `client_reference_id` comes back on the
 * webhook, which is how a payment gets matched to a residence.
 */
export function checkoutUrl(slug: string, email?: string): string | null {
  const base = paymentLinkFor(slug);
  if (!base) return null;
  const url = new URL(base);
  url.searchParams.set('client_reference_id', slug);
  if (email) url.searchParams.set('prefilled_email', email);
  return url.toString();
}
