import { Figure } from '@/components/Figure';
import { Reveal } from '@/components/fx/Reveal';
import { Button, Arrow } from '@/components/ui/Button';
import { Magnetic } from '@/components/fx/Magnetic';
import { CONTACT } from '@/data/site';
import type { ImageKey } from '@/data/images';

/**
 * The full-bleed call to action used between sections and at the end of most
 * pages. One component, so every one of them looks like it came from the same
 * studio — and so changing the wording is one edit, not nine.
 */
export function CtaBand({
  label = 'Book a shoot',
  title,
  lead,
  image = 'reExteriorTwilight',
  primary = { label: 'Check availability', to: '/book' },
  secondary = { label: 'Talk to us', to: '/contact' },
  showPhone = true,
}: {
  label?: string;
  title: React.ReactNode;
  lead?: string;
  image?: ImageKey;
  primary?: { label: string; to: string };
  secondary?: { label: string; to: string };
  showPhone?: boolean;
}) {
  return (
    <section className="relative overflow-hidden border-y border-line">
      <Figure
        image={image}
        className="absolute inset-0 h-full w-full"
        sizes="100vw"
        imgClassName="opacity-55"
      />
      {/* Heavy on the left where the type sits, light on the right where the
          picture has to do its job. A flat scrim would protect the text and
          kill the photograph at the same time. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(100deg,var(--color-void)_8%,rgb(4_6_11/0.88)_38%,rgb(4_6_11/0.55)_68%,rgb(4_6_11/0.3)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-void)_0%,transparent_45%)]"
      />
      <div className="grid-floor opacity-40" aria-hidden="true" />

      <div className="shell relative py-20 sm:py-28">
        {/* rem, not `ch` — see the note in Footer.tsx. */}
        <Reveal className="flex max-w-[44rem] flex-col gap-6">
          <p className="t-label flex items-center gap-3">
            <span className="h-px w-10 bg-neon" aria-hidden="true" />
            {label}
          </p>
          <h2 className="t-h2">{title}</h2>
          {lead && <p className="t-lead max-w-[46ch] text-muted">{lead}</p>}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Button to={primary.to} size="lg" className="group" trailing={<Arrow />}>
                {primary.label}
              </Button>
            </Magnetic>
            <Button to={secondary.to} variant="ghost" size="lg">
              {secondary.label}
            </Button>
          </div>

          {showPhone && (
            <p className="mt-2 text-[13px] text-muted">
              Or call{' '}
              <a href={`tel:${CONTACT.phoneHref}`} className="link-rule font-mono tracking-wide">
                {CONTACT.phone}
              </a>{' '}
              — answered {CONTACT.responseTime}.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
