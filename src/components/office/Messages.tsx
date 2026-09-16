import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { agentFor, useOffice } from '@/lib/office';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { cn } from '@/lib/cn';
import { Figure } from '../Figure';
import { Panel } from './Panel';

/* ==========================================================================
   MESSAGES
   A thread with the broker, not a support widget. It opens on the property
   you were last looking at, and it answers in that property's terms.
   ======================================================================== */

const EASE_UI = [0.23, 1, 0.32, 1] as const;

const OPENERS = [
  'What is the seller’s position on price?',
  'Can I see it this week?',
  'Is there a survey?',
  'How does a reservation deposit work?',
];

function clock(at: number) {
  return new Date(at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function Messages() {
  const { desk, close, property, messages, send, agentTyping, markRead } = useOffice();
  const reduced = usePrefersReducedMotion();
  const open = desk === 'messages';
  const agent = agentFor(property);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) markRead();
  }, [open, messages.length, markRead]);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'end' });
  }, [open, messages.length, agentTyping, reduced]);

  const submit = (text: string) => {
    const body = text.trim();
    if (!body) return;
    send(body);
    setDraft('');
    inputRef.current?.focus();
  };

  return (
    <Panel
      open={open}
      onClose={close}
      eyebrow={`Direct · ${agent.role}`}
      title={agent.name}
      footer={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(draft);
          }}
          className="flex items-end gap-3"
        >
          <label htmlFor="msg-draft" className="sr-only">
            Write to {agent.name}
          </label>
          <textarea
            id="msg-draft"
            ref={inputRef}
            rows={1}
            value={draft}
            placeholder={`Ask about ${property.name}…`}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends; Shift+Enter is a new line. No animation on either —
              // this is a key people press hundreds of times.
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(draft);
              }
            }}
            className="field text-ink max-h-32 min-h-[2.75rem] flex-1 resize-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Send message"
            className={cn(
              'press focus-bare bg-ink text-paper flex h-11 w-11 shrink-0 items-center justify-center transition-opacity duration-200',
              !draft.trim() && 'pointer-events-none opacity-25',
            )}
          >
            <svg width="18" height="8" viewBox="0 0 22 8" fill="none" aria-hidden="true">
              <path d="M0 4h20M16.4 0.6 20 4l-3.6 3.4" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </form>
      }
    >
      <div className="border-ink/12 mb-6 flex items-center gap-4 border-b pb-5">
        <Figure
          image={agent.portrait}
          className="h-12 w-12 shrink-0 rounded-full"
          sizes="48px"
          quality={45}
        />
        <div className="min-w-0 flex-1">
          <p className="t-label">Regarding {property.name}</p>
          <p className="t-label text-stone-deep mt-1.5">
            Typically replies within the hour
          </p>
        </div>
      </div>

      {messages.length === 0 && (
        <div className="stagger">
          <div style={{ animationDelay: '0ms' }}>
            <p className="t-body text-ink/75 max-w-[40ch] text-[0.95rem] leading-relaxed">
              {agent.bio[0]}
            </p>
            <p className="t-label text-stone-deep mt-6 mb-3">Start with</p>
          </div>
          <div style={{ animationDelay: '60ms' }} className="flex flex-col gap-2">
            {OPENERS.map((o) => (
              <button
                key={o}
                onClick={() => submit(o)}
                className="press focus-bare border-ink/16 hover:border-ink/45 t-body border px-4 py-3 text-left text-[0.9rem] transition-colors duration-200"
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.li
              key={m.id}
              layout={reduced ? false : 'position'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.01 : 0.24, ease: EASE_UI }}
              className={cn('flex flex-col', m.from === 'you' ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'max-w-[86%] px-4 py-3 text-[0.92rem] leading-relaxed',
                  m.from === 'you'
                    ? 'bg-ink text-paper'
                    : 'bg-paper-2 text-ink border-ink/10 border',
                )}
              >
                {m.body}
              </div>
              <span className="t-label text-stone-deep mt-1.5 opacity-70">
                {m.from === 'you' ? 'You' : agent.name.split(' ')[0]} · {clock(m.at)}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>

        {agentTyping && (
          <motion.li
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: EASE_UI }}
            className="flex items-start"
            aria-live="polite"
          >
            <span className="sr-only">{agent.name} is typing</span>
            <span className="bg-paper-2 border-ink/10 flex items-center gap-1.5 border px-4 py-4">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="bg-stone-deep block h-1.5 w-1.5 rounded-full"
                  animate={reduced ? {} : { opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16 }}
                />
              ))}
            </span>
          </motion.li>
        )}
      </ul>
      <div ref={endRef} />
    </Panel>
  );
}
