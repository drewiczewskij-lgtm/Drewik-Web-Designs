import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { AGENTS } from '@/data/site';
import { EASE_IN_OUT_QUART } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { Figure } from './Figure';
import { Cta } from './Cta';
import { Label, MaskedLines, Reveal } from './Type';

/* ==========================================================================
   ABOUT — THE PRINCIPAL
   A portrait spread. The quote carries the section; the figures sit under it
   in a single hairline row and are never repeated elsewhere.
   ======================================================================== */

export function Agent() {
  const elena = AGENTS.elena;
  const thomas = AGENTS.thomas;
  const plate = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: plate,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-7%', '7%']);

  return (
    <section
      id="about"
      data-nav-theme="dark"
      className="bg-paper-2 relative z-10"
      aria-labelledby="about-title"
    >
      <div className="shell pt-[max(4.5rem,12vh)] pb-[max(4.5rem,12vh)]">
        <div className="border-ink/14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
          <Label index="07">The Principal</Label>
          <span className="t-label text-stone-deep">Arcadia Estates · Est. 2009</span>
        </div>

        <div className="grid-editorial mt-12 items-start md:mt-20">
          {/* Portrait */}
          <motion.div
            ref={plate}
            className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-5 lg:col-start-1"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: reduced ? 0.01 : 1.25, ease: EASE_IN_OUT_QUART }}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <motion.div className="absolute -inset-[8%]" style={{ y }}>
                <Figure
                  image={elena.portrait}
                  className="h-full w-full"
                  sizes="(min-width: 1024px) 40vw, 80vw"
                  quality={74}
                />
              </motion.div>
            </div>
            <div className="border-ink/14 mt-4 flex items-baseline justify-between gap-6 border-t pt-3">
              <span className="t-label text-stone-deep">{elena.name}</span>
              <span className="t-label text-stone-deep">Malibu, 2024</span>
            </div>
          </motion.div>

          {/* Copy */}
          <div className="col-span-12 mt-14 lg:col-span-6 lg:col-start-7 lg:mt-0">
            <MaskedLines
              as="h2"
              id="about-title"
              className="t-h1"
              lines={[elena.name]}
            />
            <Reveal delay={0.1} className="mt-5">
              <p className="t-label text-bronze">{elena.role}</p>
            </Reveal>

            <Reveal delay={0.16} className="mt-10">
              <blockquote className="t-quote text-ink max-w-[26ch]">
                <span className="text-stone" aria-hidden="true">
                  “
                </span>
                {elena.quote}
                <span className="text-stone" aria-hidden="true">
                  ”
                </span>
              </blockquote>
            </Reveal>

            <div className="mt-10 space-y-5">
              {elena.bio.map((para, i) => (
                <Reveal key={i} delay={0.2 + i * 0.06}>
                  <p className="t-body text-ink/80 max-w-[52ch]">{para}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3} className="mt-12">
              <dl className="border-ink/14 grid grid-cols-2 border-t sm:grid-cols-4">
                {[
                  { label: 'Practising since', value: String(elena.since) },
                  { label: 'Transactions', value: elena.transactions },
                  { label: 'Closed volume', value: elena.volume },
                  { label: 'Markets', value: String(elena.markets.length) },
                ].map((s) => (
                  <div key={s.label} className="border-ink/14 border-b py-5 pr-5 sm:border-b-0">
                    <dt className="t-label text-stone-deep mb-3 leading-relaxed">
                      {s.label}
                    </dt>
                    <dd className="font-display t-num text-[clamp(1.5rem,2.3vw,2rem)] leading-none font-light">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.34} className="mt-8">
              <p className="t-label text-stone-deep">
                Serving {elena.markets.join(' · ')}
              </p>
            </Reveal>

            <Reveal delay={0.38} className="mt-10 flex flex-wrap gap-x-12 gap-y-4">
              <Cta href={`mailto:${elena.email}`}>Write to Elena</Cta>
              <Cta href={elena.phoneHref} bare>
                {elena.phone}
              </Cta>
            </Reveal>
          </div>
        </div>

        {/* The second name, given less room on purpose. */}
        <Reveal delay={0.1} className="border-ink/14 mt-20 border-t pt-8">
          <div className="grid-editorial items-start">
            <div className="col-span-12 sm:col-span-4 lg:col-span-2">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Figure
                  image={thomas.portrait}
                  className="h-full w-full"
                  sizes="(min-width: 1024px) 16vw, 33vw"
                  quality={62}
                />
              </div>
            </div>
            <div className="col-span-12 mt-6 sm:col-span-8 sm:mt-0 lg:col-span-6 lg:col-start-3">
              <h3 className="t-h3">{thomas.name}</h3>
              <p className="t-label text-bronze mt-3">{thomas.role}</p>
              <p className="t-body text-ink/75 mt-5 max-w-[50ch]">{thomas.bio[0]}</p>
            </div>
            <div className="col-span-12 mt-8 lg:col-span-3 lg:col-start-10 lg:mt-0">
              <dl className="border-ink/14 border-t pt-4">
                <div className="flex items-baseline justify-between gap-4 py-1.5">
                  <dt className="t-label text-stone-deep">Since</dt>
                  <dd className="t-label t-num">{thomas.since}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-1.5">
                  <dt className="t-label text-stone-deep">Transactions</dt>
                  <dd className="t-label t-num">{thomas.transactions}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-1.5">
                  <dt className="t-label text-stone-deep">Markets</dt>
                  <dd className="t-label">{thomas.markets.join(', ')}</dd>
                </div>
              </dl>
              <div className="mt-6">
                <Cta href={`mailto:${thomas.email}`}>Write to Thomas</Cta>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
