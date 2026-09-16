import { motion } from 'motion/react';
import { depositFor, money, useOffice } from '@/lib/office';
import { FEATURED } from '@/data/properties';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { Arrow } from './Cta';
import { Label, MaskedLines, Reveal } from './Type';

/* ==========================================================================
   THE PRIVATE OFFICE
   Three services set as an index rather than a row of cards: book the time,
   hold the property, talk to the broker.
   ======================================================================== */

export function PrivateOffice() {
  const { open, bookings, reservations, messages } = useOffice();
  const deposit = depositFor(FEATURED);

  const desks = [
    {
      index: '01',
      title: 'Book a viewing',
      body: 'Take a slot in the diary directly. Forty-five minutes, on site, with the broker who holds the listing — not an assistant and not an open house.',
      action: 'Open the diary',
      note: bookings.length
        ? `${bookings.length} booked from this device`
        : 'Weekday afternoons · Saturday mornings',
      onClick: () => open('booking', FEATURED),
    },
    {
      index: '02',
      title: 'Reserve a residence',
      body: `A deposit of one per cent takes the property off the open market for fourteen days while your solicitor reads the pack. Refundable in full inside that window.`,
      action: 'Place a deposit',
      note: reservations.length
        ? `${reservations.length} reservation${reservations.length > 1 ? 's' : ''} on this device`
        : `${money(deposit)} on ${FEATURED.name}`,
      onClick: () => open('reserve', FEATURED),
    },
    {
      index: '03',
      title: 'Message the broker',
      body: 'Ask the questions you would rather not put in an enquiry form — the seller’s position, what the survey found, what we would advise if you were family.',
      action: 'Open the thread',
      note: messages.length ? `${messages.length} messages in this thread` : 'Replies within the hour',
      onClick: () => open('messages', FEATURED),
    },
  ];

  return (
    <section
      id="office"
      data-nav-theme="dark"
      className="bg-paper relative z-10"
      aria-labelledby="office-title"
    >
      <div className="shell pt-[max(4.5rem,12vh)] pb-[max(4.5rem,12vh)]">
        <div className="border-ink/14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t pt-4">
          <Label index="08">The Private Office</Label>
          <span className="t-label text-stone-deep">Open to clients and enquirers alike</span>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 md:mt-14">
          <MaskedLines
            as="h2"
            id="office-title"
            className="t-h1 max-w-[14ch]"
            lines={['Everything else', 'happens here']}
          />
          <motion.p
            className="t-body text-ink/70 max-w-[34ch]"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.12 }}
          >
            Three things a buyer does between seeing a house and owning it. None of them
            should require a phone call you have to chase.
          </motion.p>
        </div>

        <ul className="border-ink/14 mt-14 border-t md:mt-20">
          {desks.map((d, i) => (
            <li key={d.index} className="border-ink/14 border-b">
              <Reveal delay={i * 0.06}>
                <button
                  onClick={d.onClick}
                  className="group/desk focus-bare arrow-host grid-editorial w-full items-start py-9 text-left md:py-11"
                >
                  <div className="col-span-12 md:col-span-1">
                    <span className="t-label t-num text-bronze">{d.index}</span>
                  </div>

                  <div className="col-span-12 mt-3 md:col-span-4 md:mt-0">
                    <h3 className="t-h3 transition-transform duration-[600ms] ease-[cubic-bezier(.23,1,.32,1)] group-hover/desk:translate-x-1.5">
                      {d.title}
                    </h3>
                    <p className="t-label text-stone-deep mt-3">{d.note}</p>
                  </div>

                  <div className="col-span-12 mt-5 md:col-span-5 md:col-start-6 md:mt-0">
                    <p className="t-body text-ink/75 max-w-[48ch]">{d.body}</p>
                  </div>

                  <div className="col-span-12 mt-6 flex items-center gap-4 md:col-span-2 md:col-start-11 md:mt-0 md:justify-end">
                    <span className="t-label whitespace-nowrap">{d.action}</span>
                    <Arrow />
                  </div>
                </button>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
