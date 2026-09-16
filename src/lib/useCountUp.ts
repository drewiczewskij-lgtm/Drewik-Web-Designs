import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * A number that counts up once, the first time it is seen.
 *
 * Under reduced motion it simply is the number — a statistic is information,
 * and withholding it to play an animation would be the wrong trade.
 */
export function useCountUp(target: number, duration = 1500) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const done = useRef(false);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const el = ref.current;
    if (!el || done.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || done.current) return;
        done.current = true;
        observer.disconnect();

        const start = performance.now();
        let raf = 0;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // The same expo-out the rest of the site uses, so the number
          // decelerates like everything else on the page.
          const eased = 1 - Math.pow(2, -10 * t);
          setValue(Math.round(target * (t === 1 ? 1 : eased)));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, reduced]);

  return { ref, value };
}
