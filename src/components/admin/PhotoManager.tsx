import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Figure } from '@/components/Figure';
import { Button } from '@/components/ui/Button';
import { Notice, Pill } from '@/components/ui/Bits';
import { IMAGES, IMAGE_KEYS, isDrawn, type ImageKey } from '@/data/images';
import { PORTFOLIO } from '@/data/portfolio';
import { SERVICES, COMMERCIAL_SECTORS } from '@/data/services';
import {
  STORAGE_BUDGET_BYTES,
  bytesUsed,
  clearAll,
  isPlaceholderSource,
  put,
  remove,
  slotForFilename,
  usePhotos,
} from '@/lib/photoStore';
import { EASE_UI } from '@/lib/motion';
import { cn } from '@/lib/cn';

/* ============================================================================
   THE PHOTO MANAGER
   ----------------------------------------------------------------------------
   Drag photographs onto the site and see them in place immediately — no
   terminal, no file editing, no build.

   It is honest about what it is. The pictures are held in THIS browser only,
   so the panel says so at the top, shows how much room is left, and points at
   `public/work/` for the version that ships. Being able to judge a photograph
   in its real layout in ten seconds is worth having even so.
   ========================================================================= */

/* Grouped by the page each frame appears on, worked out from the data rather
   than typed out here — so a new portfolio piece or service shows up in this
   panel without anyone remembering to add it. A frame used on several pages is
   listed once, under the first page that claims it. */

const unique = (keys: ImageKey[]) => [...new Set(keys)];

function buildGroups(): { label: string; note: string; keys: ImageKey[] }[] {
  const claimed = new Set<ImageKey>();
  const take = (keys: ImageKey[]) => {
    const out = unique(keys).filter((k) => !claimed.has(k));
    for (const k of out) claimed.add(k);
    return out;
  };

  const groups = [
    {
      label: 'Portfolio',
      note: 'Every piece in the portfolio grid. These are the ones that claim to be your work, so replace them first.',
      keys: take(PORTFOLIO.map((p) => p.image)),
    },
    {
      label: 'Services',
      note: 'One image per service, on the services page and the home page cards.',
      keys: take(SERVICES.map((sv) => sv.image)),
    },
    {
      label: 'Commercial',
      note: 'The eight business types on the commercial page.',
      keys: take(COMMERCIAL_SECTORS.map((c) => c.image)),
    },
    {
      label: 'Home page',
      note: 'The hero and the frames beneath it.',
      keys: take(['heroTwilight', 'homeAerial', 'homeInterior', 'homeFilm'] as ImageKey[]),
    },
    {
      label: 'About',
      note: 'The founder’s portrait and the equipment still.',
      keys: take(['founderPortrait', 'gearStill'] as ImageKey[]),
    },
  ];

  // Anything not claimed above still needs somewhere to be replaced from.
  const rest = IMAGE_KEYS.filter((k) => !claimed.has(k));
  if (rest.length) {
    groups.push({
      label: 'Elsewhere',
      note: 'Used in page headers and the call-to-action bands.',
      keys: rest,
    });
  }
  return groups.filter((g) => g.keys.length > 0);
}

const GROUPS = buildGroups();

