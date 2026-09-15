import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useRef, type ReactNode, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useHasFinePointer } from '@/lib/useMediaQuery';

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      className={cn('arrow-step', className)}
      width="22"
      height="8"
      viewBox="0 0 22 8"
      fill="none"
      aria-hidden="true"
    >
      <path d="M0 4h20M16.4 0.6 20 4l-3.6 3.4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

interface CtaProps {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  dark?: boolean;
  /** No underline rule — for use inside an already-bordered block. */
  bare?: boolean;
  cursor?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  ariaLabel?: string;
}

/**
 * The text call to action: a small uppercase label, a hairline that sweeps in
 * from the left, and an arrow that steps right. It is the only button style on
 * the site apart from the contact form's block.
 */
export function Cta({
  children,
  to,
  href,
  onClick,
  className,
  dark = false,
  bare = false,
  cursor,
  type = 'button',
  disabled,
  ariaLabel,
}: CtaProps) {
  const inner = (
    <>
      <span className="t-label">{children}</span>
      <Arrow className={dark ? 'text-paper' : 'text-ink'} />
      {!bare && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute right-0 bottom-0 left-0 h-px origin-right scale-x-0 transition-transform duration-[650ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/cta:origin-left group-hover/cta:scale-x-100 group-focus-visible/cta:origin-left group-focus-visible/cta:scale-x-100',
            dark ? 'bg-paper' : 'bg-ink',
          )}
        />
      )}
      {!bare && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute right-0 bottom-0 left-0 h-px',
            dark ? 'bg-paper/25' : 'bg-ink/20',
          )}
        />
      )}
    </>
  );

  const classes = cn(
    'group/cta arrow-host focus-bare relative inline-flex items-center gap-4 pt-1 pb-3',
    disabled && 'pointer-events-none opacity-40',
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes} data-cursor={cursor} aria-label={ariaLabel}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} data-cursor={cursor} aria-label={ariaLabel}>
        {inner}
      </a>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      data-cursor={cursor}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {inner}
    </button>
  );
}

/**
 * Pulls gently toward the pointer inside its own bounds. Reserved for the two
 * moments where it earns itself: the hero's scroll cue and the contact submit.
 */
export function Magnetic({
  children,
  className,
  strength = 0.32,
  radius = 90,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const fine = useHasFinePointer();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 190, damping: 18, mass: 0.35 });
  const sy = useSpring(my, { stiffness: 190, damping: 18, mass: 0.35 });
  const x = useTransform(sx, (v) => v);
  const y = useTransform(sy, (v) => v);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced || !fine) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy);
    const falloff = Math.max(0, 1 - dist / (radius + Math.max(r.width, r.height) / 2));
    mx.set(dx * strength * falloff);
    my.set(dy * strength * falloff);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn('inline-block', className)}
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  );
}
