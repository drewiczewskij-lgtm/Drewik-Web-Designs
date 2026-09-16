import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { agentFor, useOffice } from '@/lib/office';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { Figure } from '../Figure';
import { BookViewing } from './BookViewing';
import { Reserve } from './Reserve';
import { Messages } from './Messages';

const EASE_UI = [0.23, 1, 0.32, 1] as const;

/**
 * Mounts the three panels and the dock that opens the thread. The dock waits
 * until the reader has left the hero — it has nothing to say before then.
 */
export function Office() {
  const { desk, open, unread, property } = useOffice();
  const reduced = usePrefersReducedMotion();
  const [past, setPast] = useState(false);
  const agent = agentFor(property);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setPast(window.scrollY > window.innerHeight * 0.85);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      <BookViewing />
      <Reserve />
      <Messages />

      <AnimatePresence>
        {past && desk === null && (
          <motion.button
            onClick={() => open('messages')}
            className="press focus-bare bg-charcoal text-paper fixed right-[max(1.25rem,3vw)] bottom-[max(1.25rem,3vw)] z-[70] hidden items-center gap-3 py-2.5 pr-5 pl-2.5 shadow-[0_12px_40px_rgba(10,9,7,.35)] md:flex"
            initial={{ opacity: 0, transform: 'translateY(14px) scale(0.96)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(10px) scale(0.97)' }}
            transition={{ duration: reduced ? 0.01 : 0.28, ease: EASE_UI }}
            aria-label={`Message ${agent.name}${unread ? `, ${unread} unread` : ''}`}
          >
            <span className="relative block">
              <Figure
                image={agent.portrait}
                className="h-9 w-9 rounded-full"
                sizes="36px"
                quality={40}
              />
              {unread > 0 && (
                <span className="bg-bronze-soft text-charcoal t-num absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-medium">
                  {unread}
                </span>
              )}
            </span>
            <span className="t-label">Message {agent.name.split(' ')[0]}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
