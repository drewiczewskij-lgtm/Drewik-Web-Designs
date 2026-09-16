import type { SceneKind } from '@/lib/scenes';

/* ============================================================================
   THE IMAGE LIBRARY — THE ONLY PLACE PICTURES ARE DEFINED
   ----------------------------------------------------------------------------
   ► HOW TO PUT YOUR OWN WORK ON THIS SITE

   Every frame on the site resolves through this file. To replace one, set its
   `src`. That is the whole job — no component needs touching.

       heroExterior: {
         src: '/work/hero-exterior.jpg',   ←  add this line
         alt: '...',
         ...
       }

   Three kinds of `src` work:

     '/work/twilight-01.jpg'      a file in `public/work/` — the simplest option
     'https://cdn.example/a.jpg'  any absolute URL
     'photo-1600596542815-…'      an Unsplash photo id, resized through their CDN

   ► WHAT HAPPENS UNTIL THEN

   `src` is empty on every entry below, and that is deliberate. An empty source
   means the frame draws its plate from `src/lib/scenes.ts` instead — a composed,
   blue-hour illustration of that exact subject. Nothing is ever requested, so
   nothing can ever 404, and the site looks finished offline and on day one.

   Replace them a few at a time. A mixed page of your photographs and drawn
   plates still holds together, because the plates were art-directed to match.

   ► THE OTHER FIELDS

   A `► filename.jpg` comment above an entry is the name that
   `npm run link:work` already knows how to match. Save your file with that
   name in `public/work/`, run the command, and the entry fills itself in.

     alt    real alternative text, written for someone who cannot see the image.
            REWRITE THIS when you swap the picture — it must describe YOUR photo.
     scene  which plate stands in until then
     tone   the wash held behind the frame while a real photo decodes
     focus  object-position, so crops stay composed at every aspect ratio
   ========================================================================= */

export type Tone = 'twilight' | 'interior' | 'aerial' | 'night' | 'water' | 'neon' | 'studio' | 'daylight';

export interface ImageAsset {
  /** Empty means "draw the plate". See the note above. */
  src: string;
  alt: string;
  tone: Tone;
  focus?: string;
  scene: SceneKind;
}

/** Prefixed to bare Unsplash-style ids. Swap for any CDN taking w/q parameters. */
export const IMAGE_BASE = 'https://images.unsplash.com/';

/** Widths generated for `srcset`. Few on purpose, to limit cache churn. */
export const IMAGE_WIDTHS = [640, 960, 1280, 1800, 2400] as const;

/** True when this entry has no photograph yet and should draw its plate. */
export function isDrawn(src: string): boolean {
  return src.trim().length === 0;
}

