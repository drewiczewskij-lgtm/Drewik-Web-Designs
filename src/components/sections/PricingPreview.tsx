import { Link } from 'react-router-dom';
import { Reveal } from '@/components/fx/Reveal';
import { SectionHead } from '@/components/ui/Bits';
import { PricingCardLink } from '@/components/pricing/PricingCard';
import { Arrow } from '@/components/ui/Button';
import { PACKAGES, TAX, TRAVEL } from '@shared/catalog.mjs';

/** The pricing preview on the home page. Real numbers, straight from the list. */
export function PricingPreview({ index = '05' }: { index?: string }) {
  return (
    <section className="section relative overflow-hidden border-t border-line">
      <div className="aurora opacity-45" aria-hidden="true" />
      <div className="shell relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            index={index}
            label="Pricing"
            title={
              <>
                Priced before you <span className="t-accent">book.</span>
              </>
            }
            lead="Every package below can be booked, customised and paid for on this site. The total you see at checkout is the total on the invoice."
          />
          <Link
            to="/pricing"
            className="group inline-flex shrink-0 items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-bright uppercase"
          >
            <span className="link-rule">Full price list</span>
            <Arrow />
          </Link>
        </div>

        <ul className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PACKAGES.map((pkg, i) => (
            <PricingCardLink key={pkg.id} pkg={pkg} index={i} />
          ))}
        </ul>

        <Reveal className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[12.5px] text-faint">
          <span>
            First {TRAVEL.includedMiles} miles included, then ${(TRAVEL.perMileCents / 100).toFixed(2)}/mile.
          </span>
          <span>{(TAX.rate * 100).toFixed(0)}% {TAX.label} added at checkout.</span>
          <span>Larger properties add a size adjustment, shown before you pay.</span>
        </Reveal>
      </div>
    </section>
  );
}
