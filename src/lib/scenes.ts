/* ============================================================================
   SCENE PLATES
   ----------------------------------------------------------------------------
   Drawn imagery, generated as SVG, for every frame in the site.

   This is what a frame shows when its photograph does not arrive: offline, a
   blocked CDN, a sandbox that refuses third-party images, a source you have not
   replaced yet. They are not grey boxes. Each one is composed for its subject,
   in the same light, so a frame that never loads still reads as part of the
   portfolio rather than as a fault.

   ART DIRECTION. Everything is shot at blue hour — the twenty minutes after
   sunset when the sky still holds colour and the windows have come on. It is
   the hour real estate photography is actually sold on, and it is the reason
   this site's dark interface and its imagery belong to each other.

   Drawn to a 1600 x 1100 field with the horizon near three-fifths and the
   subject on the centre line, so a plate survives being cropped to a tall
   portrait or a wide letterbox alike.
   ========================================================================= */

const W = 1600;
const H = 1100;

export type SceneKind =
  | 'exterior-twilight'
  | 'exterior-day'
  | 'exterior-modern'
  | 'exterior-night'
  | 'interior-living'
  | 'interior-kitchen'
  | 'interior-bedroom'
  | 'interior-bath'
  | 'interior-dining'
  | 'staircase'
  | 'detail'
  | 'pool'
  | 'terrace'
  | 'aerial-property'
  | 'aerial-neighborhood'
  | 'aerial-land'
  | 'aerial-water'
  | 'aerial-highway'
  | 'drone-flight'
  | 'video-frame'
  | 'walkthrough'
  | 'commercial-restaurant'
  | 'commercial-gym'
  | 'commercial-auto'
  | 'commercial-hotel'
  | 'commercial-retail'
  | 'commercial-event'
  | 'lifestyle'
  | 'gear'
  | 'portrait';

/* -------------------------------------------------------------------------
   Deterministic jitter. A plate is identical on every reload, but no two
   frames share a moon position, a skyline or a scatter of lit windows.
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

const n = (v: number) => v.toFixed(1);

const rect = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(Math.max(0, w))}" height="${n(Math.max(0, h))}" fill="${fill}" ${extra}/>`;

const poly = (points: string, fill: string, extra = '') =>
  `<polygon points="${points}" fill="${fill}" ${extra}/>`;

const circ = (cx: number, cy: number, r: number, fill: string, extra = '') =>
  `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}" ${extra}/>`;

const ell = (cx: number, cy: number, rx: number, ry: number, fill: string, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}" ${extra}/>`;

/* -------------------------------------------------------------------------
   Shared furniture
   ---------------------------------------------------------------------- */

/** The blue-hour sky every exterior is shot against. */
function twilightSky(id: string, warm = 0.55) {
  return grad(id, [
    [0, '#050A14'],
    [0.32, '#0C1D33'],
    [0.62, '#1B3E5C'],
    [0.84, warm > 0.4 ? '#4A6E85' : '#2A506E'],
    [1, warm > 0.4 ? '#C98A56' : '#5D7E92'],
  ]);
}

/** Warm interior light read through a run of glazing. */
function glazing(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  mullions = 4,
  mullionColor = '#0A121C',
) {
  let out = rect(x, y, w, h, fill);
  for (let i = 1; i < mullions; i++) {
    out += rect(x + (w / mullions) * i - 1.8, y, 3.6, h, mullionColor);
  }
  return out;
}

/** Scattered lit windows across a facade. */
function litWindows(
  x: number,
  y: number,
  w: number,
  h: number,
  cols: number,
  rows: number,
  r: () => number,
  lit = '#FFC57C',
  dark = '#16222F',
) {
  let out = '';
  const cw = w / cols;
  const ch = h / rows;
  for (let c = 0; c < cols; c++) {
    for (let rw = 0; rw < rows; rw++) {
      const on = r() > 0.42;
      out += rect(
        x + c * cw + cw * 0.18,
        y + rw * ch + ch * 0.2,
        cw * 0.64,
        ch * 0.6,
        on ? lit : dark,
        on ? `opacity="${(0.72 + r() * 0.28).toFixed(2)}"` : 'opacity="0.85"',
      );
    }
  }
  return out;
}

/** A soft halo. Used for lamps, the moon, and light spilling from a door. */
function halo(id: string, cx: number, cy: number, r: number, color: string, alpha = 0.55) {
  return {
    def: radial(id, [[0, color, alpha], [0.55, color, alpha * 0.28], [1, color, 0]], cx, cy, r),
    body: rect(0, 0, W, H, `url(#${id})`),
  };
}

const conifer = (x: number, y: number, s: number, c: string) =>
  poly(
    `${n(x)},${n(y)} ${n(x - 13 * s)},${n(y + 46 * s)} ${n(x - 5 * s)},${n(y + 44 * s)} ${n(x - 16 * s)},${n(y + 84 * s)} ${n(x + 16 * s)},${n(y + 84 * s)} ${n(x + 5 * s)},${n(y + 44 * s)} ${n(x + 13 * s)},${n(y + 46 * s)}`,
    c,
  );

const broadleaf = (x: number, y: number, s: number, c: string) =>
  ell(x, y, 44 * s, 32 * s, c) +
  ell(x - 30 * s, y + 10 * s, 28 * s, 20 * s, c) +
  ell(x + 28 * s, y + 12 * s, 26 * s, 19 * s, c) +
  rect(x - 3 * s, y + 20 * s, 6 * s, 34 * s, c);

/** Vertical light on water. */
function specular(cx: number, top: number, height: number, color: string, r: () => number) {
  let out = '';
  const bands = 16;
  for (let i = 0; i < bands; i++) {
    const t = i / bands;
    const y = top + t * height;
    const w = 26 + t * 190 + r() * 40;
    out += rect(cx - w / 2, y, w, 3 + r() * 4, color, `opacity="${(0.34 * (1 - t * 0.6)).toFixed(2)}"`);
  }
  return out;
}

/** A parked car, seen from the side. Small enough to be a silhouette. */
function car(x: number, y: number, s: number, body: string, glass: string, lamp?: string) {
  let out = poly(
    `${n(x)},${n(y)} ${n(x + 30 * s)},${n(y - 16 * s)} ${n(x + 78 * s)},${n(y - 17 * s)} ${n(x + 104 * s)},${n(y)}`,
    glass,
  );
  out += rect(x - 14 * s, y, 132 * s, 20 * s, body);
  out += circ(x + 16 * s, y + 20 * s, 9 * s, '#0A0F16');
  out += circ(x + 90 * s, y + 20 * s, 9 * s, '#0A0F16');
  if (lamp) out += rect(x + 112 * s, y + 4 * s, 8 * s, 6 * s, lamp);
  return out;
}

/** A standing figure, back-lit. Never a face — these are silhouettes. */
function figure(x: number, groundY: number, s: number, c: string) {
  return (
    circ(x, groundY - 74 * s, 11 * s, c) +
    poly(
      `${n(x - 13 * s)},${n(groundY - 62 * s)} ${n(x + 13 * s)},${n(groundY - 62 * s)} ${n(x + 10 * s)},${n(groundY - 20 * s)} ${n(x - 10 * s)},${n(groundY - 20 * s)}`,
      c,
    ) +
    rect(x - 10 * s, groundY - 22 * s, 8 * s, 22 * s, c) +
    rect(x + 2 * s, groundY - 22 * s, 8 * s, 22 * s, c)
  );
}

/* =========================================================================
   EXTERIORS
   ====================================================================== */

