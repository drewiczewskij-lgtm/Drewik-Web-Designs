import type { ImageKey } from '@/data/images';
import { OWN_WORK_ONLY } from '@/data/site';

/* ============================================================================
   THE PORTFOLIO
   ----------------------------------------------------------------------------
   ► ADDING YOUR OWN WORK

   1. Add the picture to `src/data/images.ts` (one entry, with a `src`).
   2. Add an item here pointing at that key.

   Photographs need nothing else. For a film, add `video` — either a file you
   host or a YouTube/Vimeo id — and the card opens a player instead of a viewer:

       { kind: 'video', video: { provider: 'youtube', id: 'dQw4w9WgXcQ' } }
       { kind: 'video', video: { provider: 'file', id: '/work/ridge-house.mp4' } }

   Until a film has a source it opens a still frame and says so plainly rather
   than pretending to play. `aspect` drives the masonry: 'tall' items take two
   rows, 'wide' two columns. Mixing them is what stops the grid looking like a
   spreadsheet.
   ========================================================================= */

export type PortfolioCategory =
  | 'real-estate-photo'
  | 'real-estate-video'
  | 'drone'
  | 'commercial'
  | 'lifestyle';

export const CATEGORIES: { id: PortfolioCategory | 'all'; label: string; blurb: string }[] = [
  { id: 'all', label: 'All work', blurb: 'Everything, most recent first.' },
  { id: 'real-estate-photo', label: 'Real estate photo', blurb: 'Interiors, exteriors and twilight sets.' },
  { id: 'real-estate-video', label: 'Real estate video', blurb: 'Walkthroughs and property films.' },
  { id: 'drone', label: 'Drone', blurb: 'Aerial stills and aerial video.' },
  { id: 'commercial', label: 'Commercial', blurb: 'Brand and promotional work for local business.' },
  { id: 'lifestyle', label: 'Lifestyle', blurb: 'People in the spaces, for brand and social.' },
];

