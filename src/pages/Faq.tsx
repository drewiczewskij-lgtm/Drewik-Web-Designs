import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { Reveal } from '@/components/fx/Reveal';
import { Accordion } from '@/components/ui/Accordion';
import { SectionHead } from '@/components/ui/Bits';
import { CtaBand } from '@/components/sections/CtaBand';
import { Seo, breadcrumbSchema, faqSchema } from '@/lib/seo';
import { FAQS, FAQ_GROUPS, faqsIn } from '@/data/faq';
import { CONTACT } from '@/data/site';

export default function Faq() {
  return (
    <>
      <Seo
        title="Frequently Asked Questions"
        description="How booking works, how long a shoot takes, when photos arrive, drone rules, weather, payments and rescheduling — answered properly."
        path="/faq"
        schema={[
          faqSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
        ]}
      />

      <PageHeader
        label="FAQ"
        title={['Everything', 'people ask.']}
        lead={`${FAQS.length} questions, answered properly rather than briefly. If yours is not here, call ${CONTACT.phone}.`}
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ]}
        compact
      />

      <div className="section pt-14">
        <div className="shell flex flex-col gap-20">
          {FAQ_GROUPS.map((group, i) => {
            const items = faqsIn(group.id);
            if (items.length === 0) return null;

            return (
              <section key={group.id} className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
                <div className="lg:sticky lg:top-28 lg:self-start">
                  <SectionHead
                    index={String(i + 1).padStart(2, '0')}
                    label={group.label}
                    title={group.blurb}
                  />
                  <p className="t-label mt-5 text-faint">
                    {items.length} {items.length === 1 ? 'question' : 'questions'}
                  </p>
                </div>

                <Reveal>
                  <Accordion
                    items={items.map((f) => ({ id: f.id, q: f.q, a: f.a }))}
                    headingLevel={3}
                  />
                </Reveal>
              </section>
            );
          })}
        </div>
      </div>

      <CtaBand
        label="Still unsure"
        title={
          <>
            Ask directly. It is <span className="t-accent">quicker.</span>
          </>
        }
        lead={`Call ${CONTACT.phone} and describe the property. You will get an honest answer about what it needs, even if that is less than you expected to buy.`}
        image="reWalkthrough"
        primary={{ label: 'Contact', to: '/contact' }}
        secondary={{ label: 'Book a shoot', to: '/book' }}
      />

      <Footer />
    </>
  );
}
