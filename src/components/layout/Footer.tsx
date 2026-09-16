import { Link } from 'react-router-dom';
import { BRAND, CONTACT, FOOTER_LINKS, LEGAL_LINKS, NAV, SOCIALS } from '@/data/site';
import { Button, Arrow } from '@/components/ui/Button';
import { Reveal } from '@/components/fx/Reveal';
import { workingDaysSummary } from '@shared/schedule.mjs';

export function Footer() {
  const hours = workingDaysSummary();

  return (
    <footer className="relative overflow-hidden border-t border-line bg-void">
      <div className="aurora opacity-40" aria-hidden="true" />
      <div className="grid-floor" aria-hidden="true" />

      <div className="shell relative">
        {/* The last call to action. A visitor who has read to the bottom is the
            most likely to book, and should not have to scroll back up. */}
        <Reveal className="flex flex-col items-start gap-8 border-b border-line py-16 md:flex-row md:items-end md:justify-between md:py-24">
          {/* A rem width, not `ch`. A `ch` on this wrapper is measured in the
              wrapper's own 15px font, not the heading's — which made the
              headline about 180px wide and broke it onto eight lines. */}
          <div className="flex max-w-[30rem] flex-col gap-4">
            <p className="t-label">Ready when you are</p>
            <h2 className="t-h2">
              Let’s make your listing the <span className="t-accent">best one</span> on the street.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button to="/book" size="lg" className="group" trailing={<Arrow />}>
              Book a shoot
            </Button>
            <Button to="/contact" variant="ghost" size="lg">
              Get a quote
            </Button>
          </div>
        </Reveal>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-5">
            <p className="font-display text-[17px] font-semibold tracking-tight text-bright">
              {BRAND.name}
            </p>
            <p className="max-w-[30ch] text-[13.5px] leading-relaxed text-muted">
              {BRAND.description} Serving {CONTACT.serviceArea}.
            </p>
            <div className="flex flex-col gap-1.5">
              <a
                href={`tel:${CONTACT.phoneHref}`}
                className="link-rule w-fit font-mono text-[13px] tracking-wide"
              >
                {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="link-rule w-fit text-[13px] break-all">
                {CONTACT.email}
              </a>
            </div>
          </div>

          <nav aria-label="Footer — pages" className="flex flex-col gap-4">
            <p className="t-label">Pages</p>
            <ul className="flex flex-col gap-2.5">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[13.5px] text-muted transition-colors duration-200 hover:text-bright"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer — booking" className="flex flex-col gap-4">
            <p className="t-label">Get started</p>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.map((item) => (
                <li key={item.to + item.label}>
                  <Link
                    to={item.to}
                    className="text-[13.5px] text-muted transition-colors duration-200 hover:text-bright"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-4">
            <p className="t-label">Studio hours</p>
            <ul className="flex flex-col gap-1.5">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4 text-[13px] text-muted">
                  <span>{h.day}</span>
                  <span className="text-right font-mono text-[11.5px] tracking-tight text-faint">
                    {h.hours}
                  </span>
                </li>
              ))}
              <li className="flex justify-between gap-4 text-[13px] text-faint">
                <span>Sunday</span>
                <span className="font-mono text-[11.5px]">Closed</span>
              </li>
            </ul>

            <p className="t-label mt-4">Follow</p>
            <ul className="flex flex-wrap gap-2">
              {SOCIALS.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-line px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-muted uppercase transition-[color,border-color,box-shadow] duration-300 hover:border-neon/50 hover:text-bright"
                  >
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-faint">
            © {new Date().getFullYear()} {BRAND.name}. All photography and film remain the
            property of {BRAND.name}.
          </p>
          <ul className="flex gap-5">
            <li>
              <Link
                to="/admin"
                className="text-[12px] text-faint transition-colors duration-200 hover:text-body"
              >
                Studio desk
              </Link>
            </li>
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-[12px] text-faint transition-colors duration-200 hover:text-body"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