export interface VideoSource {
  provider: 'youtube' | 'vimeo' | 'file';
  /** A YouTube/Vimeo id, or a path/URL for a file. */
  id: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  /**
   * Where it was shot. Keep it to a town — never a full street address.
   * Leave it out rather than guess: an invented town on a real photograph is
   * a claim about where the work was done, and the tile hides the line when
   * there is nothing true to put in it.
   */
  location?: string;
  category: PortfolioCategory;
  kind: 'photo' | 'video';
  image: ImageKey;
  aspect: 'square' | 'tall' | 'wide';
  /** One line shown on hover and under the viewer. What the shot was for. */
  caption: string;
  /** The package it came from, so the grid doubles as proof of what you buy. */
  service?: string;
  video?: VideoSource;
  /** Featured items lead the home page. Four is the right number. */
  featured?: boolean;
}

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: 'twilight-glass-house',
    title: 'Front elevation',
    category: 'real-estate-photo',
    kind: 'photo',
    image: 'reExteriorTwilight',
    aspect: 'wide',
    caption: 'Late morning from the forecourt, with the brick steps leading up to the door.',
    service: 'Premium package',
    featured: true,
  },
  {
    id: 'aerial-roofline',
    title: 'Pool terrace from the air',
    category: 'drone',
    kind: 'photo',
    image: 'aerialProperty',
    aspect: 'wide',
    caption: 'Late afternoon, high enough to hold the whole lot — house, terrace, pool and tree line in one frame.',
    service: 'Aerial photography',
    featured: true,
  },
  {
    id: 'living-room-flambient',
    title: 'Living room',
    category: 'real-estate-photo',
    kind: 'photo',
    image: 'reLiving',
    aspect: 'square',
    caption: 'Held for the fire and the window light at once, with the landing above kept in frame.',
    service: 'Photo package',
    featured: true,
  },
  {
    // ► 277-north-place.mp4 — drop the file in public/work/ and run
    //   `npm run link:work -- --write`; it matches this id by name.
    id: '277-north-place',
    title: '277 North Place',
    location: 'Tupelo, MS',
    category: 'real-estate-video',
    kind: 'video',
    video: { provider: 'youtube', id: 'YlCDz_P0Wh4' },
    image: 'filmFrameA',
    aspect: 'wide',
    caption: 'A full property film — approach, walkthrough and aerial, cut to one piece.',
    service: 'Premium package',
    featured: true,
  },
  {
    // ► 1870-n-parc.mp4
    id: '1870-n-parc',
    title: '1870 N. Parc',
    location: 'Oxford, MS',
    category: 'real-estate-video',
    kind: 'video',
    image: 'reWalkthrough',
    aspect: 'square',
    caption: 'Interior-led walkthrough, paced so each room lands before the next.',
    service: 'Photo + Video package',
  },
  {
    id: 'property-film',
    title: 'Property film',
    location: 'Oxford, MS',
    category: 'real-estate-video',
    kind: 'video',
    image: 'filmFrameA',
    aspect: 'wide',
    caption: 'Ninety seconds, graded, scored. Cut for the portal and again for Reels.',
    service: 'Photo + Video package',
  },
  {
    id: 'kitchen-island',
    title: 'Kitchen',
    location: 'Tupelo, MS',
    category: 'real-estate-photo',
    kind: 'photo',
    image: 'reKitchen',
    aspect: 'square',
    caption: 'Pendants balanced against daylight so nothing goes green under the cabinets.',
    service: 'Photo package',
  },
  {
    id: 'primary-suite',
    title: 'Primary suite',
    category: 'real-estate-photo',
    kind: 'photo',
    image: 'reBedroom',
    aspect: 'tall',
    caption: 'Square to the bed, with both shuttered windows left in the frame.',
    service: 'Photo package',
  },
  {
    id: 'walkthrough-open',
    title: 'Walkthrough, opening frame',
    location: 'Southaven, MS',
    category: 'real-estate-video',
    kind: 'video',
    image: 'reWalkthrough',
    aspect: 'square',
    caption: 'Gimbal move down the hall into the light. The first eight seconds decide the rest.',
    service: 'Photo + Video package',
  },
  {
    id: 'aerial-neighbourhood',
    title: 'The property from above',
    category: 'drone',
    kind: 'photo',
    image: 'aerialNeighborhood',
    aspect: 'wide',
    caption: 'High over the drive at midday — house, courtyard and tree line in one frame.',
    service: 'Aerial photography',
  },
  {
    id: 'pool-dusk',
    title: 'Pool and garden',
    category: 'real-estate-photo',
    kind: 'photo',
    image: 'rePool',
    aspect: 'square',
    caption: 'Square down the length of the pool, with the cypress screen holding the far edge.',
    service: 'Twilight add-on',
  },
  {
    id: 'acreage',
    title: 'Acreage and creek',
    location: 'Pontotoc County, MS',
    category: 'drone',
    kind: 'photo',
    image: 'aerialLand',
    aspect: 'tall',
    caption: 'Land listings live or die on the aerial. Boundaries legible, creek line visible.',
    service: 'Aerial photography',
  },
  {
    id: 'waterfront-dock',
    title: 'Waterfront and dock',
    location: 'Sardis Lake, MS',
    category: 'drone',
    kind: 'video',
    image: 'aerialWater',
    aspect: 'wide',
    caption: 'A slow reveal out over the water, then back to the dock. One continuous move.',
    service: 'Aerial video',
  },
  {
    id: 'home-gym',
    title: 'Home gym',
    category: 'real-estate-photo',
    kind: 'photo',
    image: 'reDetail',
    aspect: 'wide',
    caption: 'The room buyers ask about and listings usually skip.',
    service: 'Photo package',
  },
  {
    id: 'bath-detail',
    title: 'Primary bath',
    category: 'real-estate-photo',
    kind: 'photo',
    image: 'reBath',
    aspect: 'square',
    caption: 'Mirror lit separately so the room does not go flat. Tile kept straight.',
    service: 'Photo package',
  },
  {
    id: 'staircase',
    title: 'Stair and balustrade',
    location: 'Oxford, MS',
    category: 'real-estate-photo',
    kind: 'photo',
    image: 'reStair',
    aspect: 'tall',
    caption: 'Shot on a tilt-shift so the verticals stay vertical. They always should.',
    service: 'Photo package',
  },
  {
    id: 'dining',
    title: 'Dining room',
    category: 'real-estate-photo',
    kind: 'photo',
    image: 'reDining',
    aspect: 'square',
    caption: 'One point of view, one height, one horizon. Consistency is what makes a set.',
    service: 'Photo package',
  },
  {
    id: 'terrace-fire',
    title: 'Covered terrace',
    category: 'real-estate-photo',
    kind: 'photo',
    image: 'reTerrace',
    aspect: 'wide',
    caption: 'Outdoor living photographs best when it is lit and the sky still has colour.',
    service: 'Twilight add-on',
  },
  {
    id: 'modern-cantilever',
    title: 'Contemporary exterior',
    category: 'real-estate-photo',
    kind: 'photo',
    image: 'reExteriorModern',
    aspect: 'square',
    caption: 'Two volumes, one shadow line. Lit to keep the cantilever reading as a cantilever.',
    service: 'Premium package',
  },
  {
    id: 'restaurant-bar',
    title: 'Bar at service',
    location: 'Oxford, MS',
    category: 'commercial',
    kind: 'photo',
    image: 'commRestaurant',
    aspect: 'tall',
    caption: 'Shot during a real service. Staged hospitality photography never looks warm.',
    service: 'Commercial',
  },
  {
    id: 'gym-floor',
    title: 'Training floor',
    location: 'Tupelo, MS',
    category: 'commercial',
    kind: 'video',
    image: 'commGym',
    aspect: 'wide',
    caption: 'Cool key, warm practical, one figure for scale. Cut to a 30-second spot.',
    service: 'Commercial',
  },
  {
    id: 'showroom',
    title: 'Showroom floor',
    location: 'Southaven, MS',
    category: 'commercial',
    kind: 'photo',
    image: 'commAuto',
    aspect: 'square',
    caption: 'Overheads controlled, reflections managed. Cars are mirrors, which is the problem.',
    service: 'Commercial',
  },
  {
    id: 'hotel-portico',
    title: 'Hotel at dusk',
    location: 'Tupelo, MS',
    category: 'commercial',
    kind: 'photo',
    image: 'commHotel',
    aspect: 'tall',
    caption: 'Every guest room light checked before the shot. It is worth the half hour.',
    service: 'Commercial',
  },
  {
    id: 'retail-interior',
    title: 'Store interior',
    location: 'Oxford, MS',
    category: 'commercial',
    kind: 'photo',
    image: 'commRetail',
    aspect: 'square',
    caption: 'Track lighting balanced so the stock reads true. Colour accuracy is the job.',
    service: 'Commercial',
  },
  {
    id: 'event-stage',
    title: 'Live event',
    location: 'Starkville, MS',
    category: 'commercial',
    kind: 'video',
    image: 'commEvent',
    aspect: 'wide',
    caption: 'Shot fast, graded warm, cut to music. Delivered the following morning.',
    service: 'Commercial',
  },
  {
    id: 'terrace-lifestyle',
    title: 'Pool and rear elevation',
    category: 'real-estate-photo',
    kind: 'photo',
    image: 'lifestyleTerrace',
    aspect: 'wide',
    caption: 'The full length of the pool with the house behind it, from the far coping.',
    service: 'Commercial',
  },
  {
    id: 'drone-in-flight',
    title: 'On location',
    location: 'North Mississippi',
    category: 'lifestyle',
    kind: 'photo',
    image: 'droneInFlight',
    aspect: 'square',
    caption: 'The aircraft up at blue hour. Licensed, insured, and flown inside the rules.',
    service: 'Aerial',
  },
  {
    id: 'exterior-night',
    title: 'After dark',
    location: 'Columbus, MS',
    category: 'real-estate-photo',
    kind: 'photo',
    image: 'reExteriorNight',
    aspect: 'square',
    caption: 'A true night exterior, lit from inside. Rare on a listing, and it shows.',
    service: 'Twilight add-on',
  },
  {
    id: 'commercial-frontage',
    title: 'Commercial frontage',
    location: 'Highway 45, MS',
    category: 'drone',
    kind: 'photo',
    image: 'aerialHighway',
    aspect: 'tall',
    caption: 'Traffic counts are an argument. An aerial at dusk makes it for you.',
    service: 'Aerial photography',
  },
];