/** One source URL at a given width. Absolute and rooted paths pass through. */
export function imageUrl(src: string, width: number, quality = 72): string {
  if (isDrawn(src)) return '';
  if (/^https?:\/\//.test(src) || src.startsWith('/')) return src;
  const params = new URLSearchParams({
    auto: 'format',
    fit: 'crop',
    w: String(width),
    q: String(quality),
  });
  return `${IMAGE_BASE}${src}?${params.toString()}`;
}

export function imageSrcSet(src: string, quality = 72): string | undefined {
  if (isDrawn(src)) return undefined;
  if (/^https?:\/\//.test(src) || src.startsWith('/')) return undefined;
  return IMAGE_WIDTHS.map((w) => `${imageUrl(src, w, quality)} ${w}w`).join(', ');
}

/* ---------------------------------------------------------------------------
   THE LIBRARY
   ------------------------------------------------------------------------ */

export const IMAGES = {
  /* — Hero and home — */
  heroTwilight: {
    src: 'photo-1600596542815-ffad4c1539a9',
    alt: 'A low modern house with a pale facade and large windows, photographed from the driveway in soft evening light.',
    tone: 'twilight',
    scene: 'exterior-twilight',
    focus: '50% 58%',
  },
  homeAerial: {
    src: 'photo-1512917774080-9991f1c4c750',
    alt: 'A large suburban house with a landscaped lawn and driveway, seen from a raised angle.',
    tone: 'aerial',
    scene: 'aerial-property',
  },
  homeInterior: {
    src: 'photo-1600607687939-ce8a6c25118c',
    alt: 'A bright living room with a sectional sofa, timber floor and a full-height window.',
    tone: 'interior',
    scene: 'interior-living',
  },
  homeFilm: {
    src: 'photo-1523217582562-09d0def993a6',
    alt: 'A contemporary house lit from within at dusk, its interiors visible through the glazing.',
    tone: 'twilight',
    scene: 'video-frame',
  },

  /* — Real estate: stills — */
  reExteriorTwilight: {
    src: 'photo-1523217582562-09d0def993a6',
    alt: 'A house photographed at dusk with the interior lights on and the sky still holding colour.',
    tone: 'twilight',
    scene: 'exterior-twilight',
  },
  reExteriorDay: {
    // ► front-elevation.jpg
    src: 'photo-1568605114967-8130f3a36994',
    alt: 'A two-storey house with a pitched roof and a lawn, photographed in clear daylight from the front.',
    tone: 'daylight',
    scene: 'exterior-day',
  },
  reExteriorModern: {
    src: 'photo-1600585154340-be6161a56a0c',
    alt: 'A contemporary house of stacked rectangular volumes with wide glazing.',
    tone: 'twilight',
    scene: 'exterior-modern',
  },
  reExteriorNight: {
    src: 'photo-1512918728675-ed5a9ecdebfd',
    alt: 'A modern house after dark, windows lit across the elevation.',
    tone: 'night',
    scene: 'exterior-night',
  },
  reLiving: {
    src: 'photo-1600607687920-4e2a09cf159d',
    alt: 'A living room with a pale sofa, timber flooring and tall windows.',
    tone: 'interior',
    scene: 'interior-living',
  },
  reKitchen: {
    src: 'photo-1600489000022-c2086d79f9d4',
    alt: 'A kitchen with a stone island, pendant lighting and full-height cabinetry.',
    tone: 'interior',
    scene: 'interior-kitchen',
  },
  reBedroom: {
    src: 'photo-1600566753086-00f18fb6b3ea',
    alt: 'A bedroom with an upholstered headboard, bedside lamps and a window to one side.',
    tone: 'interior',
    scene: 'interior-bedroom',
  },
  reBath: {
    src: 'photo-1600210492486-724fe5c67fb0',
    alt: 'A bathroom with a freestanding tub, stone tiling and a large mirror.',
    tone: 'interior',
    scene: 'interior-bath',
  },
  reDining: {
    // ► dining-room.jpg
    src: 'photo-1600121848594-d8644e57abab',
    alt: 'A dining room with a long table, upholstered chairs and pendant lighting above.',
    tone: 'interior',
    scene: 'interior-dining',
  },
  reStair: {
    src: 'photo-1600607688969-a5bfcd646154',
    alt: 'A staircase with timber treads and a slim metal balustrade.',
    tone: 'interior',
    scene: 'staircase',
  },
  entryStair: {
    // ► entry-stair.jpg
    src: 'photo-1600566753190-17f0baa2a6c3',
    alt: 'A double-height entry hall with a staircase rising to a landing above.',
    tone: 'interior',
    scene: 'foyer',
  },
  reDetail: {
    src: 'photo-1600607687644-c7171b42498b',
    alt: 'A close detail of timber joinery and metal hardware, lit from the side.',
    tone: 'interior',
    scene: 'detail',
  },
  rePool: {
    // ► pool-terrace.jpg
    src: 'photo-1571003123894-1f0594d2b5d9',
    alt: 'A rectangular swimming pool beside a house, with paved coping and a lawn beyond.',
    tone: 'water',
    scene: 'pool',
  },
  reTerrace: {
    src: 'photo-1600585154526-990dced4db0d',
    alt: 'A covered outdoor terrace with seating, looking out onto a garden.',
    tone: 'twilight',
    scene: 'terrace',
  },
  reWalkthrough: {
    src: 'photo-1600585154084-4e5fe7c39198',
    alt: 'A hallway looking through to a bright room at the end.',
    tone: 'interior',
    scene: 'walkthrough',
  },

  /* — Aerial — */
  aerialProperty: {
    // ► aerial-farmhouse.jpg
    src: 'photo-1592595896551-12b371d546d5',
    alt: 'A house and its grounds photographed from directly above, showing the roof, drive and garden.',
    tone: 'aerial',
    scene: 'aerial-property',
  },
  aerialNeighborhood: {
    src: 'photo-1449844908441-8829872d2607',
    alt: 'A residential neighbourhood seen from the air, with streets, rooftops and mature trees.',
    tone: 'aerial',
    scene: 'aerial-neighborhood',
  },
  aerialLand: {
    src: 'photo-1500382017468-9049fed747ef',
    alt: 'Open farmland and fields photographed from above in low golden light.',
    tone: 'aerial',
    scene: 'aerial-land',
  },
  aerialWater: {
    src: 'photo-1507525428034-b723cf961d3e',
    alt: 'A shoreline meeting clear water, photographed from above.',
    tone: 'water',
    scene: 'aerial-water',
  },
  aerialHighway: {
    src: 'photo-1502920917128-1aa500764cbd',
    alt: 'A road running through open country, photographed from the air.',
    tone: 'aerial',
    scene: 'aerial-highway',
  },
  droneInFlight: {
    src: 'photo-1473968512647-3e447244af8f',
    alt: 'A camera drone in flight against an open sky.',
    tone: 'night',
    scene: 'drone-flight',
  },

  /* — Video — */
  filmFrameA: {
    src: 'photo-1600047509807-ba8f99d2cdde',
    alt: 'A wide interior view of a living space, framed as a film still.',
    tone: 'twilight',
    scene: 'video-frame',
  },
  filmFrameB: {
    src: 'photo-1600607687644-c7171b42498b',
    alt: 'An interior detail shot, framed as a film still.',
    tone: 'interior',
    scene: 'walkthrough',
  },

  /* — Commercial — */
  commRestaurant: {
    src: 'photo-1517248135467-4c7edcad34c4',
    alt: 'A restaurant interior during service, with warm lighting over the tables.',
    tone: 'interior',
    scene: 'commercial-restaurant',
  },
  commGym: {
    src: 'photo-1534438327276-14e5300c3a48',
    alt: 'A gym floor with weight equipment and racks under overhead lighting.',
    tone: 'neon',
    scene: 'commercial-gym',
  },
  commAuto: {
    src: 'photo-1552519507-da3b142c6e3d',
    alt: 'A car photographed in three-quarter view under controlled lighting.',
    tone: 'studio',
    scene: 'commercial-auto',
  },
  commHotel: {
    src: 'photo-1566073771259-6a8506099945',
    alt: 'A hotel exterior at dusk with lit windows and a lit entrance.',
    tone: 'twilight',
    scene: 'commercial-hotel',
  },
  commRetail: {
    src: 'photo-1441986300917-64674bd600d8',
    alt: 'A retail interior with rails of stock and track lighting.',
    tone: 'interior',
    scene: 'commercial-retail',
  },
  commEvent: {
    src: 'photo-1492684223066-81342ee5ff30',
    alt: 'An event at night with stage lighting over a crowd.',
    tone: 'neon',
    scene: 'commercial-event',
  },

  /* — Lifestyle — */
  lifestyleTerrace: {
    src: 'photo-1600585154340-be6161a56a0c',
    alt: 'An outdoor terrace in evening light, set up for entertaining.',
    tone: 'twilight',
    scene: 'lifestyle',
  },

  /* — The company — */
  founderPortrait: {
    // ► DROP THE FOUNDER'S PHOTOGRAPH HERE. Put the file in `public/work/`
    //   and write the path, e.g. '/work/founder.jpg'. Then rewrite `alt` below
    //   to describe the actual photograph.
    src: '',
    alt: 'Portrait of the founder of KM Productions. A drawn stand-in until the photograph is added.',
    tone: 'studio',
    scene: 'portrait',
    focus: '50% 32%',
  },
  gearStill: {
    src: 'photo-1502920917128-1aa500764cbd',
    alt: 'A professional camera body with a prime lens, photographed against a dark background.',
    tone: 'studio',
    scene: 'gear',
  },
} as const satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof IMAGES;
export const IMAGE_KEYS = Object.keys(IMAGES) as ImageKey[];
