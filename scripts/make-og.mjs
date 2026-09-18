#!/usr/bin/env node
/**
 * Draws the social share card — `public/og.png`, 1200 x 630.
 *
 *   npm run make:og
 *
 * This is the picture that appears when somebody pastes a link to the site into
 * a text message, Slack, Facebook or LinkedIn. Without it the link is a bare
 * grey box with a URL under it, which looks abandoned.
 *
 * It is generated rather than designed by hand so it cannot drift from the
 * brand: the type, the colours and the phone number all come from the same
 * places the website reads them from. Change the business details and run this
 * again.
 *
 * Uses the Playwright already installed for testing. Nothing new to install.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

/* Read the business details straight out of site.ts rather than repeating them.
   One regex is cheaper than a TypeScript loader for four strings. */
const site = await readFile(join(root, 'src/data/site.ts'), 'utf8');
const pick = (key, fallback) =>
  site.match(new RegExp(`${key}:\\s*'((?:[^'\\\\]|\\\\.)*)'`))?.[1]?.replace(/\\'/g, "'") ?? fallback;

const name = pick('name', 'KM Productions');
const tagline = pick('tagline', 'Make your property stand out.');
const phone = pick('phone', '');
const area = pick('serviceArea', '');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500&display=swap">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #04060b;
         font-family: 'Space Grotesk', system-ui, sans-serif; color: #eef4fd; }
  .card { position: relative; width: 1200px; height: 630px; padding: 72px; display: flex;
          flex-direction: column; justify-content: space-between; }
  /* The same aurora and perspective floor the site itself uses. */
  .aurora { position: absolute; inset: -20%; pointer-events: none; filter: blur(30px);
    background:
      radial-gradient(48% 42% at 16% 18%, rgb(45 125 255 / .34), transparent 62%),
      radial-gradient(42% 38% at 86% 10%, rgb(34 211 238 / .24), transparent 60%),
      radial-gradient(54% 48% at 66% 88%, rgb(139 92 246 / .2), transparent 64%); }
  .grid { position: absolute; inset: auto 0 0 0; height: 62%;
    background-image:
      linear-gradient(to right, rgb(45 125 255 / .16) 1px, transparent 1px),
      linear-gradient(to bottom, rgb(45 125 255 / .16) 1px, transparent 1px);
    background-size: 64px 64px; transform: perspective(360px) rotateX(64deg);
    transform-origin: bottom center;
    -webkit-mask-image: linear-gradient(to top, #000, transparent 88%); }
  .row { position: relative; display: flex; align-items: center; gap: 18px; }
  .mark { width: 54px; height: 54px; border-radius: 999px; border: 1px solid rgb(45 125 255 / .45);
          display: grid; place-items: center; box-shadow: 0 0 28px -8px rgb(45 125 255 / .9); }
  .brand { font-size: 27px; font-weight: 600; letter-spacing: -.02em; }
  .brand span { color: #7c8aa3; font-weight: 400; }
  h1 { position: relative; font-size: 92px; line-height: .96; letter-spacing: -.045em;
       font-weight: 600; max-width: 15ch; }
  .accent { background: linear-gradient(96deg, #5c9bff, #22d3ee 58%, #8b5cf6);
            -webkit-background-clip: text; background-clip: text; color: transparent; }
  .foot { position: relative; display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }
  .meta { font-family: 'JetBrains Mono', monospace; font-size: 15px; letter-spacing: .18em;
          text-transform: uppercase; color: #7c8aa3; line-height: 1.9; }
  .meta b { color: #eef4fd; font-weight: 500; }
  .rule { position: relative; height: 1px; margin: 34px 0 26px;
          background: linear-gradient(90deg, #2d7dff, #22d3ee 42%, transparent 88%);
          box-shadow: 0 0 16px -2px rgb(45 125 255 / .7); }
</style></head><body>
<div class="card">
  <div class="aurora"></div><div class="grid"></div>

  <div class="row">
    <div class="mark">
      <svg width="27" height="27" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.2" stroke="#67e8f9" stroke-width="1" opacity=".8"/>
        ${[0, 60, 120, 180, 240, 300]
          .map((d) => {
            const a = (d * Math.PI) / 180;
            return `<line x1="8" y1="8" x2="${(8 + 6.2 * Math.cos(a)).toFixed(2)}" y2="${(8 + 6.2 * Math.sin(a)).toFixed(2)}" stroke="#2d7dff" stroke-width=".9" opacity=".85"/>`;
          })
          .join('')}
        <circle cx="8" cy="8" r="2" fill="#67e8f9"/>
      </svg>
    </div>
    <div class="brand">KM <span>Productions</span></div>
  </div>

  <div>
    <h1>${tagline.replace(/\.$/, '')}<span class="accent">.</span></h1>
    <div class="rule"></div>
    <div class="foot">
      <div class="meta">
        Real estate · Commercial · Aerial<br>
        <b>Photography — Film — Drone</b>
      </div>
      <div class="meta" style="text-align:right">
        ${area}<br><b>${phone}</b>
      </div>
    </div>
  </div>
</div></body></html>`;

const browser = await chromium.launch({
  // Honour a pre-installed browser where the environment provides one.
  ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {}),
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
// Give the webfont a moment; the card is mostly type.
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

await mkdir(join(root, 'public'), { recursive: true });
const out = join(root, 'public/og.png');
await page.screenshot({ path: out });
await browser.close();

const { size } = await (await import('node:fs/promises')).stat(out);
console.log(`\npublic/og.png — 1200x630, ${Math.round(size / 1024)} KB`);
console.log(`"${name} — ${tagline}"\n`);
console.log('This is what a link to the site looks like when it is pasted anywhere.');
console.log('Re-run after changing the business details in src/data/site.ts.\n');
