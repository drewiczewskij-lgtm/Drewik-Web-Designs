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
    src: '',
    alt: 'A low modern house photographed at blue hour, its glazed living wall lit warm against a deep indigo sky.',
    tone: 'twilight',
    scene: 'exterior-twilight',
    focus: '50% 58%',
  },
  homeAerial: {
    src: '',
    alt: 'An aerial photograph looking straight down on a property, showing the roofline, pool and wooded lot.',
    tone: 'aerial',
    scene: 'aerial-property',
  },
  homeInterior: {
    src: '',
    alt: 'A living room lit for photography, warm lamplight balanced against the blue of the windows.',
    tone: 'interior',
    scene: 'interior-living',
  },
  homeFilm: {
    src: '',
    alt: 'A frame from a property film: the house in soft focus behind an anamorphic flare.',
    tone: 'twilight',
    scene: 'video-frame',
  },

  /* — Real estate: stills — */
  reExteriorTwilight: {
    src: '',
    alt: 'Twilight exterior of a single-storey house, path lights on and the interior glowing through the glass.',
    tone: 'twilight',
    scene: 'exterior-twilight',
  },
  reExteriorDay: {
    src: '',
    alt: 'A traditional two-storey home photographed in clear afternoon light from the front lawn.',
    tone: 'daylight',
    scene: 'exterior-day',
  },
  reExteriorModern: {
    src: '',
    alt: 'A contemporary house of two offset volumes, the upper floor cantilevered over the lower.',
    tone: 'twilight',
    scene: 'exterior-modern',
  },
  reExteriorNight: {
    src: '',
    alt: 'The same house after dark, windows lit across the facade and the entry door open to the light.',
    tone: 'night',
    scene: 'exterior-night',
  },
  reLiving: {
    src: '',
    alt: 'A living room with a low sofa, floor lamp and framed art, windows holding evening blue.',
    tone: 'interior',
    scene: 'interior-living',
  },
  reKitchen: {
    src: '',
    alt: 'A kitchen island under three pendant lights, with a run of cabinetry and lit splashback behind.',
    tone: 'interior',
    scene: 'interior-kitchen',
  },
  reBedroom: {
    src: '',
    alt: 'A primary bedroom with an upholstered headboard, bedside lamps lit and the window cool behind.',
    tone: 'interior',
    scene: 'interior-bedroom',
  },
  reBath: {
    src: '',
    alt: 'A bathroom with a freestanding tub, large-format tile and a backlit mirror.',
    tone: 'interior',
    scene: 'interior-bath',
  },
  reDining: {
    src: '',
    alt: 'A dining room with a timber table, four chairs and three pendants above it.',
    tone: 'interior',
    scene: 'interior-dining',
  },
  reStair: {
    src: '',
    alt: 'A timber staircase with a fine steel balustrade, raking light across the treads.',
    tone: 'interior',
    scene: 'staircase',
  },
  reDetail: {
    src: '',
    alt: 'A close detail of oak joinery with a bronze reveal, lit from the side.',
    tone: 'interior',
    scene: 'detail',
  },
  rePool: {
    src: '',
    alt: 'A swimming pool lit from within at dusk, treeline dark against the last of the sky.',
    tone: 'water',
    scene: 'pool',
  },
  reTerrace: {
    src: '',
    alt: 'A covered terrace with downlights and a lit fire table, looking out to the treeline.',
    tone: 'twilight',
    scene: 'terrace',
  },
  reWalkthrough: {
    src: '',
    alt: 'The opening frame of a walkthrough: a hallway in one-point perspective toward a lit room.',
    tone: 'interior',
    scene: 'walkthrough',
  },

  /* — Aerial — */
  aerialProperty: {
    src: '',
    alt: 'A property from directly overhead: roof, driveway, pool and the shape of the whole lot.',
    tone: 'aerial',
    scene: 'aerial-property',
  },
  aerialNeighborhood: {
    src: '',
    alt: 'A neighbourhood at dusk from a few hundred feet, streetlights on and windows lit.',
    tone: 'aerial',
    scene: 'aerial-neighborhood',
  },
  aerialLand: {
    src: '',
    alt: 'Aerial view of acreage at golden hour, field boundaries and a creek running through.',
    tone: 'aerial',
    scene: 'aerial-land',
  },
  aerialWater: {
    src: '',
    alt: 'A waterfront shoreline from the air, a private dock reaching into lit water.',
    tone: 'water',
    scene: 'aerial-water',
  },
  aerialHighway: {
    src: '',
    alt: 'A commercial frontage from the air at dusk, traffic drawing light trails along the road.',
    tone: 'aerial',
    scene: 'aerial-highway',
  },
  droneInFlight: {
    src: '',
    alt: 'The drone in flight against a blue-hour sky, navigation lights showing red and green.',
    tone: 'night',
    scene: 'drone-flight',
  },

  /* — Video — */
  filmFrameA: {
    src: '',
    alt: 'A graded frame from a property film, letterboxed, with a horizontal flare across the glass.',
    tone: 'twilight',
    scene: 'video-frame',
  },
  filmFrameB: {
    src: '',
    alt: 'A second film frame: the hallway, moving toward a lit room at the end.',
    tone: 'interior',
    scene: 'walkthrough',
  },

  /* — Commercial — */
  commRestaurant: {
    src: '',
    alt: 'A restaurant bar at service, bottles lit on the back shelves and two guests in silhouette.',
    tone: 'interior',
    scene: 'commercial-restaurant',
  },
  commGym: {
    src: '',
    alt: 'A gym floor lit in cool blue, weight rack and rig behind a loaded barbell.',
    tone: 'neon',
    scene: 'commercial-gym',
  },
  commAuto: {
    src: '',
    alt: 'A car on a polished showroom floor under a run of overhead strip lights.',
    tone: 'studio',
    scene: 'commercial-auto',
  },
  commHotel: {
    src: '',
    alt: 'A hotel at dusk, windows lit across the tower and the portico glowing at the base.',
    tone: 'twilight',
    scene: 'commercial-hotel',
  },
  commRetail: {
    src: '',
    alt: 'A retail interior with rails of stock either side and track lighting down the centre.',
    tone: 'interior',
    scene: 'commercial-retail',
  },
  commEvent: {
    src: '',
    alt: 'An event at night: beams from the lighting rig over a stage and a crowd below.',
    tone: 'neon',
    scene: 'commercial-event',
  },

  /* — Lifestyle — */
  lifestyleTerrace: {
    src: '',
    alt: 'Two people on a terrace at dusk, back-lit, the house glowing behind them.',
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
    src: '',
    alt: 'A full-frame camera body with a fast prime lens, lit from two sides against a dark background.',
    tone: 'studio',
    scene: 'gear',
  },
} as const satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof IMAGES;
export const IMAGE_KEYS = Object.keys(IMAGES) as ImageKey[];
