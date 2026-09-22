import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BOOKING_HORIZON_DAYS,
  fromIso,
  hasAvailability,
  isBlocked,
  isoDate,
  type BookedWindow,
} from '@shared/schedule.mjs';
import { EASE_UI } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

/* ============================================================================
   THE CALENDAR
   ----------------------------------------------------------------------------
   A month grid that only offers days it can actually honour. A day is open
   only if a shoot of THIS length still fits in it, around everything already
   booked — so a four-hour Premium shoot shows fewer open days than a
   ninety-minute photo set, which is correct and is what stops the
   disappointment of choosing a date and finding no times behind it.

   It is a grid of buttons, not a table of links: arrow keys move by day, up
   and down move by week, Home and End reach the ends of the row. That is the
   pattern people already know from every other date picker.
   ========================================================================= */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar({
  value,
  onChange,
  minutes,
  booked,
}: {
  value: string | null;
  onChange: (iso: string) => void;
  /** How long the shoot runs. Drives which days can be offered at all. */
  minutes: number;
  booked: BookedWindow[];
}) {
  const reduced = usePrefersReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  const now = useMemo(() => new Date(), []);
  const horizon = useMemo(
    () => new Date(now.getTime() + BOOKING_HORIZON_DAYS * 86400000),
    [now],
  );

  // The month on screen. Starts on the selected date's month, or this one.
  const [cursor, setCursor] = useState(() => {
    const base = value ? fromIso(value) : now;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [direction, setDirection] = useState(1);

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const total = new Date(year, month + 1, 0).getDate();

    const cells: ({ iso: string; day: number; open: boolean; reason: string } | null)[] = [];
    // Blank cells so the first of the month lands under the right weekday.
    for (let i = 0; i < first.getDay(); i++) cells.push(null);

    for (let d = 1; d <= total; d++) {
      const date = new Date(year, month, d);
      const iso = isoDate(date);
      let open = true;
      let reason = '';

      if (date > horizon) {
        open = false;
        reason = 'Beyond the booking window';
      } else if (isBlocked(iso)) {
        open = false;
        reason = 'Unavailable';
      } else if (!hasAvailability(iso, minutes, booked, now)) {
        open = false;
        // Past days and fully-booked days read differently, and should.
        reason =
          date < new Date(now.getFullYear(), now.getMonth(), now.getDate())
            ? 'Past'
            : 'Fully booked';
      }

      cells.push({ iso, day: d, open, reason });
    }
    return cells;
  }, [cursor, minutes, booked, now, horizon]);

  const openCount = days.filter((d) => d?.open).length;

  const canGoBack =
    cursor > new Date(now.getFullYear(), now.getMonth(), 1);
  const canGoForward =
    cursor < new Date(horizon.getFullYear(), horizon.getMonth(), 1);

  const move = (delta: number) => {
    setDirection(delta);
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  };

  /** Arrow keys walk the grid. Focus follows, selection does not. */
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const deltas: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 7,
      ArrowUp: -7,
    };
    const delta = deltas[e.key];
    if (delta === undefined) return;
    e.preventDefault();

    const buttons = Array.from(
      gridRef.current?.querySelectorAll<HTMLButtonElement>('button[data-day]') ?? [],
    );
    const current = buttons.findIndex((b) => Number(b.dataset.index) === index);
    const target = buttons[current + delta];
    if (target) target.focus();
  };

  return (
    <div className="glass edge relative overflow-hidden p-5 sm:p-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <MonthButton
          direction="prev"
          onClick={() => move(-1)}
          disabled={!canGoBack}
          label="Previous month"
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.h3
            key={cursor.toISOString()}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: direction * 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: direction * -8 }}
            transition={{ duration: 0.2, ease: EASE_UI }}
            className="font-display text-[17px] font-semibold tracking-tight text-bright"
          >
            {cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </motion.h3>
        </AnimatePresence>

        <MonthButton
          direction="next"
          onClick={() => move(1)}
          disabled={!canGoForward}
          label="Next month"
        />
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center font-mono text-[9.5px] tracking-[0.14em] text-faint uppercase"
            aria-hidden="true"
          >
            {d.slice(0, 1)}
          </div>
        ))}
      </div>

      <div ref={gridRef} className="grid grid-cols-7 gap-1" role="group" aria-label="Choose a date">
        {days.map((cell, i) => {
          if (!cell) return <div key={`blank-${i}`} aria-hidden="true" />;
          const selected = value === cell.iso;
          const isToday = cell.iso === isoDate(now);

          return (
            <button
              key={cell.iso}
              type="button"
              data-day
              data-index={i}
              disabled={!cell.open}
              aria-pressed={selected}
              aria-label={`${fromIso(cell.iso).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}${cell.open ? '' : ` — ${cell.reason}`}`}
              onClick={() => cell.open && onChange(cell.iso)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                'relative grid aspect-square place-items-center rounded-[3px] font-mono text-[12.5px] transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(.23,1,.32,1)]',
                cell.open
                  ? 'text-body hover:bg-white/6 hover:text-bright active:scale-95'
                  : 'cursor-not-allowed text-faint/45 line-through decoration-faint/40',
                selected && 'bg-neon text-white hover:bg-neon',
              )}
              style={
                selected
                  ? { boxShadow: '0 0 0 1px rgb(120 175 255 / 0.6), 0 0 26px -6px rgb(45 125 255)' }
                  : undefined
              }
            >
              {cell.day}

              {/* Availability dot. Nothing on a closed day, nothing under a
                  selected one — the fill already says everything. */}
              {cell.open && !selected && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1.5 h-[3px] w-[3px] rounded-full bg-cyan/70"
                />
              )}
              {isToday && !selected && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[3px] border border-white/14"
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-[12px] text-faint">
        <span className="flex items-center gap-2">
          <span className="h-[3px] w-[3px] rounded-full bg-cyan/70" aria-hidden="true" />
          Available
        </span>
        <span aria-live="polite">
          {openCount === 0
            ? 'No dates open this month for a shoot this long.'
            : `${openCount} ${openCount === 1 ? 'date' : 'dates'} open this month.`}
        </span>
      </p>
    </div>
  );
}

function MonthButton({
  direction,
  onClick,
  disabled,
  label,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="grid h-9 w-9 place-items-center rounded-full border border-line transition-[border-color,background-color,transform,opacity] duration-200 ease-[cubic-bezier(.23,1,.32,1)] hover:border-neon/50 hover:bg-neon/10 active:scale-95 disabled:pointer-events-none disabled:opacity-25"
    >
      <span className="sr-only">{label}</span>
      <svg
        width="7"
        height="12"
        viewBox="0 0 9 15"
        fill="none"
        aria-hidden="true"
        style={{ transform: direction === 'prev' ? 'rotate(180deg)' : undefined }}
      >
        <path d="M1 1L7.5 7.5L1 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    </button>
  );
}
