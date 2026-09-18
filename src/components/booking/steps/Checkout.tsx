import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Field, TextArea, Select } from '@/components/ui/Field';
import { Button, Arrow } from '@/components/ui/Button';
import { Notice, Pill, IncludeList } from '@/components/ui/Bits';
import { useBooking } from '@/lib/booking';
import { CONTACT, BRAND } from '@/data/site';
import { PROPERTY_TYPES, getPackage, getAddon, getSizeTier } from '@shared/catalog.mjs';
import { formatDate, formatTime, TIMEZONE } from '@shared/schedule.mjs';
import { address, email as emailRule, formatPhone, phone as phoneRule, required, squareFeet } from '@/lib/validate';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

/* ============================================================================
   STEPS 6–9 — who, what it costs, paying, and done
   ========================================================================= */

/** Step 6. Validation runs on blur, not on every keystroke — nobody wants to
    be told their email is wrong while they are still halfway through typing it. */
export function StepDetails() {
  const { draft, setCustomer } = useBooking();
  const c = draft.customer;
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    name: touched.name ? required('Your name')(c.name) : null,
    email: touched.email ? emailRule(c.email) : null,
    phone: touched.phone ? phoneRule(c.phone) : null,
    address: touched.address ? address(c.address) : null,
    squareFeet: touched.squareFeet ? squareFeet(c.squareFeet) : null,
  };

  const touch = (key: string) => setTouched((t) => ({ ...t, [key]: true }));

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <h3 className="t-label">The property</h3>

        <Field
          label="Property address"
          value={c.address}
          onChange={(v) => setCustomer({ address: v })}
          onBlur={() => touch('address')}
          error={errors.address ?? undefined}
          placeholder="120 Main Street, Tupelo, MS 38801"
          autoComplete="street-address"
          required
          hint="Including the town, so the route and any travel charge are right."
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <Select
            label="Property type"
            value={c.propertyType}
            onChange={(v) => setCustomer({ propertyType: v })}
            options={PROPERTY_TYPES.map((t) => ({ value: t, label: t }))}
            placeholder="Choose a type"
          />
          <Field
            label="Square footage"
            value={c.squareFeet}
            onChange={(v) => setCustomer({ squareFeet: v })}
            onBlur={() => touch('squareFeet')}
            error={errors.squareFeet ?? undefined}
            placeholder="2,400"
            inputMode="numeric"
            hint="Approximate is fine."
          />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h3 className="t-label">You</h3>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Full name"
            value={c.name}
            onChange={(v) => setCustomer({ name: v })}
            onBlur={() => touch('name')}
            error={errors.name ?? undefined}
            autoComplete="name"
            required
          />
          <Field
            label="Phone"
            type="tel"
            inputMode="tel"
            value={c.phone}
            onChange={(v) => setCustomer({ phone: formatPhone(v) })}
            onBlur={() => touch('phone')}
            error={errors.phone ?? undefined}
            placeholder="(662) 555-0143"
            autoComplete="tel"
            required
          />
        </div>

        <Field
          label="Email"
          type="email"
          inputMode="email"
          value={c.email}
          onChange={(v) => setCustomer({ email: v })}
          onBlur={() => touch('email')}
          error={errors.email ?? undefined}
          placeholder="you@brokerage.com"
          autoComplete="email"
          required
          hint="Your confirmation, prep note and gallery link all go here."
        />

        <TextArea
          label="Anything I should know"
          value={c.notes}
          onChange={(v) => setCustomer({ notes: v })}
          rows={4}
          placeholder="Lockbox code, gate entry, a dog in the back, rooms to prioritise, listing deadline…"
          hint="Optional, but the answer to 'how do I get in' saves a phone call."
        />
      </section>
    </div>
  );
}

