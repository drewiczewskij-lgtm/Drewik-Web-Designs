#!/usr/bin/env node
/**
 * Verifies every source in src/data/images.ts actually resolves.
 *
 * The library was authored without outbound network access, so the entries
 * have never been checked against a live CDN. Run this before showing the site
 * to anyone:
 *
 *   npm run check:images
 *
 * Anything reported here can be replaced in src/data/images.ts and nowhere
 * else. A failing entry does not break the page — `Figure` falls back to a
 * generated architectural plate — but it is not the photograph you wanted.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../src/data/images.ts');

const text = await readFile(source, 'utf8');

const base = text.match(/export const IMAGE_BASE = '([^']+)'/)?.[1];
if (!base) {
  console.error('Could not find IMAGE_BASE in src/data/images.ts');
  process.exit(1);
}

// Each entry is `key: { src: '…', …`
const entries = [...text.matchAll(/^\s{2}([A-Za-z0-9_]+):\s*\{\s*\n\s*src:\s*'([^']+)'/gm)].map(
  ([, key, src]) => ({ key, src }),
);

if (entries.length === 0) {
  console.error('No image entries found. Has the shape of images.ts changed?');
  process.exit(1);
}

const url = (src) =>
  /^https?:\/\//.test(src) || src.startsWith('/')
    ? src
    : `${base}${src}?auto=format&fit=crop&w=320&q=40`;

const CONCURRENCY = 6;
const results = [];
let cursor = 0;

async function worker() {
  while (cursor < entries.length) {
    const entry = entries[cursor++];
    const target = url(entry.src);
    try {
      const res = await fetch(target, { method: 'GET', headers: { Range: 'bytes=0-64' } });
      const type = res.headers.get('content-type') ?? '';
      results.push({
        ...entry,
        ok: res.ok && type.startsWith('image/'),
        status: res.status,
        type,
      });
    } catch (error) {
      results.push({ ...entry, ok: false, status: 0, type: String(error.message ?? error) });
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
results.sort((a, b) => a.key.localeCompare(b.key));

const bad = results.filter((r) => !r.ok);

for (const r of results) {
  const mark = r.ok ? '  ok ' : 'FAIL ';
  console.log(`${mark} ${r.key.padEnd(20)} ${r.src.padEnd(34)} ${r.ok ? '' : `${r.status} ${r.type}`}`);
}

console.log(`\n${results.length - bad.length}/${results.length} sources resolved.`);

if (bad.length) {
  const blocked = bad.filter((r) => r.status === 403 || r.status === 0);
  if (blocked.length === results.length) {
    console.log(
      '\nEvery source failed the same way. That is almost always a network\n' +
        'policy — a proxy or firewall between you and the CDN — rather than\n' +
        'bad identifiers. Try again from an unrestricted connection.',
    );
  } else {
    console.log('\nReplace these in src/data/images.ts:');
    for (const r of bad) console.log(`  ${r.key} → ${r.src}`);
  }
  process.exit(1);
}
