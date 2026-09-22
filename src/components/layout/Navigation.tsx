import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BRAND, CONTACT, NAV } from '@/data/site';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/fx/Magnetic';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useScrollLock } from '@/lib/smoothScroll';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { EASE_OUT_EXPO, EASE_UI } from '@/lib/motion';
import { cn } from '@/lib/cn';

/* ============================================================================
   NAVIGATION
   ----------------------------------------------------------------------------
   Transparent over a hero, glass once the page has moved. It hides on the way
   down and comes back on the way up, because on a page this long a permanent
   bar costs more screen than it earns — but it always returns instantly, and
   it never hides while a menu is open or while focus is inside it.
   ========================================================================= */

export function Navigation({ ready = true }: { ready?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const reduced = usePrefersReducedMotion();

  useFocusTrap(panelRef, menuOpen, () => setMenuOpen(false));
  useScrollLock(menuOpen);

  // Close the menu on navigation. Without this, tapping a link on a phone
  // leaves the panel sitting over the page it just went to.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);

      // A dead zone, so a trackpad's jitter cannot flicker the bar.
      if (Math.abs(y - lastY.current) < 8) return;
      const goingDown = y > lastY.current;
      lastY.current = y;

      if (menuOpen) return;
      // Never hide near the top; there is nothing to gain and it looks broken.
      setHidden(goingDown && y > 220);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: reduced ? 0 : -24, opacity: 0 }}
        animate={{ y: ready && !hidden ? 0 : reduced ? 0 : -110, opacity: ready ? 1 : 0 }}
        transition={{ duration: reduced ? 0.2 : 0.55, ease: EASE_OUT_EXPO }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500',
          scrolled || menuOpen
            ? 'border-b border-white/8 bg-void/72 backdrop-blur-xl'
            : 'border-b border-transparent',
        )}
        // Focus inside the bar must always bring it back.
        onFocusCapture={() => setHidden(false)}
      >
        <nav
          aria-label="Primary"
          className="shell flex h-[var(--nav-h)] items-center justify-between gap-6"
        >
          <Link
            to="/"
            className="group flex items-center gap-2.5"
            aria-label={`${BRAND.name} — home`}
          >
            <Mark />
            <span className="font-display text-[15px] font-semibold tracking-[-0.02em] text-bright">
              KM<span className="text-neon"> </span>
              <span className="font-normal text-muted transition-colors duration-300 group-hover:text-body">
                Productions
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'relative block px-3 py-2 font-mono text-[10.5px] tracking-[0.16em] uppercase transition-colors duration-200',
                      isActive ? 'text-bright' : 'text-muted hover:text-bright',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-x-3 -bottom-px h-px bg-neon"
                          style={{ boxShadow: '0 0 12px 1px rgb(45 125 255 / 0.9)' }}
                          transition={{ duration: 0.28, ease: EASE_UI }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="hidden font-mono text-[11px] tracking-[0.12em] text-muted transition-colors duration-200 hover:text-bright xl:block"
            >
              {CONTACT.phone}
            </a>

            {/* The hiding lives on a wrapper, not on Magnetic. Magnetic sets
                `display: inline-block` itself, and a `hidden` passed alongside
                it is the same kind of utility — which of the two wins is
                decided by their order in the built stylesheet rather than in
                the class string, so the button was appearing on phones. */}
            <span className="hidden sm:block">
              <Magnetic>
                <Button to="/book" size="sm">
                  Book a shoot
                </Button>
              </Magnetic>
            </span>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="group relative grid h-10 w-10 place-items-center lg:hidden"
            >
              <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
              <span aria-hidden="true" className="flex w-5 flex-col gap-[5px]">
                <span
                  className="h-px w-full bg-bright transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)]"
                  style={{ transform: menuOpen ? 'translateY(3px) rotate(45deg)' : undefined }}
                />
                <span
                  className="h-px w-full bg-bright transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)]"
                  style={{ transform: menuOpen ? 'translateY(-3px) rotate(-45deg)' : undefined }}
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE_UI }}
            className="fixed inset-0 z-40 overflow-y-auto bg-void/97 pt-[var(--nav-h)] backdrop-blur-2xl lg:hidden"
          >
            <div className="aurora opacity-50" aria-hidden="true" />
            <nav aria-label="Mobile" className="shell relative flex flex-col py-8">
              <ul className="flex flex-col">
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.to}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: EASE_OUT_EXPO,
                      delay: reduced ? 0 : i * 0.035,
                    }}
                    className="border-b border-line"
                  >
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-baseline justify-between gap-4 py-4',
                          isActive && 'text-bright',
                        )
                      }
                    >
                      <span className="font-display text-[26px] font-semibold tracking-tight text-bright">
                        {item.label}
                      </span>
                      {item.note && (
                        <span className="max-w-[45%] text-right text-[11.5px] leading-tight text-faint">
                          {item.note}
                        </span>
                      )}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-4">
                <Button to="/book" full size="lg">
                  Book a shoot
                </Button>
                <div className="flex flex-col gap-1 pt-2">
                  <a
                    href={`tel:${CONTACT.phoneHref}`}
                    className="link-rule font-mono text-[13px] tracking-wide"
                  >
                    {CONTACT.phone}
                  </a>
                  <a href={`mailto:${CONTACT.email}`} className="link-rule text-[13px] break-all">
                    {CONTACT.email}
                  </a>
                  <p className="t-label mt-2">{CONTACT.serviceArea}</p>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** The mark. A lens aperture, drawn rather than fetched. */
function Mark() {
  return (
    <span
      aria-hidden="true"
      className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-neon/40 transition-[box-shadow,border-color] duration-500"
      style={{ boxShadow: '0 0 18px -6px rgb(45 125 255 / 0.9)' }}
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.2" stroke="rgb(103 232 249)" strokeWidth="1" opacity="0.75" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <line
            key={deg}
            x1="8"
            y1="8"
            x2={8 + 6.2 * Math.cos((deg * Math.PI) / 180)}
            y2={8 + 6.2 * Math.sin((deg * Math.PI) / 180)}
            stroke="rgb(45 125 255)"
            strokeWidth="0.9"
            opacity="0.8"
          />
        ))}
        <circle cx="8" cy="8" r="2" fill="rgb(103 232 249)" />
      </svg>
    </span>
  );
}
