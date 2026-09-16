/* ============================================================================
   TESTIMONIALS
   ----------------------------------------------------------------------------
   ⚠ EVERY ENTRY BELOW IS A PLACEHOLDER. Nobody said these things.

   They exist so the section has the right shape, length and rhythm before you
   have collected real ones. The site LABELS them as examples wherever they
   appear — that labelling comes from `placeholder: true`. Do not remove the
   flag while the words are still invented, because that would be passing
   fiction off as a customer review.

   To publish a real one: replace the text, name, role and company with what the
   client actually wrote, then delete the `placeholder: true` line. The label
   disappears on its own.
   ========================================================================= */

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  /** Leave true until the words are genuinely someone else's. */
  placeholder?: boolean;
  /** Which service it refers to. Shown as a small label. */
  service?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    quote:
      'The twilight set came back the next morning and we had three showings booked by lunchtime. I have stopped sending my listings anywhere else.',
    name: 'Client name',
    role: 'Listing agent',
    company: 'Brokerage name',
    service: 'Premium package',
    placeholder: true,
  },
  {
    id: 't2',
    quote:
      'What I actually pay for is not having to think about it. One appointment, photos and film and the aerial, all back inside two days, all looking like they belong together.',
    name: 'Client name',
    role: 'Broker',
    company: 'Brokerage name',
    service: 'Photo + Video package',
    placeholder: true,
  },
  {
    id: 't3',
    quote:
      'We had never had anything shot properly. The film has been on our homepage for a year and people still mention it when they come in.',
    name: 'Client name',
    role: 'Owner',
    company: 'Local business',
    service: 'Commercial',
    placeholder: true,
  },
  {
    id: 't4',
    quote:
      'The aerials sold the lot. The house was fine, but nobody understood the land until they saw it from above.',
    name: 'Client name',
    role: 'Listing agent',
    company: 'Brokerage name',
    service: 'Aerial photography',
    placeholder: true,
  },
  {
    id: 't5',
    quote:
      'Booked on a Tuesday, shot on a Thursday, live on Friday. The price on the screen was the price on the invoice.',
    name: 'Client name',
    role: 'Realtor',
    company: 'Brokerage name',
    service: 'Photo package',
    placeholder: true,
  },
  {
    id: 't6',
    quote:
      'It rained on the scheduled day and the reschedule cost me nothing and took one text message. That is rarer than it should be.',
    name: 'Client name',
    role: 'Listing agent',
    company: 'Brokerage name',
    service: 'Photo + Video package',
    placeholder: true,
  },
];

/** True while any testimonial on the site is still invented. Drives the notice. */
export const HAS_PLACEHOLDER_TESTIMONIALS = TESTIMONIALS.some((t) => t.placeholder);
