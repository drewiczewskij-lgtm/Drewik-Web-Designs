import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Figure } from '@/components/Figure';
import { NeonField } from '@/components/fx/NeonField';
import { RevealLines } from '@/components/fx/Reveal';
import { Magnetic } from '@/components/fx/Magnetic';
import { Button, Arrow } from '@/components/ui/Button';
import { STATS } from '@/data/site';
import { Counter } from '@/components/fx/Counter';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

/* ============================================================================
   THE HERO
   ----------------------------------------------------------------------------
   Five layers, back to front:

     1  the photograph, held at 45% and drifting up as you scroll
     2  a vertical scrim, so the type has a guaranteed contrast floor
     3  the neon field — particles and wireframe solids on one canvas
     4  the perspective grid along the bottom edge
     5  the type and the two calls to action

   The whole stack is `position: sticky` for one viewport height, so scrolling
   away from the hero moves the camera INTO the next section rather than
   sliding a panel off the top. It costs one wrapper and it is the difference
   between a page that scrolls and a page that moves.
   ========================================================================= */

export function Hero({ ready = true }: { ready?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end start'],
  });

  // Transform and opacity only — both stay on the compositor.
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '16%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.14]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-28%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.62], [1, reduced ? 1 : 0]);

  return (
    <div ref={wrapRef} className="relative h-[168svh]">
      <section
        aria-label="Introduction"
        className="sticky top-0 flex h-[100svh] flex-col justify-end overflow-hidden"
      >
        {/* 1 — the photograph */}
        <motion.div
          className="absolute inset-0"
          style={{ y: imageY, scale: imageScale, willChange: 'transform' }}
        >
          <Figure
            image="heroTwilight"
            priority
            eager
            sizes="100vw"
            className="h-full w-full"
            imgClassName="opacity-[0.46]"
          />
        </motion.div>

        {/* 2 — the scrim */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-void)_2%,rgb(4_6_11/0.82)_34%,rgb(4_6_11/0.5)_62%,rgb(4_6_11/0.72)_100%)]"
        />

        {/* 3 — the field */}
        <div className="absolute inset-0" aria-hidden="true">
          <NeonField />
        </div>

        {/* 4 — the floor */}
        <div className="grid-floor" aria-hidden="true" />

        {/* 5 — the content */}
        <motion.div
          className="shell relative pb-10 sm:pb-14"
          style={{ y: contentY, opacity: contentOpacity, willChange: 'transform, opacity' }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.15 }}
            className="t-label mb-7 flex flex-wrap items-center gap-3"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-cyan text-cyan" />
            </span>
            Real estate · Commercial · Aerial
          </motion.p>

          <h1 className="t-display max-w-[15ch]">
            <RevealLines
              play={ready}
              delay={0.2}
              lines={[
                <>MAKE YOUR</>,
                <>PROPERTY</>,
                <>
                  STAND <span className="t-accent">OUT.</span>
                </>,
              ]}
            />
          </h1>

          <div className="mt-9 flex flex-col gap-9 lg:flex-row lg:items-end lg:justify-between">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 18 }}
              transition={{ duration: 0.85, ease: EASE_OUT_EXPO, delay: 0.62 }}
              className="t-lead max-w-[46ch] text-body"
            >
              Professional real estate photography, cinematic video and aerial imagery that
              help properties get noticed — booked online, priced up front, delivered the
              next day.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 18 }}
              transition={{ duration: 0.85, ease: EASE_OUT_EXPO, delay: 0.74 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Magnetic>
                <Button to="/book" size="lg" className="group" trailing={<Arrow />}>
                  Book a shoot
                </Button>
              </Magnetic>
              <Button to="/portfolio" variant="ghost" size="lg">
                View portfolio
              </Button>
            </motion.div>
          </div>

          {/* The proof strip. Facts about delivery, not invented credentials. */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.9 }}
            className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/8 pt-7 sm:grid-cols-4"
          >
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <dd className="t-num text-[clamp(1.5rem,2.6vw,2rem)] leading-none text-bright">
                  <Counter value={s.value} suffix={s.suffix} />
                </dd>
                <dt className="t-label text-[9.5px]">{s.label}</dt>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* The scroll cue. Hidden once the page has moved at all. */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.08], [1, 0]) }}
          className="pointer-events-none absolute right-[var(--gutter)] bottom-6 hidden items-center gap-3 lg:flex"
        >
          <span className="font-mono text-[10px] tracking-[0.22em] text-faint uppercase">
            Scroll
          </span>
          <span className="relative block h-10 w-px overflow-hidden bg-white/12">
            <motion.span
              className="absolute inset-x-0 top-0 h-3 bg-cyan"
              animate={reduced ? undefined : { y: ['-100%', '340%'] }}
              transition={{ duration: 2, ease: [0.76, 0, 0.24, 1], repeat: Infinity, repeatDelay: 0.3 }}
            />
          </span>
        </motion.div>
      </section>
    </div>
  );
}