const ORDER: ImageKey[] = GROUPS.flatMap((g) => g.keys);

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function PhotoManager() {
  const photos = usePhotos();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastDrop, setLastDrop] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);

  const used = bytesUsed(photos);
  const count = Object.keys(photos).length;
  const pct = Math.min(100, Math.round((used / STORAGE_BUDGET_BYTES) * 100));

  /** One file into one named slot. */
  const accept = useCallback(async (key: ImageKey, file: File) => {
    setError(null);
    setBusy(true);
    try {
      await put(key, file);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That photograph could not be stored.');
    } finally {
      setBusy(false);
    }
  }, []);

  /**
   * A pile of files dropped anywhere. Each one goes to the slot its filename
   * names; anything unrecognised fills the next empty slot in order, so a drop
   * always puts every photograph somewhere rather than rejecting half of them.
   */
  const acceptMany = useCallback(
    async (files: File[]) => {
      setError(null);
      setBusy(true);
      const placed: string[] = [];
      const taken = new Set(Object.keys(photos));
      try {
        for (const file of files) {
          if (!file.type.startsWith('image/')) continue;
          let key = slotForFilename(file.name);
          if (!key || taken.has(key)) {
            const free = ORDER.find((k) => !taken.has(k));
            if (!free) break;
            key = free;
          }
          taken.add(key);
          await put(key, file);
          placed.push(`${file.name} → ${key}`);
        }
        setLastDrop(placed);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Some photographs could not be stored.');
      } finally {
        setBusy(false);
      }
    },
    [photos],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      void acceptMany([...e.dataTransfer.files]);
    },
    [acceptMany],
  );

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        // Depth counting, or moving over a child fires leave and flickers.
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) setDragging(false);
      }}
      onDrop={onDrop}
      className="relative flex flex-col gap-8"
    >
      <Notice title="These stay in this browser">
        Photographs dropped here are held on this device only — they are a way to
        see your work in place in seconds, not a way to publish it. Nobody else
        sees them and clearing your browser removes them. For the real thing, put
        the files in{' '}
        <code className="font-mono text-[12px] text-cyan-soft">public/work/</code> and
        run <code className="font-mono text-[12px] text-cyan-soft">npm run link:work -- --write</code>.
      </Notice>

      {/* The bulk target. */}
      <label
        className={cn(
          'glass edge relative flex cursor-pointer flex-col items-center justify-center gap-3 border-dashed px-6 py-12 text-center transition-[border-color,background-color] duration-200',
          dragging && 'edge-on bg-neon/10',
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            void acceptMany([...(e.target.files ?? [])]);
            e.target.value = '';
          }}
        />
        <span
          aria-hidden="true"
          className="grid h-12 w-12 place-items-center rounded-full border border-neon/40 text-neon"
          style={{ boxShadow: '0 0 26px -8px rgb(45 125 255 / 0.9)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 13V3M9 3L5 7M9 3l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M2 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <span className="font-display text-[18px] font-semibold text-bright">
          {dragging ? 'Drop them anywhere' : 'Drag your photographs here'}
        </span>
        <span className="max-w-[46ch] text-[13px] text-muted">
          Or click to choose files. Drop as many as you like at once — each one goes
          to the slot its filename names, and anything unrecognised fills the next
          empty slot.
        </span>
        {busy && <span className="t-label text-neon">Working…</span>}
      </label>

      {error && (
        <Notice tone="warn" title="That did not work">
          {error}
        </Notice>
      )}

      {lastDrop.length > 0 && (
        <Notice tone="good" title={`Placed ${lastDrop.length}`}>
          <ul className="flex flex-col gap-0.5 font-mono text-[12px]">
            {lastDrop.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Notice>
      )}

      {/* How full the browser is. */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="t-label">
            {count} {count === 1 ? 'photograph' : 'photographs'} stored
          </p>
          <p className="font-mono text-[11.5px] text-faint">
            {formatBytes(used)} of about {formatBytes(STORAGE_BUDGET_BYTES)} used
          </p>
        </div>
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                pct > 85
                  ? 'linear-gradient(90deg,#ffb861,#fb7185)'
                  : 'linear-gradient(90deg,#2d7dff,#22d3ee)',
            }}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35, ease: EASE_UI }}
          />
        </div>
        {pct > 85 && (
          <p className="text-[12.5px] text-amber">
            Nearly full. Photographs are shrunk on the way in, but a browser only
            gives a few megabytes — remove some, or move to{' '}
            <code className="font-mono text-[12px]">public/work/</code>.
          </p>
        )}
        {count > 0 && (
          <div className="mt-1">
            <Button variant="quiet" size="sm" className="!px-0" onClick={() => { clearAll(); setLastDrop([]); }}>
              Remove all
            </Button>
          </div>
        )}
      </div>

      {/* Every slot, grouped. */}
      <div className="flex flex-col gap-10">
        {GROUPS.map((group) => (
          <section key={group.label} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="t-label">{group.label}</h3>
              <p className="text-[13px] text-muted">{group.note}</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.keys.map((key) => (
                <Slot
                  key={key}
                  imageKey={key}
                  stored={photos[key]}
                  onFile={(f) => accept(key, f)}
                  onRemove={() => remove(key)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function Slot({
  imageKey,
  stored,
  onFile,
  onRemove,
}: {
  imageKey: ImageKey;
  stored?: { name: string; width: number; height: number; bytes: number };
  onFile: (file: File) => void;
  onRemove: () => void;
}) {
  const [over, setOver] = useState(false);
  const asset = IMAGES[imageKey];
  const source = !isPlaceholderSource(asset.src, Boolean(stored))
    ? 'yours'
    : isDrawn(asset.src)
      ? 'drawn'
      : 'stock';

  return (
    <li>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation(); // Do not also fire the page-wide handler.
          setOver(false);
          const file = [...e.dataTransfer.files].find((f) => f.type.startsWith('image/'));
          if (file) onFile(file);
        }}
        className={cn(
          'glass edge relative flex flex-col overflow-hidden transition-[border-color,box-shadow] duration-200',
          over && 'edge-on',
        )}
      >
        <label className="zoom-host relative block aspect-[4/3] cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = '';
            }}
          />
          <Figure
            image={imageKey}
            className="absolute inset-0 h-full w-full"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
          <AnimatePresence>
            {over && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 grid place-items-center bg-neon/25 font-mono text-[11px] tracking-[0.16em] text-white uppercase backdrop-blur-sm"
              >
                Drop to replace
              </motion.span>
            )}
          </AnimatePresence>
          <span className="absolute top-3 left-3">
            <Pill tone={source === 'yours' ? 'good' : source === 'stock' ? 'neon' : 'neutral'}>
              {source === 'yours' ? 'Your photo' : source === 'stock' ? 'Stock' : 'Drawn'}
            </Pill>
          </span>
        </label>

        <div className="flex flex-col gap-1.5 p-4">
          <p className="font-mono text-[11.5px] tracking-wide text-bright">{imageKey}</p>
          <p className="line-clamp-2 text-[12.5px] leading-snug text-muted">{asset.alt}</p>
          {stored ? (
            <div className="mt-1 flex items-center justify-between gap-3 border-t border-line pt-2">
              <span className="truncate font-mono text-[11px] text-faint">
                {stored.name} · {stored.width}×{stored.height}
              </span>
              <button
                type="button"
                onClick={onRemove}
                className="shrink-0 font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-bad"
              >
                Remove
              </button>
            </div>
          ) : (
            <p className="mt-1 border-t border-line pt-2 font-mono text-[10.5px] tracking-[0.14em] text-faint uppercase">
              Drop a photo here
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
