# Masters — your original files

The untouched camera and drone files live here. Nothing in this folder is
served to visitors: it sits outside `public/`, so Vite never copies it into a
build. A 13 MB drone frame belongs here, not on a listing page.

To put one on the site:

    npm run optimise:work -- masters/DJI_20260914165227_0100_D.jpg aerial-estate

That writes `public/work/r/aerial-estate-{640,960,1280,1800,2400}.jpg` and
prints the one line to paste into `src/data/images.ts`:

    src: '/work/r/aerial-estate-1800.jpg'

The site hands the browser the whole set, so a phone downloads the 640px file
(about 100 KB) and a desktop downloads the wide one. You keep the master.

## The five slots waiting for a file

`npm run adopt` knows these names. Save each original here under the name on
the left, run the command, and it re-encodes the file, points the right entry
in `src/data/images.ts` at it, and writes alt text describing that photograph.

| save it as                  | where it lands on the site      |
| --------------------------- | ------------------------------- |
| `dining-room.jpg`           | Dining room                     |
| `covered-terrace.jpg`       | Covered terrace                 |
| `living-room.jpg`           | Living room                     |
| `twilight-exterior.jpg`     | Front elevation                 |
| `contemporary-exterior.jpg` | Contemporary exterior           |

```bash
npm run adopt            # says what it would do, changes nothing
npm run adopt -- --write # does it
```

Add a row to the table at the top of `scripts/adopt-work.mjs` for anything else.
