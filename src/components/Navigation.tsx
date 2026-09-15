import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BRAND, NAV } from '@/data/site';
import { PROPERTIES } from '@/data/properties';
import { cn } from '@/lib/cn';
import { EASE_IN_OUT_QUART, EASE_OUT_EXPO } from '@/lib/motion';
import { useScrollLock, useSmoothScroll } from '@/lib/smoothScroll';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { Figure } from './Figure';

type Theme = 'light' | 'dark';

/* ==========================================================================
   NAVIGATION
   Four words, a wordmark, and two utilities. It inverts when it leaves the
   hero, retreats when you scroll down, and returns the moment you scroll back.
   ======================================================================== */

export function Navigation({ ready = true }: { ready?: boolean }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const { scrollTo } = useSmoothScroll();
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const lastY = useRef(0);

  const onHome = pathname === '/';

  useEffect(() => {
    lastY.current = window.scrollY;
    let frame = 0;

    const evaluate = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY.current;

      setScrolled(y > 24);
      // Dark type on paper once the viewport clears the full-bleed hero.
      const marker = document.querySelector<HTMLElement>('[data-nav-theme]');
      if (marker) {
        const rect = marker.getBoundingClientRect();
        setTheme(rect.bottom > 88 ? (marker.dataset.navTheme as Theme) : 'dark');
      } else {
        setTheme('dark');
      }

      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 260);
        lastY.current = y;
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(evaluate);
    };

    evaluate();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  // Deep links from the property page land on the right section of the home page.
  useEffect(() => {
    if (!onHome || !hash) return;
    const id = window.setTimeout(() => scrollTo(hash, -1), 120);
    return () => window.clearTimeout(id);
  }, [onHome, hash, scrollTo]);

  const go = useCallback(
    (href: string) => {
      setMenu(false);
      setSearch(false);
      if (!onHome) {
        navigate(`/${href}`);
        return;
      }
      scrollTo(href, -1);
    },
    [onHome, navigate, scrollTo],
  );

  const goHome = useCallback(() => {
    setMenu(false);
    setSearch(false);
    if (onHome) scrollTo(0);
    else navigate('/');
  }, [onHome, navigate, scrollTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setMenu(false);
        setSearch((s) => !s);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const inverted = theme === 'light';

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={{ y: -24, opacity: 0 }}
        animate={{
          y: ready ? (hidden && !menu && !search ? -110 : 0) : -24,
          opacity: ready ? 1 : 0,
        }}
        transition={{ duration: 0.85, ease: EASE_OUT_EXPO, delay: ready ? 0.15 : 0 }}
      >
        {/* A paper plate that fades in behind the nav once it leaves the hero. */}
        <div
          aria-hidden="true"
          className={cn(
            'bg-paper/88 pointer-events-none absolute inset-0 backdrop-blur-[10px] transition-opacity duration-700',
            !inverted && scrolled ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 bottom-0 h-px transition-opacity duration-700',
            !inverted && scrolled ? 'bg-ink/12 opacity-100' : 'opacity-0',
          )}
        />
        {/* Over photography the wordmark needs a scrim, not a panel. */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-40 transition-opacity duration-700',
            inverted ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            background:
              'linear-gradient(to bottom, rgba(12,11,9,.5), rgba(12,11,9,.22) 46%, transparent)',
          }}
        />

        <nav
          aria-label="Primary"
          className={cn(
            'shell relative flex items-center justify-between gap-6 py-5 transition-colors duration-500 md:py-6',
            inverted ? 'text-paper' : 'text-ink',
          )}
        >
          <button
            onClick={goHome}
            className="focus-bare group/mark -my-2 py-2 text-left"
            aria-label={`${BRAND.name} — home`}
          >
            <span className="t-label block leading-none tracking-[0.3em]">Arcadia</span>
            <span
              className={cn(
                't-label mt-1 block leading-none tracking-[0.3em] transition-opacity duration-500',
                inverted ? 'text-paper/55' : 'text-stone-deep',
              )}
            >
              Estates
            </span>
          </button>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 lg:flex">
            {NAV.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => go(item.href)}
                  className="link-rule focus-bare t-label py-1"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-6 md:gap-8">
            <button
              onClick={() => {
                setMenu(false);
                setSearch(true);
              }}
              className="link-rule focus-bare t-label hidden py-1 sm:block"
              aria-label="Search residences"
            >
              Search
            </button>
            <button
              onClick={() => go('#contact')}
              className="link-rule focus-bare t-label hidden py-1 sm:block"
            >
              Contact
            </button>
            <button
              onClick={() => {
                setSearch(false);
                setMenu(true);
              }}
              className="focus-bare -mr-1 flex items-center gap-3 py-1 lg:hidden"
              aria-label="Open menu"
              aria-expanded={menu}
            >
              <span className="t-label">Menu</span>
              <span className="flex w-5 flex-col gap-[5px]" aria-hidden="true">
                <span className="h-px w-full bg-current" />
                <span className="h-px w-full bg-current" />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <MobileMenu
        open={menu}
        onClose={() => setMenu(false)}
        onNavigate={go}
        onSearch={() => {
          setMenu(false);
          setSearch(true);
        }}
      />
      <SearchPanel open={search} onClose={() => setSearch(false)} />
    </>
  );
}

