import React, { useEffect, useRef, useCallback } from 'react';

const TRAIL_SVGS = [
  // 1. Sparkle Star
  `<svg class="w-5 h-5 fill-amber-300" viewBox="0 0 24 24"><path d="M12,2 L14.5,9.5 L22,12 L14.5,14.5 L12,22 L9.5,14.5 L2,12 L9.5,9.5 Z" /></svg>`,
  // 2. Pink Heart
  `<svg class="w-4 h-4 fill-pink-400" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>`,
  // 3. Glowing Mini Star
  `<svg class="w-4 h-4 fill-amber-200" viewBox="0 0 24 24"><path d="M12,1.5 L14.5,9 L22,9 L15.5,13.5 L18,21 L12,16.5 L6,21 L8.5,13.5 L2,9 L9.5,9 Z" /></svg>`,
  // 4. White mini-heart
  `<svg class="w-4 h-4 fill-white/90 drop-shadow-sm" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>`,
  // 5. Cute blossom outline
  `<svg class="w-5 h-5 fill-rose-300 stroke-rose-400" stroke-width="1.2" viewBox="0 0 24 24"><path d="M12,4 C11,2 7,2 6,4 C4,6 4,10 6,12 C7,13 11,13 12,12 C13,13 17,13 18,12 C20,10 20,6 18,4 C17,2 13,2 12,4 Z" /></svg>`,
];

interface TrailParticle {
  x: number;
  y: number;
  svgHTML: string;
  id: number;
  opacity: number;
  scale: number;
  vx: number;
  vy: number;
}

export default function EmojiTrail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<TrailParticle[]>([]);
  const frameRef = useRef<number>(0);
  const counterRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const throttleRef = useRef(0);

  const spawnParticle = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - throttleRef.current < 130) return;
    throttleRef.current = now;

    const dx = x - lastPosRef.current.x;
    const dy = y - lastPosRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 12) return;

    lastPosRef.current = { x, y };
    counterRef.current++;

    particlesRef.current.push({
      x,
      y,
      svgHTML: TRAIL_SVGS[counterRef.current % TRAIL_SVGS.length],
      id: counterRef.current,
      opacity: 0.8,
      scale: 0.6 + Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 2,
      vy: -1 - Math.random() * 2,
    });

    if (particlesRef.current.length > 8) {
      particlesRef.current.shift();
    }
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => spawnParticle(e.clientX, e.clientY);
    const handleTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) spawnParticle(t.clientX, t.clientY);
    };

    window.addEventListener('mousemove', handleMouse, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('touchmove', handleTouch);
    };
  }, [spawnParticle]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const animate = () => {
      const particles = particlesRef.current;

      particles.forEach(p => {
        p.opacity -= 0.02;
        p.scale *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
      });

      particlesRef.current = particles.filter(p => p.opacity > 0);

      // Update DOM
      const children = container.children;
      // Remove extra
      while (children.length > particlesRef.current.length) {
        container.removeChild(container.lastChild!);
      }
      // Add missing
      while (children.length < particlesRef.current.length) {
        const span = document.createElement('span');
        span.className = 'fixed pointer-events-none z-50';
        span.style.transition = 'none';
        span.style.left = '0';
        span.style.top = '0';
        span.style.willChange = 'transform, opacity';
        container.appendChild(span);
      }
      // Update
      particlesRef.current.forEach((p, i) => {
        const el = children[i] as HTMLElement;
        if (el.innerHTML !== p.svgHTML) {
          el.innerHTML = p.svgHTML;
        }
        el.style.opacity = String(p.opacity);
        el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${p.scale})`;
        el.style.filter = 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))';
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" />;
}
