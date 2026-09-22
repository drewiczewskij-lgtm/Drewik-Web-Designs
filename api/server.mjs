#!/usr/bin/env node
import { createServer } from 'node:http';
import {
  getAvailability,
  postBooking,
  getBooking,
  postWebhook,
  getAdminBookings,
  getSlots,
} from './handlers.mjs';
import { stripeConfigured, isTestMode } from './_lib/stripe.mjs';

/* ============================================================================
   THE BOOKING SERVER
   ----------------------------------------------------------------------------
   A small Node server with no dependencies. Run it next to the built site and
   the booking flow becomes real.

       STRIPE_SECRET_KEY=sk_test_… node api/server.mjs

   Routing only. Every decision lives in `handlers.mjs`, which is deliberately
   framework-free so the same code can be dropped into a serverless function
   without being rewritten. See README.md in this directory.
   ========================================================================= */

const PORT = Number(process.env.PORT ?? 8787);

/** Where the browser is allowed to call from. '*' only when nothing is set. */
const ORIGIN = process.env.KM_SITE_ORIGIN ?? '';

/** Bodies are small. Anything larger than this is not a booking. */
const MAX_BODY = 64 * 1024;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('Request body too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function send(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
    // A booking endpoint has no business being framed or sniffed.
    'X-Content-Type-Options': 'nosniff',
    ...corsHeaders(),
    ...extraHeaders,
  });
  res.end(payload);
}

function corsHeaders() {
  if (!ORIGIN) return {};
  return {
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin',
  };
}

/* A crude per-IP limit. It will not stop a determined attacker, but it stops
   a loop, a stuck retry, and someone walking the reference space by hand. */
const hits = new Map();
const WINDOW_MS = 60_000;
const MAX_HITS = 40;

function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    // Keep the map from growing without bound on a long-running process.
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now - v.start > WINDOW_MS) hits.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_HITS;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const query = Object.fromEntries(url.searchParams);
  const ip = req.socket.remoteAddress ?? 'unknown';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (rateLimited(ip)) {
    send(res, 429, { ok: false, error: 'Too many requests. Wait a minute and try again.' });
    return;
  }

  // The origin Stripe should return the customer to. Configured value wins;
  // the Referer is only a fallback for local development.
  const origin = ORIGIN || (req.headers.referer ? new URL(req.headers.referer).origin : `http://localhost:5173`);

  try {
    if (req.method === 'GET' && path === '/health') {
      send(res, 200, {
        ok: true,
        stripe: stripeConfigured() ? (isTestMode() ? 'test mode' : 'live mode') : 'not configured',
        admin: process.env.KM_ADMIN_TOKEN ? 'enabled' : 'disabled',
      });
      return;
    }

    if (req.method === 'GET' && path === '/availability') {
      const { status, body } = await getAvailability({ query });
      send(res, status, body);
      return;
    }

    if (req.method === 'GET' && path === '/slots') {
      const { status, body } = await getSlots({ query });
      send(res, status, body);
      return;
    }

    if (req.method === 'POST' && path === '/bookings') {
      const raw = await readBody(req);
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        send(res, 400, { ok: false, error: 'The request body was not valid JSON.' });
        return;
      }
      const { status, body } = await postBooking({ body: parsed, origin });
      send(res, status, body);
      return;
    }

    const bookingMatch = path.match(/^\/bookings\/([A-Za-z0-9-]{1,20})$/);
    if (req.method === 'GET' && bookingMatch) {
      const { status, body } = await getBooking({ params: { reference: bookingMatch[1] } });
      send(res, status, body);
      return;
    }

    if (req.method === 'POST' && path === '/webhook') {
      // The RAW body, byte for byte. Parsing it first would change the bytes
      // the signature was computed over and every webhook would be rejected.
      const rawBody = await readBody(req);
      const { status, body } = await postWebhook({ rawBody, headers: req.headers });
      send(res, status, body);
      return;
    }

    if (req.method === 'GET' && path === '/admin/bookings') {
      const { status, body } = await getAdminBookings({ headers: req.headers, query });
      send(res, status, body);
      return;
    }

    send(res, 404, { ok: false, error: `No route for ${req.method} ${url.pathname}.` });
  } catch (e) {
    // The message goes to the log, never to the client — it can carry paths,
    // keys and stack details that are nobody else's business.
    console.error(`[km] ${req.method} ${url.pathname}:`, e);
    send(res, 500, { ok: false, error: 'Something went wrong on our end. Please try again.' });
  }
});

server.listen(PORT, () => {
  console.log(`KM Productions booking server → http://localhost:${PORT}`);
  console.log(
    `  Stripe: ${stripeConfigured() ? (isTestMode() ? 'TEST mode' : '⚠ LIVE mode — real cards will be charged') : 'not configured (bookings held, nothing charged)'}`,
  );
  console.log(`  Admin API: ${process.env.KM_ADMIN_TOKEN ? 'enabled' : 'disabled (set KM_ADMIN_TOKEN)'}`);
  if (!ORIGIN) console.log('  KM_SITE_ORIGIN not set — CORS is off and Stripe return URLs use the Referer.');
});
