import { useEffect, useRef, useState } from 'react';
import { useHasFinePointer } from '@/lib/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

/* ============================================================================
   THE CURSOR
   ----------------------------------------------------------------------------
   A soft light that trails the pointer, and a ring that grows over anything
   interactive. The system cursor is NOT hidden — hiding it is the single most
   common way these go wrong, because it breaks text selection, native controls
   and anyone who relies on the shape to find the pointer at all.

   Pointer position is written straight to the element. Nothing here causes a
   React render, ever.
   ========================================================================= */

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const fine = useHasFinePointer();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!fine || reduced) {
      setEnabled(false);
      return;
    }
    setEnabled(true);

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let raf = 0;
    let hovering = false;
    // Nothing is drawn until the pointer actually moves. Without this the dot
    // sits in the middle of the screen on load, nowhere near the real cursor,
    // which reads as a rendering fault rather than as a cursor.
    let seen = false;

    const onMove = (e: PointerEvent) => {
      if (!seen) {
        seen = true;
        // Place both marks under the pointer before revealing them, or they
        // fly in from the centre of the page on the first movement.
        target.x = ring.x = e.clientX;
        target.y = ring.y = e.clientY;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }
      target.x = e.clientX;
      target.y = e.clientY;

      // Is the pointer over something you can act on?
      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest('a, button, input, textarea, select, [role="button"], [data-cursor]');
      if (interactive !== hovering) {
        hovering = interactive;
        ringRef.current?.style.setProperty('--size', interactive ? '46px' : '26px');
        ringRef.current?.style.setProperty('--ring-opacity', interactive ? '0.85' : '0.34');
      }
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      // The dot is exact; the ring lags. The gap between them is the effect.
      ring.x += (target.x - ring.x) * 0.16;
      ring.y += (target.y - ring.y) * 0.16;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
    };

    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };
    const onEnter = () => {
      if (!seen) return;
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
    };
  }, [fine, reduced]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[95] h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          marginLeft: '-2.5px',
          marginTop: '-2.5px',
          background: 'rgb(103 232 249)',
          boxShadow: '0 0 12px 2px rgb(34 211 238 / 0.8)',
          opacity: 0,
          transition: 'opacity 240ms ease',
        }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[94] rounded-full"
        style={
          {
            '--size': '26px',
            '--ring-opacity': '0.34',
            width: 'var(--size)',
            height: 'var(--size)',
            marginLeft: 'calc(var(--size) / -2)',
            marginTop: 'calc(var(--size) / -2)',
            border: '1px solid rgb(45 125 255 / var(--ring-opacity))',
            boxShadow: '0 0 22px -6px rgb(45 125 255 / 0.7)',
            opacity: 0,
            transition: 'width 320ms cubic-bezier(.23,1,.32,1), height 320ms cubic-bezier(.23,1,.32,1), margin 320ms cubic-bezier(.23,1,.32,1), border-color 320ms ease, opacity 240ms ease',
          } as React.CSSProperties
        }
      />
    </>
  );
}
