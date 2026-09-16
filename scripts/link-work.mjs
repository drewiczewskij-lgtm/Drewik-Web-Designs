#!/usr/bin/env node
/**
 * Wires the files in `public/work/` into the site.
 *
 *   npm run link:work            # show what would change
 *   npm run link:work -- --write # actually change it
 *
 * Drop your photographs and films into `public/work/`, name them after the
 * image key they belong to, and run this. It fills in the `src` of each
 * matching entry in `src/data/images.ts` and the `video` of each matching item
 * in `src/data/portfolio.ts`, so you never have to edit either file by hand.
 *
 * Matching is forgiving about case, spaces, hyphens and underscores:
 *
 *     public/work/hero-twilight.jpg      → heroTwilight
 *     public/work/Hero Twilight.JPG      → heroTwilight
 *     public/work/re_kitchen.webp        → reKitchen
 *     public/work/founder.jpg            → founderPortrait   (see ALIASES)
 *     public/work/277-north-place.mp4    → the portfolio item with that id
 *
 * Run it with no arguments first. It prints exactly what it would do and
 * changes nothing.
 *
 * ⚠ ALT TEXT IS NOT UPDATED, and cannot be: only you know what is actually in
 *   your photograph. The script lists every entry whose alt text still
 *   describes the drawn placeholder so you can rewrite those lines.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, extname, basename } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const workDir = join(root, 'public/work');
const imagesFile = join(root, 'src/data/images.ts');
const portfolioFile = join(root, 'src/data/portfolio.ts');

const WRITE = process.argv.includes('--write');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov', '.m4v']);

/**
 * Filenames that do not match a key directly. Add your own here — the left
 * side is the normalised filename, the right side is the key in images.ts.
 */
const ALIASES = {
  founder: 'founderPortrait',
  portrait: 'founderPortrait',
  bryan: 'founderPortrait',
  hero: 'heroTwilight',
  twilight: 'reExteriorTwilight',
  kitchen: 'reKitchen',
  living: 'reLiving',
  bedroom: 'reBedroom',
  bathroom: 'reBath',
  bath: 'reBath',
  dining: 'reDining',
  stairs: 'reStair',
  stair: 'reStair',
  pool: 'rePool',
  terrace: 'reTerrace',
  aerial: 'aerialProperty',
  drone: 'aerialProperty',
  exterior: 'reExteriorDay',
  gear: 'gearStill',
};

/** 'Hero Twilight-01.JPG' → 'herotwilight01' */
const normalise = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

let files;
try {
  files = await readdir(workDir);
} catch {
  console.log('No `public/work/` directory yet. Create it and put your files in it:\n');
  console.log('    mkdir -p public/work\n');
  process.exit(0);
}

files = files.filter((f) => !f.startsWith('.') && f !== 'README.md');

if (files.length === 0) {
  console.log('`public/work/` is empty.\n');
  console.log('Put your photographs and films there, named after the image keys in');
  console.log('src/data/images.ts, then run this again. `npm run check:images` lists the keys.\n');
  process.exit(0);
}

let imagesSource = await readFile(imagesFile, 'utf8');
let portfolioSource = await readFile(portfolioFile, 'utf8');

// Every key in the library, and whether it already has a source.
const keys = [...imagesSource.matchAll(/^ {2}([A-Za-z0-9_]+): \{\n(?:[^}]*?)src: '([^']*)'/gm)].map(
  ([, key, src]) => ({ key, src, norm: normalise(key) }),
);

// Every portfolio item id, for matching films.
const itemIds = [...portfolioSource.matchAll(/^\s{4}id: '([^']+)',/gm)].map(([, id]) => ({
  id,
  norm: normalise(id),
}));

const matchedImages = [];
const matchedVideos = [];
const unmatched = [];

