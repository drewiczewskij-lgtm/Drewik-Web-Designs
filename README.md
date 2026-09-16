# KM Productions

**Make your property stand out.**

A complete site for a real estate and commercial production company: portfolio,
services, transparent pricing, a nine-step booking flow with live availability,
and a payment architecture built for Stripe.

It is not a brochure with a contact form. A visitor can arrive, see the work,
understand the packages, pick a date that is genuinely free, see the exact
total, pay, and get a confirmation — without anybody picking up a phone.

---

## Running it

```bash
npm install
npm run dev              # the site, on http://localhost:5173
npm run dev:full         # the site AND the booking server together
npm run build            # typecheck + production build to dist/
npm run preview          # serve the production build

npm run test:booking     # 27 assertions on pricing and availability
npm run check:images     # report which frames are drawn and which are real
npm run link:work        # wire files in public/work/ into the site
```

Node 20 or newer.

---

## Opening it on Windows (PowerShell)

### The quickest look — no install at all

```powershell
npm run build:single
```

That folds the entire site into one file, `km-productions.html`, about 730 KB.
Double-click it and the site runs: no server, no internet, nothing to set up.
Every page, the portfolio viewer and the whole booking flow work from the file.

To open it from PowerShell:

```powershell
Invoke-Item .\km-productions.html
```

### Running it properly, from scratch

```powershell
# 1. Install Node and Git (skip either if you already have it).
#    Close and reopen PowerShell afterwards so the PATH updates.
winget install OpenJS.NodeJS.LTS
winget install Git.Git

# 2. Get the code.
git clone https://github.com/drewiczewskij-lgtm/Drewik-Web-Designs.git
cd Drewik-Web-Designs
git checkout claude/serene-wozniak-bgkmv6

# 3. Install and run.
npm install
npm run dev
```

Then open <http://localhost:5173>. Edits save and appear instantly. `Ctrl+C`
stops it.

### If PowerShell refuses to run npm

A default Windows install blocks script files, so `npm` fails with *"npm.ps1
cannot be loaded because running scripts is disabled on this system"*. This is
the usual fix, and it only affects your own user account:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Answer `Y`, then reopen PowerShell.

### Other useful commands

```powershell
npm run dev:full      # the site AND the booking server, together
npm run build         # production build into dist\
npm run preview       # serve that build, to check it before deploying
npm run test:booking  # 27 checks on pricing and availability
npm run link:work     # wire files from public\work\ into the site
```

All of these work the same in PowerShell, `cmd` and a terminal on macOS or
Linux — none of them depends on shell syntax.

---

## The five files you will actually edit

Almost everything you will want to change lives in one of these. Nothing else
needs touching, and none of them contains any layout code.

| File | What it controls |
| --- | --- |
| `shared/catalog.mjs` | **Every price.** Packages, add-ons, size tiers, tax, travel. |
| `shared/schedule.mjs` | **When you work.** Hours, slot length, buffer, notice, blocked dates. |
| `src/data/site.ts` | Name, phone, email, service area, social links, the founder. |
| `src/data/images.ts` | Every photograph and film on the site. |
| `src/data/portfolio.ts` | The portfolio: titles, locations, categories, captions. |

Also: `src/data/services.ts`, `src/data/testimonials.ts` and `src/data/faq.ts`.

The two in `shared/` are plain JavaScript rather than TypeScript on purpose —
the website imports them and so does the payment server, so a price can never be
right in the browser and wrong on the invoice.

---

## Putting your own photographs on it

**Right now every image on this site is drawn, not photographed.** Each frame
renders a composed, blue-hour illustration of its subject from
`src/lib/scenes.ts`. That is deliberate: nothing is requested from a network, so
nothing can ever 404, and the site looks finished on day one. The portfolio page
says so plainly rather than passing illustrations off as work.

To replace them:

```bash
# 1. Put your files here, named after the image key they belong to
cp ~/photos/*.jpg public/work/

# 2. See what would happen — this changes nothing
npm run link:work

# 3. Apply it
npm run link:work -- --write
```

That fills in `src/data/images.ts` and `src/data/portfolio.ts` for you. Names are
matched loosely (case, spaces, hyphens and underscores are ignored) and there is
an alias list at the top of `scripts/link-work.mjs` for names like `founder.jpg`.

Or do it by hand — set the `src` of one entry in `src/data/images.ts` and that
frame is yours:

```ts
  heroTwilight: {
    src: '/work/hero-twilight.jpg',
    alt: 'Describe YOUR photograph here.',
```

