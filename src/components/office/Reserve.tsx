import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { agentFor, depositFor, money, useOffice } from '@/lib/office';
import { checkoutUrl, paymentIsLive } from '@/config/integrations';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { Figure } from '../Figure';
import { Panel, Solid } from './Panel';

/* ==========================================================================
   RESERVATION DEPOSIT
   ---------------------------------------------------------------------------
   One per cent of the guide, refundable for fourteen days, which takes the
   property off the open market while a solicitor reads the pack.

   NOTHING HERE IS LIVE. No request leaves the browser, no card is charged,
   and no entered value is stored or transmitted. The panel says so on screen,
   because a convincing payment form that does not say so is a trap. To make it
   real, replace `settle()` with a call to a payment processor's client SDK and
   never let a card number reach your own server.
   ======================================================================== */

const EASE_UI = [0.23, 1, 0.32, 1] as const;

type Brand = 'visa' | 'mastercard' | 'amex' | 'card';

function brandOf(digits: string): Brand {
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'card';
}

const BRAND_LABEL: Record<Brand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  card: 'Card',
};

function groupCard(digits: string, brand: Brand): string {
  const groups = brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4];
  const out: string[] = [];
  let i = 0;
  for (const g of groups) {
    if (i >= digits.length) break;
    out.push(digits.slice(i, i + g));
    i += g;
  }
  return out.join(' ');
}

