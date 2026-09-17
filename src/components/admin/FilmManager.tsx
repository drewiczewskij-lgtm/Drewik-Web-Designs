import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Figure } from '@/components/Figure';
import { Button } from '@/components/ui/Button';
import { Notice, Pill } from '@/components/ui/Bits';
import { PORTFOLIO, type PortfolioItem } from '@/data/portfolio';
import {
  clearFilms,
  formatBytes,
  parseFilmLink,
  putFilm,
  removeFilm,
  setFilmLink,
  storageEstimate,
  useFilmLinks,
  useFilms,
  type FilmLink,
} from '@/lib/videoStore';
import { cn } from '@/lib/cn';

/* ============================================================================
   THE FILM MANAGER
   ----------------------------------------------------------------------------
   Two ways to put a film on a portfolio piece, offered side by side because
   they are for different things and the difference matters.

   A LINK to YouTube is weightless, plays on every device, and is
   still there after the site is deployed. It is what a working site should
   use — nobody should serve a 300MB file from their own hosting.

   A DROPPED FILE goes into this browser's IndexedDB. Good for judging a cut in
   place; gone when the browser is cleared, and it never leaves this device.
   ========================================================================= */

const FILMS: PortfolioItem[] = PORTFOLIO.filter((p) => p.kind === 'video');

export function FilmManager() {
  const stored = useFilms();
  const links = useFilmLinks();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [room, setRoom] = useState<{ used: number; quota: number } | null>(null);

  useEffect(() => {
    void storageEstimate().then(setRoom);
  }, [stored]);

  const accept = useCallback(async (id: string, file: File) => {
    setError(null);
    setBusy(id);
    try {
      await putFilm(id, file);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That film could not be stored.');
    } finally {
      setBusy(null);
    }
  }, []);

  const count = Object.keys(stored).length;
  const linked = Object.keys(links).length;

  return (
    <div className="flex flex-col gap-8">
      <Notice title="A link is better than a file">
        A YouTube link weighs nothing, plays everywhere, and still works
        once this site is online — that is what a published site should use. A
        dropped file is held in this browser only, which is right for checking how
        a cut sits on the page and wrong for anything public.
      </Notice>

      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="t-label">
          {FILMS.length} films · {linked} linked · {count} stored here
        </p>
        {room && (
          <p className="font-mono text-[11.5px] text-faint">
            {formatBytes(room.used)} used of about {formatBytes(room.quota)} available
          </p>
        )}
      </div>

      {error && (
        <Notice tone="warn" title="That did not work">
          {error}
        </Notice>
      )}

      <ul className="grid gap-4 lg:grid-cols-2">
        {FILMS.map((item) => (
          <FilmSlot
            key={item.id}
            item={item}
            stored={stored[item.id]}
            link={links[item.id]}
            busy={busy === item.id}
            onFile={(f) => accept(item.id, f)}
            onRemoveFile={() => void removeFilm(item.id)}
            onLink={(l) => setFilmLink(item.id, l)}
          />
        ))}
      </ul>

      {count > 0 && (
        <div>
          <Button variant="quiet" size="sm" className="!px-0" onClick={() => void clearFilms()}>
            Remove all stored films
          </Button>
        </div>
      )}
    </div>
  );
}

function FilmSlot({
  item,
  stored,
  link,
  busy,
  onFile,
  onRemoveFile,
  onLink,
}: {
  item: PortfolioItem;
  stored?: { name: string; size: number };
  link?: FilmLink;
  busy: boolean;
  onFile: (file: File) => void;
  onRemoveFile: () => void;
  onLink: (link: FilmLink | null) => void;
}) {
  const [over, setOver] = useState(false);
  const [paste, setPaste] = useState('');
  const [bad, setBad] = useState(false);

  const submitLink = () => {
    const parsed = parseFilmLink(paste);
    if (!parsed) {
      setBad(true);
      return;
    }
    setBad(false);
    setPaste('');
    onLink(parsed);
  };

  const state = stored ? 'file' : link ? 'link' : 'none';

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
          e.stopPropagation();
          setOver(false);
          const file = [...e.dataTransfer.files].find((f) => f.type.startsWith('video/'));
          if (file) onFile(file);
        }}
        className={cn(
          'glass edge flex h-full flex-col overflow-hidden transition-[border-color,box-shadow] duration-200',
          over && 'edge-on',
        )}
      >
        <div className="relative aspect-video w-full">
          <Figure
            image={item.image}
            className="absolute inset-0 h-full w-full"
            sizes="(max-width: 1024px) 100vw, 50vw"
            imgClassName="opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" aria-hidden="true" />
          <div className="absolute top-3 left-3">
            <Pill tone={state === 'none' ? 'warn' : 'good'}>
              {state === 'file' ? 'Your film' : state === 'link' ? `Linked · ${link!.provider}` : 'No film yet'}
            </Pill>
          </div>
          {over && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 grid place-items-center bg-neon/25 font-mono text-[11px] tracking-[0.16em] text-white uppercase backdrop-blur-sm"
            >
              Drop the video
            </motion.span>
          )}
          <div className="on-image absolute right-4 bottom-3 left-4">
            <p className="font-display text-[17px] leading-tight font-semibold text-bright">
              {item.title}
            </p>
            <p className="font-mono text-[10.5px] tracking-[0.14em] text-cyan-soft uppercase">
              {item.location}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          {/* The recommended path first. */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor={`link-${item.id}`}
              className="t-label"
            >
              YouTube link
            </label>
            <div className="flex gap-2">
              <input
                id={`link-${item.id}`}
                value={paste}
                onChange={(e) => {
                  setPaste(e.target.value);
                  setBad(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submitLink();
                  }
                }}
                placeholder="Paste the address, or just the id"
                aria-invalid={bad || undefined}
                className="field flex-1"
              />
              <Button size="sm" onClick={submitLink}>
                Use
              </Button>
            </div>
            {bad && (
              <p role="alert" className="text-[12.5px] text-bad">
                That is not a YouTube address. Paste the whole link from the
                browser bar and it will be read correctly.
              </p>
            )}
            {link && (
              <p className="flex items-center justify-between gap-3 text-[12.5px] text-muted">
                <span className="truncate font-mono text-[11.5px]">
                  {link.provider}: {link.videoId}
                </span>
                <button
                  type="button"
                  onClick={() => onLink(null)}
                  className="shrink-0 font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-bad"
                >
                  Remove
                </button>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <span className="font-mono text-[10px] tracking-[0.16em] text-faint uppercase">or</span>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
          </div>

          <label
            className={cn(
              'flex cursor-pointer items-center justify-between gap-3 border border-dashed border-line px-4 py-3 transition-colors duration-200 hover:border-neon/50',
              busy && 'opacity-60',
            )}
          >
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = '';
              }}
            />
            <span className="flex flex-col">
              <span className="text-[13.5px] text-body">
                {busy ? 'Storing…' : stored ? 'Replace the file' : 'Drop a video file here'}
              </span>
              <span className="font-mono text-[11px] text-faint">
                {stored ? `${stored.name} · ${formatBytes(stored.size)}` : 'This browser only'}
              </span>
            </span>
            {stored && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onRemoveFile();
                }}
                className="shrink-0 font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-bad"
              >
                Remove
              </button>
            )}
          </label>
        </div>
      </div>
    </li>
  );
}
