#!/usr/bin/env node
/**
 * Folds the `dist-single` build into one HTML file.
 *
 * A normal build loads its JavaScript from a separate file, which browsers
 * refuse to do over `file://`. Inlining the module means the page runs from a
 * double click, with no server and no install.
 *
 * Run as: npm run build:single
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist-single');

let html = await readFile(join(dist, 'index.html'), 'utf8');
const assets = await readdir(join(dist, 'assets'));

const js = assets.filter((f) => f.endsWith('.js'));
const css = assets.filter((f) => f.endsWith('.css'));

// A closing tag inside the payload would end the host tag early.
const escapeScript = (s) => s.replace(/<\/script>/gi, '<\\/script>');
const escapeStyle = (s) => s.replace(/<\/style>/gi, '<\\/style>');

// Always replace through a function. Minified code is full of `$&` and `$'`,
// which a string replacement would treat as back-references and splice the
// surrounding document into the payload.
const put = (html, pattern, payload) => html.replace(pattern, () => payload);

for (const file of css) {
  const body = await readFile(join(dist, 'assets', file), 'utf8');
  html = put(
    html,
    new RegExp(`<link[^>]*href="[^"]*${file}"[^>]*>`),
    `<style>${escapeStyle(body)}</style>`,
  );
}

for (const file of js) {
  const body = await readFile(join(dist, 'assets', file), 'utf8');
  html = put(
    html,
    new RegExp(`<script[^>]*src="[^"]*${file}"[^>]*></script>`),
    `<script type="module">${escapeScript(body)}</script>`,
  );
}

// Preloads point at files that no longer exist once everything is inline.
html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>\s*/g, '');

// The favicon becomes a data URI so the file carries its own mark.
try {
  const icon = await readFile(join(root, 'public', 'favicon.svg'), 'utf8');
  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(icon.trim())}`;
  html = html.replace(/href="\.\/favicon\.svg"/g, () => `href="${uri}"`);
} catch {
  /* No favicon is not a failure. */
}

/**
 * Photographs in `public/work/r/` are fetched at runtime, so a file with no
 * folder beside it would show a broken frame. Carry them inside the document
 * instead, as data URIs on a global the image layer checks.
 *
 * Only the narrower sizes come along: base64 costs a third more than the file,
 * so carrying every width would put this one document into the tens of
 * megabytes. 960px is the most a browser panel will ask for; the hosted build
 * in `dist/` still serves the full set up to 2400.
 */
const INLINE_MAX_WIDTH = 960;
const inline = {};
try {
  const dir = join(root, 'public', 'work', 'r');
  for (const file of await readdir(dir)) {
    const width = Number(/-(\d+)\.[a-z]+$/.exec(file)?.[1]);
    if (!Number.isFinite(width) || width > INLINE_MAX_WIDTH) continue;
    const type = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const bytes = await readFile(join(dir, file));
    inline[`/work/r/${file}`] = `data:${type};base64,${bytes.toString('base64')}`;
  }
} catch {
  /* No photographs yet is not a failure — the drawn plates still render. */
}

if (Object.keys(inline).length > 0) {
  // `<` cannot appear in base64, but the keys are ours, so escape defensively.
  const payload = JSON.stringify(inline).replace(/</g, '\\u003c');
  html = html.replace(
    /<script type="module">/,
    () => `<script>window.__KM_INLINE__=${payload}<\/script><script type="module">`,
  );
  const mb = (payload.length / 1024 / 1024).toFixed(2);
  console.log(`Inlined ${Object.keys(inline).length} photograph file(s) — ${mb} MB.`);
}

const out = join(root, 'km-productions.html');
await writeFile(out, html);

const leftover = html.match(/(src|href)="\.\/assets\//g);
if (leftover) {
  console.error(`Not fully inlined — ${leftover.length} reference(s) remain.`);
  process.exit(1);
}

console.log(`km-productions.html — ${(html.length / 1024 / 1024).toFixed(2)} MB, one file, no dependencies.`);