/** Step 7. Everything, itemised, with a way back to change each part of it. */
export function StepReview() {
  const { draft, pricing, goTo } = useBooking();
  const pkg = draft.packageId ? getPackage(draft.packageId) : null;
  const tier = getSizeTier(draft.sizeTierId);

  if (!pkg || !pricing?.ok || !draft.date || !draft.time) {
    return <p className="text-muted">Something is missing. Step back and check each part.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="glass edge flex flex-col divide-y divide-line">
        <ReviewRow label="Package" onEdit={() => goTo('package')}>
          <p className="text-[15px] text-bright">{pkg.name}</p>
          <p className="text-[13px] text-muted">{pkg.tagline}</p>
          <div className="mt-3">
            <IncludeList items={pkg.includes.slice(0, 4)} />
            {pkg.includes.length > 4 && (
              <p className="mt-2 text-[12.5px] text-faint">
                + {pkg.includes.length - 4} more
              </p>
            )}
          </div>
        </ReviewRow>

        <ReviewRow label="Add-ons" onEdit={() => goTo('extras')}>
          {draft.addonIds.length === 0 ? (
            <p className="text-[13.5px] text-muted">None selected.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {draft.addonIds.map((id) => {
                const a = getAddon(id);
                return a ? <Pill key={id} tone="neon">{a.name}</Pill> : null;
              })}
            </ul>
          )}
          <p className="mt-3 text-[13px] text-muted">
            Property size: <span className="text-body">{tier.label}</span>
            {draft.miles > 0 && (
              <>
                {' · '}Travel: <span className="text-body">{draft.miles} miles</span>
              </>
            )}
          </p>
        </ReviewRow>

        <ReviewRow label="When" onEdit={() => goTo('date')}>
          <p className="text-[15px] text-bright">{formatDate(draft.date)}</p>
          <p className="font-mono text-[13px] text-muted">
            {formatTime(draft.time)}
            <span className="text-faint">
              {' '}
              · about {Math.floor(pricing.minutes / 60)}h
              {pricing.minutes % 60 ? ` ${pricing.minutes % 60}m` : ''} on site · {TIMEZONE.split('/')[1].replace('_', ' ')} time
            </span>
          </p>
        </ReviewRow>

        <ReviewRow label="Where and who" onEdit={() => goTo('details')}>
          <p className="text-[14px] text-bright">{draft.customer.address}</p>
          <p className="mt-1 text-[13px] text-muted">
            {draft.customer.name} · {draft.customer.phone}
          </p>
          <p className="text-[13px] break-all text-muted">{draft.customer.email}</p>
          {draft.customer.notes && (
            <p className="mt-3 border-l-2 border-line pl-3 text-[13px] leading-relaxed text-muted">
              {draft.customer.notes}
            </p>
          )}
        </ReviewRow>
      </div>

      <Notice title="What happens next">
        Nothing is charged here. {BRAND.name} reads the request, checks the slot is
        still free, and comes back with a price for this property — every one is
        different, so every one is quoted on its own. Nothing is confirmed until
        you have that quote and say yes.
      </Notice>
    </div>
  );
}

