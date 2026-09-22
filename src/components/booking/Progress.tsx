import { motion } from 'motion/react';
import { STEPS, stepIndex, useBooking, type StepId } from '@/lib/booking';
import { EASE_UI } from '@/lib/motion';
import { cn } from '@/lib/cn';

/**
 * The progress indicator.
 *
 * Completed steps are buttons — going back to change the date is the single
 * most common thing anyone does in a booking flow, and making them click
 * "back" four times to do it is how a booking gets abandoned. Steps ahead of
 * the furthest valid one are inert, so nobody can skip into payment.
 */
export function Progress() {
  const { step, goTo, furthest } = useBooking();
  const current = stepIndex(step);
  const reach = stepIndex(furthest);

  return (
    <nav aria-label="Booking progress" className="w-full">
      {/* Wide: the full set of labelled steps. */}
      <ol className="hidden items-center gap-1 lg:flex">
        {STEPS.map((s, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo';
          const reachable = i <= reach;

          return (
            <li key={s.id} className="flex flex-1 items-center gap-1">
              <StepButton
                id={s.id}
                label={s.label}
                n={i + 1}
                state={state}
                reachable={reachable && i !== current}
                onClick={() => goTo(s.id)}
              />
              {i < STEPS.length - 1 && (
                <span className="relative h-px flex-1 bg-line" aria-hidden="true">
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-neon"
                    initial={false}
                    animate={{ width: i < current ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: EASE_UI }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Narrow: a bar, a count, and the name of where you are. */}
      <div className="lg:hidden">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="t-label">
            Step {current + 1} <span className="text-faint">of {STEPS.length}</span>
          </p>
          <p className="font-mono text-[10.5px] tracking-[0.16em] text-bright uppercase">
            {STEPS[current].label}
          </p>
        </div>
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full origin-left rounded-full"
            style={{ background: 'linear-gradient(90deg,#2d7dff,#22d3ee)' }}
            initial={false}
            animate={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: EASE_UI }}
          />
        </div>
      </div>
    </nav>
  );
}

function StepButton({
  id,
  label,
  n,
  state,
  reachable,
  onClick,
}: {
  id: StepId;
  label: string;
  n: number;
  state: 'done' | 'current' | 'todo';
  reachable: boolean;
  onClick: () => void;
}) {
  const content = (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          'grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[10px] transition-[background-color,border-color,color] duration-300',
          state === 'current' && 'border-neon bg-neon text-white',
          state === 'done' && 'border-neon/50 bg-neon/15 text-neon-soft',
          state === 'todo' && 'border-line text-faint',
        )}
        style={
          state === 'current'
            ? { boxShadow: '0 0 20px -4px rgb(45 125 255 / 0.9)' }
            : undefined
        }
      >
        {state === 'done' ? (
          <svg width="9" height="7" viewBox="0 0 10 8" fill="none" aria-hidden="true">
            <path d="M1 4L3.8 6.8L9 1" stroke="currentColor" strokeWidth="1.7" />
          </svg>
        ) : (
          n
        )}
      </span>
      <span
        className={cn(
          'font-mono text-[10px] tracking-[0.14em] uppercase transition-colors duration-300',
          state === 'current' ? 'text-bright' : state === 'done' ? 'text-body' : 'text-faint',
        )}
      >
        {label}
      </span>
    </span>
  );

  if (!reachable) {
    return (
      <span aria-current={state === 'current' ? 'step' : undefined} className="shrink-0">
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-95"
    >
      <span className="sr-only">Go back to step {n}: </span>
      {content}
      <span className="sr-only"> ({id})</span>
    </button>
  );
}
