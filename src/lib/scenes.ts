/* ============================================================================
   SCENE PLATES
   ----------------------------------------------------------------------------
   Drawn imagery for every frame in the site, generated as SVG.

   These are what a frame shows when its photograph does not arrive — offline,
   a blocked CDN, a sandbox that refuses third-party images. They are not
   placeholders: each one is composed for its subject, in the brand's light, so
   a frame that never loads still reads as part of the same art direction.

   Everything is drawn to a 1600 x 1100 field with the horizon near three-fifths
   and the subject on the centre line, so the composition survives being cropped
   to a tall portrait or a wide letterbox alike.
   ========================================================================= */

const W = 1600;
const H = 1100;

export type SceneKind =
  | 'coast-dusk'
  | 'coast-day'
  | 'coast-night'
  | 'coastline'
  | 'terrace'
  | 'pool'
  | 'interior-living'
  | 'interior-dining'
  | 'interior-kitchen'
  | 'interior-bedroom'
  | 'interior-bath'
  | 'stair'
  | 'joinery'
  | 'alpine-house'
  | 'alpine-interior'
  | 'alpine-land'
  | 'timber-detail'
  | 'villa'
  | 'villa-water'
  | 'bay'
  | 'pavilion'
  | 'pavilion-interior'
  | 'hills'
  | 'city'
  | 'portrait';

/* -------------------------------------------------------------------------
   Deterministic jitter, so a plate is identical on every reload but no two
   frames share a sun position or a skyline.
   ---------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------
   Primitives
   ---------------------------------------------------------------------- */

type Stop = [number, string, number?];

const grad = (id: string, stops: Stop[], vertical = true) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">` +
  stops
    .map(
      ([o, c, a]) =>
        `<stop offset="${o * 100}%" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`,
    )
    .join('') +
  '</linearGradient>';

const radial = (id: string, stops: Stop[], cx: number, cy: number, r: number) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse">` +
  stops
    .map(
      ([o, c, a]) =>
        `<stop offset="${o * 100}%" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`,
    )
    .join('') +
  '</radialGradient>';

const rect = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
  `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}" ${extra}/>`;

const poly = (points: string, fill: string, extra = '') =>
  `<polygon points="${points}" fill="${fill}" ${extra}/>`;

/** A lit face and a shaded return — the whole vocabulary of these buildings. */
function volume(
  x: number,
  y: number,
  w: number,
  h: number,
  lit: string,
  shade: string,
  depth = 0,
) {
  const side =
    depth > 0
      ? poly(
          `${x + w},${y} ${x + w + depth},${y + depth * 0.5} ${x + w + depth},${y + h + depth * 0.5} ${x + w},${y + h}`,
          shade,
        )
      : '';
  return side + rect(x, y, w, h, lit);
}

/** Warm interior light read through glazing. */
function glazing(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  mullions = 4,
  mullionColor = '#00000022',
) {
  let out = rect(x, y, w, h, fill);
  for (let i = 1; i < mullions; i++) {
    out += rect(x + (w / mullions) * i - 1.6, y, 3.2, h, mullionColor);
  }
  return out;
}

const pine = (x: number, y: number, s: number, c: string) =>
  poly(
    `${x},${y} ${x - 13 * s},${y + 46 * s} ${x - 5 * s},${y + 44 * s} ${x - 16 * s},${y + 84 * s} ${x + 16 * s},${y + 84 * s} ${x + 5 * s},${y + 44 * s} ${x + 13 * s},${y + 46 * s}`,
    c,
  );

const oak = (x: number, y: number, s: number, c: string) =>
  `<ellipse cx="${x}" cy="${y}" rx="${44 * s}" ry="${30 * s}" fill="${c}"/>` +
  `<ellipse cx="${x - 26 * s}" cy="${y + 12 * s}" rx="${26 * s}" ry="${19 * s}" fill="${c}"/>` +
  `<ellipse cx="${x + 28 * s}" cy="${y + 10 * s}" rx="${24 * s}" ry="${17 * s}" fill="${c}"/>` +
  rect(x - 3 * s, y + 18 * s, 6 * s, 40 * s, c);

const palm = (x: number, y: number, s: number, c: string) => {
  let out = `<path d="M${x},${y} q${5 * s},${40 * s} ${2 * s},${86 * s} l${7 * s},0 q${3 * s},${-46 * s} ${-2 * s},${-86 * s} Z" fill="${c}"/>`;
  for (let i = 0; i < 6; i++) {
    const a = -160 + i * 44;
    const r = (a * Math.PI) / 180;
    const ex = x + Math.cos(r) * 62 * s;
    const ey = y + Math.sin(r) * 40 * s;
    out += `<path d="M${x},${y} Q${(x + ex) / 2},${(y + ey) / 2 - 22 * s} ${ex},${ey} Q${(x + ex) / 2},${(y + ey) / 2 - 8 * s} ${x},${y + 5 * s} Z" fill="${c}"/>`;
  }
  return out;
};

