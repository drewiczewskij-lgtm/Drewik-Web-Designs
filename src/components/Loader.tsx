import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { BRAND } from '@/data/site';
import { IMAGES, imageUrl } from '@/data/images';
import { EASE_IN_OUT_QUART, EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

const MIN_MS = 820;
const MAX_MS = 2600;

/**
 * The loading sequence. It waits for the two things that actually matter — the
 * display face and the hero plate — then lifts as a curtain. It is capped at
 * 2.6 seconds; nobody has ever enjoyed a long one.
 */
export function Loader({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const started = performance.now();
    let raf = 0;
    let settled = false;

    // Resolving early does not snap the counter to 100 — it raises the ceiling
    // and lets the same easing carry it there while the minimum runs out.
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      settled = true;
      const elapsed = performance.now() - started;
      const wait = Math.max(0, MIN_MS - elapsed);
      window.setTimeout(() => setLeaving(true), wait + 300);
    };

    // Warm the hero so the curtain lifts onto a finished picture, not a gap.
    const hero = new Image();
    hero.src = imageUrl(IMAGES.aureliaHero.src, 1800, 74);

    const ready = Promise.allSettled([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise<void>((res) => {
        if (hero.complete) return res();
        hero.onload = () => res();
        hero.onerror = () => res();
      }),
    ]);

    ready.then(finish);

    const cap = window.setTimeout(finish, MAX_MS);

    // The counter eases toward a ceiling it can only pass once loading resolves.
    const tick = () => {
      setProgress((p) => {
        const ceiling = settled ? 100 : 92;
        const next = p + (ceiling - p) * 0.04 + 0.3;
        return Math.min(ceiling, next);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(cap);
      hero.onload = null;
      hero.onerror = null;
    };
  }, []);

  const shown = Math.round(progress);
  const curtain = reduced ? 0.01 : 1.05;

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!leaving && (
        <motion.div
          key="loader"
          className="bg-charcoal text-paper fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden"
          initial={false}
          exit={{ y: '-100%' }}
          transition={{ duration: curtain, ease: EASE_IN_OUT_QUART }}
          role="status"
          aria-live="polite"
          aria-label={`Loading Arcadia Estates, ${shown} per cent`}
        >
          <motion.div
            className="shell flex h-full flex-col justify-between py-[max(1.75rem,4vh)]"
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: curtain * 0.8, ease: EASE_IN_OUT_QUART }}
          >
            <div className="flex items-start justify-between">
              <span className="t-label text-paper/45">Est. {BRAND.founded}</span>
              <span className="t-label t-num text-paper/45">
                {String(shown).padStart(3, '0')}
              </span>
            </div>

            <div className="flex-1" />

            <div>
              <h1 className="t-display text-paper">
                {BRAND.mark.map((word, i) => (
                  <span className="mask-line" key={word}>
                    <motion.span
                      className="block"
                      initial={{ y: '112%' }}
                      animate={{ y: '0%' }}
                      transition={{
                        duration: 1.15,
                        ease: EASE_OUT_EXPO,
                        delay: 0.05 + i * 0.09,
                      }}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <div className="mt-[max(1.5rem,3vh)] flex items-end justify-between gap-8">
                <motion.p
                  className="t-label text-paper/45 max-w-[22ch]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.5 }}
                >
                  {BRAND.tagline}
                </motion.p>
                <motion.span
                  className="t-label text-paper/35 hidden sm:block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.62 }}
                >
                  Malibu · Aspen · Miami · Austin · New York
                </motion.span>
              </div>

              <div className="bg-paper/15 relative mt-5 h-px w-full overflow-hidden">
                <motion.span
                  className="bg-bronze-soft absolute inset-y-0 left-0 block w-full origin-left"
                  style={{ scaleX: progress / 100 }}
                  transition={{ ease: 'linear' }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
