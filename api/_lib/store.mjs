import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

/* ============================================================================
   THE BOOKING STORE
   ----------------------------------------------------------------------------
   A JSON file, written atomically, guarded by an in-process lock.

   That is genuinely enough for one photographer taking a handful of bookings a
   day, and it means the site runs with no database to provision or pay for.
   It is NOT enough for more than one server process, because the lock is only
   held inside this one. When you outgrow it, replace the four functions at the
   bottom — `all`, `add`, `update`, `find` — with queries against a real
   database. Nothing else in `api/` reaches into the file.

   ── BOOKING STATES ────────────────────────────────────────────────────────
     pending    written before the customer is sent to Stripe. HOLDS THE SLOT.
     confirmed  Stripe's webhook said the payment succeeded.
     expired    pending for too long without payment. Releases the slot.
     cancelled  cancelled by you, from the admin view or by hand.
   ========================================================================= */

const DATA_PATH = resolve(process.env.KM_DATA_FILE ?? './data/bookings.json');

/** How long an unpaid hold survives. Long enough to finish a checkout. */
export const PENDING_TTL_MS = 30 * 60 * 1000;

let lock = Promise.resolve();

/** Serialises writes within this process so two requests cannot interleave. */
function withLock(fn) {
  const run = lock.then(fn, fn);
  // Keep the chain alive even when a caller rejects.
  lock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function load() {
  try {
    const raw = await readFile(DATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.bookings) ? parsed.bookings : [];
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    // A corrupted file must not be silently replaced with an empty one — that
    // would erase the diary. Fail loudly instead.
    throw new Error(`Could not read ${DATA_PATH}: ${e.message}`);
  }
}

async function persist(bookings) {
  await mkdir(dirname(DATA_PATH), { recursive: true });
  const tmp = `${DATA_PATH}.${process.pid}.tmp`;
  // Write then rename: a crash mid-write leaves the old file intact rather
  // than a half-written one.
  await writeFile(tmp, JSON.stringify({ bookings }, null, 2), 'utf8');
  await rename(tmp, DATA_PATH);
}

/** Marks stale holds expired. Called on every read, so it needs no scheduler. */
function sweep(bookings, now = Date.now()) {
  let changed = false;
  for (const b of bookings) {
    if (b.status === 'pending' && now - b.createdAt > PENDING_TTL_MS) {
      b.status = 'expired';
      changed = true;
    }
  }
  return changed;
}

/* ---------------------------------------------------------------------------
   The four functions the rest of the server is allowed to use.
   ------------------------------------------------------------------------ */

export async function all() {
  return withLock(async () => {
    const bookings = await load();
    if (sweep(bookings)) await persist(bookings);
    return bookings;
  });
}

/**
 * Writes a booking, but only if `guard` still approves once the lock is held.
 * The guard is where double-booking is actually prevented: it runs against the
 * committed list, inside the lock, immediately before the write.
 */
export async function add(booking, guard) {
  return withLock(async () => {
    const bookings = await load();
    sweep(bookings);
    if (guard) {
      const verdict = guard(bookings);
      if (!verdict.ok) return { ok: false, error: verdict.reason };
    }
    bookings.push(booking);
    await persist(bookings);
    return { ok: true, booking };
  });
}

export async function update(reference, patch) {
  return withLock(async () => {
    const bookings = await load();
    const found = bookings.find((b) => b.reference === reference);
    if (!found) return { ok: false, error: 'No booking with that reference.' };
    Object.assign(found, patch);
    await persist(bookings);
    return { ok: true, booking: found };
  });
}

export async function find(reference) {
  const bookings = await all();
  return bookings.find((b) => b.reference === reference) ?? null;
}

/** Slots that block the calendar: everything not expired or cancelled. */
export async function occupied() {
  const bookings = await all();
  return bookings
    .filter((b) => b.status === 'pending' || b.status === 'confirmed')
    .map((b) => ({ date: b.date, time: b.time, minutes: b.minutes }));
}

/** KM-8F3A2B. Short enough to read down a phone, long enough not to collide. */
export function reference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1.
  let out = '';
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `KM-${out}`;
}