/** Reflected light on water: broken glints, widest nearest the viewer. */
function specular(cx: number, top: number, bottom: number, color: string, r: () => number) {
  let out = '';
  const rows = 40;
  for (let i = 0; i < rows; i++) {
    const t = i / rows;
    const y = top + (bottom - top) * t;
    const span = 26 + t * 250;
    const w = span * (0.3 + r() * 0.7);
    const jitter = (r() - 0.5) * span * 0.55;
    const o = 0.34 * (1 - t * 0.55) * (0.35 + r() * 0.65);
    out += rect(cx - w / 2 + jitter, y, w, 1.6 + t * 3, color, `opacity="${o.toFixed(2)}"`);
  }
  return out;
}

function wrap(defs: string, body: string, seed: number) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">` +
    `<defs>${defs}` +
    `<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${seed}"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.07"/></feComponentTransfer></filter>` +
    radial('vg', [[0.55, '#000', 0], [1, '#0B0906', 0.44]], W / 2, H * 0.46, W * 0.72) +
    `</defs>` +
    body +
    rect(0, 0, W, H, 'url(#vg)') +
    rect(0, 0, W, H, '#000', 'filter="url(#g)"') +
    `</svg>`
  );
}

/* -------------------------------------------------------------------------
   Families
   ---------------------------------------------------------------------- */

interface Light {
  sky: [string, string, string];
  sun: string;
  sea: [string, string];
  wall: [string, string];
  glass: string;
  sunY: number;
}

const DUSK: Light = {
  sky: ['#1C150E', '#8A5028', '#EDBE7C'],
  sun: '#FFD99C',
  sea: ['#242F35', '#6C8087'],
  wall: ['#E7D9C0', '#6B5E50'],
  glass: '#F2C177',
  sunY: 0.5,
};

const DAY: Light = {
  sky: ['#4E7488', '#96B2BB', '#D6DCD3'],
  sun: '#FCF4E2',
  sea: ['#2F5460', '#7A9AA3'],
  wall: ['#EFE8DC', '#83786A'],
  glass: '#9FB6BE',
  sunY: 0.26,
};

const NIGHT: Light = {
  sky: ['#080A0E', '#161A21', '#33313A'],
  sun: '#54525C',
  sea: ['#0E1216', '#2C333B'],
  wall: ['#25221E', '#141210'],
  glass: '#F6C97E',
  sunY: 0.18,
};

function coast(l: Light, r: () => number, withHouse: boolean) {
  const horizon = H * 0.54;
  const bluffY = horizon + 168;
  // The house sits left of centre; the sun is thrown to the opposite side so
  // the two never fight for the same part of the frame.
  const sunX = W * (0.66 + r() * 0.2);
  const sunY = horizon - H * l.sunY * 0.52;
  const sunR = 48 + r() * 24;

  const defs =
    grad('sky', [[0, l.sky[0]], [0.62, l.sky[1]], [1, l.sky[2]]]) +
    grad('sea', [[0, l.sea[1]], [1, l.sea[0]]]) +
    grad('haze', [[0, l.sky[2], 0.55], [1, l.sky[2], 0]]) +
    radial('glow', [[0, l.sun, 0.7], [1, l.sun, 0]], sunX, sunY, sunR * 8) +
    `<clipPath id="seaclip"><rect x="0" y="${horizon}" width="${W}" height="${bluffY - horizon + 40}"/></clipPath>`;

  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += rect(0, 0, W, horizon, 'url(#glow)');
  body += `<circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${l.sun}" opacity="0.94"/>`;
  body += rect(0, horizon, W, bluffY - horizon + 60, 'url(#sea)');
  // Reflected light stays on the water, never over the land in front of it.
  body += `<g clip-path="url(#seaclip)">${specular(sunX, horizon, bluffY + 40, l.sun, r)}</g>`;
  body += rect(0, horizon - 3, W, 4, l.sun, 'opacity="0.4"');
  body += rect(0, horizon - 90, W, 90, 'url(#haze)');

  // Bluff: a long shelf falling away to the right.
  body += poly(
    `0,${bluffY + 30} 340,${bluffY - 6} 1020,${bluffY - 26} ${W},${bluffY + 52} ${W},${H} 0,${H}`,
    '#000',
    'opacity="0.58"',
  );

  if (withHouse) {
    const hx = W * 0.1;
    const hw = W * 0.54;
    const hh = 128;
    const hy = bluffY - 62 - hh;

    // The terrace slab, running past the house to the right.
    body += rect(hx - 30, hy + hh, hw + 250, 18, l.wall[0], 'opacity="0.85"');
    body += rect(hx - 30, hy + hh + 18, hw + 250, 44, l.wall[1]);
    body += rect(hx - 30, hy + hh + 60, hw + 250, 10, '#000', 'opacity="0.35"');

    // Principal volume: deep soffit, then a run of glass in uneven bays.
    body += rect(hx, hy, hw, hh, l.wall[0]);
    body += rect(hx, hy, hw, 30, l.wall[1], 'opacity="0.6"');
    let gx = hx + 26;
    const gEnd = hx + hw - 26;
    while (gx < gEnd - 20) {
      const bw = Math.min(58 + r() * 74, gEnd - gx);
      body += rect(gx, hy + 40, bw, hh - 58, l.glass, 'opacity="0.92"');
      gx += bw + 7;
    }
    body += rect(hx, hy + hh - 6, hw, 6, l.wall[1]);

    // Upper volume, set back and pushed to the far end.
    const ux = hx + hw * 0.58;
    const uw = hw * 0.46;
    body += rect(ux, hy - 92, uw, 92, l.wall[0]);
    body += rect(ux, hy - 92, uw, 18, l.wall[1], 'opacity="0.6"');
    body += rect(ux + 22, hy - 62, uw - 44, 44, l.glass, 'opacity="0.9"');

    // A chimney mass anchoring the left end, and the shadow the house casts.
    body += rect(hx + 12, hy - 58, 46, 58, l.wall[1]);
    body += rect(hx - 60, bluffY - 54, hw + 300, 12, '#000', 'opacity="0.3"');
  }

  const tree = l === NIGHT ? '#100E0C' : l === DAY ? '#2A3A33' : '#1E2621';
  body += oak(W * 0.055, bluffY - 44, 1.35, tree);
  body += pine(W * 0.9, bluffY - 172, 1.25, tree);
  body += pine(W * 0.955, bluffY - 138, 0.95, tree);
  body += oak(W * 0.82, bluffY - 34, 0.95, tree);
  return { defs, body };
}

