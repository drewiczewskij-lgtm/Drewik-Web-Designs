import { Link } from 'react-router-dom';
import { Hero } from '@/components/sections/Hero';
import { ServicesGrid } from '@/components/sections/ServicesGrid';
import { Process } from '@/components/sections/Process';
import { FeaturedWork } from '@/components/sections/FeaturedWork';
import { WhyUs } from '@/components/sections/WhyUs';
import { Testimonials } from '@/components/sections/Testimonials';
import { PricingPreview } from '@/components/sections/PricingPreview';
import { FaqSection } from '@/components/sections/FaqSection';
import { CtaBand } from '@/components/sections/CtaBand';
import { Footer } from '@/components/layout/Footer';
import { SectionHead } from '@/components/ui/Bits';
import { Reveal } from '@/components/fx/Reveal';
import { Arrow } from '@/components/ui/Button';
import { Seo, localBusinessSchema } from '@/lib/seo';
import { CONTACT } from '@/data/site';

export default function Home({ ready = true }: { ready?: boolean }) {
  return (
    <>
      <Seo
        title="KM Productions — Real Estate Photography, Video & Drone"
        description={`Professional real estate photography, cinematic property video and licensed aerial coverage in ${CONTACT.serviceArea}. Book online, see the price before you pay, photos back the next business day.`}
        path="/"
        schema={localBusinessSchema()}
      />

      <Hero ready={ready} />

      {/* 01 — Services */}
      <section className="section relative border-t border-line">
        <div className="shell">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHead
              index="01"
              label="What we shoot"
              title={
                <>
                  Everything a listing needs, <span className="t-accent">in one visit.</span>
                </>
              }
              lead="Stills, film and aerial, shot by the same person on the same day — which is why they look like they belong together."
            />
            <Link
              to="/services"
              className="group inline-flex shrink-0 items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-bright uppercase"
            >
              <span className="link-rule">All services</span>
              <Arrow />
            </Link>
          </div>

          <ServicesGrid className="mt-14" />
        </div>
      </section>

      <Process index="02" />
      <WhyUs />
      <FeaturedWork index="04" />

      <CtaBand
        label="Real estate"
        title={
          <>
            The first three photographs decide <span className="t-accent">everything.</span>
          </>
        }
        lead="Buyers scroll past a listing in under two seconds. Give them a reason to stop."
        image="aerialProperty"
        primary={{ label: 'Book your property shoot', to: '/book' }}
        secondary={{ label: 'See real estate work', to: '/real-estate' }}
      />

      <PricingPreview index="05" />
      <Testimonials />
      <FaqSection index="07" />

      {/* A last, quieter word before the footer's call to action. */}
      <section className="section border-t border-line">
        <div className="shell">
          {/* rem, not `ch`: the statement inside is ~2.4rem, but a `ch` here
              would be measured in this wrapper's 15px body font. */}
          <Reveal className="mx-auto flex max-w-[46rem] flex-col items-center gap-6 text-center">
            <p className="t-label">{CONTACT.serviceArea}</p>
            <p className="font-display text-[clamp(1.4rem,3.4vw,2.4rem)] leading-[1.24] font-medium tracking-tight text-bright">
              One photographer. Professional kit, ground and air. Everything back before
              your listing goes live.
            </p>
            <Link
              to="/about"
              className="group inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-bright uppercase"
            >
              <span className="link-rule">Who shoots your job</span>
              <Arrow />
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
