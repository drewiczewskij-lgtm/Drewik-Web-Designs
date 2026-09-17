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
