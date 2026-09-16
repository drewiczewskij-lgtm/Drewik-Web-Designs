import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { Figure } from '@/components/Figure';
import { Reveal } from '@/components/fx/Reveal';
import { SectionHead, IncludeList, Notice, Stat } from '@/components/ui/Bits';
import { Button, Arrow } from '@/components/ui/Button';
import { CtaBand } from '@/components/sections/CtaBand';
import { Seo, breadcrumbSchema } from '@/lib/seo';
import { BRAND, CONTACT, FOUNDER, DIFFERENTIATORS } from '@/data/site';
import { IMAGES, isDrawn } from '@/data/images';

export default function About() {
  const portraitIsDrawn = isDrawn(IMAGES.founderPortrait.src);

  return (
    <>
      <Seo
        title={`About — ${BRAND.name}`}
        description={`${BRAND.name} is a one-person production company serving ${CONTACT.serviceArea}. Licensed for commercial drone work, professional kit throughout, every job shot by the founder.`}
        path="/about"
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />

      <PageHeader
        label="About"
        title={['One camera.', 'One person.', 'No shortcuts.']}
        lead={`${BRAND.name} is a small production company built on a simple limit: the person who walks your property is the person who lights it, flies it, edits it and answers the phone afterwards.`}
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ]}
      />

      {/* The founder. */}
      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <div className="edge relative aspect-[4/5] overflow-hidden bg-ink">
              <Figure
                image="founderPortrait"
                className="absolute inset-0 h-full w-full"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent"
              />
              <div className="on-image absolute right-5 bottom-5 left-5 flex flex-col gap-1">
                <p className="font-display text-[20px] font-semibold text-bright">
                  {FOUNDER.name}
                </p>
                <p className="t-label text-cyan-soft">{FOUNDER.role}</p>
              </div>
            </div>

            {portraitIsDrawn && (
              <Notice className="mt-4" title="Portrait not added yet">
                This is a drawn stand-in, not a photograph of a real person. Put the
                founder’s photo in <code className="font-mono text-[12px] text-cyan-soft">public/work/</code>{' '}
                and set <code className="font-mono text-[12px] text-cyan-soft">founderPortrait.src</code>{' '}
                in <code className="font-mono text-[12px] text-cyan-soft">src/data/images.ts</code>.
              </Notice>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <a
                href={`tel:${CONTACT.phoneHref}`}
                className="link-rule w-fit font-mono text-[14px] tracking-wide"
              >
                {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="link-rule w-fit text-[14px] break-all">
                {CONTACT.email}
              </a>
            </div>
          </Reveal>

          <div className="flex flex-col gap-10">
            <Reveal className="flex flex-col gap-6">
              <SectionHead
                index="01"
                label="The story"
                title={
                  <>
                    Why this <span className="t-accent">exists.</span>
                  </>
                }
              />
              {FOUNDER.bio.map((paragraph, i) => (
                <p key={i} className="t-lead max-w-[60ch] text-body">
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <Reveal delay={0.08} className="glass edge flex flex-col gap-6 p-7 sm:p-8">
              <blockquote className="font-display text-[clamp(1.15rem,2.2vw,1.6rem)] leading-[1.35] font-medium tracking-tight text-bright">
                “{FOUNDER.quote}”
                <footer className="mt-4 text-[13px] font-normal text-muted not-italic">
                  — {FOUNDER.name}, {FOUNDER.role}
                </footer>
              </blockquote>
            </Reveal>

            {/* The kit. The user asked for this to be said plainly, so it is. */}
            <Reveal delay={0.1} className="flex flex-col gap-6">
              <SectionHead
                index="02"
                label="Kit and capability"
                title={
                  <>
                    Professional equipment, <span className="t-accent">ground and air.</span>
                  </>
                }
              />
              <div className="glass edge flex flex-col gap-6 p-7">
                <IncludeList items={FOUNDER.capabilities} />
                <div className="border-t border-line pt-5">
                  <p className="text-[13.5px] leading-relaxed text-muted">
                    Drone work is flown under a commercial licence, inside controlled
                    airspace rules, never over people or moving traffic. Aerial video and
                    aerial stills are both shot on the same visit as the ground work,
                    which is why they cost a fraction of booking a separate operator.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Working facts, honestly framed. */}
      <section className="border-y border-line">
        <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value="1" label="Photographer" note="Every job, start to finish. Nothing subcontracted." />
          <Stat value="24h" label="Photo turnaround" note="Standard on every package, not an upgrade." />
          <Stat value="30mi" label="Included travel" note="Beyond that, billed at cost and shown up front." />
          <Stat value="4K" label="All film" note="Graded, scored and delivered in two aspect ratios." />
        </div>
      </section>

      {/* What you can expect. */}
      <section className="section">
        <div className="shell">
          <SectionHead
            index="03"
            label="How we work"
            title={
              <>
                Six promises, and all of them are <span className="t-accent">keepable.</span>
              </>
            }
            lead="There are no awards on this page and no client logos, because there is nothing there yet worth claiming. These are things within our control instead."
          />

          <ul className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIATORS.map((d, i) => (
              <Reveal
                as="li"
                key={d.title}
                index={i}
                className="group relative flex flex-col gap-3 bg-void p-7 transition-colors duration-500 hover:bg-ink"
              >
                <span className="font-mono text-[11px] tracking-[0.2em] text-neon/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="t-h3 text-[17px]">{d.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-muted">{d.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Service area. */}
      <section className="section relative overflow-hidden border-t border-line">
        <div className="aurora opacity-40" aria-hidden="true" />
        <div className="shell relative grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="flex flex-col gap-6">
            <SectionHead
              index="04"
              label="Where we work"
              title={
                <>
                  {CONTACT.serviceArea}, and <span className="t-accent">a good way beyond.</span>
                </>
              }
            />
            <p className="t-lead max-w-[52ch] text-muted">{CONTACT.serviceAreaDetail}</p>
            <div className="flex flex-wrap gap-3">
              <Button to="/book" className="group" trailing={<Arrow />}>
                Check availability
              </Button>
              <Button to="/contact" variant="ghost">
                Ask about your area
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="edge zoom-host relative aspect-[4/3] overflow-hidden">
            <Figure
              image="aerialNeighborhood"
              className="absolute inset-0 h-full w-full"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent"
            />
          </Reveal>
        </div>
      </section>

      <CtaBand
        title={
          <>
            Now you know who is <span className="t-accent">holding the camera.</span>
          </>
        }
        lead="Book a shoot, or call and describe the property first — both work."
        image="droneInFlight"
      />

      <Footer />
    </>
  );
}