function coastline(r: () => number) {
  const l = DUSK;
  const horizon = H * 0.5;
  const sunX = W * (0.3 + r() * 0.4);
  const defs =
    grad('sky', [[0, '#2A1F16'], [0.56, '#9A6234'], [1, '#EFC489']]) +
    grad('sea', [[0, '#4C646C'], [1, '#26313A']]) +
    radial('glow', [[0, '#FFD9A0', 0.8], [1, '#FFD9A0', 0]], sunX, horizon - 90, W * 0.55);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += rect(0, 0, W, horizon, 'url(#glow)');
  body += `<circle cx="${sunX}" cy="${horizon - 82}" r="66" fill="#FFE1AE"/>`;
  body += rect(0, horizon, W, H - horizon, 'url(#sea)');
  body += specular(sunX, horizon, H, '#FFD9A0', r);
  // Headlands stepping back into haze.
  body += poly(`0,${horizon + 6} 300,${horizon - 66} 520,${horizon + 10} 0,${horizon + 120}`, '#1E2A2E', 'opacity="0.55"');
  body += poly(`${W},${horizon + 14} 1240,${horizon - 44} 1080,${horizon + 18} ${W},${horizon + 96}`, '#1E2A2E', 'opacity="0.42"');
  // Near bluff and the wet sand catching the sky.
  body += poly(`0,${H * 0.78} 250,${H * 0.72} 470,${H * 0.83} 300,${H} 0,${H}`, '#15181A', 'opacity="0.88"');
  body += poly(`${W},${H * 0.74} 1290,${H * 0.7} 1140,${H * 0.86} ${W},${H}`, '#15181A', 'opacity="0.82"');
  body += rect(300, H * 0.9, 1000, H * 0.1, l.sun, 'opacity="0.1"');
  return { defs, body };
}

function room(o: {
  wall: string;
  wallShade: string;
  floor: string;
  floorHi: string;
  ceiling: string;
  view: [string, string];
  light: string;
  furniture: { x: number; y: number; w: number; h: number; c: string }[];
  windowX?: number;
  windowW?: number;
  pendant?: boolean;
}) {
  const horizon = H * 0.6;
  const wx = o.windowX ?? W * 0.3;
  const ww = o.windowW ?? W * 0.62;
  const wy = H * 0.16;
  const wh = horizon + 74 - wy;

  const defs =
    grad('wall', [[0, o.wall], [1, o.wallShade]]) +
    grad('floor', [[0, o.floorHi], [1, o.floor]]) +
    grad('view', [[0, o.view[0]], [1, o.view[1]]]) +
    radial('pool', [[0, o.light, 0.5], [1, o.light, 0]], wx + ww / 2, horizon + 150, W * 0.46);

  let body = rect(0, 0, W, horizon + 74, 'url(#wall)');
  body += rect(0, 0, W, H * 0.13, o.ceiling);
  body += rect(0, H * 0.13, W, 5, '#00000022');
  body += rect(0, horizon + 74, W, H - horizon - 74, 'url(#floor)');

  // The opening, its view, and the light it throws onto the floor.
  body += rect(wx - 16, wy - 16, ww + 32, wh + 20, o.wallShade);
  body += rect(wx, wy, ww, wh, 'url(#view)');
  body += rect(wx, wy + wh * 0.62, ww, 4, '#FFFFFF', 'opacity="0.35"');
  for (let i = 1; i < 5; i++) body += rect(wx + (ww / 5) * i - 3, wy, 6, wh, o.wallShade);
  body += rect(0, horizon + 74, W, H - horizon - 74, 'url(#pool)');
  body += poly(
    `${wx},${horizon + 74} ${wx + ww},${horizon + 74} ${wx + ww + 150},${H} ${wx - 150},${H}`,
    o.light,
    'opacity="0.16"',
  );

  for (const f of o.furniture) body += rect(f.x, f.y, f.w, f.h, f.c);
  if (o.pendant) {
    body += rect(W * 0.5 - 2, H * 0.13, 4, 120, '#00000055');
    body += poly(`${W * 0.5 - 62},${H * 0.13 + 190} ${W * 0.5 + 62},${H * 0.13 + 190} ${W * 0.5 + 40},${H * 0.13 + 120} ${W * 0.5 - 40},${H * 0.13 + 120}`, '#2E2A24');
    body += `<ellipse cx="${W * 0.5}" cy="${H * 0.13 + 192}" rx="60" ry="9" fill="${o.light}" opacity="0.85"/>`;
  }
  return { defs, body };
}

