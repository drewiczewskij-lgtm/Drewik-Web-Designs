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

/**
 * THE HOUSE RULE: only KM Productions' own footage is ever shown.
 *
 * A frame counts as the owner's work when its file lives under `/work/` — that
 * is, it came out of `masters/` through `npm run optimise:work` — or when a
 * photograph has been dropped onto the photo manager in this browser.
 *
 * Everything else (a stock photo id, an empty `src` that would draw a plate)
 * is not their work, and with `OWN_WORK_ONLY` set the site shows nothing there
 * rather than standing something in. The portfolio drops those pieces entirely;
 * a decorative frame elsewhere becomes a quiet empty surface until a real
 * photograph arrives. Nothing is invented, and nothing is passed off as theirs.
 */
export function isOwnWork(src: string, dropped = false): boolean {
  return dropped || src.trim().startsWith('/work/');
}

/** True when this entry has no photograph yet and should draw its plate. */
export function isDrawn(src: string): boolean {
  return src.trim().length === 0;
}

/**
 * A file written by `npm run optimise:work` — `/work/r/<name>-<width>.jpg`.
 * The width lives in the filename, so the set is derivable without a manifest.
 */
const RESPONSIVE = /^(\/work\/r\/.+)-(\d+)(\.[a-z]+)$/;

/**
 * The one-file build has no folder to read photographs from, so
 * `scripts/bundle-single.mjs` writes them into this global as data URIs before
 * the app runs. Empty in every other build, where the files are really there.
 */
function isInlining(): boolean {
  return Boolean((globalThis as { __KM_INLINE__?: Record<string, string> }).__KM_INLINE__);
}

function inlined(path: string): string {
  const map = (globalThis as { __KM_INLINE__?: Record<string, string> }).__KM_INLINE__;
  return map?.[path] ?? path;
}

