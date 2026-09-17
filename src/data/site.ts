/**
 * Show only KM Productions' own photographs and films.
 *
 * Turning this off brings back the drawn plates and stock frames that stand in
 * for work not yet supplied — useful while building, wrong in front of clients.
 * See `isOwnWork` in `data/images.ts` for what counts.
 */
export const OWN_WORK_ONLY = true;

/* ============================================================================
   KM PRODUCTIONS — BUSINESS DETAILS
   ----------------------------------------------------------------------------
   Name, contact, service area, social links, the founder. Change something
   here and it changes everywhere it appears: header, footer, contact page,
   booking confirmations, the search-engine schema, the plain-text fallback.

   Anything marked PLACEHOLDER is a sensible stand-in, not a fact. Replace it
   before the site goes live.
   ========================================================================= */

export const BRAND = {
  name: 'KM Productions',
  /** Used where the full name will not fit — the favicon, the loader mark. */
  initials: 'KM',
  tagline: 'Make your property stand out.',
  description:
    'Real estate photography, cinematic video, aerial coverage and commercial production.',
  /** Set this to your live address before launch; it builds canonical + OG URLs. */
  url: 'https://kmproductions.com', // PLACEHOLDER
  founded: 2021, // PLACEHOLDER — the year you started shooting.
} as const;

export const CONTACT = {
  phone: '(662) 322-8022',
  /** E.164, for the tel: link. Must match `phone`. */
  phoneHref: '+16623228022',
  email: 'bryan.miller@renasant.com',
  /** Where you work. Shown on contact, FAQ and in the local-business schema. */
  serviceArea: 'North Mississippi & the Memphis metro', // PLACEHOLDER
  serviceAreaDetail:
    'Tupelo, Oxford, Starkville, Columbus, Southaven and the surrounding counties. Travel beyond 30 miles is billed at cost — the booking screen works it out before you pay.', // PLACEHOLDER
  city: 'Tupelo', // PLACEHOLDER
  region: 'MS', // PLACEHOLDER
  /** Leave the street blank if you work from home — the schema handles it. */
  street: '',
  postalCode: '', // PLACEHOLDER
  country: 'US',
  /** Roughly, for the map dot and the schema. Tupelo, MS. */
  geo: { lat: 34.2576, lng: -88.7034 },
  responseTime: 'within one business day',
} as const;

/** Social accounts. Delete a line and the icon disappears from the footer. */
export const SOCIALS = [
  { id: 'instagram', label: 'Instagram', handle: '@kmproductions', url: 'https://instagram.com/' }, // PLACEHOLDER
  { id: 'youtube', label: 'YouTube', handle: 'KM Productions', url: 'https://youtube.com/' }, // PLACEHOLDER
  { id: 'facebook', label: 'Facebook', handle: 'KM Productions', url: 'https://facebook.com/' }, // PLACEHOLDER
  { id: 'vimeo', label: 'Vimeo', handle: 'kmproductions', url: 'https://vimeo.com/' }, // PLACEHOLDER
] as const;

/* ---------------------------------------------------------------------------
   THE FOUNDER
   The portrait is a drawn plate until you drop a real photograph in. See
   `founderPortrait` in `src/data/images.ts` — it is one line to change.
   ------------------------------------------------------------------------ */

export const FOUNDER = {
  name: 'Bryan Miller',
  role: 'Founder & Director of Photography',
  /** Kept short on purpose. Long bios do not get read. */
  bio: [
    'KM Productions started the way most small production companies do: one camera, one person who could not stop looking at how light fell across a room, and a conviction that most property photography was settling for far less than the property deserved.',
    'I shoot every job myself. That is a deliberate limit — it means the person who walks your listing is the person who lights it, flies it, edits it and answers the phone afterwards. Nothing gets handed to a subcontractor and nothing comes back looking like it was shot by someone who has never seen the house.',
    'I am a licensed drone operator and I shoot aerial video as well as aerial stills, so the exterior, the lot, the roofline and the approach are all covered on the same visit. The kit is professional throughout — full-frame bodies, tilt-shift and wide primes for interiors, off-camera lighting, a gimbal for the walkthroughs and a drone rated for commercial work. Backups of everything, because a reshoot costs you a week.',
  ],
  /** Shown as a short list beside the portrait. Facts about the kit, not claims. */
  capabilities: [
    'Aerial photography and aerial video',
    'Licensed for commercial drone operation',
    'Full-frame bodies, tilt-shift and wide primes',
    'Off-camera lighting and flambient blending',
    'Gimbal-stabilised cinematic walkthroughs',
    'Colour grading and sound on every film',
  ],
  /** One line, in his own voice, used under the portrait. */
  quote:
    'A house sells on the first three photographs. I would rather spend an extra hour getting those right than deliver forty that are merely fine.',
} as const;

