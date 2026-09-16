import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { PortfolioCard } from './PortfolioCard';
import { Lightbox } from './Lightbox';
import {
  CATEGORIES,
  PORTFOLIO,
  type PortfolioCategory,
  type PortfolioItem,
} from '@/data/portfolio';
import { EASE_UI } from '@/lib/motion';
import { cn } from '@/lib/cn';

/* ============================================================================
   THE GRID
   ----------------------------------------------------------------------------
   A dense masonry with category filters and a viewer.

   Two details make it feel considered rather than assembled. First, filtering
   animates the tiles that remain into their new positions rather than
   rebuilding the grid — `layout` on each card, and a stable React key.
   Second, the viewer walks the FILTERED set, so pressing the right arrow after
   filtering to Drone stays in Drone instead of wandering into the kitchens.
   ========================================================================= */

export function PortfolioGrid({
  items = PORTFOLIO,
  showFilters = true,
  initialCategory = 'all',
  className,
}: {
  items?: PortfolioItem[];
  showFilters?: boolean;
  initialCategory?: PortfolioCategory | 'all';
  className?: string;
}) {
  const [category, setCategory] = useState<PortfolioCategory | 'all'>(initialCategory);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visible = useMemo(() => {
    if (!showFilters) return items;
    return category === 'all' ? items : items.filter((i) => i.category === category);
  }, [items, category, showFilters]);

  // Counts come from the same source the filter uses, so a tab can never
  // advertise a number it will not deliver.
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of CATEGORIES) {
      map.set(c.id, c.id === 'all' ? items.length : items.filter((i) => i.category === c.id).length);
    }
    return map;
  }, [items]);

  const active = CATEGORIES.find((c) => c.id === category);

  return (
    <div className={className}>
      {showFilters && (
        <div className="mb-10 flex flex-col gap-4">
          <div
            role="tablist"
            aria-label="Filter the portfolio by category"
            className="flex flex-wrap gap-2"
          >
            {CATEGORIES.map((c) => {
              const count = counts.get(c.id) ?? 0;
              const isActive = category === c.id;
              // A filter that would empty the grid is not offered.
              if (count === 0) return null;
              return (
                <button
                  key={c.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => {
                    setCategory(c.id);
                    setOpenIndex(null);
                  }}
                  className={cn(
                    'relative overflow-hidden rounded-full border px-4 py-2 font-mono text-[10.5px] tracking-[0.16em] uppercase transition-[color,border-color,background-color,transform] duration-200 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.97]',
                    isActive
                      ? 'border-neon/60 text-bright'
                      : 'border-line text-muted hover:border-white/20 hover:text-bright',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-neon/14"
                      style={{ boxShadow: 'inset 0 0 0 1px rgb(45 125 255 / 0.4), 0 0 26px -10px rgb(45 125 255)' }}
                      transition={{ duration: 0.3, ease: EASE_UI }}
                    />
                  )}
                  {c.label}
                  <span className="ml-2 text-faint">{String(count).padStart(2, '0')}</span>
                </button>
              );
            })}
          </div>

          {/* The blurb changes with the filter, so the control has a voice. */}
          <AnimatePresence mode="wait">
            <motion.p
              key={category}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: EASE_UI }}
              className="text-[13px] text-muted"
              aria-live="polite"
            >
              {active?.blurb}{' '}
              <span className="text-faint">
                Showing {visible.length} {visible.length === 1 ? 'piece' : 'pieces'}.
              </span>
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      {/* Multi-column, not a grid.

          A dense CSS grid cannot pack items whose height comes from an aspect
          ratio: a two-row tile and its neighbours never line up, and the
          right-hand edge fills with holes. Columns fill independently, so
          there is never a gap — which is also why almost every photography
          portfolio is built this way. The cost is that reading order runs down
          each column rather than across, which for a set of images nobody
          reads in order is not a cost at all. */}
      <ul className="columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3 [&>li]:mb-3 sm:[&>li]:mb-4">
        <AnimatePresence mode="popLayout">
          {visible.map((item, i) => (
            <PortfolioCard
              key={item.id}
              item={item}
              index={i}
              onOpen={() => setOpenIndex(i)}
            />
          ))}
        </AnimatePresence>
      </ul>

      {visible.length === 0 && (
        <p className="py-16 text-center text-muted">Nothing in this category yet.</p>
      )}

      <Lightbox
        items={visible}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </div>
  );
}