function exteriorTwilight(r: () => number) {
  const horizon = H * 0.6;
  const moon = halo('moonglow', W * 0.76, H * 0.16, W * 0.42, '#9FD4FF', 0.3);
  const spill = halo('spill', W * 0.45, H * 0.72, W * 0.5, '#FFB861', 0.28);
  const defs =
    twilightSky('sky') +
    grad('lawn', [[0, '#16301F'], [1, '#08150F']]) +
    grad('drive', [[0, '#252C38'], [1, '#131820']]) +
    moon.def +
    spill.def;

  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += circ(W * 0.76, H * 0.16, 30, '#EAF4FF', 'opacity="0.9"');
  body += moon.body;
  // A distant treeline holding the horizon.
  for (let i = 0; i < 26; i++) {
    const x = (i / 25) * W + (r() - 0.5) * 50;
    body += conifer(x, horizon - 78 - r() * 46, 0.78 + r() * 0.5, '#0A1A16');
  }
  body += rect(0, horizon, W, H - horizon, 'url(#lawn)');

  // The house: a low horizontal volume with a projecting glazed wing.
  const hy = H * 0.31;
  const hh = H * 0.29;
  body += rect(W * 0.1, hy, W * 0.56, hh, '#1A222D');
  body += rect(W * 0.1, hy - 12, W * 0.58, 16, '#232C38'); // roof fascia
  body += poly(
    `${n(W * 0.66)},${n(hy)} ${n(W * 0.78)},${n(hy + 26)} ${n(W * 0.78)},${n(hy + hh)} ${n(W * 0.66)},${n(hy + hh)}`,
    '#121922',
  );
  // The glazed wall — the whole reason to shoot at this hour.
  body += glazing(W * 0.14, hy + hh * 0.2, W * 0.32, hh * 0.56, '#FFC275', 7);
  body += glazing(W * 0.5, hy + hh * 0.26, W * 0.13, hh * 0.44, '#FFB861', 3);
  // Clerestory above.
  body += rect(W * 0.14, hy + 26, W * 0.48, 22, '#FFD9A3', 'opacity="0.72"');
  // Stone base and entry.
  body += rect(W * 0.1, hy + hh - 26, W * 0.56, 26, '#2B3440');
  body += rect(W * 0.47, hy + hh * 0.45, 46, hh * 0.55, '#FFE0B0', 'opacity="0.85"');
  body += spill.body;

  // Driveway running to the lower edge, and planting.
  body += poly(
    `${n(W * 0.34)},${n(hy + hh)} ${n(W * 0.52)},${n(hy + hh)} ${n(W * 0.74)},${n(H)} ${n(W * 0.16)},${n(H)}`,
    'url(#drive)',
  );
  for (let i = 0; i < 7; i++) {
    const x = W * (0.06 + i * 0.03);
    body += ell(x, hy + hh + 16, 26, 14, '#0D2018');
  }
  body += broadleaf(W * 0.84, hy + hh * 0.5, 1.5, '#0B1B15');
  body += broadleaf(W * 0.05, hy + hh * 0.72, 1.1, '#0C1D16');
  // Path lights, the detail that says someone lit this.
  for (let i = 0; i < 6; i++) {
    const x = W * (0.3 - i * 0.02) + i * 6;
    const y = hy + hh + 40 + i * 78;
    body += circ(x, y, 5, '#FFD08A');
    body += ell(x, y + 6, 26, 8, '#FFC275', 'opacity="0.14"');
  }
  return { defs, body };
}

function exteriorDay(r: () => number) {
  const horizon = H * 0.58;
  const defs =
    grad('sky', [[0, '#2E6C9E'], [0.55, '#6FA8CC'], [1, '#C6DDE9']]) +
    grad('lawn', [[0, '#2F5A38'], [1, '#1B3A24']]) +
    grad('drive', [[0, '#5A6270'], [1, '#3A4250']]) +
    radial('sun', [[0, '#FFF3D6', 0.45], [1, '#FFF3D6', 0]], W * 0.2, H * 0.1, W * 0.5);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  // Cloud banks, flat and wide.
  for (let i = 0; i < 5; i++) {
    const x = r() * W;
    const y = H * (0.08 + r() * 0.24);
    const s = 0.7 + r() * 0.9;
    body += ell(x, y, 150 * s, 26 * s, '#FFFFFF', 'opacity="0.5"');
    body += ell(x + 70 * s, y + 10 * s, 110 * s, 20 * s, '#FFFFFF', 'opacity="0.38"');
  }
  body += rect(0, 0, W, horizon, 'url(#sun)');
  for (let i = 0; i < 22; i++) {
    body += broadleaf((i / 21) * W + (r() - 0.5) * 40, horizon - 40 - r() * 30, 0.7 + r() * 0.4, '#24492C');
  }
  body += rect(0, horizon, W, H - horizon, 'url(#lawn)');
  const hy = H * 0.28;
  const hh = H * 0.32;
  body += rect(W * 0.12, hy, W * 0.5, hh, '#E4E1D8');
  body += poly(`${n(W * 0.08)},${n(hy)} ${n(W * 0.37)},${n(H * 0.16)} ${n(W * 0.66)},${n(hy)}`, '#3E4650');
  body += rect(W * 0.62, hy + hh * 0.2, W * 0.16, hh * 0.8, '#D6D2C7');
  body += poly(`${n(W * 0.6)},${n(hy + hh * 0.2)} ${n(W * 0.7)},${n(H * 0.24)} ${n(W * 0.8)},${n(hy + hh * 0.2)}`, '#39414A');
  for (let i = 0; i < 4; i++) {
    body += rect(W * (0.16 + i * 0.1), hy + hh * 0.22, W * 0.06, hh * 0.3, '#2C3C4A');
    body += rect(W * (0.16 + i * 0.1), hy + hh * 0.6, W * 0.06, hh * 0.26, '#2C3C4A');
  }
  body += rect(W * 0.35, hy + hh * 0.52, 52, hh * 0.48, '#6A4A32');
  body += poly(`${n(W * 0.3)},${n(hy + hh)} ${n(W * 0.48)},${n(hy + hh)} ${n(W * 0.66)},${n(H)} ${n(W * 0.2)},${n(H)}`, 'url(#drive)');
  return { defs, body };
}

function exteriorModern(r: () => number) {
  const horizon = H * 0.66;
  const spill = halo('spill', W * 0.5, H * 0.56, W * 0.6, '#FFB861', 0.24);
  const defs =
    twilightSky('sky', 0.3) +
    grad('deck', [[0, '#2A313C'], [1, '#141920']]) +
    grad('conc', [[0, '#39414D'], [1, '#232A34']]) +
    spill.def;
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  for (let i = 0; i < 40; i++) {
    body += circ(r() * W, r() * horizon * 0.62, r() * 1.5 + 0.5, '#DCEBFF', `opacity="${(0.3 + r() * 0.5).toFixed(2)}"`);
  }
  // Two stacked cantilevered boxes, offset. The whole language of the house.
  const upperY = H * 0.24;
  const lowerY = H * 0.44;
  body += rect(W * 0.2, lowerY, W * 0.62, H * 0.22, 'url(#conc)');
  body += glazing(W * 0.24, lowerY + 24, W * 0.5, H * 0.13, '#FFC275', 8);
  body += rect(W * 0.08, upperY, W * 0.56, H * 0.18, '#1D242E');
  body += glazing(W * 0.11, upperY + 20, W * 0.46, H * 0.11, '#FFD49A', 6);
  body += rect(W * 0.08, upperY - 10, W * 0.58, 12, '#2B3340');
  // The shadow line under the cantilever — what makes it read as floating.
  body += rect(W * 0.08, upperY + H * 0.18, W * 0.56, 14, '#080C12', 'opacity="0.8"');
  body += spill.body;
  body += rect(0, horizon, W, H - horizon, 'url(#deck)');
  for (let i = 0; i < 12; i++) body += rect(0, horizon + i * 40, W, 2, '#0A0E14', 'opacity="0.6"');
  body += conifer(W * 0.9, H * 0.3, 2.4, '#0A1A16');
  body += conifer(W * 0.96, H * 0.36, 1.8, '#091712');
  return { defs, body };
}

function exteriorNight(r: () => number) {
  const horizon = H * 0.68;
  const g = halo('g', W * 0.42, H * 0.54, W * 0.55, '#FFB861', 0.3);
  const defs =
    grad('sky', [[0, '#03060C'], [0.6, '#07101C'], [1, '#0E1E2E']]) +
    grad('ground', [[0, '#11161E'], [1, '#070A0F']]) +
    g.def;
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  for (let i = 0; i < 90; i++) {
    body += circ(r() * W, r() * horizon, r() * 1.6 + 0.4, '#CFE4FF', `opacity="${(0.25 + r() * 0.6).toFixed(2)}"`);
  }
  const hy = H * 0.36;
  const hh = H * 0.3;
  body += rect(W * 0.14, hy, W * 0.6, hh, '#0D131B');
  body += rect(W * 0.14, hy - 10, W * 0.62, 14, '#131A24');
  body += litWindows(W * 0.17, hy + 22, W * 0.54, hh * 0.6, 7, 2, r);
  body += rect(W * 0.42, hy + hh * 0.5, 50, hh * 0.5, '#FFDCA8', 'opacity="0.8"');
  body += g.body;
  body += rect(0, horizon, W, H - horizon, 'url(#ground)');
  body += ell(W * 0.44, horizon + 30, W * 0.3, 40, '#FFC275', 'opacity="0.08"');
  return { defs, body };
}

/* =========================================================================
   INTERIORS
   All shot the same way: a warm room against a blue window. That contrast
   is the entire craft of interior real estate photography.
   ====================================================================== */

