import { Reveal } from '@/components/fx/Reveal';
import { SectionHead } from '@/components/ui/Bits';
import { PROCESS } from '@/data/site';

/** Four steps from booking to delivery. The whole engagement, on one screen. */
export function Process({ label = 'How it works', index = '02' }: { label?: string; index?: string }) {
  return (
    <section className="section border-t border-line">
      <div className="shell">
        <SectionHead
          index={index}
          label={label}
          title={
            <>
              Four steps, and none of them is <span className="t-accent">chasing you.</span>
            </>
          }
        />

        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {PROCESS.map((step, i) => (
            <Reveal as="li" key={step.step} index={i} className="relative flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-neon/40 font-mono text-[12px] text-neon-soft">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* The connector, on wide screens only. */}
                {i < PROCESS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="hidden h-px flex-1 bg-gradient-to-r from-neon/40 to-transparent lg:block"
                  />
                )}
              </div>
              <h3 className="t-h3 text-[19px]">{step.step}</h3>
              <p className="max-w-[34ch] text-[13.5px] leading-relaxed text-muted">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
