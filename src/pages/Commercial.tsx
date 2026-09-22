import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { Figure } from '@/components/Figure';
import { Reveal } from '@/components/fx/Reveal';
import { SectionHead, IncludeList, Pill, Notice } from '@/components/ui/Bits';
import { Button, Arrow } from '@/components/ui/Button';
import { EnquiryForm, type EnquiryField } from '@/components/forms/EnquiryForm';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
import { Seo, serviceSchema, breadcrumbSchema } from '@/lib/seo';
import { COMMERCIAL_SECTORS, COMMERCIAL_SCOPES } from '@/data/services';
import { PORTFOLIO } from '@/data/portfolio';
import { CONTACT } from '@/data/site';

const FIELDS: EnquiryField[] = [
  { name: 'name', label: 'Your name', required: true, half: true },
  { name: 'business', label: 'Business name', required: true, half: true },
  { name: 'email', label: 'Email', type: 'email', required: true, half: true },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, half: true },
  {
    name: 'sector',
    label: 'What kind of business',
    type: 'select',
    options: COMMERCIAL_SECTORS.map((s) => s.label).concat('Something else'),
    half: true,
  },
  {
    name: 'scope',
    label: 'Roughly what you have in mind',
    type: 'select',
    options: COMMERCIAL_SCOPES.map((s) => `${s.name} — ${s.range}`).concat('Not sure yet'),
    half: true,
  },
  {
    name: 'timeline',
    label: 'When do you need it',
    placeholder: 'Next month, before a launch on the 14th, no fixed date…',
    half: true,
  },
  {
    name: 'budget',
    label: 'Budget range',
    placeholder: 'Optional, but it saves a round of guessing',
    half: true,
  },
  {
    name: 'brief',
    label: 'Tell me about the project',
    type: 'textarea',
    rows: 6,
    required: true,
    placeholder:
      'What the business does, who the film or photographs are for, where they will run, and anything you have seen that you liked.',
    hint: 'The more specific you are, the more useful the quote will be.',
  },
];