function room(
  r: () => number,
  opts: {
    wall: [string, string];
    floor: [string, string];
    windowAt: number;
    warm: string;
  },
) {
  const defs =
    grad('wall', [[0, opts.wall[0]], [1, opts.wall[1]]]) +
    grad('floor', [[0, opts.floor[0]], [1, opts.floor[1]]]) +
    grad('win', [[0, '#1E4A6B'], [0.6, '#2F6A90'], [1, '#6E9AB4']]) +
    radial('lamp', [[0, opts.warm, 0.5], [1, opts.warm, 0]], W * 0.28, H * 0.42, W * 0.6);
  const floorY = H * 0.68;
  let body = rect(0, 0, W, floorY, 'url(#wall)');
  body += rect(0, floorY, W, H - floorY, 'url(#floor)');
  // Floorboards running to the vanishing point.
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    body += rect(0, floorY + t * t * (H - floorY), W, 2, '#00000033');
  }
  // The window, and the cool light it throws on the floor.
  const wx = W * opts.windowAt;
  body += rect(wx, H * 0.16, W * 0.26, H * 0.44, '#0C141C');
  body += glazing(wx + 10, H * 0.17, W * 0.26 - 20, H * 0.42, 'url(#win)', 3, '#0C141C');
  body += poly(
    `${n(wx)},${n(floorY)} ${n(wx + W * 0.26)},${n(floorY)} ${n(wx + W * 0.34)},${n(H)} ${n(wx - W * 0.1)},${n(H)}`,
    '#9FC6DC',
    'opacity="0.1"',
  );
  void r;
  return { defs, body, floorY };
}

function interiorLiving(r: () => number) {
  const base = room(r, { wall: ['#2A2A2C', '#17181B'], floor: ['#4A3A2C', '#241C15'], windowAt: 0.6, warm: '#FFB861' });
  let body = base.body;
  const fy = base.floorY;
  // Sofa, low and wide, parallel to the frame.
  body += rect(W * 0.08, fy - 108, W * 0.36, 78, '#3B3F46');
  body += rect(W * 0.08, fy - 132, W * 0.36, 30, '#464B53');
  body += rect(W * 0.08, fy - 30, W * 0.36, 16, '#2A2E34');
  for (let i = 0; i < 3; i++) body += rect(W * (0.11 + i * 0.11), fy - 126, 58, 44, '#565C66');
  // Coffee table and rug.
  body += ell(W * 0.3, fy + 34, W * 0.3, 50, '#1E1A16');
  body += rect(W * 0.2, fy - 34, W * 0.2, 12, '#7A5636');
  body += rect(W * 0.22, fy - 22, 8, 34, '#4E3722');
  body += rect(W * 0.37, fy - 22, 8, 34, '#4E3722');
  // A floor lamp, which is where the warm light comes from.
  body += rect(W * 0.5, fy - 250, 5, 250, '#2C2F35');
  body += poly(`${n(W * 0.47)},${n(fy - 250)} ${n(W * 0.54)},${n(fy - 250)} ${n(W * 0.555)},${n(fy - 300)} ${n(W * 0.455)},${n(fy - 300)}`, '#FFD9A5');
  body += rect(0, 0, W, H, 'url(#lamp)');
  // Art on the left wall, lit.
  body += rect(W * 0.12, H * 0.18, W * 0.14, H * 0.2, '#1A1C20');
  body += rect(W * 0.13, H * 0.19, W * 0.12, H * 0.18, '#3E4A58');
  return { defs: base.defs, body };
}

function interiorKitchen(r: () => number) {
  const base = room(r, { wall: ['#2E2F31', '#1A1B1E'], floor: ['#3E3B36', '#1F1D1B'], windowAt: 0.66, warm: '#FFC27A' });
  let body = base.body;
  const fy = base.floorY;
  // Run of cabinetry, worktop, splashback.
  body += rect(0, fy - 190, W * 0.62, 24, '#D8D2C6'); // worktop
  body += rect(0, fy - 166, W * 0.62, 166, '#22262C');
  for (let i = 0; i < 6; i++) body += rect(W * 0.02 + i * W * 0.1, fy - 158, W * 0.086, 150, '#2B3037');
  for (let i = 0; i < 6; i++) body += rect(W * 0.055 + i * W * 0.1, fy - 96, W * 0.02, 5, '#C8A465');
  body += rect(0, H * 0.24, W * 0.62, 12, '#171A1F');
  // Upper cabinets with a light strip under them.
  body += rect(0, H * 0.12, W * 0.4, H * 0.12, '#262B31');
  body += rect(0, H * 0.24 + 12, W * 0.4, 6, '#FFD9A5', 'opacity="0.75"');
  // Island with three pendants.
  body += rect(W * 0.16, fy - 24, W * 0.42, 22, '#E3DDD0');
  body += rect(W * 0.18, fy - 2, W * 0.38, 92, '#1B2026');
  for (let i = 0; i < 3; i++) {
    const x = W * (0.24 + i * 0.12);
    body += rect(x - 2, H * 0.12, 4, H * 0.26, '#2E333A');
    body += poly(`${n(x - 26)},${n(H * 0.38)} ${n(x + 26)},${n(H * 0.38)} ${n(x + 16)},${n(H * 0.32)} ${n(x - 16)},${n(H * 0.32)}`, '#C8A465');
    body += ell(x, H * 0.385, 24, 7, '#FFE0B0');
  }
  body += rect(0, 0, W, H, 'url(#lamp)');
  return { defs: base.defs, body };
}

function interiorBedroom(r: () => number) {
  const base = room(r, { wall: ['#2B2A2E', '#18171B'], floor: ['#453626', '#221A12'], windowAt: 0.62, warm: '#FFB870' });
  let body = base.body;
  const fy = base.floorY;
  body += rect(W * 0.1, fy - 96, W * 0.4, 96, '#EDE6D9'); // bed
  body += rect(W * 0.1, fy - 96, W * 0.4, 26, '#D8CFC0');
  body += rect(W * 0.08, fy - 230, W * 0.44, 140, '#2F343B'); // headboard
  for (let i = 0; i < 2; i++) body += rect(W * (0.14 + i * 0.16), fy - 132, W * 0.12, 42, '#FBF6EC');
  body += rect(W * 0.1, fy - 40, W * 0.4, 22, '#8A6A46'); // throw
  for (let i = 0; i < 2; i++) {
    const x = W * (0.055 + i * 0.44);
    body += rect(x, fy - 74, 66, 74, '#2A2F36');
    body += circ(x + 33, fy - 104, 18, '#FFD9A5');
  }
  body += rect(0, 0, W, H, 'url(#lamp)');
  return { defs: base.defs, body };
}

function interiorBath(r: () => number) {
  const base = room(r, { wall: ['#33343A', '#1D1E23'], floor: ['#3A3B41', '#1E1F24'], windowAt: 0.64, warm: '#FFCC8A' });
  let body = base.body;
  const fy = base.floorY;
  // Large-format tile, drawn as a grid rather than a texture.
  for (let i = 0; i < 6; i++) body += rect(W * 0.16 * i, 0, 2, fy, '#00000026');
  for (let i = 0; i < 5; i++) body += rect(0, H * 0.14 * i, W, 2, '#00000026');
  body += ell(W * 0.3, fy - 40, W * 0.15, 52, '#F2EEE6'); // freestanding tub
  body += rect(W * 0.15, fy - 42, W * 0.3, 44, '#F2EEE6');
  body += ell(W * 0.3, fy + 4, W * 0.15, 20, '#D9D3C8');
  body += rect(W * 0.2, fy - 130, 5, 92, '#C0C4CA'); // filler
  body += rect(W * 0.2, fy - 130, 44, 5, '#C0C4CA');
  body += rect(W * 0.58, H * 0.22, W * 0.3, H * 0.26, '#1A2028'); // mirror
  body += rect(W * 0.59, H * 0.23, W * 0.28, H * 0.24, '#33404E');
  body += rect(W * 0.58, H * 0.48, W * 0.3, 8, '#FFE3B5', 'opacity="0.8"');
  body += rect(0, 0, W, H, 'url(#lamp)');
  return { defs: base.defs, body };
}

function interiorDining(r: () => number) {
  const base = room(r, { wall: ['#2C2B2D', '#19181B'], floor: ['#4A3928', '#241B12'], windowAt: 0.58, warm: '#FFBE74' });
  let body = base.body;
  const fy = base.floorY;
  body += rect(W * 0.1, fy - 64, W * 0.46, 18, '#6B4A2E'); // table
  body += rect(W * 0.13, fy - 46, 12, 62, '#4A331F');
  body += rect(W * 0.51, fy - 46, 12, 62, '#4A331F');
  for (let i = 0; i < 4; i++) {
    const x = W * (0.13 + i * 0.12);
    body += rect(x, fy - 52, 46, 8, '#2F343B');
    body += rect(x + 2, fy - 122, 42, 72, '#353A42');
    body += rect(x + 4, fy - 44, 6, 44, '#262A31');
    body += rect(x + 36, fy - 44, 6, 44, '#262A31');
  }
  for (let i = 0; i < 3; i++) {
    const x = W * (0.18 + i * 0.14);
    body += rect(x - 2, H * 0.1, 4, H * 0.26, '#2E333A');
    body += circ(x, H * 0.37, 15, '#FFE0B0');
  }
  body += rect(0, 0, W, H, 'url(#lamp)');
  return { defs: base.defs, body };
}

