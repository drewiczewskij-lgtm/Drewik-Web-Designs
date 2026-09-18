import { AnimatePresence, motion } from 'motion/react';
import { getPackage } from '@shared/catalog.mjs';
import { formatDate, formatTime } from '@shared/schedule.mjs';
import { useBooking } from '@/lib/booking';
import { EASE_UI } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

/* ============================================================================
   THE ORDER
   ----------------------------------------------------------------------------
   Always on screen while booking — beside the steps on a desktop, and docked
   to the bottom of the viewport on a phone. Somebody choosing add-ons should
   never have to scroll to find out what they now cost.

   Lines animate in and out as they are added and removed. The total
   crossfades rather than counting, because a price ticking upward reads as a
   slot machine and this is somebody's money.
   ========================================================================= */

export function OrderSummary({ compact = false }: { compact?: boolean }) {
  const { draft, pricing } = useBooking();
  const reduced = usePrefersReducedMotion();
  const pkg = draft.packageId ? getPackage(draft.packageId) : null;

  if (!pricing?.ok) {
    return (
      <div className={cn('glass edge p-6', compact && 'p-5')}>
        <p className="t-label mb-2">Your request</p>
        <p className="text-[13.5px] text-muted">
          Choose your coverage and it will be listed here as you go.
        </p>
      </div>
    );
  }

  const hours = Math.floor(pricing.minutes / 60);
  const mins = pricing.minutes % 60;

  return (
    <div className={cn('glass edge relative overflow-hidden', compact ? 'p-5' : 'p-6 sm:p-7')}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="t-label">Your request</p>
        {pkg && (
          <span className="font-mono text-[10.5px] tracking-[0.14em] text-neon-soft uppercase">
            {pkg.name}
          </span>
        )}
      </div>

      {/* When and where. Only once they exist. */}
      <AnimatePresence initial={false}>
        {draft.date && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: EASE_UI }}
            className="overflow-hidden"
          >
            <div className="mb-5 flex flex-col gap-1 border-b border-line pb-5">
              <p className="text-[13.5px] text-bright">{formatDate(draft.date)}</p>
              <p className="font-mono text-[12px] tracking-wide text-muted">
                {draft.time ? formatTime(draft.time) : 'Time not chosen'}
                <span className="text-faint">
                  {' '}
                  · about {hours > 0 ? `${hours}h` : ''}
                  {mins > 0 ? ` ${mins}m` : ''} on site
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="flex flex-col gap-2.5">
        <AnimatePresence initial={false} mode="popLayout">
          {pricing.lines.map((line) => (
            <motion.li
              key={`${line.kind}-${line.id}`}
              layout
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: 8 }}
              transition={{ duration: 0.22, ease: EASE_UI }}
              className="flex items-baseline justify-between gap-4 text-[13.5px]"
            >
              <span className={cn(line.kind === 'package' ? 'text-bright' : 'text-muted')}>
                {line.label}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* No total. Every property is quoted on its own, so a number here would
          be a guess — and a guess a customer has already read is worse than no
          number at all. What they get instead is the shape of the visit. */}
      <div className="mt-5 flex flex-col gap-2 border-t border-line pt-5">
        <Row label="On site" value={`about ${hours}h${mins ? ` ${mins}m` : ''}`} />
        <Row label="Price" value="quoted per property" />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="shrink-0 font-mono text-[12.5px] tabular-nums text-body">{value}</span>
    </div>
  );
}

/** The docked bar on a phone. Taps open the full summary. */
export function OrderDock({ onOpen }: { onOpen: () => void }) {
  const { draft, pricing } = useBooking();
  const pkg = draft.packageId ? getPackage(draft.packageId) : null;
  if (!pricing?.ok) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="glass-deep flex w-full items-center justify-between gap-4 border-t border-white/10 px-5 py-3.5 text-left active:scale-[0.99]"
      style={{ transition: 'transform 160ms cubic-bezier(.23,1,.32,1)' }}
    >
      <span className="flex flex-col">
        <span className="t-label text-[9.5px]">Your request</span>
        <span className="text-[15px] leading-tight text-bright">
          {pkg ? pkg.name : 'In progress'}
        </span>
      </span>
      <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
        See breakdown
        <svg width="10" height="7" viewBox="0 0 10 7" fill="none" aria-hidden="true">
          <path d="M1 6L5 2L9 6" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
    </button>
  );
}
