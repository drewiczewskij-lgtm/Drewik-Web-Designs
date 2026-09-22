import type { Transition } from 'motion/react';

/* ============================================================================
   MOTION TOKENS
   ----------------------------------------------------------------------------
   Two speeds, and they are not the same thing.

   INTERFACE moves fast. A control that takes 400ms to respond feels broken
   however pretty the curve is, so buttons, panels and steps stay under 300ms.

   THE PAGE moves slowly. Reveals, image entrances and camera moves are
   cinematic and are allowed a second, because you see each of them once.

   Everything eases out. Nothing on this site uses ease-in: it withholds motion
   at exactly the moment the eye is looking hardest, and reads as lag.
   ========================================================================= */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1] as const;
export const EASE_UI = [0.23, 1, 0.32, 1] as const;

export const T = {
  /** Press feedback, toggles, chips. */
  press: { duration: 0.16, ease: EASE_UI } satisfies Transition,
  /** Interface: dropdowns, panels, step changes, totals. */
  ui: { duration: 0.24, ease: EASE_UI } satisfies Transition,
  /** The slower end of interface — sheets and modals. */
  panel: { duration: 0.36, ease: EASE_UI } satisfies Transition,
  /** Page reveals. Seen once each. */
  reveal: { duration: 0.85, ease: EASE_OUT_EXPO } satisfies Transition,
  /** Image scale and long camera moves. */
  cinematic: { duration: 1.4, ease: EASE_OUT_EXPO } satisfies Transition,
  /** Route curtains. */
  curtain: { duration: 0.5, ease: EASE_IN_OUT_QUART } satisfies Transition,
};

/** Standard viewport trigger — fires once, a little before the element lands. */
export const VIEWPORT = { once: true, amount: 0.2, margin: '0px 0px -8% 0px' } as const;

/**
 * Stagger for a group of entering children. Short on purpose: long stagger
 * makes a page feel slow rather than considered.
 */
export function stagger(index: number, step = 0.055, max = 0.34): number {
  return Math.min(index * step, max);
}

/** The entrance every revealed block uses, so they all agree. */
export const RISE = {
  hidden: { opacity: 0, y: 22 },
  shown: { opacity: 1, y: 0 },
} as const;
