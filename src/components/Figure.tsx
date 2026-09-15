import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { IMAGES, imageSrcSet, imageUrl, type ImageAsset, type ImageKey } from '@/data/images';
import { architecturalPlate, toneWash } from '@/lib/plate';
import { cn } from '@/lib/cn';

interface FigureProps {
  image: ImageKey;
  /** Overrides the alt text from the library. Use only when context changes it. */
  alt?: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  /** Hero and above-the-fold art only. Everything else stays lazy. */
  priority?: boolean;
  sizes?: string;
  quality?: number;
  /** Disables the fade so a parent can choreograph the entrance itself. */
  eager?: boolean;
  objectPosition?: string;
}

/**
 * Every photograph in the site goes through here. It owns responsive sources,
 * lazy loading, the decode fade, and the fallback: if the network never answers,
 * the frame fills with a generated architectural plate instead of breaking.
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
  // `failed` is sticky: once we fall back to the plate we never re-request the
  // remote source, or the two would trade places on every load event.
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [image]);

  // An image served from cache can finish before React attaches the handlers,
  // so read the element itself once on mount.
  useEffect(() => {
    const el = ref.current;
    if (!el || !el.complete) return;
    if (el.naturalWidth > 0) setLoaded(true);
    else setFailed(true);
  }, [image]);

  const src = failed
    ? architecturalPlate(image, asset.tone)
    : imageUrl(asset.src, priority ? 1800 : 1280, quality);

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ background: toneWash(asset.tone), ...style }}
    >
      <img
        ref={ref}
        src={src}
        srcSet={failed ? undefined : imageSrcSet(asset.src, quality)}
        sizes={failed ? undefined : sizes}
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
          opacity: eager || loaded || failed ? 1 : 0,
          transition: eager ? undefined : 'opacity 1s cubic-bezier(.16,1,.3,1)',
        }}
      />
    </div>
  );
}
