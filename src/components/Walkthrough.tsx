import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Property, Scene } from '@/data/properties';
import { cn } from '@/lib/cn';
import { EASE_IN_OUT_QUART, EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useHasFinePointer } from '@/lib/useMediaQuery';
import { Figure } from './Figure';
import { Label } from './Type';

/* ==========================================================================
   WALKTHROUGH
   ---------------------------------------------------------------------------
   A camera rather than a slideshow. The plate is over-scanned, so the frame can
   be panned with a drag or nudged with the pointer; rooms are cut between with
   a directional wipe in the direction of travel. Hotspots are real buttons, so
   the whole tour is operable from the keyboard.
   ======================================================================== */

const OVERSCAN = 0.13; // how much larger the plate is than the frame

export function Walkthrough({
  property,
  index: sectionIndex = '03',
  compact = false,
}: {
  property: Property;
  index?: string;
  compact?: boolean;
}) {
  const scenes = property.scenes;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [dragging, setDragging] = useState(false);
  const [hinted, setHinted] = useState(false);
  const [live, setLive] = useState('');

  const reduced = usePrefersReducedMotion();
  const fine = useHasFinePointer();
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startY: 0, base: 0, baseY: 0 });

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 90, damping: 22, mass: 0.7 });
  const py = useSpring(rawY, { stiffness: 90, damping: 22, mass: 0.7 });

  // Pan is expressed as a fraction of the over-scan, so it never shows an edge.
  const plateX = useTransform(px, (v) => `${(-v * OVERSCAN * 100) / 2}%`);
  const plateY = useTransform(py, (v) => `${(-v * OVERSCAN * 100) / 3.4}%`);
  const tilt = useTransform(px, (v) => v * -1.4);

  const scene = scenes[i];

  const goto = useCallback(
    (next: number, announce = true) => {
      const clamped = (next + scenes.length) % scenes.length;
      setDir(clamped > i || (i === scenes.length - 1 && clamped === 0) ? 1 : -1);
      setI(clamped);
      if (announce) setLive(`${scenes[clamped].index} — ${scenes[clamped].name}`);
    },
    [i, scenes],
  );

  /* ---- pointer: hover nudges the camera, drag moves it properly ---- */

  const setPan = useCallback(
    (x: number, y: number) => {
      if (reduced) return;
      rawX.set(Math.max(-1, Math.min(1, x)));
      rawY.set(Math.max(-1, Math.min(1, y)));
    },
    [reduced, rawX, rawY],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    // Never capture off a control. Pointer capture retargets the click to the
    // stage, which would swallow every hotspot press.
    if (e.target instanceof Element && e.target.closest('button')) return;
    const el = stage.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      base: rawX.get(),
      baseY: rawY.get(),
    };
    setDragging(true);
    setHinted(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = stage.current;
    if (!el) return;
    const r = el.getBoundingClientRect();

    if (drag.current.active) {
      const dx = (e.clientX - drag.current.startX) / (r.width * 0.55);
      const dy = (e.clientY - drag.current.startY) / (r.height * 0.9);
      setPan(drag.current.base - dx, drag.current.baseY - dy);
      return;
    }
    if (!fine) return;
    // Unpressed, the camera only leans. A third of the travel of a real drag.
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
    setPan(nx * 0.34, ny * 0.28);
  };

  const endDrag = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (e && stage.current?.hasPointerCapture(e.pointerId)) {
      stage.current.releasePointerCapture(e.pointerId);
    }
    drag.current.active = false;
    setDragging(false);
  };

  const onPointerLeave = () => {
    if (drag.current.active) return;
    setPan(0, 0);
  };

  /* ---- keyboard ---- */

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goto(i + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goto(i - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goto(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goto(scenes.length - 1);
    }
  };

  // Recentre the camera on every cut, so each room opens on its composition.
  useEffect(() => {
    rawX.set(0);
    rawY.set(0);
  }, [i, rawX, rawY]);

  const enter = dir === 1 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)';
  const exit = dir === 1 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)';
  const cut = reduced ? 0.01 : 1.05;

  return (
    <section
      id="walkthrough"
      data-nav-theme="light"
      className="bg-charcoal text-paper on-dark relative z-10"
      aria-labelledby="walkthrough-title"
    >
      <div className="shell pt-[max(4rem,10vh)] pb-[max(3rem,7vh)]">
        <div className="border-paper/18 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
          <Label index={sectionIndex} className="text-paper">
            Walkthrough
          </Label>
          <span className="t-label text-paper/45">
            {property.name} · {property.locationLine}
          </span>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 md:mt-14">
          <h2 id="walkthrough-title" className="t-h1 max-w-[13ch]">
            <span className="mask-line">
              <motion.span
                className="block"
                initial={{ y: '112%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1, ease: EASE_OUT_EXPO }}
              >
                Walk Through
              </motion.span>
            </span>
            <span className="mask-line">
              <motion.span
                className="block"
                initial={{ y: '112%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.08 }}
              >
                the Residence
              </motion.span>
            </span>
          </h2>

          <motion.p
            className="t-body text-paper/60 max-w-[38ch]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.14 }}
          >
            Six positions through the house, in the order you would actually move
            through it. Drag inside the frame to look around, or take one of the marks.
          </motion.p>
        </div>
      </div>

      {/* ---------------- THE STAGE ---------------- */}
      <div className="shell">
        <div
          ref={stage}
          role="group"
          tabIndex={0}
          aria-roledescription="Interactive walkthrough"
          aria-label={`${property.name} walkthrough. Use the left and right arrow keys to move between rooms.`}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={onPointerLeave}
          data-cursor="DRAG"
          className={cn(
            'relative w-full touch-pan-y overflow-hidden select-none',
            compact ? 'aspect-[4/5] sm:aspect-[16/10]' : 'aspect-[3/4] sm:aspect-[16/10] lg:aspect-[21/9]',
            dragging ? 'cursor-grabbing' : 'cursor-grab',
          )}
          style={{ perspective: 1600 }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={scene.id}
              className="absolute inset-0"
              initial={{ clipPath: enter }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              exit={{ clipPath: exit, opacity: 0.4 }}
              transition={{ duration: cut, ease: EASE_IN_OUT_QUART }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ x: plateX, y: plateY, rotateY: reduced ? 0 : tilt }}
              >
                <motion.div
                  className="absolute"
                  style={{
                    inset: `${-OVERSCAN * 50}%`,
                    transformOrigin: 'center',
                  }}
                  initial={{ scale: reduced ? 1 : 1.1, x: reduced ? 0 : dir * 28 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ duration: reduced ? 0.01 : 2.2, ease: EASE_OUT_EXPO }}
                >
                  <Figure
                    image={scene.image}
                    className="h-full w-full"
                    sizes="100vw"
                    quality={76}
                    eager
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Grading over the plate so the interface stays legible at any exposure. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(10,9,7,.74) 0%, rgba(10,9,7,.18) 34%, transparent 58%), linear-gradient(to bottom, rgba(10,9,7,.42) 0%, transparent 30%)',
            }}
          />

          {/* Hotspots */}
          {scene.hotspots?.map((h) => (
            <Hotspot
              key={h.label}
              x={h.x}
              y={h.y}
              label={h.label}
              muted={dragging}
              onSelect={() => {
                const target = scenes.findIndex((s) => s.id === h.to);
                if (target >= 0) goto(target);
              }}
            />
          ))}

          {/* Room caption, top-left of the frame */}
          <div className="pointer-events-none absolute inset-x-0 top-0 p-5 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: reduced ? 0.01 : 0.6, ease: EASE_OUT_EXPO }}
              >
                <div className="flex items-baseline gap-4">
                  <span className="t-label t-num text-bronze-soft">{scene.index}</span>
                  <span className="bg-paper/40 mb-[3px] h-px w-8" aria-hidden="true" />
                  <h3 className="font-display text-[clamp(1.5rem,3vw,2.4rem)] leading-none font-light">
                    {scene.name}
                  </h3>
                </div>
                <p className="t-label text-paper/60 mt-3 max-w-[34ch]">{scene.note}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Facts, bottom-right of the frame */}
          <div className="pointer-events-none absolute right-0 bottom-0 hidden p-5 md:block md:p-8">
            <AnimatePresence mode="wait">
              <motion.ul key={scene.id} className="text-right">
                {scene.facts.map((f, k) => (
                  <motion.li
                    key={f}
                    className="t-label text-paper/75 py-1"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: reduced ? 0.01 : 0.6,
                      ease: EASE_OUT_EXPO,
                      delay: reduced ? 0 : 0.1 + k * 0.07,
                    }}
                  >
                    {f}
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>

          {/* Drag affordance — retires the first time it is used. */}
          <motion.div
            className="pointer-events-none absolute bottom-5 left-5 flex items-center gap-3 md:bottom-8 md:left-8"
            animate={{ opacity: hinted ? 0 : 1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="relative flex h-6 w-10 items-center" aria-hidden="true">
              <span className="bg-paper/35 absolute inset-x-0 top-1/2 h-px" />
              <motion.span
                className="bg-paper absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
                animate={reduced ? {} : { left: ['4%', '78%', '4%'] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </span>
            <span className="t-label text-paper/70">Drag to Explore</span>
          </motion.div>

          <span className="sr-only" role="status" aria-live="polite">
            {live}
          </span>
        </div>

        {/* ---------------- ROOM RAIL ---------------- */}
        <div className="border-paper/18 mt-0 border-t">
          <div
            className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Rooms"
          >
            <ul className="flex min-w-max">
              {scenes.map((s, k) => (
                <RailItem
                  key={s.id}
                  scene={s}
                  active={k === i}
                  total={scenes.length}
                  onSelect={() => goto(k)}
                />
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => goto(i - 1)}
              className="focus-bare group/prev border-paper/25 hover:border-paper flex h-10 w-10 items-center justify-center border transition-colors duration-500"
              aria-label="Previous room"
            >
              <svg width="18" height="8" viewBox="0 0 22 8" fill="none" aria-hidden="true" className="rotate-180">
                <path d="M0 4h20M16.4 0.6 20 4l-3.6 3.4" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
            <button
              onClick={() => goto(i + 1)}
              className="focus-bare border-paper/25 hover:border-paper flex h-10 w-10 items-center justify-center border transition-colors duration-500"
              aria-label="Next room"
            >
              <svg width="18" height="8" viewBox="0 0 22 8" fill="none" aria-hidden="true">
                <path d="M0 4h20M16.4 0.6 20 4l-3.6 3.4" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 items-center gap-5">
            <div className="bg-paper/15 relative h-px flex-1">
              <motion.span
                className="bg-bronze-soft absolute inset-y-0 left-0 block"
                animate={{ width: `${((i + 1) / scenes.length) * 100}%` }}
                transition={{ duration: reduced ? 0.01 : 0.8, ease: EASE_OUT_EXPO }}
              />
            </div>
            <span className="t-label t-num text-paper/55 shrink-0">
              {scene.index} / {String(scenes.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Hotspot({
  x,
  y,
  label,
  onSelect,
  muted,
}: {
  x: number;
  y: number;
  label: string;
  onSelect: () => void;
  muted: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className="group/hot focus-bare absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: muted ? 0.25 : 1, scale: 1 }}
      transition={{ duration: reduced ? 0.01 : 0.7, ease: EASE_OUT_EXPO, delay: reduced ? 0 : 0.5 }}
      aria-label={`Move to ${label}`}
      data-cursor=""
    >
      <span className="relative flex h-11 w-11 items-center justify-center" aria-hidden="true">
        {!reduced && (
          <motion.span
            className="border-paper/45 absolute inset-0 rounded-full border"
            animate={{ scale: [1, 1.5], opacity: [0.55, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <span className="border-paper/70 bg-paper/10 absolute inset-[9px] rounded-full border backdrop-blur-[2px] transition-transform duration-500 group-hover/hot:scale-125 group-focus-visible/hot:scale-125" />
        <span className="bg-paper absolute h-1 w-1 rounded-full" />
      </span>
      <span className="pointer-events-none absolute top-1/2 left-[calc(100%+2px)] -translate-y-1/2 whitespace-nowrap opacity-0 transition-all duration-500 group-hover/hot:translate-x-1 group-hover/hot:opacity-100 group-focus-visible/hot:translate-x-1 group-focus-visible/hot:opacity-100">
        <span className="t-label bg-paper text-charcoal inline-block px-3 py-2">
          {label}
        </span>
      </span>
    </motion.button>
  );
}

function RailItem({
  scene,
  active,
  total,
  onSelect,
}: {
  scene: Scene;
  active: boolean;
  total: number;
  onSelect: () => void;
}) {
  return (
    <li className="relative" style={{ minWidth: `${Math.max(140, 100 / total)}px` }}>
      <button
        role="tab"
        aria-selected={active}
        onClick={onSelect}
        className={cn(
          'focus-bare group/rail relative block w-full px-4 py-4 text-left transition-colors duration-500 first:pl-0 md:px-6 md:py-5',
          active ? 'text-paper' : 'text-paper/45 hover:text-paper/80',
        )}
      >
        <span className="t-label t-num block">{scene.index}</span>
        <span className="t-label mt-2 block whitespace-nowrap">{scene.name}</span>
        <span
          aria-hidden="true"
          className={cn(
            'bg-bronze-soft absolute top-0 left-0 h-px transition-transform duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)]',
            'right-0 origin-left',
            active ? 'scale-x-100' : 'scale-x-0',
          )}
        />
      </button>
    </li>
  );
}
