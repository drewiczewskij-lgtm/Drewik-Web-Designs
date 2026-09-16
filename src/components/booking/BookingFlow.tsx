import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { Progress } from './Progress';
import { OrderSummary, OrderDock } from './OrderSummary';
import { StepType, StepPackage, StepExtras } from './steps/Choose';
import { StepDate, StepTime } from './steps/Schedule';
import { StepDetails, StepReview, StepPayment, StepConfirmed } from './steps/Checkout';
import { Button, Arrow } from '@/components/ui/Button';
import { Modal, CloseButton } from '@/components/ui/Modal';
import { Notice } from '@/components/ui/Bits';
import { STEPS, stepIndex, useBooking } from '@/lib/booking';
import { getPackage } from '@shared/catalog.mjs';
import { EASE_OUT_EXPO, EASE_UI } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

/* ============================================================================
   THE BOOKING FLOW
   ----------------------------------------------------------------------------
   Nine steps, one order summary, one set of controls. This component only
   arranges them — every rule about what may follow what lives in
   `src/lib/booking.tsx`, so the interface cannot disagree with the logic.

   Steps slide in the direction of travel, so going back visibly undoes going
   forward. The order summary is a sidebar on a desktop and a docked bar on a
   phone, because on a phone the thing you must never lose sight of is the
   total.
   ========================================================================= */

export function BookingFlow() {
  const { step, next, back, blocker, draft, set, pricing } = useBooking();
  const [params, setParams] = useSearchParams();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const reduced = usePrefersReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const index = stepIndex(step);
  const previousIndex = useRef(index);

  const direction = index >= previousIndex.current ? 1 : -1;
  useEffect(() => {
    previousIndex.current = index;
  }, [index]);

  // Arriving from a pricing card: ?package=premium starts the flow already
  // filled in, which is the whole point of the link.
  useEffect(() => {
    const wanted = params.get('package');
    if (!wanted) return;
    const pkg = getPackage(wanted);
    if (pkg && !pkg.quoteOnly) {
      set('shootType', 'real-estate');
      set('packageId', pkg.id);
    }
    // Consume it, so a refresh does not reset a changed choice.
    params.delete('package');
    setParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelled = params.get('cancelled');

  // Move focus to the step heading on each change. Without this, someone using
  // a keyboard or a screen reader presses Continue and is left at the bottom of
  // a page whose content has entirely changed.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }, [step, reduced]);

  const isConfirmed = step === 'confirmed';
  const current = STEPS[index];

  return (
    <div className="shell relative pb-32 lg:pb-24">
      <div className="mb-10 lg:mb-14">
        <Progress />
      </div>

      {cancelled && !isConfirmed && (
        <Notice tone="warn" className="mb-8" title="Checkout was cancelled">
          Nothing was charged and your slot was released. Everything you chose is still
          here — carry on whenever you are ready.
        </Notice>
      )}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <div className="min-w-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.section
              key={step}
              custom={direction}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: direction * 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: direction * -20 }}
              transition={{ duration: reduced ? 0.15 : 0.3, ease: EASE_UI }}
              aria-labelledby="step-heading"
            >
              <header className="mb-8 flex flex-col gap-2">
                {/* Below `lg` the progress bar already says "Step 3 of 9", so
                    saying it again directly underneath is just noise. */}
                <p className="t-label hidden lg:block">
                  Step {index + 1} <span className="text-faint">of {STEPS.length}</span>
                </p>
                <h2
                  id="step-heading"
                  ref={headingRef}
                  tabIndex={-1}
                  className="t-h2 text-[clamp(1.5rem,3vw,2.3rem)] outline-none"
                >
                  {current.title}
                </h2>
              </header>

              {step === 'type' && <StepType />}
              {step === 'package' && <StepPackage />}
              {step === 'extras' && <StepExtras />}
              {step === 'date' && <StepDate />}
              {step === 'time' && <StepTime />}
              {step === 'details' && <StepDetails />}
              {step === 'review' && <StepReview />}
              {step === 'payment' && <StepPayment />}
              {step === 'confirmed' && <StepConfirmed />}
            </motion.section>
          </AnimatePresence>

          {/* Controls. Payment has its own button; confirmation has no "next". */}
          {step !== 'payment' && !isConfirmed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: 0.1 }}
              className="mt-10 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                {index > 0 && (
                  <Button onClick={back} variant="quiet">
                    ← Back
                  </Button>
                )}
              </div>

              <div className="flex flex-col items-stretch gap-2 sm:items-end">
                <Button
                  onClick={next}
                  disabled={Boolean(blocker)}
                  size="lg"
                  className="group"
                  trailing={<Arrow />}
                >
                  {step === 'review' ? 'Continue to payment' : 'Continue'}
                </Button>

                {/* The reason, not just a dead button. */}
                <p
                  aria-live="polite"
                  className="text-[12.5px] text-faint sm:text-right"
                >
                  {blocker ?? ' '}
                </p>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <div className="mt-8 border-t border-line pt-8">
              <Button onClick={back} variant="quiet">
                ← Back to the order
              </Button>
            </div>
          )}
        </div>

        {/* Desktop: the order, pinned. */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 flex flex-col gap-4">
            <OrderSummary />
            {draft.packageId && pricing?.ok && (
              <p className="text-[12px] leading-relaxed text-faint">
                The total is recalculated on the server before anything is charged —
                what you see here is what you pay.
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Phone: the order, docked. */}
      {!isConfirmed && pricing?.ok && (
        <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
          <OrderDock onOpen={() => setSummaryOpen(true)} />
        </div>
      )}

      <Modal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        label="Order summary"
        className="max-w-lg px-4"
      >
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <CloseButton onClose={() => setSummaryOpen(false)} />
          </div>
          <OrderSummary />
        </div>
      </Modal>
    </div>
  );
}
