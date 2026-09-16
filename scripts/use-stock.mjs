#!/usr/bin/env node
/**
 * Switches the site between drawn plates and real stock photographs.
 *
 *   npm run use:stock             # show what would change
 *   npm run use:stock -- --write  # turn photographs on
 *   npm run use:stock -- --revert # go back to the drawn plates
 *
 * It edits the `src` and `alt` of each entry in `src/data/images.ts` from the
 * list in `src/data/stock.ts`. Entries you have already pointed at your own
 * files in `public/work/` are left alone — your work always wins.
 *
 * Afterwards, run `npm run check:images`. It requests every photograph and
 * names any that fail, which is the only way to know for certain; a failure is
 * harmless (the frame falls back to its drawn plate) but it is not what you
 * asked for, so you want to know.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const imagesFile = join(root, 'src/data/images.ts');
const stockFile = join(root, 'src/data/stock.ts');

const WRITE = process.argv.includes('--write');
const REVERT = process.argv.includes('--revert');

let imagesSource = await readFile(imagesFile, 'utf8');
const stockSource = await readFile(stockFile, 'utf8');

/* Read stock.ts as text rather than importing it — this script runs in plain
   Node with no TypeScript loader, and one regex is cheaper than a build step. */
const stock = {};
for (const m of stockSource.matchAll(
  /^ {2}([A-Za-z0-9_]+): \{\n\s*id: '([^']+)',\n\s*alt:\s*\n?\s*'((?:[^'\\]|\\.)*)',/gm,
)) {
  stock[m[1]] = { id: m[2], alt: m[3].replace(/\\'/g, "'") };
}

const never = new Set(
  [...stockSource.matchAll(/NEVER_STOCK = \[([^\]]*)\]/g)]
    .flatMap((m) => [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1])),
);

/** Every entry in the library, with its current source. */
const entries = [
  ...imagesSource.matchAll(/^ {2}([A-Za-z0-9_]+): \{\n(?:[^}]*?)src: '([^']*)'/gm),
].map(([, key, src]) => ({ key, src }));

if (entries.length === 0) {
  console.error('No image entries found. Has the shape of images.ts changed?');
  process.exit(1);
}

const isStock = (src) => src.startsWith('photo-');
const isOwn = (src) => src.trim() !== '' && !isStock(src);

const planned = [];
const skippedOwn = [];
const skippedNever = [];
const noEntry = [];

for (const entry of entries) {
  if (never.has(entry.key)) {
    if (!REVERT) skippedNever.push(entry.key);
    continue;
  }

  if (REVERT) {
    // Only undo what this script did. Files you added are not ours to remove.
    if (isStock(entry.src)) planned.push({ ...entry, to: '' });
    else if (isOwn(entry.src)) skippedOwn.push(entry.key);
    continue;
  }

  if (isOwn(entry.src)) {
    skippedOwn.push(entry.key);
    continue;
  }
  const hit = stock[entry.key];
  if (!hit) {
    noEntry.push(entry.key);
    continue;
  }
  if (entry.src === hit.id) continue;
  planned.push({ ...entry, to: hit.id, alt: hit.alt });
}

console.log(`\n${entries.length} entries in the library.\n`);

if (planned.length) {
  console.log(REVERT ? 'Back to drawn plates:' : 'Switching to photographs:');
  for (const p of planned) console.log(`  ${p.key.padEnd(22)} ${REVERT ? '(plate)' : p.to}`);
  console.log('');
}
if (skippedOwn.length) {
  console.log(`Left alone — these already point at your own files:`);
  for (const k of skippedOwn) console.log(`  ${k}`);
  console.log('');
}
if (skippedNever.length) {
  console.log('Never stock (a stand-in is more honest than a stranger):');
  for (const k of skippedNever) console.log(`  ${k}`);
  console.log('');
}
if (noEntry.length && !REVERT) {
  console.log('No stock photograph listed for these — they keep their plate:');
  for (const k of noEntry) console.log(`  ${k}`);
  console.log('');
}

if (planned.length === 0) {
  console.log('Nothing to change.\n');
  process.exit(0);
}

if (!WRITE && !REVERT) {
  console.log('Nothing was changed. Re-run with --write to apply:\n');
  console.log('    npm run use:stock -- --write\n');
  process.exit(0);
}

for (const p of planned) {
  // Anchored to this key's own block, so two entries cannot be confused.
  const srcPattern = new RegExp(`(^ {2}${p.key}: \\{\\n(?:[^}]*?)src: ')([^']*)(')`, 'm');
  if (!srcPattern.test(imagesSource)) {
    console.log(`  ! could not locate ${p.key} — skipped`);
    continue;
  }
  imagesSource = imagesSource.replace(srcPattern, (_, a, __, c) => `${a}${p.to}${c}`);

  if (!REVERT && p.alt) {
    const altPattern = new RegExp(`(^ {2}${p.key}: \\{\\n(?:[^}]*?)alt:\\s*\\n?\\s*')((?:[^'\\\\]|\\\\.)*)(')`, 'm');
    if (altPattern.test(imagesSource)) {
      const safe = p.alt.replace(/'/g, "\\'");
      imagesSource = imagesSource.replace(altPattern, (_, a, __, c) => `${a}${safe}${c}`);
    }
  }
}

await writeFile(imagesFile, imagesSource, 'utf8');

console.log(REVERT ? 'Reverted to drawn plates.\n' : 'Written.\n');
if (!REVERT) {
  console.log('NOW VERIFY THEM — these ids have never been checked against the CDN:\n');
  console.log('    npm run check:images\n');
  console.log('Anything it reports as failing can be deleted from src/data/stock.ts');
  console.log('and re-run; that frame falls back to its drawn plate, so nothing breaks.\n');
}
