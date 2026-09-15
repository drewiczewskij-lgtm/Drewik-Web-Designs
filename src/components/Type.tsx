import { motion, type HTMLMotionProps } from 'motion/react';
import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { T, VIEWPORT, EASE_OUT_EXPO } from '@/lib/motion';

/* -------------------------------------------------------------------------
   The small uppercase label. It carries the index numbers, the section names
   and the metadata keys — the spine that holds the asymmetric layouts together.
   ---------------------------------------------------------------------- */
export function Label({
  children,
  className,
  as: Tag = 'span',
  index,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  index?: string;
}) {
  return (
    <Tag className={cn('t-label inline-flex items-baseline gap-3', className)}>
      {index && <span className="t-num text-bronze opacity-90">{index}</span>}
      <span>{children}</span>
    </Tag>
  );
}

/* -------------------------------------------------------------------------
   Lines of display type rising out of a clipping mask. Each line is its own
   mask, so a three-line heading staggers the way a letterpress reveal would.
   ---------------------------------------------------------------------- */
export function MaskedLines({
  lines,
  className,
  lineClassName,
  as: Tag = 'h2',
  delay = 0,
  stagger = 0.075,
  once = true,
  animate,
  id,
}: {
  lines: ReactNode[];
  className?: string;
  id?: string;
  lineClassName?: string;
  as?: ElementType;
  delay?: number;
  stagger?: number;
  once?: boolean;
  /** Drive from a parent instead of the viewport (used by the hero). */
  animate?: boolean;
}) {
  const driven = typeof animate === 'boolean';
  return (
    <Tag className={className} id={id}>
      {lines.map((line, i) => (
        <span className={cn('mask-line', lineClassName)} key={i}>
          <motion.span
            initial={{ y: '112%' }}
            {...(driven
              ? { animate: animate ? { y: '0%' } : { y: '112%' } }
              : { whileInView: { y: '0%' }, viewport: { ...VIEWPORT, once } })}
            transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* -------------------------------------------------------------------------
   The workhorse entrance. Short rise, long settle, fires once.
   ---------------------------------------------------------------------- */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  as = 'div',
  amount,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'span' | 'li' | 'p' | 'section' | 'figure';
  amount?: number;
} & Omit<HTMLMotionProps<'div'>, 'children' | 'className'>) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ ...VIEWPORT, ...(amount !== undefined ? { amount } : {}) }}
      transition={{ ...T.reveal, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