function staircase(r: () => number) {
  const defs =
    grad('wall', [[0, '#2B2C30'], [1, '#141519']]) +
    radial('sl', [[0, '#FFE6BC', 0.42], [1, '#FFE6BC', 0]], W * 0.72, H * 0.14, W * 0.7);
  let body = rect(0, 0, W, H, 'url(#wall)');
  body += rect(0, 0, W, H, 'url(#sl)');
  const n2 = 9;
  for (let i = 0; i < n2; i++) {
    const y = H * 0.14 + i * (H * 0.082);
    const x = W * 0.18 + i * (W * 0.058);
    const w = W * 0.3;
    body += rect(x + 12, y + 28, w, 22, '#000', 'opacity="0.34"');
    body += rect(x, y, w, 26, '#6B4A2E');
    body += rect(x, y, w, 7, '#8E653E');
    body += poly(`${n(x)},${n(y + 26)} ${n(x + w)},${n(y + 26)} ${n(x + w - 14)},${n(y + 40)} ${n(x - 14)},${n(y + 40)}`, '#4A3320');
  }
  // A thin steel balustrade, which is what the shot is actually about.
  body += poly(`${n(W * 0.16)},${n(H * 0.08)} ${n(W * 0.18)},${n(H * 0.08)} ${n(W * 0.72)},${n(H * 0.82)} ${n(W * 0.7)},${n(H * 0.82)}`, '#8C919A');
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    body += rect(W * (0.17 + t * 0.54), H * (0.09 + t * 0.73), 2.4, H * 0.1, '#5A6068');
  }
  body += rect(0, H * 0.9, W, H * 0.1, '#5A4128');
  void r;
  return { defs, body };
}

function detail(r: () => number) {
  const defs =
    grad('bg', [[0, '#26282C'], [1, '#111316']]) +
    radial('gl', [[0, '#FFD9A5', 0.4], [1, '#FFD9A5', 0]], W * 0.68, H * 0.3, W * 0.55);
  let body = rect(0, 0, W, H, 'url(#bg)');
  // A run of oak joinery, raking light across it.
  for (let i = 0; i < 16; i++) {
    const x = (i / 16) * W;
    body += rect(x, 0, W / 16 - 4, H, i % 2 ? '#4E3A25' : '#5A4429');
    body += rect(x, 0, 3, H, '#2A1E12');
  }
  body += rect(0, H * 0.46, W, 10, '#1C140C');
  body += rect(0, H * 0.46, W, 3, '#C8A465'); // a bronze reveal
  body += rect(W * 0.3, H * 0.52, W * 0.12, 5, '#C8A465');
  body += rect(0, 0, W, H, 'url(#gl)');
  void r;
  return { defs, body };
}

function pool(r: () => number) {
  const horizon = H * 0.44;
  const defs =
    twilightSky('sky') +
    grad('pw', [[0, '#1C6E86'], [1, '#0B3244']]) +
    grad('deck', [[0, '#3A4049'], [1, '#1E2229']]) +
    radial('gl', [[0, '#7FE9FF', 0.28], [1, '#7FE9FF', 0]], W * 0.5, H * 0.62, W * 0.55);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += circ(W * (0.2 + r() * 0.2), horizon - 90, 26, '#EAF4FF', 'opacity="0.85"');
  for (let i = 0; i < 18; i++) body += conifer((i / 17) * W, horizon - 52 - r() * 30, 0.7, '#0A1A16');
  body += rect(0, horizon, W, H * 0.06, '#0F1A22');
  // Coping, then the water, lit from beneath.
  body += rect(0, horizon + H * 0.06, W, 10, '#4A5158');
  body += rect(0, horizon + H * 0.06 + 10, W, H * 0.32, 'url(#pw)');
  for (let i = 0; i < 16; i++) {
    const y = horizon + H * 0.1 + i * 22;
    body += rect((r() - 0.5) * 240 + W * 0.3, y, 200 + r() * 460, 3, '#BFF2FF', 'opacity="0.12"');
  }
  body += specular(W * 0.36, horizon + H * 0.1, H * 0.3, '#EAF4FF', r);
  body += rect(0, 0, W, H, 'url(#gl)');
  body += rect(0, H * 0.84, W, H * 0.16, 'url(#deck)');
  for (let i = 0; i < 2; i++) {
    const x = W * (0.12 + i * 0.6);
    body += rect(x, H * 0.86, 190, 14, '#3F464F');
    body += poly(`${n(x)},${n(H * 0.86)} ${n(x + 64)},${n(H * 0.86)} ${n(x + 38)},${n(H * 0.8)} ${n(x - 8)},${n(H * 0.8)}`, '#474E58');
  }
  return { defs, body };
}

function terrace(r: () => number) {
  const horizon = H * 0.56;
  const defs =
    twilightSky('sky') +
    grad('stone', [[0, '#3B414A'], [1, '#1D2127']]) +
    radial('fire', [[0, '#FF9A4D', 0.55], [1, '#FF9A4D', 0]], W * 0.5, H * 0.72, W * 0.42);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  for (let i = 0; i < 40; i++) body += circ(r() * W, r() * horizon * 0.6, r() * 1.4 + 0.4, '#DCEBFF', `opacity="${(0.3 + r() * 0.5).toFixed(2)}"`);
  for (let i = 0; i < 20; i++) body += conifer((i / 19) * W, horizon - 46 - r() * 26, 0.62, '#0A1A16');
  body += rect(0, horizon, W, H - horizon, 'url(#stone)');
  for (let i = 0; i < 8; i++) body += rect(0, horizon + i * 62, W, 2, '#00000038');
  // The soffit overhead — this is a covered terrace, and the frame says so.
  body += rect(0, 0, W, H * 0.14, '#12161C');
  body += rect(0, H * 0.14, W, 7, '#00000055');
  body += rect(W * 0.1, H * 0.14, 26, H * 0.44, '#232931');
  body += rect(W * 0.86, H * 0.14, 26, H * 0.44, '#232931');
  for (let i = 0; i < 4; i++) body += circ(W * (0.2 + i * 0.2), H * 0.14 + 16, 9, '#FFDCA8');
  // A low fire table.
  body += rect(W * 0.38, H * 0.72, W * 0.24, 66, '#2B3138');
  body += rect(W * 0.42, H * 0.69, W * 0.16, 34, '#FF9A4D', 'opacity="0.92"');
  body += rect(0, 0, W, H, 'url(#fire)');
  return { defs, body };
}

/* =========================================================================
   AERIAL — the drone work
   ====================================================================== */

function aerialProperty(r: () => number) {
  const defs =
    grad('land', [[0, '#1B3A24'], [1, '#0C1C12']]) +
    grad('roofg', [[0, '#3E454F'], [1, '#262C34']]) +
    radial('vig', [[0, '#000000', 0], [1, '#000000', 0.5]], W * 0.5, H * 0.5, W * 0.72);
  let body = rect(0, 0, W, H, 'url(#land)');
  // Ground texture: mown bands, which is what a lawn looks like from 200 feet.
  for (let i = 0; i < 22; i++) {
    body += rect(0, i * 52, W, 26, '#FFFFFF', `opacity="${(0.012 + r() * 0.016).toFixed(3)}"`);
  }
  // Tree canopies, seen from directly above, each with a shadow offset.
  for (let i = 0; i < 26; i++) {
    const x = r() * W;
    const y = r() * H;
    const s = 22 + r() * 34;
    body += ell(x + s * 0.3, y + s * 0.34, s, s * 0.9, '#050C08', 'opacity="0.55"');
    body += ell(x, y, s, s * 0.92, r() > 0.5 ? '#1E4229' : '#173420');
  }
  // The house: a roof plan, shot square. Shadow first.
  const rx = W * 0.3;
  const ry = H * 0.32;
  const rw = W * 0.4;
  const rh = H * 0.3;
  body += rect(rx + 26, ry + 30, rw, rh, '#050C08', 'opacity="0.55"');
  body += rect(rx, ry, rw, rh, 'url(#roofg)');
  body += rect(rx + rw * 0.55, ry - rh * 0.3, rw * 0.45, rh * 0.62, '#333A43');
  // Ridge lines and valleys.
  body += rect(rx, ry + rh * 0.5 - 3, rw, 6, '#1B2028');
  body += rect(rx + rw * 0.5 - 3, ry, 6, rh, '#1B2028');
  body += rect(rx + rw * 0.76, ry - rh * 0.3, 6, rh * 0.62, '#1B2028');
  body += rect(rx + rw * 0.2, ry + rh * 0.18, 26, 30, '#525A64'); // chimney
  // Pool, drive, and the parked car that gives it scale.
  body += rect(W * 0.14, H * 0.66, W * 0.16, H * 0.12, '#14607A');
  body += rect(W * 0.14, H * 0.66, W * 0.16, H * 0.12, '#7FE9FF', 'opacity="0.18"');
  body += rect(W * 0.13, H * 0.645, W * 0.18, H * 0.015, '#4A5158');
  body += poly(`${n(W * 0.44)},${n(ry + rh)} ${n(W * 0.58)},${n(ry + rh)} ${n(W * 0.66)},${n(H)} ${n(W * 0.38)},${n(H)}`, '#2E343C');
  body += rect(W * 0.47, H * 0.84, 46, 90, '#454C55');
  body += rect(0, 0, W, H, 'url(#vig)');
  return { defs, body };
}

