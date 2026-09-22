import type { ReactNode } from 'react';
import { useTilt } from '@/lib/useTilt';
import { cn } from '@/lib/cn';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees. Above about 10 it stops looking expensive. */
  max?: number;
  /** Adds the cursor-following light. Off for cards that already carry a photo. */
  spotlight?: boolean;
}

/**
 * A card with depth. The tilt is driven by custom properties written straight
 * to the node — see `useTilt` — so a grid of these does not re-render React on
 * every pointer move.
 *
 * Both effects are disabled on touch and under reduced motion, where the card
 * simply sits flat and keeps all of its content and behaviour.
 */
export function TiltCard({ children, className, max = 6, spotlight = true }: TiltCardProps) {
  const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>(max);

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn('tilt relative', spotlight && 'spotlight', className)}
    >
      {children}
    </div>
  );
}
