import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { Button, Arrow } from '@/components/ui/Button';
import { Reveal } from '@/components/fx/Reveal';
import { Seo } from '@/lib/seo';
import { NAV, CONTACT } from '@/data/site';

/** A 404 that offers somewhere to go, rather than just reporting a failure. */
export default function NotFound() {
  return (
    <>
      <Seo
        title="Page not found"
        description="That page does not exist. Here is everything that does."
        noIndex
      />

      <PageHeader
        label="404"
        title={['That page', 'doesn’t exist.']}
        lead="The link may be old, or there may be a typo in it. Everything on the site is listed below."
        compact
      >
        <Button to="/" className="group" trailing={<Arrow />}>
          Back to the home page
        </Button>
      </PageHeader>

      <section className="section pt-12">
        <div className="shell">
          <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {[{ label: 'Home', to: '/', note: 'Start here' }, ...NAV, { label: 'Book a shoot', to: '/book', note: 'Live availability and pricing' }].map(
              (item, i) => (
                <Reveal as="li" key={item.to} index={i}>
                  <Link
                    to={item.to}
                    className="group flex h-full flex-col gap-2 bg-void p-7 transition-colors duration-400 hover:bg-ink"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-display text-[18px] font-semibold text-bright">
                        {item.label}
                      </span>
                      <Arrow />
                    </span>
                    {'note' in item && item.note && (
                      <span className="text-[13px] text-muted">{item.note}</span>
                    )}
                  </Link>
                </Reveal>
              ),
            )}
          </ul>

          <p className="mt-10 text-[13.5px] text-muted">
            Still stuck? Call{' '}
            <a href={`tel:${CONTACT.phoneHref}`} className="link-rule font-mono">
              {CONTACT.phone}
            </a>
            .
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
