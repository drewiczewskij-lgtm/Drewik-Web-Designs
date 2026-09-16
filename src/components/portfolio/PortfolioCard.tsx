import { motion } from 'motion/react';
import { Figure } from '@/components/Figure';
import { categoryLabel, isPlayable, type PortfolioItem } from '@/data/portfolio';
import { useTilt } from '@/lib/useTilt';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { cn } from '@/lib/cn';

/* Height only — the column decides the width. Three shapes, so a column
   reads as a considered sequence rather than a stack of identical boxes. */
const SHAPE: Record<PortfolioItem['aspect'], string> = {
  square: 'aspect-[4/3]',
  tall: 'aspect-[4/5.2]',
  wide: 'aspect-[16/10]',
};

/**
 * One portfolio tile.
 *
 * It is a button, not a div with a click handler — which is what makes it
 * reachable by keyboard, announceable, and able to say what it opens.
 */
export function PortfolioCard({
  item,
  index,
  onOpen,
}: {
  item: PortfolioItem;
  index: number;
  onOpen: () => void;
}) {
  const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLButtonElement>(4);
  const playable = isPlayable(item);
  const isVideo = item.kind === 'video';

  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        duration: 0.55,
        ease: EASE_OUT_EXPO,
        // Capped, so a 26-item grid does not take four seconds to arrive.
        delay: Math.min(index * 0.04, 0.32),
      }}
      // `break-inside-avoid` keeps a tile whole instead of letting the
      // browser split it across two columns.
      className={cn('group relative block break-inside-avoid', SHAPE[item.aspect])}
    >
      <button
        ref={ref}
        type="button"
        onClick={onOpen}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="tilt spotlight zoom-host edge relative block h-full w-full overflow-hidden bg-ink text-left"
      >
        <Figure
          image={item.image}
          className="absolute inset-0 h-full w-full"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* The scrim is always present, and deepens on hover. Text over a
            photograph needs a guarantee, not a hope. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95"
        />

        <div className="relative flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="t-label rounded-full border border-white/12 bg-void/55 px-2.5 py-1 text-[9.5px] backdrop-blur-md">
              {categoryLabel(item.category)}
            </span>

            {isVideo && (
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-void/55 backdrop-blur-md transition-[border-color,box-shadow,transform] duration-400 group-hover:scale-110 group-hover:border-neon/70"
                style={{ boxShadow: '0 0 20px -8px rgb(45 125 255 / 0.9)' }}
                aria-hidden="true"
              >
                <svg width="9" height="11" viewBox="0 0 9 11" fill="none">
                  <path d="M0 0L9 5.5L0 11V0Z" fill="currentColor" className="text-bright" />
                </svg>
              </span>
            )}
          </div>

          <div className="on-image flex flex-col gap-1.5">
            {/* The detail line slides up on hover. On touch it is simply
                always visible, because there is no hover to trigger it. */}
            <h3 className="font-display text-[17px] leading-tight font-semibold text-bright sm:text-[19px]">
              {item.title}
            </h3>
            <p className="font-mono text-[10.5px] tracking-[0.14em] text-cyan-soft/90 uppercase">
              {item.location}
            </p>
            <p className="max-h-0 overflow-hidden text-[12.5px] leading-snug text-body/90 opacity-0 transition-[max-height,opacity,margin] duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:mt-1 group-hover:max-h-24 group-hover:opacity-100 group-focus-visible:mt-1 group-focus-visible:max-h-24 group-focus-visible:opacity-100">
              {item.caption}
            </p>
          </div>
        </div>

        {/* A hairline that sweeps across the bottom edge on hover. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-neon via-cyan to-violet transition-transform duration-600 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100"
        />

        <span className="sr-only">
          {isVideo
            ? playable
              ? `Play the film: ${item.title}, ${item.location}.`
              : `Open a still from the film: ${item.title}, ${item.location}.`
            : `View the photograph: ${item.title}, ${item.location}.`}
        </span>
      </button>
    </motion.li>
  );
}
