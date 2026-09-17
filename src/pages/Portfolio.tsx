import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
import { CtaBand } from '@/components/sections/CtaBand';
import { Seo, breadcrumbSchema } from '@/lib/seo';
import { CATEGORIES, shownPortfolio, type PortfolioCategory } from '@/data/portfolio';
import { IMAGES, isOwnWork, type ImageKey } from '@/data/images';
import { usePhotos } from '@/lib/photoStore';
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

  /* Count what the grid will really show. The alternative — counting every
     item in the file — put "28 pieces" above a grid of six. */
  const dropped = usePhotos();
  const count = shownPortfolio((key: ImageKey) =>
    isOwnWork(IMAGES[key].src, Boolean(dropped[key])),
  ).length;

  const lead =
    count === 0
      ? 'The first pieces are being added. Call and we will send recent work straight over.'
      : `${count} ${count === 1 ? 'piece' : 'pieces'} of our own work. Open any of them full screen — the arrow keys walk the set.`;

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
        lead={lead}
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
        image="reKitchen"
      />

      <Footer />
    </>
  );
}
