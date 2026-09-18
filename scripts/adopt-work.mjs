#!/usr/bin/env node
/**
 * Takes the originals sitting in `masters/` and puts them on the site.
 *
 *   npm run adopt            # say what would happen, change nothing
 *   npm run adopt -- --write # do it
 *
 * For every file in `masters/` whose name is in the table below, this:
 *
 *   1. re-encodes it into the five widths the site serves (via optimise-work),
 *   2. points the matching entry in `src/data/images.ts` at the result,
 *   3. writes alt text describing that actual photograph.
 *
 * Step 3 is the reason this table exists rather than a filename convention.
 * Alt text is read aloud to people who cannot see the picture, and a line that
 * describes the drawing it replaced is worse than no line at all — so each
 * entry here carries wording written from the photograph itself.
 *
 * To add your own: put the file in `masters/`, add a row, run the command.
 */

import { readdir } from 'node:fs/promises';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, extname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');

/** filename (without extension, lowercased) → where it goes and what it shows. */
const ADOPT = {
  /* — The first batch: five frames, four of them screenshots — */
  'dsc00078': {
    key: 'reTerrace',
    slug: 'covered-terrace',
    alt: 'The back of a white painted brick house on a bright day, seen across a long rectangular pool with pale stone coping, folded parasols and loungers on the lawn either side, and a covered terrace with seating under the eaves.',
    tone: 'daylight',
    focus: '50% 45%',
  },
  'zrzut ekranu 2026-09-16 163432': {
    key: 'reDining',
    slug: 'dining-room',
    alt: 'A dining room with charcoal walls and ceiling, a dark oval table set for eight in pale upholstered chairs, a cluster of amber glass globe pendants overhead, and an arched glass-fronted cabinet to the left, open through to a lit kitchen beyond.',
    tone: 'interior',
    focus: '50% 50%',
  },
  'zrzut ekranu 2026-09-16 163259': {
    key: 'reExteriorModern',
    slug: 'contemporary-exterior',
    alt: 'A contemporary white house with black framed windows, a standing-seam porch roof and a timber front door, photographed from a raised angle across a wide concrete drive and clipped lawn, with pines behind.',
    tone: 'daylight',
    focus: '50% 52%',
  },
  'zrzut ekranu 2026-09-16 164854': {
    // Displaced from rePool by a full-size original of a better pool.
    key: 'lifestyleTerrace',
    slug: 'pool-wide',
    item: {
      id: 'terrace-lifestyle',
      title: 'Pool and rear elevation',
      category: 'real-estate-photo',
      caption: 'The full length of the pool with the house behind it, from the far coping.',
    },
    alt: 'A long rectangular pool with pale stone coping running the length of a lawn, in front of a white painted brick house with a covered terrace, loungers along the near edge and mature trees behind.',
    tone: 'water',
    focus: '50% 55%',
  },
  'zrzut ekranu 2026-09-16 165104': {
    key: 'reExteriorTwilight',
    slug: 'front-elevation',
    // Bright midday from the forecourt, not dusk. The slot is named for the
    // drawing it replaces, and the tile claimed a sunset not in the frame.
    item: {
      id: 'twilight-glass-house',
      title: 'Front elevation',
      caption: 'Late morning from the forecourt, with the brick steps leading up to the door.',
    },
    alt: 'A white painted brick house with a steep shingled roof and round dormer windows, seen at an angle from a broad concrete forecourt, with brick steps rising between clipped hedges to an arched front door and magnolias either side.',
    tone: 'daylight',
    focus: '50% 48%',
  },

  /* — The second batch: seven camera and drone originals — */
  'dji_20260818101503_0009_d': {
    // Moved to the home page hero; a real neighbourhood frame took its old tile.
    key: 'heroTwilight',
    slug: 'aerial-estate-drive',
    alt: 'A white brick house with a steep shingled roof photographed from the air in daylight, showing the roof, a brick entrance path and courtyard, a concrete drive curving in from the left, and mature trees on every side with a neighbouring roof beyond.',
    tone: 'aerial',
    focus: '50% 55%',
  },
  'dsc00064': {
    key: 'rePool',
    slug: 'pool-garden',
    item: {
      id: 'pool-dusk',
      title: 'Pool and garden',
      caption: 'Square down the length of the pool, with the cypress screen holding the far edge.',
    },
    alt: 'A rectangular swimming pool with pale stone coping and clear turquoise water, a row of tall narrow cypresses along the far side behind a black railing, loungers on the grass to the left and two white in-water chairs in the foreground.',
    tone: 'water',
    focus: '50% 55%',
  },
  'dsc00159': {
    key: 'homeInterior',
    slug: 'piano-room',
    alt: 'A bright reception room with white panelled walls and tall multi-pane windows on two sides, a grand piano with its lid raised at the far end, a round low table at the centre of a wide oak floor, and a chrome chandelier overhead.',
    tone: 'interior',
    focus: '50% 50%',
  },
  'dsc00258': {
    key: 'reBath',
    slug: 'primary-bath',
    alt: 'A bathroom in pale grey and white with a long double vanity under a full-width mirror, chrome tube sconces either side, and a glass walk-in shower tiled in white to the right, over a marble mosaic floor.',
    tone: 'interior',
    focus: '50% 50%',
  },
  'dsc00270': {
    key: 'reDetail',
    slug: 'home-gym',
    alt: 'A home gym with a rowing machine in the foreground, a wall-mounted training screen and weights bench to the right, a cedar infrared sauna cabin against the far wall, and rolled exercise mats and dumbbells to one side, on a pale oak floor.',
    tone: 'interior',
    focus: '50% 52%',
  },
  'dsc09705': {
    key: 'reLiving',
    slug: 'living-room-fireplace',
    item: {
      id: 'living-room-flambient',
      title: 'Living room',
      caption: 'Held for the fire and the window light at once, with the landing above kept in frame.',
    },
    alt: 'A double-height living room with a pale limestone chimney breast rising the full height of the wall, a lit fire below a timber mantel, cream sectional sofas and tan leather armchairs on an oak floor, and a railed landing overlooking from above.',
    tone: 'interior',
    focus: '50% 48%',
  },
  'dsc09753': {
    key: 'reBedroom',
    slug: 'primary-bedroom',
    item: {
      id: 'primary-suite',
      title: 'Primary suite',
      caption: 'Square to the bed, with both shuttered windows left in the frame.',
    },
    alt: 'A large bedroom with a pale upholstered bed centred between two cane-fronted chests, shuttered windows either side, four square wood reliefs on the wall above, a leather bench at the foot and a patterned rug across a wide oak floor.',
    tone: 'interior',
    focus: '50% 50%',
  },
  /* — Waiting. Save a file under one of these names and this places it. The
       alt text here is the brief the shot was asked for; rewrite it to the
       photograph once it exists, because only the photograph knows. — */
  'portrait': {
    key: 'founderPortrait', slug: 'founder', tone: 'studio', focus: '50% 35%',
    alt: 'Bryan Miller, photographed from the chest up in a navy suit and a patterned tie against a plain white background.',
  },
  'twilight-exterior-dusk': {
    key: 'reExteriorNight', slug: 'twilight-exterior', tone: 'twilight', focus: '50% 52%',
    alt: 'A house at dusk with the interior lights on and the sky still holding colour.',
  },
  'kitchen': {
    key: 'reKitchen', slug: 'kitchen', tone: 'interior', focus: '50% 50%',
    alt: 'A kitchen with an island, pendant lighting over it and full-height cabinetry.',
  },
  'exterior-day': {
    key: 'reExteriorDay', slug: 'exterior-day', tone: 'daylight', focus: '50% 50%',
    alt: 'The front of a house in daylight, photographed square to the door.',
  },
  'hallway': {
    key: 'reWalkthrough', slug: 'hallway', tone: 'interior', focus: '50% 50%',
    alt: 'A hallway looking through to a bright room at the end.',
  },
  'staircase': {
    key: 'reStair', slug: 'staircase', tone: 'interior', focus: '50% 50%',
    alt: 'A staircase with timber treads and a slim metal balustrade.',
  },
  'entry-hall': {
    key: 'entryStair', slug: 'entry-hall', tone: 'interior', focus: '50% 45%',
    alt: 'A double-height entry hall with a staircase rising to a landing above.',
  },
  'detail': {
    key: 'filmFrameB', slug: 'detail', tone: 'interior', focus: '50% 50%',
    alt: 'A close interior detail — a handle, a tap, a corner of stone.',
  },
  'aerial-neighbourhood': {
    key: 'aerialNeighborhood', slug: 'aerial-neighbourhood', tone: 'aerial', focus: '50% 50%',
    alt: 'A residential neighbourhood from the air, with streets, rooftops and mature trees.',
  },
  'aerial-water': {
    key: 'aerialWater', slug: 'aerial-water', tone: 'water', focus: '50% 50%',
    alt: 'A waterfront property from the air, with a dock or shoreline in frame.',
  },
  'aerial-land': {
    key: 'aerialLand', slug: 'aerial-land', tone: 'aerial', focus: '50% 50%',
    alt: 'Open farmland and fields photographed from above in low golden light.',
  },
  'aerial-highway': {
    key: 'aerialHighway', slug: 'aerial-highway', tone: 'aerial', focus: '50% 50%',
    alt: 'A road running through open country, photographed from the air.',
  },
  'drone-in-flight': {
    key: 'droneInFlight', slug: 'drone-in-flight', tone: 'daylight', focus: '50% 45%',
    alt: 'A camera drone in flight against an open sky.',
  },
  'aerial-house': {
    key: 'homeAerial', slug: 'aerial-house', tone: 'aerial', focus: '50% 50%',
    alt: 'A house and its grounds from the air, showing the roof, drive and garden.',
  },
  'film-still-room': {
    key: 'homeFilm', slug: 'film-still-room', tone: 'interior', focus: '50% 50%',
    alt: 'A frame from a property film, held wide across a lit room.',
  },
  'film-still-doorway': {
    key: 'filmFrameA', slug: 'film-still-doorway', tone: 'interior', focus: '50% 50%',
    alt: 'A frame from a property film, the camera moving through a doorway.',
  },
  'img_0969': {
    key: 'gearStill', slug: 'gear', tone: 'studio', focus: '50% 50%',
    alt: 'The kit laid out on a pine table, shot from above: a folding DJI drone with its propellers out, a controller with a built-in screen, a small ducted FPV drone, a Sony mirrorless body with a 12-24mm f/2.8 lens and hood, and a pair of FPV goggles with their battery pack.',
  },
  'restaurant': {
    key: 'commRestaurant', slug: 'restaurant', tone: 'interior', focus: '50% 50%',
    alt: 'A restaurant interior during service, with warm lighting over the tables.',
  },
  'gym': {
    key: 'commGym', slug: 'gym', tone: 'interior', focus: '50% 50%',
    alt: 'A gym floor with equipment in use under the lighting of the room itself.',
  },
  'car': {
    key: 'commAuto', slug: 'car', tone: 'studio', focus: '50% 50%',
    alt: 'A car photographed in three-quarter view under controlled lighting.',
  },
  'hotel': {
    key: 'commHotel', slug: 'hotel', tone: 'twilight', focus: '50% 50%',
    alt: 'A hotel exterior at dusk with lit windows and a lit entrance.',
  },
  'retail': {
    key: 'commRetail', slug: 'retail', tone: 'interior', focus: '50% 50%',
    alt: 'A retail interior with rails of stock and track lighting.',
  },
  'event': {
    key: 'commEvent', slug: 'event', tone: 'night', focus: '50% 50%',
    alt: 'An event at night with stage lighting over a crowd.',
  },
  /* — Second batch of camera and drone originals — */
  '30 view f': {
    key: 'aerialNeighborhood', slug: 'neighbourhood-aerial', tone: 'aerial', focus: '50% 50%',
    item: { id: 'aerial-neighbourhood', title: 'Neighbourhood from above',
      caption: 'Straight down over the street, so a buyer can read the plot against its neighbours.' },
    alt: 'A residential street photographed from directly above, showing a house and its plot between neighbouring roofs, with sidewalks, lawns and parked cars either side.',
  },
  '31': {
    key: 'aerialLand', slug: 'pond-aerial', tone: 'water', focus: '50% 48%',
    item: { id: 'acreage', title: 'The pond lots from above',
      caption: 'The water, the lawns and the road in one frame — what a plan drawing cannot show.' },
    alt: 'A brick house on a corner plot photographed from the air, with a green pond and open lawn behind it, curving roads and sidewalks in front, and neighbouring houses beyond.',
  },
  'dji_20260814114011_0119_d (1)': {
    key: 'homeAerial', slug: 'modern-pool-aerial', tone: 'aerial', focus: '50% 52%',
    alt: 'A white modern farmhouse photographed from the air, with a covered porch opening onto a pale stone terrace, a rectangular pool and spa, a putting green to one side and a sport court to the other.',
  },
  'dji_20260818101521_0012_d': {
    key: 'aerialHighway', slug: 'estate-in-trees', tone: 'aerial', focus: '50% 50%',
    item: { id: 'commercial-frontage', title: 'Estate in the trees',
      caption: 'High enough to place the house in its setting, with the drive and pool still readable.' },
    alt: 'A white house with a steep shingled roof photographed from high above, set in dense woodland, with a pool and terrace behind it and a broad concrete drive curving up to the front.',
  },
  'dsc09690 (1)': {
    key: 'reStair', slug: 'entry-hall', tone: 'interior', focus: '50% 45%',
    item: { id: 'staircase', title: 'Entry hall and stair',
      caption: 'Dead centre on the arch, so both flights of the stair land symmetrically.' },
    alt: 'A double-height entry hall with twin staircases rising either side to a railed landing, brass wall lights on white walls, and a round table on a jute rug beneath an arched opening through to the living room.',
  },
  'dsc09696 (1)': {
    key: 'reKitchen', slug: 'kitchen', tone: 'interior', focus: '50% 50%',
    alt: 'A kitchen with two islands, one in white oak with a marble top and leather stools, white cabinetry and a gold mosaic backsplash behind the range, conical pendants overhead and a glazed opening through to the pool.',
  },
  '8 primary bath (1)': {
    key: 'reBathFeature', slug: 'bath-feature', tone: 'interior', focus: '50% 50%',
    alt: 'A bathroom papered in a dark green and gold crane print, with a white freestanding oval tub, a wall-mounted spout, a gilt mirror above a marble shelf and a brass trolley beside the tub.',
  },
};