function ReviewRow({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:gap-8 sm:p-6">
      <div className="flex shrink-0 items-start justify-between gap-4 sm:w-36 sm:flex-col">
        <p className="t-label">{label}</p>
        <button
          type="button"
          onClick={onEdit}
          className="link-rule font-mono text-[10.5px] tracking-[0.14em] text-neon-soft uppercase"
        >
          Change
        </button>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** Step 8. */
export function StepSend() {
  const { submit, submitting, submitError, live, draft } = useBooking();
  const reduced = usePrefersReducedMotion();

  return (
    <div className="flex flex-col gap-7">
      <div className="glass edge flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <p className="t-label">One more press</p>
          <p className="font-display text-[clamp(1.5rem,3.4vw,2rem)] leading-tight text-bright">
            Send this to {BRAND.name}
          </p>
          <p className="text-[14px] leading-relaxed text-muted">
            No card, no deposit, nothing to pay. You get a written price for this
            property and the slot is held while you decide.
          </p>
        </div>

        <div className="h-px w-full bg-line" aria-hidden="true" />

        <ul className="flex flex-col gap-2.5 text-[13px] text-muted">
          <li className="flex gap-3">
            <Dot /> Every property is priced on what it actually needs, not a list.
          </li>
          <li className="flex gap-3">
            <Dot /> The slot is re-checked as this is sent, so it cannot be taken twice.
          </li>
          <li className="flex gap-3">
            <Dot /> You get a reply {CONTACT.responseTime}.
          </li>
          <li className="flex gap-3">
            <Dot /> Weather reschedules are free, always.
          </li>
        </ul>

        {!live && (
          <Notice tone="warn" title="Demonstration mode — this request will not be sent">
            This site is not yet connected to a server, so pressing the button below
            will <span className="text-bright">not</span> send anything and will{' '}
            <span className="text-bright">not</span> reserve a real appointment. It
            walks through the confirmation so the flow can be seen end to end. Call{' '}
            <a href={`tel:${CONTACT.phoneHref}`} className="link-rule font-mono">
              {CONTACT.phone}
            </a>{' '}
            to book for real in the meantime.
          </Notice>
        )}

        {submitError && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
          >
            <Notice tone="warn" title="That did not go through">
              {submitError}
            </Notice>
          </motion.div>
        )}

        <Button
          onClick={submit}
          disabled={submitting}
          size="lg"
          full
          className="group"
          trailing={submitting ? undefined : <Arrow />}
        >
          {submitting ? (
            <span className="flex items-center gap-3">
              <Spinner />
              Sending…
            </span>
          ) : (
            'Send my request'
          )}
        </Button>

        <p className="text-center text-[12px] text-faint">
          By sending you agree to the{' '}
          <Link to="/terms" className="link-rule">
            terms
          </Link>
          . Questions first?{' '}
          <a href={`tel:${CONTACT.phoneHref}`} className="link-rule font-mono">
            {CONTACT.phone}
          </a>
        </p>
      </div>

      <p className="text-[12.5px] text-faint">
        Request for {draft.customer.name || 'you'} at{' '}
        {draft.date ? formatDate(draft.date) : 'a date not yet chosen'}
        {draft.time ? `, ${formatTime(draft.time)}` : ''}.
      </p>
    </div>
  );
}

/** Step 9. */
export function StepConfirmed() {
  const { confirmation, confirmationStatus, reset, live } = useBooking();
  const reduced = usePrefersReducedMotion();

  /* Reading a booking back after Stripe returns the customer. Showing a
     spinner beats showing "no booking found" to somebody whose card has just
     been charged and whose request is still in flight. */
  if (confirmationStatus === 'loading' && !confirmation) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Spinner />
        <p className="text-muted">Looking up your booking…</p>
      </div>
    );
  }

  if (confirmationStatus === 'missing' || !confirmation) {
    return (
      <div className="flex flex-col gap-6">
        <Notice tone="warn" title="We could not find that request">
          The reference in the link did not match anything. Nothing was charged —
          nothing is charged anywhere on this site — so there is nothing to undo.
          Call{' '}
          <a href={`tel:${CONTACT.phoneHref}`} className="link-rule font-mono">
            {CONTACT.phone}
          </a>{' '}
          with that reference and it will be sorted in a minute.
        </Notice>
        <div className="flex flex-wrap gap-3">
          <Button onClick={reset} variant="ghost">
            Start a new booking
          </Button>
          <Button to="/contact" variant="quiet">
            Contact us
          </Button>
        </div>
      </div>
    );
  }

  const b = confirmation;
  // Paid is the server's word. Pending means Stripe has not confirmed yet,
  // which is normal for a few seconds and must not be dressed up as done.
  const settled = b.paid;
  const pending = !settled && b.status === 'pending' && live;

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="flex flex-col items-center gap-5 py-4 text-center"
      >
        <span
          className={`relative grid h-20 w-20 place-items-center rounded-full border ${
            settled ? 'border-good/50 bg-good/10' : 'border-amber/50 bg-amber/10'
          }`}
          style={{
            boxShadow: settled
              ? '0 0 60px -14px rgb(52 211 153 / 0.8)'
              : '0 0 60px -14px rgb(255 184 97 / 0.7)',
          }}
        >
          <svg width="30" height="23" viewBox="0 0 30 23" fill="none" aria-hidden="true">
            <motion.path
              d="M2 11.5L11 20.5L28 2.5"
              stroke={settled ? 'rgb(52 211 153)' : 'rgb(255 184 97)'}
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.15 }}
            />
          </svg>
        </span>

        <div className="flex flex-col gap-2">
          <h3 className="t-h2">
            {settled
              ? b.firstName
                ? `You’re booked, ${b.firstName}.`
                : 'You’re booked.'
              : pending
                ? 'Payment is being confirmed.'
                : 'Booking recorded.'}
          </h3>
          <p className="t-lead max-w-[46ch] text-muted">
            {settled
              ? `A confirmation is on its way${b.email ? ` to ${b.email}` : ''}, with a prep note for the property.`
              : pending
                ? 'Your slot is held. This page updates as soon as the payment clears — it usually takes a few seconds. You will get a receipt either way.'
                : 'This run was a demonstration — no payment was taken and no appointment was reserved.'}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-line px-5 py-2.5">
          <span className="t-label">Reference</span>
          <span className="font-mono text-[15px] tracking-[0.14em] text-bright">
            {b.reference}
          </span>
        </div>
      </motion.div>

      <div className="glass edge flex flex-col divide-y divide-line">
        <Line label="Package" value={b.packageName} />
        {b.date && <Line label="Date" value={formatDate(b.date)} />}
        {b.time && <Line label="Time" value={formatTime(b.time)} />}
        {b.address && <Line label="Property" value={b.address} />}
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="t-label">What happens next</h4>
        <ol className="flex flex-col gap-2.5 text-[13.5px] text-muted">
          <li className="flex gap-3">
            <span className="font-mono text-neon">01</span>
            <span>
              A prep note arrives by email — twenty minutes of work that changes every
              photograph in the set.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-neon">02</span>
            <span>You get a reminder the day before, with a rough arrival window.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-neon">03</span>
            <span>
              Photography is delivered the next business day; film within 72 hours.
            </span>
          </li>
        </ol>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button to="/portfolio" variant="ghost">
          See the work
        </Button>
        <Button onClick={reset} variant="quiet">
          Book another property
        </Button>
      </div>

      <p className="text-[12.5px] text-faint">
        Need to change something? Call{' '}
        <a href={`tel:${CONTACT.phoneHref}`} className="link-rule font-mono">
          {CONTACT.phone}
        </a>{' '}
        with reference {b.reference}. Rescheduling is free up to 24 hours before.
      </p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 p-4 sm:px-6">
      <span className="t-label">{label}</span>
      <span className="text-right text-[14px] text-bright">{value}</span>
    </div>
  );
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-neon"
    />
  );
}


function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.6" opacity="0.25" />
      <path d="M8 1.5A6.5 6.5 0 0114.5 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 8 8"
          to="360 8 8"
          dur="0.7s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
