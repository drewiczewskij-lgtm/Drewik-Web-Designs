import { motion, type HTMLMotionProps } from 'motion/react';
import type { ComponentType, ReactNode } from 'react';
import { T, VIEWPORT, stagger } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  /** Position in a group, for stagger. */
  index?: number;
  delay?: number;
  /** 'rise' travels; 'fade' does not. Use fade where movement would be noise. */
  variant?: 'rise' | 'fade' | 'wipe';
  as?: 'div' | 'section' | 'li' | 'article' | 'header';
}

/**
 * The entrance used by everything on the page. One component, so every reveal
 * on the site shares a curve and a duration — the thing that makes a long
 * scrolling page feel composed rather than assembled.
 *
 * Fires once. A section that re-animates every time it scrolls back into view
 * is the fastest way to make a site feel cheap.
 */
export function Reveal({
  children,
  index = 0,
  delay = 0,
  variant = 'rise',
  as = 'div',
  ...rest
}: RevealProps) {
  const reduced = usePrefersReducedMotion();
  // `motion.div | motion.li | …` is a union whose event handlers are typed to
  // different elements, so the union has no assignable props. The component is
  // chosen at runtime by the caller and the props are the same either way, so
  // one cast here is better than a generic parameter on every call site.
  const Tag = motion[as] as ComponentType<HTMLMotionProps<'div'>>;

  if (reduced) {
    // Opacity only. It still marks the boundary between sections without
    // anything travelling across the screen.
    return (
      <Tag
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.25 }}
        {...rest}
      >
        {children}
      </Tag>
    );
  }

  const variants = {
    rise: { hidden: { opacity: 0, y: 26 }, shown: { opacity: 1, y: 0 } },
    fade: { hidden: { opacity: 0 }, shown: { opacity: 1 } },
    wipe: {
      hidden: { opacity: 1, clipPath: 'inset(0 0 100% 0)' },
      shown: { opacity: 1, clipPath: 'inset(0 0 0% 0)' },
    },
  }[variant];

  return (
    <Tag
      initial="hidden"
      whileInView="shown"
      viewport={VIEWPORT}
      variants={variants}
      transition={{ ...T.reveal, delay: delay + stagger(index) }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * A heading that arrives a line at a time from behind a mask. Reserved for the
 * two or three biggest statements on the site — used everywhere it would be a
 * gimmick, and it would slow every page down.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  play = true,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  /** Set false while a loader is still up, so the first frame is not wasted. */
  play?: boolean;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className={lineClassName}
            style={{ display: 'block', willChange: 'transform' }}
            initial={reduced ? { opacity: 0 } : { y: '108%' }}
            animate={play ? (reduced ? { opacity: 1 } : { y: '0%' }) : undefined}
            transition={{
              duration: reduced ? 0.3 : 1.05,
              ease: [0.16, 1, 0.3, 1],
              delay: reduced ? 0 : delay + i * 0.085,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
