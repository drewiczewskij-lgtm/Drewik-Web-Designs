import type { ImageKey } from '@/data/images';
import type { PortfolioCategory } from '@/data/portfolio';

/* ============================================================================
   SERVICES
   ----------------------------------------------------------------------------
   What you sell, described. Prices are NOT here — they come from the package
   named in `packageId`, so there is exactly one place a number can be wrong.
   ========================================================================= */

export interface Service {
  id: string;
  name: string;
  /** Two or three words for the card's small label. */
  kicker: string;
  summary: string;
  /** The long description, on the services page. Two or three sentences. */
  body: string;
  includes: string[];
  image: ImageKey;
  /** Where "starting at" comes from. Must match an id in shared/catalog.mjs. */
  packageId: string;
  /** Add-on id, when the service IS an add-on rather than a package. */
  addonId?: string;
  /** Which portfolio filter this service's work lives under. */
  portfolio: PortfolioCategory;
  /** Roughly how long it takes on site. Shown on the card. */
  duration: string;
  /** When a service cannot be booked online — commercial, custom. */
  quoteOnly?: boolean;
}

export const SERVICES: Service[] = [
  {
    id: 'real-estate-photography',
    name: 'Real Estate Photography',
    kicker: 'Stills',
    summary: 'Professional interior and exterior property photography.',
    body: 'Every room lit and blended so the windows keep their view and the walls keep their colour — the thing phone photographs and single-flash work both get wrong. Verticals are corrected in camera with a tilt-shift rather than stretched in software afterwards, which is why the rooms look the size they actually are.',
    includes: [
      '25–35 finished frames',
      'Interior, exterior and detail coverage',
      'Flambient blending and colour correction',
      'Vertical and horizon correction',
      'Sky replacement where the weather does not cooperate',
      'MLS-sized and full-resolution files',
    ],
    image: 'reLiving',
    packageId: 'photo',
    portfolio: 'real-estate-photo',
    duration: '60–90 minutes on site',
  },
  {
    id: 'real-estate-videography',
    name: 'Real Estate Videography',
    kicker: 'Motion',
    summary: 'Cinematic property walkthrough videos.',
    body: 'A 60–90 second film that moves through the house the way a buyer would walk it, on a gimbal, at a pace that lets each room land. Graded, scored with licensed music, and delivered twice — once horizontal for the portals and once vertical for social.',
    includes: [
      '60–90 second property film',
      'Gimbal-stabilised movement throughout',
      'Licensed music and sound design',
      'Full colour grade',
      '4K delivery, horizontal and vertical',
      'Branded intro and outro if you want one',
    ],
    image: 'filmFrameA',
    packageId: 'photo-video',
    portfolio: 'real-estate-video',
    duration: '2–3 hours on site',
  },
  {
    id: 'drone-photography',
    name: 'Drone Photography',
    kicker: 'Aerial stills',
    summary: 'Professional aerial photography.',
    body: 'Overhead and oblique stills that show the lot, the roofline, the approach and what is next door — everything a ground-level photograph physically cannot. Flown under a commercial licence, inside controlled airspace rules, and never over people.',
    includes: [
      '10–15 finished aerial frames',
      'Overhead plan view and oblique approaches',
      'Boundary and lot-context shots',
      'Roofline and condition coverage',
      'Edited to match the ground set',
      'Flown under a commercial licence',
    ],
    image: 'aerialProperty',
    packageId: 'premium',
    addonId: 'drone-photo',
    portfolio: 'drone',
    duration: '30 minutes on site',
  },
  {
    id: 'drone-videography',
    name: 'Drone Videography',
    kicker: 'Aerial motion',
    summary: 'High-end aerial video footage.',
    body: 'Reveals, orbits and pull-backs, flown slowly and cut into the property film so the aerial is part of the story rather than a clip bolted on the end. Shot in a flat profile and graded to match the ground footage exactly.',
    includes: [
      'Cinematic reveal, orbit and pull-back',
      'Cut into the main property film',
      'Graded to match ground footage',
      '4K, 60fps where the light allows',
      'Standalone clips for social',
      'Flown under a commercial licence',
    ],
    image: 'aerialWater',
    packageId: 'premium',
    addonId: 'drone-video',
    portfolio: 'drone',
    duration: '30 minutes on site',
  },
  {
    id: 'commercial-video',
    name: 'Commercial Video',
    kicker: 'Brand',
    summary: 'Commercial videos and promotional content for small businesses.',
    body: 'Brand films, promotional spots and social campaigns for restaurants, gyms, dealerships, hotels and local businesses that need to look like they belong in this decade. Scoped properly first: a call, a treatment, a shot list, then a production day.',
    includes: [
      'Discovery call and written treatment',
      'Scripting and shot list',
      'Half or full production day',
      'Interviews, b-roll and aerial as needed',
      'Edit, grade, sound mix and captions',
      'Cutdowns for every platform you run',
    ],
    image: 'commRestaurant',
    packageId: 'commercial',
    portfolio: 'commercial',
    duration: 'Half or full day',
    quoteOnly: true,
  },
  {
    id: 'custom-projects',
    name: 'Custom Projects',
    kicker: 'Anything else',
    summary: 'Custom photo and video production, built around what you need.',
    body: 'Developments, construction progress sets, short-term rental listings, headshots for an agency roster, event coverage, a campaign that does not fit a package. If it is photography or film and it is within driving distance, describe it and you will get an honest answer about whether it is a good fit.',
    includes: [
      'Scoped to the brief, not to a package',
      'Multi-property and portfolio rates',
      'Construction and development progress sets',
      'Short-term rental and hospitality',
      'Team and agency headshots',
      'Event and campaign coverage',
    ],
    image: 'gearStill',
    packageId: 'commercial',
    portfolio: 'lifestyle',
    duration: 'By arrangement',
    quoteOnly: true,
  },
];

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