**Rewrite the `alt` text whenever you swap a picture.** It currently describes
the drawing, and that description becomes wrong the moment a real photograph is
behind it. See `public/work/README.md` for sizes worth exporting at.

Films work the same way, with a file or a YouTube/Vimeo id:

```ts
    video: { provider: 'file', id: '/work/277-north-place.mp4' },
    video: { provider: 'youtube', id: 'dQw4w9WgXcQ' },
```

A film with no source opens its still frame and says the film has not been
uploaded yet — it never shows a play button that does nothing.

---

## The pages

| Route | What is on it |
| --- | --- |
| `/` | Cinematic hero, services, process, selected work, why us, pricing preview, testimonials, FAQ. |
| `/real-estate` | Six kinds of coverage in depth, the craft behind them, the process, filterable work. |
| `/services` | Each service: what is included, how long it takes, what it starts at. |
| `/portfolio` | 26 pieces, category filters, full-screen viewer with keyboard navigation. |
| `/pricing` | Four packages, a live quote calculator, every add-on priced, payment questions. |
| `/book` | The nine-step booking flow. |
| `/commercial` | Who commercial work is for, how it is scoped, honest ranges, a quote form. |
| `/about` | The founder, the kit, what can actually be promised. |
| `/contact` | Phone, email, hours, service area, enquiry form. |
| `/faq` | Twenty questions in five groups. |
| `/admin` | The studio desk — the diary, the price list, and where to change each. |
| `/privacy`, `/terms` | Drafted to match what the site actually does. |

---

## Booking and payments

### Out of the box

The site runs in **demonstration mode**. The calendar works, the totals are
real, the forms validate — but no money moves and no booking leaves the browser.
Every screen that is pretending says so, in plain words, where the customer can
read it. Nothing fakes a payment.

### Making it real

One variable switches it over:

```
VITE_API_BASE=/api
```

…and the small server in `api/` needs to be running. **[`api/README.md`](api/README.md)
is the full walkthrough** — Stripe keys, the webhook, and the order to do it in.

Why a server at all: a payment cannot be made safe from a browser. The price has
to be recalculated somewhere the customer cannot edit, and the Stripe secret key
has to live somewhere they cannot read. The browser sends *choices* — a package
id, some add-on ids, a size tier, a distance — and never a total.

```
SELECT SERVICE → DATE/TIME → DETAILS → REVIEW → PAYMENT → CONFIRMATION
                                                    │
                          server re-prices it, re-checks the slot,
                          then hands off to Stripe's hosted checkout
```

No card number ever touches this code, which keeps you out of PCI scope.

### Double-booking

Two people can have the same slot open on screen. Only one can have it.

The slot is checked twice: once when the request arrives, and again inside the
store's write lock, against the committed list, in the instant before the write.
The second check is the one that matters. Fire five simultaneous requests at one
free slot and exactly one comes back `ok`; the rest get a 409 and a sentence
explaining why.

A booking holds its slot from the moment it is written, *before* payment — the
alternative is taking someone's money for a time that was sold while they typed
their card number. An abandoned checkout expires after 30 minutes.

---

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4** for layout; the design system itself is hand-written in
  `src/styles/index.css` as tokens and a small set of primitives (`.t-display`,
  `.t-label`, `.glass`, `.edge`, `.tilt`, `.spotlight`, `.grid-floor`, `.aurora`)
- **Motion** (Framer Motion 13) for reveals, scroll-linked transforms and steps
- **Lenis** for smooth scrolling, off entirely under `prefers-reduced-motion`
- **React Router 7**

No UI kit, no component library, no icon set, and **no 3D library**.

### Why no Three.js

The hero's wireframe solids are projected by hand in
`src/components/fx/NeonField.tsx` — about two hundred lines of vector maths.
Three.js would have added several hundred kilobytes to the first load of a site
whose entire business case is a listing agent not leaving before the hero
renders. The maths was worth it; the weight was not.

That canvas caps device pixel ratio at 2, stops when the tab is hidden or it
scrolls out of view, and under `prefers-reduced-motion` draws a single still
frame and never moves again.

---

## Project shape

