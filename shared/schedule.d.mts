/* Types for `schedule.mjs`. */

export interface Slot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface BookedWindow {
  date: string;
  time: string;
  minutes: number;
}

export interface HourRange {
  start: string;
  end: string;
}

export const TIMEZONE: string;
export const WORKING_HOURS: Record<number, HourRange[] | null>;
export const SLOT_STEP_MINUTES: number;
export const BUFFER_MINUTES: number;
export const LEAD_TIME_HOURS: number;
export const BOOKING_HORIZON_DAYS: number;
export const BLOCKED_DATES: string[];

export function isoDate(d: Date): string;
export function fromIso(iso: string): Date;
export function toMinutes(hhmm: string): number;
export function toTime(mins: number): string;
export function formatTime(hhmm: string): string;
export function formatDate(iso: string): string;
export function isBlocked(iso: string): boolean;
export function slotsFor(iso: string, minutes: number, booked?: BookedWindow[], now?: Date): Slot[];
export function hasAvailability(iso: string, minutes: number, booked?: BookedWindow[], now?: Date): boolean;
export function slotIsBookable(
  iso: string,
  time: string,
  minutes: number,
  booked?: BookedWindow[],
  now?: Date,
): { ok: boolean; reason: string | null };
export function bookingWindow(now?: Date): { fromIso: string; toIso: string };
export function workingDaysSummary(): { day: string; hours: string }[];
