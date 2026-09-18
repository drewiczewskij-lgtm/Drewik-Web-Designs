# The booking server

Everything the website cannot safely do in a browser: work out what to charge,
decide whether a slot is genuinely free, and talk to Stripe.

Without it the site still runs — the calendar works, the totals are real, the
forms validate — but it says on screen that it is a demonstration and no money
moves. Nothing is faked.

---

## Why this exists

Two things make a payment safe, and neither is possible in a browser.

**The price is recalculated here.** The browser sends *choices* — a package id,
some add-on ids, a size tier, a distance. It never sends a total. This server
runs `quote()` from `shared/catalog.mjs` and charges what *it* gets. Anyone can
edit a number in devtools; nobody can edit this one.

**The secret key lives here.** `STRIPE_SECRET_KEY` is read from the server's
environment in `_lib/stripe.mjs` and never leaves that file. It is not passed
to a handler, not logged, and not included in any error returned to a client.
Nothing prefixed `VITE_` is secret — those values are compiled into the
JavaScript and shipped to every visitor.

---

## Running it

```bash
# Development: site on 5173, server on 8787, /api proxied between them
npm run dev:full

# The server on its own
STRIPE_SECRET_KEY=sk_test_… npm run server
```

Then set `VITE_API_BASE=/api` in `.env.local` and the site switches from
demonstration mode to real bookings.

Check it is up:

```bash
curl localhost:8787/api/health
```

---

## Going live, in order

1. **Get Stripe test keys.** Dashboard → Developers → API keys. Take the one
   beginning `sk_test_`. A test key only ever accepts test cards, so you can
   click the whole flow without moving money. Card `4242 4242 4242 4242`, any
   future expiry, any CVC.

2. **Set the server's environment.** Not in `.env.local`, which belongs to the
   website — in whatever your host uses for server variables:

   ```
   STRIPE_SECRET_KEY=sk_test_…
   KM_SITE_ORIGIN=https://your-site.com
   KM_DATA_FILE=/var/lib/km/bookings.json
   KM_ADMIN_TOKEN=<a long random string>
   ```

3. **Add the webhook.** Dashboard → Developers → Webhooks → Add endpoint,
   pointing at `https://your-site.com/api/webhook`, subscribed to:

   - `checkout.session.completed`
   - `checkout.session.expired`

   Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

   **This step is not optional.** Without it a booking is written as `pending`
   and never becomes `confirmed`, because nothing ever tells the server the
   payment succeeded. Test it locally with the Stripe CLI:

   ```bash
   stripe listen --forward-to localhost:8787/api/webhook
   ```

4. **Book something.** Walk the whole flow with a test card and confirm the
   booking turns up as `confirmed` in `KM_DATA_FILE` and at `/admin`.

5. **Swap to live keys** only once step 4 has worked end to end.

---

## The endpoints

| Method | Path                   | What it does |
| ------ | ---------------------- | ------------ |
| `GET`  | `/api/health`          | Whether Stripe and the admin API are configured. |
| `GET`  | `/api/availability`    | Taken windows between two dates. Dates and durations only — no customer data. |
| `GET`  | `/api/slots`           | Start times for one date and one duration. |
| `POST` | `/api/bookings`        | Re-prices, re-checks the slot, writes a `pending` booking, returns a Stripe Checkout URL. |
| `GET`  | `/api/bookings/:ref`   | Enough to render a confirmation. Deliberately not the address or phone number. |
| `POST` | `/api/webhook`         | Stripe only. Signature-verified. Moves `pending` → `confirmed`. |
| `GET`  | `/api/admin/bookings`  | Everything, including customer details. Requires `KM_ADMIN_TOKEN`. |

---

## How double-booking is actually prevented

Two people can have the same slot open on screen. Only one can have it.

The slot is checked twice. Once when the request arrives, to fail fast; and
again inside the store's write lock, against the committed list of bookings,
in the instant before the write. The second check is the one that matters —
whichever request takes the lock second sees the first one's booking and is
refused with a 409 and a sentence explaining why.

`npm run test:booking` covers the rules this depends on. To watch it happen,
fire several requests at one free slot at once: exactly one comes back `ok`.

A booking holds its slot from the moment it is written, *before* payment. That
is deliberate — the alternative is taking someone's money for a time that was
sold while they typed their card number. An abandoned checkout expires after 30
minutes and releases the slot, and Stripe's `checkout.session.expired` webhook
releases it sooner.

---

## Where bookings are stored

A JSON file, written atomically (write to a temporary file, then rename, so a
crash mid-write cannot corrupt the diary), guarded by an in-process lock.

That is genuinely enough for one photographer, and it means no database to
provision or pay for. **It assumes a single server process.** The lock is held
in memory, so two processes — or a serverless platform that runs your function
several times over — would not see each other's writes.

When you outgrow it, replace the four functions at the bottom of
`_lib/store.mjs`: `all`, `add`, `update` and `find`. Nothing else in this
directory touches the file. `add` takes a guard that runs inside the lock; on a
real database that becomes a transaction with a unique constraint on
`(date, time)`.

Make sure `KM_DATA_FILE` is on a **persistent** disk. A container filesystem
that resets on deploy will quietly lose your diary.

---

## Running it somewhere else

`handlers.mjs` is deliberately framework-free: every handler is
`(input) => { status, body }`, with no request or response object. `server.mjs`
is only routing.

To run on Vercel, Netlify, Cloudflare or anything else, write a thin adapter
that unpacks that platform's request into `{ body, query, params, headers,
rawBody, origin }` and writes the result back out. The handlers themselves do
not change.

One rule for any adapter: **the webhook needs the raw request body, byte for
byte.** Most frameworks parse JSON before you see it, which changes the bytes
the signature was computed over and makes every webhook fail verification.

---

## Security notes

- `STRIPE_SECRET_KEY` never leaves `_lib/stripe.mjs`.
- Webhook signatures are verified with a constant-time comparison and a
  five-minute timestamp tolerance, so a captured request cannot be replayed.
- Checkout sessions use an idempotency key derived from the booking reference,
  so a double-submitted form cannot create two charges.
- `GET /api/availability` returns dates and durations only — never a name,
  address or email.
- `GET /api/bookings/:ref` returns a first name and the booking's shape, not the
  address or phone number: a six-character reference is short enough to guess.
- `GET /api/admin/bookings` is disabled outright unless `KM_ADMIN_TOKEN` is set.
- There is a crude per-IP rate limit. It will not stop a determined attacker;
  put a real one in front of this if the site gets attention.
- Internal error messages go to the log, never to the client.
