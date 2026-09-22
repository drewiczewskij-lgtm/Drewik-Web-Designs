import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost' | 'quiet';
type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2.5 text-[10px]',
  md: 'px-6 py-3.5',
  lg: 'px-8 py-4 text-[11.5px]',
};

interface Common {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** A small glyph after the label. Decorative, so it is hidden from readers. */
  trailing?: ReactNode;
  full?: boolean;
}

interface AsButton extends Common {
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  to?: never;
  href?: never;
}

interface AsLink extends Common {
  to: string;
  onClick?: () => void;
  href?: never;
  disabled?: never;
  type?: never;
}

interface AsAnchor extends Common {
  href: string;
  to?: never;
  onClick?: never;
  disabled?: never;
  type?: never;
  /** Set for anything leaving the site. */
  external?: boolean;
}

type ButtonProps = AsButton | AsLink | AsAnchor;

/**
 * One button. Three weights, three sizes, and a press state on all of them —
 * the `:active` scale lives in the stylesheet so it is impossible to forget.
 */
export function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', className, trailing, full } = props;

  const classes = cn(
    'btn',
    variant === 'primary' && 'btn-primary',
    variant === 'ghost' && 'btn-ghost',
    variant === 'quiet' && 'btn-quiet',
    SIZES[size],
    full && 'w-full',
    className,
  );

  const content = (
    <>
      {children}
      {trailing && <span aria-hidden="true">{trailing}</span>}
    </>
  );

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={classes} onClick={props.onClick}>
        {content}
      </Link>
    );
  }

  if ('href' in props && props.href) {
    const external = 'external' in props && props.external;
    return (
      <a
        href={props.href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  }

  const { onClick, type = 'button', disabled } = props as AsButton;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}

/** The arrow used on most calls to action. Moves on hover, via the parent. */
export function Arrow() {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      aria-hidden="true"
      className="transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)] group-hover:translate-x-1"
    >
      <path d="M9 1L13 5L9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
      <path d="M0 5H13" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
