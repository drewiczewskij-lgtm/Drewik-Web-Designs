import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { BRAND } from '@/data/site';
import { EASE_IN_OUT_QUART, EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

/* ============================================================================
   THE LOADER
   ----------------------------------------------------------------------------
   A short hold while the display face arrives, so the hero's headline does not
   land in a fallback font and then reflow.

   It is bounded at both ends. A minimum, because a curtain that flashes for
   90ms is worse than none — and a hard maximum, because a visitor on a bad
   connection must never be held at a logo. If the font has not arrived by
   then the site opens anyway and the type swaps in when it can.

   Skipped entirely under reduced motion.
   ========================================================================= */

const MIN_MS = 620;
const MAX_MS = 2200;

export function Loader({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(!reduced);

  useEffect(() => {
    if (reduced) {
      onDone();
      return;
    }

    const started = performance.now();
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      const elapsed = performance.now() - started;
      const wait = Math.max(0, MIN_MS - elapsed);
      window.setTimeout(() => {
        setOpen(false);
        onDone();
      }, wait);
    };

    // The cap is the promise that matters here.
    const cap = window.setTimeout(finish, MAX_MS);

    if (document.fonts?.ready) {
      document.fonts.ready.then(finish).catch(finish);
    } else {
      finish();
    }

    return () => window.clearTimeout(cap);
  }, [onDone, reduced]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-void"
          initial={{ opacity: 1 }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.85, ease: EASE_IN_OUT_QUART }}
          aria-hidden="true"
        >
          <div className="relative flex flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
              className="t-display text-[clamp(2.4rem,9vw,5rem)] leading-none"
            >
              <span className="t-accent">{BRAND.initials}</span>
            </motion.div>

            {/* A determinate-looking bar that is honestly indeterminate: it
                fills toward the cap and is cut short the moment fonts land. */}
            <div className="h-px w-[min(38vw,190px)] overflow-hidden bg-line">
              <motion.div
                className="h-full w-full origin-left"
                style={{ background: 'linear-gradient(90deg,#2d7dff,#22d3ee)' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: MAX_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            <p className="t-label text-faint">{BRAND.name}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