function aerialNeighborhood(r: () => number) {
  const horizon = H * 0.22;
  const defs =
    twilightSky('sky', 0.6) +
    grad('land', [[0, '#16241C'], [1, '#0A120E']]) +
    radial('vig', [[0, '#000000', 0], [1, '#000000', 0.45]], W * 0.5, H * 0.56, W * 0.75);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += rect(0, horizon, W, H - horizon, 'url(#land)');
  // Streets in perspective, converging toward the horizon.
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const y = horizon + Math.pow(t, 1.7) * (H - horizon);
    body += rect(0, y, W, 6 + t * 16, '#2A3038');
  }
  for (let i = 0; i < 9; i++) {
    const x = (i / 8) * W;
    body += poly(`${n(W * 0.5 + (x - W * 0.5) * 0.28)},${n(horizon)} ${n(W * 0.5 + (x - W * 0.5) * 0.3)},${n(horizon)} ${n(x + 14)},${n(H)} ${n(x - 14)},${n(H)}`, '#252B33');
  }
  // Rooftops on both sides of each street, lit windows facing the camera.
  for (let i = 0; i < 46; i++) {
    const t = 0.1 + r() * 0.9;
    const y = horizon + Math.pow(t, 1.6) * (H - horizon);
    const s = 0.25 + t * 1.2;
    const x = r() * W;
    body += rect(x, y - 30 * s, 92 * s, 34 * s, '#050A08', 'opacity="0.5"');
    body += rect(x - 6 * s, y - 40 * s, 92 * s, 34 * s, r() > 0.5 ? '#39404A' : '#2F363F');
    if (r() > 0.4) body += rect(x + 8 * s, y - 30 * s, 20 * s, 12 * s, '#FFC275', 'opacity="0.7"');
  }
  // Streetlights.
  for (let i = 0; i < 24; i++) {
    const t = 0.15 + r() * 0.85;
    const y = horizon + Math.pow(t, 1.6) * (H - horizon);
    const x = r() * W;
    body += circ(x, y, 2 + t * 3, '#FFD08A', 'opacity="0.9"');
    body += circ(x, y, 10 + t * 20, '#FFC275', 'opacity="0.07"');
  }
  body += rect(0, 0, W, H, 'url(#vig)');
  return { defs, body };
}

function aerialLand(r: () => number) {
  const horizon = H * 0.2;
  const defs =
    twilightSky('sky', 0.7) +
    grad('field', [[0, '#26401F'], [1, '#0E1A11']]) +
    radial('vig', [[0, '#000000', 0], [1, '#000000', 0.42]], W * 0.5, H * 0.5, W * 0.76);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += rect(0, horizon, W, H - horizon, 'url(#field)');
  // Field boundaries as an irregular quilt.
  for (let i = 0; i < 9; i++) {
    const y = horizon + Math.pow(i / 8, 1.5) * (H - horizon);
    const hh2 = (H - horizon) * 0.14;
    body += rect(0, y, W, hh2, i % 2 ? '#22381D' : '#1A2E18', `opacity="${(0.5 + r() * 0.4).toFixed(2)}"`);
    body += rect(0, y, W, 2, '#0A120C');
  }
  for (let i = 0; i < 5; i++) {
    const x = r() * W;
    body += poly(`${n(x)},${n(horizon)} ${n(x + 30)},${n(horizon)} ${n(x + 120)},${n(H)} ${n(x - 60)},${n(H)}`, '#1E3320', 'opacity="0.5"');
  }
  // A treeline and a creek cutting diagonally.
  body += poly(`0,${n(H * 0.62)} ${n(W * 0.4)},${n(H * 0.52)} ${n(W)},${n(H * 0.74)} ${n(W)},${n(H * 0.8)} ${n(W * 0.4)},${n(H * 0.6)} 0,${n(H * 0.7)}`, '#2E5A6E', 'opacity="0.75"');
  for (let i = 0; i < 30; i++) {
    const x = r() * W;
    const y = H * (0.5 + r() * 0.48);
    body += ell(x, y, 16 + r() * 22, 14 + r() * 18, '#12240F');
  }
  body += rect(0, 0, W, H, 'url(#vig)');
  return { defs, body };
}

function aerialWater(r: () => number) {
  const horizon = H * 0.3;
  const defs =
    twilightSky('sky', 0.8) +
    grad('water', [[0, '#1B4F66'], [1, '#08202C']]) +
    grad('sand', [[0, '#C0A882'], [1, '#8A7658']]) +
    radial('vig', [[0, '#000000', 0], [1, '#000000', 0.44]], W * 0.5, H * 0.5, W * 0.78);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += circ(W * (0.3 + r() * 0.4), horizon - 60, 34, '#FFE4B6', 'opacity="0.9"');
  body += rect(0, horizon, W, H - horizon, 'url(#water)');
  body += specular(W * (0.3 + r() * 0.4), horizon, H * 0.7, '#FFE4B6', r);
  for (let i = 0; i < 40; i++) {
    body += rect(r() * W, horizon + r() * (H - horizon), 60 + r() * 220, 2.4, '#BFF2FF', `opacity="${(0.05 + r() * 0.1).toFixed(2)}"`);
  }
  // A shoreline sweeping in from the left, with a dock.
  body += poly(`0,${n(H * 0.52)} ${n(W * 0.44)},${n(H * 0.66)} ${n(W * 0.3)},${n(H)} 0,${n(H)}`, 'url(#sand)');
  body += poly(`0,${n(H * 0.5)} ${n(W * 0.42)},${n(H * 0.64)} ${n(W * 0.4)},${n(H * 0.6)} 0,${n(H * 0.46)}`, '#1C3A22');
  body += rect(W * 0.3, H * 0.72, W * 0.2, 14, '#5E4A33');
  for (let i = 0; i < 6; i++) body += rect(W * (0.32 + i * 0.032), H * 0.72, 7, 40, '#4A3A28');
  body += rect(0, 0, W, H, 'url(#vig)');
  return { defs, body };
}

function aerialHighway(r: () => number) {
  const horizon = H * 0.26;
  const defs =
    twilightSky('sky', 0.5) +
    grad('ground', [[0, '#1A2028'], [1, '#0A0E13']]) +
    radial('vig', [[0, '#000000', 0], [1, '#000000', 0.46]], W * 0.5, H * 0.5, W * 0.76);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  body += rect(0, horizon, W, H - horizon, 'url(#ground)');
  // A wide road sweeping through, with light trails on it.
  body += poly(`${n(W * 0.42)},${n(horizon)} ${n(W * 0.56)},${n(horizon)} ${n(W * 1.1)},${n(H)} ${n(W * 0.02)},${n(H)}`, '#242A33');
  body += poly(`${n(W * 0.48)},${n(horizon)} ${n(W * 0.5)},${n(horizon)} ${n(W * 0.62)},${n(H)} ${n(W * 0.48)},${n(H)}`, '#3A424C');
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const y = horizon + Math.pow(t, 1.7) * (H - horizon);
    const w = 6 + t * 26;
    body += rect(W * 0.49 + (t * t * W * 0.06), y, w, 10 + t * 30, '#C9D3DE', 'opacity="0.34"');
  }
  // Head and tail light streaks.
  for (let i = 0; i < 12; i++) {
    const t = 0.1 + r() * 0.9;
    const y = horizon + Math.pow(t, 1.7) * (H - horizon);
    const lane = r() > 0.5;
    body += rect(W * (lane ? 0.4 : 0.56) + (t * t * (lane ? -W * 0.3 : W * 0.34)), y, 60 + t * 200, 4 + t * 8, lane ? '#FFE7C2' : '#FF6B5A', `opacity="${(0.5 + r() * 0.4).toFixed(2)}"`);
  }
  for (let i = 0; i < 30; i++) {
    const x = r() * W;
    const y = H * (0.3 + r() * 0.7);
    body += ell(x, y, 18 + r() * 24, 16 + r() * 20, '#101E14');
  }
  body += rect(0, 0, W, H, 'url(#vig)');
  return { defs, body };
}

