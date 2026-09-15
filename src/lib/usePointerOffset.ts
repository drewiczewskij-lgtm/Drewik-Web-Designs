import { useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';
import { useCallback, useRef, type RefObject } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { useHasFinePointer } from './useMediaQuery';

/**
 * Normalised pointer position inside an element, sprung. Used for the small
 * amount of parallax the large plates carry — a few pixels, never more.
 */
export function usePointerOffset<T extends HTMLElement>(range = 16): {
  ref: RefObject<T | null>;
  onMouseMove: (e: React.MouseEvent<T>) => void;
  onMouseLeave: () => void;
  x: MotionValue<number>;
  y: MotionValue<number>;
} {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const fine = useHasFinePointer();
  const active = fine && !reduced;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const nx = useSpring(rawX, { stiffness: 120, damping: 24, mass: 0.6 });
  const ny = useSpring(rawY, { stiffness: 120, damping: 24, mass: 0.6 });
  const x = useTransform(nx, (v) => v * range);
  const y = useTransform(ny, (v) => v * range);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (!active) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
    },
    [active, rawX, rawY],
  );

  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { ref, onMouseMove, onMouseLeave, x, y };
}
