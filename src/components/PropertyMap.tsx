import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import {
  MAP_ONLY_PLACES,
  MASK_COLS,
  MASK_ROWS,
  PROPERTIES,
  US_MASK,
} from '@/data/properties';
import type { ImageKey } from '@/data/images';
import { cn } from '@/lib/cn';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useHasFinePointer, useMediaQuery } from '@/lib/useMediaQuery';
import { useSmoothScroll } from '@/lib/smoothScroll';
import { Figure } from './Figure';
import { Cta } from './Cta';
import { Label, MaskedLines } from './Type';

/* ==========================================================================
   EXCEPTIONAL PLACES
   ---------------------------------------------------------------------------
   The country drawn as a field of points rather than an outline — closer to a
   survey plot than a map. The land around the active market lifts; everything
   else stays quiet. No third-party tiles, no iframe.

   Cell spacing is 10 across and 11.5 down, which is roughly the true ratio of
   a degree of longitude to a degree of latitude at these latitudes.
   ======================================================================== */

const CELL_X = 10;
const CELL_Y = 11.5;
const VIEW_W = MASK_COLS * CELL_X;
const VIEW_H = MASK_ROWS * CELL_Y;

interface Place {
  id: string;
  name: string;
  region: string;
  caption: string;
  meta: string;
  image: ImageKey;
  col: number;
  row: number;
  to?: string;
  side: 'left' | 'right';
}

/** Chosen per place so each label sits over water or open ground. */
const LABEL_SIDE: Record<string, 'left' | 'right'> = {
  'casa-aurelia': 'left',
  'the-ridge-house': 'right',
  'the-glass-house': 'left',
  'villa-no-17': 'right',
  'new-york': 'right',
};

const PLACES: Place[] = [
  ...PROPERTIES.map<Place>((p) => ({
    id: p.slug,
    name: p.city,
    region: p.region,
    caption: p.name,
    meta: `${p.beds} bd · ${p.baths} ba · ${p.sqft.toLocaleString('en-US')} sq ft`,
    image: p.cover,
    col: p.map.col,
    row: p.map.row,
    to: `/residences/${p.slug}`,
    side: LABEL_SIDE[p.slug] ?? 'right',
  })),
  ...MAP_ONLY_PLACES.map<Place>((m) => ({
    id: m.slug,
    name: m.city,
    region: m.region,
    caption: m.label,
    meta: m.detail,
    image: m.image,
    col: m.map.col,
    row: m.map.row,
    side: LABEL_SIDE[m.slug] ?? 'right',
  })),
];

const LAND: { x: number; y: number }[] = [];
for (let r = 0; r < MASK_ROWS; r++) {
  for (let c = 0; c < MASK_COLS; c++) {
    if (US_MASK[r][c] === '#') {
      LAND.push({ x: c * CELL_X + CELL_X / 2, y: r * CELL_Y + CELL_Y / 2 });
    }
  }
}

