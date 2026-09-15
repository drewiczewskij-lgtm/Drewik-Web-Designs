import { AnimatePresence, motion } from 'motion/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Cursor } from '@/components/Cursor';
import { Grain } from '@/components/Grain';
import { Loader } from '@/components/Loader';
import { Navigation } from '@/components/Navigation';
import { SmoothScrollProvider, useSmoothScroll } from '@/lib/smoothScroll';
import { EASE_IN_OUT_QUART } from '@/lib/motion';
import Home from '@/pages/Home';

/* The home page is the entry point and stays in the main bundle. Everything
   else is fetched on the first navigation to it. */
const PropertyDetail = lazy(() => import('@/pages/PropertyDetail'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Privacy = lazy(() => import('@/pages/Legal').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('@/pages/Legal').then((m) => ({ default: m.Terms })));

/** Routes start at the top; the browser's restoration fights the smooth scroller. */
function ScrollReset() {
  const { pathname } = useLocation();
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname, lenis]);

  return null;
}

/** A charcoal wipe between routes, matched to the loader's curtain. */
function RouteTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.42, ease: EASE_IN_OUT_QUART }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [ready, setReady] = useState(false);

  // `ready` flips as the curtain starts to lift, so the hero is already moving
  // by the time the loader clears the frame.
  useEffect(() => {
    if (!booted) return;
    const id = window.setTimeout(() => setReady(true), 20);
    return () => window.clearTimeout(id);
  }, [booted]);

  return (
    <SmoothScrollProvider>
      <ScrollReset />
      <Cursor />
      <Grain />
      <Loader onDone={() => setBooted(true)} />

      <a
        href="#main"
        onClick={(e) => {
          // Handled here so the URL hash stays the router's to own.
          e.preventDefault();
          const main = document.getElementById('main');
          if (!main) return;
          main.setAttribute('tabindex', '-1');
          main.focus({ preventScroll: true });
          main.scrollIntoView();
        }}
        className="focus:bg-charcoal focus:text-paper t-label sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[110] focus:px-5 focus:py-3"
      >
        Skip to content
      </a>

      <Navigation ready={ready} />

      <main id="main">
        <RouteTransition>
          <Suspense
            fallback={<div className="bg-charcoal min-h-[100svh] w-full" aria-hidden="true" />}
          >
          <Routes>
            <Route path="/" element={<Home ready={ready} />} />
            <Route path="/residences/:slug" element={<PropertyDetail />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </RouteTransition>
      </main>
    </SmoothScrollProvider>
  );
}