function droneFlight(r: () => number) {
  const horizon = H * 0.72;
  const defs =
    twilightSky('sky', 0.65) +
    grad('ground', [[0, '#132019'], [1, '#070C0A']]) +
    radial('nav', [[0, '#7FE9FF', 0.4], [1, '#7FE9FF', 0]], W * 0.46, H * 0.36, W * 0.34);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  for (let i = 0; i < 50; i++) body += circ(r() * W, r() * horizon * 0.6, r() * 1.4 + 0.4, '#DCEBFF', `opacity="${(0.25 + r() * 0.5).toFixed(2)}"`);
  for (let i = 0; i < 22; i++) body += conifer((i / 21) * W, horizon - 60 - r() * 40, 0.85 + r() * 0.4, '#081511');
  body += rect(0, horizon, W, H - horizon, 'url(#ground)');

  // The aircraft, in silhouette against the sky, seen slightly from below.
  const cx = W * 0.46;
  const cy = H * 0.36;
  body += rect(0, 0, W, H, 'url(#nav)');
  // Arms and rotors.
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const ax = cx + dx * 150;
    const ay = cy + dy * 52;
    body += poly(`${n(cx)},${n(cy)} ${n(ax)},${n(ay - 8)} ${n(ax)},${n(ay + 8)}`, '#0E141B');
    body += rect(ax - 12, ay - 12, 24, 24, '#161D26');
    body += ell(ax, ay - 14, 92, 9, '#9FD4FF', 'opacity="0.2"'); // blade blur
    body += ell(ax, ay - 14, 92, 3, '#CFE9FF', 'opacity="0.35"');
  }
  // Body and gimbal.
  body += ell(cx, cy, 96, 42, '#141B24');
  body += ell(cx, cy - 8, 84, 30, '#1C242F');
  body += circ(cx - 6, cy + 34, 26, '#0B1016');
  body += circ(cx - 6, cy + 34, 15, '#2B3B4A');
  body += circ(cx - 10, cy + 30, 5, '#BFF2FF', 'opacity="0.8"');
  // Navigation lights: one red, one green. Anyone who flies will notice.
  body += circ(cx - 148, cy + 52, 7, '#FF4D4D');
  body += circ(cx - 148, cy + 52, 18, '#FF4D4D', 'opacity="0.18"');
  body += circ(cx + 148, cy + 52, 7, '#4DFF9A');
  body += circ(cx + 148, cy + 52, 18, '#4DFF9A', 'opacity="0.18"');
  return { defs, body };
}

/* =========================================================================
   VIDEO
   ====================================================================== */

function videoFrame(r: () => number) {
  const horizon = H * 0.62;
  const defs =
    twilightSky('sky', 0.45) +
    grad('ground', [[0, '#1A2028'], [1, '#0A0E13']]) +
    radial('gl', [[0, '#FFB861', 0.3], [1, '#FFB861', 0]], W * 0.38, H * 0.5, W * 0.5);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  for (let i = 0; i < 30; i++) body += circ(r() * W, r() * horizon * 0.5, r() * 1.3 + 0.4, '#DCEBFF', `opacity="${(0.3 + r() * 0.4).toFixed(2)}"`);
  // A house read as a shape, deliberately soft — this is a frame from a film.
  body += rect(W * 0.18, H * 0.34, W * 0.5, H * 0.28, '#151C25');
  body += glazing(W * 0.22, H * 0.4, W * 0.34, H * 0.16, '#FFC275', 6);
  body += rect(W * 0.18, H * 0.32, W * 0.52, 14, '#1E2631');
  body += rect(0, 0, W, H, 'url(#gl)');
  body += rect(0, horizon, W, H - horizon, 'url(#ground)');
  for (let i = 0; i < 14; i++) body += rect(0, horizon + i * 34, W, 2, '#00000033');
  // Anamorphic letterbox and a flare. It should read as a frame, not a photo.
  body += rect(0, 0, W, H * 0.085, '#000');
  body += rect(0, H * 0.915, W, H * 0.085, '#000');
  body += rect(W * 0.1, H * 0.44, W * 0.7, 3, '#7FD4FF', 'opacity="0.42"');
  body += ell(W * 0.44, H * 0.445, 190, 22, '#7FD4FF', 'opacity="0.12"');
  return { defs, body };
}

function walkthrough(r: () => number) {
  const defs =
    grad('wall', [[0, '#2A2B2F'], [1, '#141519']]) +
    grad('floor', [[0, '#4A3928'], [1, '#221A12']]) +
    radial('far', [[0, '#FFD9A5', 0.44], [1, '#FFD9A5', 0]], W * 0.5, H * 0.44, W * 0.4);
  const floorY = H * 0.74;
  let body = rect(0, 0, W, floorY, 'url(#wall)');
  body += rect(0, floorY, W, H - floorY, 'url(#floor)');
  // A one-point-perspective hallway: the classic walkthrough opening frame.
  const vx = W * 0.5;
  const vy = H * 0.5;
  body += poly(`0,0 ${n(W * 0.28)},${n(H * 0.3)} ${n(W * 0.28)},${n(H * 0.7)} 0,${n(H)}`, '#1B1D21');
  body += poly(`${n(W)},0 ${n(W * 0.72)},${n(H * 0.3)} ${n(W * 0.72)},${n(H * 0.7)} ${n(W)},${n(H)}`, '#1B1D21');
  body += poly(`0,0 ${n(W)},0 ${n(W * 0.72)},${n(H * 0.3)} ${n(W * 0.28)},${n(H * 0.3)}`, '#101215');
  body += poly(`0,${n(H)} ${n(W)},${n(H)} ${n(W * 0.72)},${n(H * 0.7)} ${n(W * 0.28)},${n(H * 0.7)}`, '#2E2318');
  // Doorways down the left wall.
  for (let i = 0; i < 3; i++) {
    const t = 0.18 + i * 0.22;
    const x1 = vx - (vx - 0) * (1 - t);
    const w = (vx - x1) * 0.3;
    body += rect(x1, vy - (vy - H * 0.3) * (1 - t) * 0.9, w, H * 0.3 * (1 - t) + H * 0.1, '#0C0E11');
  }
  // The lit room at the end, which is what pulls the eye through.
  body += rect(W * 0.4, H * 0.38, W * 0.2, H * 0.28, '#FFC275', 'opacity="0.85"');
  body += rect(0, 0, W, H, 'url(#far)');
  void r;
  return { defs, body };
}

/* =========================================================================
   COMMERCIAL
   ====================================================================== */

function commercialRestaurant(r: () => number) {
  const defs =
    grad('bg', [[0, '#221A16'], [1, '#0E0A08']]) +
    radial('warm', [[0, '#FFB05A', 0.5], [1, '#FFB05A', 0]], W * 0.5, H * 0.46, W * 0.6);
  let body = rect(0, 0, W, H, 'url(#bg)');
  // Bar back: bottles on lit shelves.
  body += rect(0, H * 0.1, W, H * 0.44, '#1A1310');
  for (let s = 0; s < 3; s++) {
    const y = H * (0.16 + s * 0.13);
    body += rect(W * 0.06, y + 54, W * 0.88, 7, '#3A2A1E');
    body += rect(W * 0.06, y + 50, W * 0.88, 4, '#FFC98A', 'opacity="0.55"');
    for (let i = 0; i < 22; i++) {
      const x = W * 0.08 + i * W * 0.04 + r() * 8;
      const hgt = 30 + r() * 24;
      body += rect(x, y + 54 - hgt, 13, hgt, ['#6B4A2E', '#2E4A3A', '#4A2E3A', '#3A3A2E'][Math.floor(r() * 4)]);
      body += rect(x + 4, y + 54 - hgt - 12, 5, 12, '#2A2018');
    }
  }
  // Counter, glassware, and two guests in silhouette.
  body += rect(0, H * 0.62, W, 26, '#5A3E28');
  body += rect(0, H * 0.62, W, 7, '#8A6440');
  body += rect(0, H * 0.648, W, H * 0.352, '#140E0A');
  for (let i = 0; i < 5; i++) {
    const x = W * (0.12 + i * 0.19);
    body += poly(`${n(x - 15)},${n(H * 0.62)} ${n(x + 15)},${n(H * 0.62)} ${n(x + 8)},${n(H * 0.55)} ${n(x - 8)},${n(H * 0.55)}`, '#C8D8E0', 'opacity="0.42"');
    body += rect(x - 2, H * 0.55, 4, -26, '#C8D8E0', 'opacity="0.3"');
  }
  body += rect(0, 0, W, H, 'url(#warm)');
  body += figure(W * 0.2, H * 0.62, 1.5, '#0A0706');
  body += figure(W * 0.78, H * 0.62, 1.4, '#0A0706');
  return { defs, body };
}

