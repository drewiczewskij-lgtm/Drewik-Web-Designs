import { Reveal } from '@/components/fx/Reveal';
import { SectionHead } from '@/components/ui/Bits';
import { DIFFERENTIATORS } from '@/data/site';

/**
 * Why book this over the cheaper option.
 *
 * Every line is a promise that can actually be kept — turnaround, who holds
 * the camera, how the price is arrived at. There is no "10 years of
 * excellence" here, because nobody has checked that and it is not true yet.
 */
export function WhyUs() {
  return (
    <section className="section relative overflow-hidden border-t border-line">
      <div className="aurora opacity-50" aria-hidden="true" />
      <div className="shell relative">
        <SectionHead
          index="03"
          label="Why KM Productions"
          title={
            <>
              The difference is in what you <span className="t-accent">get back.</span>
            </>
          }
          lead="Six things worth knowing before you hand someone the keys to a listing."
        />

        <ul className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {DIFFERENTIATORS.map((d, i) => (
            <Reveal
              as="li"
              key={d.title}
              index={i}
              className="group relative flex flex-col gap-3 bg-void p-7 transition-colors duration-500 hover:bg-ink sm:p-9"
            >
              <span
                aria-hidden="true"
                className="font-mono text-[11px] tracking-[0.2em] text-neon/70"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="t-h3 text-[17px]">{d.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-muted">{d.body}</p>

              {/* A hairline that draws itself along the top edge on hover. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-neon to-cyan transition-transform duration-600 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100"
              />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