function detail(o: { base: string; slat: string; gap: string; hardware: string; light: string }) {
  const defs =
    grad('d', [[0, o.base], [1, o.slat]]) +
    radial('dl', [[0, o.light, 0.5], [1, o.light, 0]], W * 0.28, H * 0.22, W * 0.72);
  let body = rect(0, 0, W, H, 'url(#d)');
  // A run of vertical boards, raking across the frame.
  for (let x = -60; x < W + 60; x += 58) {
    body += rect(x, 0, 42, H, o.slat);
    body += rect(x + 42, 0, 16, H, o.gap);
    body += rect(x, 0, 6, H, '#FFFFFF', 'opacity="0.07"');
  }
  // A single horizontal reveal, and the bronze pull that justifies the frame.
  body += rect(0, H * 0.52, W, 16, o.gap);
  body += rect(0, H * 0.52, W, 4, '#FFFFFF', 'opacity="0.1"');
  body += rect(W * 0.5 - 132, H * 0.45, 264, 12, o.hardware);
  body += rect(W * 0.5 - 132, H * 0.45, 264, 4, '#FFFFFF', 'opacity="0.3"');
  body += rect(0, 0, W, H, 'url(#dl)');
  return { defs, body };
}

function alpine(r: () => number, withHouse: boolean) {
  const horizon = H * 0.66;
  const defs =
    grad('sky', [[0, '#9FB0BC'], [0.55, '#CDD8DE'], [1, '#EFF2F3']]) +
    grad('snow', [[0, '#F2F5F6'], [1, '#D3DADE']]) +
    radial('hz', [[0, '#FFFFFF', 0.55], [1, '#FFFFFF', 0]], W * 0.52, horizon - 40, W * 0.6);
  let body = rect(0, 0, W, H, 'url(#sky)');
  // Three ranges, each paler than the one in front of it.
  body += poly(`0,${horizon} 210,${H * 0.3} 420,${horizon} `, '#A8B4BD', 'opacity="0.55"');
  body += poly(`300,${horizon} 640,${H * 0.21} 980,${horizon}`, '#93A2AD', 'opacity="0.7"');
  body += poly(`640,${horizon} 980,${H * 0.14} 1180,${H * 0.34} 1360,${H * 0.2} ${W},${horizon}`, '#7D8C98');
  body += poly(`920,${H * 0.26} 980,${H * 0.14} 1042,${H * 0.26} 1000,${H * 0.3} 960,${H * 0.28}`, '#F0F4F6');
  body += poly(`1300,${H * 0.3} 1360,${H * 0.2} 1420,${H * 0.3} 1380,${H * 0.33} 1340,${H * 0.32}`, '#F0F4F6');
  body += rect(0, 0, W, horizon, 'url(#hz)');
  body += rect(0, horizon, W, H - horizon, 'url(#snow)');

  const treeline = horizon + 10;
  for (let i = 0; i < 26; i++) {
    const x = (i / 25) * W + (r() - 0.5) * 34;
    body += pine(x, treeline - 96 - r() * 40, 0.72 + r() * 0.5, '#28352E');
  }

  if (withHouse) {
    const hx = W * 0.22;
    const hw = W * 0.56;
    const hy = horizon + 60;
    body += rect(hx - 20, hy + 140, hw + 40, 22, '#CBD3D7');
    body += volume(hx, hy, hw, 140, '#241F1C', '#151210', 0);
    body += rect(hx, hy, hw, 16, '#3A322C');
    body += glazing(hx + 40, hy + 34, hw - 80, 86, '#F5CC8B', 6, '#00000044');
    body += rect(hx + 40, hy + 120, hw - 80, 90, '#F5CC8B', 'opacity="0.12"');
  }
  return { defs, body };
}

function villa(r: () => number) {
  const horizon = H * 0.62;
  const defs =
    grad('sky', [[0, '#8FB6C8'], [0.6, '#CFDCE0'], [1, '#F2E8D8']]) +
    grad('wall', [[0, '#FBF7F0'], [1, '#D8CCB8']]) +
    grad('ground', [[0, '#9FA98C'], [1, '#6E7864']]);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += `<circle cx="${W * 0.78}" cy="${H * 0.18}" r="74" fill="#FDF6E6" opacity="0.65"/>`;
  body += rect(0, horizon, W, H - horizon, 'url(#ground)');

  const hx = W * 0.14;
  const hw = W * 0.72;
  const hy = horizon - 300;
  body += volume(hx, hy, hw, 300, 'url(#wall)', '#BFB29C', 0);
  body += rect(hx, hy, hw, 26, '#EFE6D6');
  // The deep loggia: piers with shade behind them.
  const bays = 6;
  body += rect(hx + 28, hy + 128, hw - 56, 172, '#6F6352');
  for (let i = 0; i <= bays; i++) {
    const px = hx + 28 + ((hw - 56) / bays) * i - 14;
    body += rect(px, hy + 120, 28, 180, '#F6F1E7');
  }
  body += rect(hx + 28, hy + 120, hw - 56, 14, '#EFE6D6');
  body += glazing(hx + 74, hy + 46, hw - 148, 62, '#B9C9CB', 5, '#00000022');
  for (let i = 0; i < 4; i++) {
    body += palm(hx - 70 + i * 22, hy + 40 + r() * 30, 1.5 + r() * 0.5, '#33402F');
  }
  body += palm(W * 0.94, hy + 30, 1.7, '#33402F');
  body += rect(0, H * 0.93, W, H * 0.07, '#2F4C55');
  return { defs, body };
}

