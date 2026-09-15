import { useEffect, useRef, useState } from 'react';
import { useHasFinePointer } from '@/lib/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

/* ============================================================================
   CUSTOM CURSOR
   ----------------------------------------------------------------------------
   A dot by default. Over a photograph it becomes a word — VIEW, EXPLORE, DRAG.
   Any element can claim it with `data-cursor="VIEW"`; nothing needs to be wired
   through React, and the dot itself is written straight to the DOM so that
   moving the mouse never re-renders the page.
   ========================================================================= */

export function Cursor() {
  const fine = useHasFinePointer();
  const reduced = usePrefersReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!fine) return;

    const dot = dotRef.current;
    if (!dot) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let raf = 0;
    let current: string | null = null;

    const read = (el: EventTarget | null) => {
      if (!(el instanceof Element)) return null;
      const host = el.closest<HTMLElement>('[data-cursor]');
      const next = host?.dataset.cursor ?? null;
      return next === '' ? null : next;
    };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visibleRef.current) {
        pos.x = e.clientX;
        pos.y = e.clientY;
        visibleRef.current = true;
        setVisible(true);
      }
      const next = read(e.target);
      if (next !== current) {
        current = next;
        setLabel(next);
      }
    };

    const visibleRef = { current: false };

    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    const tick = () => {
      // A light lag — enough to feel weighted, not enough to feel laggy.
      const k = reduced ? 1 : 0.2;
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      dot.style.transform = `translate3d(${pos.x.toFixed(2)}px, ${pos.y.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, [fine, reduced]);

  if (!fine) return null;

  const expanded = label !== null;

  return (
    <div
      className="cursor-layer pointer-events-none fixed inset-0 z-[70]"
      aria-hidden="true"
    >
      <div ref={dotRef} className="absolute top-0 left-0 will-change-transform">
        <div
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: expanded ? 88 : 9,
            height: expanded ? 88 : 9,
            marginLeft: expanded ? -44 : -4.5,
            marginTop: expanded ? -44 : -4.5,
            background: expanded ? 'var(--color-paper)' : 'var(--color-paper)',
            mixBlendMode: expanded ? 'normal' : 'difference',
            opacity: visible ? 1 : 0,
            transform: `scale(${down ? 0.88 : 1})`,
            transition:
              'width .55s cubic-bezier(.16,1,.3,1), height .55s cubic-bezier(.16,1,.3,1), margin .55s cubic-bezier(.16,1,.3,1), opacity .3s linear, transform .35s cubic-bezier(.16,1,.3,1), background .4s linear',
          }}
        >
          <span
            className="t-label text-charcoal whitespace-nowrap"
            style={{
              opacity: expanded ? 1 : 0,
              transform: `scale(${expanded ? 1 : 0.8})`,
              transition: 'opacity .35s linear, transform .45s cubic-bezier(.16,1,.3,1)',
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
