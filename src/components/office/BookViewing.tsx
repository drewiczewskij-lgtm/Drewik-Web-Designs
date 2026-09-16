import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import {
  agentFor,
  hasAvailability,
  isoDate,
  slotsFor,
  useOffice,
  ALL_PROPERTIES,
  SLOT_MINUTES,
} from '@/lib/office';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { Figure } from '../Figure';
import { Panel, Solid, Chip } from './Panel';

/* ==========================================================================
   BOOK A PRIVATE VIEWING
   Property, day, time, who is coming. Four decisions, one screen each, and a
   confirmation that reads like something a broker would actually send.
   ======================================================================== */

const EASE_UI = [0.23, 1, 0.32, 1] as const;
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Step = 'when' | 'who' | 'done';

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function prettyDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function BookViewing() {
  const { desk, close, property, setProperty, addBooking } = useOffice();
  const reduced = usePrefersReducedMotion();
  const open = desk === 'booking';

  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('when');
  const [party, setParty] = useState('1');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState<string | null>(null);

  const agent = agentFor(property);

  // The month grid, padded so the first of the month lands on its weekday.
  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const days: (Date | null)[] = Array.from({ length: first.getDay() }, () => null);
    const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= count; i++) {
      days.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
    }
    return days;
  }, [cursor]);

  const slots = date
    ? slotsFor(property.slug, new Date(`${date}T00:00:00`))
    : [];

  const canGoBack = cursor > new Date(today.getFullYear(), today.getMonth(), 1);
  const horizon = new Date(today.getFullYear(), today.getMonth() + 3, 1);

  const reset = () => {
    setStep('when');
    setDate(null);
    setTime(null);
    setRef(null);
    setErrors({});
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'We need a name for the door.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      next.email = 'A working email address, please.';
    }
    if (form.phone.trim() && form.phone.replace(/\D/g, '').length < 7) {
      next.phone = 'That number looks incomplete.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const confirm = () => {
    if (!date || !time || !validate()) return;
    setBusy(true);
    window.setTimeout(() => {
      const booking = addBooking({ slug: property.slug, date, time, party, ...form });
      setRef(booking.id);
      setBusy(false);
      setStep('done');
    }, 700);
  };

  return (
    <Panel
      open={open}
      onClose={close}
      eyebrow="Private Viewing"
      title={step === 'done' ? 'Confirmed' : 'Book a viewing'}
      footer={
        step === 'when' ? (
          <Solid onClick={() => setStep('who')} disabled={!date || !time}>
            {date && time ? `Continue · ${time}` : 'Choose a day and time'}
          </Solid>
        ) : step === 'who' ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep('when')}
              className="press focus-bare t-label text-stone-deep hover:text-ink shrink-0 px-2 py-4 transition-colors duration-200"
            >
              Back
            </button>
            <Solid onClick={confirm} busy={busy}>
              Confirm Viewing
            </Solid>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={reset}
              className="press focus-bare t-label text-stone-deep hover:text-ink shrink-0 px-2 py-4 transition-colors duration-200"
            >
              Book another
            </button>
            <Solid onClick={close}>Done</Solid>
          </div>
        )
      }
    >
      {/* The property this is against, always visible. */}
      <div className="border-ink/12 mb-7 flex items-center gap-4 border-b pb-6">
        <Figure image={property.cover} className="h-16 w-24 shrink-0" sizes="96px" quality={50} />
        <div className="min-w-0 flex-1">
          <p className="t-h3 truncate">{property.name}</p>
          <p className="t-label text-stone-deep mt-1.5">{property.locationLine}</p>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 'when' && (
          <motion.div
            key="when"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0.01 : 0.22, ease: EASE_UI }}
          >
            {ALL_PROPERTIES.length > 1 && (
              <div className="mb-7">
                <label htmlFor="bk-prop" className="t-label text-stone-deep mb-3 block">
                  Residence
                </label>
                <select
                  id="bk-prop"
                  className="field text-ink"
                  value={property.slug}
                  onChange={(e) => {
                    const next = ALL_PROPERTIES.find((p) => p.slug === e.target.value);
                    if (next) {
                      setProperty(next);
                      setDate(null);
                      setTime(null);
                    }
                  }}
                >
                  {ALL_PROPERTIES.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} — {p.locationLine}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Month */}
            <div className="mb-4 flex items-center justify-between">
              <p className="t-label">
                {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
                  }
                  disabled={!canGoBack}
                  aria-label="Previous month"
                  className="press focus-bare border-ink/18 hover:border-ink/50 flex h-9 w-9 items-center justify-center border transition-colors duration-200 disabled:pointer-events-none disabled:opacity-30"
                >
                  <svg width="14" height="8" viewBox="0 0 22 8" fill="none" className="rotate-180" aria-hidden="true">
                    <path d="M0 4h20M16.4 0.6 20 4l-3.6 3.4" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
                  }
                  disabled={cursor >= horizon}
                  aria-label="Next month"
                  className="press focus-bare border-ink/18 hover:border-ink/50 flex h-9 w-9 items-center justify-center border transition-colors duration-200 disabled:pointer-events-none disabled:opacity-30"
                >
                  <svg width="14" height="8" viewBox="0 0 22 8" fill="none" aria-hidden="true">
                    <path d="M0 4h20M16.4 0.6 20 4l-3.6 3.4" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5" role="grid" aria-label="Choose a day">
              {DAY_NAMES.map((d, i) => (
                <div key={i} className="t-label text-stone-deep pb-2 text-center">
                  {d}
                </div>
              ))}
              {grid.map((d, i) => {
                if (!d) return <div key={`p${i}`} />;
                const iso = isoDate(d);
                const past = d < today;
                const free = !past && hasAvailability(property.slug, d);
                const selected = iso === date;
                return (
                  <button
                    key={iso}
                    disabled={!free}
                    aria-pressed={selected}
                    aria-label={`${prettyDate(iso)}${free ? '' : ', no availability'}`}
                    onClick={() => {
                      setDate(iso);
                      setTime(null);
                    }}
                    className={cn(
                      'press focus-bare relative flex aspect-square items-center justify-center border text-center transition-colors duration-200',
                      !free && 'border-transparent text-stone/45 cursor-not-allowed',
                      free && !selected && 'border-ink/14 hover:border-ink/50',
                      selected && 'border-ink bg-ink text-paper',
                    )}
                  >
                    <span className="t-num text-[0.82rem]">{d.getDate()}</span>
                    {free && !selected && (
                      <span className="bg-bronze absolute bottom-1.5 h-1 w-1 rounded-full" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="t-label text-stone-deep mt-4">
              Marked days have time free. {SLOT_MINUTES} minutes with {agent.name.split(' ')[0]}.
            </p>

            {/* Times */}
            <AnimatePresence initial={false}>
              {date && (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: reduced ? 0.01 : 0.26, ease: EASE_UI }}
                  className="overflow-hidden"
                >
                  <div className="border-ink/12 mt-7 border-t pt-6">
                    <p className="t-label text-stone-deep mb-4">{prettyDate(date)}</p>
                    <div className="stagger grid grid-cols-3 gap-2">
                      {slots.map((s, i) => (
                        <div key={s.time} style={{ animationDelay: `${i * 40}ms` }}>
                          <Chip
                            active={time === s.time}
                            disabled={s.taken}
                            onClick={() => setTime(s.time)}
                          >
                            {s.time}
                          </Chip>
                        </div>
                      ))}
                    </div>
                    {slots.every((s) => s.taken) && (
                      <p className="t-body text-stone-deep mt-4 text-[0.9rem]">
                        Nothing left that day. Try the one either side of it.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {step === 'who' && (
          <motion.div
            key="who"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0.01 : 0.22, ease: EASE_UI }}
          >
            <div className="border-ink/12 mb-7 flex items-baseline justify-between gap-4 border-b pb-5">
              <div>
                <p className="t-label text-stone-deep mb-2">Your appointment</p>
                <p className="t-h3">{date && prettyDate(date)}</p>
              </div>
              <p className="font-display t-num text-2xl leading-none font-light">{time}</p>
            </div>

            <div className="grid gap-5">
              <Field
                label="Name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                error={errors.name}
                autoComplete="name"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                error={errors.email}
                autoComplete="email"
              />
              <Field
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                error={errors.phone}
                autoComplete="tel"
              />

              <div>
                <p className="t-label text-stone-deep mb-3">Attending</p>
                <div className="stagger grid grid-cols-4 gap-2">
                  {['1', '2', '3', '4+'].map((n, i) => (
                    <div key={n} style={{ animationDelay: `${i * 35}ms` }}>
                      <Chip active={party === n} onClick={() => setParty(n)}>
                        {n}
                      </Chip>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="t-body text-stone-deep mt-7 text-[0.88rem] leading-relaxed">
              {agent.name} will meet you at the gate. Bring identification — the owners
              ask for it, and we would rather tell you now than at the door.
            </p>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.28, ease: EASE_UI }}
          >
            <p className="t-quote max-w-[22ch]">
              You are booked, {form.name.split(' ')[0]}.
            </p>

            <dl className="border-ink/12 mt-8 border-t">
              {[
                ['Residence', property.name],
                ['Day', date ? prettyDate(date) : ''],
                ['Time', `${time} · ${SLOT_MINUTES} minutes`],
                ['Attending', party],
                ['Meeting', agent.name],
                ['Reference', ref ?? ''],
              ].map(([k, v]) => (
                <div key={k} className="border-ink/10 flex items-baseline justify-between gap-6 border-b py-3.5">
                  <dt className="t-label text-stone-deep">{k}</dt>
                  <dd className="t-label t-num text-right">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="t-body text-stone-deep mt-7 text-[0.9rem] leading-relaxed">
              A confirmation is on its way to {form.email}. If something changes, reply to
              it or call {agent.phone} — you will get {agent.name.split(' ')[0]}, not a desk.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = 'text',
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  const id = `bk-${label.toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="t-label text-stone-deep mb-2 block">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={cn('field text-ink', error && 'border-bronze')}
      />
      {error && <p className="t-label text-bronze mt-2">{error}</p>}
    </div>
  );
}
