import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { NEIGHBORHOODS, type Neighborhood } from '@/data/site';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { Figure } from './Figure';
import { Label, MaskedLines } from './Type';

/* ==========================================================================
   NEIGHBORHOODS
   Three full-bleed plates, each opening from a different inset as it comes
   through the viewport. The reveal is the whole idea: the frame widens to the
   edges of the page while the photograph drifts the other way.
   ======================================================================== */

/** Different starting insets, so the three reveals never look like one effect. */
const INSETS = [
  'inset(14% 10% 14% 10%)',
  'inset(0% 22% 0% 22%)',
  'inset(20% 6% 20% 6%)',
];

export function Neighborhoods() {
  return (
    <section
      id="neighborhoods"
      data-nav-theme="dark"
      className="bg-paper relative z-10"
      aria-labelledby="neighborhoods-title"
    >
      <div className="shell pt-[max(4.5rem,12vh)] pb-[max(2.5rem,6vh)]">
        <div className="border-ink/14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
          <Label index="06">Neighborhoods</Label>
          <span className="t-label text-stone-deep">Three of five</span>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 md:mt-14">
          <MaskedLines
            as="h2"
            id="neighborhoods-title"
            className="t-h1 max-w-[12ch]"
            lines={['The Places', 'Behind the', 'Addresses']}
          />
          <motion.p
            className="t-body text-ink/70 max-w-[34ch]"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.12 }}
          >
            A house is only ever half of the decision. These are the three markets we
            know street by street, and the honest figures behind each of them.
          </motion.p>
        </div>
      </div>

      <div>
        {NEIGHBORHOODS.map((n, i) => (
          <Panel key={n.id} neighborhood={n} index={i} />
        ))}
      </div>
    </section>
  );
}

function Panel({ neighborhood: n, index }: { neighborhood: Neighborhood; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const clip = useTransform(
    scrollYProgress,
    [0, 0.42],
    [reduced ? 'inset(0% 0% 0% 0%)' : INSETS[index % INSETS.length], 'inset(0% 0% 0% 0%)'],
  );
  const plateY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ['0%', '0%'] : ['-10%', '10%'],
  );
  const scale = useTransform(scrollYProgress, [0, 0.42], reduced ? [1, 1] : [1.12, 1]);

  return (
    <article
      ref={ref}
      className="text-paper relative min-h-[560px] w-full"
      style={{ height: '92svh' }}
      aria-label={`${n.name}, ${n.region}`}
    >
      <motion.div className="absolute inset-0 overflow-hidden" style={{ clipPath: clip }}>
        <motion.div className="absolute -inset-[10%]" style={{ y: plateY, scale }}>
          <Figure image={n.image} className="h-full w-full" sizes="100vw" quality={76} />
        </motion.div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(10,9,7,.78) 0%, rgba(10,9,7,.28) 40%, rgba(10,9,7,.05) 62%, rgba(10,9,7,.34) 100%)',
          }}
        />
      </motion.div>

      <div className="shell relative flex h-full flex-col justify-between py-[max(2rem,5vh)]">
        <div className="flex items-baseline justify-between gap-6">
          <span className="t-label t-num text-paper/70">
            {String(index + 1).padStart(2, '0')} / 03
          </span>
          <span className="t-label text-paper/70">{n.region}</span>
        </div>

        <div className="grid-editorial items-end">
          <div className="col-span-12 lg:col-span-6">
            <h3 className="t-display">
              <span className="mask-line">
                <motion.span
                  className="block"
                  initial={{ y: '112%' }}
                  whileInView={{ y: '0%' }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
                >
                  {n.name}
                </motion.span>
              </span>
            </h3>
          </div>

          <div className="col-span-12 mt-8 lg:col-span-5 lg:col-start-8 lg:mt-0">
            <ul className="border-paper/28 border-t pt-5">
              {n.lines.map((line, k) => (
                <li key={line} className="overflow-hidden">
                  <motion.span
                    className="t-lead block py-0.5"
                    initial={{ y: '110%' }}
                    whileInView={{ y: '0%' }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                      duration: 0.85,
                      ease: EASE_OUT_EXPO,
                      delay: 0.12 + k * 0.07,
                    }}
                  >
                    {line}
                  </motion.span>
                </li>
              ))}
            </ul>

            <motion.p
              className="t-body text-paper/70 mt-6 max-w-[42ch]"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.3 }}
            >
              {n.body}
            </motion.p>

            <motion.dl
              className="border-paper/28 mt-7 grid grid-cols-3 gap-x-4 border-t pt-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.38 }}
            >
              {n.stats.map((s) => (
                <div key={s.label} className="flex h-full flex-col justify-between">
                  <dt className="t-label text-paper/55 mb-2 leading-relaxed">{s.label}</dt>
                  <dd className="font-display t-num text-[clamp(1.2rem,2vw,1.7rem)] leading-none font-light">
                    {s.value}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </div>
      </div>
    </article>
  );
}
