import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Reveal } from '@/components/fx/Reveal';
import { TiltCard } from '@/components/fx/TiltCard';
import { Button, Arrow } from '@/components/ui/Button';
import { IncludeList, Pill } from '@/components/ui/Bits';
import { money, type Package } from '@shared/catalog.mjs';
import { EASE_UI } from '@/lib/motion';
import { cn } from '@/lib/cn';

/* ============================================================================
   A PACKAGE
   ----------------------------------------------------------------------------
   Selectable. Choosing one lights its edge, fills the marker and updates the
   total in the summary beside it. The card is a <button> when it is
   selectable and a plain panel when it is not, so the interaction is real
   rather than a div listening for clicks.
   ========================================================================= */

export function PricingCard({
  pkg,
  index,
  selected,
  onSelect,
  /** Set on the pricing page, where the card links straight into booking. */
  href,
}: {
  pkg: Package;
  index: number;
  selected?: boolean;
  onSelect?: () => void;
  href?: string;
}) {
  const interactive = Boolean(onSelect);

  const body = (
    <>
      {/* The lit edge, animated rather than toggled, so selecting feels
          like the card responding rather than a class being swapped. */}
      {selected && (
        <motion.span
          layoutId="pricing-selected"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 border border-neon/70"
          style={{
            boxShadow:
              '0 0 0 1px rgb(45 125 255 / 0.35), 0 0 60px -18px rgb(45 125 255), inset 0 0 60px -44px rgb(34 211 238)',
          }}
          transition={{ duration: 0.34, ease: EASE_UI }}
        />
      )}

      <div className="relative flex h-full flex-col gap-6 p-7 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="t-h3 text-[20px]">{pkg.name}</h3>
            <p className="text-[13px] text-muted">{pkg.tagline}</p>
          </div>

          {pkg.popular && <Pill tone="neon">Most booked</Pill>}
        </div>

        <div className="flex items-baseline gap-2">
          {pkg.quoteOnly ? (
            <span className="t-num text-[clamp(1.8rem,3.4vw,2.6rem)] leading-none text-bright">
              By quote
            </span>
          ) : (
            <>
              <span className="font-mono text-[11px] tracking-[0.16em] text-faint uppercase">
                From
              </span>
              <span className="t-num text-[clamp(2rem,4vw,3rem)] leading-none text-bright">
                {money(pkg.basePriceCents)}
              </span>
            </>
          )}
        </div>

        <p className="text-[13.5px] leading-relaxed text-muted">{pkg.summary}</p>

        <div className="h-px w-full bg-line" aria-hidden="true" />

        <IncludeList items={pkg.includes} className="flex-1" />

        <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
          <span className="font-mono text-[10.5px] tracking-[0.14em] text-faint uppercase">
            {pkg.quoteOnly ? 'Scoped per project' : `${Math.round(pkg.durationMinutes / 30) / 2} hrs on site`}
          </span>

          {interactive ? (
            <span
              className={cn(
                'flex items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] uppercase transition-colors duration-200',
                selected ? 'text-neon-soft' : 'text-muted',
              )}
            >
              {selected ? 'Selected' : 'Select'}
              <span
                className={cn(
                  'grid h-5 w-5 place-items-center rounded-full border transition-colors duration-200',
                  selected ? 'border-neon bg-neon/20' : 'border-line',
                )}
              >
                {selected && (
                  <svg width="9" height="7" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                    <path d="M1 4L3.8 6.8L9 1" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                )}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] text-bright uppercase">
              {pkg.quoteOnly ? 'Get a quote' : 'Book this package'}
              <Arrow />
            </span>
          )}
        </div>
      </div>
    </>
  );

  const shell = cn(
    'glass edge relative flex h-full w-full flex-col overflow-hidden text-left transition-[border-color,box-shadow] duration-300',
    pkg.popular && !selected && 'border-white/14',
  );

  return (
    <Reveal as="li" index={index} className="group h-full">
      <TiltCard className="h-full" max={4}>
        {interactive ? (
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={shell}
          >
            {body}
          </button>
        ) : href ? (
          <Link to={href} className={shell}>
            {body}
          </Link>
        ) : (
          <div className={shell}>{body}</div>
        )}
      </TiltCard>
    </Reveal>
  );
}

/** The card as it appears on the pricing page: not selectable, but a link. */
export function PricingCardLink({ pkg, index }: { pkg: Package; index: number }) {
  return (
    <Reveal as="li" index={index} className="group h-full">
      <TiltCard className="h-full" max={4}>
        <div className="glass edge relative flex h-full flex-col overflow-hidden">
          <div className="relative flex h-full flex-col gap-6 p-7 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <h3 className="t-h3 text-[20px]">{pkg.name}</h3>
                <p className="text-[13px] text-muted">{pkg.tagline}</p>
              </div>
              {pkg.popular && <Pill tone="neon">Most booked</Pill>}
            </div>

            <div className="flex items-baseline gap-2">
              {pkg.quoteOnly ? (
                <span className="t-num text-[clamp(1.8rem,3.4vw,2.4rem)] leading-none text-bright">
                  By quote
                </span>
              ) : (
                <>
                  <span className="font-mono text-[11px] tracking-[0.16em] text-faint uppercase">
                    From
                  </span>
                  <span className="t-num text-[clamp(2rem,4vw,3rem)] leading-none text-bright">
                    {money(pkg.basePriceCents)}
                  </span>
                </>
              )}
            </div>

            <p className="text-[13.5px] leading-relaxed text-muted">{pkg.summary}</p>
            <div className="h-px w-full bg-line" aria-hidden="true" />
            <IncludeList items={pkg.includes} className="flex-1" />

            <Button
              to={pkg.quoteOnly ? '/commercial' : `/book?package=${pkg.id}`}
              variant={pkg.popular ? 'primary' : 'ghost'}
              full
              className="group/btn mt-2"
              trailing={<Arrow />}
            >
              {pkg.quoteOnly ? 'Get a custom quote' : 'Book this package'}
            </Button>
          </div>
        </div>
      </TiltCard>
    </Reveal>
  );
}
