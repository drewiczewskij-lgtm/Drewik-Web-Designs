import type { Tone } from '@/data/images';

/* ============================================================================
   THE STAND-IN PLATE
   ----------------------------------------------------------------------------
   If a photograph never arrives — offline, a blocked CDN, a replaced asset —
   the frame is filled with a generated architectural plate rather than a broken
   image icon. It is drawn from the brand palette, seeded by the asset key, so
   the composition is stable across reloads and no two frames look alike.
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

/** xorshift — small, deterministic, good enough for composition. */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

const cache = new Map<string, string>();

export function architecturalPlate(seed: string, tone: Tone = 'stone'): string {
  const key = `${seed}|${tone}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const [dark, mid, light] = PALETTE[tone];
  const r = rng(key);

  const W = 1600;
  const H = 1000;
  const horizon = Math.round(H * (0.52 + r() * 0.16));

  // A skyline of flat-roofed masses, drawn as one path so it reads as one building.
  const blocks: string[] = [];
  let x = -60 + r() * 80;
  while (x < W + 60) {
    const w = 90 + r() * 260;
    const h = 40 + r() * 300;
    blocks.push(`M${x.toFixed(0)},${horizon} V${(horizon - h).toFixed(0)} H${(x + w).toFixed(0)} V${horizon} Z`);
    x += w;
  }

  // Two or three long horizontal rules — the thing that makes it read architectural.
  const rules: string[] = [];
  const ruleCount = 2 + Math.floor(r() * 2);
  for (let i = 0; i < ruleCount; i++) {
    const y = Math.round(horizon + 60 + r() * (H - horizon - 100));
    const x0 = Math.round(r() * W * 0.3);
    const x1 = Math.round(W - r() * W * 0.2);
    rules.push(`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${light}" stroke-opacity="0.16" stroke-width="2"/>`);
  }

  const sunY = Math.round(horizon - 120 - r() * 220);
  const sunX = Math.round(W * (0.16 + r() * 0.68));
  const sunR = Math.round(46 + r() * 54);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="${dark}"/>
<stop offset="62%" stop-color="${mid}"/>
<stop offset="100%" stop-color="${light}" stop-opacity="0.82"/>
</linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="${mid}" stop-opacity="0.55"/>
<stop offset="100%" stop-color="${dark}"/>
</linearGradient>
<filter id="tex" x="0" y="0" width="100%" height="100%">
<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${Math.round(r() * 9999)}"/>
<feColorMatrix type="saturate" values="0"/>
<feComponentTransfer><feFuncA type="linear" slope="0.09"/></feComponentTransfer>
</filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${light}" fill-opacity="0.2"/>
<rect y="${horizon}" width="${W}" height="${H - horizon}" fill="url(#ground)"/>
<path d="${blocks.join(' ')}" fill="${dark}" fill-opacity="0.9"/>
<line x1="0" y1="${horizon}" x2="${W}" y2="${horizon}" stroke="${light}" stroke-opacity="0.3" stroke-width="2"/>
${rules.join('')}
<rect width="${W}" height="${H}" filter="url(#tex)" opacity="0.7"/>
</svg>`;

  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\n/g, ''))}`;
  cache.set(key, url);
  return url;
}

/** The tiny blurred placeholder held behind an image while it decodes. */
export function toneWash(tone: Tone = 'stone'): string {
  const [dark, mid] = PALETTE[tone];
  return `linear-gradient(168deg, ${mid} 0%, ${dark} 100%)`;
}
