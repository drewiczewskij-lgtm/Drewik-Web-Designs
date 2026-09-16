/* ============================================================================
   FREQUENTLY ASKED
   ----------------------------------------------------------------------------
   Grouped, because a flat list of twenty questions is a wall. Answers are
   written to actually settle the question rather than to fill the accordion.

   Anything that states a policy — turnaround, weather, rescheduling, payment —
   must match what `shared/catalog.mjs` and `shared/schedule.mjs` actually do.
   If you change a lead time or a deposit rule there, change the wording here.
   ========================================================================= */

export interface FaqItem {
  id: string;
  q: string;
  a: string;
  group: FaqGroup;
}

export type FaqGroup = 'booking' | 'shoot' | 'delivery' | 'payment' | 'drone';

export const FAQ_GROUPS: { id: FaqGroup; label: string; blurb: string }[] = [
  { id: 'booking', label: 'Booking', blurb: 'Dates, notice and changes.' },
  { id: 'shoot', label: 'On the day', blurb: 'What happens, and what you need to do.' },
  { id: 'delivery', label: 'Delivery', blurb: 'What you get back, and when.' },
  { id: 'payment', label: 'Payment', blurb: 'Prices, invoices and refunds.' },
  { id: 'drone', label: 'Drone & weather', blurb: 'Flying, rules and grey skies.' },
];

