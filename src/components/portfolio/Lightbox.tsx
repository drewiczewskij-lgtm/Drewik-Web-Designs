import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Figure } from '@/components/Figure';
import { Modal, CloseButton } from '@/components/ui/Modal';
import { Pill } from '@/components/ui/Bits';
import {
  categoryLabel,
  filmPoster,
  filmPosterFallback,
  isPlayable,
  videoEmbedUrl,
  type PortfolioItem,
} from '@/data/portfolio';
import { useFilmSource } from '@/lib/videoStore';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

/* ============================================================================
   THE VIEWER
   ----------------------------------------------------------------------------
   One overlay for both photographs and film.

   A photograph gets a full-bleed frame and its caption. A film with a source
   gets a player. A film WITHOUT a source gets the still and a plain line
   saying the film has not been uploaded yet — which is the honest option, and
   better than a play button that does nothing when pressed.

   Left and right arrows move through the set; Escape closes. The keyboard is
   how anyone looks at more than three of these.
   ========================================================================= */

export function Lightbox({
  items,
  index,
  onClose,
  onIndexChange,
}: {
  items: PortfolioItem[];
  /** Null when closed. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const open = index !== null;
  const item = open ? items[index] : null;
  const [playing, setPlaying] = useState(false);
  // A source that 404s must fall back to the still, not leave a black box.
  const [mediaFailed, setMediaFailed] = useState(false);
  const reduced = usePrefersReducedMotion();
  // Which way the next frame should come in from.
  const [direction, setDirection] = useState(1);

  const go = useCallback(
    (delta: number) => {
      if (index === null || items.length === 0) return;
      setDirection(delta);
      setPlaying(false);
      setMediaFailed(false);
      // Wraps, so the set never dead-ends at either edge.
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  // Never leave a player running behind a closed overlay.
  useEffect(() => {
    if (!open) {
      setPlaying(false);
      setMediaFailed(false);
    }
  }, [open]);

  if (!item) {
    return <Modal open={false} onClose={onClose} label="Portfolio viewer"><span /></Modal>;
  }

  return (
    <Viewer
      item={item}
      items={items}
      index={index ?? 0}
      open={open}
      onClose={onClose}
      go={go}
      playing={playing}
      setPlaying={setPlaying}
      mediaFailed={mediaFailed}
      setMediaFailed={setMediaFailed}
      direction={direction}
      reduced={reduced}
    />
  );
}

/** Split out so the film lookup can be a hook without sitting behind a return. */
function Viewer({
  item, items, index, open, onClose, go, playing, setPlaying,
  mediaFailed, setMediaFailed, direction, reduced,
}: {
  item: PortfolioItem;
  items: PortfolioItem[];
  index: number;
  open: boolean;
  onClose: () => void;
  go: (delta: number) => void;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  mediaFailed: boolean;
  setMediaFailed: (v: boolean) => void;
  direction: number;
  reduced: boolean;
}) {
  /* A film added through the manager wins over whatever the data file says —
     the same rule the photographs follow. */
  const added = useFilmSource(item.id);
  const playable = Boolean(added) || isPlayable(item);

  return (
    <Modal open={open} onClose={onClose} label={item.location ? `${item.title} — ${item.location}` : item.title} className="px-0">
      <div className="flex h-[100svh] w-full flex-col">
        {/* Top bar: where you are in the set, and the way out. */}
        <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Pill tone="neon">{categoryLabel(item.category)}</Pill>
            <span className="font-mono text-[11px] tracking-[0.18em] text-muted">
              {String((index ?? 0) + 1).padStart(2, '0')}
              <span className="text-faint"> / {String(items.length).padStart(2, '0')}</span>
            </span>
          </div>
          <CloseButton onClose={onClose} label="Close viewer" />
        </div>

        {/* The frame. */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
          <NavArrow direction="prev" onClick={() => go(-1)} disabled={items.length < 2} />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={item.id}
              custom={direction}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: direction * 34, scale: 0.985 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: direction * -24, scale: 0.99 }}
              transition={{ duration: reduced ? 0.15 : 0.38, ease: EASE_OUT_EXPO }}
              className="relative flex h-full max-h-full w-full items-center justify-center"
            >
              {playing && (added || item.video) && !mediaFailed ? (
                <div className="relative w-full max-w-[min(100%,1500px)] overflow-hidden border border-white/10 bg-black">
                  <div className="aspect-video w-full">
                    {(added ? added.kind === 'file' : item.video!.provider === 'file') ? (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video
                        src={added ? added.src : videoEmbedUrl(item.video!)}
                        controls
                        autoPlay
                        playsInline
                        onError={() => setMediaFailed(true)}
                        className="h-full w-full"
                      />
                    ) : (
                      <iframe
                        src={
                          added
                            ? videoEmbedUrl({ provider: added.kind as 'youtube' | 'vimeo', id: added.src })
                            : videoEmbedUrl(item.video!)
                        }
                        title={`${item.title} — film`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        // The player is third-party: give it nothing it does
                        // not need, and no reach back into this page.
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="h-full w-full border-0"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative flex h-full w-full items-center justify-center">
                  <Figure
                    image={item.image}
                    ownSrc={filmPoster(item)}
                    ownSrcFallback={filmPosterFallback(item)}
                    priority
                    sizes="100vw"
                    className="h-full max-h-full w-full"
                    imgClassName="object-contain"
                  />

                  {item.kind === 'video' && (
                    <div className="absolute inset-0 grid place-items-center">
                      {playable && !mediaFailed ? (
                        <button
                          type="button"
                          onClick={() => setPlaying(true)}
                          className="group grid h-20 w-20 place-items-center rounded-full border border-white/25 bg-void/60 backdrop-blur-lg transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.23,1,.32,1)] hover:scale-105 hover:border-neon active:scale-95"
                          style={{ boxShadow: '0 0 48px -12px rgb(45 125 255 / 0.9)' }}
                        >
                          <span className="sr-only">Play {item.title}</span>
                          <svg width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden="true">
                            <path d="M0 0L18 11L0 22V0Z" fill="currentColor" className="text-bright" />
                          </svg>
                        </button>
                      ) : (
                        <p className="max-w-[36ch] border border-white/12 bg-void/80 px-5 py-4 text-center text-[13px] leading-relaxed text-muted backdrop-blur-lg">
                          {mediaFailed ? (
                            <>
                              That film could not be loaded. Check the file exists at{' '}
                              <code className="font-mono text-[12px] text-cyan-soft">
                                {added ? added.src.slice(0, 48) : `public${item.video?.id ?? ''}`}
                              </code>
                              .
                            </>
                          ) : (
                            <>
                              This is a frame from the film. The film itself has not been
                              added yet — open the studio desk and drop the video on it,
                              or paste a YouTube or Vimeo link.
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <NavArrow direction="next" onClick={() => go(1)} disabled={items.length < 2} />
        </div>

        {/* The caption. */}
        <div className="shrink-0 border-t border-white/8 bg-void/70 px-4 py-5 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-[19px] leading-tight font-semibold text-bright">
                {item.title}
              </h2>
              <p className="max-w-[62ch] text-[13px] leading-relaxed text-muted">{item.caption}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-0.5 sm:text-right">
              {item.location && (
                <p className="font-mono text-[11px] tracking-[0.16em] text-cyan-soft uppercase">
                  {item.location}
                </p>
              )}
              {item.service && <p className="text-[12px] text-faint">{item.service}</p>}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function NavArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled?: boolean;
}) {
  const isPrev = direction === 'prev';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`absolute top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-void/60 backdrop-blur-md transition-[border-color,background-color,transform,opacity] duration-200 ease-[cubic-bezier(.23,1,.32,1)] hover:border-neon/60 hover:bg-neon/12 active:scale-95 disabled:pointer-events-none disabled:opacity-0 ${
        isPrev ? 'left-1 sm:left-4' : 'right-1 sm:right-4'
      }`}
      style={{ transitionProperty: 'border-color, background-color, transform, opacity' }}
    >
      <span className="sr-only">{isPrev ? 'Previous item' : 'Next item'}</span>
      <svg
        width="9"
        height="15"
        viewBox="0 0 9 15"
        fill="none"
        aria-hidden="true"
        style={{ transform: isPrev ? 'rotate(180deg)' : undefined }}
      >
        <path d="M1 1L7.5 7.5L1 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      </svg>
    </button>
  );
}
