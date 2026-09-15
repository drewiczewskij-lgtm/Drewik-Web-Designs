import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BRAND, NAV } from '@/data/site';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { useSmoothScroll } from '@/lib/smoothScroll';

/* ==========================================================================
   FOOTER
   The wordmark set large enough to act as a full stop, and nothing else that
   is not a link, an address or a legal line.
   ======================================================================== */

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
];

const LEGAL = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
];

export function Footer() {
  const { scrollTo } = useSmoothScroll();

  return (
    <footer className="bg-charcoal text-paper on-dark relative z-10">
      <div className="shell pb-[max(2rem,5vh)]">
        <div className="border-paper/18 grid-editorial border-t pt-12 md:pt-16">
          <div className="col-span-12 lg:col-span-5">
            <p className="t-label text-paper/45 mb-5">{BRAND.tagline}</p>
            <div className="flex flex-wrap gap-x-10 gap-y-2">
              <a href={`mailto:${BRAND.email}`} className="link-rule t-lead">
                {BRAND.email}
              </a>
              <a href={BRAND.phoneHref} className="link-rule t-lead">
                {BRAND.phone}
              </a>
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="col-span-6 mt-12 sm:col-span-4 lg:col-span-2 lg:col-start-7 lg:mt-0"
          >
            <span className="t-label text-paper/45 mb-5 block">Explore</span>
            <ul>
              {NAV.map((item) => (
                <li key={item.label} className="py-1.5">
                  <button
                    onClick={() => scrollTo(item.href, -1)}
                    className="link-rule focus-bare t-label"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li className="py-1.5">
                <button
                  onClick={() => scrollTo('#contact', -1)}
                  className="link-rule focus-bare t-label"
                >
                  Contact
                </button>
              </li>
            </ul>
          </nav>

          <div className="col-span-6 mt-12 sm:col-span-4 lg:col-span-2 lg:col-start-9 lg:mt-0">
            <span className="t-label text-paper/45 mb-5 block">Follow</span>
            <ul>
              {SOCIAL.map((s) => (
                <li key={s.label} className="py-1.5">
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-rule focus-bare t-label"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 mt-12 sm:col-span-4 lg:col-span-2 lg:col-start-11 lg:mt-0">
            <span className="t-label text-paper/45 mb-5 block">Offices</span>
            <ul>
              {BRAND.offices.map((o) => (
                <li key={o.city} className="py-1.5">
                  <span className="t-label block">{o.city}</span>
                  <span className="text-paper/40 mt-1 block text-[0.82rem] leading-relaxed font-light">
                    {o.line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The wordmark, set as a rule across the foot of the page. */}
        <div className="mt-16 overflow-hidden md:mt-24">
          <motion.h2
            className="font-display text-paper/92 leading-[0.8] font-light tracking-[-0.03em]"
            style={{ fontSize: 'clamp(3.2rem, 15.5vw, 16rem)' }}
            initial={{ y: '28%', opacity: 0 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.3, ease: EASE_OUT_EXPO }}
          >
            Arcadia Estates
          </motion.h2>
        </div>

        <div className="border-paper/18 mt-10 flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-t pt-6">
          <p className="t-label text-paper/40">
            © {new Date().getFullYear()} {BRAND.name}. {BRAND.licence}
          </p>
          <ul className="flex gap-8">
            {LEGAL.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="link-rule focus-bare t-label text-paper/55">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={() => scrollTo(0)}
                className="link-rule focus-bare t-label text-paper/55"
              >
                Back to top
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
