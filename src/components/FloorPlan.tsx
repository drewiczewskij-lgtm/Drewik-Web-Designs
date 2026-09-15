import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import type { FloorPlanSpec, FloorRoom } from '@/data/properties';
import { cn } from '@/lib/cn';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { Label } from './Type';

/* ==========================================================================
   FLOOR PLAN
   ---------------------------------------------------------------------------
   Drawn rather than photographed: the envelope is stroked heavy, partitions
   light, outdoor rooms dashed, with a dimension string, a scale bar and a north
   point. Hovering a room — on the drawing or in the schedule beside it — lifts
   the same area in both.
   ======================================================================== */

interface Bounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function bounds(points: string): Bounds {
  const nums = points
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(',').map(Number));
  const xs = nums.map((n) => n[0]);
  const ys = nums.map((n) => n[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

export function FloorPlan({
  plan,
  propertyName,
  index = '03',
}: {
  plan: FloorPlanSpec;
  propertyName: string;
  index?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();

  const all = useMemo(
    () => plan.rooms.map((r) => ({ room: r, box: bounds(r.points) })),
    [plan.rooms],
  );

  const extent = useMemo(() => {
    const xs = all.flatMap((r) => [r.box.x0, r.box.x1]);
    const ys = all.flatMap((r) => [r.box.y0, r.box.y1]);
    return {
      x0: Math.min(...xs),
      x1: Math.max(...xs),
      y0: Math.min(...ys),
      y1: Math.max(...ys),
    };
  }, [all]);

  // The sheet is sized to the drawing: room for the dimension string above, the
  // north point to the right and the scale bar below, and nothing more.
  const sheet = {
    x: extent.x0 - 58,
    y: extent.y0 - 62,
    w: extent.x1 - extent.x0 + 58 + 76,
    h: extent.y1 - extent.y0 + 62 + 78,
  };

  const gridX: number[] = [];
  for (let x = Math.ceil(sheet.x / 52) * 52; x < sheet.x + sheet.w; x += 52) gridX.push(x);
  const gridY: number[] = [];
  for (let y = Math.ceil(sheet.y / 54) * 54; y < sheet.y + sheet.h; y += 54) gridY.push(y);

  return (
    <section
      id="plan"
      data-nav-theme="dark"
      className="bg-paper-2 relative z-10"
      aria-labelledby="plan-title"
    >
      <div className="shell pt-[max(4rem,10vh)] pb-[max(4rem,10vh)]">
        <div className="border-ink/14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
          <Label index={index}>Plan</Label>
          <span className="t-label text-stone-deep">
            {propertyName} · {plan.level}
          </span>
        </div>

        <h2 id="plan-title" className="sr-only">
          Floor plan — {propertyName}, {plan.level}
        </h2>

        <div className="grid-editorial mt-12 items-start md:mt-16">
          {/* The drawing */}
          <motion.div
            className="col-span-12 lg:col-span-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
            onMouseLeave={() => setActive(null)}
          >
            {/* Below the breakpoint the sheet stays at a legible scale and the
                reader pans it, exactly as they would a printed plan. */}
            <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] pb-2 lg:mx-0 lg:overflow-visible lg:px-0">
            <svg
              viewBox={`${sheet.x} ${sheet.y} ${sheet.w} ${sheet.h}`}
              className="text-ink w-full min-w-[620px] md:min-w-0"
              role="img"
              aria-label={`Architectural floor plan of ${propertyName}, ${plan.level}, showing ${plan.rooms.map((r) => r.name).join(', ')}.`}
            >
              {/* Setting-out grid */}
              <g aria-hidden="true" className="text-stone" opacity="0.2">
                {gridX.map((x) => (
                  <line
                    key={`v${x}`}
                    x1={x}
                    y1={sheet.y}
                    x2={x}
                    y2={sheet.y + sheet.h}
                    stroke="currentColor"
                    strokeWidth="0.4"
                  />
                ))}
                {gridY.map((y) => (
                  <line
                    key={`h${y}`}
                    x1={sheet.x}
                    y1={y}
                    x2={sheet.x + sheet.w}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="0.4"
                  />
                ))}
              </g>

              {/* Room fills — the interactive layer */}
              <g>
                {all.map(({ room }) => {
                  const on = active === room.id;
                  return (
                    <g key={room.id}>
                      <motion.polygon
                        points={room.points}
                        className={cn(on ? 'text-bronze' : 'text-stone')}
                        fill="currentColor"
                        initial={false}
                        animate={{ opacity: on ? 0.26 : room.outdoor ? 0.05 : 0.1 }}
                        transition={{ duration: reduced ? 0.01 : 0.45, ease: EASE_OUT_EXPO }}
                      />
                      <polygon
                        points={room.points}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="1.1"
                        className="text-ink/35"
                        strokeDasharray={room.outdoor ? '7 6' : undefined}
                        onMouseEnter={() => setActive(room.id)}
                        onFocus={() => setActive(room.id)}
                        onBlur={() => setActive(null)}
                        tabIndex={0}
                        role="button"
                        aria-label={`${room.name}, ${room.area}`}
                        style={{ cursor: 'pointer' }}
                      />
                      <text
                        x={room.label[0]}
                        y={room.label[1] - 4}
                        textAnchor="middle"
                        className="fill-ink pointer-events-none"
                        style={{
                          fontSize: 13,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          fontWeight: 500,
                          opacity: on ? 1 : 0.62,
                          transition: reduced ? undefined : 'opacity 400ms',
                        }}
                      >
                        {room.name}
                      </text>
                      <text
                        x={room.label[0]}
                        y={room.label[1] + 14}
                        textAnchor="middle"
                        className="fill-stone-deep pointer-events-none"
                        style={{
                          fontSize: 11,
                          letterSpacing: '0.12em',
                          opacity: on ? 0.95 : 0.55,
                          transition: reduced ? undefined : 'opacity 400ms',
                        }}
                      >
                        {room.area}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* The envelope, drawn heavy over everything */}
              <motion.path
                d={plan.outline}
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="text-ink pointer-events-none"
                initial={{ pathLength: reduced ? 1 : 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: reduced ? 0.01 : 1.6, ease: EASE_OUT_EXPO }}
              />

              {/* Dimension string along the top */}
              <g aria-hidden="true" className="text-stone-deep pointer-events-none">
                <line
                  x1={extent.x0}
                  y1={extent.y0 - 34}
                  x2={extent.x1}
                  y2={extent.y0 - 34}
                  stroke="currentColor"
                  strokeWidth="0.8"
                />
                <line x1={extent.x0} y1={extent.y0 - 41} x2={extent.x0} y2={extent.y0 - 27} stroke="currentColor" strokeWidth="0.8" />
                <line x1={extent.x1} y1={extent.y0 - 41} x2={extent.x1} y2={extent.y0 - 27} stroke="currentColor" strokeWidth="0.8" />
                <rect
                  x={(extent.x0 + extent.x1) / 2 - 42}
                  y={extent.y0 - 44}
                  width="84"
                  height="20"
                  className="fill-paper-2"
                />
                <text
                  x={(extent.x0 + extent.x1) / 2}
                  y={extent.y0 - 30}
                  textAnchor="middle"
                  className="fill-stone-deep"
                  style={{ fontSize: 12, letterSpacing: '0.14em' }}
                >
                  {plan.span}
                </text>
              </g>

              {/* North point */}
              <g
                aria-hidden="true"
                transform={`translate(${extent.x1 + 34} ${extent.y0 + 6})`}
                className="text-ink pointer-events-none"
              >
                <circle r="15" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4" />
                <path d="M0,-11 L4.2,5 L0,2.2 L-4.2,5 Z" fill="currentColor" opacity="0.75" />
                <text
                  y="26"
                  textAnchor="middle"
                  className="fill-stone-deep"
                  style={{ fontSize: 10, letterSpacing: '0.2em' }}
                >
                  N
                </text>
              </g>

              {/* Scale bar */}
              <g
                aria-hidden="true"
                transform={`translate(${extent.x0} ${extent.y1 + 44})`}
                className="text-stone-deep pointer-events-none"
              >
                <rect x="0" y="0" width="43" height="5" fill="currentColor" opacity="0.7" />
                <rect x="43" y="0" width="43" height="5" fill="none" stroke="currentColor" strokeWidth="0.7" />
                <text y="20" style={{ fontSize: 10, letterSpacing: '0.2em' }} className="fill-stone-deep">
                  0
                </text>
                <text x="86" y="20" style={{ fontSize: 10, letterSpacing: '0.2em' }} className="fill-stone-deep">
                  10 FT
                </text>
              </g>
            </svg>
            </div>

            <p className="t-label text-stone-deep mt-4">{plan.note}</p>
            <p className="t-label text-stone-deep mt-2 md:hidden">
              Drag the sheet sideways to read the whole plan
            </p>
          </motion.div>

          {/* The schedule */}
          <div className="col-span-12 mt-10 lg:col-span-3 lg:col-start-10 lg:mt-0">
            <h3 className="t-h3 mb-6">Room Schedule</h3>
            <ul className="border-ink/14 border-t" onMouseLeave={() => setActive(null)}>
              {plan.rooms.map((room) => (
                <ScheduleRow
                  key={room.id}
                  room={room}
                  active={active === room.id}
                  onHover={() => setActive(room.id)}
                />
              ))}
            </ul>
            <p className="t-label text-stone-deep mt-6 leading-relaxed">
              Dashed edges denote covered or open areas, excluded from the interior
              measurement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScheduleRow({
  room,
  active,
  onHover,
}: {
  room: FloorRoom;
  active: boolean;
  onHover: () => void;
}) {
  return (
    <li className="border-ink/12 border-b">
      <button
        onMouseEnter={onHover}
        onFocus={onHover}
        className={cn(
          'focus-bare relative flex w-full items-baseline justify-between gap-4 py-3 text-left transition-colors duration-400',
          active ? 'text-ink' : 'text-stone-deep',
        )}
        aria-pressed={active}
      >
        <span className="t-label">{room.name}</span>
        <span className="t-label t-num">{room.area}</span>
        <span
          aria-hidden="true"
          className={cn(
            'bg-bronze absolute bottom-0 left-0 h-px w-full origin-left transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)]',
            active ? 'scale-x-100' : 'scale-x-0',
          )}
        />
      </button>
    </li>
  );
}
