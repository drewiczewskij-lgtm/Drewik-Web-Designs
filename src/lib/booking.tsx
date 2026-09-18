import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getPackage, quote, SIZE_TIERS, type QuoteResult } from '@shared/catalog.mjs';
import { bookingWindow, isoDate } from '@shared/schedule.mjs';
import {
  createBooking,
  fetchAvailability,
  fetchBooking,
  type BookingRequest,
  type CustomerDetails,
} from '@/lib/api';
import { isLive } from '@/config/integrations';

/* ============================================================================
   THE BOOKING
   ----------------------------------------------------------------------------
   One piece of state carried across nine steps, and the rules for moving
   between them. The interface renders this; it does not decide anything.

   The draft survives a reload. Someone who gets to step six, goes to check the
   square footage and comes back should not start again — that is the single
   most common way a booking is lost.
   ========================================================================= */

/*
 * Eight steps, not nine. No price is quoted on this site: every property is
 * different, so the last step sends a request and the quote comes back by
 * reply. The pricing engine in `shared/catalog.mjs` is untouched and still
 * tested — it is simply not shown to a visitor, so turning prices back on is
 * a matter of restoring the screens rather than rebuilding the arithmetic.
 */
export const STEPS = [
  { id: 'type', label: 'Shoot', title: 'What are we shooting?' },
  { id: 'package', label: 'Coverage', title: 'What coverage do you need?' },
  { id: 'extras', label: 'Extras', title: 'Add anything else you need' },
  { id: 'date', label: 'Date', title: 'Pick a date' },
  { id: 'time', label: 'Time', title: 'Pick a time' },
  { id: 'details', label: 'Details', title: 'The property, and you' },
  { id: 'review', label: 'Review', title: 'Check your request' },
  { id: 'send', label: 'Send', title: 'Send your request' },
  { id: 'confirmed', label: 'Done', title: 'Request sent' },
] as const;

export type StepId = (typeof STEPS)[number]['id'];
export const stepIndex = (id: StepId) => STEPS.findIndex((s) => s.id === id);

export type ShootType = 'real-estate' | 'commercial' | null;

export interface Draft {
  shootType: ShootType;
  packageId: string | null;
  addonIds: string[];
  sizeTierId: string;
  miles: number;
  date: string | null;
  time: string | null;
  customer: CustomerDetails;
}

const EMPTY_CUSTOMER: CustomerDetails = {
  name: '',
  email: '',
  phone: '',
  address: '',
  propertyType: '',
  squareFeet: '',
  notes: '',
};

const EMPTY_DRAFT: Draft = {
  shootType: null,
  packageId: null,
  addonIds: [],
  sizeTierId: SIZE_TIERS[0].id,
  miles: 0,
  date: null,
  time: null,
  customer: EMPTY_CUSTOMER,
};

export interface CompletedBooking {
  reference: string;
  packageId: string;
  addonIds: string[];
  sizeTierId: string;
  date: string;
  time: string;
  minutes: number;
  totalCents: number;
  customer: CustomerDetails;
  createdAt: number;
  /** False when this was made in demonstration mode and no money moved. */
  paid: boolean;
}

/**
 * What the confirmation screen renders.
 *
 * It comes from one of two places, and they do NOT carry the same fields. A
 * booking made in this browser has everything. One read back from the server
 * after Stripe returns the customer has only what a receipt needs — the server
 * deliberately does not hand out the address or phone number for a six-character
 * reference anybody could guess.
 */
export interface ConfirmedView {
  reference: string;
  date: string;
  time: string;
  packageName: string;
  totalCents: number;
  paid: boolean;
  status?: string;
  /** Present only when the booking was made in this browser. */
  address?: string;
  email?: string;
  firstName?: string;
}

export type ConfirmationStatus = 'idle' | 'loading' | 'ready' | 'missing';

interface BookingValue {
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  setCustomer: (patch: Partial<CustomerDetails>) => void;
  toggleAddon: (id: string) => void;
  reset: () => void;

  step: StepId;
  goTo: (id: StepId) => void;
  next: () => void;
  back: () => void;
  /** Why the current step is not finished, or null when it is. */
  blocker: string | null;
  /** The furthest step the draft is complete enough to reach. */
  furthest: StepId;

