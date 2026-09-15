import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ImageKey } from '@/data/images';
import { EASE_IN_OUT_QUART, EASE_OUT_EXPO } from '@/lib/motion';
import { useScrollLock } from '@/lib/smoothScroll';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { Figure } from './Figure';

export interface Plate {
  image: ImageKey;
  caption: string;
}

/* ==========================================================================
   LIGHTBOX
   Full-bleed, keyboard-first: ← → to move, Esc to leave. The plate cuts in the
   direction of travel; the caption and counter sit on a single baseline.
   ======================================================================== */

export function Lightbox({
  plates,
  index,
  onClose,
  onIndexChange,
  title,
}: {
  plates: Plate[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
  title: string;
}) {
  const open = index !== null;
  const ref = useRef<HTMLDivElement>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const reduced = usePrefersReducedMotion();
  const touch = useRef<number | null>(null);

  useScrollLock(open);
  useFocusTrap(ref, open, onClose);

  const move = useCallback(
    (delta: 1 | -1) => {
      if (index === null) return;
      setDir(delta);
      onIndexChange((index + delta + plates.length) % plates.length);
    },
    [index, onIndexChange, plates.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        move(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        move(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, move]);

  const plate = index !== null ? plates[index] : null;
  const enter = dir === 1 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)';
  const exit = dir === 1 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)';

  // Sections carry their own stacking contexts, so the viewer is portalled to
  // the document body — otherwise a `z-10` section would trap it under the nav.
  return createPortal(
    <AnimatePresence>
      {open && plate && (
        <motion.div
          ref={ref}
          className="bg-charcoal text-paper fixed inset-0 z-[90] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.5, ease: EASE_OUT_EXPO }}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — gallery`}
          tabIndex={-1}
          onTouchStart={(e) => {
            touch.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(dx) > 48) move(dx < 0 ? 1 : -1);
            touch.current = null;
          }}
        >
          <div className="shell flex shrink-0 items-center justify-between py-5">
            <span className="t-label text-paper/55">{title}</span>
            <button
              onClick={onClose}
              className="focus-bare flex items-center gap-3 py-1"
              aria-label="Close gallery"
            >
              <span className="t-label">Close</span>
              <span className="relative block h-4 w-4" aria-hidden="true">
                <span className="absolute top-1/2 left-0 h-px w-full rotate-45 bg-current" />
                <span className="absolute top-1/2 left-0 h-px w-full -rotate-45 bg-current" />
              </span>
            </button>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={`${plate.image}-${index}`}
                className="absolute inset-0 flex items-center justify-center px-[var(--gutter)]"
                initial={{ clipPath: reduced ? 'inset(0%)' : enter }}
                animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                exit={{ clipPath: reduced ? 'inset(0%)' : exit, opacity: 0.3 }}
                transition={{ duration: reduced ? 0.01 : 0.85, ease: EASE_IN_OUT_QUART }}
              >
                <motion.div
                  className="relative flex h-full w-full items-center justify-center"
                  initial={{ scale: reduced ? 1 : 1.06 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: reduced ? 0.01 : 1.6, ease: EASE_OUT_EXPO }}
                >
                  <Figure
                    image={plate.image}
                    className="h-full w-full"
                    imgClassName="object-contain"
                    sizes="100vw"
                    quality={82}
                    priority
                    eager
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Edge targets — large, invisible, and still real buttons. */}
            <button
              onClick={() => move(-1)}
              className="focus-bare group/prev absolute inset-y-0 left-0 z-10 w-[18%] cursor-w-resize"
              aria-label="Previous photograph"
              data-cursor=""
            />
            <button
              onClick={() => move(1)}
              className="focus-bare group/next absolute inset-y-0 right-0 z-10 w-[18%] cursor-e-resize"
              aria-label="Next photograph"
              data-cursor=""
            />
          </div>

          <div className="shell border-paper/18 shrink-0 border-t py-5">
            <div className="flex items-baseline justify-between gap-8">
              <p className="t-label text-paper/70 max-w-[52ch]">{plate.caption}</p>
              <div className="flex shrink-0 items-center gap-5">
                <button
                  onClick={() => move(-1)}
                  className="focus-bare border-paper/25 hover:border-paper flex h-9 w-9 items-center justify-center border transition-colors duration-500"
                  aria-label="Previous photograph"
                >
                  <svg width="16" height="8" viewBox="0 0 22 8" fill="none" className="rotate-180" aria-hidden="true">
                    <path d="M0 4h20M16.4 0.6 20 4l-3.6 3.4" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </button>
                <span className="t-label t-num text-paper/55">
                  {String((index ?? 0) + 1).padStart(2, '0')} /{' '}
                  {String(plates.length).padStart(2, '0')}
                </span>
                <button
                  onClick={() => move(1)}
                  className="focus-bare border-paper/25 hover:border-paper flex h-9 w-9 items-center justify-center border transition-colors duration-500"
                  aria-label="Next photograph"
                >
                  <svg width="16" height="8" viewBox="0 0 22 8" fill="none" aria-hidden="true">
                    <path d="M0 4h20M16.4 0.6 20 4l-3.6 3.4" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
