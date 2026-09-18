#!/usr/bin/env node
/**
 * Turns a full-size photograph into the responsive set the site serves.
 *
 *   npm run optimise:work -- public/work/DJI_1234.jpg aerial-estate
 *
 * A camera or drone file is 10–25 MB. Nobody should download that to look at a
 * house, so this re-encodes it once, at build time, into the widths listed in
 * `IMAGE_WIDTHS` — and writes them to `public/work/r/` with the width in the
 * filename. `imageSrcSet()` recognises that folder and hands the browser the
 * whole set, so a phone fetches 640px and a desktop fetches 2400px.
 *
 * The original stays where it is; delete it once you are happy, or keep it out
 * of git. Chromium does the resampling (no native image library is installed).
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, extname } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(root, 'public/work/r');
const WIDTHS = [640, 960, 1280, 1800, 2400];
const QUALITY = 0.82;

const [inputArg, slugArg] = process.argv.slice(2);
if (!inputArg || !slugArg) {
  console.error('usage: node scripts/optimise-work.mjs <file> <slug>');
  process.exit(1);
}

const inputPath = resolve(root, inputArg);
const bytes = await readFile(inputPath);
const mime = extname(inputPath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
const dataUrl = `data:${mime};base64,${bytes.toString('base64')}`;

await mkdir(OUT_DIR, { recursive: true });

// The pinned browser download and the installed one can drift; prefer whatever
// is actually on disk over whatever the npm package expects to find.
const installed = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome'].find(
  (p) => existsSync(p),
);
const browser = await chromium.launch(installed ? { executablePath: installed } : {});
const page = await browser.newPage();

const results = await page.evaluate(
  async ({ dataUrl, widths, quality }) => {
    const img = new Image();
    img.decoding = 'sync';
    await new Promise((ok, fail) => {
      img.onload = ok;
      img.onerror = () => fail(new Error('the browser could not decode that file'));
      img.src = dataUrl;
    });

    // Never upscale. Every step at or below the original is written, plus the
    // first step above it, which carries the original's own width — so a 940px
    // screenshot yields 640 and 960 (the 960 file is really 940), and not three
    // more identical copies pretending to be 2400px wide.
    const wanted = widths.filter((w) => w <= img.naturalWidth);
    const next = widths.find((w) => w > img.naturalWidth);
    if (next !== undefined) wanted.push(next);

    const out = [];
    for (const w of wanted) {
      const width = Math.min(w, img.naturalWidth);
      const height = Math.round((width / img.naturalWidth) * img.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      out.push({ w, width, height, data: canvas.toDataURL('image/jpeg', quality).split(',')[1] });
    }
    return { natural: [img.naturalWidth, img.naturalHeight], out };
  },
  { dataUrl, widths: WIDTHS, quality: QUALITY },
);

await browser.close();

console.log(`${inputArg} — ${results.natural[0]}×${results.natural[1]}, ${(bytes.length / 1e6).toFixed(1)} MB`);
let total = 0;
for (const v of results.out) {
  const buf = Buffer.from(v.data, 'base64');
  total += buf.length;
  await writeFile(join(OUT_DIR, `${slugArg}-${v.w}.jpg`), buf);
  console.log(`  /work/r/${slugArg}-${v.w}.jpg  ${v.width}×${v.height}  ${(buf.length / 1024).toFixed(0)} KB`);
}
console.log(`  ${(total / 1e6).toFixed(2)} MB for the whole set; a phone loads only the first.`);
const largest = results.out[results.out.length - 1].w;
console.log(`\n  src: '/work/r/${slugArg}-${largest}.jpg'`);