/** One source URL at a given width. Absolute and rooted paths pass through. */
export function imageUrl(src: string, width: number, quality = 72): string {
  if (isDrawn(src)) return '';
  const own = RESPONSIVE.exec(src);
  if (own) {
    // Snap to a width the script actually wrote; anything else would 404.
    const ceiling = Number(own[2]);
    const available = IMAGE_WIDTHS.filter((w) => w <= ceiling);
    const step = available.reduce((best, w) => (Math.abs(w - width) < Math.abs(best - width) ? w : best), ceiling);
    return inlined(`${own[1]}-${step}${own[3]}`);
  }
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
  const own = RESPONSIVE.exec(src);
  if (own) {
    // `src` points at the largest file written, so anything wider was never
    // made — offering it would 404. The one-file build leaves out wider sizes
    // again, so drop those too rather than hand the browser a dead data URI.
    const ceiling = Number(own[2]);
    const steps = IMAGE_WIDTHS.filter((w) => w <= ceiling)
      .map((w) => ({ w, url: inlined(`${own[1]}-${w}${own[3]}`) }))
      .filter(({ w, url }) => url !== `${own[1]}-${w}${own[3]}` || !isInlining());
    return steps.length > 0 ? steps.map(({ w, url }) => `${url} ${w}w`).join(', ') : undefined;
  }
  if (/^https?:\/\//.test(src) || src.startsWith('/')) return undefined;
  return IMAGE_WIDTHS.map((w) => `${imageUrl(src, w, quality)} ${w}w`).join(', ');
}

/* ---------------------------------------------------------------------------
   THE LIBRARY
   ------------------------------------------------------------------------ */

export const IMAGES = {
  /* — Hero and home — */
  heroTwilight: {
    src: '/work/r/aerial-estate-drive-2400.jpg',
    alt: 'A white brick house with a steep shingled roof photographed from the air in daylight, showing the roof, a brick entrance path and courtyard, a concrete drive curving in from the left, and mature trees on every side with a neighbouring roof beyond.',
    tone: 'aerial',
    scene: 'exterior-twilight',
    focus: '50% 55%',
  },
  homeAerial: {
    src: '/work/r/modern-pool-aerial-2400.jpg',
    alt: 'A white modern farmhouse photographed from the air, with a covered porch opening onto a pale stone terrace, a rectangular pool and spa, a putting green to one side and a sport court to the other.',
    tone: 'aerial',
    scene: 'aerial-property',
    focus: '50% 52%',
  },
  homeInterior: {
    src: '/work/r/piano-room-2400.jpg',
    alt: 'A bright reception room with white panelled walls and tall multi-pane windows on two sides, a grand piano with its lid raised at the far end, a round low table at the centre of a wide oak floor, and a chrome chandelier overhead.',
    tone: 'interior',
    scene: 'interior-living',
    focus: '50% 50%',
  },
  homeFilm: {
    src: '',
    alt: 'A frame from a property film, held wide across a lit room.',
    tone: 'interior',
    scene: 'video-frame',
    focus: '50% 48%',
  },

  /* — Real estate: stills — */
  reExteriorTwilight: {
    src: '/work/r/front-elevation-960.jpg',
    alt: 'A white painted brick house with a steep shingled roof and round dormer windows, seen at an angle from a broad concrete forecourt, with brick steps rising between clipped hedges to an arched front door and magnolias either side.',
    tone: 'daylight',
    scene: 'exterior-twilight',
    focus: '50% 48%',
  },
  reExteriorDay: {
    // ► front-elevation.jpg
    src: '',
    alt: 'The front of a house in daylight, square to the door.',
    tone: 'daylight',
    scene: 'exterior-day',
    focus: '50% 48%',
  },
  reExteriorModern: {
    src: '/work/r/contemporary-exterior-960.jpg',
    alt: 'A contemporary white house with black framed windows, a standing-seam porch roof and a timber front door, photographed from a raised angle across a wide concrete drive and clipped lawn, with pines behind.',
    tone: 'daylight',
    scene: 'exterior-modern',
    focus: '50% 52%',
  },
  reExteriorNight: {
    src: 'photo-1512918728675-ed5a9ecdebfd',
    alt: 'A modern house after dark, windows lit across the elevation.',
    tone: 'night',
    scene: 'exterior-night',
  },
  reLiving: {
    src: '/work/r/living-room-fireplace-2400.jpg',
    alt: 'A double-height living room with a pale limestone chimney breast rising the full height of the wall, a lit fire below a timber mantel, cream sectional sofas and tan leather armchairs on an oak floor, and a railed landing overlooking from above.',
    tone: 'interior',
    scene: 'interior-living',
    focus: '50% 48%',
  },
  reKitchen: {
    src: '/work/r/kitchen-2400.jpg',
    alt: 'A kitchen with two islands, one in white oak with a marble top and leather stools, white cabinetry and a gold mosaic backsplash behind the range, conical pendants overhead and a glazed opening through to the pool.',
    tone: 'interior',
    scene: 'interior-kitchen',
    focus: '50% 50%',
  },
  reBedroom: {
    src: '/work/r/primary-bedroom-2400.jpg',
    alt: 'A large bedroom with a pale upholstered bed centred between two cane-fronted chests, shuttered windows either side, four square wood reliefs on the wall above, a leather bench at the foot and a patterned rug across a wide oak floor.',
    tone: 'interior',
    scene: 'interior-bedroom',
    focus: '50% 50%',
  },
  reBath: {
    src: '/work/r/primary-bath-2400.jpg',
    alt: 'A bathroom in pale grey and white with a long double vanity under a full-width mirror, chrome tube sconces either side, and a glass walk-in shower tiled in white to the right, over a marble mosaic floor.',
    tone: 'interior',
    scene: 'interior-bath',
    focus: '50% 50%',
  },
  reDining: {
    // ► dining-room.jpg
    src: '/work/r/dining-room-960.jpg',
    alt: 'A dining room with charcoal walls and ceiling, a dark oval table set for eight in pale upholstered chairs, a cluster of amber glass globe pendants overhead, and an arched glass-fronted cabinet to the left, open through to a lit kitchen beyond.',
    tone: 'interior',
    scene: 'interior-dining',
    focus: '50% 50%',
  },
  reStair: {
    src: '/work/r/entry-hall-2400.jpg',
    alt: 'A double-height entry hall with twin staircases rising either side to a railed landing, brass wall lights on white walls, and a round table on a jute rug beneath an arched opening through to the living room.',
    tone: 'interior',
    scene: 'staircase',
    focus: '50% 45%',
  },
  entryStair: {
    // ► entry-stair.jpg
    src: 'photo-1600566753190-17f0baa2a6c3',
    alt: 'A double-height entry hall with a staircase rising to a landing above.',
    tone: 'interior',
    scene: 'foyer',
  },
  reDetail: {
    src: '/work/r/home-gym-2400.jpg',
    alt: 'A home gym with a rowing machine in the foreground, a wall-mounted training screen and weights bench to the right, a cedar infrared sauna cabin against the far wall, and rolled exercise mats and dumbbells to one side, on a pale oak floor.',
    tone: 'interior',
    scene: 'detail',
    focus: '50% 52%',
  },
  reBathFeature: {
    src: '/work/r/bath-feature-2400.jpg',
    alt: 'A bathroom papered in a dark green and gold crane print, with a white freestanding oval tub, a wall-mounted spout, a gilt mirror above a marble shelf and a brass trolley beside the tub.',
    tone: 'interior',
    scene: 'interior-bath',
    focus: '50% 50%',
  },
  rePool: {
    // ► pool-terrace.jpg
    src: '/work/r/pool-garden-2400.jpg',
    alt: 'A rectangular swimming pool with pale stone coping and clear turquoise water, a row of tall narrow cypresses along the far side behind a black railing, loungers on the grass to the left and two white in-water chairs in the foreground.',
    tone: 'water',
    scene: 'pool',
    focus: '50% 55%',
  },
  reTerrace: {
    src: '/work/r/covered-terrace-2400.jpg',
    alt: 'The back of a white painted brick house on a bright day, seen across a long rectangular pool with pale stone coping, folded parasols and loungers on the lawn either side, and a covered terrace with seating under the eaves.',
    tone: 'daylight',
    scene: 'terrace',
    focus: '50% 45%',
  },
  reWalkthrough: {
    src: '',
    alt: 'A hallway looking through to a bright room at the end.',
    tone: 'interior',
    scene: 'walkthrough',
    focus: '50% 50%',
  },

  /* — Aerial — */
  aerialProperty: {
    // KM Productions, shot on a DJI drone. Re-encoded by `npm run optimise:work`.
    src: '/work/r/aerial-estate-2400.jpg',
    alt: 'A large white house with a grey shingle roof seen from the air in late afternoon light, wrapped around a brick pool terrace with a lit turquoise pool, screened porch and clipped hedges, surrounded by mature magnolias.',
    tone: 'aerial',
    scene: 'aerial-property',
    focus: '50% 48%',
  },
  aerialNeighborhood: {
    src: '/work/r/neighbourhood-aerial-2400.jpg',
    alt: 'A residential street photographed from directly above, showing a house and its plot between neighbouring roofs, with sidewalks, lawns and parked cars either side.',
    tone: 'aerial',
    scene: 'aerial-neighborhood',
    focus: '50% 50%',
  },
  aerialLand: {
    src: '/work/r/pond-aerial-2400.jpg',
    alt: 'A brick house on a corner plot photographed from the air, with a green pond and open lawn behind it, curving roads and sidewalks in front, and neighbouring houses beyond.',
    tone: 'water',
    scene: 'aerial-land',
    focus: '50% 48%',
  },
  aerialWater: {
    src: '',
    alt: 'A waterfront property from the air, with a dock or shoreline in frame.',
    tone: 'aerial',
    scene: 'aerial-water',
    focus: '50% 48%',
  },
  aerialHighway: {
    src: '/work/r/estate-in-trees-2400.jpg',
    alt: 'A white house with a steep shingled roof photographed from high above, set in dense woodland, with a pool and terrace behind it and a broad concrete drive curving up to the front.',
    tone: 'aerial',
    scene: 'aerial-highway',
    focus: '50% 50%',
  },
  droneInFlight: {
    src: '',
    alt: 'A camera drone in flight against an open sky.',
    tone: 'aerial',
    scene: 'drone-flight',
    focus: '50% 55%',
  },

  /* — Video — */
  filmFrameA: {
    src: '',
    alt: 'A frame from a property film, the camera moving through a doorway.',
    tone: 'interior',
    scene: 'video-frame',
    focus: '50% 50%',
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
    src: '',
    alt: 'A gym floor with equipment in use under the lighting of the room itself.',
    tone: 'interior',
    scene: 'commercial-gym',
    focus: '50% 52%',
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
    src: '/work/r/pool-wide-960.jpg',
    alt: 'A long rectangular pool with pale stone coping running the length of a lawn, in front of a white painted brick house with a covered terrace, loungers along the near edge and mature trees behind.',
    tone: 'water',
    scene: 'lifestyle',
    focus: '50% 55%',
  },

  /* — The company — */
  founderPortrait: {
    // ► DROP THE FOUNDER'S PHOTOGRAPH HERE. Put the file in `public/work/`
    //   and write the path, e.g. '/work/founder.jpg'. Then rewrite `alt` below
    //   to describe the actual photograph.
    src: '/work/r/founder-640.jpg',
    alt: 'Bryan Miller, photographed from the chest up in a navy suit and a patterned tie against a plain white background.',
    tone: 'studio',
    scene: 'portrait',
    focus: '50% 30%',
  },
  gearStill: {
    src: '',
    alt: 'Camera bodies, lenses and a drone laid out on a work surface.',
    tone: 'daylight',
    scene: 'gear',
    focus: '50% 45%',
  },
} as const satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof IMAGES;
export const IMAGE_KEYS = Object.keys(IMAGES) as ImageKey[];