for (const file of files) {
  const ext = extname(file).toLowerCase();
  const stem = normalise(basename(file, extname(file)));
  const publicPath = `/work/${file}`;

  if (IMAGE_EXT.has(ext)) {
    const aliased = ALIASES[stem];
    const hit =
      keys.find((k) => k.norm === stem) ||
      (aliased && keys.find((k) => k.key === aliased)) ||
      // A trailing number is common in exports: hero-twilight-02.jpg
      keys.find((k) => stem.startsWith(k.norm) && /^\d+$/.test(stem.slice(k.norm.length)));

    if (hit) matchedImages.push({ file, key: hit.key, publicPath, had: hit.src });
    else unmatched.push({ file, why: 'no image key with that name' });
    continue;
  }

  if (VIDEO_EXT.has(ext)) {
    const hit =
      itemIds.find((i) => i.norm === stem) || itemIds.find((i) => stem.includes(i.norm));
    if (hit) matchedVideos.push({ file, id: hit.id, publicPath });
    else unmatched.push({ file, why: 'no portfolio item id with that name' });
    continue;
  }

  unmatched.push({ file, why: `unsupported extension ${ext}` });
}

console.log(`\n${files.length} file(s) in public/work/\n`);

if (matchedImages.length) {
  console.log('Images:');
  for (const m of matchedImages) {
    const note = m.had ? `(replacing ${m.had})` : '';
    console.log(`  ${m.file.padEnd(34)} → ${m.key} ${note}`);
  }
  console.log('');
}

if (matchedVideos.length) {
  console.log('Films:');
  for (const m of matchedVideos) {
    console.log(`  ${m.file.padEnd(34)} → portfolio item "${m.id}"`);
  }
  console.log('');
}

const withSpaces = [...matchedImages, ...matchedVideos].filter((m) => /\s/.test(m.file));
if (withSpaces.length) {
  console.log('Note — these filenames contain spaces. They will work, but a URL-safe');
  console.log('name (lower case, hyphens, no spaces) is easier to live with:');
  for (const m of withSpaces) console.log(`  ${m.file}`);
  console.log('');
}

if (unmatched.length) {
  console.log('Not matched:');
  for (const u of unmatched) console.log(`  ${u.file.padEnd(34)} — ${u.why}`);
  console.log('\n  Rename the file after the key it belongs to, or add an entry to');
  console.log('  ALIASES at the top of scripts/link-work.mjs.\n');
}

if (!matchedImages.length && !matchedVideos.length) process.exit(0);

if (!WRITE) {
  console.log('Nothing was changed. Re-run with --write to apply:\n');
  console.log('    npm run link:work -- --write\n');
  process.exit(0);
}

// Apply. Each replacement is anchored to its own key's block, so two entries
// cannot be confused with each other.
for (const m of matchedImages) {
  const pattern = new RegExp(`(^ {2}${m.key}: \\{\\n(?:[^}]*?)src: ')([^']*)(')`, 'm');
  if (!pattern.test(imagesSource)) {
    console.log(`  ! could not locate ${m.key} in images.ts — skipped`);
    continue;
  }
  imagesSource = imagesSource.replace(pattern, (_, a, __, c) => `${a}${m.publicPath}${c}`);
}

for (const m of matchedVideos) {
  // Find the item's block and set or insert its `video` field.
  const block = new RegExp(`(\\{\\n\\s{4}id: '${m.id}',[\\s\\S]*?\\n\\s{2}\\})`, 'm');
  const found = portfolioSource.match(block);
  if (!found) {
    console.log(`  ! could not locate portfolio item ${m.id} — skipped`);
    continue;
  }
  let text = found[1];
  const video = `    video: { provider: 'file', id: '${m.publicPath}' },`;

  if (/\n\s{4}video:/.test(text)) {
    text = text.replace(/\n\s{4}video: \{[^}]*\},/, `\n${video}`);
  } else {
    // Insert after `kind:`, which every item has.
    text = text.replace(/(\n\s{4}kind: '[^']*',)/, `$1\n${video}`);
  }
  // A film needs kind: 'video' to open a player at all.
  text = text.replace(/\n(\s{4})kind: 'photo',/, `\n$1kind: 'video',`);

  portfolioSource = portfolioSource.replace(block, () => text);
}

await writeFile(imagesFile, imagesSource, 'utf8');
await writeFile(portfolioFile, portfolioSource, 'utf8');

console.log('Written.\n');

const stillPlaceholder = matchedImages.filter((m) => !m.had);
if (stillPlaceholder.length) {
  console.log('⚠ REWRITE THE ALT TEXT for these entries in src/data/images.ts.');
  console.log('  It still describes the drawn placeholder, not your photograph:\n');
  for (const m of stillPlaceholder) console.log(`    ${m.key}`);
  console.log('');
}

console.log('Then run:  npm run check:images && npm run build\n');
