import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { Reveal } from '@/components/fx/Reveal';
import { SectionHead, Notice, Pill, Stat } from '@/components/ui/Bits';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Seo } from '@/lib/seo';
import { PhotoManager } from '@/components/admin/PhotoManager';
import { FilmManager } from '@/components/admin/FilmManager';
import { useBooking } from '@/lib/booking';
import { API_BASE, isLive } from '@/config/integrations';
import { money, PACKAGES, ADDONS, getPackage } from '@shared/catalog.mjs';
import {
  BLOCKED_DATES,
  BUFFER_MINUTES,
  LEAD_TIME_HOURS,
  formatDate,
  formatTime,
  workingDaysSummary,
} from '@shared/schedule.mjs';

/* ============================================================================
   THE DESK
   ----------------------------------------------------------------------------
   A working view of the diary and the price list.

   WHAT IT IS: a read-only console. It shows what has been booked, what the
   prices are, when you work and which dates are blocked — and for each of
   those, exactly which file to edit to change it.

   WHAT IT IS NOT: an editor, and deliberately so. A browser page that can
   rewrite prices needs real accounts, real sessions and real permissions
   behind it; a password box in front of a static site is theatre. Prices live
   in `shared/catalog.mjs` and the diary in `shared/schedule.mjs` — in version
   control, where a mistake can be undone.

   Bookings come from the server when one is configured and you paste the admin
   token. That token is held in memory for the session only: it is never
   written to localStorage, because a token in storage is a token that survives
   a shared computer.
   ========================================================================= */

interface AdminBooking {
  reference: string;
  status: string;
  date: string;
  time: string;
  minutes: number;
  packageName?: string;
  packageId?: string;
  totalCents: number;
  customer?: { name?: string; email?: string; phone?: string; address?: string; notes?: string };
  createdAt: number;
}

