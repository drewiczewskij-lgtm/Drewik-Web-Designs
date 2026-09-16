import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { Figure } from '@/components/Figure';
import { Reveal } from '@/components/fx/Reveal';
import { SectionHead } from '@/components/ui/Bits';
import { Arrow } from '@/components/ui/Button';
import { Lightbox } from '@/components/portfolio/Lightbox';
import { FEATURED_WORK, categoryLabel } from '@/data/portfolio';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

/* ============================================================================
   FEATURED WORK
   ----------------------------------------------------------------------------
   Four pieces in an asymmetric editorial spread rather than a row of four
   identical tiles. Each one moves at a slightly different rate as the section
   passes, which is what gives the block depth without any 3D at all.
   ========================================================================= */

const LAYOUT = [
  'md:col-span-7 md:row-span-2 aspect-[4/3] md:aspect-[4/4.4]',
  'md:col-span-5 aspect-[4/3] md:aspect-[5/3.4]',
  'md:col-span-5 aspect-[4/3] md:aspect-[5/3.4]',
  'md:col-span-12 aspect-[4/3] md:aspect-[16/6.5]',
];

export function FeaturedWork({ index = '04' }: { index?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Three different rates. Small numbers: parallax that you notice is too much.
  const slow = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-5%']);
  const fast = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-11%']);

  return (
    <section className="section border-t border-line">
      <div className="shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            index={index}
            label="Selected work"
            title={
              <>
                Recent listings, <span className="t-accent">shot properly.</span>
              </>
            }
          />
          <Link
            to="/portfolio"
            className="group inline-flex shrink-0 items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-bright uppercase"
          >
            <span className="link-rule">The full portfolio</span>
            <Arrow />
          </Link>
        </div>

        <div ref={ref} className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
          {FEATURED_WORK.map((item, i) => (
            <motion.div
              key={item.id}
              style={{ y: i === 0 || i === 3 ? slow : fast, willChange: 'transform' }}
              className={LAYOUT[i] ?? LAYOUT[1]}
            >
              <Reveal variant="wipe" index={i} className="h-full">
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group zoom-host edge relative block h-full w-full overflow-hidden bg-ink text-left"
                >
                  <Figure
                    image={item.image}
                    className="absolute inset-0 h-full w-full"
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-95"
                  />

                  <div className="on-image relative flex h-full flex-col justify-end gap-2 p-6 sm:p-8">
                    <span className="t-label text-cyan-soft">{categoryLabel(item.category)}</span>
                    <h3 className="font-display text-[clamp(1.1rem,2.2vw,1.65rem)] leading-tight font-semibold text-bright">
                      {item.title}
                    </h3>
                    <p className="max-w-[46ch] text-[13px] leading-snug text-body/85">
                      {item.caption}
                    </p>

                    <span className="mt-2 flex items-center gap-2 font-mono text-[10.5px] tracking-[0.18em] text-bright uppercase">
                      {item.kind === 'video' ? 'Watch' : 'View'}
                      <Arrow />
                    </span>
                  </div>
                </button>
              </Reveal>
            </motion.div>
          ))}
        </div>
      </div>

      <Lightbox
        items={FEATURED_WORK}
        index={open}
        onClose={() => setOpen(null)}
        onIndexChange={setOpen}
      />
    </section>
  );
}
