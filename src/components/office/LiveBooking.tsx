import { useEffect, useRef, useState } from 'react';
import { bookingDirectUrl, bookingEmbedUrl, BOOKING } from '@/config/integrations';
import { Figure } from '../Figure';
import type { Property } from '@/data/properties';

/* ==========================================================================
   LIVE DIARY
   The scheduler's own page, framed inside the panel. It is a plain iframe on
   purpose: no third-party script runs on this site, so nothing the scheduler
   ships can read the rest of the page.

   A frame can be refused for reasons we cannot see from here — a browser
   setting, a blocker, an embed rule at the scheduler's end — and a refused
   frame still fires `load`, so there is no reliable way to detect it. Rather
   than guess, the same booking is always one click away in a new tab.
   ======================================================================== */

export function LiveBooking({ property }: { property: Property }) {
  const src = bookingEmbedUrl({
    notes: `${property.name} — ${property.locationLine}`,
  });
  const direct = bookingDirectUrl();
  const [loaded, setLoaded] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    // Retire the spinner even if the frame never reports in.
    timer.current = window.setTimeout(() => setLoaded(true), 8000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [src]);

  if (!src || !direct) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="border-ink/12 mb-5 flex items-center gap-4 border-b pb-5">
        <Figure image={property.cover} className="h-14 w-20 shrink-0" sizes="80px" quality={50} />
        <div className="min-w-0 flex-1">
          <p className="t-label truncate">{property.name}</p>
          <p className="t-label text-stone-deep mt-1.5">{property.locationLine}</p>
        </div>
      </div>

      <div className="relative min-h-[520px] flex-1">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              aria-hidden="true"
              className="border-ink/20 border-t-ink h-5 w-5 animate-spin rounded-full border"
              style={{ animationDuration: '620ms' }}
            />
            <span className="sr-only">Loading the diary</span>
          </div>
        )}
        <iframe
          src={src}
          title={`Book a viewing of ${property.name}`}
          onLoad={() => setLoaded(true)}
          className="h-full w-full border-0"
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 260ms cubic-bezier(.23,1,.32,1)',
          }}
        />
      </div>

      <div className="border-ink/12 mt-5 flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t pt-4">
        <span className="t-label text-stone-deep">
          Booked through {BOOKING.provider === 'cal' ? 'Cal.com' : 'Calendly'}
        </span>
        <a
          href={direct}
          target="_blank"
          rel="noreferrer noopener"
          className="press focus-bare arrow-host group/cta inline-flex items-center gap-3"
        >
          <span className="t-label">Open in a new tab</span>
          <svg width="20" height="8" viewBox="0 0 22 8" fill="none" aria-hidden="true" className="arrow-step">
            <path d="M0 4h20M16.4 0.6 20 4l-3.6 3.4" stroke="currentColor" strokeWidth="1" />
          </svg>
        </a>
      </div>
    </div>
  );
}
