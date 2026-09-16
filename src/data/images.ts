import type { SceneKind } from '@/lib/scenes';

/* ============================================================================
   IMAGE CONFIGURATION — THE ONLY PLACE IMAGE SOURCES LIVE
   ----------------------------------------------------------------------------
   Every photograph in the site resolves through this file. To move Arcadia onto
   a real photo library, replace `IMAGE_BASE` and the `src` of each entry; the
   rest of the application needs no change.

   Each entry carries:
     src   — the remote identifier (an Unsplash photo id, or an absolute URL)
     alt   — real alternative text, written for a screen reader
     scene — the drawn plate used if the photograph never arrives
     tone  — the wash held behind the frame while it decodes
     focus — object-position, so crops stay composed at every aspect ratio
   ========================================================================= */

export type Tone = 'dusk' | 'stone' | 'sand' | 'pine' | 'marine' | 'ember' | 'graphite';

export interface ImageAsset {
  src: string;
  alt: string;
  tone: Tone;
  focus?: string;
  /** The plate drawn for this frame when its photograph does not arrive. */
  scene: SceneKind;
}

/** Swap this for any CDN that accepts width/quality query parameters. */
export const IMAGE_BASE = 'https://images.unsplash.com/';

/** Widths generated for `srcset`. Kept small in number to limit cache churn. */
export const IMAGE_WIDTHS = [640, 960, 1280, 1800, 2400] as const;

/**
 * Build a single source URL at a given width.
 * Absolute URLs are returned untouched, so a self-hosted library drops straight in.
 */
