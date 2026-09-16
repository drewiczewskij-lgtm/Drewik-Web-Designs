import { useCallback, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { useHasFinePointer } from './useMediaQuery';

/**
 * The 3D card tilt, and the light that follows the cursor across it.
 *
 * Both are written to the element as custom properties rather than to React
 * state. Moving the mouse across a grid of twenty cards must not re-render
 * twenty components — at that point the effect costs more than it is worth.
 *
 * Disabled outright on touch and under reduced motion, where a tilt tied to a
 * pointer that does not exist is either invisible or nauseating.
 */
export function useTilt<T extends HTMLElement>(maxDeg = 7) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const fine = useHasFinePointer();
  const active = fine && !reduced;
  const frame = useRef<number | null>(null);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<T>) => {
      if (!active) return;
      const el = ref.current;
      if (!el) return;
      // One write per frame. Pointer events fire far faster than the display.
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      const { clientX, clientY } = e;
      frame.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (clientX - r.left) / r.width;
        const py = (clientY - r.top) / r.height;
        el.style.setProperty('--ry', `${(px - 0.5) * 2 * maxDeg}deg`);
        el.style.setProperty('--rx', `${(0.5 - py) * 2 * maxDeg}deg`);
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
        el.dataset.active = 'true';
      });
    },
    [active, maxDeg],
  );

  const onPointerLeave = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (!el) return;
    // Clearing `active` restores the long easing, so the card settles back
    // rather than snapping flat.
    el.dataset.active = 'false';
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }, []);

  return { ref, onPointerMove, onPointerLeave, tiltEnabled: active };
}