function water(r: () => number, dock: boolean) {
  const horizon = H * 0.42;
  const defs =
    grad('sky', [[0, '#7FA6BE'], [0.6, '#C8D9DF'], [1, '#F1E6D4']]) +
    grad('water', [[0, '#5C93A6'], [1, '#2C5464']]);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += `<circle cx="${W * 0.72}" cy="${horizon - 130}" r="60" fill="#FCF3E1" opacity="0.8"/>`;
  // A low skyline on the far shore.
  for (let i = 0; i < 16; i++) {
    const x = i * 108 + (r() - 0.5) * 30;
    const h = 22 + r() * 76;
    body += rect(x, horizon - h, 78, h, '#9FB2BB', 'opacity="0.75"');
  }
  body += rect(0, horizon, W, H - horizon, 'url(#water)');
  body += specular(W * 0.72, horizon, H, '#F6E3C2', r);
  for (let i = 0; i < 26; i++) {
    const y = horizon + 24 + i * 26;
    body += rect((r() - 0.5) * 300 + W * 0.3, y, 220 + r() * 420, 3, '#FFFFFF', 'opacity="0.09"');
  }
  if (dock) {
    const dy = H * 0.62;
    body += rect(W * 0.26, dy, W * 0.52, 26, '#C9B893');
    for (let i = 0; i < 7; i++) body += rect(W * 0.27 + i * (W * 0.5) / 6, dy + 26, 12, 150, '#5C503F');
    // A hull moored alongside.
    body += poly(`${W * 0.6},${dy - 54} ${W * 0.86},${dy - 54} ${W * 0.82},${dy - 6} ${W * 0.62},${dy - 6}`, '#F2EEE6');
    body += rect(W * 0.64, dy - 88, W * 0.14, 36, '#E4DED2');
    body += rect(W * 0.6, dy - 60, W * 0.26, 8, '#3C4A50');
    body += palm(W * 0.1, dy - 90, 1.8, '#2E3B2C');
    body += palm(W * 0.92, dy - 70, 1.6, '#2E3B2C');
  }
  return { defs, body };
}

function pavilion(r: () => number) {
  const horizon = H * 0.66;
  const defs =
    grad('sky', [[0, '#A9BDB4'], [0.6, '#D9DFCD'], [1, '#F2EFE0']]) +
    grad('meadow', [[0, '#B4A576'], [1, '#7E7350']]);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += rect(0, horizon, W, H - horizon, 'url(#meadow)');
  for (let i = 0; i < 7; i++) body += oak(120 + i * 250 + (r() - 0.5) * 70, horizon - 120 - r() * 60, 1.5 + r() * 0.6, '#3F4A36');

  const hx = W * 0.12;
  const hw = W * 0.76;
  const hy = horizon - 210;
  const hh = 158;
  // Eight piers, the floor plate, the glass, the deck above it.
  for (let i = 0; i <= 7; i++) body += rect(hx + 16 + (hw / 7) * i - 7, hy + hh, 14, 120, '#2A2A27');
  body += rect(hx - 18, hy + hh - 16, hw + 36, 22, '#23231F');
  body += rect(hx, hy + 18, hw, hh - 34, '#DCE5DE', 'opacity="0.86"');
  for (let i = 1; i < 8; i++) body += rect(hx + (hw / 8) * i - 3, hy + 18, 6, hh - 34, '#2A2A27');
  body += rect(hx + hw * 0.62, hy + 18, hw * 0.2, hh - 34, '#23231F');
  body += rect(hx - 28, hy - 14, hw + 56, 34, '#23231F');
  body += rect(hx - 28, hy + 18, hw + 56, 6, '#000', 'opacity="0.3"');
  body += oak(W * 0.94, horizon - 80, 1.9, '#3A4532');
  return { defs, body };
}

function hills(r: () => number) {
  const defs =
    grad('sky', [[0, '#39281E'], [0.5, '#A96B3B'], [1, '#EFC78E']]) +
    radial('sun', [[0, '#FFE2B0', 0.9], [1, '#FFE2B0', 0]], W * 0.62, H * 0.54, W * 0.5);
  let body = rect(0, 0, W, H, 'url(#sky)');
  body += rect(0, 0, W, H, 'url(#sun)');
  body += `<circle cx="${W * 0.62}" cy="${H * 0.54}" r="58" fill="#FFEEC8"/>`;
  const bands = [
    [H * 0.56, '#7A5C42', 0.6],
    [H * 0.64, '#5A4633', 0.75],
    [H * 0.73, '#3C2F24', 0.9],
    [H * 0.84, '#241C16', 1],
  ] as const;
  bands.forEach(([y, c, o], i) => {
    let d = `M0,${y + 40} `;
    for (let x = 0; x <= W; x += 200) d += `Q${x + 100},${y - 30 - r() * 60 + i * 10} ${x + 200},${y + (r() - 0.5) * 30} `;
    d += `L${W},${H} L0,${H} Z`;
    body += `<path d="${d}" fill="${c}" opacity="${o}"/>`;
  });
  for (let i = 0; i < 5; i++) body += oak(160 + i * 330 + (r() - 0.5) * 80, H * 0.82 - r() * 30, 1.4 + r() * 0.5, '#171210');
  return { defs, body };
}

