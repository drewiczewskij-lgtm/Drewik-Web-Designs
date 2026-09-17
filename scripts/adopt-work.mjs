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
    key: 'rePool',
    slug: 'pool-wide',
    alt: 'A long rectangular pool with pale stone coping running the length of a lawn, in front of a white painted brick house with a covered terrace, loungers along the near edge and mature trees behind.',
    tone: 'water',
    focus: '50% 55%',
  },
  'zrzut ekranu 2026-09-16 165104': {
    key: 'reExteriorTwilight',
    slug: 'front-elevation',
    // The photograph is bright midday from the forecourt, not dusk. The slot is
    // named for the drawing it replaces, and the portfolio tile on it claimed a
    // sunset that is not in the frame, so the tile is retitled to match.
    item: {
      id: 'twilight-glass-house',
      title: 'Front elevation',
      caption: 'Late morning from the forecourt, with the brick steps leading up to the door.',
    },
    alt: 'A white painted brick house with a steep shingled roof and round dormer windows, seen at an angle from a broad concrete forecourt, with brick steps rising between clipped hedges to an arched front door and magnolias either side.',
    tone: 'daylight',
    focus: '50% 48%',
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
    for (const field of ['title', 'caption']) {
      if (job.item[field] === undefined) continue;
      portfolio = setField(portfolio, job.item.id, field, job.item[field], opener);
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