export default function Admin() {
  const { history } = useBooking();
  const [token, setToken] = useState('');
  const [remote, setRemote] = useState<AdminBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Local bookings made in this browser, shown when there is no server.
  const local: AdminBooking[] = useMemo(
    () =>
      history.map((b) => ({
        reference: b.reference,
        status: b.paid ? 'confirmed' : 'demonstration',
        date: b.date,
        time: b.time,
        minutes: b.minutes,
        packageId: b.packageId,
        packageName: getPackage(b.packageId)?.name,
        totalCents: b.totalCents,
        customer: b.customer,
        createdAt: b.createdAt,
      })),
    [history],
  );

  const bookings = remote ?? local;

  const load = async () => {
    if (!isLive()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? `Server returned ${res.status}.`);
      setRemote(data.bookings as AdminBooking[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach the server.');
      setRemote(null);
    } finally {
      setLoading(false);
    }
  };

  // Clear the token if the tab is left in the background for a long time.
  useEffect(() => {
    if (!token) return;
    const id = window.setTimeout(() => setToken(''), 30 * 60 * 1000);
    return () => window.clearTimeout(id);
  }, [token]);

  const upcoming = bookings
    .filter((b) => b.status !== 'expired' && b.status !== 'cancelled')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const revenue = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalCents, 0);

  return (
    <>
      <Seo
        title="Studio Desk"
        description="Internal booking and price console for KM Productions."
        path="/admin"
        noIndex
      />

      <PageHeader
        label="Internal"
        title={['Studio desk.']}
        lead="Your photographs, the diary, the price list, and where to change each of them."
        compact
      />

      <div className="section pt-12">
        <div className="shell flex flex-col gap-16">
          {/* Photographs. First, because it is what this page is opened for. */}
          <Reveal className="flex flex-col gap-6">
            <SectionHead
              index="01"
              label="Photographs"
              title={
                <>
                  Drag your work <span className="t-accent">onto the site.</span>
                </>
              }
              lead="Drop photographs here and every page uses them straight away. No terminal, no build, nothing to edit."
            />
            <PhotoManager />
          </Reveal>

          {/* Films. */}
          <Reveal className="flex flex-col gap-6">
            <SectionHead
              index="02"
              label="Films"
              title={
                <>
                  Add your <span className="t-accent">videos.</span>
                </>
              }
              lead="Paste a YouTube or Vimeo link, or drop the file straight in. Each one plays from its piece in the portfolio."
            />
            <FilmManager />
          </Reveal>

          {/* Connection. */}
          <Reveal className="flex flex-col gap-5">
            <SectionHead index="03" label="Bookings" title="The diary" />

            {isLive() ? (
              <div className="glass edge flex flex-col gap-4 p-6">
                <p className="text-[13.5px] text-muted">
                  Connected to <code className="font-mono text-[12.5px] text-cyan-soft">{API_BASE}</code>.
                  Paste the admin token to load bookings. It is kept in memory for this
                  tab only and is never saved.
                </p>
                <div className="flex flex-col items-end gap-3 sm:flex-row">
                  <Field
                    label="Admin token"
                    value={token}
                    onChange={setToken}
                    placeholder="KM_ADMIN_TOKEN"
                    className="flex-1"
                  />
                  <Button onClick={load} disabled={!token || loading}>
                    {loading ? 'Loading…' : 'Load bookings'}
                  </Button>
                </div>
                {error && <Notice tone="warn" title="Could not load">{error}</Notice>}
              </div>
            ) : (
              <Notice tone="warn" title="No booking server connected">
                Showing only the bookings made in this browser, which is what
                demonstration mode records. Connect the server in{' '}
                <code className="font-mono text-[12px] text-cyan-soft">api/</code> and set{' '}
                <code className="font-mono text-[12px] text-cyan-soft">VITE_API_BASE</code> to
                see every real booking here.
              </Notice>
            )}
          </Reveal>

          {/* Summary. */}
          <div className="grid gap-8 border-y border-line py-10 sm:grid-cols-3">
            <Stat value={String(upcoming.length)} label="Open bookings" note={remote ? 'From the server.' : 'From this browser.'} />
            <Stat
              value={money(revenue)}
              label="Confirmed value"
              note="Bookings whose payment has been confirmed."
            />
            <Stat value={String(BLOCKED_DATES.length)} label="Blocked dates" note="Set in shared/schedule.mjs." />
          </div>

          {/* The list. */}
          <Reveal className="flex flex-col gap-5">
            {upcoming.length === 0 ? (
              <p className="py-8 text-muted">
                Nothing in the diary yet. Bookings appear here as they come in.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-line border-y border-line">
                {upcoming.map((b) => (
                  <li key={b.reference} className="flex flex-col gap-3 py-5 sm:flex-row sm:gap-8">
                    <div className="flex shrink-0 flex-col gap-1 sm:w-48">
                      <span className="font-mono text-[13px] tracking-[0.1em] text-bright">
                        {b.reference}
                      </span>
                      <Pill
                        tone={
                          b.status === 'confirmed' ? 'good' : b.status === 'pending' ? 'warn' : 'neutral'
                        }
                      >
                        {b.status}
                      </Pill>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-[14px] text-bright">
                        {formatDate(b.date)} · {formatTime(b.time)}
                      </span>
                      <span className="text-[13px] text-muted">
                        {b.packageName ?? b.packageId} · {Math.floor(b.minutes / 60)}h
                        {b.minutes % 60 ? ` ${b.minutes % 60}m` : ''}
                      </span>
                      {b.customer?.address && (
                        <span className="text-[13px] text-muted">{b.customer.address}</span>
                      )}
                      {b.customer?.name && (
                        <span className="text-[12.5px] text-faint">
                          {b.customer.name}
                          {b.customer.phone ? ` · ${b.customer.phone}` : ''}
                          {b.customer.email ? ` · ${b.customer.email}` : ''}
                        </span>
                      )}
                      {b.customer?.notes && (
                        <p className="mt-1 border-l-2 border-line pl-3 text-[12.5px] leading-relaxed text-muted">
                          {b.customer.notes}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 font-mono text-[14px] tabular-nums text-bright">
                      {money(b.totalCents)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>

          {/* The price list, as configured. */}
          <Reveal className="flex flex-col gap-6">
            <SectionHead index="04" label="Prices" title="What the site charges" />
            <Notice title="To change any of these">
              Edit <code className="font-mono text-[12px] text-cyan-soft">shared/catalog.mjs</code>.
              The website, the booking flow and the payment server all read that one
              file, so a price cannot be right in one place and wrong in another.
            </Notice>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="glass edge flex flex-col gap-3 p-6">
                <h3 className="t-label">Packages</h3>
                <ul className="flex flex-col divide-y divide-line">
                  {PACKAGES.map((p) => (
                    <li key={p.id} className="flex items-baseline justify-between gap-4 py-2.5">
                      <span className="text-[13.5px] text-body">{p.name}</span>
                      <span className="font-mono text-[13px] tabular-nums text-bright">
                        {p.quoteOnly ? 'Quote' : money(p.basePriceCents)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass edge flex flex-col gap-3 p-6">
                <h3 className="t-label">Add-ons</h3>
                <ul className="flex flex-col divide-y divide-line">
                  {ADDONS.map((a) => (
                    <li key={a.id} className="flex items-baseline justify-between gap-4 py-2.5">
                      <span className="text-[13.5px] text-body">{a.name}</span>
                      <span className="font-mono text-[13px] tabular-nums text-bright">
                        {money(a.priceCents)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          {/* The diary, as configured. */}
          <Reveal className="flex flex-col gap-6">
            <SectionHead index="05" label="Availability" title="When the site lets people book" />
            <Notice title="To change any of these">
              Edit <code className="font-mono text-[12px] text-cyan-soft">shared/schedule.mjs</code> —
              working hours, slot length, buffer, notice period and blocked dates are all
              at the top of that file, with a comment on each.
            </Notice>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="glass edge flex flex-col gap-3 p-6">
                <h3 className="t-label">Working hours</h3>
                <ul className="flex flex-col gap-1.5">
                  {workingDaysSummary().map((d) => (
                    <li key={d.day} className="flex justify-between gap-3 text-[13px]">
                      <span className="text-body">{d.day}</span>
                      <span className="font-mono text-[11.5px] text-muted">{d.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass edge flex flex-col gap-3 p-6">
                <h3 className="t-label">Rules</h3>
                <ul className="flex flex-col gap-1.5 text-[13px] text-muted">
                  <li>Buffer between shoots: {BUFFER_MINUTES} min</li>
                  <li>Minimum notice: {LEAD_TIME_HOURS} hours</li>
                  <li>Slots offered every 30 min</li>
                </ul>
              </div>

              <div className="glass edge flex flex-col gap-3 p-6">
                <h3 className="t-label">Blocked dates</h3>
                {BLOCKED_DATES.length === 0 ? (
                  <p className="text-[13px] text-muted">None.</p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {BLOCKED_DATES.map((d) => (
                      <li key={d} className="font-mono text-[12px] text-muted">
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Reveal>

          {/* Content. */}
          <Reveal className="flex flex-col gap-6">
            <SectionHead index="06" label="Content" title="Where everything else lives" />
            <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
              {[
                ['Photographs and film', 'src/data/images.ts', 'One entry per image. Set `src` to a file path and it replaces the drawn plate.'],
                ['Portfolio items', 'src/data/portfolio.ts', 'Title, location, category, caption and the video source.'],
                ['Testimonials', 'src/data/testimonials.ts', 'Remove `placeholder: true` once a quote is genuinely someone else’s.'],
                ['Services copy', 'src/data/services.ts', 'Descriptions and inclusions. Prices come from the catalogue.'],
                ['Business details', 'src/data/site.ts', 'Name, phone, email, service area, socials, the founder.'],
                ['Questions', 'src/data/faq.ts', 'Grouped. Keep answers matching the actual policies.'],
              ].map(([title, file, note]) => (
                <li key={file} className="flex flex-col gap-1.5 bg-void p-6">
                  <h3 className="font-display text-[15px] font-semibold text-bright">{title}</h3>
                  <code className="font-mono text-[12px] text-cyan-soft">{file}</code>
                  <p className="text-[13px] leading-relaxed text-muted">{note}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      <Footer />
    </>
  );
}
