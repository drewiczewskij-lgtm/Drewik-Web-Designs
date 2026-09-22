import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useScrollLock } from '@/lib/smoothScroll';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { EASE_UI } from '@/lib/motion';
import { cn } from '@/lib/cn';

/**
 * The full-screen overlay used by the lightbox, the video player and the
 * mobile menu.
 *
 * It does the five things an overlay has to do and that are easy to skip:
 * traps focus, locks the page behind it, closes on Escape, returns focus to
 * whatever opened it, and renders into `<body>` so no ancestor's `overflow`
 * or `transform` can clip or re-anchor it.
 *
 * It scales from 0.97, never from 0 — nothing in the world appears from nothing.
 */
export function Modal({
  open,
  onClose,
  children,
  label,
  className,
  backdropClassName,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Names the dialog for assistive technology. Required. */
  label: string;
  className?: string;
  backdropClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  useFocusTrap(ref, open, onClose);
  useScrollLock(open);

  // Guard against a server render and against the portal target vanishing.
  useEffect(() => {
    if (!open) return;
    document.documentElement.dataset.overlay = 'true';
    return () => {
      delete document.documentElement.dataset.overlay;
    };
  }, [open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE_UI }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className={cn(
              'absolute inset-0 cursor-default bg-void/92 backdrop-blur-xl',
              backdropClassName,
            )}
          />

          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={cn('relative z-10 max-h-[100svh] w-full outline-none', className)}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            // Exit is faster than entry: the customer has already decided.
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 6 }}
            transition={{ duration: reduced ? 0.15 : 0.3, ease: EASE_UI }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** The close control every overlay uses, so it is always in the same place. */
export function CloseButton({ onClose, label = 'Close' }: { onClose: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className="group grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/5 backdrop-blur-md transition-[background-color,border-color,transform] duration-200 ease-[cubic-bezier(.23,1,.32,1)] hover:border-neon/60 hover:bg-neon/12 active:scale-95"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  );
}