/* ---------------------------------------------------------------------------
   NAVIGATION
   ------------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  to: string;
  /** Shown in the mobile menu under the label. */
  note?: string;
}

export const NAV: NavItem[] = [
  { label: 'Real Estate', to: '/real-estate', note: 'Photography, film and aerial for listings' },
  { label: 'Services', to: '/services', note: 'Everything we shoot, and what it includes' },
  { label: 'Portfolio', to: '/portfolio', note: 'Selected work across every category' },
  { label: 'Commercial', to: '/commercial', note: 'Brand films for local business' },
  { label: 'Pricing', to: '/pricing', note: 'Packages, add-ons and what they cost' },
  { label: 'About', to: '/about', note: 'Who shoots your job' },
  { label: 'FAQ', to: '/faq', note: 'How booking, delivery and weather work' },
  { label: 'Contact', to: '/contact', note: 'Phone, email and the enquiry form' },
];

/** The footer's second column. Kept separate — it is not the same list. */
export const FOOTER_LINKS = [
  { label: 'Book a shoot', to: '/book' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Commercial quote', to: '/commercial' },
  { label: 'Frequently asked', to: '/faq' },
  { label: 'Contact', to: '/contact' },
];

export const LEGAL_LINKS = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
];

/* ---------------------------------------------------------------------------
   THE NUMBERS
   Every figure the site states out loud. These are DELIVERY PROMISES and
   OPERATING FACTS — things you control — not invented achievements. Do not
   put a client count or an awards tally here unless it is true.
   ------------------------------------------------------------------------ */

export const STATS = [
  {
    value: 24,
    suffix: 'h',
    label: 'Standard turnaround',
    note: 'Photography back the next business day. Film within 72 hours.',
  },
  {
    value: 35,
    suffix: '',
    label: 'Images per listing',
    note: 'Up to thirty-five finished frames on a standard property.',
  },
  {
    value: 4,
    suffix: 'K',
    label: 'Video resolution',
    note: 'Every film delivered in 4K, graded, with licensed music.',
  },
  {
    value: 100,
    suffix: '%',
    label: 'Shot by the founder',
    note: 'One photographer, start to finish. Never subcontracted.',
  },
] as const;

/** Why a listing agent should pick you. Written as promises you can keep. */
export const DIFFERENTIATORS = [
  {
    title: 'One person, every step',
    body: 'The photographer who walks your property is the one who lights it, flies the drone, cuts the film and picks up the phone. Nothing is handed off.',
  },
  {
    title: 'Next-day photography',
    body: 'Shoot in the morning, gallery in your inbox by the next business day. Listings do not wait, and neither do we.',
  },
  {
    title: 'Ground and air on one visit',
    body: 'Licensed for commercial drone work, so stills, film and aerial are covered in a single appointment instead of three.',
  },
  {
    title: 'Priced before you book',
    body: 'The total is on the screen before you enter a card — package, add-ons, property size, travel and tax. No invoice surprises.',
  },
  {
    title: 'Built for where listings live',
    body: 'MLS-sized and full-resolution files, horizontal film for the portals and a vertical cut for Reels. Delivered ready to post.',
  },
  {
    title: 'Weather handled properly',
    body: 'If conditions will not do the property justice, we move the date at no cost. A grey sky is not worth a reshoot fee.',
  },
] as const;

/* ---------------------------------------------------------------------------
   THE PROCESS — shown on the home and real estate pages.
   ------------------------------------------------------------------------ */

export const PROCESS = [
  {
    step: 'Book',
    body: 'Pick a package, add what you need, choose a date and time. The price settles as you go and you pay in the same pass.',
  },
  {
    step: 'Prepare',
    body: 'You get a short prep note — lights on, blinds up, cars moved. Twenty minutes of work that changes every photograph.',
  },
  {
    step: 'Shoot',
    body: 'Ninety minutes to half a day depending on the package. You do not need to be there, as long as I can get in.',
  },
  {
    step: 'Deliver',
    body: 'An online gallery with MLS and full-resolution files, the film in 4K, and a vertical cut if your package includes one.',
  },
] as const;
