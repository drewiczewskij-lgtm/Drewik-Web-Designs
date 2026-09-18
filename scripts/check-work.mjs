#!/usr/bin/env node
/**
 * Every photograph appears once, and reports what is still missing.
 *
 *   npm run check:work
 *
 * Two jobs. First, no photograph may fill more than one frame: the same
 * kitchen three times makes a body of work look thinner than it is, and the
 * repetition is invisible while editing one entry at a time. Exits non-zero if
 * it finds a repeat, so it can guard a build.
 *
 * Second, it lists every frame still waiting, so the answer to "what should I
 * shoot next" comes from the site rather than from memory.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(join(root, 'src/data/images.ts'), 'utf8');

const entries = [...source.matchAll(/\n {2}(\w+): \{([\s\S]*?)\n {2}\},/g)].map(([, key, body]) => ({
  key,
  src: /src: '([^']*)'/.exec(body)?.[1] ?? '',
  alt: /alt: '((?:[^'\\]|\\.)*)'/.exec(body)?.[1] ?? '',
}));

/** `/work/r/name-1800.jpg` and `/work/r/name-960.jpg` are the same photograph. */
const photograph = (src) => src.replace(/^\/work\/r\//, '').replace(/-\d+\.\w+$/, '');

const used = new Map();
for (const e of entries) {
  if (!e.src.startsWith('/work/')) continue;
  const name = photograph(e.src);
  used.set(name, [...(used.get(name) ?? []), e.key]);
}

const repeated = [...used].filter(([, keys]) => keys.length > 1);
const waiting = entries.filter((e) => !e.src.startsWith('/work/'));

console.log(`${used.size} photograph(s) in ${entries.length - waiting.length} frame(s).\n`);

if (repeated.length > 0) {
  console.log('Used more than once:');
  for (const [name, keys] of repeated) console.log(`  ${name} → ${keys.join(', ')}`);
  console.log('\nGive each photograph one frame and empty the rest.');
} else {
  console.log('No photograph is used twice.');
}

if (waiting.length > 0) {
  console.log(`\n${waiting.length} frame(s) still waiting:`);
  for (const e of waiting) console.log(`  ${e.key.padEnd(20)} ${e.alt.slice(0, 74)}`);
}

process.exit(repeated.length > 0 ? 1 : 0);
