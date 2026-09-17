import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
import { CtaBand } from '@/components/sections/CtaBand';
import { Notice } from '@/components/ui/Bits';
import { Seo, breadcrumbSchema } from '@/lib/seo';
import { CATEGORIES, PORTFOLIO, type PortfolioCategory } from '@/data/portfolio';
import { IMAGES } from '@/data/images';
import { usePhotos } from '@/lib/photoStore';
import { isPlaceholderSource } from '@/lib/photoStore';
import { CONTACT } from '@/data/site';

/**
 * The portfolio.
 *
 * `?filter=drone` deep-links to a category, so the "see examples" buttons on
 * the services page land somewhere specific rather than at the top of
 * everything.
 */
export default function Portfolio() {
  const [params] = useSearchParams();
  const requested = params.get('filter');
  const initial = CATEGORIES.some((c) => c.id === requested)
    ? (requested as PortfolioCategory)
    : 'all';

  /* How many pieces on this page are still stand-ins.
     This used to ask "are they ALL drawings?", which quietly answered no the
     moment stock photographs were switched on — and the notice disappeared
     while the grid was still full of other people's houses. It counts what is
     actually not this studio's work now, and reaches zero on its own. */
  const dropped = usePhotos();
  const notMine = PORTFOLIO.filter(
    (p) => isPlaceholderSource(IMAGES[p.image].src, Boolean(dropped[p.image])),
  ).length;

  return (
    <>
      <Seo
        title="Portfolio — Property, Aerial & Commercial Work"
        description={`Selected real estate photography, property films, aerial work and commercial production from ${CONTACT.serviceArea}. Filter by category and open any piece full screen.`}
        path="/portfolio"
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Portfolio', path: '/portfolio' },
        ])}
      />

      <PageHeader
        label="Portfolio"
        title={['Selected work.']}
        lead={`${PORTFOLIO.length} pieces across property, aerial, commercial and lifestyle. Open any of them full screen — the arrow keys walk the set.`}
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Portfolio', path: '/portfolio' },
        ]}
        compact
      />

      <section className="section pt-12" aria-labelledby="all-work">
        <div className="shell">
          {/* The tiles below are h3. Without an h2 between them and the page's
              h1 the outline skips a level, which is how a screen reader user
              loses track of where they are. The design has no room for a
              visible heading here, so this one is for them. */}
          <h2 id="all-work" className="sr-only">
            All work
          </h2>
          {notMine > 0 && (
            <Notice
              tone="warn"
              className="mb-10 max-w-[76ch]"
              title={
                notMine === PORTFOLIO.length
                  ? 'These are samples, not this studio’s work'
                  : `${notMine} of these ${PORTFOLIO.length} are samples, not this studio’s work`
              }
            >
              Every piece marked <span className="text-amber">Sample</span> is a
              stand-in — a stock photograph or a drawn illustration — put here so the
              page reads complete while the real portfolio is assembled. The captions
              describe how each kind of shot is made, and those stay true, but the
              images are not ours to take credit for. Each label disappears on its own
              as soon as the real photograph replaces it.
            </Notice>
          )}

          <PortfolioGrid initialCategory={initial} />
        </div>
      </section>

      <CtaBand
        label="Your listing next"
        title={
          <>
            This is what your next listing could <span className="t-accent">look like.</span>
          </>
        }
        lead="Pick a package, choose a date, and it is in the diary."
        image="reExteriorModern"
      />

      <Footer />
    </>
  );
}
