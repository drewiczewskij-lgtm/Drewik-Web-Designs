import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FEATURED } from '@/data/properties';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useSmoothScroll } from '@/lib/smoothScroll';
import { Figure } from './Figure';
import { Arrow } from './Cta';

/* ==========================================================================
   HERO
   Full bleed, sticky, and built to be scrolled *through* rather than past.
   The plate keeps scaling as the page moves over it, so the cut into the
   featured residence reads as one continuous camera move.
   ======================================================================== */

export function Hero({ ready }: { ready: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollTo } = useSmoothScroll();

  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ['start start', 'end start'],
  });

  const still = useTransform(scrollYProgress, () => 0) as MotionValue<number>;
  const p = reduced ? still : scrollYProgress;

  const plateScale = useTransform(p, [0, 1], [1, 1.16]);
  const plateY = useTransform(p, [0, 1], ['0%', '9%']);
  const veil = useTransform(p, [0, 0.72, 1], [0, 0.32, 0.68]);
  const contentY = useTransform(p, [0, 1], [0, -110]);
  const contentFade = useTransform(p, [0, 0.62], [1, 0]);
  const cueFade = useTransform(p, [0, 0.16], [1, 0]);

  const d = (n: number) => (reduced ? 0 : n);

  return (
    <div
      ref={wrap}
      data-nav-theme="light"
      id="hero"
      className="relative h-[128svh]"
    >
      <section
        className="bg-charcoal sticky top-0 h-[100svh] overflow-hidden"
        aria-label={`Featured residence — ${FEATURED.name}, ${FEATURED.locationLine}`}
      >
        {/* The plate. Settles off an over-scale on load, then keeps going on scroll. */}
        <motion.div
          className="absolute inset-0"
          style={{ scale: plateScale, y: plateY }}
        >
          <motion.div
            className="h-full w-full"
            initial={{ scale: 1.05 }}
            animate={{ scale: ready ? 1 : 1.05 }}
            transition={{ duration: d(2.4), ease: EASE_OUT_EXPO }}
          >
            <Figure
              image={FEATURED.hero}
              priority
              eager
              className="h-full w-full"
              sizes="100vw"
              quality={78}
            />
          </motion.div>
        </motion.div>

        {/* Grading. A warm low-light wash, heavier at the foot where type sits. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(12,11,9,.82) 0%, rgba(12,11,9,.42) 26%, rgba(12,11,9,.06) 56%, rgba(12,11,9,.3) 100%)',
          }}
        />
        <motion.div
          aria-hidden="true"
          className="bg-charcoal pointer-events-none absolute inset-0"
          style={{ opacity: veil }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(130% 88% at 50% 42%, transparent 44%, rgba(8,7,6,.42) 100%)',
          }}
        />

        {/* Content */}
        <motion.div
          className="text-paper absolute inset-x-0 bottom-0 z-10"
          style={{ y: contentY, opacity: contentFade }}
        >
          {/* The right column stops short of the gutter so it never meets the scroll cue. */}
          <div className="shell grid-editorial items-end pb-[max(2.25rem,7vh)] lg:pr-[calc(var(--gutter)+4rem)]">
            <div className="col-span-12 lg:col-span-7">
              <motion.div
                className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 md:mb-7"
                initial={{ opacity: 0, y: 16 }}
                animate={ready ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: d(0.9), ease: EASE_OUT_EXPO, delay: d(0.28) }}
              >
                <span className="t-label">{FEATURED.status}</span>
                <span className="bg-paper/40 h-px w-9" aria-hidden="true" />
                <span className="t-label text-paper/65">
                  {FEATURED.locationLine}
                </span>
              </motion.div>

              {/* The page h1 names the firm; this is the plate caption. */}
              <h2 className="t-display">
                <span className="mask-line">
                  <motion.span
                    className="block"
                    initial={{ y: '112%' }}
                    animate={ready ? { y: '0%' } : {}}
                    transition={{ duration: d(1.35), ease: EASE_OUT_EXPO, delay: d(0.34) }}
                  >
                    {FEATURED.name}
                  </motion.span>
                </span>
              </h2>
            </div>

            <div className="col-span-12 mt-8 lg:col-span-5 lg:mt-0">
              <motion.div
                className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 lg:justify-end lg:text-right"
                initial={{ opacity: 0, y: 22 }}
                animate={ready ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: d(1), ease: EASE_OUT_EXPO, delay: d(0.55) }}
              >
                <div className="lg:order-2 lg:ml-12">
                  <span className="t-label text-paper/55 mb-3 block">Guide Price</span>
                  <span className="font-display t-num block text-[clamp(1.75rem,3.2vw,2.75rem)] leading-none font-light">
                    {FEATURED.priceDisplay}
                  </span>
                </div>
                <div className="lg:order-1">
                  <span className="t-label text-paper/55 mb-3 block">Accommodation</span>
                  <span className="t-label t-num text-paper/90 block leading-relaxed">
                    {FEATURED.beds} Beds · {FEATURED.baths} Baths
                  </span>
                  <span className="t-label t-num text-paper/90 block leading-relaxed">
                    {FEATURED.sqft.toLocaleString('en-US')} Sq Ft
                  </span>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="col-span-12 mt-10 md:mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: d(1), ease: EASE_OUT_EXPO, delay: d(0.7) }}
            >
              <div className="bg-paper/20 mb-7 h-px w-full" aria-hidden="true" />
              <Link
                to={`/residences/${FEATURED.slug}`}
                className="group/cta arrow-host focus-bare inline-flex items-center gap-4"
                data-cursor="EXPLORE"
              >
                <span className="t-label">Explore Residence</span>
                <Arrow />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll cue — right-hand side, out of the way of the wordmark. */}
        <motion.div
          className="text-paper/60 absolute right-[var(--gutter)] bottom-[max(2.25rem,7vh)] z-10 hidden lg:block"
          style={{ opacity: cueFade }}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ duration: d(1), delay: d(0.95) }}
        >
          <button
            onClick={() => scrollTo('#properties', -1)}
            className="focus-bare group/scroll flex flex-col items-center gap-3"
            aria-label="Scroll to the next section"
          >
            <span className="t-label [writing-mode:vertical-rl] tracking-[0.34em]">
              Scroll
            </span>
            <span
              className="bg-paper/25 relative block h-14 w-px overflow-hidden"
              aria-hidden="true"
            >
              <motion.span
                className="bg-paper absolute inset-x-0 top-0 block h-5"
                animate={reduced ? {} : { y: ['-120%', '340%'] }}
                transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.35 }}
              />
            </span>
          </button>
        </motion.div>
      </section>
    </div>
  );
}