export function imageUrl(src: string, width: number, quality = 72): string {
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
  if (/^https?:\/\//.test(src) || src.startsWith('/')) return undefined;
  return IMAGE_WIDTHS.map((w) => `${imageUrl(src, w, quality)} ${w}w`).join(', ');
}

/* ---------------------------------------------------------------------------
   THE LIBRARY
   ------------------------------------------------------------------------ */

export const IMAGES = {
  /* — Casa Aurelia, Malibu — */
  aureliaHero: {
    src: 'photo-1600596542815-ffad4c1539a9',
    alt: 'Casa Aurelia at dusk: a low, horizontal residence of pale stone and glass set above the Pacific.',
    tone: 'dusk',
    scene: 'coast-dusk',
    focus: '50% 58%',
  },
  aureliaExterior: {
    src: 'photo-1580587771525-78b9dba3b914',
    alt: 'The western elevation of Casa Aurelia, its glazed volume cantilevered over the bluff.',
    tone: 'dusk',
    scene: 'coast-day',
  },
  aureliaLiving: {
    src: 'photo-1600607687939-ce8a6c25118c',
    alt: 'The living room at Casa Aurelia, framed in white oak with a full-height wall of glass.',
    tone: 'sand',
    scene: 'interior-living',
  },
  aureliaKitchen: {
    src: 'photo-1600489000022-c2086d79f9d4',
    alt: 'The kitchen at Casa Aurelia: a single slab island in honed limestone beneath a clerestory.',
    tone: 'stone',
    scene: 'interior-kitchen',
  },
  aureliaSuite: {
    src: 'photo-1600566753086-00f18fb6b3ea',
    alt: 'The primary suite, opening on two sides to a private terrace above the water.',
    tone: 'sand',
    scene: 'interior-bedroom',
  },
  aureliaTerrace: {
    src: 'photo-1600585154340-be6161a56a0c',
    alt: 'The terrace at Casa Aurelia, a shaded stone deck running the length of the house.',
    tone: 'dusk',
    scene: 'terrace',
  },
  aureliaPool: {
    src: 'photo-1519821172144-4f87d85de2a1',
    alt: 'The infinity pool at Casa Aurelia reading level with the horizon line of the Pacific.',
    tone: 'marine',
    scene: 'pool',
  },
  aureliaBath: {
    src: 'photo-1600210492486-724fe5c67fb0',
    alt: 'The primary bath, finished in a single run of travertine with a freestanding tub.',
    tone: 'stone',
    scene: 'interior-bath',
  },
  aureliaDetail: {
    src: 'photo-1600607687644-c7171b42498b',
    alt: 'A detail of the oak joinery and bronze hardware in the gallery hallway.',
    tone: 'sand',
    scene: 'joinery',
  },
  aureliaDusk: {
    src: 'photo-1523217582562-09d0def993a6',
    alt: 'Casa Aurelia after sunset, its interiors lit and legible through the glass.',
    tone: 'dusk',
    scene: 'coast-night',
  },
  aureliaStair: {
    src: 'photo-1600607688969-a5bfcd646154',
    alt: 'The floating stair at Casa Aurelia, treads of solid oak cantilevered from a plaster wall.',
    tone: 'sand',
    scene: 'stair',
  },
  aureliaDining: {
    src: 'photo-1600121848594-d8644e57abab',
    alt: 'The dining room, with a long walnut table set beneath a run of clerestory glazing.',
    tone: 'sand',
    scene: 'interior-dining',
  },

  /* — The Ridge House, Aspen — */
  ridgeHero: {
    src: 'photo-1610641818989-c2051b5e2cfd',
    alt: 'The Ridge House in Aspen: blackened timber and glass set into a snow-covered slope.',
    tone: 'pine',
    scene: 'alpine-house',
  },
  ridgeInterior: {
    src: 'photo-1600585154526-990dced4db0d',
    alt: 'The great room at The Ridge House, a double-height volume facing the Elk Mountains.',
    tone: 'graphite',
    scene: 'alpine-interior',
  },
  ridgeDetail: {
    src: 'photo-1551524164-687a55dd1126',
    alt: 'A detail of the charred cedar cladding and steel window surrounds at The Ridge House.',
    tone: 'pine',
    scene: 'timber-detail',
  },

  /* — Villa No. 17, Miami Beach — */
  villaHero: {
    src: 'photo-1613490493576-7fde63acd811',
    alt: 'Villa No. 17 on Miami Beach, a white stucco composition wrapped in deep loggias.',
    tone: 'marine',
    scene: 'villa',
  },
  villaInterior: {
    src: 'photo-1600566753190-17f0baa2a6c3',
    alt: 'A bedroom at Villa No. 17 opening to the waterway through full-height sliding glass.',
    tone: 'sand',
    scene: 'interior-bedroom',
  },
  villaWater: {
    src: 'photo-1571003123894-1f0594d2b5d9',
    alt: 'The pool terrace at Villa No. 17, with a private dock on the Intracoastal beyond.',
    tone: 'marine',
    scene: 'villa-water',
  },

  /* — The Glass House, Austin — */
  glassHero: {
    src: 'photo-1600585154084-4e5fe7c39198',
    alt: 'The Glass House outside Austin: a steel-framed pavilion floating above live oaks.',
    tone: 'graphite',
    scene: 'pavilion',
  },
  glassInterior: {
    src: 'photo-1502672260266-1c1ef2d93688',
    alt: 'The interior of The Glass House, a single uninterrupted room beneath an exposed steel deck.',
    tone: 'stone',
    scene: 'pavilion-interior',
  },

  /* — Places — */
  malibu: {
    src: 'photo-1505118380757-91f5f5632de0',
    alt: 'The Malibu coastline at late afternoon, bluffs falling to a pale beach.',
    tone: 'dusk',
    scene: 'coastline',
  },
  aspen: {
    src: 'photo-1478827387698-1527781a4887',
    alt: 'The Elk Mountains above Aspen under early snow.',
    tone: 'pine',
    scene: 'alpine-land',
  },
  miami: {
    src: 'photo-1506929562872-bb421503ef21',
    alt: 'Miami Beach from the water, its low modern skyline against the Atlantic.',
    tone: 'marine',
    scene: 'bay',
  },
  austin: {
    src: 'photo-1531218150217-54595bc2b934',
    alt: 'The hill country west of Austin at dusk.',
    tone: 'ember',
    scene: 'hills',
  },
  newYork: {
    src: 'photo-1496442226666-8d4d0e62e6e9',
    alt: 'Lower Manhattan seen from the east at first light.',
    tone: 'graphite',
    scene: 'city',
  },

  /* — People — */
  agentPortrait: {
    src: 'photo-1573496359142-b8d87734a5a2',
    alt: 'Elena Marlowe, Principal Broker at Arcadia Estates, photographed in natural light.',
    tone: 'stone',
    scene: 'portrait',
    focus: '50% 30%',
  },
  agentSecondary: {
    src: 'photo-1487412720507-e7ab37603c6f',
    alt: 'Thomas Reyes, Director of Architecture Sales, photographed against a plaster wall.',
    tone: 'graphite',
    scene: 'portrait',
    focus: '50% 28%',
  },
} as const satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof IMAGES;
