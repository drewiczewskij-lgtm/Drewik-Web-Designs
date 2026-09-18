import { AnimatePresence, motion } from 'motion/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Cursor } from '@/components/fx/Cursor';
import { Grain } from '@/components/fx/Grain';
import { Loader } from '@/components/fx/Loader';
import { Navigation } from '@/components/layout/Navigation';
import { SmoothScrollProvider, useSmoothScroll } from '@/lib/smoothScroll';
import { BookingProvider } from '@/lib/booking';
import { EASE_IN_OUT_QUART } from '@/lib/motion';
import { localBusinessSchema } from '@/lib/seo';
import Home from '@/pages/Home';

/* The home page is the entry point and stays in the main bundle. Every other
   route is fetched on the first navigation to it, which keeps the first load
   to the one page almost everybody sees first. */
const RealEstate = lazy(() => import('@/pages/RealEstate'));
const Services = lazy(() => import('@/pages/Services'));
const Portfolio = lazy(() => import('@/pages/Portfolio'));
const Book = lazy(() => import('@/pages/Book'));
const Commercial = lazy(() => import('@/pages/Commercial'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Faq = lazy(() => import('@/pages/Faq'));
const Admin = lazy(() => import('@/pages/Admin'));
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

/**
 * Announces the new page to a screen reader after a route change.
 *
 * Without this, navigating in a single-page application is silent: the URL and
 * the content change but nothing is spoken, so somebody using a reader has no
 * idea anything happened.
 */
function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Wait a beat for the new page to set its title.
    const id = window.setTimeout(() => setMessage(`${document.title}. Page loaded.`), 220);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}

/** A short crossfade between routes. Anything longer feels like a page load. */
function RouteTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE_IN_OUT_QUART }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** The business schema, emitted once for the whole site. */
function SiteSchema() {
  useEffect(() => {
    const node = document.createElement('script');
    node.type = 'application/ld+json';
    node.textContent = JSON.stringify(localBusinessSchema());
    node.dataset.seo = 'site';
    document.head.appendChild(node);
    return () => node.remove();
  }, []);
  return null;
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
      <BookingProvider>
        <ScrollReset />
        <SiteSchema />
        <RouteAnnouncer />
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
          className="t-label sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[110] focus:bg-neon focus:px-5 focus:py-3 focus:text-white"
        >
          Skip to content
        </a>

        <Navigation ready={ready} />

        <main id="main">
          <RouteTransition>
            <Suspense
              fallback={<div className="min-h-[100svh] w-full bg-void" aria-hidden="true" />}
            >
              <Routes>
                <Route path="/" element={<Home ready={ready} />} />
                <Route path="/real-estate" element={<RealEstate />} />
                <Route path="/services" element={<Services />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/book" element={<Book />} />
                <Route path="/book/confirmed" element={<Book />} />
                <Route path="/commercial" element={<Commercial />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </RouteTransition>
        </main>
      </BookingProvider>
    </SmoothScrollProvider>
  );
}