function commercialGym(r: () => number) {
  const defs =
    grad('bg', [[0, '#12161C'], [1, '#05070A']]) +
    grad('floor', [[0, '#1E242C'], [1, '#0A0D11']]) +
    radial('rim', [[0, '#3EC8FF', 0.3], [1, '#3EC8FF', 0]], W * 0.7, H * 0.3, W * 0.5);
  const floorY = H * 0.72;
  let body = rect(0, 0, W, floorY, 'url(#bg)');
  body += rect(0, floorY, W, H - floorY, 'url(#floor)');
  for (let i = 0; i < 10; i++) body += rect(0, floorY + i * 34, W, 2, '#00000044');
  // A rack of weights along the back wall.
  body += rect(W * 0.04, H * 0.3, W * 0.42, 14, '#262E38');
  body += rect(W * 0.04, H * 0.5, W * 0.42, 14, '#262E38');
  for (let i = 0; i < 7; i++) {
    const x = W * (0.07 + i * 0.056);
    body += circ(x, H * 0.27, 20 - i * 1.2, '#1A2028');
    body += circ(x, H * 0.27, 13 - i, '#3EC8FF', 'opacity="0.28"');
    body += circ(x, H * 0.47, 20 - i * 1.2, '#1A2028');
  }
  // Uprights of a rig, and a barbell on the floor.
  for (let i = 0; i < 3; i++) body += rect(W * (0.54 + i * 0.16), H * 0.1, 22, floorY - H * 0.1, '#1C242D');
  body += rect(W * 0.54, H * 0.2, W * 0.34, 10, '#2A333E');
  body += rect(W * 0.3, floorY - 16, W * 0.4, 9, '#8B939D');
  for (const x of [W * 0.34, W * 0.66]) {
    body += circ(x, floorY - 12, 40, '#141A21');
    body += circ(x, floorY - 12, 40, '#3EC8FF', 'opacity="0.12"');
  }
  body += rect(0, 0, W, H, 'url(#rim)');
  body += figure(W * 0.72, floorY, 2.4, '#070A0E');
  void r;
  return { defs, body };
}

function commercialAuto(r: () => number) {
  const defs =
    grad('bg', [[0, '#0B0F15'], [1, '#04070A']]) +
    grad('floor', [[0, '#181E26'], [1, '#080B0F']]) +
    radial('spot', [[0, '#DCEBFF', 0.28], [1, '#DCEBFF', 0]], W * 0.5, H * 0.3, W * 0.55);
  const floorY = H * 0.66;
  let body = rect(0, 0, W, floorY, 'url(#bg)');
  body += rect(0, floorY, W, H - floorY, 'url(#floor)');
  // Polished-floor reflection under the car.
  body += ell(W * 0.5, floorY + 90, W * 0.34, 60, '#BFD8F0', 'opacity="0.07"');
  body += rect(0, 0, W, H, 'url(#spot)');
  // Overhead strip lights, receding.
  for (let i = 0; i < 4; i++) {
    const y = H * (0.06 + i * 0.05);
    const inset = i * W * 0.06;
    body += rect(inset, y, W - inset * 2, 7, '#CFE4FF', `opacity="${(0.5 - i * 0.1).toFixed(2)}"`);
  }
  body += car(W * 0.26, floorY - 4, 4.4, '#1C2630', '#2E4256', '#FFE7C2');
  body += rect(0, 0, W, H, 'url(#spot)');
  void r;
  return { defs, body };
}

function commercialHotel(r: () => number) {
  const horizon = H * 0.64;
  const g = halo('g', W * 0.5, H * 0.56, W * 0.5, '#FFB861', 0.3);
  const defs = twilightSky('sky', 0.4) + grad('ground', [[0, '#1A2028'], [1, '#0A0E13']]) + g.def;
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  for (let i = 0; i < 40; i++) body += circ(r() * W, r() * horizon * 0.5, r() * 1.4 + 0.4, '#DCEBFF', `opacity="${(0.3 + r() * 0.4).toFixed(2)}"`);
  // A tower, softly lit, with a lit portico across the base.
  body += rect(W * 0.28, H * 0.08, W * 0.44, horizon - H * 0.08, '#141B24');
  body += litWindows(W * 0.3, H * 0.12, W * 0.4, horizon - H * 0.2, 8, 9, r);
  body += rect(W * 0.26, H * 0.06, W * 0.48, 16, '#1E2631');
  body += rect(W * 0.2, horizon - H * 0.1, W * 0.6, H * 0.1, '#1A222C');
  body += rect(W * 0.2, horizon - H * 0.1, W * 0.6, 8, '#FFD9A5', 'opacity="0.65"');
  for (let i = 0; i < 6; i++) body += rect(W * (0.23 + i * 0.1), horizon - H * 0.09, 18, H * 0.09, '#232B36');
  body += g.body;
  body += rect(0, horizon, W, H - horizon, 'url(#ground)');
  body += car(W * 0.56, horizon + 70, 2.8, '#1A222C', '#2E4256', '#FFE7C2');
  body += figure(W * 0.36, horizon + 66, 1.6, '#080C10');
  return { defs, body };
}

function commercialRetail(r: () => number) {
  const defs =
    grad('bg', [[0, '#1A1E24'], [1, '#0A0D11']]) +
    grad('floor', [[0, '#252B33'], [1, '#101419']]) +
    radial('warm', [[0, '#FFD9A5', 0.32], [1, '#FFD9A5', 0]], W * 0.5, H * 0.34, W * 0.6);
  const floorY = H * 0.74;
  let body = rect(0, 0, W, floorY, 'url(#bg)');
  body += rect(0, floorY, W, H - floorY, 'url(#floor)');
  // Rails of stock along both walls, lit from a track above.
  for (const side of [0, 1]) {
    const x = side ? W * 0.62 : W * 0.06;
    body += rect(x, H * 0.3, W * 0.32, 8, '#3A424C');
    for (let i = 0; i < 12; i++) {
      const gx = x + 10 + i * (W * 0.32 / 12);
      body += rect(gx, H * 0.3, 18, H * 0.26, ['#3E4A58', '#4A4038', '#38443E', '#4A3A44'][Math.floor(r() * 4)]);
      body += rect(gx + 6, H * 0.29, 6, 14, '#5A626C');
    }
  }
  body += rect(0, H * 0.06, W, 10, '#1E242C');
  for (let i = 0; i < 7; i++) {
    const x = W * (0.08 + i * 0.14);
    body += rect(x - 6, H * 0.07, 12, 16, '#39414B');
    body += ell(x, H * 0.09, 14, 5, '#FFE3B5');
    body += poly(`${n(x - 14)},${n(H * 0.09)} ${n(x + 14)},${n(H * 0.09)} ${n(x + 70)},${n(floorY)} ${n(x - 70)},${n(floorY)}`, '#FFD9A5', 'opacity="0.05"');
  }
  // A central table with folded stock.
  body += rect(W * 0.38, H * 0.6, W * 0.24, 12, '#6B4A2E');
  body += rect(W * 0.4, H * 0.612, 12, H * 0.13, '#4A3320');
  body += rect(W * 0.58, H * 0.612, 12, H * 0.13, '#4A3320');
  for (let i = 0; i < 3; i++) body += rect(W * (0.4 + i * 0.07), H * 0.56, W * 0.06, H * 0.04, '#59626E');
  body += rect(0, 0, W, H, 'url(#warm)');
  return { defs, body };
}

function commercialEvent(r: () => number) {
  const defs =
    grad('bg', [[0, '#0A0D14'], [1, '#04060A']]) +
    radial('stage', [[0, '#3EC8FF', 0.34], [1, '#3EC8FF', 0]], W * 0.5, H * 0.42, W * 0.5) +
    radial('warm', [[0, '#B06BFF', 0.24], [1, '#B06BFF', 0]], W * 0.2, H * 0.3, W * 0.45);
  const floorY = H * 0.78;
  let body = rect(0, 0, W, H, 'url(#bg)');
  // Beams from a lighting rig, which is the whole look of an event frame.
  for (let i = 0; i < 7; i++) {
    const x = W * (0.1 + i * 0.13);
    body += poly(`${n(x - 10)},${n(H * 0.04)} ${n(x + 10)},${n(H * 0.04)} ${n(x + 130)},${n(floorY)} ${n(x - 130)},${n(floorY)}`, i % 2 ? '#3EC8FF' : '#B06BFF', 'opacity="0.09"');
    body += rect(x - 14, H * 0.02, 28, 20, '#1A212B');
  }
  body += rect(0, 0, W, H, 'url(#warm)');
  body += rect(0, 0, W, H, 'url(#stage)');
  // The stage, and a crowd in front of it.
  body += rect(W * 0.2, H * 0.52, W * 0.6, H * 0.2, '#0E1420');
  body += rect(W * 0.2, H * 0.52, W * 0.6, 8, '#3EC8FF', 'opacity="0.5"');
  body += figure(W * 0.5, H * 0.72, 2.2, '#050810');
  body += rect(0, floorY, W, H - floorY, '#05070C');
  for (let i = 0; i < 30; i++) {
    body += figure(r() * W, floorY + 40 + r() * 60, 1 + r() * 0.7, '#070B12');
  }
  // Phone screens in the crowd. Nobody draws these, and everybody has seen them.
  for (let i = 0; i < 7; i++) body += rect(r() * W, floorY + 10 + r() * 40, 7, 12, '#9FD4FF', 'opacity="0.55"');
  return { defs, body };
}

/* =========================================================================
   PEOPLE AND KIT
   ====================================================================== */

