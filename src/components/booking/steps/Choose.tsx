import { OptionCard } from '../OptionCard';
import { Notice, IncludeList, Pill } from '@/components/ui/Bits';
import { Button, Arrow } from '@/components/ui/Button';
import { useBooking } from '@/lib/booking';
import {
  PACKAGES,
  SIZE_TIERS,
  TRAVEL,
  addonsFor,
  includedAddonsFor,
  getPackage,
} from '@shared/catalog.mjs';

/* ============================================================================
   STEPS 1–3 — what you are buying
   ========================================================================= */

/** Step 1. This is a real fork: commercial work cannot be priced by a form. */
export function StepType() {
  const { draft, set, next } = useBooking();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <OptionCard
          layoutGroup="shoot-type"
          selected={draft.shootType === 'real-estate'}
          onSelect={() => {
            set('shootType', 'real-estate');
            // Choosing here has exactly one sensible next action, so take it.
            window.setTimeout(next, 180);
          }}
          title="A property listing"
          meta="Book online · Priced now"
          body="A house, condo, lot or rental you need photographed, filmed or flown. Pick a package, choose a time, pay, done."
        />

        <OptionCard
          layoutGroup="shoot-type"
          selected={draft.shootType === 'commercial'}
          onSelect={() => set('shootType', 'commercial')}
          title="A commercial project"
          meta="Quoted per project"
          body="A brand film, promotional spot or campaign for a business. These are scoped first, so they are quoted rather than booked."
        />
      </div>

      {draft.shootType === 'commercial' && (
        <div className="glass edge flex flex-col gap-4 p-6">
          <Notice title="Commercial work is quoted, not booked">
            A brand film and a listing shoot have almost nothing in common — the
            length, the crew, the deliverables and the licence all change per
            project. Rather than sell you a package that will not fit, tell us what
            you need and you will get a written quote and a treatment.
          </Notice>
          <div className="flex flex-wrap gap-3">
            <Button to="/commercial" className="group" trailing={<Arrow />}>
              Get a custom quote
            </Button>
            <Button
              variant="ghost"
              onClick={() => set('shootType', 'real-estate')}
            >
              Actually, it’s a listing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Step 2. */
export function StepPackage() {
  const { draft, set } = useBooking();
  const bookable = PACKAGES.filter((p) => !p.quoteOnly);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 lg:grid-cols-3">
        {bookable.map((pkg) => {
          const selected = draft.packageId === pkg.id;
          return (
            <OptionCard
              key={pkg.id}
              layoutGroup="package"
              selected={selected}
              onSelect={() => set('packageId', pkg.id)}
              title={pkg.name}
              meta={`${Math.round(pkg.durationMinutes / 30) / 2} hrs on site`}
              className="h-full"
            >
              <p className="relative mt-1 text-[13px] leading-relaxed text-muted">{pkg.summary}</p>
              {pkg.popular && (
                <span className="relative mt-2">
                  <Pill tone="neon">Most booked</Pill>
                </span>
              )}
              {selected && (
                <div className="relative mt-4 border-t border-line pt-4">
                  <IncludeList items={pkg.includes} />
                </div>
              )}
            </OptionCard>
          );
        })}
      </div>

      <p className="text-[12.5px] text-faint">
        Not sure? <span className="text-body">Photo + Video</span> covers what most listings
        need. Pick the closest one — it can be changed when the quote comes back.
      </p>
    </div>
  );
}

/** Step 3 — add-ons, property size and travel. Everything that moves the price. */
export function StepExtras() {
  const { draft, toggleAddon, set } = useBooking();
  const pkg = draft.packageId ? getPackage(draft.packageId) : null;
  if (!pkg) return null;

  const available = addonsFor(pkg.id);
  const alreadyIncluded = includedAddonsFor(pkg.id);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="t-label">Add-ons</h3>
          <p className="text-[13px] text-muted">
            Optional. Each one adds to the total and to the time on site.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {available.map((addon) => (
            <OptionCard
              key={addon.id}
              selected={draft.addonIds.includes(addon.id)}
              onSelect={() => toggleAddon(addon.id)}
              title={addon.name}
              meta={addon.minutes > 0 ? `+${addon.minutes} min on site` : 'No extra time'}
              body={addon.description}
            />
          ))}
        </div>

        {alreadyIncluded.length > 0 && (
          <Notice className="mt-1">
            <span className="text-body">
              {alreadyIncluded.map((a) => a.name).join(', ')}
            </span>{' '}
            {alreadyIncluded.length === 1 ? 'is' : 'are'} already part of the {pkg.name}{' '}
            package, so {alreadyIncluded.length === 1 ? 'it is' : 'they are'} not listed
            above — you will not be charged for them twice.
          </Notice>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="t-label">Property size</h3>
          <p className="text-[13px] text-muted">
            Bigger houses take longer, so the calendar reserves more of the day.
            This is also what the size adjustment on the invoice is.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SIZE_TIERS.map((tier) => (
            <OptionCard
              key={tier.id}
              layoutGroup="size"
              selected={draft.sizeTierId === tier.id}
              onSelect={() => set('sizeTierId', tier.id)}
              title={tier.label}
              meta={tier.minutes > 0 ? `+${tier.minutes} min` : 'Standard'}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="t-label">Distance</h3>
          <p className="text-[13px] text-muted">
            The first {TRAVEL.includedMiles} miles are included. Beyond that, travel is{' '}
            ${(TRAVEL.perMileCents / 100).toFixed(2)} a mile, worked out here rather than
            added to the invoice afterwards.
          </p>
        </div>

        <div className="glass edge flex flex-col gap-4 p-5">
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="miles" className="text-[13.5px] text-body">
              Roughly how far from {'Tupelo'}?
            </label>
            <span className="font-mono text-[13px] tabular-nums text-bright">
              {draft.miles} mi
            </span>
          </div>

          <input
            id="miles"
            type="range"
            min={0}
            max={120}
            step={5}
            value={draft.miles}
            onChange={(e) => set('miles', Number(e.target.value))}
            className="w-full accent-[var(--color-neon)]"
            aria-describedby="miles-note"
          />

          <p id="miles-note" className="font-mono text-[11.5px] tracking-wide text-faint">
            {draft.miles <= TRAVEL.includedMiles
              ? 'No travel charge at this distance.'
              : `${draft.miles - TRAVEL.includedMiles} miles beyond the included ${TRAVEL.includedMiles}`}
          </p>
        </div>
      </section>
    </div>
  );
}
