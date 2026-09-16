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

const out = join(root, 'km-productions.html');
await writeFile(out, html);

const leftover = html.match(/(src|href)="\.\/assets\//g);
if (leftover) {
  console.error(`Not fully inlined — ${leftover.length} reference(s) remain.`);
  process.exit(1);
}

console.log(`km-productions.html — ${(html.length / 1024 / 1024).toFixed(2)} MB, one file, no dependencies.`);