function lifestyle(r: () => number) {
  const horizon = H * 0.66;
  const defs =
    twilightSky('sky', 0.7) +
    grad('ground', [[0, '#1C2620'], [1, '#0A0F0C']]) +
    radial('rim', [[0, '#FFC275', 0.34], [1, '#FFC275', 0]], W * 0.66, H * 0.42, W * 0.44);
  let body = rect(0, 0, W, horizon, 'url(#sky)');
  for (let i = 0; i < 18; i++) body += broadleaf((i / 17) * W, horizon - 50 - r() * 40, 0.8 + r() * 0.5, '#0C1B13');
  body += rect(0, horizon, W, H - horizon, 'url(#ground)');
  body += rect(0, 0, W, H, 'url(#rim)');
  // Two figures on a terrace, back-lit. A lifestyle frame, not a portrait.
  body += rect(W * 0.06, horizon - 10, W * 0.88, 16, '#2A3139');
  body += figure(W * 0.42, horizon, 3.2, '#0A0F14');
  body += figure(W * 0.58, horizon, 3.0, '#0A0F14');
  body += ell(W * 0.5, horizon + 26, W * 0.2, 22, '#000', 'opacity="0.4"');
  return { defs, body };
}

function gear(r: () => number) {
  const defs =
    grad('bg', [[0, '#181C22'], [1, '#080A0E']]) +
    radial('key', [[0, '#9FD4FF', 0.26], [1, '#9FD4FF', 0]], W * 0.34, H * 0.28, W * 0.5) +
    radial('fill', [[0, '#FFB861', 0.18], [1, '#FFB861', 0]], W * 0.78, H * 0.7, W * 0.44);
  let body = rect(0, 0, W, H, 'url(#bg)');
  body += rect(0, 0, W, H, 'url(#key)');
  body += rect(0, 0, W, H, 'url(#fill)');
  const cy = H * 0.52;
  // A camera body in three-quarter view, with a fast prime on the front.
  body += ell(W * 0.5, cy + 150, W * 0.3, 36, '#000', 'opacity="0.45"');
  body += rect(W * 0.3, cy - 90, W * 0.26, 170, '#14191F');
  body += rect(W * 0.3, cy - 112, W * 0.14, 24, '#1B222A'); // prism
  body += rect(W * 0.32, cy - 74, W * 0.09, 44, '#222A33'); // grip
  body += circ(W * 0.62, cy - 6, 104, '#101519'); // lens barrel
  body += circ(W * 0.62, cy - 6, 104, '#3A444F', 'opacity="0.5"');
  body += circ(W * 0.62, cy - 6, 84, '#0A0D11');
  body += circ(W * 0.62, cy - 6, 62, '#141C26');
  body += circ(W * 0.615, cy - 14, 40, '#2E5C7A', 'opacity="0.75"'); // coating
  body += circ(W * 0.6, cy - 24, 16, '#BFF2FF', 'opacity="0.5"'); // specular
  for (let i = 0; i < 3; i++) body += circ(W * 0.62, cy - 6, 104 - i * 14, '#000', 'opacity="0.0"') + rect(W * 0.52 + i * 24, cy - 112, 5, 22, '#39424D');
  // Focus and aperture rings, knurled.
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    body += circ(W * 0.62 + Math.cos(a) * 96, cy - 6 + Math.sin(a) * 96, 3.4, '#4A555F');
  }
  body += rect(W * 0.31, cy - 118, W * 0.08, 6, '#C8A465'); // a hot-shoe detail
  void r;
  return { defs, body };
}

function portrait(r: () => number) {
  const defs =
    grad('bg', [[0, '#212833'], [1, '#080B10']]) +
    radial('key', [[0, '#FFD9A5', 0.26], [1, '#FFD9A5', 0]], W * 0.3, H * 0.18, W * 0.56) +
    radial('rim', [[0, '#7FD4FF', 0.3], [1, '#7FD4FF', 0]], W * 0.78, H * 0.42, W * 0.34);
  let body = rect(0, 0, W, H, 'url(#bg)');
  body += rect(0, 0, W, H, 'url(#key)');

  // A head-and-shoulders silhouette, deliberately featureless: this is a plate
  // standing in for a photograph of a real person, and a drawn face would be
  // considerably worse than no face at all.
  const cx = W * 0.5;
  const neck = H * 0.62;
  const shoulderY = H * 0.78;

  // Shoulders: one smooth curve down to the frame edge, not a zigzag collar.
  body +=
    `<path d="M ${n(cx - 430)} ${n(H)} ` +
    `C ${n(cx - 400)} ${n(shoulderY)}, ${n(cx - 190)} ${n(neck + 6)}, ${n(cx - 96)} ${n(neck - 20)} ` +
    `L ${n(cx + 96)} ${n(neck - 20)} ` +
    `C ${n(cx + 190)} ${n(neck + 6)}, ${n(cx + 400)} ${n(shoulderY)}, ${n(cx + 430)} ${n(H)} Z" ` +
    `fill="#151B24"/>`;

  // A collar, as two simple lapels, so it reads as a person in a shirt.
  body +=
    poly(
      `${n(cx - 92)},${n(neck - 16)} ${n(cx - 16)},${n(neck - 10)} ${n(cx - 34)},${n(neck + 92)} ${n(cx - 104)},${n(neck + 30)}`,
      '#1E262F',
    ) +
    poly(
      `${n(cx + 92)},${n(neck - 16)} ${n(cx + 16)},${n(neck - 10)} ${n(cx + 34)},${n(neck + 92)} ${n(cx + 104)},${n(neck + 30)}`,
      '#1E262F',
    );

  // Neck, then head.
  body += rect(cx - 52, neck - 120, 104, 130, '#1A212B');
  body += ell(cx, H * 0.36, 132, 166, '#1C242E');
  // The lit side, offset toward the key light.
  body += ell(cx - 26, H * 0.345, 106, 140, '#252E39');
  // Rim light down the far edge — the one cue that makes it read as lit.
  body += rect(0, 0, W, H, 'url(#rim)');
  body +=
    `<path d="M ${n(cx + 104)} ${n(H * 0.26)} C ${n(cx + 136)} ${n(H * 0.32)}, ${n(cx + 136)} ${n(H * 0.44)}, ${n(cx + 96)} ${n(H * 0.5)}" ` +
    `stroke="#7FD4FF" stroke-opacity="0.3" stroke-width="7" fill="none"/>`;
  // Hair mass, as one soft shape.
  body += `<path d="M ${n(cx - 128)} ${n(H * 0.33)} C ${n(cx - 120)} ${n(H * 0.21)}, ${n(cx + 120)} ${n(H * 0.21)}, ${n(cx + 128)} ${n(H * 0.33)} C ${n(cx + 96)} ${n(H * 0.26)}, ${n(cx - 96)} ${n(H * 0.26)}, ${n(cx - 128)} ${n(H * 0.33)} Z" fill="#141A22"/>`;
  void r;
  return { defs, body };
}

/* -------------------------------------------------------------------------
   Registry
   ---------------------------------------------------------------------- */

type Painter = (r: () => number) => { defs: string; body: string };

const PAINTERS: Record<SceneKind, Painter> = {
  'exterior-twilight': exteriorTwilight,
  'exterior-day': exteriorDay,
  'exterior-modern': exteriorModern,
  'exterior-night': exteriorNight,
  'interior-living': interiorLiving,
  'interior-kitchen': interiorKitchen,
  'interior-bedroom': interiorBedroom,
  'interior-bath': interiorBath,
  'interior-dining': interiorDining,
  staircase,
  detail,
  pool,
  terrace,
  'aerial-property': aerialProperty,
  'aerial-neighborhood': aerialNeighborhood,
  'aerial-land': aerialLand,
  'aerial-water': aerialWater,
  'aerial-highway': aerialHighway,
  'drone-flight': droneFlight,
  'video-frame': videoFrame,
  walkthrough,
  'commercial-restaurant': commercialRestaurant,
  'commercial-gym': commercialGym,
  'commercial-auto': commercialAuto,
  'commercial-hotel': commercialHotel,
  'commercial-retail': commercialRetail,
  'commercial-event': commercialEvent,
  lifestyle,
  gear,
  portrait,
};

const cache = new Map<string, string>();

/**
 * A finished plate as a data URL, ready for an <img src>.
 * Cached, because the same frame is drawn on every mount otherwise.
 */
export function renderScene(kind: SceneKind, seed: string): string {
  const key = `${kind}|${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const r = rng(key);
  const painter = PAINTERS[kind] ?? exteriorTwilight;
  const { defs, body } = painter(r);

  // A held grain wash over everything, so a plate never looks like flat vector.
  const finish =
    radial('plate-vig', [[0, '#000000', 0], [1, '#000000', 0.34]], W * 0.5, H * 0.46, W * 0.8) +
    `<filter id="plate-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
    `<defs>${defs}${finish}</defs>` +
    body +
    rect(0, 0, W, H, 'url(#plate-vig)') +
    `<rect width="${W}" height="${H}" filter="url(#plate-grain)" opacity="0.055"/>` +
    '</svg>';

  // encodeURIComponent, not base64: it survives every character we emit and
  // keeps the markup readable in devtools.
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  cache.set(key, url);
  return url;
}

export const ALL_SCENES = Object.keys(PAINTERS) as SceneKind[];
