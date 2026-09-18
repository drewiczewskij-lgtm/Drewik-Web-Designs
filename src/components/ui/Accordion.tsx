import { AnimatePresence, motion } from 'motion/react';
import { useId, useState } from 'react';
import { EASE_UI } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

export interface AccordionItem {
  id: string;
  q: string;
  a: string;
}

/**
 * The FAQ accordion.
 *
 * `allowMultiple` is false by default — one answer at a time keeps the page
 * from growing under the reader as they work down it.
 *
 * The heading contains the button rather than sitting beside it, so the
 * question is both a landmark and the control that opens it.
 */
export function Accordion({
  items,
  className,
  allowMultiple = false,
  headingLevel = 3,
}: {
  items: AccordionItem[];
  className?: string;
  allowMultiple?: boolean;
  headingLevel?: 2 | 3 | 4;
}) {
  const [open, setOpen] = useState<string[]>([]);
  const baseId = useId();
  const reduced = usePrefersReducedMotion();
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  const toggle = (id: string) => {
    setOpen((current) => {
      if (current.includes(id)) return current.filter((x) => x !== id);
      return allowMultiple ? [...current, id] : [id];
    });
  };

  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;

        return (
          <div key={item.id}>
            <Heading className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="group flex w-full items-start justify-between gap-6 py-6 text-left transition-colors duration-200"
              >
                <span
                  className={cn(
                    'font-display text-[16px] leading-snug font-medium tracking-tight transition-colors duration-200 sm:text-[18px]',
                    isOpen ? 'text-bright' : 'text-body group-hover:text-bright',
                  )}
                >
                  {item.q}
                </span>

                {/* A plus that becomes a minus. Only the vertical stroke moves,
                    so there is nothing to get out of sync. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors duration-300',
                    isOpen
                      ? 'border-neon/60 bg-neon/10 text-neon'
                      : 'border-line text-muted group-hover:border-neon/40 group-hover:text-neon',
                  )}
                >
                  <span className="absolute h-px w-2.5 bg-current" />
                  <span
                    className="absolute h-2.5 w-px bg-current transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)]"
                    style={{ transform: isOpen ? 'scaleY(0)' : 'scaleY(1)' }}
                  />
                </span>
              </button>
            </Heading>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0.15 : 0.28, ease: EASE_UI }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[68ch] pr-10 pb-7 text-[14.5px] leading-relaxed text-body">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
