import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { FEATURED, PROPERTIES, type Property } from '@/data/properties';
import { AGENTS } from '@/data/site';

/* ============================================================================
   THE PRIVATE OFFICE
   ----------------------------------------------------------------------------
   Three things a buyer actually does before a viewing: book the time, put a
   deposit against the property, and talk to the broker. They share one panel,
   one piece of state, and one record of what has already happened.

   Everything persists to this browser only. Nothing is transmitted.
   ========================================================================= */

export type Desk = 'booking' | 'reserve' | 'messages' | null;

export interface Booking {
  id: string;
  slug: string;
  /** ISO date, no time component. */
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  party: string;
  createdAt: number;
}

export interface Reservation {
  id: string;
  slug: string;
  amount: number;
  last4: string;
  createdAt: number;
}

export interface Message {
  id: string;
  from: 'you' | 'agent';
  body: string;
  at: number;
}

interface OfficeValue {
  desk: Desk;
  property: Property;
  open: (desk: Exclude<Desk, null>, property?: Property) => void;
  close: () => void;
  setProperty: (p: Property) => void;

  bookings: Booking[];
  addBooking: (b: Omit<Booking, 'id' | 'createdAt'>) => Booking;

  reservations: Reservation[];
  addReservation: (r: Omit<Reservation, 'id' | 'createdAt'>) => Reservation;

  messages: Message[];
  send: (body: string) => void;
  agentTyping: boolean;
  unread: number;
  markRead: () => void;
}

const OfficeContext = createContext<OfficeValue | null>(null);

const KEY = 'arcadia.office.v1';

interface Stored {
  bookings: Booking[];
  reservations: Reservation[];
  messages: Message[];
}

function load(): Stored {
  const empty: Stored = { bookings: [], reservations: [], messages: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      bookings: parsed.bookings ?? [],
      reservations: parsed.reservations ?? [],
      messages: parsed.messages ?? [],
    };
  } catch {
    // Private windows, blocked storage, a corrupted value — all the same to us.
    return empty;
  }
}

function save(value: Stored) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* Storage is a convenience here, never a requirement. */
  }
}

const id = () => Math.random().toString(36).slice(2, 10);

/** What Elena says back. Keyed off what you asked her. */
function reply(body: string, property: Property): string {
  const t = body.toLowerCase();
  if (/price|offer|negotiat|discount|below/.test(t)) {
    return `The guide on ${property.name} is ${property.priceDisplay}. The seller has seen one offer and did not move on it, so I would not come in soft. Tell me your ceiling and I will tell you honestly whether it is worth writing.`;
  }
  if (/view|visit|see it|tour|walk|appointment|book/.test(t)) {
    return `I can open ${property.name} most weekday afternoons and Saturday mornings. Use the booking panel and take whichever slot suits — it comes straight to me, not to an assistant.`;
  }
  if (/deposit|reserve|hold|secure/.test(t)) {
    return `A reservation deposit takes it off the open market for fourteen days while your solicitor reads the pack. It is fully refundable in that window. The panel will walk you through it.`;
  }
  if (/survey|structur|condition|report|inspect/.test(t)) {
    return `There is a current structural report and a geotechnical study on the bluff, both from this year. I will send the pack over as soon as you tell me you are serious — it is not something I circulate.`;
  }
  if (/school|neighbour|neighbor|area|commute|quiet/.test(t)) {
    return property.neighborhood;
  }
  if (/architect|design|who built|built by/.test(t)) {
    return `${property.architect}, completed ${property.year}. I represented two of their earlier houses, so I can tell you what holds up after five years and what does not.`;
  }
  return `Understood — I have made a note against ${property.name}. Give me until the morning and I will come back with something useful rather than something quick.`;
}

