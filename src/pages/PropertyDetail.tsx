import { motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PROPERTIES, getProperty } from '@/data/properties';
import { BRAND, AGENTS } from '@/data/site';
import { EASE_IN_OUT_QUART, EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useSmoothScroll } from '@/lib/smoothScroll';
import { Figure } from '@/components/Figure';
import { Gallery } from '@/components/Gallery';
import { FloorPlan } from '@/components/FloorPlan';
import { Walkthrough } from '@/components/Walkthrough';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { Cta, Arrow } from '@/components/Cta';
import { Label, MaskedLines, Reveal } from '@/components/Type';

/* ==========================================================================
   PROPERTY DETAIL
   Built like a project page in an architecture monograph: plate, facts,
   narrative, tour, plates, plan, schedule, place, representation, enquiry.
   ======================================================================== */

export default function PropertyDetail() {
  const { slug } = useParams();
  const property = getProperty(slug);
  const reduced = usePrefersReducedMotion();
  const { scrollTo } = useSmoothScroll();
  const heroWrap = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroWrap,
    offset: ['start start', 'end start'],
  });
  const plateScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 1.14]);
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.6]);
  const contentY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -90]);
  const contentFade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    if (!property) return;
    const previous = document.title;
    document.title = `${property.name}, ${property.locationLine} — ${BRAND.name}`;
    return () => {
      document.title = previous;
    };
  }, [property]);

  if (!property) return <Navigate to="/404" replace />;

  const p = property;
  const agent = AGENTS[p.agent];
  const others = PROPERTIES.filter((o) => o.slug !== p.slug);
  const next = others[0];

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <div ref={heroWrap} data-nav-theme="light" className="relative h-[142svh]">
        <section className="bg-charcoal sticky top-0 h-[100svh] overflow-hidden">
          <motion.div className="absolute inset-0" style={{ scale: plateScale }}>
            <motion.div
              className="h-full w-full"
              initial={{ scale: reduced ? 1 : 1.07 }}
              animate={{ scale: 1 }}
              transition={{ duration: reduced ? 0.01 : 2.2, ease: EASE_OUT_EXPO }}
            >
              <Figure
                image={p.hero}
                priority
                eager
                className="h-full w-full"
                sizes="100vw"
                quality={80}
              />
            </motion.div>
          </motion.div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(12,11,9,.84) 0%, rgba(12,11,9,.4) 26%, rgba(12,11,9,.06) 56%, rgba(12,11,9,.36) 100%)',
            }}
          />
          <motion.div
            aria-hidden="true"
            className="bg-charcoal pointer-events-none absolute inset-0"
            style={{ opacity: veil }}
          />

          <motion.div
            className="text-paper absolute inset-x-0 bottom-0 z-10"
            style={{ y: contentY, opacity: contentFade }}
          >
            <div className="shell grid-editorial items-end pb-[max(2.25rem,7vh)]">
              <div className="col-span-12 lg:col-span-8">
                <motion.div
                  className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 md:mb-7"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0.01 : 0.9, ease: EASE_OUT_EXPO, delay: 0.2 }}
                >
                  <Link
                    to="/"
                    state={{ section: '#residences' }}
                    className="link-rule t-label text-paper/70"
                  >
                    ← All Residences
                  </Link>
                  <span className="bg-paper/40 h-px w-9" aria-hidden="true" />
                  <span className="t-label">{p.status}</span>
                </motion.div>

                <h1 className="t-display">
                  <span className="mask-line">
                    <motion.span
                      className="block"
                      initial={{ y: '112%' }}
                      animate={{ y: '0%' }}
                      transition={{ duration: reduced ? 0.01 : 1.3, ease: EASE_OUT_EXPO, delay: 0.26 }}
                    >
                      {p.name}
                    </motion.span>
                  </span>
                </h1>

                <motion.p
                  className="t-label text-paper/70 mt-6"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0.01 : 0.9, ease: EASE_OUT_EXPO, delay: 0.46 }}
                >
                  {p.locationLine} · {p.architect} · {p.year}
                </motion.p>
              </div>

              <motion.div
                className="col-span-12 mt-8 lg:col-span-4 lg:mt-0 lg:text-right"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0.01 : 1, ease: EASE_OUT_EXPO, delay: 0.54 }}
              >
                <span className="t-label text-paper/55 mb-3 block">Guide Price</span>
                <span className="font-display t-num block text-[clamp(1.85rem,3.4vw,3rem)] leading-none font-light">
                  {p.priceDisplay}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* ---------------- OVERVIEW ---------------- */}
      <section
        data-nav-theme="dark"
        className="bg-paper relative z-10"
        aria-labelledby="overview-title"
      >
        <div className="shell pt-[max(4rem,10vh)] pb-[max(4rem,10vh)]">
          <div className="border-ink/14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
            <Label index="01">Overview</Label>
            <span className="t-label text-stone-deep">Reference AE-{p.year}-{p.slug.slice(0, 3).toUpperCase()}</span>
          </div>

          <div className="grid-editorial mt-12 items-start md:mt-16">
            <div className="col-span-12 lg:col-span-7">
              <MaskedLines
                as="h2"
                id="overview-title"
                className="t-h2 max-w-[20ch]"
                lines={[p.summary]}
              />
            </div>

            <div className="col-span-12 mt-10 lg:col-span-4 lg:col-start-9 lg:mt-0">
              <Reveal>
                <dl className="border-ink/14 grid grid-cols-2 border-t">
                  {[
                    { label: 'Bedrooms', value: String(p.beds) },
                    { label: 'Bathrooms', value: String(p.baths) },
                    { label: 'Interior', value: `${p.sqft.toLocaleString('en-US')} sq ft` },
                    { label: 'Land', value: p.lot },
                    { label: 'Completed', value: String(p.year) },
                    { label: 'Status', value: 'Available' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="border-ink/14 flex h-full flex-col justify-between border-b py-4 pr-4"
                    >
                      <dt className="t-label text-stone-deep mb-2">{s.label}</dt>
                      <dd className="font-display t-num text-[1.45rem] leading-none font-light">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              <Reveal delay={0.1} className="mt-9">
                <button
                  onClick={() => scrollTo('#contact', -1)}
                  className="group/submit focus-bare border-ink/30 relative inline-flex w-full items-center justify-between gap-5 overflow-hidden border px-7 py-5"
                >
                  <span
                    aria-hidden="true"
                    className="bg-ink absolute inset-0 origin-bottom scale-y-0 transition-transform duration-[700ms] ease-[cubic-bezier(.76,0,.24,1)] group-hover/submit:scale-y-100 group-focus-visible/submit:scale-y-100"
                  />
                  <span className="t-label group-hover/submit:text-paper group-focus-visible/submit:text-paper relative transition-colors duration-500">
                    Schedule Private Viewing
                  </span>
                  <span className="group-hover/submit:text-paper group-focus-visible/submit:text-paper arrow-host relative transition-colors duration-500">
                    <Arrow />
                  </span>
                </button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- ARCHITECTURE ---------------- */}
      <section
        data-nav-theme="dark"
        className="bg-paper-2 relative z-10"
        aria-labelledby="architecture-title"
      >
        <div className="shell pt-[max(4rem,10vh)] pb-[max(4rem,10vh)]">
          <div className="border-ink/14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
            <Label index="02">Architecture</Label>
            <span className="t-label text-stone-deep">{p.architect}</span>
          </div>

          <div className="grid-editorial mt-12 items-start md:mt-16">
            <div className="col-span-12 lg:col-span-3">
              <MaskedLines
                as="h2"
                id="architecture-title"
                className="t-h3"
                lines={['On the', 'design']}
              />
            </div>

            <div className="col-span-12 mt-8 lg:col-span-7 lg:col-start-5 lg:mt-0">
              <div className="space-y-6">
                {p.narrative.map((para, i) => (
                  <Reveal key={i} delay={i * 0.06}>
                    <p className="t-body text-ink/82 max-w-[62ch]">{para}</p>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.2} className="border-ink/14 mt-14 border-t pt-8">
                <blockquote className="t-quote max-w-[28ch]">
                  <span className="text-stone" aria-hidden="true">
                    “
                  </span>
                  {p.pull}
                  <span className="text-stone" aria-hidden="true">
                    ”
                  </span>
                </blockquote>
                <p className="t-label text-stone-deep mt-6">{p.architect}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- TOUR ---------------- */}
      <Walkthrough property={p} index="03" compact />

      {/* ---------------- GALLERY ---------------- */}
      <Gallery plates={[...p.gallery]} title={p.name} index="04" heading="The Photography" />

      {/* ---------------- PLAN ---------------- */}
      <FloorPlan plan={p.floor} propertyName={p.name} index="05" />

      {/* ---------------- SCHEDULE OF AMENITIES ---------------- */}
      <section
        data-nav-theme="dark"
        className="bg-paper relative z-10"
        aria-labelledby="amenities-title"
      >
        <div className="shell pt-[max(4rem,10vh)] pb-[max(4rem,10vh)]">
          <div className="border-ink/14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
            <Label index="06">Specification</Label>
            <span className="t-label text-stone-deep">
              {p.amenities.reduce((n, g) => n + g.items.length, 0)} items
            </span>
          </div>

          <div className="mt-12 md:mt-16">
            <MaskedLines
              as="h2"
              id="amenities-title"
              className="t-h1 max-w-[14ch]"
              lines={['What the house', 'is made of']}
            />
          </div>

          <div className="mt-14 grid gap-x-[clamp(1.5rem,3vw,3rem)] gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {p.amenities.map((group, gi) => (
              <Reveal key={group.group} delay={gi * 0.08}>
                <h3 className="t-label text-bronze border-ink/14 border-t pt-4">
                  {group.group}
                </h3>
                <ul className="mt-5">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="border-ink/10 t-body text-ink/80 border-b py-3 first:border-t-0"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- LOCATION ---------------- */}
      <section
        data-nav-theme="light"
        className="bg-charcoal text-paper on-dark relative z-10"
        aria-labelledby="location-title"
      >
        <div className="shell pt-[max(4rem,10vh)] pb-[max(4rem,10vh)]">
          <div className="border-paper/18 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
            <Label index="07" className="text-paper">
              Location
            </Label>
            <span className="t-label text-paper/45">{p.locationLine}</span>
          </div>

          <div className="grid-editorial mt-12 items-start md:mt-16">
            <div className="col-span-12 lg:col-span-5">
              <MaskedLines
                as="h2"
                id="location-title"
                className="t-h1"
                lines={[p.city]}
              />
              <Reveal delay={0.1} className="mt-8">
                <p className="t-body text-paper/72 max-w-[46ch]">{p.neighborhood}</p>
              </Reveal>
            </div>

            <motion.div
              className="col-span-12 mt-10 lg:col-span-6 lg:col-start-7 lg:mt-0"
              initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
              whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: reduced ? 0.01 : 1.2, ease: EASE_IN_OUT_QUART }}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Figure
                  image={p.gallery[p.gallery.length - 1]?.image ?? p.cover}
                  className="h-full w-full"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  quality={74}
                />
              </div>
              <p className="t-label text-paper/45 border-paper/18 mt-4 border-t pt-3">
                {p.city}, {p.region}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------- REPRESENTATION ---------------- */}
      <section
        data-nav-theme="dark"
        className="bg-paper-2 relative z-10"
        aria-labelledby="agent-title"
      >
        <div className="shell pt-[max(4rem,10vh)] pb-[max(4rem,10vh)]">
          <div className="border-ink/14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
            <Label index="08">Representation</Label>
            <span className="t-label text-stone-deep">Arcadia Estates</span>
          </div>

          <div className="grid-editorial mt-12 items-start md:mt-16">
            <div className="col-span-12 sm:col-span-5 lg:col-span-3">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Figure
                  image={agent.portrait}
                  className="h-full w-full"
                  sizes="(min-width: 1024px) 24vw, 45vw"
                  quality={70}
                />
              </div>
            </div>

            <div className="col-span-12 mt-8 sm:col-span-7 sm:mt-0 lg:col-span-7 lg:col-start-5">
              <MaskedLines as="h2" id="agent-title" className="t-h2" lines={[agent.name]} />
              <Reveal delay={0.1} className="mt-4">
                <p className="t-label text-bronze">{agent.role}</p>
              </Reveal>
              <Reveal delay={0.16} className="mt-8">
                <blockquote className="t-quote max-w-[26ch]">
                  <span className="text-stone" aria-hidden="true">
                    “
                  </span>
                  {agent.quote}
                  <span className="text-stone" aria-hidden="true">
                    ”
                  </span>
                </blockquote>
              </Reveal>
              <Reveal delay={0.22} className="mt-8">
                <p className="t-body text-ink/78 max-w-[52ch]">{agent.bio[0]}</p>
              </Reveal>
              <Reveal delay={0.28} className="mt-10 flex flex-wrap gap-x-12 gap-y-4">
                <Cta href={`mailto:${agent.email}`}>Write to {agent.name.split(' ')[0]}</Cta>
                <Cta href={agent.phoneHref} bare>
                  {agent.phone}
                </Cta>
              </Reveal>
            </div>
          </div>

          {/* Next residence */}
          <Reveal delay={0.1} className="border-ink/14 mt-20 border-t pt-8">
            <Link
              to={`/residences/${next.slug}`}
              className="group/next focus-bare arrow-host zoom-host grid-editorial block items-center"
              data-cursor="VIEW"
            >
              <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                <div className="relative aspect-[3/2] w-full overflow-hidden">
                  <Figure
                    image={next.cover}
                    className="h-full w-full"
                    sizes="(min-width: 1024px) 24vw, 40vw"
                    quality={64}
                  />
                </div>
              </div>
              <div className="col-span-12 mt-5 flex flex-wrap items-baseline justify-between gap-6 sm:col-span-8 sm:mt-0 sm:pl-8 lg:col-span-9">
                <div>
                  <span className="t-label text-stone-deep">Next Residence</span>
                  <h3 className="t-h2 mt-3 transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/next:translate-x-1.5">
                    {next.name}
                  </h3>
                  <p className="t-label text-stone-deep mt-3">{next.locationLine}</p>
                </div>
                <span className="flex items-center gap-4">
                  <span className="font-display t-num text-2xl leading-none font-light">
                    {next.priceCompact}
                  </span>
                  <Arrow />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      <Contact defaultProperty={p.name} index="09" />
      <Footer />
    </>
  );
}