```
shared/
  catalog.mjs         ← every price. Read by the site AND the server.
  schedule.mjs        ← when you work. Read by the site AND the server.
api/
  server.mjs          routing only, no dependencies
  handlers.mjs        the decisions — framework-free, portable to any host
  _lib/store.mjs      atomic JSON store with a write lock
  _lib/stripe.mjs     Stripe over REST; the secret key never leaves this file
src/
  components/
    fx/               NeonField, Reveal, TiltCard, Magnetic, Cursor, Grain, Loader
    ui/               Button, Field, Accordion, Modal, Bits
    layout/           Navigation, Footer, PageHeader
    sections/         Hero, ServicesGrid, FeaturedWork, WhyUs, Process,
                      Testimonials, PricingPreview, FaqSection, CtaBand
    portfolio/        PortfolioGrid, PortfolioCard, Lightbox
    pricing/          PricingCard
    booking/          BookingFlow, Progress, Calendar, OrderSummary, OptionCard,
                      steps/Choose, steps/Schedule, steps/Checkout
    forms/            EnquiryForm
    Figure.tsx        every photograph on the site goes through here
  lib/                booking store, api client, seo, scenes, motion, validation
  data/               images, portfolio, services, testimonials, faq, site
  pages/              twelve routes
```

---

## Motion

The rules the site holds itself to:

- **Interface under 300ms, the page up to a second.** A control that takes 400ms
  to respond feels broken however pretty the curve is. A scroll reveal you see
  once can afford to be cinematic.
- **Nothing uses `ease-in`.** It withholds movement at exactly the moment the eye
  is watching hardest, and reads as lag.
- **Everything pressable scales to 0.97 on `:active`.** It is the cheapest way to
  make an interface feel like it is listening.
- **Nothing enters from `scale(0)`.** Nothing in the world appears from nothing.
- Scroll-linked work is transform and `clip-path` only, so it stays on the
  compositor.
- Reveals fire once, never on re-entry.
- Hover effects are gated behind `(hover: hover) and (pointer: fine)`, so a tap
  on a phone does not trigger a hover state that then sticks.
- `prefers-reduced-motion: reduce` stops Lenis, the canvas, the parallax, the
  tilt, the grain and every transition. The page stays fully legible and fully
  operable.

---

## Accessibility

Audited across all twelve routes — one `h1` each, no heading-level jumps, no
unnamed controls, no image without alt text.

- Real alternative text on every frame, written per image.
- Every control keyboard-operable with a visible focus ring.
- The lightbox and the mobile menu trap focus, lock scroll, close on Escape and
  return focus where it came from. Arrow keys walk the portfolio.
- The calendar is a grid of buttons: arrows move by day, up and down by week.
- Form errors are tied to their input with `aria-describedby`, announced through
  a live region, and written to say what to do next rather than to scold.
- A disabled Continue button always states *why* it is disabled.
- Route changes are announced to screen readers.
- Skip link to main content.

---

## Performance

- The home page ships in the entry bundle; the other eleven routes are fetched
  on first navigation. Roughly 93 KB of JavaScript gzipped for the first page.
- The drawn plates are inline SVG data URLs — no image requests at all until you
  add real photographs, and then only for the ones you added.
- Pointer tracking for the cursor, the tilt and the spotlight writes straight to
  the DOM, so moving the mouse never re-renders anything.
- The loader waits for the display face, holds for 620ms minimum, and is capped
  at 2.2s — a visitor on a bad connection is never held at a logo.

---

## What is placeholder, and what is not

This matters, so it is listed rather than buried.

**Invented, and labelled as such on the site:**

- **Testimonials.** Every quote in `src/data/testimonials.ts` was written to
  show the section. They carry an "Example" label and the section carries a
  notice. Delete `placeholder: true` from an entry once the words are genuinely
  someone else's, and the labelling disappears on its own.
- **Photographs and films.** All drawn. See above.
- **The founder's portrait.** A drawn stand-in, labelled on the About page.

**Placeholder facts to replace** — marked `// PLACEHOLDER` in `src/data/site.ts`:
the domain, the founding year, the service area, the city, and the social links.

**Real, and used throughout:** the phone number `(662) 322-8022` and the email
`bryan.miller@renasant.com`.

**Deliberately absent:** there are no client counts, no awards, no "years of
experience" and no logos anywhere on this site, because there was nothing
verifiable to put there. The statistics that *are* shown — 24-hour turnaround,
35 images, 4K, shot by the founder — are delivery promises you control, not
achievements. The About page says so out loud.

---

## Tests

```bash
npm run test:booking
```

27 assertions, no framework, no dependencies. They run the same functions the
site and the payment server run, so a change to a price or a working day that
breaks an assumption fails here rather than on somebody's invoice.

Covered: line items always sum to the subtotal; an add-on already inside a
package cannot be bought twice; unknown add-ons are dropped rather than
accepted; negative mileage cannot be used as a discount; a quote-only package
refuses to produce a total; the buffer blocks the slots either side of a
booking; a shoot that cannot fit in the day is never offered; the notice period
keeps today out of the diary; and `'2026-07-04'` is read as the 4th of July
rather than as the 3rd.
