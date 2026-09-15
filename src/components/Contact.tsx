import { motion, AnimatePresence } from 'motion/react';
import { useId, useState, type FormEvent } from 'react';
import { BRAND } from '@/data/site';
import { PROPERTIES } from '@/data/properties';
import { cn } from '@/lib/cn';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { Arrow, Magnetic } from './Cta';
import { Label, MaskedLines } from './Type';

/* ==========================================================================
   CONTACT
   Dark, quiet, and short. Underlined fields rather than boxes; one heading
   that does the persuading so the form does not have to.
   ======================================================================== */

type Fields = {
  name: string;
  email: string;
  phone: string;
  property: string;
  message: string;
};

const EMPTY: Fields = { name: '', email: '', phone: '', property: '', message: '' };

export function Contact({
  defaultProperty,
  index = '08',
}: {
  defaultProperty?: string;
  index?: string;
}) {
  const [values, setValues] = useState<Fields>({
    ...EMPTY,
    property: defaultProperty ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const reduced = usePrefersReducedMotion();

  const set = (key: keyof Fields) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (values.name.trim().length < 2) next.name = 'Please give us a name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
      next.email = 'A working email address, please.';
    }
    if (values.phone.trim() && values.phone.replace(/\D/g, '').length < 7) {
      next.phone = 'That number looks incomplete.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (state === 'sending') return;
    if (!validate()) return;
    setState('sending');
    // Demonstration only — no request leaves the browser. Point this at your CRM.
    window.setTimeout(() => setState('sent'), 850);
  };

  return (
    <section
      id="contact"
      data-nav-theme="light"
      className="bg-charcoal text-paper on-dark relative z-10"
      aria-labelledby="contact-title"
    >
      <div className="shell pt-[max(4.5rem,12vh)] pb-[max(3.5rem,9vh)]">
        <div className="border-paper/18 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
          <Label index={index} className="text-paper">
            Enquiries
          </Label>
          <span className="t-label text-paper/45">Replies within one business day</span>
        </div>

        <div className="mt-14 md:mt-24">
          <MaskedLines
            as="h2"
            id="contact-title"
            className="t-h1 max-w-[26ch]"
            lines={['Your next address', 'deserves a conversation.']}
          />
        </div>

        <div className="grid-editorial mt-16 items-start md:mt-24">
          {/* Left rail — the human alternative to the form. */}
          <div className="col-span-12 lg:col-span-3">
            <div className="border-paper/18 border-t pt-5">
              <span className="t-label text-paper/45 mb-4 block">Direct</span>
              <a href={`mailto:${BRAND.email}`} className="link-rule t-lead block">
                {BRAND.email}
              </a>
              <a href={BRAND.phoneHref} className="link-rule t-lead mt-4 block">
                {BRAND.phone}
              </a>
            </div>

            <div className="border-paper/18 mt-10 border-t pt-5">
              <span className="t-label text-paper/45 mb-4 block">Offices</span>
              {BRAND.offices.map((o) => (
                <div key={o.city} className="mb-4">
                  <p className="t-label">{o.city}</p>
                  <p className="t-body text-paper/55 text-[0.9rem]">{o.line}</p>
                </div>
              ))}
            </div>
          </div>

          {/* The form */}
          <div className="col-span-12 mt-12 lg:col-span-8 lg:col-start-5 lg:mt-0">
            <AnimatePresence mode="wait">
              {state === 'sent' ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0.01 : 0.8, ease: EASE_OUT_EXPO }}
                  className="border-paper/18 border-t pt-10"
                  role="status"
                >
                  <p className="t-label text-bronze-soft mb-6">Received</p>
                  <p className="t-quote max-w-[24ch]">
                    Thank you, {values.name.split(' ')[0] || 'and welcome'}.
                  </p>
                  <p className="t-body text-paper/70 mt-6 max-w-[46ch]">
                    One of us will write to you at{' '}
                    <span className="text-paper">{values.email}</span> within one business
                    day to arrange a time. If it is urgent, call {BRAND.phone} and ask for
                    the principal on duty.
                  </p>
                  <button
                    onClick={() => {
                      setValues({ ...EMPTY, property: defaultProperty ?? '' });
                      setState('idle');
                    }}
                    className="link-rule focus-bare t-label text-paper/60 mt-10"
                  >
                    Send another enquiry
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  noValidate
                  initial={false}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  aria-label="Schedule a private viewing"
                >
                  <p className="t-label text-paper/45 border-paper/18 border-t pt-5">
                    Schedule a Private Viewing
                  </p>

                  <div className="mt-8 grid gap-x-10 gap-y-2 sm:grid-cols-2">
                    <Field
                      label="Name"
                      value={values.name}
                      onChange={set('name')}
                      error={errors.name}
                      autoComplete="name"
                      required
                    />
                    <Field
                      label="Email"
                      type="email"
                      value={values.email}
                      onChange={set('email')}
                      error={errors.email}
                      autoComplete="email"
                      required
                    />
                    <Field
                      label="Phone"
                      type="tel"
                      value={values.phone}
                      onChange={set('phone')}
                      error={errors.phone}
                      autoComplete="tel"
                    />
                    <SelectField
                      label="Property"
                      value={values.property}
                      onChange={set('property')}
                    />
                  </div>

                  <div className="mt-2">
                    <Field
                      label="Message"
                      value={values.message}
                      onChange={set('message')}
                      multiline
                      placeholder="Timing, requirements, anything we should know."
                    />
                  </div>

                  <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
                    <Magnetic strength={0.24}>
                      <button
                        type="submit"
                        disabled={state === 'sending'}
                        data-cursor=""
                        className={cn(
                          'group/submit focus-bare border-paper/35 relative inline-flex items-center gap-5 overflow-hidden border px-8 py-5 transition-colors duration-500',
                          state === 'sending' && 'pointer-events-none opacity-60',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className="bg-paper absolute inset-0 origin-bottom scale-y-0 transition-transform duration-[700ms] ease-[cubic-bezier(.76,0,.24,1)] group-hover/submit:scale-y-100 group-focus-visible/submit:scale-y-100"
                        />
                        <span className="t-label group-hover/submit:text-charcoal group-focus-visible/submit:text-charcoal relative transition-colors duration-500">
                          {state === 'sending' ? 'Sending' : 'Request Private Viewing'}
                        </span>
                        <span className="group-hover/submit:text-charcoal group-focus-visible/submit:text-charcoal relative transition-colors duration-500">
                          <Arrow />
                        </span>
                      </button>
                    </Magnetic>

                    <p className="text-paper/40 max-w-[34ch] text-[0.85rem] leading-relaxed font-light">
                      Your details stay with Arcadia. We never share them, and we never
                      sell them.
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Field({
  label,
  value,
  onChange,
  error,
  type = 'text',
  multiline = false,
  required = false,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  multiline?: boolean;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const shared = cn(
    'field-line text-paper placeholder:text-paper/25 w-full border-b bg-transparent py-4 text-[1.05rem] font-light transition-colors duration-500',
    error ? 'border-bronze-soft' : 'border-paper/22 focus:border-paper',
  );

  return (
    <div className="relative pb-6">
      <label htmlFor={id} className="t-label text-paper/45 block">
        {label}
        {required && (
          <span className="text-bronze-soft ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(shared, 'resize-none')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className={shared}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
      )}
      {error && (
        <p id={errorId} className="t-label text-bronze-soft absolute bottom-0 left-0">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div className="relative pb-6">
      <label htmlFor={id} className="t-label text-paper/45 block">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="field-line text-paper border-paper/22 focus:border-paper w-full appearance-none border-b bg-transparent py-4 pr-8 text-[1.05rem] font-light transition-colors duration-500"
        >
          <option value="" className="bg-charcoal">
            No particular property
          </option>
          {PROPERTIES.map((p) => (
            <option key={p.slug} value={p.name} className="bg-charcoal">
              {p.name} — {p.locationLine}
            </option>
          ))}
          <option value="Private portfolio" className="bg-charcoal">
            The private portfolio
          </option>
        </select>
        <span
          aria-hidden="true"
          className="text-paper/45 pointer-events-none absolute top-1/2 right-0 -translate-y-1/2"
        >
          <svg width="11" height="7" viewBox="0 0 11 7" fill="none">
            <path d="M1 1l4.5 4.5L10 1" stroke="currentColor" strokeWidth="1" />
          </svg>
        </span>
      </div>
    </div>
  );
}
