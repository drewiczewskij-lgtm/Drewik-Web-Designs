import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Field, TextArea, Select } from '@/components/ui/Field';
import { Button, Arrow } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Bits';
import { BRAND, CONTACT } from '@/data/site';
import { FORM_ENDPOINT, formsAreLive } from '@/config/integrations';
import { openMail } from '@/lib/mailto';
import { sendEnquiry } from '@/lib/api';
import { email as emailRule, formatPhone, phone as phoneRule, minLength, required, validate } from '@/lib/validate';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

/* ============================================================================
   ENQUIRY FORM
   ----------------------------------------------------------------------------
   Used by the contact page and the commercial quote page, with a different
   set of fields each time.

   The honest bit: with no endpoint configured the form validates, composes and
   confirms — and then says plainly that the message was not transmitted, and
   hands over a phone number and an email address. A form that silently eats an
   enquiry is worse than no form at all, because the person believes they have
   made contact.
   ========================================================================= */

export interface EnquiryField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  options?: string[];
  placeholder?: string;
  hint?: string;
  required?: boolean;
  half?: boolean;
  rows?: number;
}

export function EnquiryForm({
  fields,
  subject,
  submitLabel = 'Send enquiry',
  successTitle = 'Message ready to send',
  successBody,
}: {
  fields: EnquiryField[];
  /** Included in the payload so you can tell the two forms apart in the inbox. */
  subject: string;
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, ''])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [transportError, setTransportError] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();

  const set = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const rules = Object.fromEntries(
    fields
      .filter((f) => f.required)
      .map((f) => {
        if (f.type === 'email') return [f.name, emailRule];
        if (f.type === 'tel') return [f.name, phoneRule];
        if (f.type === 'textarea') return [f.name, minLength(12, f.label)];
        return [f.name, required(f.label)];
      }),
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values, rules);
    const clean = Object.fromEntries(
      Object.entries(found).filter(([, v]) => Boolean(v)),
    ) as Record<string, string>;

    setErrors(clean);
    if (Object.keys(clean).length > 0) {
      // Put focus on the first thing that is wrong, rather than leaving the
      // reader to hunt for the red text.
      const firstBad = fields.find((f) => clean[f.name]);
      if (firstBad) {
        document
          .querySelector<HTMLElement>(`[data-field="${firstBad.name}"] input, [data-field="${firstBad.name}"] textarea, [data-field="${firstBad.name}"] select`)
          ?.focus();
      }
      return;
    }

    setState('sending');
    setTransportError(null);

    if (!formsAreLive()) {
      /* No form service: hand it to the visitor's own mail client, already
         written and addressed. They press send and it is an ordinary email,
         so the reply reaches them in the usual place. */
      const body = Object.entries(values)
        .filter(([, v]) => String(v ?? '').trim())
        .map(([k, v]) => `${k[0].toUpperCase()}${k.slice(1)}: ${v}`)
        .join('\n');
      openMail(subject, `${body}\n`);
      window.setTimeout(() => setState('sent'), 400);
      return;
    }

    const result = await sendEnquiry(FORM_ENDPOINT, { ...values, _subject: subject });
    if (result.ok) {
      setState('sent');
    } else {
      setState('error');
      setTransportError(result.error ?? 'The message could not be sent.');
    }
  };

  if (state === 'sent') {
    return (
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
        className="glass edge flex flex-col items-start gap-5 p-8"
      >
        <span
          className="grid h-14 w-14 place-items-center rounded-full border border-good/50 bg-good/10"
          style={{ boxShadow: '0 0 44px -12px rgb(52 211 153 / 0.8)' }}
          aria-hidden="true"
        >
          <svg width="22" height="17" viewBox="0 0 30 23" fill="none">
            <motion.path
              d="M2 11.5L11 20.5L28 2.5"
              stroke="rgb(52 211 153)"
              strokeWidth="2.6"
              strokeLinecap="round"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.1 }}
            />
          </svg>
        </span>

        <div className="flex flex-col gap-2">
          <h3 className="t-h3">{formsAreLive() ? 'Message sent' : successTitle}</h3>
          <p className="max-w-[52ch] text-[14px] leading-relaxed text-muted">
            {formsAreLive()
              ? (successBody ?? `Thank you. You will hear back ${CONTACT.responseTime}.`)
              : `Your email app should have opened with this message ready to send to ${BRAND.name}. Press send there and it is on its way — you will hear back ${CONTACT.responseTime}.`}
          </p>
        </div>

        {!formsAreLive() && (
          <Notice title="If your email app did not open">
            <p className="flex flex-col gap-1">
              <a href={`tel:${CONTACT.phoneHref}`} className="link-rule w-fit font-mono">
                {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="link-rule w-fit break-all">
                {CONTACT.email}
              </a>
            </p>
          </Notice>
        )}

        <Button
          variant="ghost"
          onClick={() => {
            setValues(Object.fromEntries(fields.map((f) => [f.name, ''])));
            setState('idle');
          }}
        >
          Write another
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-7">
      <div className="grid gap-7 sm:grid-cols-2">
        {fields.map((f) => {
          const span = f.half ? 'sm:col-span-1' : 'sm:col-span-2';
          const common = {
            label: f.label,
            value: values[f.name] ?? '',
            error: errors[f.name] || undefined,
            hint: f.hint,
            required: f.required,
            placeholder: f.placeholder,
          };

          return (
            <div key={f.name} data-field={f.name} className={span}>
              {f.type === 'textarea' ? (
                <TextArea
                  {...common}
                  rows={f.rows ?? 5}
                  onChange={(v) => set(f.name, v)}
                />
              ) : f.type === 'select' ? (
                <Select
                  {...common}
                  options={(f.options ?? []).map((o) => ({ value: o, label: o }))}
                  onChange={(v) => set(f.name, v)}
                />
              ) : (
                <Field
                  {...common}
                  type={f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : 'text'}
                  inputMode={f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : undefined}
                  autoComplete={
                    f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : undefined
                  }
                  onChange={(v) => set(f.name, f.type === 'tel' ? formatPhone(v) : v)}
                />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {state === 'error' && transportError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24 }}
          >
            <Notice tone="warn" title="Could not send">
              {transportError} Please call{' '}
              <a href={`tel:${CONTACT.phoneHref}`} className="link-rule font-mono">
                {CONTACT.phone}
              </a>{' '}
              instead.
            </Notice>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-5">
        <Button type="submit" size="lg" disabled={state === 'sending'} className="group" trailing={<Arrow />}>
          {state === 'sending' ? 'Sending…' : submitLabel}
        </Button>
        <p className="text-[12.5px] text-faint">
          Replies {CONTACT.responseTime}. Nothing is shared with anyone.
        </p>
      </div>
    </form>
  );
}
