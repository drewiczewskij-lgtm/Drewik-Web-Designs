import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { Figure } from '@/components/Figure';
import { Reveal } from '@/components/fx/Reveal';
import { SectionHead, IncludeList, Pill } from '@/components/ui/Bits';
import { Button, Arrow } from '@/components/ui/Button';
import { CtaBand } from '@/components/sections/CtaBand';
import { Seo, serviceSchema, breadcrumbSchema } from '@/lib/seo';
import { SERVICES } from '@/data/services';
import { CONTACT } from '@/data/site';
import { getPackage, getAddon, money } from '@shared/catalog.mjs';

export default function Services() {
  return (
    <>
      <Seo
        title="Services — Photography, Video, Drone & Commercial"
        description={`Real estate photography and videography, drone stills and aerial video, commercial production and custom projects across ${CONTACT.serviceArea}. What each includes, and what it starts at.`}
        path="/services"
        schema={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
          ]),
          ...SERVICES.map((s) =>
            serviceSchema(s.name, s.summary, getPackage(s.packageId)?.basePriceCents),
          ),
        ]}
      />

      <PageHeader
        label="Services"
        title={['Six services.', 'One person', 'behind all of them.']}
        lead="What each one includes, how long it takes, and what it starts at. Every price here comes from the same list the checkout uses."
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Button to="/book" className="group" trailing={<Arrow />}>
            Book a shoot
          </Button>
          <Button to="/pricing" variant="ghost">
            See full pricing
          </Button>
        </div>
      </PageHeader>

      <div className="section">
        <div className="shell flex flex-col gap-20 sm:gap-28">
          {SERVICES.map((service, i) => {
            const pkg = getPackage(service.packageId);
            const addon = service.addonId ? getAddon(service.addonId) : null;
            const flipped = i % 2 === 1;

            // An add-on has its own price; otherwise the package's base applies.
            const priceLabel = addon
              ? `${money(addon.priceCents)} as an add-on`
              : pkg && !pkg.quoteOnly
                ? `From ${money(pkg.basePriceCents)}`
                : 'Quoted per project';

            return (
              <Reveal
                key={service.id}
                id={service.id}
                className="grid scroll-mt-28 items-start gap-8 lg:grid-cols-2 lg:gap-16"
              >
                <div className={flipped ? 'lg:order-2' : ''}>
                  <div className="zoom-host edge relative aspect-[4/3] overflow-hidden">
                    <Figure
                      image={service.image}
                      className="absolute inset-0 h-full w-full"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-void/75 via-transparent to-transparent"
                    />
                    <div className="absolute bottom-5 left-5 flex flex-wrap items-center gap-2">
                      <Pill tone="neon">{service.kicker}</Pill>
                      <Pill>{service.duration}</Pill>
                    </div>
                  </div>
                </div>

                <div className={`flex flex-col gap-6 ${flipped ? 'lg:order-1' : ''}`}>
                  <div className="flex flex-col gap-3">
                    <span className="font-mono text-[11px] tracking-[0.2em] text-neon">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2 className="t-h2 text-[clamp(1.6rem,3.2vw,2.4rem)]">{service.name}</h2>
                    <p className="t-lead max-w-[50ch] text-muted">{service.body}</p>
                  </div>

                  <div className="glass edge flex flex-col gap-5 p-6">
                    <h3 className="t-label">What’s included</h3>
                    <IncludeList items={service.includes} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                    <div className="flex flex-col">
                      <span className="t-label">Starting at</span>
                      <span className="t-num text-[22px] text-bright">{priceLabel}</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {service.quoteOnly ? (
                        <Button to="/commercial" className="group" trailing={<Arrow />}>
                          Get a quote
                        </Button>
                      ) : (
                        <Button
                          to={`/book?package=${service.packageId}`}
                          className="group"
                          trailing={<Arrow />}
                        >
                          Book now
                        </Button>
                      )}
                      <Button to={`/portfolio?filter=${service.portfolio}`} variant="ghost">
                        See examples
                      </Button>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <section className="section relative overflow-hidden border-t border-line">
        <div className="aurora opacity-40" aria-hidden="true" />
        <div className="shell relative">
          <SectionHead
            index="07"
            label="Not sure which"
            title={
              <>
                Most listings need <span className="t-accent">two things.</span>
              </>
            }
            lead="Stills for the portal, and a short film for social. That is the Photo + Video package, and it is what gets booked most. Add aerial if the lot, the roofline or the location is part of the sell."
            align="center"
          />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button to="/pricing" size="lg" className="group" trailing={<Arrow />}>
              Compare packages
            </Button>
            <Button to="/contact" variant="ghost" size="lg">
              Ask which fits
            </Button>
          </div>
        </div>
      </section>

      <CtaBand
        title={
          <>
            Tell us about the property and we’ll tell you <span className="t-accent">what it needs.</span>
          </>
        }
        lead="No upselling. If a photo package is enough, that is what you will be told."
        image="reTerrace"
      />

      <Footer />
    </>
  );
}
