import Lenis from 'lenis';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface SmoothScrollValue {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, offset?: number) => void;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollValue>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // With reduced motion we hand scrolling back to the browser entirely.
    if (reduced) {
      setLenis(null);
      return;
    }

    const instance = new Lenis({
      duration: 1.15,
      // A long, flat curve. Nothing about the deceleration should be noticeable.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.95,
      touchMultiplier: 1.6,
      // Touch devices keep their native inertia; it is better than anything we fake.
      syncTouch: false,
      autoResize: true,
    });

    const raf = (time: number) => {
      instance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);
    setLenis(instance);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, offset = 0) => {
      if (lenis) {
        lenis.scrollTo(target, { offset, duration: 1.25 });
        return;
      }
      // Reduced-motion path, and the pre-init frames.
      const el =
        typeof target === 'string'
          ? document.querySelector<HTMLElement>(target)
          : typeof target === 'number'
            ? null
            : target;
      if (typeof target === 'number') {
        window.scrollTo({ top: target + offset, behavior: 'auto' });
      } else if (el) {
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY + offset,
          behavior: 'auto',
        });
      }
    },
    [lenis],
  );

  const stop = useCallback(() => {
    lenis?.stop();
    document.documentElement.classList.add('lenis-stopped');
    document.body.style.overflow = 'hidden';
  }, [lenis]);

  const start = useCallback(() => {
    lenis?.start();
    document.documentElement.classList.remove('lenis-stopped');
    document.body.style.overflow = '';
  }, [lenis]);

  const value = useMemo(
    () => ({ lenis, scrollTo, stop, start }),
    [lenis, scrollTo, stop, start],
  );

  return (
    <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll(): SmoothScrollValue {
  return useContext(SmoothScrollContext);
}

/** Locks the page while an overlay (menu, lightbox) owns the viewport. */
export function useScrollLock(locked: boolean) {
  const { stop, start } = useSmoothScroll();
  useEffect(() => {
    if (!locked) return;
    stop();
    return () => start();
  }, [locked, stop, start]);
}
