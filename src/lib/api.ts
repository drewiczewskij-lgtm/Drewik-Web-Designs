import { API_BASE, isLive } from '@/config/integrations';
import type { QuoteResult } from '@shared/catalog.mjs';

/* ============================================================================
   THE CLIENT
   ----------------------------------------------------------------------------
   Every call the browser makes to the booking server. Two rules hold here:

   1. THE BROWSER NEVER STATES A PRICE TO THE SERVER. It sends the selections —
      package, add-ons, size, miles — and the server works out the total from
      the same catalogue and charges that. A total in a request body is an
      invitation to edit it, and this site never sends one.

   2. THE SLOT IS CHECKED AT THE MOMENT OF BOOKING, not when it was picked.
      Two people can have the same time on screen. Only the one whose request
      arrives first gets it; the other is told, and offered the day again.

   With no server configured every call below resolves in demonstration mode
   and says so in its result, so the interface can be honest about it.
   ========================================================================= */

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  propertyType: string;
  squareFeet: string;
  notes: string;
}

export interface BookingRequest {
  packageId: string;
  addonIds: string[];
  sizeTierId: string;
  miles: number;
  date: string;
  time: string;
  customer: CustomerDetails;
}

export interface BookingResponse {
  ok: boolean;
  /** The human reference — 'KM-8F3A2B'. Shown on the confirmation. */
  reference?: string;
  /** Where to send the customer to pay. Absent in demonstration mode. */
  checkoutUrl?: string;
  quote?: QuoteResult;
  /** Set when the server rejected the request. Written to be shown as-is. */
  error?: string;
  /** True when nothing actually happened and the UI must say so. */
  demo?: boolean;
}

export interface AvailabilityResponse {
  ok: boolean;
  /** Windows already taken, which the calendar subtracts. */
  booked: { date: string; time: string; minutes: number }[];
  demo?: boolean;
  error?: string;
}

const TIMEOUT_MS = 12000;

async function post<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) {
      throw new Error(data.error || `The server returned ${res.status}.`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function get<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) throw new Error(data.error || `The server returned ${res.status}.`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Which windows are already taken, so the calendar can grey them out.
 * A failure here is not fatal: the calendar falls back to what this browser
 * knows about, and the booking request re-checks properly anyway.
 */
export async function fetchAvailability(from: string, to: string): Promise<AvailabilityResponse> {
  if (!isLive()) return { ok: true, booked: [], demo: true };
  try {
    return await get<AvailabilityResponse>(
      `/availability?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
  } catch (e) {
    return {
      ok: false,
      booked: [],
      error: e instanceof Error ? e.message : 'Could not reach the booking server.',
    };
  }
}

/**
 * Holds the slot and opens a payment session.
 *
 * The server re-prices the request, re-checks the slot, writes a PENDING
 * booking and hands back a Stripe Checkout URL. The booking only becomes
 * CONFIRMED when Stripe's webhook says the payment succeeded — so an abandoned
 * checkout releases the time instead of silently blocking the diary.
 */
export async function createBooking(request: BookingRequest): Promise<BookingResponse> {
  if (!isLive()) {
    return {
      ok: true,
      demo: true,
      reference: demoReference(),
    };
  }
  try {
    return await post<BookingResponse>('/bookings', request);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not reach the booking server.' };
  }
}

/** Reads a booking back after Stripe returns the customer to the site. */
export async function fetchBooking(reference: string): Promise<BookingResponse> {
  if (!isLive()) return { ok: true, demo: true, reference };
  try {
    return await get<BookingResponse>(`/bookings/${encodeURIComponent(reference)}`);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not load that booking.' };
  }
}

/** A reference that looks like the real thing, for demonstration mode. */
export function demoReference(): string {
  const s = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `KM-${s}`;
}

/* ---------------------------------------------------------------------------
   Enquiry forms. Same shape, same honesty: when nothing is configured the
   caller is told, and the UI hands over a phone number instead.
   ------------------------------------------------------------------------ */

export async function sendEnquiry(
  endpoint: string,
  payload: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { ok: false, error: `The form service returned ${res.status}.` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not reach the form service. Please call or email instead.' };
  }
}
