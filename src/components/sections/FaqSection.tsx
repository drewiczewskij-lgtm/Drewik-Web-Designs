import { Link } from 'react-router-dom';
import { Reveal } from '@/components/fx/Reveal';
import { SectionHead } from '@/components/ui/Bits';
import { Accordion } from '@/components/ui/Accordion';
import { FAQS, HOME_FAQ_IDS } from '@/data/faq';
import { Arrow } from '@/components/ui/Button';

/** The short FAQ used on the home page. The full set lives at /faq. */
export function FaqSection({ index = '07' }: { index?: string }) {
  const items = HOME_FAQ_IDS.map((id) => FAQS.find((f) => f.id === id)).filter(
    (f): f is (typeof FAQS)[number] => Boolean(f),
  );

  return (
    <section className="section border-t border-line">
      <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead
            index={index}
            label="Questions"
            title={
              <>
                The things everyone asks <span className="t-accent">first.</span>
              </>
            }
          />
          <Link
            to="/faq"
            className="group mt-8 inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-bright uppercase"
          >
            <span className="link-rule">All questions</span>
            <Arrow />
          </Link>
        </div>

        <Reveal>
          <Accordion items={items.map((f) => ({ id: f.id, q: f.q, a: f.a }))} />
        </Reveal>
      </div>
    </section>
  );
}