  /** Recomputed on every change. The server recomputes it again before charging. */
  pricing: QuoteResult | null;

  /** Windows already taken, from the server when there is one. */
  booked: { date: string; time: string; minutes: number }[];
  availabilityError: string | null;

  submit: () => Promise<void>;
  submitting: boolean;
  submitError: string | null;

  history: CompletedBooking[];
  lastBooking: CompletedBooking | null;

  /** What the confirmation step shows, whoever produced it. */
  confirmation: ConfirmedView | null;
  confirmationStatus: ConfirmationStatus;
  /** Reads a booking back by reference — the path Stripe returns customers on. */
  restoreFromReference: (reference: string) => Promise<void>;

  live: boolean;
}

const BookingContext = createContext<BookingValue | null>(null);

const DRAFT_KEY = 'km.booking.draft.v1';
const HISTORY_KEY = 'km.booking.history.v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as T) };
  } catch {
    // Private windows, blocked storage, a value from an older version.
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage is a convenience here, never a requirement. */
  }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>(() =>
    typeof window === 'undefined' ? EMPTY_DRAFT : read(DRAFT_KEY, EMPTY_DRAFT),
  );
  const [step, setStep] = useState<StepId>('type');
  const [history, setHistory] = useState<CompletedBooking[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      return raw ? (JSON.parse(raw) as CompletedBooking[]) : [];
    } catch {
      return [];
    }
  });
  const [booked, setBooked] = useState<{ date: string; time: string; minutes: number }[]>([]);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastBooking, setLastBooking] = useState<CompletedBooking | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmedView | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<ConfirmationStatus>('idle');

  /* The newest draft, readable synchronously.

     `blockerFor` is called two ways: during render, where `draft` is correct,
     and from callbacks that were created in an EARLIER render — a timeout, an
     effect, a step that advances itself. Those close over the draft as it was
     when they were made, which is one render too old, and the step refuses to
     advance on the very choice that should have unblocked it. Reading through
     a ref makes both paths see the same thing. */
  const draftRef = useRef(draft);
  draftRef.current = draft;

  /* Same reason as `draftRef`: `restoreFromReference` is called from an effect
     and must see the newest history, not the copy from the render that made it. */
  const historyRef = useRef(history);
  historyRef.current = history;

  useEffect(() => write(DRAFT_KEY, draft), [draft]);
  useEffect(() => write(HISTORY_KEY, history), [history]);

  /* Availability. Fetched once; the calendar subtracts it from the diary.
     In demonstration mode the only bookings that exist are this browser's,
     which is enough to show that double-booking is actually prevented. */
  useEffect(() => {
    let cancelled = false;
    const { fromIso, toIso } = bookingWindow();
    fetchAvailability(fromIso, toIso).then((res) => {
      if (cancelled) return;
      const local = history.map((b) => ({ date: b.date, time: b.time, minutes: b.minutes }));
      setBooked([...res.booked, ...local]);
      setAvailabilityError(res.error ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [history]);

  const set = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => {
      const next = { ...d, [key]: value };
      // Changing the package can invalidate a chosen time, because the shoot
      // gets longer or shorter. Dropping the time is better than booking a
      // slot that no longer fits.
      if (key === 'packageId' && value !== d.packageId) {
        next.addonIds = [];
        next.time = null;
      }
      if (key === 'sizeTierId' && value !== d.sizeTierId) next.time = null;
      if (key === 'date') next.time = null;
      return next;
    });
  }, []);

  const setCustomer = useCallback((patch: Partial<CustomerDetails>) => {
    setDraft((d) => ({ ...d, customer: { ...d.customer, ...patch } }));
  }, []);

  const toggleAddon = useCallback((id: string) => {
    setDraft((d) => ({
      ...d,
      addonIds: d.addonIds.includes(id) ? d.addonIds.filter((a) => a !== id) : [...d.addonIds, id],
      // An add-on changes the length of the shoot, so the slot must be re-picked.
      time: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    setStep('type');
    setSubmitError(null);
    setConfirmation(null);
    setConfirmationStatus('idle');
  }, []);

  const pricing = useMemo<QuoteResult | null>(() => {
    if (!draft.packageId) return null;
    return quote({
      packageId: draft.packageId,
      addonIds: draft.addonIds,
      sizeTierId: draft.sizeTierId,
      miles: draft.miles,
    });
  }, [draft.packageId, draft.addonIds, draft.sizeTierId, draft.miles]);

  /* What stops each step from completing. Returned as a sentence, because the
     interface shows it to the customer rather than just disabling a button. */
  const blockerFor = useCallback(
    (id: StepId): string | null => {
      const current = draftRef.current;
      const c = current.customer;
      switch (id) {
        case 'type':
          return current.shootType ? null : 'Choose what you are shooting.';
        case 'package':
          return current.packageId ? null : 'Choose a package to continue.';
        case 'extras':
          return null; // Add-ons are optional, and a size tier always has a value.
        case 'date':
          return current.date ? null : 'Choose a date.';
        case 'time':
          return current.time ? null : 'Choose a start time.';
        case 'details':
          if (!c.name.trim()) return 'Enter your name.';
          if (!c.email.trim()) return 'Enter an email address for your confirmation.';
          if (!c.phone.trim()) return 'Enter a phone number.';
          if (!c.address.trim()) return 'Enter the property address.';
          return null;
        default:
          return null;
      }
    },
    // Reads `draftRef`, not `draft` — but `draft` stays in the dependency list
    // on purpose. It gives this callback a new identity whenever the draft
    // changes, which is what makes `blocker` and `furthest` below recompute.
    [draft],
  );

  const blocker = blockerFor(step);

  /** The furthest step reachable. Guards direct clicks on the progress bar. */
  const furthest = useMemo<StepId>(() => {
    for (const s of STEPS) {
      if (s.id === 'confirmed') break;
      if (blockerFor(s.id)) return s.id;
    }
    return 'send';
  }, [blockerFor]);

  const goTo = useCallback(
    (id: StepId) => {
      // Never let the progress bar jump past an incomplete step.
      const target = stepIndex(id) > stepIndex(furthest) ? furthest : id;
      setStep(target);
      setSubmitError(null);
    },
    [furthest],
  );

  const next = useCallback(() => {
    if (blockerFor(step)) return;
    const i = stepIndex(step);
    const nextStep = STEPS[Math.min(i + 1, STEPS.length - 1)].id;
    setStep(nextStep);
  }, [step, blockerFor]);

  const back = useCallback(() => {
    const i = stepIndex(step);
    setStep(STEPS[Math.max(i - 1, 0)].id);
    setSubmitError(null);
  }, [step]);

  /**
   * Hands the booking to the server, which re-prices it, re-checks the slot
   * and opens a Stripe Checkout session. On success the browser leaves for
   * Stripe; it does not stay here pretending to take a card.
   */
  const submit = useCallback(async () => {
    if (!draft.packageId || !draft.date || !draft.time || !pricing?.ok) {
      setSubmitError('Something is missing from the order. Go back and check each step.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    const request: BookingRequest = {
      packageId: draft.packageId,
      addonIds: draft.addonIds,
      sizeTierId: draft.sizeTierId,
      miles: draft.miles,
      date: draft.date,
      time: draft.time,
      customer: draft.customer,
    };

    const result = await createBooking(request);

    if (!result.ok || !result.reference) {
      setSubmitting(false);
      setSubmitError(result.error ?? 'The booking could not be completed. Please try again.');
      return;
    }

    const completed: CompletedBooking = {
      reference: result.reference,
      packageId: draft.packageId,
      addonIds: draft.addonIds,
      sizeTierId: draft.sizeTierId,
      date: draft.date,
      time: draft.time,
      minutes: pricing.minutes,
      totalCents: result.quote?.totalCents ?? pricing.totalCents,
      customer: draft.customer,
      createdAt: Date.now(),
      paid: !result.demo,
    };

    setHistory((h) => [completed, ...h]);
    setLastBooking(completed);
    setConfirmation(toView(completed));
    setConfirmationStatus('ready');

    if (result.checkoutUrl) {
      // Live: the customer leaves for Stripe's hosted checkout. The booking is
      // PENDING until Stripe's webhook confirms the payment.
      window.location.assign(result.checkoutUrl);
      return;
    }

    // Demonstration: there is nowhere to send them, so show the confirmation —
    // which states plainly that no payment was taken.
    setSubmitting(false);
    setStep('confirmed');
  }, [draft, pricing]);

  /**
   * Shows the confirmation for a reference in the URL.
   *
   * This is what Stripe returns the customer to after paying, and getting it
   * wrong is expensive: without it they come back from a successful payment to
   * an empty step one, with no receipt and no reason to believe it worked.
   *
   * The local record shows instantly when this is the same browser. The server
   * is asked either way, because only it knows whether the payment actually
   * cleared — a local record is written before the customer ever reaches
   * Stripe, so on its own it cannot tell paid from abandoned.
   */
  const restoreFromReference = useCallback(
    async (reference: string) => {
      const ref = reference.trim().toUpperCase();
      if (!ref) return;

      setStep('confirmed');
      setConfirmationStatus('loading');

      const local = historyRef.current.find((b) => b.reference === ref);
      if (local) setConfirmation(toView(local));

      const result = await fetchBooking(ref);

      /* Demonstration mode answers every reference with "ok" because there is
         no server to disagree with. Without a local record to back it that is
         an empty receipt, so treat it as not found rather than render blanks. */
      if (result.demo && !local) {
        setConfirmationStatus('missing');
        return;
      }

      if (result.ok && result.reference && !result.demo) {
        const remote = result as unknown as {
          reference: string;
          status?: string;
          date?: string;
          time?: string;
          packageName?: string;
          totalCents?: number;
          paid?: boolean;
          customerFirstName?: string;
        };
        setConfirmation({
          reference: remote.reference,
          // The server is the authority on everything it returns; the local
          // record only fills the gaps it deliberately withholds.
          date: remote.date ?? local?.date ?? '',
          time: remote.time ?? local?.time ?? '',
          packageName:
            remote.packageName ??
            (local ? getPackage(local.packageId)?.name ?? local.packageId : ''),
          totalCents: remote.totalCents ?? local?.totalCents ?? 0,
          paid: remote.paid ?? local?.paid ?? false,
          status: remote.status,
          firstName: remote.customerFirstName || local?.customer.name.split(' ')[0],
          address: local?.customer.address,
          email: local?.customer.email,
        });
        setConfirmationStatus('ready');
        // The booking is done, so the part-finished draft behind it is stale.
        setDraft(EMPTY_DRAFT);
        return;
      }

      // Demonstration mode, with the local record to show.
      if (local) {
        setConfirmationStatus('ready');
        setDraft(EMPTY_DRAFT);
        return;
      }

      setConfirmationStatus('missing');
    },
    [],
  );

  const value = useMemo<BookingValue>(
    () => ({
      draft,
      set,
      setCustomer,
      toggleAddon,
      reset,
      step,
      goTo,
      next,
      back,
      blocker,
      furthest,
      pricing,
      booked,
      availabilityError,
      submit,
      submitting,
      submitError,
      history,
      lastBooking,
      confirmation,
      confirmationStatus,
      restoreFromReference,
      live: isLive(),
    }),
    [
      draft, set, setCustomer, toggleAddon, reset, step, goTo, next, back, blocker,
      furthest, pricing, booked, availabilityError, submit, submitting, submitError,
      history, lastBooking, confirmation, confirmationStatus, restoreFromReference,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}

/** A booking made in this browser, as the confirmation screen wants it. */
function toView(b: CompletedBooking): ConfirmedView {
  return {
    reference: b.reference,
    date: b.date,
    time: b.time,
    packageName: getPackage(b.packageId)?.name ?? b.packageId,
    totalCents: b.totalCents,
    paid: b.paid,
    address: b.customer.address,
    email: b.customer.email,
    firstName: b.customer.name.split(' ')[0],
  };
}

/** Today, for the calendar's initial month. */
export const today = () => isoDate(new Date());
