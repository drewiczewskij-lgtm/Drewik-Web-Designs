import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Figure } from '@/components/Figure';
import { RevealLines } from '@/components/fx/Reveal';
import { EASE_OUT_EXPO } from '@/lib/motion';
import type { ImageKey } from '@/data/images';
import { cn } from '@/lib/cn';

/**
 * The masthead every page below the home page wears.
 *
 * It does two jobs: it says where you are, and it stops the page beginning
 * with a wall of text. The picture is optional — the pricing and FAQ pages are
 * better without one, because the content itself should be the first thing.
 */
export function PageHeader({
  label,
  title,
  lead,
  image,
  breadcrumb,
  children,
  compact,
}: {
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  image?: ImageKey;
  breadcrumb?: { name: string; path: string }[];
  children?: ReactNode;
  compact?: boolean;
}) {
  const titleLines = Array.isArray(title) ? title : [title];

  return (
    <header className="relative overflow-hidden border-b border-line">
      {image ? (
        <>
          <Figure
            image={image}
            priority
            sizes="100vw"
            className="absolute inset-0 h-full w-full"
            imgClassName="opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-void/85 via-void/62 to-void" aria-hidden="true" />
        </>
      ) : (
        <>
          <div className="aurora opacity-70" aria-hidden="true" />
          <div className="grid-floor" aria-hidden="true" />
        </>
      )}

      <div
        className={cn(
          'shell relative flex flex-col justify-end',
          compact
            ? 'pt-[calc(var(--nav-h)+3.5rem)] pb-12'
            : 'min-h-[52svh] pt-[calc(var(--nav-h)+5rem)] pb-16 sm:min-h-[58svh]',
        )}
      >
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] uppercase">
              {breadcrumb.map((crumb, i) => (
                <li key={crumb.path} className="flex items-center gap-2">
                  {i > 0 && <span className="text-faint" aria-hidden="true">/</span>}
                  {i === breadcrumb.length - 1 ? (
                    <span className="text-bright" aria-current="page">{crumb.name}</span>
                  ) : (
                    <Link to={crumb.path} className="text-muted transition-colors hover:text-bright">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.1 }}
          className="t-label mb-5 flex items-center gap-3"
        >
          <span className="h-px w-10 bg-neon" aria-hidden="true" />
          {label}
        </motion.p>

        <h1 className="t-h1 max-w-[16ch]">
          <RevealLines lines={titleLines} delay={0.14} />
        </h1>

        {lead && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.4 }}
            className="t-lead mt-7 max-w-[58ch] text-muted"
          >
            {lead}
          </motion.p>
        )}

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.5 }}
            className="mt-9"
          >
            {children}
          </motion.div>
        )}
      </div>
    </header>
  );
}
