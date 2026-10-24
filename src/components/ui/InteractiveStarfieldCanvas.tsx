import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  size: number;
  baseAlpha: number;
  phase: number;
  speedX: number;
  speedY: number;
  color: string;
}

const COLORS = [
  '244, 63, 94',   // Rose 500
  '253, 164, 175', // Rose 300
  '251, 191, 36',  // Amber 400
  '255, 241, 242', // Rose 50
  '244, 114, 182', // Pink 400
];

export const InteractiveStarfieldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let lastScrollY = window.scrollY || window.pageYOffset || 0;
    let scrollVelocity = 0;
    let pointerX = width / 2;
    let pointerY = height / 2;

    // Higher particle density so the cosmos feels rich immediately on load
    const particleCount = width < 640 ? 75 : 135;
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: 0.4 + Math.random() * 1.5,
      size: 1.2 + Math.random() * 2.6,
      baseAlpha: 0.25 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -0.15 - Math.random() * 0.35,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length > 0) {
        pointerX = e.touches[0].clientX;
        pointerY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        pointerX = e.clientX;
        pointerY = e.clientY;
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    let tick = 0;
    const render = () => {
      tick += 0.022;

      // Sample scroll position directly per frame: eliminates mobile scroll listener delay!
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Smoothly blend scroll velocity to prevent abrupt jumps or delayed reaction
      const targetVel = Math.max(-40, Math.min(40, scrollDelta * 0.45));
      scrollVelocity = scrollVelocity * 0.82 + targetVel * 0.18;

      ctx.clearRect(0, 0, width, height);

      // Soft interactive ambient glow around cursor / finger
      const auraGrad = ctx.createRadialGradient(
        pointerX,
        pointerY,
        15,
        pointerX,
        pointerY,
        Math.min(width * 0.8, 380)
      );
      auraGrad.addColorStop(0, 'rgba(244, 63, 94, 0.09)');
      auraGrad.addColorStop(0.45, 'rgba(251, 191, 36, 0.035)');
      auraGrad.addColorStop(1, 'rgba(6, 8, 17, 0)');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, width, height);

      for (const p of particles) {
        if (!prefersReducedMotion) {
          p.x += p.speedX + Math.sin(tick + p.phase) * 0.22;
          p.y += (p.speedY - scrollVelocity * 0.5) * p.z;

          // Wrap smoothly with buffer
          if (p.y < -30) p.y = height + 30;
          if (p.y > height + 30) p.y = -30;
          if (p.x < -30) p.x = width + 30;
          if (p.x > width + 30) p.x = -30;
        }

        const twinkle = 0.65 + 0.35 * Math.sin(tick * 2.4 + p.phase);
        const alpha = Math.min(1, p.baseAlpha * twinkle);
        const warpStretch = Math.abs(scrollVelocity) * p.z * 1.5;

        ctx.save();
        ctx.beginPath();
        if (warpStretch > 2.2) {
          ctx.strokeStyle = `rgba(${p.color}, ${alpha})`;
          ctx.lineWidth = p.size;
          ctx.lineCap = 'round';
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + warpStretch);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
          ctx.shadowColor = `rgba(${p.color}, 0.75)`;
          ctx.shadowBlur = p.size * 3.5;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
};
