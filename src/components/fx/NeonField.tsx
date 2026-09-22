import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useHasFinePointer } from '@/lib/useMediaQuery';

/* ============================================================================
   THE FIELD
   ----------------------------------------------------------------------------
   The moving light behind the page: a drifting particle field and a handful of
   slowly rotating wireframe solids, projected by hand.

   Why not a 3D library — this needs perhaps two hundred lines of vector maths.
   Three.js would add several hundred kilobytes to the first load of a site
   whose entire business case is a listing agent not bouncing before the hero
   renders. The maths is below; the weight is not.

   What keeps it cheap:
     · one canvas for the whole page, behind everything, never re-rendered by React
     · device pixel ratio capped at 2 — a 3x phone gains nothing visible here
     · the loop stops when the tab is hidden or the canvas scrolls out of view
     · under reduced motion it draws ONE still frame and stops for good
   ========================================================================= */

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** A wireframe solid: points, and which pairs of them are joined. */
interface Solid {
  vertices: Vec3[];
  edges: [number, number][];
  position: Vec3;
  rotation: Vec3;
  spin: Vec3;
  scale: number;
  hue: string;
}

function icosahedron(): { vertices: Vec3[]; edges: [number, number][] } {
  // The golden ratio puts all twelve vertices on three orthogonal rectangles.
  const t = (1 + Math.sqrt(5)) / 2;
  const v: Vec3[] = [
    { x: -1, y: t, z: 0 }, { x: 1, y: t, z: 0 }, { x: -1, y: -t, z: 0 }, { x: 1, y: -t, z: 0 },
    { x: 0, y: -1, z: t }, { x: 0, y: 1, z: t }, { x: 0, y: -1, z: -t }, { x: 0, y: 1, z: -t },
    { x: t, y: 0, z: -1 }, { x: t, y: 0, z: 1 }, { x: -t, y: 0, z: -1 }, { x: -t, y: 0, z: 1 },
  ];
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  // Deduplicate: every edge is shared by exactly two faces.
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  for (const f of faces) {
    for (let i = 0; i < 3; i++) {
      const a = f[i];
      const b = f[(i + 1) % 3];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([a, b]);
    }
  }
  return { vertices: v, edges };
}

function octahedron(): { vertices: Vec3[]; edges: [number, number][] } {
  const v: Vec3[] = [
    { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 },
  ];
  const edges: [number, number][] = [
    [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 2], [1, 3], [1, 4], [1, 5],
    [2, 4], [2, 5], [3, 4], [3, 5],
  ];
  return { vertices: v, edges };
}

function rotate(p: Vec3, r: Vec3): Vec3 {
  const cx = Math.cos(r.x), sx = Math.sin(r.x);
  const cy = Math.cos(r.y), sy = Math.sin(r.y);
  const cz = Math.cos(r.z), sz = Math.sin(r.z);

  let { x, y, z } = p;
  // X, then Y, then Z. The order is arbitrary but must never change mid-frame.
  let y1 = y * cx - z * sx;
  let z1 = y * sx + z * cx;
  y = y1; z = z1;
  const x1 = x * cy + z * sy;
  z1 = -x * sy + z * cy;
  x = x1; z = z1;
  const x2 = x * cz - y * sz;
  y1 = x * sz + y * cz;
  x = x2; y = y1;

  return { x, y, z };
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  r: number;
}

