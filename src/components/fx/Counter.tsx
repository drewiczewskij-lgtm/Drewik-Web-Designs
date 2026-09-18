import { useCountUp } from '@/lib/useCountUp';
import { cn } from '@/lib/cn';

/**
 * A statistic that counts up the first time it is seen.
 *
 * The figure is announced to assistive technology as its final value, not as
 * the running count — a screen reader reciting every intermediate number would
 * be unusable.
 */
export function Counter({
  value,
  suffix = '',
  prefix = '',
  className,
  duration,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
}) {
  const { ref, value: current } = useCountUp(value, duration);
  const final = `${prefix}${value.toLocaleString('en-US')}${suffix}`;

  return (
    <span ref={ref} className={cn('t-num tabular-nums', className)}>
      <span aria-hidden="true">
        {prefix}
        {current.toLocaleString('en-US')}
        {suffix}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
