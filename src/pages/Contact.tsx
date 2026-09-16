import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { Reveal } from '@/components/fx/Reveal';
import { SectionHead, Notice } from '@/components/ui/Bits';
import { Button, Arrow } from '@/components/ui/Button';
import { EnquiryForm, type EnquiryField } from '@/components/forms/EnquiryForm';
import { Seo, localBusinessSchema, breadcrumbSchema } from '@/lib/seo';
import { BRAND, CONTACT, SOCIALS } from '@/data/site';
import { SERVICES } from '@/data/services';
import { workingDaysSummary } from '@shared/schedule.mjs';

const FIELDS: EnquiryField[] = [
  { name: 'name', label: 'Name', required: true, half: true },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, half: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  {
    name: 'service',
    label: 'What are you interested in',
    type: 'select',
    options: SERVICES.map((s) => s.name).concat('Not sure yet'),
  },
  {
    name: 'message',
    label: 'Message',
    type: 'textarea',
    rows: 6,
    required: true,
    placeholder:
      'The property address or the business, roughly when you need it, and anything else worth knowing.',
  },
];

export default function Contact() {
  const hours = workingDaysSummary();

  return (
    <>
      <Seo
        title="Contact"
        description={`Call ${CONTACT.phone} or email ${CONTACT.email}. ${BRAND.name} covers ${CONTACT.serviceArea} for real estate and commercial photography, video and drone work.`}
        path="/contact"
        schema={[
          localBusinessSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ]}
      />

      <PageHeader
        label="Contact"
        title={['Let’s talk about', 'the property.']}
        lead={`Call, email, or use the form. Replies ${CONTACT.responseTime} — and if you already know what you need, the booking page is faster than all three.`}
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ]}
        compact
      >
        <Button to="/book" size="lg" className="group" trailing={<Arrow />}>
          Book a shoot instead
        </Button>
      </PageHeader>

      <section className="section pt-14">
        <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* The details. Everything reachable in one tap. */}
          <div className="flex flex-col gap-10 lg:sticky lg:top-28 lg:self-start">
            <Reveal className="flex flex-col gap-7">
              <div className="flex flex-col gap-2">
                <p className="t-label">Phone</p>
                <a
                  href={`tel:${CONTACT.phoneHref}`}
                  className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-bright transition-colors duration-200 hover:text-neon-soft"
                >
                  {CONTACT.phone}
                </a>
                <p className="text-[13px] text-muted">
                  Answered during studio hours. Voicemail is checked the same day.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="t-label">Email</p>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="font-display text-[clamp(1.05rem,2vw,1.35rem)] font-semibold tracking-tight break-all text-bright transition-colors duration-200 hover:text-neon-soft"
                >
                  {CONTACT.email}
                </a>
                <p className="text-[13px] text-muted">Replies {CONTACT.responseTime}.</p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="t-label">Service area</p>
                <p className="text-[15px] text-bright">{CONTACT.serviceArea}</p>
                <p className="max-w-[40ch] text-[13px] leading-relaxed text-muted">
                  {CONTACT.serviceAreaDetail}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.06} className="flex flex-col gap-3">
              <p className="t-label">Studio hours</p>
              <ul className="flex flex-col divide-y divide-line border-y border-line">
                {hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4 py-2.5 text-[13px]">
                    <span className="text-body">{h.day}</span>
                    <span className="font-mono text-[12px] tracking-tight text-muted">
                      {h.hours}
                    </span>
                  </li>
                ))}
                <li className="flex justify-between gap-4 py-2.5 text-[13px]">
                  <span className="text-faint">Sunday</span>
                  <span className="font-mono text-[12px] text-faint">Closed</span>
                </li>
              </ul>
              <p className="text-[12.5px] text-faint">
                Twilight shoots run after these hours, because the sun decides when.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="flex flex-col gap-3">
              <p className="t-label">Follow the work</p>
              <ul className="flex flex-wrap gap-2">
                {SOCIALS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase transition-[color,border-color,box-shadow] duration-300 hover:border-neon/50 hover:text-bright"
                    >
                      {s.label}
                      <span className="text-faint normal-case">{s.handle}</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* The form. */}
          <div className="flex flex-col gap-8">
            <SectionHead
              index="01"
              label="Send a message"
              title={
                <>
                  Tell me what you’re <span className="t-accent">working on.</span>
                </>
              }
            />

            <EnquiryForm
              fields={FIELDS}
              subject="Enquiry — KM Productions"
              submitLabel="Send message"
              successTitle="Message ready"
              successBody={`Thank you. You will hear back ${CONTACT.responseTime}.`}
            />

            <Notice title="Already know what you need?">
              The booking page shows live availability and the exact total, and takes
              about two minutes.{' '}
              <Button to="/book" variant="quiet" size="sm" className="!px-0">
                Go to booking →
              </Button>
            </Notice>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
