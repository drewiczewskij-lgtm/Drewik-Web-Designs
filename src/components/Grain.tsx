import { useMemo } from 'react';

/**
 * A single fractal-noise tile, drifting on a six-step loop. It is what keeps the
 * large flat areas of paper from looking like flat areas of paper.
 */
export function Grain() {
  const url = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="220" height="220" filter="url(#n)" opacity="0.5"/></svg>`;
    return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
  }, []);

  return (
    <div
      className="grain-overlay"
      style={{ ['--grain-url' as string]: url }}
      aria-hidden="true"
    />
  );
}
