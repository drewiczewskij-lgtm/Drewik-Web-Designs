import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { PricingCardLink } from '@/components/pricing/PricingCard';
import { OptionCard } from '@/components/booking/OptionCard';
import { Reveal } from '@/components/fx/Reveal';
import { SectionHead, Notice, Pill } from '@/components/ui/Bits';
import { Button, Arrow } from '@/components/ui/Button';
import { Accordion } from '@/components/ui/Accordion';
import { CtaBand } from '@/components/sections/CtaBand';
import { Seo, breadcrumbSchema, faqSchema } from '@/lib/seo';
import { faqsIn } from '@/data/faq';
import { CONTACT } from '@/data/site';
import {
  ADDONS,
  PACKAGES,
  SIZE_TIERS,
  TAX,
  TRAVEL,
  addonsFor,
  getPackage,
  money,
  quote,
} from '@shared/catalog.mjs';
import { EASE_UI } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

/* ============================================================================
   PRICING
   ----------------------------------------------------------------------------
   The packages, then a calculator that works out a real total before anyone
   commits to anything. It runs the SAME `quote()` the booking flow and the
   payment server use, so the figure here is not an estimate — it is the price.
   ========================================================================= */

export default function Pricing() {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const bookable = PACKAGES.filter((p) => !p.quoteOnly);

  const [packageId, setPackageId] = useState(bookable[1]?.id ?? bookable[0].id);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [sizeTierId, setSizeTierId] = useState(SIZE_TIERS[0].id);

  const pkg = getPackage(packageId);
  const available = useMemo(() => addonsFor(packageId), [packageId]);

  const priced = useMemo(
    () => quote({ packageId, addonIds, sizeTierId, miles: 0 }),
    [packageId, addonIds, sizeTierId],
  );

  const toggle = (id: string) =>
    setAddonIds((current) =>
      current.includes(id) ? current.filter((a) => a !== id) : [...current, id],
    );

  const choosePackage = (id: string) => {
    setPackageId(id);
    // An add-on that the new package already contains, or does not offer, must
    // not silently survive the change.
    const allowed = new Set(addonsFor(id).map((a) => a.id));
    setAddonIds((current) => current.filter((a) => allowed.has(a)));
  };

  return (
    <>
      <Seo
        title="Pricing — Packages, Add-ons and What They Cost"
        description={`Transparent pricing for real estate photography, video and drone in ${CONTACT.serviceArea}. Packages from ${money(bookable[0].basePriceCents)}, every add-on priced, tax and travel shown before you pay.`}
        path="/pricing"
        schema={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Pricing', path: '/pricing' },
          ]),
          faqSchema(faqsIn('payment').map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />

      <PageHeader
        label="Pricing"
        title={['No quotes.', 'No surprises.', 'Just the price.']}
        lead="Everything on this page can be booked and paid for on this site. The total at checkout is the total on the invoice — package, add-ons, property size, travel and tax, all itemised."
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Pricing', path: '/pricing' },
        ]}
      />

      {/* The packages. */}
      <section className="section" aria-labelledby="packages">
        <div className="shell">
          {/* See the note in Portfolio.tsx — the package cards are h3, and this
              keeps the heading outline from skipping a level. */}
          <h2 id="packages" className="sr-only">
            Packages
          </h2>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PACKAGES.map((p, i) => (
              <PricingCardLink key={p.id} pkg={p} index={i} />
            ))}
          </ul>

          <Reveal className="mt-10 grid gap-4 sm:grid-cols-3">
            <Fact
              title="Travel"
              body={`First ${TRAVEL.includedMiles} miles included. Beyond that, $${(TRAVEL.perMileCents / 100).toFixed(2)} per mile, calculated at booking.`}
            />
            <Fact
              title="Tax"
              body={`${(TAX.rate * 100).toFixed(0)}% ${TAX.label}, added at checkout and shown as its own line.`}
            />
            <Fact
              title="Property size"
              body="Up to 2,000 sq ft is included. Larger properties add a size adjustment, because they take longer."
            />
          </Reveal>
        </div>
      </section>

      {/* The calculator. */}
      <section className="section relative overflow-hidden border-t border-line">
        <div className="aurora opacity-45" aria-hidden="true" />
        <div className="shell relative">
          <SectionHead
            index="01"
            label="Build your quote"
            title={
              <>
                Work out your exact total <span className="t-accent">right here.</span>
              </>
            }
            lead="Nothing is submitted and nothing is held. This is the same calculation the checkout runs."
          />

          <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
            <div className="flex flex-col gap-10">
              <section className="flex flex-col gap-4">
                <h3 className="t-label">1 — Package</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {bookable.map((p) => (
                    <OptionCard
                      key={p.id}
                      layoutGroup="calc-package"
                      selected={packageId === p.id}
                      onSelect={() => choosePackage(p.id)}
                      title={p.name}
                      price={money(p.basePriceCents)}
                      meta={`${Math.round(p.durationMinutes / 30) / 2} hrs`}
                    />
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-4">
                <h3 className="t-label">2 — Add-ons</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {available.map((a) => (
                    <OptionCard
                      key={a.id}
                      selected={addonIds.includes(a.id)}
                      onSelect={() => toggle(a.id)}
                      title={a.name}
                      price={`+${money(a.priceCents)}`}
                      body={a.description}
                    />
                  ))}
                </div>

                {pkg && available.length < ADDONS.length && (
                  <p className="text-[12.5px] text-faint">
                    Add-ons already inside the {pkg.name} package are not listed — you
                    cannot be charged for them twice.
                  </p>
                )}
              </section>

              <section className="flex flex-col gap-4">
                <h3 className="t-label">3 — Property size</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {SIZE_TIERS.map((t) => (
                    <OptionCard
                      key={t.id}
                      layoutGroup="calc-size"
                      selected={sizeTierId === t.id}
                      onSelect={() => setSizeTierId(t.id)}
                      title={t.label}
                      price={t.surchargeCents === 0 ? 'Included' : `+${money(t.surchargeCents)}`}
                    />
                  ))}
                </div>
              </section>
            </div>

            {/* The running total. */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="glass edge flex flex-col gap-5 p-6 sm:p-7">
                <p className="t-label">Your quote</p>

                <ul className="flex flex-col gap-2.5">
                  <AnimatePresence initial={false} mode="popLayout">
                    {priced.lines.map((line) => (
                      <motion.li
                        key={`${line.kind}-${line.id}`}
                        layout
                        initial={reduced ? { opacity: 0 } : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, x: 8 }}
                        transition={{ duration: 0.22, ease: EASE_UI }}
                        className="flex items-baseline justify-between gap-4 text-[13.5px]"
                      >
                        <span className={line.kind === 'package' ? 'text-bright' : 'text-muted'}>
                          {line.label}
                        </span>
                        <span className="shrink-0 font-mono text-[12.5px] tabular-nums text-body">
                          {money(line.amountCents)}
                        </span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="flex flex-col gap-2 border-t border-line pt-4">
                  <Row label="Subtotal" value={money(priced.subtotalCents)} />
                  <Row
                    label={`${TAX.label} (${(TAX.rate * 100).toFixed(0)}%)`}
                    value={money(priced.taxCents)}
                  />
                </div>

                <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
                  <span className="t-label">Total</span>
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={priced.totalCents}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(3px)' }}
                      transition={{ duration: 0.26, ease: EASE_UI }}
                      className="t-num text-[clamp(1.6rem,3.2vw,2.2rem)] leading-none text-bright"
                    >
                      {money(priced.totalCents)}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <p className="font-mono text-[11px] tracking-wide text-faint">
                  About {Math.floor(priced.minutes / 60)}h
                  {priced.minutes % 60 ? ` ${priced.minutes % 60}m` : ''} on site · travel added
                  at booking
                </p>

                <Button
                  onClick={() => navigate(`/book?package=${packageId}`)}
                  full
                  size="lg"
                  className="group"
                  trailing={<Arrow />}
                >
                  Book this package
                </Button>

                <p className="text-center text-[12px] text-faint">
                  Add-ons carry over — you can change them at the next step.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Every add-on, listed, for anyone who just wants the price list. */}
      <section className="section border-t border-line">
        <div className="shell">
          <SectionHead
            index="02"
            label="Add-ons"
            title={
              <>
                Everything else, <span className="t-accent">priced.</span>
              </>
            }
          />
          <ul className="mt-12 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            {ADDONS.map((a, i) => (
              <Reveal
                as="li"
                key={a.id}
                index={i}
                className="flex flex-col gap-2 bg-void p-6 transition-colors duration-400 hover:bg-ink"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-[16px] font-semibold text-bright">{a.name}</h3>
                  <span className="shrink-0 font-mono text-[14px] tabular-nums text-neon-soft">
                    {money(a.priceCents)}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-muted">{a.description}</p>
                {a.includedIn && a.includedIn.length > 0 && (
                  <p className="mt-1">
                    <Pill tone="neon">
                      Included in{' '}
                      {a.includedIn.map((id) => getPackage(id)?.name ?? id).join(' & ')}
                    </Pill>
                  </p>
                )}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Payment questions, answered where the prices are. */}
      <section className="section border-t border-line">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead
              index="03"
              label="Payment"
              title={
                <>
                  How the money <span className="t-accent">works.</span>
                </>
              }
            />
            <Notice className="mt-8">
              Brokerages booking several listings a month are usually better off being
              invoiced monthly than paying per shoot. Ask on the contact form.
            </Notice>
          </div>

          <Accordion items={faqsIn('payment').map((f) => ({ id: f.id, q: f.q, a: f.a }))} />
        </div>
      </section>

      <CtaBand
        title={
          <>
            You have seen the price. <span className="t-accent">Pick a date.</span>
          </>
        }
        lead="The calendar only shows times that are genuinely free."
        image="aerialWater"
      />

      <Footer />
    </>
  );
}

function Fact({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass edge flex flex-col gap-2 p-5">
      <h3 className="t-label">{title}</h3>
      <p className="text-[13px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="shrink-0 font-mono text-[12.5px] tabular-nums text-body">{value}</span>
    </div>
  );
}