/** Luhn. Catches a mistyped digit before it reaches anyone's gateway. */
function luhn(digits: string): boolean {
  if (digits.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function Reserve() {
  const { desk, close, property, addReservation } = useOffice();
  const reduced = usePrefersReducedMotion();
  const open = desk === 'reserve';
  const agent = agentFor(property);
  const deposit = depositFor(property);
  // With a payment link configured, no card field is ever rendered here: the
  // buyer goes to the provider's own hosted checkout instead.
  const live = paymentIsLive(property.slug);
  const [email, setEmail] = useState('');

  const [card, setCard] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [zip, setZip] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<{ id: string; last4: string } | null>(null);

  const digits = card.replace(/\D/g, '');
  const brand = brandOf(digits);
  const cvcLen = brand === 'amex' ? 4 : 3;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!luhn(digits)) next.card = 'That card number does not check out.';
    const m = exp.match(/^(\d{2})\s*\/\s*(\d{2})$/);
    if (!m) next.exp = 'Use MM / YY.';
    else {
      const month = Number(m[1]);
      const year = 2000 + Number(m[2]);
      const end = new Date(year, month, 0, 23, 59, 59);
      if (month < 1 || month > 12) next.exp = 'That month does not exist.';
      else if (end < new Date()) next.exp = 'That card has expired.';
    }
    if (cvc.length !== cvcLen) next.cvc = `${cvcLen} digits.`;
    if (name.trim().length < 2) next.name = 'The name on the card.';
    if (zip.trim().length < 3) next.zip = 'Billing postal code.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const settle = () => {
    if (!validate()) return;
    setBusy(true);
    // Stands in for the processor's client SDK. Nothing is sent.
    window.setTimeout(() => {
      const r = addReservation({ slug: property.slug, amount: deposit, last4: digits.slice(-4) });
      setReceipt({ id: r.id, last4: digits.slice(-4) });
      setBusy(false);
    }, 1100);
  };

  const reset = () => {
    setReceipt(null);
    setCard('');
    setExp('');
    setCvc('');
    setName('');
    setZip('');
    setErrors({});
  };

  if (live) {
    const href = checkoutUrl(property.slug, email.trim() || undefined);
    return (
      <Panel
        open={open}
        onClose={close}
        eyebrow="Reservation"
        title="Reserve this residence"
        footer={
          <>
            <a
              href={href ?? '#'}
              className="press focus-bare bg-ink text-paper flex w-full items-center justify-center gap-3 px-7 py-4"
            >
              <span className="t-label">Continue to secure checkout</span>
              <svg width="18" height="8" viewBox="0 0 22 8" fill="none" aria-hidden="true">
                <path d="M0 4h20M16.4 0.6 20 4l-3.6 3.4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </a>
            <p className="text-stone-deep mt-3 text-center text-[0.78rem] leading-relaxed">
              Payment is taken by Stripe. Your card details never reach this site.
            </p>
          </>
        }
      >
        <div className="border-ink/12 mb-7 flex items-center gap-4 border-b pb-6">
          <Figure image={property.cover} className="h-16 w-24 shrink-0" sizes="96px" quality={50} />
          <div className="min-w-0 flex-1">
            <p className="t-h3 truncate">{property.name}</p>
            <p className="t-label text-stone-deep mt-1.5">{property.locationLine}</p>
          </div>
        </div>

        <dl className="border-ink/12 mb-8 border-b pb-5">
          <Row k="Guide price" v={property.priceDisplay} />
          <Row k="Reservation deposit" v={`1% · ${money(deposit)}`} />
          <Row k="Exclusivity" v="14 days" />
          <Row k="Refundable" v="In full, within 14 days" />
          <div className="border-ink/14 mt-3 flex items-baseline justify-between gap-6 border-t pt-4">
            <dt className="t-label">Due now</dt>
            <dd className="font-display t-num text-2xl leading-none font-light">
              {money(deposit)}
            </dd>
          </div>
        </dl>

        <label htmlFor="rs-email" className="t-label text-stone-deep mb-2 block">
          Email for the receipt
        </label>
        <input
          id="rs-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field text-ink"
        />

        <p className="t-body text-stone-deep mt-7 text-[0.88rem] leading-relaxed">
          You will be handed to Stripe to pay. {agent.name} is notified the moment
          it clears, and the pack goes to your solicitor the same day.
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      open={open}
      onClose={close}
      eyebrow="Reservation"
      title={receipt ? 'Deposit received' : 'Reserve this residence'}
      footer={
        receipt ? (
          <div className="flex items-center gap-4">
            <button
              onClick={reset}
              className="press focus-bare t-label text-stone-deep hover:text-ink shrink-0 px-2 py-4 transition-colors duration-200"
            >
              New reservation
            </button>
            <Solid onClick={close}>Done</Solid>
          </div>
        ) : (
          <>
            <Solid onClick={settle} busy={busy}>
              {busy ? 'Authorising' : `Pay ${money(deposit)} deposit`}
            </Solid>
            {/* The disclosure stays beside the action, not only at the top of a
                panel the reader has already scrolled past. */}
            <p className="text-stone-deep mt-3 text-center text-[0.78rem] leading-relaxed">
              <span className="t-label text-bronze mr-1.5">Demonstration</span>
              No payment is taken and no card is charged.
            </p>
          </>
        )
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {receipt ? (
          <motion.div
            key="receipt"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.28, ease: EASE_UI }}
          >
            <p className="t-quote max-w-[24ch]">{property.name} is held for you.</p>
            <dl className="border-ink/12 mt-8 border-t">
              {[
                ['Residence', property.name],
                ['Deposit', money(deposit)],
                ['Paid with', `${BRAND_LABEL[brand]} ···· ${receipt.last4}`],
                ['Held until', new Date(Date.now() + 14 * 864e5).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })],
                ['Reference', receipt.id],
              ].map(([k, v]) => (
                <div key={k} className="border-ink/10 flex items-baseline justify-between gap-6 border-b py-3.5">
                  <dt className="t-label text-stone-deep">{k}</dt>
                  <dd className="t-label t-num text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="t-body text-stone-deep mt-7 text-[0.9rem] leading-relaxed">
              {agent.name} has the pack ready — title, survey, and the geotechnical study.
              It will reach your solicitor today. Withdraw any time in the next fourteen
              days and the deposit returns in full, no questions asked.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0.01 : 0.22, ease: EASE_UI }}
          >
            {/* Said plainly, at the top, before anything is typed. */}
            <p className="border-bronze/45 bg-bronze/8 text-ink/75 mb-7 border-l-2 py-3 pr-3 pl-4 text-[0.85rem] leading-relaxed">
              <span className="t-label text-bronze mr-2">Demonstration</span>
              Arcadia Estates is a fictional brokerage. No payment is taken, nothing you
              type is sent anywhere, and no card is charged. Do not enter a real card.
            </p>

            <div className="border-ink/12 mb-7 flex items-center gap-4 border-b pb-6">
              <Figure image={property.cover} className="h-16 w-24 shrink-0" sizes="96px" quality={50} />
              <div className="min-w-0 flex-1">
                <p className="t-h3 truncate">{property.name}</p>
                <p className="t-label text-stone-deep mt-1.5">{property.locationLine}</p>
              </div>
            </div>

            <dl className="border-ink/12 mb-8 border-b pb-5">
              <Row k="Guide price" v={property.priceDisplay} />
              <Row k="Reservation deposit" v={`1% · ${money(deposit)}`} />
              <Row k="Exclusivity" v="14 days" />
              <Row k="Refundable" v="In full, within 14 days" />
              <div className="border-ink/14 mt-3 flex items-baseline justify-between gap-6 border-t pt-4">
                <dt className="t-label">Due now</dt>
                <dd className="font-display t-num text-2xl leading-none font-light">
                  {money(deposit)}
                </dd>
              </div>
            </dl>

            <div className="grid gap-5">
              <div>
                <label htmlFor="rs-card" className="t-label text-stone-deep mb-2 flex items-center justify-between">
                  <span>Card number</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={brand}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-ink"
                    >
                      {digits.length > 1 ? BRAND_LABEL[brand] : ''}
                    </motion.span>
                  </AnimatePresence>
                </label>
                <input
                  id="rs-card"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="4242 4242 4242 4242"
                  value={card}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, '').slice(0, brandOf(e.target.value.replace(/\D/g, '')) === 'amex' ? 15 : 16);
                    setCard(groupCard(d, brandOf(d)));
                    setErrors((x) => ({ ...x, card: '' }));
                  }}
                  aria-invalid={Boolean(errors.card)}
                  className={cn('field t-num text-ink', errors.card && 'border-bronze')}
                />
                {errors.card && <p className="t-label text-bronze mt-2">{errors.card}</p>}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Small
                  id="rs-exp"
                  label="Expiry"
                  placeholder="MM / YY"
                  value={exp}
                  error={errors.exp}
                  onChange={(v) => {
                    const d = v.replace(/\D/g, '').slice(0, 4);
                    setExp(d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d);
                    setErrors((x) => ({ ...x, exp: '' }));
                  }}
                />
                <Small
                  id="rs-cvc"
                  label="Security code"
                  placeholder={cvcLen === 4 ? '1234' : '123'}
                  value={cvc}
                  error={errors.cvc}
                  onChange={(v) => {
                    setCvc(v.replace(/\D/g, '').slice(0, cvcLen));
                    setErrors((x) => ({ ...x, cvc: '' }));
                  }}
                />
              </div>

              <Small
                id="rs-name"
                label="Name on card"
                value={name}
                error={errors.name}
                onChange={(v) => {
                  setName(v);
                  setErrors((x) => ({ ...x, name: '' }));
                }}
                wide
              />
              <Small
                id="rs-zip"
                label="Billing postal code"
                value={zip}
                error={errors.zip}
                onChange={(v) => {
                  setZip(v.toUpperCase().slice(0, 10));
                  setErrors((x) => ({ ...x, zip: '' }));
                }}
                wide
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2">
      <dt className="t-label text-stone-deep">{k}</dt>
      <dd className="t-label t-num">{v}</dd>
    </div>
  );
}

function Small({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  wide,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? '' : undefined}>
      <label htmlFor={id} className="t-label text-stone-deep mb-2 block">
        {label}
      </label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        inputMode={id === 'rs-name' ? 'text' : 'numeric'}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={cn('field text-ink', id !== 'rs-name' && 't-num', error && 'border-bronze')}
      />
      {error && <p className="t-label text-bronze mt-2">{error}</p>}
    </div>
  );
}
