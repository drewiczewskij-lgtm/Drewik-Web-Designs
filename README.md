# Arcadia Estates

**Properties Worth Remembering.**

A brand experience for a fictional luxury real-estate brokerage that represents
architecturally significant homes, waterfront land, and estates where the design
is the asset. Built as an editorial publication rather than a listings portal:
large photography, asymmetric compositions, hairline rules, and motion that is
used sparingly and on purpose.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build to dist/
npm run preview    # serve the production build
npm run check:images   # verify every photo source actually resolves
```

Node 20 or newer.

---

## What is here

**Home** (`/`)

| # | Section | What it does |
|---|---------|--------------|
| — | Hero | Sticky full-bleed plate. Scrolling *through* it keeps the camera moving into the next section. |
| 01 | Featured Residence | Editorial spread. The plate answers to the cursor by a few pixels. |
| 02 | Intent | The firm's position, and four figures worth stating. |
| 03 | Walkthrough | Six positions through Casa Aurelia. Drag to pan, click a mark, or use the arrow keys. |
| 04 | Selected Residences | Four properties, four different compositions. Nothing repeats. |
| 05 | Exceptional Places | The continental United States as a field of points. Five markets, all interactive. |
| 06 | Neighborhoods | Three full-bleed plates, each opening from a different inset on scroll. |
| 07 | The Principal | Portrait spread for Elena Marlowe, with Thomas Reyes beneath. |
| 08 | Enquiries | Underlined fields, real validation, a composed success state. |

**Residence detail** (`/residences/:slug`) — overview, architecture narrative,
walkthrough, gallery with a full-screen viewer, an interactive floor plan,
specification, location, representation, next residence, enquiry form.

**Also** `/privacy`, `/terms`, and a designed 404 that lists the portfolio.

---

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4** for layout utilities; the design system itself lives in
  `src/styles/index.css` as tokens and a small set of hand-written primitives
  (`.t-display`, `.t-label`, `.mask-line`, `.link-rule`, `.zoom-host`, `.grain-overlay`)
- **Motion** (Framer Motion 13) for reveals, scroll-linked transforms and route transitions
- **Lenis** for smooth scrolling, disabled entirely under `prefers-reduced-motion`
- **React Router 7**

No UI kit, no component library, no icon set.

---

## Project shape

```
src/
  components/
    Navigation.tsx        nav, mobile menu, portfolio search
    Hero.tsx              sticky hero and its scroll-through exit
    FeaturedResidence.tsx featured spread + the Intent band
    Walkthrough.tsx       the drag-to-explore tour
    PropertyCollection.tsx four asymmetric property compositions
    PropertyMap.tsx       the dot-matrix map of the United States
    Neighborhoods.tsx     scroll-revealed full-bleed plates
    Gallery.tsx           editorial plate sequence
    Lightbox.tsx          full-screen viewer (portalled to <body>)
    FloorPlan.tsx         drawn SVG plan with a linked room schedule
    Agent.tsx, Contact.tsx, Footer.tsx
    Figure.tsx            every photograph in the site goes through here
    Cursor.tsx, Grain.tsx, Loader.tsx, Type.tsx, Cta.tsx
  pages/                  Home, PropertyDetail, Legal, NotFound
  data/
    images.ts             ← the only place image sources live
    properties.ts         listings, tour scenes, floor plans, map positions
    site.ts               brand, navigation, neighborhoods, agents
  lib/                    smooth scroll, motion tokens, focus trap, pointer parallax,
                          the generated fallback plate
```

---

## Photography

**Every image resolves through `src/data/images.ts`.** Each entry carries a
source, real alternative text, a tone, and a focal point. To move onto a real
photo library, change `IMAGE_BASE` and the `src` of each entry — nothing else in
the application needs to change. `imageUrl()` and `imageSrcSet()` build the
responsive sources, and absolute or root-relative paths pass through untouched,
so a self-hosted library drops straight in.

The entries currently point at Unsplash photo IDs. **These were written without
network access and have not been verified against the live CDN.** Run
`npm run check:images` from an unrestricted connection before you show this to
anyone: it requests every source and names any that fail, so you know exactly
which lines to replace.

Nothing breaks if one is wrong. `Figure` falls back to a generated architectural
plate — a seeded, brand-coloured composition drawn in `src/lib/plate.ts` — so a
dead URL reads as a deliberate art plate rather than a broken image. The
screenshots taken during development show these plates, because the build
environment had no outbound network at all.

Fonts (Cormorant Garamond and Inter) load from Google Fonts with a considered
fallback stack behind them.

---

## Motion

The rules the site holds itself to:

- One easing family — `cubic-bezier(.16, 1, .3, 1)` for entrances, `cubic-bezier(.76, 0, .24, 1)` for curtains and wipes.
- Reveals fire once, never on re-entry.
- Scroll-linked work is transform and `clip-path` only, so it stays on the compositor.
- Nothing bounces, spins, floats or springs except the two magnetic controls.
- `prefers-reduced-motion: reduce` turns off Lenis, parallax, the camera drift, the grain drift and every transition; the page stays fully legible and fully operable.

---

## Accessibility

- Semantic landmarks, one `h1` per page, no heading-level jumps.
- Real alternative text on every photograph, written per image.
- Every control keyboard-operable, with a visible 2px focus ring. Links that
  draw their own underline are the only exception.
- The walkthrough is a labelled group: arrow keys move between rooms, hotspots
  are buttons, and the current room is announced through a live region.
- The mobile menu, search panel and lightbox trap focus, lock scroll, close on
  Escape, and return focus where it came from.
- Floor-plan rooms are focusable and are mirrored by a plain room schedule.
- The map is mirrored by a plain, fully operable list of markets.
- Skip link to main content.

---

## Performance

- The home page ships in the entry bundle; residence detail, the legal pages and
  the 404 are fetched on first navigation, and motion, router and scroll are
  their own chunks. Initial payload is roughly 97 KB of JavaScript and 9 KB of
  CSS over the wire.
- Responsive `srcset` at five widths; everything below the fold is lazy and
  async-decoded; only the hero plate is preloaded.
- Pointer tracking for the custom cursor writes straight to the DOM, so moving
  the mouse never re-renders the page.
- The loading sequence waits for the display face and the hero plate, holds for
  820 ms minimum, and is capped at 2.6 s.

---

## Notes

Arcadia Estates is invented. The residences, prices, plans, people and figures
are fiction, and `/terms` says so. The enquiry form validates and confirms
entirely in the browser — no request leaves the page. Point `onSubmit` in
`src/components/Contact.tsx` at a real endpoint to change that.
