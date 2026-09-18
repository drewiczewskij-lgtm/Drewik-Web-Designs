import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { EASE_UI } from '@/lib/motion';
import { cn } from '@/lib/cn';

/**
 * The selectable tile used throughout the booking flow — shoot type, package,
 * add-on, time slot.
 *
 * It is a real `<button>` with `aria-pressed`, so a screen reader says
 * "Twilight exteriors, pressed" rather than reading a div and leaving the
 * state entirely invisible. The selected edge is a shared layout element,
 * which is what makes selection feel like one light moving rather than two
 * separate borders blinking.
 */
export function OptionCard({
  selected,
  onSelect,
  disabled,
  title,
  meta,
  body,
  price,
  layoutGroup,
  className,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  title: ReactNode;
  meta?: ReactNode;
  body?: ReactNode;
  price?: ReactNode;
  /** Shares the moving highlight between cards in the same set. */
  layoutGroup?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'glass edge group relative flex w-full flex-col gap-2 p-5 text-left transition-[transform,border-color,box-shadow] duration-200 ease-[cubic-bezier(.23,1,.32,1)]',
        !disabled && 'active:scale-[0.985]',
        disabled && 'cursor-not-allowed opacity-45',
        selected && 'edge-on',
        className,
      )}
    >
      {selected && layoutGroup && (
        <motion.span
          layoutId={layoutGroup}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 border border-neon/70"
          style={{ boxShadow: '0 0 44px -14px rgb(45 125 255)' }}
          transition={{ duration: 0.3, ease: EASE_UI }}
        />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-display text-[15.5px] leading-tight font-semibold text-bright">
            {title}
          </span>
          {meta && (
            <span className="font-mono text-[10.5px] tracking-[0.14em] text-faint uppercase">
              {meta}
            </span>
          )}
        </div>

        <span className="flex shrink-0 items-center gap-3">
          {price && (
            <span
              className={cn(
                'font-mono text-[13px] tabular-nums transition-colors duration-200',
                selected ? 'text-neon-soft' : 'text-body',
              )}
            >
              {price}
            </span>
          )}
          <Check selected={selected} />
        </span>
      </div>

      {body && <p className="relative text-[13px] leading-relaxed text-muted">{body}</p>}
      {children}
    </button>
  );
}

export function Check({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-250 ease-[cubic-bezier(.23,1,.32,1)]',
        selected
          ? 'scale-100 border-neon bg-neon text-white'
          : 'border-line text-transparent group-hover:border-white/28',
      )}
      style={selected ? { boxShadow: '0 0 18px -4px rgb(45 125 255 / 0.9)' } : undefined}
    >
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <motion.path
          d="M1 4L3.8 6.8L9 1"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="square"
          initial={false}
          animate={{ pathLength: selected ? 1 : 0 }}
          transition={{ duration: 0.25, ease: EASE_UI }}
        />
      </svg>
    </span>
  );
}
