import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

/**
 * A film grain held over the whole page at very low opacity.
 *
 * On a site this dark it does real work: it breaks up the banding that large
 * soft gradients produce on 8-bit displays, and it gives black a texture
 * instead of letting it read as a switched-off screen.
 *
 * One inline SVG turbulence, no image request, and it does not drift under
 * reduced motion.
 */
export function Grain() {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: '220px 220px',
        animation: reduced ? undefined : 'grain-shift 7s steps(6) infinite',
      }}
    >
      <style>{`
        @keyframes grain-shift {
          0%   { background-position: 0 0; }
          20%  { background-position: -14px 8px; }
          40%  { background-position: 9px -12px; }
          60%  { background-position: -7px -7px; }
          80%  { background-position: 12px 5px; }
          100% { background-position: 0 0; }
        }
      `}</style>
    </div>
  );
}
