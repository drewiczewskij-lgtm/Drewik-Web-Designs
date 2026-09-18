import { useCallback, useRef, type ReactNode } from 'react';
import { useHasFinePointer } from '@/lib/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

/**
 * A control that leans toward the cursor as it approaches.
 *
 * Used on exactly two things on this site — the hero's primary call to action
 * and the booking button in the navigation. That restraint is the point: when
 * everything is magnetic, nothing is, and the page starts to feel slippery.
 *
 * The pull is capped at a few pixels so the control never leaves the place the
 * customer aimed at, which is the failure mode that makes these infuriating.
 */
export function Magnetic({
  children,
  className,
  strength = 0.28,
  max = 9,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  max?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const frame = useRef<number | null>(null);
  const fine = useHasFinePointer();
  const reduced = usePrefersReducedMotion();
  const active = fine && !reduced;

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLSpanElement>) => {
      if (!active) return;
      const el = ref.current;
      if (!el) return;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      const { clientX, clientY } = e;
      frame.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = clientX - (r.left + r.width / 2);
        const dy = clientY - (r.top + r.height / 2);
        const x = Math.max(-max, Math.min(max, dx * strength));
        const y = Math.max(-max, Math.min(max, dy * strength));
        // The full transform string, not motion's x/y shorthand: this one
        // stays on the compositor even while the page is busy.
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        el.style.transition = 'transform 90ms linear';
      });
    },
    [active, strength, max],
  );

  const onPointerLeave = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 620ms cubic-bezier(.16,1,.3,1)';
    el.style.transform = 'translate3d(0,0,0)';
  }, []);

  return (
    <span
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn('inline-block will-change-transform', className)}
    >
      {children}
    </span>
  );
}
