import { useEffect } from 'react';
import { BRAND } from '@/data/site';
import { Footer } from '@/components/Footer';
import { Cta } from '@/components/Cta';
import { Label, MaskedLines, Reveal } from '@/components/Type';

interface Clause {
  heading: string;
  body: string[];
}

const PRIVACY: Clause[] = [
  {
    heading: 'What we hold',
    body: [
      'When you send an enquiry we hold the name, email address, telephone number and message you gave us, together with the property the enquiry referred to. We do not buy contact data, and we do not enrich what you give us from third-party sources.',
      'This site sets no advertising or analytics cookies. Nothing you type into the enquiry form is stored in your browser after the page is closed.',
    ],
  },
  {
    heading: 'What we do with it',
    body: [
      'We use your details for one purpose: to answer you and, if you ask us to, to arrange a viewing. Where a viewing requires it, we pass your name and the date to the owner of the property or their representative. Nothing else is shared, and nothing is sold.',
      'Enquiry records are kept for twenty-four months from the last contact, then deleted. Transaction records are kept for seven years, as our licensing obligations require.',
    ],
  },
  {
    heading: 'Your rights',
    body: [
      'You may ask us at any time for a copy of what we hold, for a correction, or for deletion. Write to the address below and we will answer within thirty days.',
      'If you are unhappy with how we have handled your information you may complain to the relevant supervisory authority in your jurisdiction.',
    ],
  },
];

const TERMS: Clause[] = [
  {
    heading: 'About this site',
    body: [
      'Arcadia Estates is a fictional brokerage created for a design demonstration. The residences, prices, floor plans, people and figures shown here are invented. Nothing on this site is an offer, a solicitation, or a representation that any property is available.',
      'Photography is licensed stock imagery and does not depict the properties described.',
    ],
  },
  {
    heading: 'Listing information',
    body: [
      'Dimensions, areas, systems and completion dates in a real listing are supplied by the seller and their consultants. They should always be verified independently before an offer is made. Square footage measured to a different standard can differ materially.',
      'Guide prices are indications, not asking prices, and are subject to change without notice.',
    ],
  },
  {
    heading: 'Liability',
    body: [
      'This site is provided as is. We give no warranty that it will be uninterrupted or error-free, and we accept no liability for any decision taken in reliance on it.',
      'External links are provided for convenience. We are not responsible for the content of any site we link to.',
    ],
  },
];

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const privacy = kind === 'privacy';
  const title = privacy ? 'Privacy' : 'Terms';
  const clauses = privacy ? PRIVACY : TERMS;

  useEffect(() => {
    document.title = `${title} — ${BRAND.name}`;
  }, [title]);

  return (
    <>
      <section data-nav-theme="dark" className="bg-paper relative z-10">
        <div className="shell pt-[max(9rem,20vh)] pb-[max(4rem,10vh)]">
          <div className="border-ink/14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
            <Label index={privacy ? '01' : '02'}>{title}</Label>
            <span className="t-label text-stone-deep">
              Last revised {new Date().getFullYear()}
            </span>
          </div>

          <div className="grid-editorial mt-12 items-start md:mt-20">
            <div className="col-span-12 lg:col-span-4">
              <MaskedLines
                as="h1"
                className="t-h1"
                lines={privacy ? ['Privacy', 'Notice'] : ['Terms', 'of Use']}
              />
              <Reveal delay={0.12} className="mt-8">
                <p className="t-body text-ink/70 max-w-[38ch]">
                  {privacy
                    ? 'Short, because we collect very little. If anything here is unclear, write to us and ask.'
                    : 'This is a demonstration site. Everything on it is invented, and nothing on it is an offer.'}
                </p>
              </Reveal>
            </div>

            <div className="col-span-12 mt-12 lg:col-span-7 lg:col-start-6 lg:mt-0">
              {clauses.map((clause, i) => (
                <Reveal key={clause.heading} delay={i * 0.06} className="border-ink/14 mb-12 border-t pt-6">
                  <h2 className="t-h3 mb-5">{clause.heading}</h2>
                  <div className="space-y-5">
                    {clause.body.map((para, k) => (
                      <p key={k} className="t-body text-ink/80 max-w-[62ch]">
                        {para}
                      </p>
                    ))}
                  </div>
                </Reveal>
              ))}

              <Reveal className="border-ink/14 border-t pt-6">
                <h2 className="t-h3 mb-5">Contact</h2>
                <p className="t-body text-ink/80 max-w-[62ch]">
                  {BRAND.name}, {BRAND.offices[0].line}, {BRAND.offices[0].city}.
                </p>
                <p className="t-body text-ink/80 mt-2">
                  <a href={`mailto:${BRAND.email}`} className="link-rule">
                    {BRAND.email}
                  </a>
                </p>
                <div className="mt-10">
                  <Cta to="/">Return Home</Cta>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export function Privacy() {
  return <LegalPage kind="privacy" />;
}

export function Terms() {
  return <LegalPage kind="terms" />;
}
