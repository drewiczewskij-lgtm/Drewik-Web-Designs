#!/usr/bin/env node
/**
 * Checks every image source in `src/data/images.ts`.
 *
 *   npm run check:images
 *
 * Entries fall into two groups.
 *
 * DRAWN — `src` is empty, so the frame renders a plate from `src/lib/scenes.ts`
 * instead. Nothing is requested and nothing can break. This is the default
 * state of a fresh install and is NOT a failure; the script lists them so you
 * can see how much of the site is still standing in for real work.
 *
 * SOURCED — `src` points at a file or a URL. Each one is fetched and checked
 * for a 2xx and an image content type. A failure here does not break the page
 * (Figure falls back to the plate) but it is not the photograph you wanted, so
 * the script exits non-zero to make it visible in CI.
 */

import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const source = join(root, 'src/data/images.ts');

const text = await readFile(source, 'utf8');

const base = text.match(/export const IMAGE_BASE = '([^']+)'/)?.[1];
if (!base) {
  console.error('Could not find IMAGE_BASE in src/data/images.ts');
  process.exit(1);
}

// Each entry is `key: {` then, within the next few lines, `src: '…'`.
// The source may be empty, which is why the character class allows zero.
const entries = [
  ...text.matchAll(/^ {2}([A-Za-z0-9_]+): \{\n(?:[^}]*?)src: '([^']*)'/gm),
].map(([, key, src]) => ({ key, src }));

if (entries.length === 0) {
  console.error('No image entries found. Has the shape of images.ts changed?');
  process.exit(1);
}

const drawn = entries.filter((e) => e.src.trim() === '');
const sourced = entries.filter((e) => e.src.trim() !== '');

console.log(`${entries.length} image entries.\n`);

if (drawn.length) {
  console.log(`${drawn.length} drawn (no photograph yet — renders a plate):`);
  for (const e of drawn) console.log(`   ·  ${e.key}`);
  console.log('');
}

if (sourced.length === 0) {
  console.log('No remote or local sources to verify. Nothing can 404.');
  console.log('\nAdd a `src` to an entry in src/data/images.ts to put real work on the site.');
  process.exit(0);
}

const toUrl = (src) =>
  /^https?:\/\//.test(src) ? src : src.startsWith('/') ? src : `${base}${src}?auto=format&fit=crop&w=320&q=40`;

const CONCURRENCY = 6;
const results = [];
let cursor = 0;

async function check(entry) {
  // A rooted path is a file in `public/`, so check the disk rather than the
  // network — it is faster and it works before the site is deployed.
  if (entry.src.startsWith('/') && !/^https?:/.test(entry.src)) {
    const onDisk = join(root, 'public', entry.src.replace(/^\//, ''));
    try {
      const info = await stat(onDisk);
      return { ...entry, ok: info.isFile() && info.size > 0, status: 'file', type: `${info.size} bytes` };
    } catch {
      return { ...entry, ok: false, status: 'missing', type: `not found at public${entry.src}` };
    }
  }

  try {
    const res = await fetch(toUrl(entry.src), { method: 'GET', headers: { Range: 'bytes=0-64' } });
    const type = res.headers.get('content-type') ?? '';
    return { ...entry, ok: res.ok && type.startsWith('image/'), status: res.status, type };
  } catch (error) {
    return { ...entry, ok: false, status: 0, type: String(error?.message ?? error) };
  }
}

async function worker() {
  while (cursor < sourced.length) {
    results.push(await check(sourced[cursor++]));
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, sourced.length) }, worker));
results.sort((a, b) => a.key.localeCompare(b.key));

const bad = results.filter((r) => !r.ok);

console.log(`${sourced.length} sourced:`);
for (const r of results) {
  const mark = r.ok ? '  ok ' : 'FAIL ';
  console.log(`${mark} ${r.key.padEnd(22)} ${r.src.slice(0, 44).padEnd(46)} ${r.ok ? '' : `${r.status} ${r.type}`}`);
}

console.log(`\n${results.length - bad.length}/${results.length} sources resolved.`);

if (bad.length) {
  const blocked = bad.filter((r) => r.status === 403 || r.status === 0);
  if (blocked.length === results.length) {
    console.log(
      '\nEvery source failed the same way. That is almost always a network policy —\n' +
        'a proxy or firewall between you and the CDN — rather than bad identifiers.\n' +
        'Try again from an unrestricted connection.',
    );
  } else {
    console.log('\nFix these in src/data/images.ts:');
    for (const r of bad) console.log(`  ${r.key} → ${r.src}`);
  }
  process.exit(1);
}