const imagesFile = join(root, 'src/data/images.ts');
const portfolioFile = join(root, 'src/data/portfolio.ts');

/** Rewrites one field of one entry, leaving every other line untouched. */
function setField(source, key, field, value, opener = `  ${key}: {`) {
  const entry = new RegExp(`(\\n${opener.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})([\\s\\S]*?)(\\n  \\},)`);
  const found = entry.exec(source);
  if (!found) throw new Error(`Could not find ${key} to set ${field}`);
  let body = found[2];
  const line = new RegExp(`(\\n    ${field}: )(?:'(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")(,?)`);
  const quoted = `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  body = line.test(body)
    ? body.replace(line, (_m, head, tail) => `${head}${quoted}${tail || ','}`)
    : `${body}\n    ${field}: ${quoted},`;
  return source.slice(0, found.index) + found[1] + body + found[3] + source.slice(found.index + found[0].length);
}

const OUT_DIR = join(root, 'public/work/r');
const mastersDir = join(root, 'masters');
let files = [];
try {
  files = await readdir(mastersDir);
} catch {
  console.error('There is no masters/ folder yet. Put your originals there first.');
  process.exit(1);
}

const jobs = [];
const unknown = [];
for (const file of files) {
  if (!/\.(jpe?g|png)$/i.test(file)) continue;
  const name = basename(file, extname(file)).toLowerCase();
  const plan = ADOPT[name];
  if (plan) jobs.push({ file, ...plan });
  else unknown.push(file);
}

if (jobs.length === 0) {
  console.log('Nothing in masters/ matches the table in this script.\n');
  console.log('Waiting for these names:');
  for (const [name, plan] of Object.entries(ADOPT)) console.log(`  ${name}.jpg  ->  ${plan.key}`);
  if (unknown.length) console.log(`\nFound but not in the table: ${unknown.join(', ')}`);
  process.exit(0);
}

let source = await readFile(imagesFile, 'utf8');
let portfolio = await readFile(portfolioFile, 'utf8');

for (const job of jobs) {
  console.log(`${job.file}  ->  ${job.key}`);
  if (!WRITE) continue;
  const run = spawnSync(
    process.execPath,
    [join(root, 'scripts/optimise-work.mjs'), join('masters', job.file), job.slug],
    { stdio: 'inherit' },
  );
  if (run.status !== 0) {
    console.error(`  could not re-encode ${job.file}`);
    process.exit(1);
  }
  /* Ask the folder which widths exist rather than assuming 1800: a 940px
     screenshot only ever yields 640 and 960, and naming a file that was never
     written is a 404 that degrades into a drawn plate — the exact thing the
     owner does not want on the page. */
  const written = (await readdir(OUT_DIR))
    .map((f) => Number(new RegExp(`^${job.slug}-(\\d+)\\.jpg$`).exec(f)?.[1]))
    .filter((w) => Number.isFinite(w));
  if (written.length === 0) {
    console.error(`  ${job.slug} produced no files`);
    process.exit(1);
  }
  source = setField(source, job.key, 'src', `/work/r/${job.slug}-${Math.max(...written)}.jpg`);
  source = setField(source, job.key, 'alt', job.alt);
  source = setField(source, job.key, 'tone', job.tone);
  source = setField(source, job.key, 'focus', job.focus);

  if (job.item) {
    // The tile is matched on its id line, so the fields below it are the
    // right ones even though several tiles share a shape.
    const opener = `    id: '${job.item.id}',`;
    for (const [field, value] of Object.entries(job.item)) {
      if (field === 'id') continue;
      portfolio = setField(portfolio, job.item.id, field, value, opener);
    }
  }
}

if (unknown.length) console.log(`\nLeft alone (not in the table): ${unknown.join(', ')}`);

if (!WRITE) {
  console.log('\nNothing was changed. Run again with --write to apply.');
  process.exit(0);
}

await writeFile(imagesFile, source);
await writeFile(portfolioFile, portfolio);
console.log(`\nWired ${jobs.length} photograph(s) into images.ts.`);