function city(r: () => number) {
  const horizon = H * 0.82;
  const defs =
    grad('sky', [[0, '#1B2532'], [0.56, '#6A5768'], [1, '#E8C79C']]) +
    grad('river', [[0, '#3A3A40'], [1, '#1A1B20']]);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += `<circle cx="${W * 0.2}" cy="${horizon - 120}" r="46" fill="#FFE6BC" opacity="0.9"/>`;
  // Two ranks of towers, the back one hazed out.
  for (const [alpha, base, spread] of [[0.45, horizon - 30, 150], [1, horizon, 0]] as const) {
    let x = -40;
    while (x < W + 40) {
      const w = 48 + r() * 88;
      const h = 120 + r() * (spread ? 300 : 460);
      const c = spread ? '#4B5663' : '#171C24';
      body += rect(x, base - h, w, h, c, `opacity="${alpha}"`);
      if (!spread) {
        for (let wy = base - h + 24; wy < base - 30; wy += 30) {
          for (let wx = x + 10; wx < x + w - 12; wx += 20) {
            if (r() > 0.55) body += rect(wx, wy, 8, 12, '#F3D59B', 'opacity="0.8"');
          }
        }
      }
      x += w + 8 + r() * 14;
    }
  }
  body += rect(0, horizon, W, H - horizon, 'url(#river)');
  body += specular(W * 0.2, horizon, H, '#F3D59B', r);
  return { defs, body };
}

function portrait(r: () => number) {
  const defs =
    grad('wall', [[0, '#D9CEBC'], [1, '#7E7364']]) +
    radial('key', [[0, '#FBF0DA', 0.85], [1, '#FBF0DA', 0]], W * 0.3, H * 0.24, W * 0.62);
  let body = rect(0, 0, W, H, 'url(#wall)');
  body += rect(0, 0, W, H, 'url(#key)');
  // Head and shoulders, unlit, with a rim of key light down one side.
  const cx = W * 0.5 + (r() - 0.5) * 60;
  const headY = H * 0.36;
  body += `<ellipse cx="${cx}" cy="${headY}" rx="132" ry="158" fill="#3B342B"/>`;
  body += `<path d="M${cx - 300},${H} Q${cx - 250},${H * 0.62} ${cx - 96},${H * 0.54} L${cx + 96},${H * 0.54} Q${cx + 250},${H * 0.62} ${cx + 300},${H} Z" fill="#332D26"/>`;
  body += `<ellipse cx="${cx - 96}" cy="${headY - 12}" rx="34" ry="150" fill="#F3E4C9" opacity="0.28"/>`;
  body += `<path d="M${cx - 230},${H} Q${cx - 196},${H * 0.66} ${cx - 92},${H * 0.57} L${cx - 62},${H * 0.57} Q${cx - 160},${H * 0.68} ${cx - 190},${H} Z" fill="#F3E4C9" opacity="0.16"/>`;
  return { defs, body };
}

/* -------------------------------------------------------------------------
   Registry
   ---------------------------------------------------------------------- */

const cache = new Map<string, string>();

