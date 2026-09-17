import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  IMAGES,
  imageSrcSet,
  imageUrl,
  isDrawn,
  isOwnWork,
  type ImageAsset,
  type ImageKey,
} from '@/data/images';
import { OWN_WORK_ONLY } from '@/data/site';
import { toneWash } from '@/lib/plate';
import { usePhoto } from '@/lib/photoStore';
import { renderScene } from '@/lib/scenes';
import { cn } from '@/lib/cn';

interface FigureProps {
  image: ImageKey;
  /** Overrides the library's alt text. Use only where context changes it. */
  alt?: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  /** Above-the-fold art only. Everything else stays lazy. */
  priority?: boolean;
  sizes?: string;
  quality?: number;
  /** Disables the fade so a parent can choreograph the entrance itself. */
  eager?: boolean;
  objectPosition?: string;
  /**
   * Use this source instead of the library entry's, and count it as the
   * studio's own work. Only for frames that genuinely are theirs — a still
   * lifted from their own film, say — never as a way round the house rule.
   */
  ownSrc?: string;
  /** Tried once if `ownSrc` fails, before the frame gives up and goes blank. */
  ownSrcFallback?: string;
}

/**
 * Every photograph on the site goes through here. It owns responsive sources,
 * lazy loading, the decode fade, and the fallback.
 *
 * There are two paths. An entry with no `src` never touches the network at all:
 * it draws its plate immediately, which is how the site looks complete before a
 * single photograph has been added. An entry WITH a `src` loads normally, and
 * still falls back to the plate if that source fails — so a typo in a filename
 * degrades into art direction rather than a broken-image icon.
 */
export function Figure({
  image,
  alt,
  className,
  imgClassName,
  style,
  priority = false,
  sizes = '100vw',
  quality = 72,
  eager = false,
  objectPosition,
  ownSrc,
  ownSrcFallback,
}: FigureProps) {
  const asset: ImageAsset = IMAGES[image];

  /* A photograph dropped onto the photo manager wins over everything else.
     It is stored in this browser only — see `photoStore` — so this is a
     preview, but while it is there it is what the frame should show. */
  const dropped = usePhoto(image);
  const drawn = !dropped && isDrawn(asset.src);

  /* Not KM Productions' own photograph, and the house rule says only their work
     is shown. Hold the space with a quiet surface — no drawing, no stock frame,
     nothing that could be mistaken for their photography — and let the real one
     take it over the moment it is added. */
  const notOurs = OWN_WORK_ONLY && !ownSrc && !isOwnWork(asset.src, Boolean(dropped));

  /* Probe the film's thumbnail off-screen and only ever render one that came
     back. Reacting to `onError` on a live element meant the broken source was
     already on the page — that is the icon that kept showing — and it could not
     catch YouTube's other answer for a film still processing: a 120x90 grey
     placeholder, which loads perfectly well and is not a picture of anything.
     A real thumbnail is at least 320px wide, so width is the test. */
  const posterChain = useMemo(
    () => [ownSrc, ownSrcFallback].filter(Boolean) as string[],
    [ownSrc, ownSrcFallback],
  );
  const [poster, setPoster] = useState<string | undefined>(undefined);
  const [posterSettled, setPosterSettled] = useState(posterChain.length === 0);

  useEffect(() => {
    if (posterChain.length === 0) {
      setPoster(undefined);
      setPosterSettled(true);
      return;
    }
    let cancelled = false;
    setPoster(undefined);
    setPosterSettled(false);

    void (async () => {
      for (const url of posterChain) {
        const ok = await new Promise<boolean>((done) => {
          const probe = new Image();
          probe.onload = () => done(probe.naturalWidth >= 320);
          probe.onerror = () => done(false);
          probe.src = url;
        });
        if (cancelled) return;
        if (ok) {
          setPoster(url);
          setPosterSettled(true);
          return;
        }
      }
      if (!cancelled) setPosterSettled(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [posterChain]);

  // `failed` is sticky: once we fall back to the plate we never re-request the
  // photograph, or the two would trade places on every load event.
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [image, ownSrc]);

  // An image served from cache can finish before React attaches its handlers,
  // so read the element itself once on mount.
  useEffect(() => {
    if (drawn || notOurs) return;
    const el = ref.current;
    if (!el || !el.complete) return;
    if (el.naturalWidth > 0) setLoaded(true);
    else setFailed(true);
  }, [image, drawn, notOurs]);

  // A dropped photograph cannot fail to load — it is already in memory — so it
  // skips the fallback path entirely.
  /* With the house rule on, a photograph that fails to load falls back to
     nothing, not to a drawn plate: a missing file is a problem to fix, and
     quietly dressing it up as artwork is how one went unnoticed on the
     real-estate header. */
  const usePlate = !dropped && (drawn || failed) && !OWN_WORK_ONLY;
  const blank = OWN_WORK_ONLY && failed && !dropped;
  const src = dropped
    ? dropped.dataUrl
    : poster
      ? poster
      : usePlate
        ? renderScene(asset.scene, image)
        : imageUrl(asset.src, priority ? 1800 : 1280, quality);

  /* A film keeps its frame empty until the probe has spoken, and for good if it
     found nothing. The play control sits on top either way, so an empty frame
     here is a poster-less player, not a broken one. */
  const noPoster = posterChain.length > 0 && (!posterSettled || poster === undefined);
  if (notOurs || noPoster || (blank && !poster)) {
    return (
      <div
        // Empty on purpose, and empty is the honest state. `alt` would describe
        // a photograph that is not here, so the frame is hidden from assistive
        // technology entirely rather than announced as an image.
        aria-hidden="true"
        className={cn('overflow-hidden bg-surface/40', className)}
        style={style}
      />
    );
  }

  return (
    <div
      // No `position` here on purpose. Nearly every caller positions this frame
      // itself — usually `absolute inset-0` to fill a parent — and a `relative`
      // baked in here is the same kind of utility, so which of the two wins is
      // decided by their order in the built stylesheet rather than in the class
      // string. `relative` was winning, which turned every full-bleed frame into
      // a block that ADDED its own height to the layout: the image-backed page
      // headers were coming out around 1,700px tall.
      //
      // Nothing inside this element is absolutely positioned, so it does not
      // need to be a containing block. Callers that want one pass `relative`.
      className={cn('overflow-hidden', className)}
      style={{ background: toneWash(asset.tone), ...style }}
    >
      <img
        ref={ref}
        src={src}
        srcSet={usePlate || dropped || poster ? undefined : imageSrcSet(asset.src, quality)}
        sizes={usePlate || dropped || poster ? undefined : sizes}
        alt={alt ?? asset.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!failed) setFailed(true);
        }}
        className={cn('h-full w-full object-cover', imgClassName)}
        style={{
          objectPosition: objectPosition ?? asset.focus ?? '50% 50%',
          opacity: eager || loaded || usePlate || dropped ? 1 : 0,
          transition: eager ? undefined : 'opacity 1s cubic-bezier(.16,1,.3,1)',
        }}
      />
    </div>
  );
}