export const FAQS: FaqItem[] = [
  {
    id: 'how-booking-works',
    group: 'booking',
    q: 'How does booking work?',
    a: 'Choose a package, add anything extra you want, then pick a date and a time from the calendar. The calendar only ever shows slots that are genuinely free and long enough for what you have selected, so there is no back-and-forth to confirm. You enter the property details, review the total, pay, and the slot is yours — you get a confirmation on screen and by email with a reference number.',
  },
  {
    id: 'how-far-ahead',
    group: 'booking',
    q: 'How far in advance should I book?',
    a: 'Three to five days is comfortable. The calendar requires at least 24 hours’ notice and opens 90 days ahead. Twilight slots are the ones that go first, because there is exactly one of them per day and it moves with the sunset — if you want twilight, book earlier than you think you need to.',
  },
  {
    id: 'reschedule',
    group: 'booking',
    q: 'Can I reschedule?',
    a: 'Yes. Up to 24 hours before the shoot, rescheduling is free and takes one message — use the reference number on your confirmation. Inside 24 hours a reschedule is also free if the reason is weather or access; otherwise the deposit moves to the new date rather than being refunded. Nobody is charged twice for the same job.',
  },
  {
    id: 'not-present',
    group: 'booking',
    q: 'Do I need to be there?',
    a: 'No, as long as I can get in. A lockbox code, a key under an agreed arrangement, or a seller who is home all work. Most agents do not attend, and the shoot tends to go slightly faster when the house is empty.',
  },
  {
    id: 'how-long',
    group: 'shoot',
    q: 'How long does a shoot take?',
    a: 'A photo-only shoot on an average house is 60 to 90 minutes. Adding video takes it to two or three hours. The Premium package, with drone and twilight, is closer to three and a half. Larger properties add time, which is why the booking form asks for square footage — it reserves the right amount of the calendar rather than guessing.',
  },
  {
    id: 'prepare',
    group: 'shoot',
    q: 'How should the property be prepared?',
    a: 'You get a short prep note when you book. The short version: every light on and every bulb matching, blinds open and level, cars off the driveway, bins out of shot, counters and bathrooms clear, toilet lids down, pets somewhere else. Twenty minutes of that work changes every photograph in the set, and it is time I cannot make up afterwards in editing.',
  },
  {
    id: 'occupied',
    group: 'shoot',
    q: 'Can you shoot an occupied home?',
    a: 'Yes, and most of them are. Small things get moved out of frame and put back. If a room genuinely will not photograph well because of clutter, you will be told on the day rather than finding out when the gallery arrives.',
  },
  {
    id: 'when-photos',
    group: 'delivery',
    q: 'When will I receive my photos?',
    a: 'Photography is delivered the next business day. Film takes 48 to 72 hours because of the grade and the sound. If you need it faster, the rush add-on puts everything back within 24 hours of the shoot and it is available at booking rather than as a favour later.',
  },
  {
    id: 'what-format',
    group: 'delivery',
    q: 'What do I actually get?',
    a: 'A private online gallery with two sets of every image: MLS-sized, ready to upload without resizing, and full-resolution for print and brochures. Film arrives as a 4K file plus a vertical cut if your package includes one. Everything downloads as a single zip, and the gallery link stays live for twelve months.',
  },
  {
    id: 'licensing',
    group: 'delivery',
    q: 'Can I use the images for anything I like?',
    a: 'You get an unlimited licence to use the work for marketing the property and for your own promotion, for as long as you want. The copyright stays with KM Productions, which matters in one narrow case: the images cannot be resold to a third party — a portal, a stock library, another brokerage — without asking first.',
  },
  {
    id: 'customise',
    group: 'payment',
    q: 'Can I customise a package?',
    a: 'That is what the add-ons are for. Start from whichever package is closest and add twilight, aerial, a floor plan, a 3D tour or a vertical cut. The total updates as you select, so you can see exactly what each choice costs before you commit to it. If what you need is not on the list, use the commercial enquiry form.',
  },
  {
    id: 'payments',
    group: 'payment',
    q: 'How do payments work?',
    a: 'Payment is taken online when you book, through Stripe. Card details are entered on Stripe’s own checkout and never touch this website or its servers, which is deliberate. You get a receipt from Stripe and a booking confirmation from us. If you would rather be invoiced — brokerages with multiple listings usually would — say so on the contact form and that can be arranged instead.',
  },
  {
    id: 'whats-in-total',
    group: 'payment',
    q: 'Is the price on the screen the price I pay?',
    a: 'Yes. The total shown at checkout includes the package, every add-on you selected, any property-size adjustment, travel beyond 30 miles and sales tax, all itemised. There is no separate editing fee, licensing fee or delivery fee, because those are not real things.',
  },
  {
    id: 'refund',
    group: 'payment',
    q: 'What if I cancel?',
    a: 'Cancel more than 24 hours before the shoot and you are refunded in full. Inside 24 hours, half is retained, because the slot can no longer be filled. If the shoot is cancelled from this end for any reason at all, you are refunded in full, immediately.',
  },
  {
    id: 'do-you-drone',
    group: 'drone',
    q: 'Do you offer drone photography?',
    a: 'Yes — both aerial stills and aerial video, flown under a commercial licence. It is included in the Premium package and available as an add-on to any other. Because it is flown on the same visit as the ground work, it costs considerably less than booking a separate operator.',
  },
  {
    id: 'drone-legal',
    group: 'drone',
    q: 'Are there places you cannot fly?',
    a: 'Some. Controlled airspace near an airport needs authorisation, which is usually granted but is not instant — if your property is close to one, mention it when you book so it can be requested in advance. Flights do not go over people, over moving traffic, or beyond visual line of sight. If a property genuinely cannot be flown, you are told before you pay, not after.',
  },
  {
    id: 'weather',
    group: 'drone',
    q: 'What happens if weather affects a drone shoot?',
    a: 'The flight moves, at no cost. Drones do not fly safely in rain or in sustained wind, and grey skies make aerial photographs worthless anyway. In practice the ground work usually goes ahead as planned and the aerial is picked up on the next clear morning. If the whole shoot needs to move, it moves, and nobody pays a reschedule fee for weather — that would be charging you for the sky.',
  },
  {
    id: 'sky-replacement',
    group: 'drone',
    q: 'Do you replace grey skies?',
    a: 'On exterior stills, yes, and it is included rather than an extra. It is done conservatively: the light on the house is adjusted to match the new sky, so it does not end up looking like a house cut out and pasted onto a postcard. Twilight photographs are never replaced — that sky is real, which is the entire point of shooting at that hour.',
  },
  {
    id: 'businesses',
    group: 'payment',
    q: 'Do you work with businesses as well as agents?',
    a: 'Yes. Commercial work is a large part of it — restaurants, gyms, dealerships, hotels, retail and events. That work is quoted per project rather than sold as a package, because a brand film and a listing shoot have nothing in common. Use the commercial page for a quote.',
  },
  {
    id: 'area',
    group: 'booking',
    q: 'Where do you travel?',
    a: 'The first 30 miles are included in every package. Beyond that, travel is added at cost and the booking screen calculates it before you pay rather than putting it on the invoice afterwards. Further afield is usually possible for a full day or a multi-property booking — ask.',
  },
];

export function faqsIn(group: FaqGroup): FaqItem[] {
  return FAQS.filter((f) => f.group === group);
}

/** The short set used on the home page. Chosen, not sliced. */
export const HOME_FAQ_IDS = [
  'how-booking-works',
  'how-long',
  'when-photos',
  'do-you-drone',
  'payments',
  'weather',
];