export function PropertyMap() {
  const [activeId, setActiveId] = useState(PLACES[0].id);
  const reduced = usePrefersReducedMotion();
  const fine = useHasFinePointer();
  const showLabels = useMediaQuery('(min-width: 768px)');
  const { scrollTo } = useSmoothScroll();

  const active = PLACES.find((p) => p.id === activeId) ?? PLACES[0];
  const ax = active.col * CELL_X + CELL_X / 2;
  const ay = active.row * CELL_Y + CELL_Y / 2;

  // The halo: land within about nine cells of the active marker reads brighter.
  const dots = useMemo(
    () =>
      LAND.map((d) => {
        const dist = Math.hypot(d.x - ax, (d.y - ay) * 0.87);
        return { ...d, t: Math.max(0, 1 - dist / 96) };
      }),
    [ax, ay],
  );

  return (
    <section
      id="places"
      data-nav-theme="light"
      className="bg-charcoal text-paper on-dark relative z-10"
      aria-labelledby="places-title"
    >
      <div className="shell pt-[max(4.5rem,12vh)] pb-[max(4.5rem,12vh)]">
        <div className="border-paper/18 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
          <Label index="05" className="text-paper">
            Where We Work
          </Label>
          <span className="t-label text-paper/45">
            Five markets · Eleven representations
          </span>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 md:mt-14">
          <MaskedLines as="h2" id="places-title" className="t-h1" lines={['Exceptional Places']} />
          <motion.p
            className="t-body text-paper/60 max-w-[34ch]"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.12 }}
          >
            {fine
              ? 'Take a marker to change the view. Every point is somewhere we have closed in the last three years.'
              : 'Tap a marker to change the view. Every point is somewhere we have closed in the last three years.'}
          </motion.p>
        </div>

        {/* ------------- THE PLOT ------------- */}
        <motion.div
          className="relative mt-14 md:mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 1, ease: EASE_OUT_EXPO }}
        >
          <motion.svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="w-full overflow-visible"
            role="img"
            aria-label="A stylised map of the continental United States marking Malibu, Aspen, Austin, Miami Beach and New York."
            initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
            whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: reduced ? 0.01 : 1.6, ease: EASE_OUT_EXPO, delay: 0.1 }}
          >
            <g>
              {dots.map((d, i) => (
                <circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r={1.7 + d.t * 1.3}
                  fill="currentColor"
                  className="text-stone"
                  style={{
                    opacity: 0.3 + d.t * 0.6,
                    transition: reduced
                      ? undefined
                      : 'opacity 700ms cubic-bezier(.16,1,.3,1), r 700ms cubic-bezier(.16,1,.3,1)',
                  }}
                />
              ))}
            </g>

            {PLACES.map((p) => (
              <Marker
                key={p.id}
                place={p}
                active={p.id === activeId}
                onSelect={() => setActiveId(p.id)}
                hoverSelects={fine}
                showLabel={showLabels}
              />
            ))}
          </motion.svg>
        </motion.div>

        {/* ------------- THE LEGEND, WHICH IS ALSO THE CONTROL ------------- */}
        <div
          className="border-paper/18 mt-10 grid grid-cols-2 border-t sm:grid-cols-3 lg:grid-cols-5"
          role="tablist"
          aria-label="Markets"
        >
          {PLACES.map((p, i) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={p.id === activeId}
              onClick={() => setActiveId(p.id)}
              onMouseEnter={() => fine && setActiveId(p.id)}
              onFocus={() => setActiveId(p.id)}
              className={cn(
                'focus-bare border-paper/12 relative border-b px-1 py-5 text-left transition-colors duration-500 sm:border-b-0',
                p.id === activeId ? 'text-paper' : 'text-paper/40 hover:text-paper/80',
              )}
            >
              <span className="t-label t-num text-bronze-soft block opacity-80">
                0{i + 1}
              </span>
              <span className="t-label mt-2 block">{p.name}</span>
              <span className="t-label text-paper/35 mt-1 block">{p.region}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'bg-bronze-soft absolute top-0 right-2 left-0 h-px origin-left transition-transform duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)]',
                  p.id === activeId ? 'scale-x-100' : 'scale-x-0',
                )}
              />
            </button>
          ))}
        </div>

        {/* ------------- THE DETAIL BAND ------------- */}
        <div className="border-paper/18 border-t pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              className="grid-editorial items-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: reduced ? 0.01 : 0.6, ease: EASE_OUT_EXPO }}
            >
              <div className="col-span-12 sm:col-span-5 lg:col-span-3">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <motion.div
                    className="h-full w-full"
                    initial={{ scale: reduced ? 1 : 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: reduced ? 0.01 : 1.8, ease: EASE_OUT_EXPO }}
                  >
                    <Figure
                      image={active.image}
                      className="h-full w-full"
                      sizes="(min-width: 1024px) 24vw, 45vw"
                      quality={70}
                    />
                  </motion.div>
                </div>
              </div>

              <div className="col-span-12 mt-6 sm:col-span-7 sm:mt-0 sm:pl-8 lg:col-span-6 lg:col-start-5 lg:pl-0">
                <div className="flex items-baseline gap-5">
                  <h3 className="t-h2">{active.name}</h3>
                  <span className="t-label text-paper/45">{active.region}</span>
                </div>
                <p className="t-lead text-paper/75 mt-4">{active.caption}</p>
                <p className="t-label t-num text-paper/45 mt-3">{active.meta}</p>
              </div>

              <div className="col-span-12 mt-8 lg:col-span-3 lg:col-start-11 lg:mt-0 lg:text-right">
                {active.to ? (
                  <Cta to={active.to} dark cursor="VIEW">
                    View Residence
                  </Cta>
                ) : (
                  <Cta onClick={() => scrollTo('#contact', -1)} dark>
                    Enquire Privately
                  </Cta>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Marker({
  place,
  active,
  onSelect,
  hoverSelects,
  showLabel,
}: {
  place: Place;
  active: boolean;
  onSelect: () => void;
  hoverSelects: boolean;
  showLabel: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const x = place.col * CELL_X + CELL_X / 2;
  const y = place.row * CELL_Y + CELL_Y / 2;
  const left = place.side === 'left';

  return (
    <g
      transform={`translate(${x} ${y})`}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`${place.name}, ${place.region}`}
      aria-pressed={active}
      onClick={onSelect}
      onFocus={onSelect}
      onMouseEnter={() => hoverSelects && onSelect()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* A generous invisible target; the visible mark is only a few pixels. */}
      <circle r="24" fill="transparent" />

      {active && !reduced && (
        <motion.circle
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          className="text-bronze-soft"
          initial={{ r: 6, opacity: 0.7 }}
          animate={{ r: [6, 22], opacity: [0.7, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      <circle
        r={active ? 6.4 : 4.4}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className={active ? 'text-bronze-soft' : 'text-paper'}
        style={{
          opacity: active ? 1 : 0.45,
          transition: reduced ? undefined : 'r 600ms cubic-bezier(.16,1,.3,1), opacity 600ms',
        }}
      />
      <circle
        r={active ? 2.2 : 1.6}
        className={active ? 'text-bronze-soft' : 'text-paper'}
        fill="currentColor"
        style={{
          opacity: active ? 1 : 0.65,
          transition: reduced ? undefined : 'r 600ms cubic-bezier(.16,1,.3,1)',
        }}
      />

      {showLabel && (
        <text
          x={left ? -14 : 14}
          y={3.4}
          textAnchor={left ? 'end' : 'start'}
          className={active ? 'fill-paper' : 'fill-stone'}
          stroke="#14130F"
          strokeWidth="3.2"
          strokeLinejoin="round"
          paintOrder="stroke"
          style={{
            fontSize: 8.6,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 500,
            opacity: active ? 1 : 0.72,
            transition: reduced ? undefined : 'opacity 500ms',
          }}
        >
          {place.name}
        </text>
      )}
    </g>
  );
}
