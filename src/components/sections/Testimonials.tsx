import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Reveal } from '@/components/fx/Reveal';
import { SectionHead, Notice, Pill } from '@/components/ui/Bits';
import { TESTIMONIALS, HAS_PLACEHOLDER_TESTIMONIALS } from '@/data/testimonials';
import { EASE_OUT_EXPO, EASE_UI } from '@/lib/motion';

/* ============================================================================
   TESTIMONIALS
   ----------------------------------------------------------------------------
   Every quote currently on the site is invented, and the site says so — once,
   clearly, above the section, and again on each card as a small label.

   That notice is not decoration. Presenting written-for-the-purpose copy as a
   customer review is a lie told to a stranger who is about to spend money, and
   the label disappears on its own the moment a quote stops being a placeholder
   (drop `placeholder: true` in `src/data/testimonials.ts`).
   ========================================================================= */

export function Testimonials() {
  const [active, setActive] = useState(0);
  const item = TESTIMONIALS[active];

  return (
    <section className="section relative overflow-hidden border-t border-line">
      <div className="aurora opacity-40" aria-hidden="true" />

      <div className="shell relative">
        <SectionHead
          index="06"
          label="What clients say"
          title={
            <>
              Words from the people who <span className="t-accent">book the work.</span>
            </>
          }
        />

        {HAS_PLACEHOLDER_TESTIMONIALS && (
          <Notice tone="warn" className="mt-8 max-w-[70ch]" title="Example wording">
            The quotes below are placeholders written to show the section, not
            reviews from real customers. They are labelled as examples wherever they
            appear and will be replaced with genuine client feedback.
          </Notice>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          {/* The quote itself. */}
          <Reveal className="relative flex min-h-[290px] flex-col justify-between">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-8 -left-2 font-display text-[9rem] leading-none text-neon/10 select-none"
            >
              “
            </span>

            <AnimatePresence mode="wait">
              <motion.blockquote
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                className="relative flex flex-1 flex-col justify-between gap-8"
              >
                <p className="font-display text-[clamp(1.25rem,2.6vw,2rem)] leading-[1.32] font-medium tracking-tight text-bright">
                  {item.quote}
                </p>

                <footer className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <cite className="flex flex-col not-italic">
                    <span className="text-[14px] font-medium text-bright">{item.name}</span>
                    <span className="text-[12.5px] text-muted">
                      {item.role}, {item.company}
                    </span>
                  </cite>
                  {item.service && <Pill>{item.service}</Pill>}
                  {item.placeholder && <Pill tone="warn">Example</Pill>}
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </Reveal>

          {/* The selector. A list of buttons, not dots — you can see what you
              are choosing, and it is operable by keyboard without guessing. */}
          <Reveal delay={0.1}>
            <ul className="flex flex-col divide-y divide-line border-y border-line">
              {TESTIMONIALS.map((t, i) => {
                const isActive = i === active;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-current={isActive}
                      className="group relative flex w-full items-center gap-4 py-3.5 text-left"
                    >
                      <span
                        className={`font-mono text-[10.5px] tracking-[0.16em] transition-colors duration-200 ${
                          isActive ? 'text-neon' : 'text-faint'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`flex-1 truncate text-[13px] transition-colors duration-200 ${
                          isActive ? 'text-bright' : 'text-muted group-hover:text-body'
                        }`}
                      >
                        {t.service ?? t.role}
                      </span>
                      {isActive && (
                        <motion.span
                          layoutId="testimonial-marker"
                          className="h-4 w-px bg-neon"
                          style={{ boxShadow: '0 0 10px 1px rgb(45 125 255 / 0.9)' }}
                          transition={{ duration: 0.28, ease: EASE_UI }}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
