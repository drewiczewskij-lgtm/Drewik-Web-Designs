# Your photographs and films go here

Anything in this folder is served from the site root, so a file saved as
`public/work/hero-twilight.jpg` is reachable at `/work/hero-twilight.jpg`.

## The fast way

1. Save your files here, named after the image key they belong to
   (`npm run check:images` prints every key).
2. See what would happen:

   ```bash
   npm run link:work
   ```

3. Apply it:

   ```bash
   npm run link:work -- --write
   ```

That fills in `src/data/images.ts` and `src/data/portfolio.ts` for you.

Names are matched loosely — case, spaces, hyphens and underscores are all
ignored — and there is a short alias list at the top of `scripts/link-work.mjs`
for common names like `founder.jpg` and `kitchen.jpg`. Add your own aliases
there if it is easier than renaming files.

## The manual way

Open `src/data/images.ts` and set the `src` of an entry:

```ts
  heroTwilight: {
    src: '/work/hero-twilight.jpg',
    alt: '…',
```

For a film, open `src/data/portfolio.ts` and give the item a source:

```ts
    kind: 'video',
    video: { provider: 'file', id: '/work/277-north-place.mp4' },
```

YouTube and Vimeo work too, if you would rather not host the file:

```ts
    video: { provider: 'youtube', id: 'dQw4w9WgXcQ' },
```

## After you add anything

**Rewrite the `alt` text.** It currently describes the drawn placeholder, and
that description will be wrong once a real photograph is behind it. Alt text is
read aloud to people who cannot see the image and is read by search engines, so
a wrong one is worse than a short one.

Then check everything resolves:

```bash
npm run check:images
```

## Sizes worth aiming for

| What            | Long edge | Format          |
| --------------- | --------- | --------------- |
| Hero and spreads| 2400px    | JPEG q80, or WebP |
| Portfolio tiles | 1600px    | JPEG q80, or WebP |
| Portrait        | 1400px    | JPEG q80        |
| Film            | 1080p     | MP4 (H.264/AAC) |

Files here are served as-is — there is no image pipeline resizing them — so a
40MB export will be a 40MB download. Export at a sensible size before saving.
