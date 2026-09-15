import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { PROPERTIES, type Property } from '@/data/properties';
import { cn } from '@/lib/cn';
import { EASE_IN_OUT_QUART, EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { Figure } from './Figure';
import { Arrow } from './Cta';
import { Label, MaskedLines } from './Type';

/** The portfolio is dated by quarter, the way a printed book would be. */
function currentSeason(now = new Date()): string {
  const season = ['Winter', 'Spring', 'Summer', 'Autumn'][Math.floor((now.getMonth() % 12) / 3)];
  return `${season} ${now.getFullYear()}`;
}

/* ==========================================================================
   SELECTED RESIDENCES
   Four compositions, each laid out differently. Nothing repeats: the plate
   changes column span, side, proportion and vertical offset every time, so the
   page reads as a portfolio rather than a grid of results.
   ======================================================================== */

interface Composition {
  /** Tailwind column spans for the plate and the copy at lg and up. */
  plate: string;
  copy: string;
  ratio: string;
  align: 'end' | 'start';
  /** Vertical offset in rem at lg and up — what breaks the rhythm. */
  offset: string;
  plateOrder: string;
  copyOrder: string;
}

const COMPOSITIONS: Composition[] = [
  {
    plate: 'lg:col-span-7 lg:col-start-1',
    copy: 'lg:col-span-4 lg:col-start-9',
    ratio: 'aspect-[4/5]',
    align: 'end',
    offset: 'lg:pb-10',
    plateOrder: 'lg:order-1',
    copyOrder: 'lg:order-2',
  },
  {
    plate: 'lg:col-span-6 lg:col-start-7',
    copy: 'lg:col-span-4 lg:col-start-1',
    ratio: 'aspect-[5/4]',
    align: 'start',
    offset: 'lg:pt-28',
    plateOrder: 'lg:order-2',
    copyOrder: 'lg:order-1',
  },
  {
    plate: 'lg:col-span-5 lg:col-start-2',
    copy: 'lg:col-span-4 lg:col-start-8',
    ratio: 'aspect-[3/4]',
    align: 'end',
    offset: 'lg:pb-16',
    plateOrder: 'lg:order-1',
    copyOrder: 'lg:order-2',
  },
  {
    plate: 'lg:col-span-8 lg:col-start-5',
    copy: 'lg:col-span-3 lg:col-start-1',
    ratio: 'aspect-[16/10]',
    align: 'start',
    offset: 'lg:pt-20',
    plateOrder: 'lg:order-2',
    copyOrder: 'lg:order-1',
  },
];

export function PropertyCollection() {
  return (
    <section
      id="residences"
      data-nav-theme="dark"
      className="bg-paper relative z-10"
      aria-labelledby="residences-title"
    >
      <div className="shell pt-[max(4.5rem,12vh)]">
        <div className="border-ink/14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
          <Label index="04">The Portfolio</Label>
          <span className="t-label text-stone-deep">
            Four of eleven · {currentSeason()}
          </span>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 md:mt-14">
          <MaskedLines
            as="h2"
            id="residences-title"
            className="t-h1"
            lines={['Selected Residences']}
          />
          <motion.p
            className="t-body text-ink/70 max-w-[36ch]"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.12 }}
          >
            Currently available and openly represented. Seven further properties are held
            privately and shown on introduction.
          </motion.p>
        </div>
      </div>

      <div className="shell pt-[max(3rem,7vh)] pb-[max(4.5rem,12vh)]">
        {PROPERTIES.map((p, i) => (
          <PropertyRow
            key={p.slug}
            property={p}
            index={i}
            composition={COMPOSITIONS[i % COMPOSITIONS.length]}
          />
        ))}
      </div>
    </section>
  );
}

function PropertyRow({
  property: p,
  index,
  composition: c,
}: {
  property: Property;
  index: number;
  composition: Composition;
}) {
  const row = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: row,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-6%', '6%']);

  return (
    <div ref={row} className="border-ink/14 border-t first:border-t-0">
      <Link
        to={`/residences/${p.slug}`}
        className="group/row focus-bare arrow-host zoom-host grid-editorial block items-end py-[max(2.5rem,6vh)] lg:grid"
        data-cursor="VIEW"
        aria-label={`${p.name}, ${p.locationLine}. ${p.priceDisplay}.`}
      >
        {/* Plate */}
        <motion.div
          className={cn('relative overflow-hidden', c.plate, c.plateOrder, c.ratio)}
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: reduced ? 0.01 : 1.25, ease: EASE_IN_OUT_QUART }}
        >
          <motion.div className="absolute -inset-[8%]" style={{ y }}>
            <Figure
              image={p.cover}
              className="h-full w-full"
              sizes="(min-width: 1024px) 58vw, 100vw"
              quality={74}
            />
          </motion.div>

          {/* The index sits on the plate, bottom-left, over a soft scrim. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
            style={{
              background: 'linear-gradient(to top, rgba(12,11,9,.5), transparent)',
            }}
          />
          <span className="t-label t-num text-paper/85 absolute bottom-4 left-4 md:bottom-5 md:left-5">
            {String(index + 1).padStart(2, '0')}
          </span>
        </motion.div>

        {/* Copy */}
        <div
          className={cn(
            'mt-8 lg:mt-0',
            c.copy,
            c.copyOrder,
            c.offset,
            c.align === 'end' ? 'lg:self-end' : 'lg:self-start',
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.95, ease: EASE_OUT_EXPO, delay: 0.1 }}
          >
            <h3 className="t-h2 transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/row:translate-x-1.5">
              {p.name}
            </h3>

            <p className="t-label text-stone-deep mt-4">{p.locationLine}</p>

            <p className="font-display t-num mt-6 text-[clamp(1.6rem,2.6vw,2.2rem)] leading-none font-light">
              {p.priceCompact}
            </p>

            <dl className="border-ink/14 mt-7 flex flex-wrap gap-x-8 gap-y-2 border-t pt-4">
              {[
                { k: 'Beds', v: String(p.beds) },
                { k: 'Baths', v: String(p.baths) },
                { k: 'Sq Ft', v: p.sqft.toLocaleString('en-US') },
              ].map((s, k) => (
                <div
                  key={s.k}
                  className="transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/row:translate-y-[-2px]"
                  style={{ transitionDelay: `${k * 55}ms` }}
                >
                  <dt className="t-label text-stone-deep">{s.k}</dt>
                  <dd className="t-num font-display mt-1 text-xl leading-none font-light">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>

            <span className="mt-8 inline-flex items-center gap-4">
              <span className="t-label">View Residence</span>
              <Arrow />
            </span>
          </motion.div>
        </div>
      </Link>
    </div>
  );
}
