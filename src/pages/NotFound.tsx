import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PROPERTIES } from '@/data/properties';
import { BRAND } from '@/data/site';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { Figure } from '@/components/Figure';
import { Footer } from '@/components/Footer';
import { Cta } from '@/components/Cta';
import { Label, MaskedLines } from '@/components/Type';

export default function NotFound() {
  useEffect(() => {
    document.title = `Not found — ${BRAND.name}`;
  }, []);

  return (
    <>
      <section
        data-nav-theme="light"
        className="bg-charcoal text-paper on-dark relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
      >
        <div className="absolute inset-0">
          <motion.div
            className="h-full w-full"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: EASE_OUT_EXPO }}
          >
            <Figure
              image="aureliaDusk"
              priority
              eager
              className="h-full w-full"
              sizes="100vw"
              quality={72}
            />
          </motion.div>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(12,11,9,.9) 0%, rgba(12,11,9,.5) 40%, rgba(12,11,9,.25) 100%)',
            }}
          />
        </div>

        <div className="shell relative pt-32 pb-[max(2.5rem,7vh)]">
          <Label index="404" className="text-paper/60">
            Not in the book
          </Label>
          <MaskedLines
            as="h1"
            className="t-h1 mt-8 max-w-[16ch]"
            lines={['This address', 'does not exist.']}
          />
          <p className="t-body text-paper/70 mt-8 max-w-[44ch]">
            The page you asked for has been withdrawn, renamed, or was never here.
            Everything currently represented is below.
          </p>

          <ul className="border-paper/20 mt-12 border-t">
            {PROPERTIES.map((p) => (
              <li key={p.slug} className="border-paper/12 border-b">
                <Link
                  to={`/residences/${p.slug}`}
                  className="focus-bare arrow-host group/row flex items-baseline justify-between gap-6 py-4"
                  data-cursor="VIEW"
                >
                  <span className="t-h3">{p.name}</span>
                  <span className="t-label text-paper/50 hidden sm:block">
                    {p.locationLine}
                  </span>
                  <span className="t-label t-num text-paper/70">{p.priceCompact}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12">
            <Cta to="/" dark>
              Return Home
            </Cta>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