/* ---------------------------------------------------------------------------
   COMMERCIAL — the kinds of business this work is for.
   ------------------------------------------------------------------------ */

export const COMMERCIAL_SECTORS = [
  { id: 'restaurants', label: 'Restaurants & bars', body: 'Food, room and service, shot during a real dinner rather than staged at 3pm.', image: 'commRestaurant' as ImageKey },
  { id: 'gyms', label: 'Gyms & studios', body: 'Class energy, equipment and coaching, cut into spots that fill a timetable.', image: 'commGym' as ImageKey },
  { id: 'dealerships', label: 'Car dealerships', body: 'Walkarounds, inventory stills and lot aerials, turned around overnight.', image: 'commAuto' as ImageKey },
  { id: 'hotels', label: 'Hotels & rentals', body: 'Rooms, amenities and grounds, plus the aerial that sells the location.', image: 'commHotel' as ImageKey },
  { id: 'retail', label: 'Local retail', body: 'Store, stock and staff — the images a small business never gets around to.', image: 'commRetail' as ImageKey },
  { id: 'events', label: 'Events', body: 'Openings, launches and conferences, delivered the next morning.', image: 'commEvent' as ImageKey },
  { id: 'brokerages', label: 'Real estate brokerages', body: 'Roster headshots, office films and a consistent look across every agent.', image: 'lifestyleTerrace' as ImageKey },
  { id: 'social', label: 'Social advertising', body: 'Vertical-first campaigns built for paid placement, in batches.', image: 'filmFrameA' as ImageKey },
];

/** What a commercial project actually costs to run. Ranges, honestly stated. */
export const COMMERCIAL_SCOPES = [
  {
    id: 'social-batch',
    name: 'Social batch',
    range: 'From $650',
    body: 'A half day on site, cut into six to ten vertical clips and a set of stills. Built for businesses that need to post consistently and have run out of things to post.',
    points: ['Half production day', '6–10 vertical clips', '20+ stills', 'Captions and cutdowns'],
  },
  {
    id: 'brand-film',
    name: 'Brand film',
    range: 'From $1,800',
    body: 'A full production day, interviews and b-roll, cut to a 90-second film with a 30-second and a 15-second version underneath it. The piece that sits on your homepage for three years.',
    points: ['Treatment and shot list', 'Full production day', '90s film + 30s + 15s', 'Grade, mix and captions'],
  },
  {
    id: 'campaign',
    name: 'Ongoing campaign',
    range: 'Monthly retainer',
    body: 'A recurring shoot day each month with a standing deliverable schedule. Cheaper per asset than one-off work, and the look stays consistent because it is the same person shooting it.',
    points: ['Monthly shoot day', 'Agreed deliverables', 'Priority scheduling', 'Consistent grade'],
  },
];
