import type { Transition } from 'motion/react';

/** The house easing. Fast out of the gate, long settle. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1] as const;

export const T = {
  /** Micro-interactions — hover, focus, small state flips. */
  quick: { duration: 0.42, ease: EASE_OUT_EXPO } satisfies Transition,
  /** Entrances. */
  reveal: { duration: 0.95, ease: EASE_OUT_EXPO } satisfies Transition,
  /** Image scale and long camera moves. */
  cinematic: { duration: 1.5, ease: EASE_OUT_EXPO } satisfies Transition,
  /** Curtain and page-level transitions. */
  curtain: { duration: 1.05, ease: EASE_IN_OUT_QUART } satisfies Transition,
};

/** Standard viewport trigger — fires once, a little before the element lands. */
export const VIEWPORT = { once: true, amount: 0.22, margin: '0px 0px -8% 0px' } as const;
