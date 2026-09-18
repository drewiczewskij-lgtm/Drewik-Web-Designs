import { Link } from 'react-router-dom';
import { Figure } from '@/components/Figure';
import { Reveal } from '@/components/fx/Reveal';
import { TiltCard } from '@/components/fx/TiltCard';
import { Arrow } from '@/components/ui/Button';
import { SERVICES, type Service } from '@/data/services';
import { cn } from '@/lib/cn';

/* ============================================================================
   SERVICES
   Six cards with depth. The tilt follows the cursor; the light follows it too.
   Both come from `useTilt`, which writes to the node rather than to state, so
   moving across six cards does not re-render six components.
   ========================================================================= */


export function ServiceCard({ service, index }: { service: Service; index: number }) {

  return (
    <Reveal as="li" index={index} className="group">
      <TiltCard className="h-full" max={5}>
        <Link
          to={`/services#${service.id}`}
          className="edge glass relative flex h-full flex-col overflow-hidden"
        >
          <div className="zoom-host relative aspect-[16/10] w-full overflow-hidden">
            <Figure
              image={service.image}
              className="absolute inset-0 h-full w-full"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              imgClassName="opacity-80"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent"
            />
            <span className="t-label absolute top-4 left-4 rounded-full border border-white/12 bg-void/60 px-2.5 py-1 text-[9.5px] backdrop-blur-md">
              {service.kicker}
            </span>
          </div>

          <div className="tilt-layer flex flex-1 flex-col gap-3 p-6" style={{ '--z': '18px' } as React.CSSProperties}>
            <h3 className="t-h3 transition-colors duration-300 group-hover:text-bright">
              {service.name}
            </h3>
            <p className="flex-1 text-[13.5px] leading-relaxed text-muted">{service.summary}</p>

            <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-4">
              <span className="font-mono text-[11px] tracking-[0.14em] text-faint uppercase">
                {service.duration}
              </span>
              <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-bright uppercase">
                <span className="text-neon-soft">Quoted per property</span>
                <Arrow />
              </span>
            </div>
          </div>
        </Link>
      </TiltCard>
    </Reveal>
  );
}

export function ServicesGrid({ className }: { className?: string }) {
  return (
    <ul className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {SERVICES.map((service, i) => (
        <ServiceCard key={service.id} service={service} index={i} />
      ))}
    </ul>
  );
}
