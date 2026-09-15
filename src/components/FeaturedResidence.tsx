import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { FEATURED } from '@/data/properties';
import { EASE_IN_OUT_QUART, EASE_OUT_EXPO } from '@/lib/motion';
import { usePointerOffset } from '@/lib/usePointerOffset';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { Figure } from './Figure';
import { Cta } from './Cta';
import { Label, MaskedLines, Reveal } from './Type';

/* ==========================================================================
   FEATURED RESIDENCE
   The section that rises over the hero. Plate on the left, everything else in
   a narrow measure on the right, hung off a single hairline.
   ======================================================================== */

export function FeaturedResidence() {
  const p = FEATURED;
  const section = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const pointer = usePointerOffset<HTMLDivElement>(14);

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ['start end', 'end start'],
  });
  const plateY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-5%', '5%']);

  const stats = [
    { label: 'Bedrooms', value: String(p.beds) },
    { label: 'Bathrooms', value: String(p.baths) },
    { label: 'Interior', value: `${p.sqft.toLocaleString('en-US')} sq ft` },
    { label: 'Land', value: p.lot },
  ];

  return (
    <section
      ref={section}
      id="properties"
      data-nav-theme="dark"
      className="bg-paper relative z-10"
      aria-labelledby="featured-title"
    >
      <div className="shell grid-editorial items-start pt-[max(4.5rem,11vh)] pb-[max(4.5rem,11vh)]">
        {/* Section head — a rule, an index, a name. */}
        <div className="col-span-12 mb-10 md:mb-16">
          <div className="border-ink/14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
            <Label index="01">Featured Residence</Label>
            <span className="t-label text-stone-deep">
              {p.architect} · {p.year}
            </span>
          </div>
        </div>

        {/* The plate */}
        <motion.div
          ref={pointer.ref}
          onMouseMove={pointer.onMouseMove}
          onMouseLeave={pointer.onMouseLeave}
          className="zoom-host col-span-12 lg:col-span-7"
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: reduced ? 0.01 : 1.3, ease: EASE_IN_OUT_QUART }}
          data-cursor="VIEW"
        >
          <motion.div
            className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[5/4] lg:aspect-[4/5]"
            style={{ x: pointer.x, y: pointer.y }}
          >
            <motion.div className="absolute -inset-[7%]" style={{ y: plateY }}>
              <motion.div
                className="h-full w-full"
                initial={{ scale: 1.14 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: reduced ? 0.01 : 1.9, ease: EASE_OUT_EXPO }}
              >
                <Figure
                  image={p.cover}
                  className="h-full w-full"
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  quality={76}
                />
              </motion.div>
            </motion.div>
          </motion.div>

          <div className="border-ink/14 mt-4 flex items-baseline justify-between gap-6 border-t pt-3">
            <span className="t-label text-stone-deep">West elevation, 17:40</span>
            <span className="t-label text-stone-deep">Plate 01 / 10</span>
          </div>
        </motion.div>

        {/* The copy */}
        <div className="col-span-12 mt-12 lg:col-span-4 lg:col-start-9 lg:mt-0">
          <MaskedLines
            as="h2"
            className="t-h1"
            lines={[p.name]}
            id="featured-title"
          />

          <Reveal delay={0.12} className="mt-5">
            <p className="t-label text-stone-deep">{p.locationLine}</p>
          </Reveal>

          <Reveal delay={0.18} className="mt-9">
            <dl className="border-ink/14 grid grid-cols-2 gap-x-6 border-t">
              {stats.map((s) => (
                <div key={s.label} className="border-ink/14 border-b py-4">
                  <dt className="t-label text-stone-deep mb-2">{s.label}</dt>
                  <dd className="font-display t-num text-[1.6rem] leading-none font-light">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.22} className="mt-8">
            <span className="t-label text-stone-deep mb-3 block">Guide Price</span>
            <p className="font-display t-num text-[clamp(2rem,3.4vw,2.9rem)] leading-none font-light">
              {p.priceDisplay}
            </p>
          </Reveal>

          <Reveal delay={0.26} className="mt-8">
            <p className="t-body text-ink/80 max-w-[44ch]">{p.summary}</p>
          </Reveal>

          <Reveal delay={0.3} className="mt-10">
            <Cta to={`/residences/${p.slug}`} cursor="VIEW">
              View Property
            </Cta>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   INTENT
   A quiet band of paper between two dense sections. It states what the firm
   actually does, and gives three figures that are worth stating.
   ======================================================================== */

export function Intent() {
  return (
    <section
      id="intent"
      data-nav-theme="dark"
      className="bg-paper-2 relative z-10"
      aria-labelledby="intent-title"
    >
      <div className="shell grid-editorial py-[max(4.5rem,12vh)]">
        <div className="col-span-12 lg:col-span-3">
          <div className="border-ink/14 border-t pt-4">
            <Label index="02">Intent</Label>
          </div>
        </div>

        <div className="col-span-12 mt-8 lg:col-span-9 lg:mt-0">
          <MaskedLines
            as="h2"
            className="t-h2 max-w-[19ch]"
            id="intent-title"
            lines={[
              'We represent houses that',
              'were argued over — by the',
              'people who drew them.',
            ]}
          />

          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-14 lg:mt-16">
            <Reveal delay={0.06}>
              <p className="t-body text-ink/80 max-w-[46ch]">
                Arcadia was founded in 2009 to sell a narrow category of property:
                architecturally significant houses, waterfront land, and the small number
                of estates where the design is the asset. We take on a limited number of
                listings, we photograph them properly, and we do not write copy about
                lifestyle.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="t-body text-ink/80 max-w-[46ch]">
                Most of what we transact never reaches a portal. Sellers at this level
                want discretion more than they want reach, and buyers at this level are
                already known to us. What appears here is the public half of the book.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.16} className="mt-14">
            <dl className="border-ink/14 grid grid-cols-2 border-t md:grid-cols-4">
              {[
                { label: 'Founded', value: '2009' },
                { label: 'Closed volume', value: '$2.5B' },
                { label: 'Markets', value: 'Five' },
                { label: 'Off-market share', value: '58%' },
              ].map((s) => (
                <div key={s.label} className="border-ink/14 border-b py-5 pr-6 md:border-b-0">
                  <dt className="t-label text-stone-deep mb-3">{s.label}</dt>
                  <dd className="font-display t-num text-[clamp(1.6rem,2.6vw,2.2rem)] leading-none font-light">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
