import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useScrollLock } from '@/lib/smoothScroll';
import { useFocusTrap } from '@/lib/useFocusTrap';

/* ==========================================================================
   PANEL
   A drawer from the right on a pointer, a sheet from the bottom on a thumb.
   The sheet can be thrown closed: past a third of its height, or fast enough
   that distance stops mattering.
   ======================================================================== */

const EASE_SHEET = [0.32, 0.72, 0, 1] as const;
const EASE_UI = [0.23, 1, 0.32, 1] as const;

export function Panel({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const sheet = useMediaQuery('(max-width: 767px)');
  const reduced = usePrefersReducedMotion();

  useScrollLock(open);
  useFocusTrap(ref, open, onClose);

  const enter = reduced
    ? { opacity: 1 }
    : sheet
      ? { transform: 'translateY(0%)' }
      : { transform: 'translateX(0%)' };
  const from = reduced
    ? { opacity: 0 }
    : sheet
      ? { transform: 'translateY(100%)' }
      : { transform: 'translateX(100%)' };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (!sheet) return;
    const thrown = info.velocity.y > 520;
    const far = info.offset.y > (ref.current?.offsetHeight ?? 600) * 0.32;
    if (thrown || far) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close panel"
            className="scrim fixed inset-0 z-[88]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.22, ease: EASE_UI }}
          />

          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={cn(
              'bg-paper text-ink fixed z-[89] flex flex-col shadow-[0_20px_70px_rgba(10,9,7,.35)] outline-none',
              sheet
                ? 'inset-x-0 bottom-0 h-[92svh] rounded-t-[2px]'
                : 'top-0 right-0 h-[100svh] w-[min(520px,100vw)]',
            )}
            initial={from}
            animate={enter}
            exit={from}
            transition={{
              // Enter with weight, leave briskly. The exit is the system
              // responding; it should never make anyone wait.
              duration: reduced ? 0.01 : 0.34,
              ease: EASE_SHEET,
            }}
            drag={sheet && !reduced ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={onDragEnd}
          >
            {sheet && (
              <div className="flex shrink-0 justify-center pt-3 pb-1" aria-hidden="true">
                <span className="bg-ink/20 block h-1 w-10 rounded-full" />
              </div>
            )}

            <header className="border-ink/12 flex shrink-0 items-start justify-between gap-6 border-b px-6 py-5 md:px-8">
              <div>
                <p className="t-label text-bronze mb-2">{eyebrow}</p>
                <h2 className="t-h3">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="focus-bare press text-stone-deep hover:text-ink -mt-1 -mr-1 flex items-center gap-2 p-2 transition-colors duration-200"
                aria-label="Close"
              >
                <span className="t-label">Close</span>
                <span className="relative block h-3.5 w-3.5" aria-hidden="true">
                  <span className="absolute top-1/2 left-0 h-px w-full rotate-45 bg-current" />
                  <span className="absolute top-1/2 left-0 h-px w-full -rotate-45 bg-current" />
                </span>
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-7 md:px-8">
              {children}
            </div>

            {footer && (
              <div className="border-ink/12 bg-paper shrink-0 border-t px-6 py-5 md:px-8">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* -------------------------------------------------------------------------
   The one filled button in the office. Ink block, paper text, presses in.
   ---------------------------------------------------------------------- */
export function Solid({
  children,
  onClick,
  disabled,
  type = 'button',
  busy,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  busy?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      className={cn(
        'press focus-bare bg-ink text-paper relative flex w-full items-center justify-center gap-3 px-7 py-4 transition-opacity duration-200',
        (disabled || busy) && 'pointer-events-none opacity-35',
        className,
      )}
    >
      <span
        className={cn(
          't-label transition-[filter,opacity] duration-200',
          busy && 'opacity-70 blur-[2px]',
        )}
      >
        {children}
      </span>
      {busy && (
        <span
          aria-hidden="true"
          className="border-paper/30 border-t-paper absolute right-6 h-3.5 w-3.5 animate-spin rounded-full border"
          style={{ animationDuration: '620ms' }}
        />
      )}
    </button>
  );
}

/** A choice chip — days, times, parties. */
export function Chip({
  children,
  active,
  disabled,
  onClick,
  sub,
}: {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        'press focus-bare flex flex-col items-center justify-center border px-3 py-3 transition-colors duration-200',
        disabled
          ? 'border-ink/8 text-stone cursor-not-allowed line-through'
          : active
            ? 'border-ink bg-ink text-paper'
            : 'border-ink/18 hover:border-ink/50 text-ink',
      )}
    >
      <span className="t-label t-num">{children}</span>
      {sub && <span className="t-label mt-1 opacity-55">{sub}</span>}
    </button>
  );
}