/* ==========================================================================
   MOBILE MENU
   Not a stacked copy of the desktop bar — a composed panel with the four
   sections set large, and the office details underneath.
   ======================================================================== */

const MENU_ITEMS = [...NAV, { label: 'Contact', href: '#contact' }] as const;

function MobileMenu({
  open,
  onClose,
  onNavigate,
  onSearch,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
  onSearch: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollLock(open);
  useFocusTrap(ref, open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className="bg-charcoal text-paper fixed inset-0 z-[80] flex flex-col overflow-y-auto"
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.72, ease: EASE_IN_OUT_QUART }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          tabIndex={-1}
        >
          <div className="shell flex items-start justify-between py-5 md:py-6">
            <div>
              <span className="t-label block leading-none tracking-[0.3em]">Arcadia</span>
              <span className="t-label text-paper/55 mt-1 block leading-none tracking-[0.3em]">
                Estates
              </span>
            </div>
            <button
              onClick={onClose}
              className="focus-bare flex items-center gap-3 py-1"
              aria-label="Close menu"
            >
              <span className="t-label">Close</span>
              <span className="relative block h-4 w-4" aria-hidden="true">
                <span className="absolute top-1/2 left-0 h-px w-full rotate-45 bg-current" />
                <span className="absolute top-1/2 left-0 h-px w-full -rotate-45 bg-current" />
              </span>
            </button>
          </div>

          <nav
            aria-label="Menu"
            className="shell flex flex-1 flex-col justify-center py-10"
          >
            <ul>
              {MENU_ITEMS.map((item, i) => (
                <motion.li
                  key={item.label}
                  className="border-paper/14 border-b"
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.16 + i * 0.06 }}
                >
                  <button
                    onClick={() => onNavigate(item.href)}
                    className="focus-bare group/row flex w-full items-baseline justify-between gap-6 py-5 text-left"
                  >
                    <span className="t-h2">{item.label}</span>
                    <span className="t-label text-bronze-soft t-num">0{i + 1}</span>
                  </button>
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="mt-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.42 }}
            >
              <div>
                <button
                  onClick={onSearch}
                  className="focus-bare arrow-host group/cta mb-8 flex items-center gap-4"
                >
                  <span className="t-label">Search the portfolio</span>
                  <svg
                    width="22"
                    height="8"
                    viewBox="0 0 22 8"
                    fill="none"
                    aria-hidden="true"
                    className="arrow-step"
                  >
                    <path d="M0 4h20M16.4 0.6 20 4l-3.6 3.4" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </button>
                <span className="t-label text-paper/45 mb-3 block">Enquiries</span>
                <a href={`mailto:${BRAND.email}`} className="link-rule t-lead block">
                  {BRAND.email}
                </a>
                <a href={BRAND.phoneHref} className="link-rule t-lead mt-3 block">
                  {BRAND.phone}
                </a>
              </div>
              <div className="text-right">
                <span className="t-label text-paper/45 mb-3 block">Offices</span>
                {BRAND.offices.map((o) => (
                  <span key={o.city} className="t-label text-paper/75 block leading-relaxed">
                    {o.city}
                  </span>
                ))}
              </div>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ==========================================================================
   SEARCH
   A real filter over the portfolio, not an ornament. Name, city, region and
   architect are all matched.
   ======================================================================== */

function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  useScrollLock(open);
  useFocusTrap(ref, open, onClose);

  useEffect(() => {
    if (open) {
      setQuery('');
      window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 220);
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  const results = q
    ? PROPERTIES.filter((p) =>
        [p.name, p.city, p.region, p.architect, p.status, p.summary]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    : PROPERTIES;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className="bg-paper text-ink fixed inset-0 z-[80] flex flex-col overflow-y-auto"
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.68, ease: EASE_IN_OUT_QUART }}
          role="dialog"
          aria-modal="true"
          aria-label="Search residences"
          tabIndex={-1}
        >
          <div className="shell flex items-center justify-between py-5 md:py-6">
            <span className="t-label text-stone-deep">Search the portfolio</span>
            <button
              onClick={onClose}
              className="focus-bare flex items-center gap-3 py-1"
              aria-label="Close search"
            >
              <span className="t-label">Close</span>
              <span className="relative block h-4 w-4" aria-hidden="true">
                <span className="absolute top-1/2 left-0 h-px w-full rotate-45 bg-current" />
                <span className="absolute top-1/2 left-0 h-px w-full -rotate-45 bg-current" />
              </span>
            </button>
          </div>

          <div className="shell border-ink/12 border-t">
            <label htmlFor="portfolio-search" className="sr-only">
              Search residences by name, city or architect
            </label>
            <input
              id="portfolio-search"
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Malibu, Aspen, a name…"
              autoComplete="off"
              spellCheck={false}
              className="font-display placeholder:text-stone w-full border-b border-transparent bg-transparent py-8 text-[clamp(2rem,6vw,4.5rem)] leading-none font-light tracking-[-0.02em] outline-none focus:border-bronze md:py-12"
            />
          </div>

          <div className="shell border-ink/12 flex-1 border-t pt-6 pb-16">
            <p className="t-label text-stone-deep mb-6">
              {results.length} {results.length === 1 ? 'residence' : 'residences'}
            </p>
            <ul>
              {results.map((p, i) => (
                <motion.li
                  key={p.slug}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: i * 0.04 }}
                  className="border-ink/12 border-b"
                >
                  <Link
                    to={`/residences/${p.slug}`}
                    onClick={onClose}
                    className="focus-bare zoom-host arrow-host group/row flex items-center gap-5 py-4 md:gap-8 md:py-5"
                    data-cursor="VIEW"
                  >
                    <Figure
                      image={p.cover}
                      className="h-14 w-20 shrink-0 md:h-20 md:w-32"
                      sizes="128px"
                      quality={55}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="t-h3 block truncate">{p.name}</span>
                      <span className="t-label text-stone-deep mt-2 block">
                        {p.locationLine}
                      </span>
                    </span>
                    <span className="t-num hidden shrink-0 text-right sm:block">
                      <span className="font-display block text-xl leading-none font-light md:text-2xl">
                        {p.priceCompact}
                      </span>
                      <span className="t-label text-stone-deep mt-2 block">
                        {p.beds} bd · {p.baths} ba
                      </span>
                    </span>
                    <span className="text-ink shrink-0" aria-hidden="true">
                      <svg width="22" height="8" viewBox="0 0 22 8" fill="none" className="arrow-step">
                        <path d="M0 4h20M16.4 0.6 20 4l-3.6 3.4" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            {results.length === 0 && (
              <p className="t-lead text-stone-deep max-w-[46ch] py-10">
                Nothing in the public portfolio matches that. Most of what we transact is
                never listed — write to{' '}
                <a href={`mailto:${BRAND.email}`} className="link-rule text-ink">
                  {BRAND.email}
                </a>{' '}
                and tell us what you are looking for.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
