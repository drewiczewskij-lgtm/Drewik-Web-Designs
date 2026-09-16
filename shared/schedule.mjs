/* ============================================================================
   KM PRODUCTIONS — THE DIARY
   ----------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU EDIT TO CHANGE WHEN YOU WORK.

   Plain JavaScript, like the price list, because the browser and the booking
   server both read it. The calendar a client sees and the check the server runs
   before it takes money are the same function — so a slot cannot look free in
   one place and be taken in the other.

   Times are 24-hour, local to you. Dates are 'YYYY-MM-DD'.
   ========================================================================= */

/** Your timezone, for the record and for the calendar invite. */
export const TIMEZONE = 'America/Chicago';

/**
 * WORKING HOURS, per weekday. 0 is Sunday.
 * `null` means you do not work that day. Add a second range for a split day:
 *   1: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }]
 */
export const WORKING_HOURS = {
  0: null,                                        // Sunday — closed
  1: [{ start: '09:00', end: '17:00' }],          // Monday
  2: [{ start: '09:00', end: '17:00' }],          // Tuesday
  3: [{ start: '09:00', end: '17:00' }],          // Wednesday
  4: [{ start: '09:00', end: '17:00' }],          // Thursday
  5: [{ start: '09:00', end: '17:00' }],          // Friday
  6: [{ start: '09:00', end: '14:00' }],          // Saturday — half day
};

/** Slots are offered on this grid, in minutes. 30 gives 9:00, 9:30, 10:00… */
export const SLOT_STEP_MINUTES = 30;

/** Packing and travel between jobs. Held before AND after every booking. */
export const BUFFER_MINUTES = 30;

/** How much notice you need. 24 means nothing today or tomorrow morning. */
export const LEAD_TIME_HOURS = 24;

/** How far ahead the calendar opens. */
export const BOOKING_HORIZON_DAYS = 90;

/**
 * DAYS YOU ARE NOT AVAILABLE — holidays, travel, anything else.
 * Add a date and every slot on it disappears from the calendar immediately.
 */
export const BLOCKED_DATES = [
  '2026-11-26', // Thanksgiving
  '2026-11-27',
  '2026-12-24', // Christmas Eve
  '2026-12-25',
  '2026-12-31',
  '2027-01-01',
];

/* ---------------------------------------------------------------------------
   Date helpers. No library: these only ever deal in local civil time.
   ------------------------------------------------------------------------ */

export function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 'YYYY-MM-DD' -> a Date at local midnight. Never use `new Date(iso)` here:
    that parses as UTC and lands on the previous day west of Greenwich. */
export function fromIso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const toTime = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

/** '14:30' -> '2:30 PM' */
export function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

/** 'Thursday, 16 October 2026' */
export function formatDate(iso) {
  return fromIso(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isBlocked(iso) {
  return BLOCKED_DATES.includes(iso);
}

/* ---------------------------------------------------------------------------
   AVAILABILITY
   ------------------------------------------------------------------------ */

/**
 * Every start time on `iso` at which a shoot of `minutes` fits inside working
 * hours and clears the buffer around everything already booked.
 *
 * @param {string} iso           'YYYY-MM-DD'
 * @param {number} minutes       how long the shoot runs
 * @param {Array<{date: string, time: string, minutes: number}>} booked
 * @param {Date}   [now]         injectable, so tests are not clock-dependent
 * @returns {Array<{time: string, available: boolean, reason?: string}>}
 */
export function slotsFor(iso, minutes, booked = [], now = new Date()) {
  if (isBlocked(iso)) return [];

  const day = fromIso(iso).getDay();
  const ranges = WORKING_HOURS[day];
  if (!ranges || ranges.length === 0) return [];

  const duration = Math.max(SLOT_STEP_MINUTES, Math.round(minutes));

  // Occupied windows, already widened by the buffer on both sides.
  const taken = booked
    .filter((b) => b.date === iso)
    .map((b) => {
      const start = toMinutes(b.time);
      return { from: start - BUFFER_MINUTES, to: start + (b.minutes || 60) + BUFFER_MINUTES };
    });

  // The earliest moment we would accept, given the notice you need.
  const earliest = new Date(now.getTime() + LEAD_TIME_HOURS * 3600 * 1000);
  const dayStart = fromIso(iso);
  const isEarliestDay = isoDate(earliest) === iso;
  const earliestMinutes = isEarliestDay ? earliest.getHours() * 60 + earliest.getMinutes() : -1;
  const dayIsPast = dayStart < new Date(earliest.getFullYear(), earliest.getMonth(), earliest.getDate());

  if (dayIsPast) return [];

  const out = [];
  for (const range of ranges) {
    const open = toMinutes(range.start);
    const close = toMinutes(range.end);
    for (let start = open; start + duration <= close; start += SLOT_STEP_MINUTES) {
      const end = start + duration;
      let available = true;
      let reason;

      if (isEarliestDay && start < earliestMinutes) {
        available = false;
        reason = 'Too soon';
      } else if (taken.some((t) => start < t.to && end > t.from)) {
        available = false;
        reason = 'Booked';
      }

      out.push({ time: toTime(start), available, reason });
    }
  }
  return out;
}

/** True when at least one slot long enough is still free on that day. */
export function hasAvailability(iso, minutes, booked = [], now = new Date()) {
  return slotsFor(iso, minutes, booked, now).some((s) => s.available);
}

/**
 * The authority on whether a booking may be written. The server calls this
 * immediately before charging, which is what actually prevents double-booking:
 * two people can hold the same slot on screen, only one can pass this.
 */
export function slotIsBookable(iso, time, minutes, booked = [], now = new Date()) {
  const slot = slotsFor(iso, minutes, booked, now).find((s) => s.time === time);
  if (!slot) return { ok: false, reason: 'That start time is not offered on this day.' };
  if (!slot.available) {
    return {
      ok: false,
      reason:
        slot.reason === 'Booked'
          ? 'That time has just been taken. Please choose another.'
          : `We need ${LEAD_TIME_HOURS} hours' notice. Please choose a later time.`,
    };
  }
  return { ok: true, reason: null };
}

/** The window the calendar opens: from the first bookable day to the horizon. */
export function bookingWindow(now = new Date()) {
  const from = new Date(now.getTime() + LEAD_TIME_HOURS * 3600 * 1000);
  const to = new Date(now.getTime() + BOOKING_HORIZON_DAYS * 86400 * 1000);
  return { fromIso: isoDate(from), toIso: isoDate(to) };
}

/** A human summary of your week, for the contact and FAQ pages. */
export function workingDaysSummary() {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return Object.entries(WORKING_HOURS)
    .filter(([, ranges]) => ranges && ranges.length)
    .map(([day, ranges]) => ({
      day: names[Number(day)],
      hours: ranges.map((r) => `${formatTime(r.start)} – ${formatTime(r.end)}`).join(', '),
    }));
}