export function renderScene(kind: SceneKind, seed: string): string {
  const key = `${kind}|${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const r = rng(key);
  const noise = Math.round(r() * 9999);
  let parts: { defs: string; body: string };

  switch (kind) {
    case 'coast-dusk':
      parts = coast(DUSK, r, true);
      break;
    case 'coast-day':
      parts = coast(DAY, r, true);
      break;
    case 'coast-night':
      parts = coast(NIGHT, r, true);
      break;
    case 'coastline':
      parts = coastline(r);
      break;
    case 'terrace':
      parts = terrace(r);
      break;
    case 'pool':
      parts = pool(r);
      break;
    case 'interior-living':
      parts = room({
        wall: '#EAE2D4', wallShade: '#C6BAA6', floor: '#9E7A4E', floorHi: '#C7A778',
        ceiling: '#DDD3C2', view: ['#BACAC9', '#7E9A9C'], light: '#FBEFD6',
        furniture: [
          { x: W * 0.08, y: H * 0.66, w: W * 0.2, h: 84, c: '#6B6153' },
          { x: W * 0.07, y: H * 0.74, w: W * 0.22, h: 22, c: '#524A3F' },
          { x: W * 0.74, y: H * 0.64, w: W * 0.16, h: 104, c: '#7A6F5F' },
          { x: W * 0.36, y: H * 0.78, w: W * 0.28, h: 14, c: '#8B7355' },
        ],
      });
      break;
    case 'interior-dining':
      parts = room({
        wall: '#E7DFD0', wallShade: '#C2B6A2', floor: '#94713F', floorHi: '#BE9C6B',
        ceiling: '#D8CEBD', view: ['#C6D2CE', '#8AA0A0'], light: '#FBEEd3',
        windowX: W * 0.26, windowW: W * 0.68, pendant: true,
        furniture: [
          { x: W * 0.28, y: H * 0.71, w: W * 0.44, h: 20, c: '#4E3F2C' },
          { x: W * 0.3, y: H * 0.73, w: 16, h: 96, c: '#4E3F2C' },
          { x: W * 0.69, y: H * 0.73, w: 16, h: 96, c: '#4E3F2C' },
        ],
      });
      break;
    case 'interior-kitchen':
      parts = room({
        wall: '#E4DCCE', wallShade: '#BEB3A0', floor: '#9A7C55', floorHi: '#C2A67C',
        ceiling: '#D6CCBB', view: ['#CBD6D2', '#93A6A4'], light: '#FBF0DA',
        windowX: W * 0.32, windowW: W * 0.56,
        furniture: [
          { x: W * 0.22, y: H * 0.68, w: W * 0.56, h: 26, c: '#D7CDBA' },
          { x: W * 0.24, y: H * 0.7, w: W * 0.52, h: 150, c: '#7E7466' },
          { x: W * 0.06, y: H * 0.5, w: W * 0.12, h: 220, c: '#8C8272' },
          { x: W * 0.84, y: H * 0.5, w: W * 0.12, h: 220, c: '#8C8272' },
        ],
      });
      break;
    case 'interior-bedroom':
      parts = room({
        wall: '#E9E1D3', wallShade: '#C8BCA8', floor: '#A0805A', floorHi: '#C8AA82',
        ceiling: '#DCD2C1', view: ['#C0CFD0', '#82999C'], light: '#FBEFD8',
        windowX: W * 0.42, windowW: W * 0.5,
        furniture: [
          { x: W * 0.06, y: H * 0.62, w: W * 0.34, h: 24, c: '#EFE9DC' },
          { x: W * 0.06, y: H * 0.65, w: W * 0.34, h: 130, c: '#B9AE9B' },
          { x: W * 0.04, y: H * 0.5, w: W * 0.03, h: 200, c: '#6E6454' },
        ],
      });
      break;
    case 'interior-bath':
      parts = room({
        wall: '#DED5C6', wallShade: '#B7AB98', floor: '#C3B49C', floorHi: '#DACDB6',
        ceiling: '#D2C8B7', view: ['#C8D4D0', '#8EA2A0'], light: '#FBF2DF',
        windowX: W * 0.5, windowW: W * 0.42,
        furniture: [
          { x: W * 0.12, y: H * 0.66, w: W * 0.26, h: 96, c: '#F2EEE6' },
          { x: W * 0.12, y: H * 0.76, w: W * 0.26, h: 16, c: '#C4B9A6' },
        ],
      });
      break;
    case 'stair':
      parts = stair(r);
      break;
    case 'joinery':
      parts = detail({ base: '#8A6B45', slat: '#A98455', gap: '#4A3A27', hardware: '#A9854F', light: '#FBEBCC' });
      break;
    case 'timber-detail':
      parts = detail({ base: '#1E1B18', slat: '#2C2723', gap: '#100E0C', hardware: '#6F7276', light: '#C9D3D8' });
      break;
    case 'alpine-house':
      parts = alpine(r, true);
      break;
    case 'alpine-land':
      parts = alpine(r, false);
      break;
    case 'alpine-interior':
      parts = room({
        wall: '#4A443E', wallShade: '#2C2823', floor: '#6B5943', floorHi: '#8A7458',
        ceiling: '#3A352F', view: ['#D3DCE1', '#94A5AF'], light: '#F6E7CC',
        windowX: W * 0.22, windowW: W * 0.7,
        furniture: [
          { x: W * 0.1, y: H * 0.7, w: W * 0.24, h: 90, c: '#6E6355' },
          { x: W * 0.72, y: H * 0.46, w: W * 0.16, h: 320, c: '#5A5750' },
          { x: W * 0.745, y: H * 0.64, w: W * 0.11, h: 90, c: '#E8A254' },
        ],
      });
      break;
    case 'villa':
      parts = villa(r);
      break;
    case 'villa-water':
      parts = water(r, true);
      break;
    case 'bay':
      parts = water(r, false);
      break;
    case 'pavilion':
      parts = pavilion(r);
      break;
    case 'pavilion-interior':
      parts = room({
        wall: '#D8D8CE', wallShade: '#AFAFA4', floor: '#8E8570', floorHi: '#B4AB93',
        ceiling: '#2B2B27', view: ['#C5D2C2', '#7E9077'], light: '#F4F0DC',
        windowX: W * 0.06, windowW: W * 0.88,
        furniture: [
          { x: W * 0.12, y: H * 0.7, w: W * 0.24, h: 80, c: '#6E6858' },
          { x: W * 0.62, y: H * 0.68, w: W * 0.26, h: 20, c: '#3E3A32' },
          { x: W * 0.64, y: H * 0.7, w: 14, h: 88, c: '#3E3A32' },
          { x: W * 0.85, y: H * 0.7, w: 14, h: 88, c: '#3E3A32' },
        ],
      });
      break;
    case 'hills':
      parts = hills(r);
      break;
    case 'city':
      parts = city(r);
      break;
    case 'portrait':
    default:
      parts = portrait(r);
      break;
  }

  const out = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(wrap(parts.defs, parts.body, noise))}`;
  cache.set(key, out);
  return out;
}

/* -------------------------------------------------------------------------
   The two scenes that did not fit a family
   ---------------------------------------------------------------------- */

