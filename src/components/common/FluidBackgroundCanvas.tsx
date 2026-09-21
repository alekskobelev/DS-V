import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';

interface FluidBackgroundCanvasProps {
  className?: string;
}

interface LiquidBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  pulseSpeed: number;
  pulsePhase: number;
  colorLight: string;
  colorDark: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  type: 'micro' | 'node' | 'crosshair' | 'diamond';
  tag?: string;
}

/**
 * Universal Site-Wide Fullscreen Fluid & 3D Metrology Point Cloud Canvas
 * 
 * Implements:
 * 1. Fluid Layer: Organic drifting hydrodynamic metaballs with CSS blur/saturate/contrast filters.
 * 2. Particle Layer: Real-time 3D laser scanning cloud with precision crosshairs, GD&T tags, and triangulation links.
 * 3. Interactive Mouse Field: Magnetic particle deflection & fluid ripple on cursor motion across the entire application.
 * 4. Day/Night theme integration via responsive CSS hardware filters.
 */
export const FluidBackgroundCanvas: React.FC<FluidBackgroundCanvasProps> = ({ className = '' }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const containerRef = useRef<HTMLDivElement>(null);
  const fluidCanvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

  const animFrameRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number; active: boolean; radius: number }>({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false,
    radius: 180,
  });

  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
      mediaQuery.addEventListener?.('change', handler);
      return () => mediaQuery.removeEventListener?.('change', handler);
    }
  }, []);

  useEffect(() => {
    const fluidCanvas = fluidCanvasRef.current;
    const particleCanvas = particleCanvasRef.current;
    const container = containerRef.current;
    if (!fluidCanvas || !particleCanvas || !container) return;

    const fluidCtx = fluidCanvas.getContext('2d', { alpha: true });
    const particleCtx = particleCanvas.getContext('2d', { alpha: true });
    if (!fluidCtx || !particleCtx) return;

    // Guaranteed viewport dimensions (fallback to window if container not yet measured)
    let width = Math.max(container.clientWidth || window.innerWidth || 1200, 320);
    let height = Math.max(container.clientHeight || window.innerHeight || 800, 320);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    // Dynamic Blobs (Organic Fluid Metaballs) - Delicate ambient luminescence
    const blobs: LiquidBlob[] = [
      {
        x: width * 0.15,
        y: height * 0.2,
        vx: 0.22,
        vy: 0.18,
        baseRadius: Math.min(width, height) * 0.38,
        radius: Math.min(width, height) * 0.38,
        pulseSpeed: 0.0009,
        pulsePhase: 0,
        colorLight: 'rgba(37, 99, 235, 0.20)',  // Soft Deep Blue
        colorDark: 'rgba(59, 130, 246, 0.25)',   // Soft Azure
      },
      {
        x: width * 0.85,
        y: height * 0.28,
        vx: -0.20,
        vy: 0.16,
        baseRadius: Math.min(width, height) * 0.42,
        radius: Math.min(width, height) * 0.42,
        pulseSpeed: 0.0011,
        pulsePhase: Math.PI / 3,
        colorLight: 'rgba(14, 165, 233, 0.18)', // Soft Sky/Cyan
        colorDark: 'rgba(6, 182, 212, 0.22)',   // Soft Cyan
      },
      {
        x: width * 0.5,
        y: height * 0.65,
        vx: 0.18,
        vy: -0.20,
        baseRadius: Math.min(width, height) * 0.45,
        radius: Math.min(width, height) * 0.45,
        pulseSpeed: 0.0008,
        pulsePhase: (Math.PI * 2) / 3,
        colorLight: 'rgba(79, 70, 229, 0.16)',  // Soft Indigo
        colorDark: 'rgba(99, 102, 241, 0.20)',   // Soft Violet Blue
      },
      {
        x: width * 0.1,
        y: height * 0.8,
        vx: 0.15,
        vy: -0.14,
        baseRadius: Math.min(width, height) * 0.35,
        radius: Math.min(width, height) * 0.35,
        pulseSpeed: 0.0012,
        pulsePhase: Math.PI,
        colorLight: 'rgba(2, 132, 199, 0.18)',  // Soft Cyan
        colorDark: 'rgba(29, 78, 216, 0.22)',   // Soft Royal Blue
      },
      {
        x: width * 0.9,
        y: height * 0.78,
        vx: -0.18,
        vy: -0.16,
        baseRadius: Math.min(width, height) * 0.38,
        radius: Math.min(width, height) * 0.38,
        pulseSpeed: 0.001,
        pulsePhase: Math.PI * 1.4,
        colorLight: 'rgba(30, 58, 138, 0.16)',   // Soft Navy
        colorDark: 'rgba(14, 165, 233, 0.20)',   // Soft Cyan Glow
      },
    ];

    // Metrology Particles (Points, Crosshairs, Diamond Datums, Triangulation)
    const METROLOGY_TAGS = [
      'X: 240.52', 'Y: 118.19', 'Z: 450.00', '±0.002mm', 'ISO 10360', 
      'CMM-1', 'CMM-2', 'CMM-3', 'SCAN-3D', 'GD&T', 'CAD/CAM', '0.001μm', 
      'SCANLINE', 'HEXAGON', 'POLYWORKS', 'DATUM A', 'DATUM B', 'P1: +0.008',
      'TOPSOLID', 'PMT-01', 'SHINING-3D', 'ZEISS', 'MITUTOYO', '0.0005mm'
    ];
    
    // High-density quantum metrology cloud: ~240-280 on desktop, ~140-160 on tablet, ~70-90 on mobile
    const particleCount = Math.max(70, Math.min(Math.floor(width / 6.5), 260));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      let type: 'micro' | 'node' | 'crosshair' | 'diamond' = 'micro';
      let radius = Math.random() * 1.3 + 1.3;
      let baseAlpha = Math.random() * 0.3 + 0.55;

      if (i % 7 === 0) {
        type = 'crosshair';
        radius = Math.random() * 1.0 + 2.4;
        baseAlpha = Math.random() * 0.2 + 0.75;
      } else if (i % 11 === 0) {
        type = 'diamond';
        radius = Math.random() * 1.0 + 2.6;
        baseAlpha = Math.random() * 0.2 + 0.75;
      } else if (i % 3 === 0) {
        type = 'node';
        radius = Math.random() * 1.2 + 2.2;
        baseAlpha = Math.random() * 0.2 + 0.70;
      }

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        radius,
        baseAlpha,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        type,
        tag: (i % 8 === 0 && type !== 'micro') ? METROLOGY_TAGS[i % METROLOGY_TAGS.length] : undefined,
      });
    }

    // Canvas Resize Handler
    const updateSize = () => {
      if (!container || !fluidCanvas || !particleCanvas) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width || window.innerWidth || 1200, 320);
      height = Math.max(rect.height || window.innerHeight || 800, 320);

      fluidCanvas.width = width * dpr;
      fluidCanvas.height = height * dpr;
      particleCanvas.width = width * dpr;
      particleCanvas.height = height * dpr;

      // Reset transform then scale (prevents scale stacking)
      fluidCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-scale blob base radiuses proportionally
      const minDim = Math.min(width, height);
      blobs[0].baseRadius = minDim * 0.38;
      blobs[1].baseRadius = minDim * 0.42;
      blobs[2].baseRadius = minDim * 0.45;
      blobs[3].baseRadius = minDim * 0.35;
      blobs[4].baseRadius = minDim * 0.38;
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    // Mouse listener across the full window
    const onMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave, { passive: true });

    let lastTime = performance.now();
    let isVisible = !document.hidden;

    const onVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) lastTime = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // MAIN RENDER LOOP
    const render = (time: number) => {
      if (!isVisible) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth cursor lerp
      if (mouseRef.current.active) {
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
      } else {
        mouseRef.current.x = -1000;
        mouseRef.current.y = -1000;
      }

      // ==========================================
      // 1. RENDER ORGANIC FLUID BLOBS
      // ==========================================
      fluidCtx.clearRect(0, 0, width, height);

      blobs.forEach((blob) => {
        if (!isReducedMotion) {
          blob.x += blob.vx * 60 * delta;
          blob.y += blob.vy * 60 * delta;

          // Boundary bouncing with soft margins
          const padding = blob.radius * 0.3;
          if (blob.x < -padding) {
            blob.x = -padding;
            blob.vx *= -1;
          } else if (blob.x > width + padding) {
            blob.x = width + padding;
            blob.vx *= -1;
          }

          if (blob.y < -padding) {
            blob.y = -padding;
            blob.vy *= -1;
          } else if (blob.y > height + padding) {
            blob.y = height + padding;
            blob.vy *= -1;
          }

          // Gentle mouse wave displacement
          if (mouseRef.current.active) {
            const dx = blob.x - mouseRef.current.x;
            const dy = blob.y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 360 && dist > 0) {
              const force = (360 - dist) / 360;
              blob.x += (dx / dist) * force * 2.8;
              blob.y += (dy / dist) * force * 2.8;
            }
          }

          blob.pulsePhase += blob.pulseSpeed * 60 * delta * Math.PI * 2;
          blob.radius = blob.baseRadius + Math.sin(blob.pulsePhase) * (blob.baseRadius * 0.16);
        }

        // Radial gradient metaball
        const currentRadius = Math.max(20, blob.radius);
        const gradient = fluidCtx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          currentRadius
        );

        const baseColor = isDark ? blob.colorDark : blob.colorLight;
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(0.45, baseColor.replace(/[\d.]+\)$/, '0.28)'));
        gradient.addColorStop(0.8, baseColor.replace(/[\d.]+\)$/, '0.08)'));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        fluidCtx.fillStyle = gradient;
        fluidCtx.beginPath();
        fluidCtx.arc(blob.x, blob.y, currentRadius, 0, Math.PI * 2);
        fluidCtx.fill();
      });

      // ==========================================
      // 2. RENDER METROLOGY PARTICLES & MESH
      // ==========================================
      particleCtx.clearRect(0, 0, width, height);

      // Triangulation lines between nearby points (optimized connecting distance)
      const maxConnectDist = Math.min(width, height) * 0.12;
      const maxConnectDistSq = maxConnectDist * maxConnectDist;

      particleCtx.lineWidth = 0.85;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.type === 'micro') continue; // only connect primary nodes and datums to avoid visual clutter
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.type === 'micro') continue;
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxConnectDistSq) {
            const distance = Math.sqrt(distSq);
            const lineAlpha = (1 - distance / maxConnectDist) * (isDark ? 0.26 : 0.20);
            
            particleCtx.strokeStyle = isDark
              ? `rgba(96, 165, 250, ${lineAlpha})`
              : `rgba(29, 78, 216, ${lineAlpha})`;

            particleCtx.beginPath();
            particleCtx.moveTo(p1.x, p1.y);
            particleCtx.lineTo(p2.x, p2.y);
            particleCtx.stroke();
          }
        }
      }

      // Cursor interaction micro-reticle (Ultra-subtle, minimalist non-intrusive indicator)
      if (mouseRef.current.active) {
        particleCtx.strokeStyle = isDark
          ? 'rgba(6, 182, 212, 0.25)'
          : 'rgba(37, 99, 235, 0.20)';
        particleCtx.lineWidth = 0.85;
        particleCtx.setLineDash([2, 3]);
        particleCtx.beginPath();
        particleCtx.arc(mouseRef.current.x, mouseRef.current.y, 16, 0, Math.PI * 2);
        particleCtx.stroke();
        particleCtx.setLineDash([]);
      }

      // Draw particle nodes, reticles, diamonds & labels
      particleCtx.font = '10px "JetBrains Mono", Consolas, monospace';
      particles.forEach((p) => {
        if (!isReducedMotion) {
          p.x += p.vx * 60 * delta;
          p.y += p.vy * 60 * delta;
          p.pulsePhase += p.pulseSpeed * 60 * delta;

          // Seamless edge wrapping
          if (p.x < 0) p.x = width;
          else if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          else if (p.y > height) p.y = 0;

          // Mouse evasion
          if (mouseRef.current.active) {
            const dx = p.x - mouseRef.current.x;
            const dy = p.y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140 && dist > 0) {
              const force = (140 - dist) / 140;
              p.x += (dx / dist) * force * 2.2;
              p.y += (dy / dist) * force * 2.2;
            }
          }
        }

        // Dynamic subtle quantum pulsing alpha
        const pulseFactor = 0.85 + Math.sin(p.pulsePhase) * 0.15;
        const currentAlpha = Math.min(1, Math.max(0.25, p.baseAlpha * pulseFactor));

        const pointColor = isDark
          ? `rgba(147, 197, 253, ${currentAlpha})`
          : `rgba(29, 78, 216, ${currentAlpha})`;

        if (p.type === 'crosshair') {
          // Precision crosshair (+) marker for CMM inspection points
          particleCtx.strokeStyle = pointColor;
          particleCtx.lineWidth = 1.4;
          const crossSize = p.radius + 4.0;
          particleCtx.beginPath();
          particleCtx.moveTo(p.x - crossSize, p.y);
          particleCtx.lineTo(p.x + crossSize, p.y);
          particleCtx.moveTo(p.x, p.y - crossSize);
          particleCtx.lineTo(p.x, p.y + crossSize);
          particleCtx.stroke();
        } else if (p.type === 'diamond') {
          // Precision GD&T datum diamond marker (◇)
          particleCtx.strokeStyle = pointColor;
          particleCtx.lineWidth = 1.3;
          const dSize = p.radius + 2.8;
          particleCtx.beginPath();
          particleCtx.moveTo(p.x, p.y - dSize);
          particleCtx.lineTo(p.x + dSize, p.y);
          particleCtx.lineTo(p.x, p.y + dSize);
          particleCtx.lineTo(p.x - dSize, p.y);
          particleCtx.closePath();
          particleCtx.stroke();
        } else if (p.type === 'micro') {
          // Micro quantum spark point
          particleCtx.fillStyle = isDark
            ? `rgba(191, 219, 254, ${currentAlpha * 0.9})`
            : `rgba(37, 99, 235, ${currentAlpha * 0.85})`;
          particleCtx.beginPath();
          particleCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          particleCtx.fill();
        } else {
          // Circular coordinate node
          particleCtx.fillStyle = pointColor;
          particleCtx.beginPath();
          particleCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          particleCtx.fill();
        }

        // Metrology Tag Label (coordinates or ISO standard) - ultra subtle ambient styling
        if (p.tag) {
          particleCtx.fillStyle = isDark
            ? 'rgba(147, 197, 253, 0.28)'
            : 'rgba(30, 64, 175, 0.22)';
          particleCtx.fillText(p.tag, p.x + 8, p.y - 4);
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isDark, isReducedMotion]);

  return (
    <div
      id="global-fluid-canvas-container"
      ref={containerRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden select-none -z-5 ${className}`}
    >
      {/* 
        Layer 1: Organic Fluid Metaballs
        Subtle ambient background luminescence.
      */}
      <canvas
        id="global-fluid-liquid-canvas"
        ref={fluidCanvasRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
          isDark
            ? 'opacity-20 mix-blend-screen'
            : 'opacity-15'
        }`}
        style={{
          willChange: 'opacity',
        }}
      />

      {/* 
        Layer 2: Precision 3D Laser Metrology Mesh & Coordinate Nodes
        Discreet, non-intrusive geometric background lines and nodes.
      */}
      <canvas
        id="global-fluid-particle-canvas"
        ref={particleCanvasRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
          isDark
            ? 'opacity-35 mix-blend-screen'
            : 'opacity-28'
        }`}
        style={{
          filter: isDark
            ? 'drop-shadow(0 0 1px rgba(96, 165, 250, 0.35))'
            : 'drop-shadow(0 0 1px rgba(37, 99, 235, 0.22))',
          willChange: 'opacity',
        }}
      />
    </div>
  );
};
