import type { Tone } from '@/data/images';

/* ============================================================================
   TONE WASH
   The colour held behind a frame while its photograph decodes, so a layout
   never flashes white on a dark page. The drawn plates live in `scenes.ts`.
   ========================================================================= */

const PALETTE: Record<Tone, [string, string]> = {
  twilight: ['#050A14', '#1B3E5C'],
  interior: ['#14100C', '#3A2C1E'],
  aerial: ['#060D0A', '#1B3A24'],
  night: ['#03060C', '#0E1E2E'],
  water: ['#04121A', '#1B4F66'],
  neon: ['#05070C', '#123049'],
  studio: ['#080A0E', '#232A33'],
  daylight: ['#1E3A4E', '#6FA8CC'],
};

export function toneWash(tone: Tone = 'twilight'): string {
  const [dark, mid] = PALETTE[tone];
  return `linear-gradient(168deg, ${mid} 0%, ${dark} 100%)`;
}
