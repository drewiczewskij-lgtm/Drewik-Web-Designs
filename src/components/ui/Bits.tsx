import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/* ============================================================================
   SMALL PARTS
   The pieces that appear on nearly every page. Kept together because none is
   big enough to earn a file, and separating them would mean eight imports
   where one will do.
   ========================================================================= */

/** The numbered label above a section heading. */
export function SectionLabel({ index, children }: { index?: string; children: ReactNode }) {
  return (
    <p className="t-label flex items-center gap-3">
      {index && <span className="text-neon">{index}</span>}
      <span className="h-px w-8 bg-line" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** A heading block: label, title, and an optional standfirst. */
export function SectionHead({
  index,
  label,
  title,
  lead,
  align = 'left',
  className,
  as = 'h2',
}: {
  index?: string;
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  as?: 'h1' | 'h2';
}) {
  const Tag = as;
  return (
    <div
      className={cn(
        'flex flex-col gap-5',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <SectionLabel index={index}>{label}</SectionLabel>
      <Tag className={cn(as === 'h1' ? 't-h1' : 't-h2', 'max-w-[20ch]')}>{title}</Tag>
      {lead && (
        <p className={cn('t-lead max-w-[56ch] text-muted', align === 'center' && 'mx-auto')}>
          {lead}
        </p>
      )}
    </div>
  );
}

/** A small status chip. Neutral by default; `tone` colours it. */
export function Pill({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'neon' | 'good' | 'warn';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.16em] uppercase',
        tone === 'neutral' && 'border-line text-muted',
        tone === 'neon' && 'border-neon/45 bg-neon/10 text-neon-soft',
        tone === 'good' && 'border-good/40 bg-good/10 text-good',
        tone === 'warn' && 'border-amber/40 bg-amber/10 text-amber',
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * The notice used wherever the site is standing in for something real —
 * placeholder testimonials, demonstration payments, a form with no endpoint.
 *
 * It exists so those admissions look deliberate and consistent rather than
 * like six different apologies written by six different people.
 */
export function Notice({
  children,
  tone = 'neutral',
  className,
  title,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'warn' | 'good';
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        'flex gap-3 border-l-2 py-3 pl-4 text-[13px] leading-relaxed',
        tone === 'neutral' && 'border-line bg-white/[0.02] text-muted',
        tone === 'warn' && 'border-amber/60 bg-amber/[0.06] text-body',
        tone === 'good' && 'border-good/60 bg-good/[0.06] text-body',
        className,
      )}
    >
      <div>
        {title && <p className="t-label mb-1 text-bright">{title}</p>}
        {children}
      </div>
    </div>
  );
}

/** A statistic. Used in rows of two, three or four. */
export function Stat({
  value,
  label,
  note,
  className,
}: {
  value: ReactNode;
  label: string;
  note?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="t-num text-[clamp(2.2rem,4.4vw,3.4rem)] leading-none text-bright">
        {value}
      </span>
      <span className="t-label text-bright">{label}</span>
      {note && <span className="max-w-[26ch] text-[13px] leading-relaxed text-muted">{note}</span>}
    </div>
  );
}

/** A tick, for "what's included" lists. */
export function Tick({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      aria-hidden="true"
      className={cn('mt-[6px] shrink-0 text-neon', className)}
    >
      <path d="M1 5L4.2 8.2L11 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

/** The "what's included" list itself. */
export function IncludeList({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn('flex flex-col gap-2.5', className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[13.5px] leading-relaxed text-body">
          <Tick />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
