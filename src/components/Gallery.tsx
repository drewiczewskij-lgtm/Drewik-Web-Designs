import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { EASE_IN_OUT_QUART, EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { Figure } from './Figure';
import { Lightbox, type Plate } from './Lightbox';
import { Label, MaskedLines } from './Type';

/* ==========================================================================
   GALLERY
   An editorial sequence rather than a grid: ten plates in a repeating set of
   five spans, so the eye keeps moving. Every plate opens full-screen.
   ======================================================================== */

/** span, aspect, and vertical offset — the pattern repeats every five plates. */
const RHYTHM = [
  { span: 'md:col-span-7', ratio: 'aspect-[4/3]', shift: '' },
  { span: 'md:col-span-5', ratio: 'aspect-[3/4]', shift: 'md:mt-20' },
  { span: 'md:col-span-5 md:col-start-2', ratio: 'aspect-[1/1]', shift: 'md:mt-4' },
  { span: 'md:col-span-6 md:col-start-7', ratio: 'aspect-[16/11]', shift: 'md:mt-24' },
  { span: 'md:col-span-12', ratio: 'aspect-[21/9]', shift: 'md:mt-8' },
];

export function Gallery({
  plates,
  title,
  index = '02',
  heading = 'The Photography',
}: {
  plates: Plate[];
  title: string;
  index?: string;
  heading?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="gallery"
      data-nav-theme="dark"
      className="bg-paper relative z-10"
      aria-labelledby="gallery-title"
    >
      <div className="shell pt-[max(4rem,10vh)] pb-[max(4rem,10vh)]">
        <div className="border-ink/14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
          <Label index={index}>Gallery</Label>
          <span className="t-label text-stone-deep">
            {plates.length} plates · Click to enlarge
          </span>
        </div>

        <div className="mt-10 md:mt-14">
          <MaskedLines as="h2" id="gallery-title" className="t-h1" lines={[heading]} />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-[clamp(1rem,2.2vw,2rem)] gap-y-[clamp(1.5rem,4vw,3.5rem)] md:mt-20 md:grid-cols-12">
          {plates.map((plate, i) => (
            <Plateau
              key={`${plate.image}-${i}`}
              plate={plate}
              i={i}
              onOpen={() => setOpen(i)}
            />
          ))}
        </div>
      </div>

      <Lightbox
        plates={plates}
        index={open}
        onClose={() => setOpen(null)}
        onIndexChange={setOpen}
        title={title}
      />
    </section>
  );
}

function Plateau({
  plate,
  i,
  onOpen,
}: {
  plate: Plate;
  i: number;
  onOpen: () => void;
}) {
  const r = RHYTHM[i % RHYTHM.length];
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-5%', '5%']);

  return (
    <motion.button
      ref={ref}
      onClick={onOpen}
      className={cn('zoom-host focus-bare group/plate block w-full text-left', r.span, r.shift)}
      data-cursor="VIEW"
      aria-label={`Open ${plate.caption} full screen`}
      initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduced ? 0.01 : 1.15, ease: EASE_IN_OUT_QUART }}
    >
      <div className={cn('relative w-full overflow-hidden', r.ratio)}>
        <motion.div className="absolute -inset-[6%]" style={{ y }}>
          <Figure
            image={plate.image}
            className="h-full w-full"
            sizes="(min-width: 768px) 55vw, 100vw"
            quality={72}
          />
        </motion.div>
      </div>
      <div className="border-ink/14 mt-3 flex items-baseline justify-between gap-5 border-t pt-3">
        <motion.span
          className="t-label text-stone-deep group-hover/plate:text-ink transition-colors duration-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.15 }}
        >
          {plate.caption}
        </motion.span>
        <span className="t-label t-num text-stone-deep">
          {String(i + 1).padStart(2, '0')}
        </span>
      </div>
    </motion.button>
  );
}
