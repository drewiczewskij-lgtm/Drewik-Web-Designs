import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar } from '../Calendar';
import { Notice } from '@/components/ui/Bits';
import { useBooking } from '@/lib/booking';
import { formatDate, formatTime, slotsFor, LEAD_TIME_HOURS } from '@shared/schedule.mjs';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { cn } from '@/lib/cn';

/* ============================================================================
   STEPS 4–5 — when
   ========================================================================= */

export function StepDate() {
  const { draft, set, pricing, booked, availabilityError } = useBooking();
  const minutes = pricing?.minutes ?? 90;

  return (
    <div className="flex flex-col gap-5">
      <Calendar
        value={draft.date}
        onChange={(iso) => set('date', iso)}
        minutes={minutes}
        booked={booked}
      />

      {availabilityError && (
        <Notice tone="warn" title="Could not load the live diary">
          {availabilityError} The dates below come from what this browser knows. Your
          slot is checked again before anything is charged, so nothing can be
          double-booked — but if the date you want looks wrong, call instead.
        </Notice>
      )}

      <p className="text-[12.5px] text-faint">
        Days are open only if a {Math.round(minutes / 30) / 2}-hour shoot still fits around
        what is already booked. We need {LEAD_TIME_HOURS} hours’ notice, and the
        diary opens three months ahead.
      </p>
    </div>
  );
}

export function StepTime() {
  const { draft, set, pricing, booked } = useBooking();
  const minutes = pricing?.minutes ?? 90;

  const slots = useMemo(() => {
    if (!draft.date) return [];
    return slotsFor(draft.date, minutes, booked);
  }, [draft.date, minutes, booked]);

  const open = slots.filter((s) => s.available);

  if (!draft.date) {
    return <p className="text-muted">Choose a date first.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[14px] text-bright">{formatDate(draft.date)}</p>
        <p className="font-mono text-[11px] tracking-[0.14em] text-faint uppercase">
          {open.length} {open.length === 1 ? 'slot' : 'slots'} open
        </p>
      </div>

      {open.length === 0 ? (
        <Notice tone="warn" title="Nothing left on this day">
          Every start time on {formatDate(draft.date)} is taken or too short for a shoot
          this long. Go back a step and pick another date — the calendar only shows
          days that can still take it.
        </Notice>
      ) : (
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {slots.map((slot, i) => {
            const selected = draft.time === slot.time;
            return (
              <motion.li
                key={slot.time}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: EASE_OUT_EXPO,
                  delay: Math.min(i * 0.025, 0.25),
                }}
              >
                <button
                  type="button"
                  disabled={!slot.available}
                  aria-pressed={selected}
                  onClick={() => set('time', slot.time)}
                  className={cn(
                    'glass edge relative flex w-full flex-col items-center gap-1 py-4 transition-[transform,border-color,box-shadow] duration-200 ease-[cubic-bezier(.23,1,.32,1)]',
                    slot.available
                      ? 'active:scale-[0.97]'
                      : 'cursor-not-allowed opacity-40',
                    selected && 'edge-on',
                  )}
                >
                  <span
                    className={cn(
                      'font-mono text-[14px] tabular-nums',
                      selected ? 'text-bright' : slot.available ? 'text-body' : 'text-faint line-through',
                    )}
                  >
                    {formatTime(slot.time)}
                  </span>
                  <span className="font-mono text-[9.5px] tracking-[0.16em] text-faint uppercase">
                    {slot.available ? (selected ? 'Selected' : 'Available') : slot.reason}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}

      {draft.time && (
        <p className="text-[12.5px] text-faint">
          Arriving at {formatTime(draft.time)} and on site for about{' '}
          {Math.floor(minutes / 60)}h{minutes % 60 ? ` ${minutes % 60}m` : ''}. You do not
          need to be there for all of it.
        </p>
      )}
    </div>
  );
}
