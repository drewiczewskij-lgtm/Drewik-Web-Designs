import { useSyncExternalStore } from 'react';
import { IMAGE_KEYS, type ImageKey } from '@/data/images';

/* ============================================================================
   DROPPED PHOTOGRAPHS
   ----------------------------------------------------------------------------
   Lets someone put their own photographs on the site by dragging them onto it,
   with no build step, no terminal and no file editing. Used by the photo
   manager on /admin, and read by `Figure` before anything else.

   WHAT THIS IS FOR. Seeing your work on your own site in ten seconds. It is a
   PREVIEW: the pictures live in this browser's local storage, on this device
   only. They are not in the repository, nobody else sees them, and a cleared
   browser loses them. The manager says so plainly and offers the real thing —
   files in `public/work/` — as the next step.

   WHY IT IS STILL WORTH HAVING. Deciding whether a photograph works in a
   layout is a visual judgement, and making it should not require a build.

   ── THE STORAGE PROBLEM ───────────────────────────────────────────────────
   Local storage is a handful of megabytes and holds text, so every image is
   re-encoded to a JPEG data URL no larger than it needs to be. A 6MB camera
   file becomes about 250KB. That is plenty for judging a layout and nowhere
   near enough for print, which is the other reason this is a preview.
   ========================================================================= */

const KEY = 'km.photos.v1';

/** Long edge, in pixels. Generous for a screen, small enough to store. */
const MAX_EDGE = 1800;
const QUALITY = 0.82;

/** Roughly how much room browsers give a single origin. Used for warnings. */
export const STORAGE_BUDGET_BYTES = 4.6 * 1024 * 1024;

export interface StoredPhoto {
  /** A JPEG data URL. */
  dataUrl: string;
  /** The original filename, so the manager can show what was dropped. */
  name: string;
  width: number;
  height: number;
  bytes: number;
  at: number;
}

type Store = Partial<Record<ImageKey, StoredPhoto>>;

let cache: Store | null = null;
const listeners = new Set<() => void>();

function read(): Store {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    // Private windows, blocked storage, a value from an older version.
    cache = {};
  }
  return cache;
}

function commit(next: Store) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    // Almost always the quota. Undo the cache so the UI does not claim a
    // photograph is stored when it is not.
    cache = null;
    throw new Error(
      e instanceof Error && /quota/i.test(e.message)
        ? 'This browser is out of storage for photographs. Remove one, or use public/work/ for the real thing.'
        : 'Could not save to this browser.',
    );
  }
  for (const fn of listeners) fn();
}

/* ---------------------------------------------------------------------------
   Reading
   ------------------------------------------------------------------------ */

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const EMPTY: Store = {};
const serverSnapshot = () => EMPTY;

/** Every dropped photograph, live. */
export function usePhotos(): Store {
  return useSyncExternalStore(subscribe, read, serverSnapshot);
}

/** One dropped photograph, live. `Figure` calls this for every frame. */
export function usePhoto(key: ImageKey): StoredPhoto | undefined {
  return usePhotos()[key];
}

export function bytesUsed(store: Store): number {
  return Object.values(store).reduce((sum, p) => sum + (p?.bytes ?? 0), 0);
}

/* ---------------------------------------------------------------------------
   Writing
   ------------------------------------------------------------------------ */

/**
 * Re-encodes a dropped file down to something a browser can actually keep.
 *
 * Draws to a canvas rather than storing the original bytes: a 6MB file would
 * fill the entire storage budget by itself, and nothing on screen is better
 * for having it.
 */
export function downscale(file: File): Promise<Omit<StoredPhoto, 'at'>> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error(`${file.name} is not an image.`));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('This browser could not read that image.'));
        return;
      }
      // A white ground, so a transparent PNG does not become a black rectangle.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
      resolve({
        dataUrl,
        name: file.name,
        width: w,
        height: h,
        // A data URL is base64: four characters carry three bytes.
        bytes: Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name} could not be opened as an image.`));
    };
    img.src = url;
  });
}

export async function put(key: ImageKey, file: File): Promise<StoredPhoto> {
  const photo = { ...(await downscale(file)), at: Date.now() };
  commit({ ...read(), [key]: photo });
  return photo;
}

export function remove(key: ImageKey) {
  const next = { ...read() };
  delete next[key];
  commit(next);
}

export function clearAll() {
  commit({});
}

/* ---------------------------------------------------------------------------
   Matching filenames to slots
   ------------------------------------------------------------------------ */

/** Same rules as `scripts/link-work.mjs`, so both agree about a filename. */
const ALIASES: Record<string, ImageKey> = {
  frontelevation: 'reExteriorDay',
  poolterrace: 'rePool',
  entrystair: 'entryStair',
  diningroom: 'reDining',
  aerialfarmhouse: 'aerialProperty',
  founder: 'founderPortrait',
  portrait: 'founderPortrait',
  hero: 'heroTwilight',
  twilight: 'reExteriorTwilight',
  kitchen: 'reKitchen',
  living: 'reLiving',
  bedroom: 'reBedroom',
  bathroom: 'reBath',
  bath: 'reBath',
  dining: 'reDining',
  stairs: 'reStair',
  stair: 'reStair',
  foyer: 'entryStair',
  entry: 'entryStair',
  pool: 'rePool',
  terrace: 'reTerrace',
  aerial: 'aerialProperty',
  drone: 'droneInFlight',
  exterior: 'reExteriorDay',
  front: 'reExteriorDay',
  gear: 'gearStill',
};

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** The slot a filename belongs in, or null if it does not name one. */
export function slotForFilename(filename: string): ImageKey | null {
  const stem = normalise(filename.replace(/\.[^.]+$/, ''));
  const exact = IMAGE_KEYS.find((k) => normalise(k) === stem);
  if (exact) return exact;
  if (ALIASES[stem]) return ALIASES[stem];
  // A trailing number is common in exports: hero-twilight-02.jpg
  const numbered = IMAGE_KEYS.find(
    (k) => stem.startsWith(normalise(k)) && /^\d+$/.test(stem.slice(normalise(k).length)),
  );
  return numbered ?? null;
}

/* ---------------------------------------------------------------------------
   WHOSE PHOTOGRAPH IS THIS?
   ------------------------------------------------------------------------ */

/**
 * True when a frame is NOT the owner's own work.
 *
 * Own work means a file in `public/work/` (a rooted path) or a photograph
 * dropped onto the photo manager. Everything else — a drawn plate, a stock id,
 * any remote URL — is a stand-in.
 *
 * Used by the photo manager's badge, so the owner can see at a glance which
 * frames are still someone else's before the site goes anywhere public.
 */
export function isPlaceholderSource(src: string, dropped: boolean): boolean {
  if (dropped) return false;
  const s = src.trim();
  if (s === '') return true;
  return !s.startsWith('/');
}