export default function Commercial() {
  const commercialWork = PORTFOLIO.filter(
    (p) => p.category === 'commercial' || p.category === 'lifestyle',
  );

  return (
    <>
      <Seo
        title="Commercial Video & Photography for Local Business"
        description={`Brand films, promotional video and commercial photography for restaurants, gyms, dealerships, hotels, retail and events across ${CONTACT.serviceArea}. Scoped and quoted per project.`}
        path="/commercial"
        schema={[
          serviceSchema(
            'Commercial video and photography production',
            'Brand films, promotional spots and social campaigns for small businesses.',
          ),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Commercial', path: '/commercial' },
          ]),
        ]}
      />

      <PageHeader
        label="Commercial"
        title={['Small businesses', 'deserve better', 'than a phone.']}
        lead="Brand films, promotional spots and social campaigns for the businesses people actually walk into. Scoped properly, quoted in writing, shot by the person you spoke to."
        image="commRestaurant"
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Commercial', path: '/commercial' },
        ]}
      >
        <Button href="#quote" size="lg" className="group" trailing={<Arrow />}>
          Get a custom quote
        </Button>
      </PageHeader>

      {/* Who this is for. */}
      <section className="section">
        <div className="shell">
          <SectionHead
            index="01"
            label="Who this is for"
            title={
              <>
                Eight kinds of business, <span className="t-accent">one standard.</span>
              </>
            }
            lead="If people have to decide whether to visit you based on what they can see online, this is the work that changes that decision."
          />

          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMMERCIAL_SECTORS.map((sector, i) => (
              <Reveal as="li" key={sector.id} index={i} className="group">
                <div className="edge zoom-host relative aspect-[4/5] overflow-hidden bg-ink">
                  <Figure
                    image={sector.image}
                    className="absolute inset-0 h-full w-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    imgClassName="opacity-75"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-void via-void/35 to-transparent"
                  />
                  <div className="on-image relative flex h-full flex-col justify-end gap-2 p-5">
                    <h3 className="font-display text-[17px] leading-tight font-semibold text-bright">
                      {sector.label}
                    </h3>
                    <p className="text-[12.5px] leading-snug text-body/85">{sector.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Scopes and honest ranges. */}
      <section className="section relative overflow-hidden border-t border-line">
        <div className="aurora opacity-40" aria-hidden="true" />
        <div className="shell relative">
          <SectionHead
            index="02"
            label="How it is scoped"
            title={
              <>
                Three shapes most projects <span className="t-accent">end up as.</span>
              </>
            }
            lead="Commercial work is quoted per project, but it is not a mystery. These are the ranges things usually land in."
          />

          <ul className="mt-14 grid gap-4 lg:grid-cols-3">
            {COMMERCIAL_SCOPES.map((scope, i) => (
              <Reveal as="li" key={scope.id} index={i} className="h-full">
                <div className="glass edge flex h-full flex-col gap-5 p-7">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="t-h3 text-[19px]">{scope.name}</h3>
                    <Pill tone="neon">{scope.range}</Pill>
                  </div>
                  <p className="flex-1 text-[13.5px] leading-relaxed text-muted">{scope.body}</p>
                  <div className="border-t border-line pt-5">
                    <IncludeList items={scope.points} />
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-8">
            <Notice className="max-w-[74ch]">
              These are starting ranges, not a price list. A restaurant needing one
              evening of coverage and a dealership needing a monthly inventory workflow
              are genuinely different jobs, and pretending otherwise with a fixed price
              would mean one of them overpaying.
            </Notice>
          </Reveal>
        </div>
      </section>

      {/* The process for commercial, which is not the same as a listing. */}
      <section className="section border-t border-line">
        <div className="shell">
          <SectionHead
            index="03"
            label="How it runs"
            title={
              <>
                Nothing gets shot until we both know <span className="t-accent">what it is for.</span>
              </>
            }
          />

          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {[
              { step: 'Call', body: 'Twenty minutes on what the business does, who you are trying to reach and where the film will run.' },
              { step: 'Treatment', body: 'A written outline: the idea, the shot list, the deliverables, the day, and a fixed price. Nothing is vague by the time you approve it.' },
              { step: 'Shoot', body: 'Half or full day. Interviews, b-roll, aerial where it helps. You get a rough look at the material the same day.' },
              { step: 'Deliver', body: 'Edit, grade, sound mix and captions, one round of changes included, then every cutdown your platforms need.' },
            ].map((s, i) => (
              <Reveal as="li" key={s.step} index={i} className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-neon/40 font-mono text-[12px] text-neon-soft">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {i < 3 && (
                    <span
                      aria-hidden="true"
                      className="hidden h-px flex-1 bg-gradient-to-r from-neon/40 to-transparent lg:block"
                    />
                  )}
                </div>
                <h3 className="t-h3 text-[19px]">{s.step}</h3>
                <p className="max-w-[34ch] text-[13.5px] leading-relaxed text-muted">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section border-t border-line">
        <div className="shell">
          <SectionHead
            index="04"
            label="Commercial work"
            title={
              <>
                Recent <span className="t-accent">brand work.</span>
              </>
            }
          />
          <PortfolioGrid items={commercialWork} showFilters={false} className="mt-12" />
        </div>
      </section>

      {/* The quote form. */}
      <section id="quote" className="section scroll-mt-24 border-t border-line">
        <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead
              index="05"
              label="Get a quote"
              title={
                <>
                  Tell me about the <span className="t-accent">project.</span>
                </>
              }
              lead="You will get a written quote and an outline of what the shoot would actually involve — not a number with nothing behind it."
            />

            <div className="mt-8 flex flex-col gap-3">
              <a
                href={`tel:${CONTACT.phoneHref}`}
                className="link-rule w-fit font-mono text-[14px] tracking-wide"
              >
                {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="link-rule w-fit text-[14px] break-all">
                {CONTACT.email}
              </a>
              <p className="t-label mt-2">Replies {CONTACT.responseTime}</p>
            </div>
          </div>

          <EnquiryForm
            fields={FIELDS}
            subject="Commercial quote request — KM Productions"
            submitLabel="Request a quote"
            successTitle="Quote request ready"
            successBody="Thank you. You will have a written quote and an outline within one business day."
          />
        </div>
      </section>

      <Footer />
    </>
  );
}
