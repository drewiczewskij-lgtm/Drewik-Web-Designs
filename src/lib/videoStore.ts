import { useEffect, useState, useSyncExternalStore } from 'react';

/* ============================================================================
   DROPPED FILMS
   ----------------------------------------------------------------------------
   The same idea as the photo manager, but films cannot use the same machinery.

   A photograph is shrunk to a few hundred kilobytes of text and kept in local
   storage. A film is tens or hundreds of megabytes and cannot be shrunk in a
   browser without re-encoding it, which is slow and lossy. Local storage would
   refuse it outright — a few megabytes is the whole budget.

   So films go in IndexedDB, which stores real binary Blobs, has no base64
   overhead, and is measured against the disk rather than a fixed ceiling. The
   file goes in as it came off the camera and comes out as an object URL the
   video element can play.

   TWO WAYS TO GIVE THE SITE A FILM, and they are genuinely different:

     A HOSTED LINK — YouTube. Weightless, works on every device, and
     survives being deployed. This is what a real site should use: nobody
     should be serving a 300MB file from their own hosting.

     A DROPPED FILE — this browser only, like the photographs. For seeing a cut
     in place before it is uploaded anywhere.

   The manager offers both and says which is which.
   ========================================================================= */

const DB_NAME = 'km.videos';
const DB_VERSION = 1;
const STORE = 'films';
const LINKS_KEY = 'km.videoLinks.v1';

export interface StoredFilm {
  id: string;
  name: string;
  type: string;
  size: number;
  at: number;
}

export type LinkProvider = 'youtube';

export interface FilmLink {
  provider: LinkProvider;
  /** The bare id, never the whole address. */
  videoId: string;
}

/* ---------------------------------------------------------------------------
   IndexedDB
   ------------------------------------------------------------------------ */

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser has no IndexedDB, so films cannot be stored here.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        // Keyed by the portfolio item's id, so one film belongs to one piece.
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Could not open the film store.'));
  });
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error('The film store rejected that.'));
      }),
  );
}

/* ---------------------------------------------------------------------------
   The in-memory mirror React reads from
   ------------------------------------------------------------------------ */

interface Entry extends StoredFilm {
  blob: Blob;
}

let films: Record<string, StoredFilm> = {};
const urls = new Map<string, string>();
const listeners = new Set<() => void>();
let loaded = false;

function notify() {
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const snapshot = () => films;
const serverSnapshot = () => films;

/** Reads the index once, so the manager can list what is already stored. */
export async function hydrate(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const all = await tx<Entry[]>('readonly', (s) => s.getAll() as IDBRequest<Entry[]>);
    const next: Record<string, StoredFilm> = {};
    for (const e of all) {
      next[e.id] = { id: e.id, name: e.name, type: e.type, size: e.size, at: e.at };
      // One object URL per film, made once and kept for the page's lifetime.
      if (!urls.has(e.id)) urls.set(e.id, URL.createObjectURL(e.blob));
    }
    films = next;
    notify();
  } catch {
    // A browser with IndexedDB blocked still has to render.
    films = {};
    notify();
  }
}

export function useFilms(): Record<string, StoredFilm> {
  const value = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  useEffect(() => {
    void hydrate();
  }, []);
  return value;
}

/** The playable address for a dropped film, if there is one. */
export function filmUrl(id: string): string | undefined {
  return urls.get(id);
}

export async function putFilm(id: string, file: File): Promise<StoredFilm> {
  if (!file.type.startsWith('video/')) {
    throw new Error(`${file.name} is not a video file.`);
  }
  const meta: StoredFilm = {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    at: Date.now(),
  };
  try {
    await tx('readwrite', (s) => s.put({ ...meta, blob: file }));
  } catch (e) {
    throw new Error(
      e instanceof Error && /quota/i.test(e.message)
        ? 'There is not enough room in this browser for that film. Use a YouTube link instead.'
        : 'That film could not be stored in this browser.',
    );
  }
  const old = urls.get(id);
  if (old) URL.revokeObjectURL(old);
  urls.set(id, URL.createObjectURL(file));
  films = { ...films, [id]: meta };
  notify();
  return meta;
}

export async function removeFilm(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id));
  const old = urls.get(id);
  if (old) URL.revokeObjectURL(old);
  urls.delete(id);
  const next = { ...films };
  delete next[id];
  films = next;
  notify();
}

export async function clearFilms(): Promise<void> {
  await tx('readwrite', (s) => s.clear());
  for (const url of urls.values()) URL.revokeObjectURL(url);
  urls.clear();
  films = {};
  notify();
}

/** Roughly how much room this browser will give, for the meter. */
export async function storageEstimate(): Promise<{ used: number; quota: number } | null> {
  try {
    const e = await navigator.storage?.estimate?.();
    if (!e || e.quota == null) return null;
    return { used: e.usage ?? 0, quota: e.quota };
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------------------
   Hosted links — small enough for local storage, and the sensible default
   ------------------------------------------------------------------------ */

let links: Record<string, FilmLink> = {};
let linksLoaded = false;

function readLinks(): Record<string, FilmLink> {
  if (linksLoaded) return links;
  linksLoaded = true;
  try {
    const raw = window.localStorage.getItem(LINKS_KEY);
    links = raw ? (JSON.parse(raw) as Record<string, FilmLink>) : {};
  } catch {
    links = {};
  }
  return links;
}

export function useFilmLinks(): Record<string, FilmLink> {
  return useSyncExternalStore(subscribe, readLinks, readLinks);
}

/**
 * Pulls the id out of whatever someone pastes.
 *
 * People paste the whole address, the share link, the embed code, or the id on
 * its own, and all four should work — rejecting three of them teaches nobody
 * anything useful.
 */
export function parseFilmLink(input: string): FilmLink | null {
  const t = input.trim();
  if (!t) return null;

  const yt =
    t.match(/(?:youtube\.com\/(?:watch\?[^#]*\bv=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i) ??
    t.match(/^([\w-]{11})$/);
  if (yt) return { provider: 'youtube', videoId: yt[1] };


  return null;
}

export function setFilmLink(id: string, link: FilmLink | null) {
  const next = { ...readLinks() };
  if (link) next[id] = link;
  else delete next[id];
  links = next;
  linksLoaded = true;
  try {
    window.localStorage.setItem(LINKS_KEY, JSON.stringify(next));
  } catch {
    /* A link is a convenience; losing it is not worth an error. */
  }
  notify();
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/** What the viewer should play for a portfolio item, if anything was added. */
export function useFilmSource(id: string): { kind: 'file' | 'youtube'; src: string } | null {
  const stored = useFilms();
  const linked = useFilmLinks();
  const [, force] = useState(0);

  // An object URL is created outside React, so nudge once after hydration.
  useEffect(() => {
    void hydrate().then(() => force((n) => n + 1));
  }, []);

  if (stored[id]) {
    const url = filmUrl(id);
    if (url) return { kind: 'file', src: url };
  }
  const link = linked[id];
  if (link) return { kind: link.provider, src: link.videoId };
  return null;
}
