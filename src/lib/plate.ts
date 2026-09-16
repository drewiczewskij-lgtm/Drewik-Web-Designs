import type { Tone } from '@/data/images';

/* ============================================================================
   TONE WASH
   The colour held behind a frame while its photograph decodes, so the layout
   never flashes white. The drawn plates themselves live in `scenes.ts`.
   ========================================================================= */

const PALETTE: Record<Tone, [string, string, string]> = {
  dusk: ['#2B231D', '#6A5140', '#D9C3A6'],
  stone: ['#3A362F', '#8C867A', '#DCD5C7'],
  sand: ['#3E362A', '#9A886C', '#E6DBC6'],
  pine: ['#18201C', '#44544A', '#B9C2B4'],
  marine: ['#182530', '#42626F', '#BCCBD0'],
  ember: ['#2C1D16', '#7A4B31', '#E0BC97'],
  graphite: ['#161617', '#42434A', '#C6C7CB'],
};

/** The wash held behind an image while it decodes. */
export function toneWash(tone: Tone = 'stone'): string {
  const [dark, mid] = PALETTE[tone];
  return `linear-gradient(168deg, ${mid} 0%, ${dark} 100%)`;
}