function terrace(r: () => number) {
  const horizon = H * 0.5;
  const defs =
    grad('sky', [[0, '#3A2A1E'], [0.55, '#9E6B3E'], [1, '#EDC48D']]) +
    grad('sea', [[0, '#4A6069'], [1, '#26333A']]) +
    grad('stone', [[0, '#DCD3C2'], [1, '#A89B86']]) +
    radial('lamp', [[0, '#FFD9A0', 0.6], [1, '#FFD9A0', 0]], W * 0.5, H * 0.72, W * 0.5);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += `<circle cx="${W * (0.3 + r() * 0.4)}" cy="${horizon - 96}" r="62" fill="#FFE2B2"/>`;
  body += rect(0, horizon, W, H * 0.12, 'url(#sea)');
  body += rect(0, horizon + H * 0.12, W, H - horizon - H * 0.12, 'url(#stone)');
  // Paving, running to the edge.
  for (let i = 0; i < 9; i++) {
    const y = horizon + H * 0.12 + i * 52;
    body += rect(0, y, W, 3, '#00000018');
  }
  body += rect(0, horizon + H * 0.12, W, 10, '#8F8371');
  // The overhang that makes it a terrace, and its columns.
  body += rect(0, 0, W, H * 0.16, '#2E2A24');
  body += rect(0, H * 0.16, W, 8, '#00000044');
  body += rect(W * 0.12, H * 0.16, 30, H * 0.52, '#EFE9DE');
  body += rect(W * 0.84, H * 0.16, 30, H * 0.52, '#EFE9DE');
  body += rect(0, 0, W, H, 'url(#lamp)');
  // An outdoor hearth, low and wide.
  body += rect(W * 0.38, H * 0.7, W * 0.24, 76, '#B4A890');
  body += rect(W * 0.42, H * 0.665, W * 0.16, 40, '#E8A254', 'opacity="0.9"');
  return { defs, body };
}

function pool(r: () => number) {
  const horizon = H * 0.46;
  const defs =
    grad('sky', [[0, '#2B2118'], [0.55, '#96603A'], [1, '#EEC28D']]) +
    grad('sea', [[0, '#42565E'], [1, '#2A373E']]) +
    grad('pw', [[0, '#7FB6BE'], [1, '#356C7C']]) +
    radial('gl', [[0, '#FFD9A0', 0.7], [1, '#FFD9A0', 0]], W * 0.6, horizon - 70, W * 0.6);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += rect(0, 0, W, horizon, 'url(#gl)');
  body += `<circle cx="${W * (0.45 + r() * 0.3)}" cy="${horizon - 74}" r="58" fill="#FFE4B6"/>`;
  body += rect(0, horizon, W, H * 0.08, 'url(#sea)');
  // The infinity edge: a hairline of light where the pool meets the sea.
  body += rect(0, horizon + H * 0.08, W, 8, '#F3E2C4', 'opacity="0.7"');
  body += rect(0, horizon + H * 0.08 + 8, W, H * 0.34, 'url(#pw)');
  for (let i = 0; i < 18; i++) {
    const y = horizon + H * 0.1 + i * 20;
    body += rect((r() - 0.5) * 200 + W * 0.3, y, 200 + r() * 500, 3, '#FFFFFF', 'opacity="0.13"');
  }
  body += specular(W * 0.6, horizon + H * 0.1, H * 0.86, '#FFE4B6', r);
  // Coping and deck in the foreground.
  body += rect(0, H * 0.88, W, H * 0.12, '#D8CFBE');
  body += rect(0, H * 0.88, W, 10, '#EDE6D8');
  for (let i = 0; i < 2; i++) {
    const x = W * (0.12 + i * 0.62);
    body += rect(x, H * 0.9, 210, 16, '#B6A98F');
    body += poly(`${x},${H * 0.9} ${x + 70},${H * 0.9} ${x + 40},${H * 0.83} ${x - 10},${H * 0.83}`, '#C6BAA0');
  }
  return { defs, body };
}

function stair(r: () => number) {
  const defs =
    grad('wall', [[0, '#EDE6D9'], [1, '#B8AC98']]) +
    radial('sl', [[0, '#FFF3DC', 0.75], [1, '#FFF3DC', 0]], W * 0.74, H * 0.16, W * 0.7);
  let body = rect(0, 0, W, H, 'url(#wall)');
  body += rect(0, 0, W, H, 'url(#sl)');
  // Treads cantilevered from the plaster, each with its own shadow.
  const n = 9;
  for (let i = 0; i < n; i++) {
    const y = H * 0.16 + i * (H * 0.08);
    const x = W * 0.2 + i * (W * 0.055);
    const w = W * 0.3;
    body += rect(x + 12, y + 28, w, 22, '#000', 'opacity="0.22"');
    body += rect(x, y, w, 26, '#B98A52');
    body += rect(x, y, w, 7, '#D6A96C');
    body += poly(`${x},${y + 26} ${x + w},${y + 26} ${x + w - 14},${y + 40} ${x - 14},${y + 40}`, '#8E6738');
  }
  body += rect(0, H * 0.9, W, H * 0.1, '#A98455');
  body += rect(0, H * 0.9, W, 6, '#C79C63');
  void r;
  return { defs, body };
}