export function NeonField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const fine = useHasFinePointer();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let visible = true;

    const particles: Particle[] = [];
    const solids: Solid[] = [];

    // Where the pointer is, and where the scene is easing toward. The gap
    // between the two is what makes it feel like weight rather than a cursor.
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };

    function build() {
      particles.length = 0;
      // Density scaled to area, then capped. A 4K monitor does not want 1,500
      // particles, and a phone cannot afford them.
      const count = Math.min(110, Math.round((width * height) / 19000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: 0.25 + Math.random() * 0.75,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -0.05 - Math.random() * 0.14,
          r: 0.5 + Math.random() * 1.4,
        });
      }

      solids.length = 0;
      const ico = icosahedron();
      const oct = octahedron();
      const small = width < 760;
      const shapes: Omit<Solid, 'vertices' | 'edges'>[] = [
        {
          position: { x: width * 0.82, y: height * 0.26, z: 0 },
          rotation: { x: 0.4, y: 0.2, z: 0 },
          spin: { x: 0.00022, y: 0.00034, z: 0.00008 },
          scale: Math.min(width, height) * (small ? 0.12 : 0.1),
          hue: '90, 170, 255',
        },
        {
          position: { x: width * 0.14, y: height * 0.72, z: 0 },
          rotation: { x: 0.1, y: 0.8, z: 0.2 },
          spin: { x: -0.00018, y: 0.00026, z: -0.0001 },
          scale: Math.min(width, height) * (small ? 0.085 : 0.07),
          hue: '103, 232, 249',
        },
        {
          position: { x: width * 0.56, y: height * 0.9, z: 0 },
          rotation: { x: 0.6, y: 0.1, z: 0.5 },
          spin: { x: 0.00014, y: -0.0002, z: 0.00006 },
          scale: Math.min(width, height) * 0.055,
          hue: '167, 139, 250',
        },
      ];
      shapes.forEach((s, i) => {
        const geo = i === 1 ? oct : ico;
        solids.push({ ...s, vertices: geo.vertices, edges: geo.edges });
      });
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      // A 3x screen buys nothing for soft glows and costs 2.25x the fill rate.
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function drawSolid(s: Solid, tx: number, ty: number) {
      const projected: { x: number; y: number; depth: number }[] = s.vertices.map((v) => {
        const r = rotate(v, s.rotation);
        // Weak perspective: divide by distance from a camera set well back.
        const perspective = 380 / (380 + r.z * s.scale);
        return {
          x: s.position.x + tx + r.x * s.scale * perspective,
          y: s.position.y + ty + r.y * s.scale * perspective,
          depth: perspective,
        };
      });

      for (const [a, b] of s.edges) {
        const p1 = projected[a];
        const p2 = projected[b];
        // Edges facing away are dimmer. That single cue is what stops a
        // wireframe reading as a flat tangle of lines.
        const depth = (p1.depth + p2.depth) / 2;
        const alpha = Math.max(0, (depth - 0.72) * 0.85);
        if (alpha <= 0.004) continue;
        ctx!.strokeStyle = `rgba(${s.hue}, ${alpha.toFixed(3)})`;
        ctx!.lineWidth = depth > 1 ? 1.1 : 0.7;
        ctx!.beginPath();
        ctx!.moveTo(p1.x, p1.y);
        ctx!.lineTo(p2.x, p2.y);
        ctx!.stroke();
      }

      // A vertex dot on the nearest points only, which reads as a highlight.
      for (const p of projected) {
        if (p.depth < 1.02) continue;
        ctx!.fillStyle = `rgba(${s.hue}, ${((p.depth - 1) * 2.4).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function frame() {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (!visible) return;

      ctx!.clearRect(0, 0, width, height);

      // Ease toward the pointer. 0.045 is slow enough to feel like mass.
      eased.x += (pointer.x - eased.x) * 0.045;
      eased.y += (pointer.y - eased.y) * 0.045;

      for (const p of particles) {
        p.x += p.vx * p.z;
        p.y += p.vy * p.z;
        // Wrap rather than respawn, so density never flickers.
        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const px = p.x + eased.x * p.z * 26;
        const py = p.y + eased.y * p.z * 18;
        ctx!.fillStyle = `rgba(150, 205, 255, ${(p.z * 0.3).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(px, py, p.r * p.z, 0, Math.PI * 2);
        ctx!.fill();
      }

      for (const s of solids) {
        s.rotation.x += s.spin.x * 16;
        s.rotation.y += s.spin.y * 16;
        s.rotation.z += s.spin.z * 16;
        drawSolid(s, eased.x * 34, eased.y * 24);
      }
    }

    function drawOnce() {
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx!.fillStyle = `rgba(150, 205, 255, ${(p.z * 0.26).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2);
        ctx!.fill();
      }
      for (const s of solids) drawSolid(s, 0, 0);
    }

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
    };

    resize();

    if (reduced) {
      // One frame, then nothing moves again. Still composed, still has depth.
      drawOnce();
      const ro = new ResizeObserver(() => {
        resize();
        drawOnce();
      });
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    raf = requestAnimationFrame(frame);

    // Stop entirely when the field is not on screen. On a long page this is
    // most of the time, and an idle canvas costs nothing.
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    document.addEventListener('visibilitychange', onVisibility);
    if (fine) window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [reduced, fine]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