export function OfficeProvider({ children }: { children: ReactNode }) {
  const [desk, setDesk] = useState<Desk>(null);
  const [property, setProperty] = useState<Property>(FEATURED);
  const [store, setStore] = useState<Stored>(() =>
    typeof window === 'undefined'
      ? { bookings: [], reservations: [], messages: [] }
      : load(),
  );
  const [agentTyping, setAgentTyping] = useState(false);
  const [readAt, setReadAt] = useState(() => Date.now());

  useEffect(() => {
    save(store);
  }, [store]);

  const open = useCallback((next: Exclude<Desk, null>, p?: Property) => {
    if (p) setProperty(p);
    setDesk(next);
  }, []);

  const close = useCallback(() => setDesk(null), []);

  const addBooking = useCallback((b: Omit<Booking, 'id' | 'createdAt'>) => {
    const full: Booking = { ...b, id: id().toUpperCase(), createdAt: Date.now() };
    setStore((s) => ({ ...s, bookings: [full, ...s.bookings] }));
    return full;
  }, []);

  const addReservation = useCallback((r: Omit<Reservation, 'id' | 'createdAt'>) => {
    const full: Reservation = { ...r, id: id().toUpperCase(), createdAt: Date.now() };
    setStore((s) => ({ ...s, reservations: [full, ...s.reservations] }));
    return full;
  }, []);

  const send = useCallback(
    (body: string) => {
      const mine: Message = { id: id(), from: 'you', body, at: Date.now() };
      setStore((s) => ({ ...s, messages: [...s.messages, mine] }));
      setAgentTyping(true);
      const text = reply(body, property);
      // Long enough to read as a person, short enough not to feel stalled.
      window.setTimeout(
        () => {
          setStore((s) => ({
            ...s,
            messages: [...s.messages, { id: id(), from: 'agent', body: text, at: Date.now() }],
          }));
          setAgentTyping(false);
        },
        1100 + Math.min(text.length * 9, 1600),
      );
    },
    [property],
  );

  const markRead = useCallback(() => setReadAt(Date.now()), []);

  const unread = useMemo(
    () => store.messages.filter((m) => m.from === 'agent' && m.at > readAt).length,
    [store.messages, readAt],
  );

  const value = useMemo<OfficeValue>(
    () => ({
      desk,
      property,
      open,
      close,
      setProperty,
      bookings: store.bookings,
      addBooking,
      reservations: store.reservations,
      addReservation,
      messages: store.messages,
      send,
      agentTyping,
      unread,
      markRead,
    }),
    [desk, property, open, close, store, addBooking, addReservation, send, agentTyping, unread, markRead],
  );

  return <OfficeContext.Provider value={value}>{children}</OfficeContext.Provider>;
}

export function useOffice(): OfficeValue {
  const ctx = useContext(OfficeContext);
  if (!ctx) throw new Error('useOffice must be used inside OfficeProvider');
  return ctx;
}

/* ---------------------------------------------------------------------------
   Availability
   A broker's diary, derived rather than stored: weekday afternoons and
   Saturday mornings, with the slots a busy week would already have gone.
   ------------------------------------------------------------------------ */

export const SLOT_MINUTES = 45;

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Stable pseudo-random from a date + property, so the diary never reshuffles. */
function seeded(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export function slotsFor(slug: string, date: Date): { time: string; taken: boolean }[] {
  const day = date.getDay();
  if (day === 0) return []; // The office does not open on Sundays.
  const times =
    day === 6
      ? ['09:00', '09:45', '10:30', '11:15', '12:00']
      : ['13:00', '13:45', '14:30', '15:15', '16:00', '16:45'];
  const key = isoDate(date);
  return times.map((time) => ({
    time,
    taken: seeded(`${slug}|${key}|${time}`) < 0.34,
  }));
}

export function hasAvailability(slug: string, date: Date): boolean {
  return slotsFor(slug, date).some((s) => !s.taken);
}

/** Reservation deposit: one per cent of the guide, refundable for fourteen days. */
export function depositFor(p: Property): number {
  return Math.round(p.price * 0.01);
}

export function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function agentFor(p: Property) {
  return AGENTS[p.agent];
}

export const ALL_PROPERTIES = PROPERTIES;
