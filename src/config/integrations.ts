/* ============================================================================
   INTEGRATIONS — WHAT YOU EDIT TO GO LIVE
   ----------------------------------------------------------------------------
   Out of the box the site runs in DEMONSTRATION MODE: the calendar works, the
   totals are real, the forms validate — but no money moves and no booking
   leaves the browser. Every screen that is pretending says so, out loud, where
   the customer can read it. Nothing here fakes a payment.

   To make it real you need the small server in `api/`. It exists because a
   payment cannot be done safely from a browser: the price has to be
   recalculated somewhere the customer cannot edit, and the Stripe secret key
   has to live somewhere they cannot read. See `api/README.md`.

   ── THE ONE VARIABLE THAT SWITCHES IT ON ──────────────────────────────────

     VITE_API_BASE=/api           same origin as the site (the usual case)
     VITE_API_BASE=https://…/api  a server hosted somewhere else

   That is all the browser ever needs to know. The Stripe keys live on the
   server, in ITS environment, and never appear in this file, in the bundle,
   or in anything shipped to a visitor.

   ⚠ Anything named VITE_* IS COMPILED INTO THE JAVASCRIPT AND IS PUBLIC.
     A Stripe secret key (sk_live_…) must never be given that prefix, or any
     other route into this directory.
   ========================================================================= */

const env = import.meta.env;

/** Where the booking and payment endpoints live. Empty = demonstration mode. */
export const API_BASE: string = (env.VITE_API_BASE ?? '').replace(/\/$/, '');

/** True once a server is configured. Drives every "this is a demonstration"
    notice on the site — there is exactly one switch, so they cannot disagree. */
export const isLive = (): boolean => API_BASE.length > 0;

/**
 * Publishable key, optional. Only needed if you later move from Stripe's
 * hosted Checkout to an embedded card element. It is publishable by design —
 * safe in the bundle — and the site works without it.
 */
export const STRIPE_PUBLISHABLE_KEY: string = env.VITE_STRIPE_PUBLISHABLE_KEY ?? '';

/** Where Stripe returns the customer. Must be a full, absolute URL. */
export function checkoutReturnUrls(origin: string) {
  return {
    success: `${origin}/book/confirmed?ref={BOOKING_REF}`,
    cancel: `${origin}/book?cancelled=1`,
  };
}

/* ---------------------------------------------------------------------------
   FORMS
   The contact and commercial-quote forms post to whatever you put here. Any
   service that accepts a plain POST works — Formspree, Basin, a Netlify
   function, your own inbox handler.

   Leave it blank and the forms validate, compose, and show a success state,
   but tell the reader plainly that the message was not sent and give them the
   phone number and email address instead. A form that silently swallows an
   enquiry is worse than no form.
   ------------------------------------------------------------------------ */

export const FORM_ENDPOINT: string = env.VITE_FORM_ENDPOINT ?? '';
export const formsAreLive = (): boolean => FORM_ENDPOINT.trim().length > 0;

/* ---------------------------------------------------------------------------
   ANALYTICS — off unless you ask for it. No third-party script is loaded by
   this site otherwise, which is why it has no cookie banner.
   ------------------------------------------------------------------------ */

export const ANALYTICS = {
  plausibleDomain: env.VITE_PLAUSIBLE_DOMAIN ?? '',
};