export const FEATURED_WORK = PORTFOLIO.filter((p) => p.featured);

export function byCategory(category: PortfolioCategory | 'all'): PortfolioItem[] {
  return category === 'all' ? PORTFOLIO : PORTFOLIO.filter((p) => p.category === category);
}

export function countFor(category: PortfolioCategory | 'all'): number {
  return byCategory(category).length;
}

export function categoryLabel(id: PortfolioCategory): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** Playable means a source exists. Everything else opens as a still. */
export function isPlayable(item: PortfolioItem): boolean {
  return item.kind === 'video' && !!item.video && item.video.id.trim().length > 0;
}

/**
 * True when a piece is backed by the studio's own work rather than a stand-in:
 * a film with a real source, or a photograph pointing at a file in
 * `public/work/`. Stock ids and drawn plates are not.
 *
 * The grid puts these first. Real work should lead a portfolio, and while most
 * of it is still placeholder, a piece that IS real is otherwise impossible to
 * pick out of twenty-six identical-looking tiles.
 */
export function isRealWork(item: PortfolioItem, ownImage: (key: ImageKey) => boolean): boolean {
  return isPlayable(item) || ownImage(item.image);
}

export function videoEmbedUrl(v: VideoSource): string {
  if (v.provider === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1`;
  }
  if (v.provider === 'vimeo') return `https://player.vimeo.com/video/${v.id}?autoplay=1&title=0&byline=0`;
  return v.id;
}

/**
 * The pieces the site will actually show, given the house rule.
 *
 * Page copy counts from here rather than from `PORTFOLIO`, so a headline can
 * never advertise twenty-eight pieces above a grid holding six.
 */
export function shownPortfolio(ownImage: (key: ImageKey) => boolean): PortfolioItem[] {
  return OWN_WORK_ONLY ? PORTFOLIO.filter((item) => isRealWork(item, ownImage)) : PORTFOLIO;
}

/**
 * The still a film's tile shows before it is played.
 *
 * YouTube serves a frame of the film itself at a predictable address, which is
 * the studio's own footage — so a film whose poster slot holds no photograph
 * shows a frame of itself rather than an empty box. `maxresdefault` exists only
 * for films uploaded above 720p; `hqdefault` always exists, so it is the
 * fallback rather than a broken frame.
 */
export function filmPoster(item: PortfolioItem): string | undefined {
  if (item.video?.provider !== 'youtube') return undefined;
  return `https://i.ytimg.com/vi/${item.video.id}/maxresdefault.jpg`;
}

export function filmPosterFallback(item: PortfolioItem): string | undefined {
  if (item.video?.provider !== 'youtube') return undefined;
  return `https://i.ytimg.com/vi/${item.video.id}/hqdefault.jpg`;
}
