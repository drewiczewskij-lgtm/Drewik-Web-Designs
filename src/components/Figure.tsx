import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  IMAGES,
  imageSrcSet,
  imageUrl,
  isDrawn,
  type ImageAsset,
  type ImageKey,
} from '@/data/images';
import { toneWash } from '@/lib/plate';
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
}: FigureProps) {
  const asset: ImageAsset = IMAGES[image];
  const drawn = isDrawn(asset.src);

  // `failed` is sticky: once we fall back to the plate we never re-request the
  // photograph, or the two would trade places on every load event.
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [image]);

  // An image served from cache can finish before React attaches its handlers,
  // so read the element itself once on mount.
  useEffect(() => {
    if (drawn) return;
    const el = ref.current;
    if (!el || !el.complete) return;
    if (el.naturalWidth > 0) setLoaded(true);
    else setFailed(true);
  }, [image, drawn]);

  const usePlate = drawn || failed;
  const src = usePlate
    ? renderScene(asset.scene, image)
    : imageUrl(asset.src, priority ? 1800 : 1280, quality);

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
        srcSet={usePlate ? undefined : imageSrcSet(asset.src, quality)}
        sizes={usePlate ? undefined : sizes}
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
          opacity: eager || loaded || usePlate ? 1 : 0,
          transition: eager ? undefined : 'opacity 1s cubic-bezier(.16,1,.3,1)',
        }}
      />
    </div>
  );
}
