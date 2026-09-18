import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { Notice } from '@/components/ui/Bits';
import { Seo } from '@/lib/seo';
import { BRAND, CONTACT } from '@/data/site';
import { TAX, TRAVEL } from '@shared/catalog.mjs';
import { LEAD_TIME_HOURS } from '@shared/schedule.mjs';
import type { ReactNode } from 'react';

/* ============================================================================
   LEGAL
   ----------------------------------------------------------------------------
   Written to be read, not to be impressive. Every clause describes something
   the site actually does — the refund window matches the FAQ, the travel rate
   matches the catalogue, and the data list matches what the forms collect.

   These are a starting point drafted for a small photography business, not
   legal advice. Have a lawyer read them before you rely on them.
   ========================================================================= */

function Clause({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line py-8">
      <h2 className="t-h3 text-[18px]">{title}</h2>
      <div className="flex max-w-[70ch] flex-col gap-3 text-[14px] leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}

const REVIEW_NOTE = (
  <Notice tone="warn" className="mb-4" title="Have these reviewed">
    These pages were drafted as a starting point for a small photography business.
    They describe how this website behaves, but they are not legal advice. Have a
    lawyer read them before relying on them.
  </Notice>
);

export function Privacy() {
  return (
    <>
      <Seo
        title="Privacy"
        description={`What ${BRAND.name} collects, why, and how long it is kept.`}
        path="/privacy"
      />

      <PageHeader label="Legal" title={['Privacy.']} lead="What is collected, why, and how long it is kept." compact />

      <div className="section pt-10">
        <div className="shell max-w-4xl">
          {REVIEW_NOTE}

          <Clause title="What is collected">
            <p>
              When you book, you give a name, email address, phone number, the property
              address, the property type, an approximate square footage and any notes you
              write. All of it is used to turn up at the right place and send you the
              photographs. Nothing else is asked for.
            </p>
            <p>
              When you use the contact or quote form, the fields on that form are
              collected for the same reason: to reply to you.
            </p>
          </Clause>

          <Clause title="Payment details">
            <p>
              Card numbers are never collected by this website and never reach its
              servers. Payment is handled entirely on Stripe’s own checkout page. Stripe
              tells us that a payment succeeded and which booking it belongs to — nothing
              more. Their privacy notice governs what they hold.
            </p>
          </Clause>

          <Clause title="What is stored in your browser">
            <p>
              A part-finished booking is saved in this browser’s local storage so you can
              close the tab and come back to it. It never leaves your device, is not
              readable by us, and clearing your browser data removes it.
            </p>
            <p>
              There are no advertising cookies and no third-party analytics scripts on
              this site, which is why there is no cookie banner asking you to accept
              anything.
            </p>
          </Clause>

          <Clause title="Who else sees it">
            <p>
              Nobody. Your details are not sold, rented, or shared with any third party
              for marketing. The only companies that touch your data are the payment
              processor handling the transaction and the email service delivering your
              confirmation.
            </p>
          </Clause>

          <Clause title="How long it is kept">
            <p>
              Booking records are kept for as long as needed for tax and accounting, then
              deleted. Enquiries that do not become bookings are deleted once they are
              clearly finished.
            </p>
          </Clause>

          <Clause title="Your photographs">
            <p>
              Images of your property may be used in this portfolio unless you ask
              otherwise — and that ask is always honoured, without a reason being needed.
              Street addresses are never published; work is only ever labelled with a town.
            </p>
          </Clause>

          <Clause title="Asking for your data, or its removal">
            <p>
              Email{' '}
              <a href={`mailto:${CONTACT.email}`} className="link-rule break-all">
                {CONTACT.email}
              </a>{' '}
              or call{' '}
              <a href={`tel:${CONTACT.phoneHref}`} className="link-rule font-mono">
                {CONTACT.phone}
              </a>
              . You will get a copy of what is held, or have it deleted, within a
              reasonable time and at no cost.
            </p>
          </Clause>
        </div>
      </div>

      <Footer />
    </>
  );
}

export function Terms() {
  return (
    <>
      <Seo
        title="Terms"
        description={`Booking, payment, cancellation, weather and licensing terms for ${BRAND.name}.`}
        path="/terms"
      />

      <PageHeader label="Legal" title={['Terms.']} lead="Booking, payment, cancellation, weather and what you may do with the work." compact />

      <div className="section pt-10">
        <div className="shell max-w-4xl">
          {REVIEW_NOTE}

          <Clause title="Booking and confirmation">
            <p>
              A booking is confirmed when payment has been taken, not when the form is
              submitted. Until then the slot is held briefly and released if the checkout
              is abandoned. Bookings require at least {LEAD_TIME_HOURS} hours’ notice.
            </p>
          </Clause>

          <Clause title="What the price includes">
            <p>
              The total shown at checkout is the total charged: the package, every add-on
              selected, any property-size adjustment, travel beyond{' '}
              {TRAVEL.includedMiles} miles at ${(TRAVEL.perMileCents / 100).toFixed(2)} a
              mile, and {(TAX.rate * 100).toFixed(0)}% {TAX.label}. There is no separate
              editing, licensing or delivery fee.
            </p>
          </Clause>

          <Clause title="Access and preparation">
            <p>
              Access to the property at the booked time is your responsibility — a
              lockbox code, a key, or someone present. If access cannot be gained within
              thirty minutes of the booked time, the shoot counts as a late cancellation.
            </p>
            <p>
              A preparation note is sent when you book. Photographs are taken of the
              property as found; nothing that is not done beforehand can be fixed
              afterwards in editing.
            </p>
          </Clause>

          <Clause title="Cancellation and rescheduling">
            <p>
              Cancel or reschedule more than 24 hours before the shoot and it is free,
              with a full refund if you are cancelling. Inside 24 hours, half the fee is
              retained, because the slot can no longer be filled.
            </p>
            <p>
              If the shoot is cancelled from this end for any reason, you are refunded in
              full, immediately.
            </p>
          </Clause>

          <Clause title="Weather">
            <p>
              Drone flights do not go ahead in rain or sustained wind, and aerial work in
              flat grey light is not worth delivering. Weather reschedules are always
              free. Usually the ground work goes ahead as planned and the aerial is picked
              up on the next clear morning.
            </p>
          </Clause>

          <Clause title="Drone operations">
            <p>
              All flights are conducted under a commercial licence and within the rules:
              not over people, not over moving traffic, and within visual line of sight.
              Controlled airspace may require authorisation, which is requested in
              advance. If a property cannot lawfully be flown, you are told before you
              pay, and that portion is refunded.
            </p>
          </Clause>

          <Clause title="Delivery">
            <p>
              Photography is delivered the next business day; film within 72 hours.
              Gallery links stay live for twelve months. Rush delivery, where booked,
              returns everything within 24 hours of the shoot.
            </p>
          </Clause>

          <Clause title="Copyright and licence">
            <p>
              Copyright in all photographs and film remains with {BRAND.name}. You receive
              an unlimited, perpetual licence to use the work to market the property and
              to promote your own business.
            </p>
            <p>
              That licence does not extend to reselling or sub-licensing the work to a
              third party — a portal, a stock library, another brokerage, or a subsequent
              owner — without written permission. Permission is generally given; it just
              needs asking for.
            </p>
          </Clause>

          <Clause title="Liability">
            <p>
              Liability for any single booking is limited to the amount paid for it.
              Nothing here limits liability for anything that cannot lawfully be limited.
            </p>
          </Clause>

          <Clause title="Getting in touch">
            <p>
              Questions about any of this:{' '}
              <a href={`mailto:${CONTACT.email}`} className="link-rule break-all">
                {CONTACT.email}
              </a>{' '}
              or{' '}
              <a href={`tel:${CONTACT.phoneHref}`} className="link-rule font-mono">
                {CONTACT.phone}
              </a>
              .
            </p>
          </Clause>
        </div>
      </div>

      <Footer />
    </>
  );
}
