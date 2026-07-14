import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const HEART_SVGS = [
  // Heart A: Solid deep blush heart
  <svg className="w-full h-full fill-rose-400 drop-shadow-[0_2px_6px_rgba(244,63,94,0.35)]" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>,
  // Heart B: Outline luxury gold/pink heart
  <svg className="w-full h-full stroke-pink-400 fill-none" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>,
  // Heart C: Pastel heart with glow
  <svg className="w-full h-full fill-rose-300/80 drop-shadow-[0_2px_4px_rgba(244,63,94,0.25)]" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>,
  // Heart D: Soft translucent heart
  <svg className="w-full h-full stroke-rose-300 fill-rose-100/30" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>,
];

interface FloatingHeartItem {
  id: number;
  left: number;
  bottom: number;
  typeIndex: number;
  size: number;
  direction: number;
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<FloatingHeartItem[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHearts(prev => {
        const next = [...prev, {
          id: Date.now() + Math.random(),
          left: 8 + Math.random() * 84,
          bottom: Math.random() * 15,
          typeIndex: Math.floor(Math.random() * HEART_SVGS.length),
          size: 16 + Math.random() * 10,
          direction: Math.random() > 0.5 ? 1 : -1,
        }];
        if (next.length > 10) next.shift();
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = window.setInterval(() => {
      setHearts(prev => prev.filter((heart, index) => index >= prev.length - 10));
    }, 5000);
    return () => window.clearInterval(cleanup);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {hearts.map(h => (
        <motion.span
          key={h.id}
          className="absolute block"
          style={{
            left: `${h.left}%`,
            bottom: `${h.bottom}%`,
            width: `${h.size}px`,
            height: `${h.size}px`,
          }}
          initial={{ opacity: 0, y: 0, x: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.7, 0.6, 0],
            y: [0, -18, -38, -82, -140],
            x: [0, h.direction * 10, h.direction * -10, h.direction * 8, 0],
            rotate: [0, 18 * h.direction, -18 * h.direction, 12 * h.direction, 0],
            scale: [0.8, 1.05, 0.95, 0.8],
          }}
          transition={{ duration: 4.5, ease: 'easeInOut' }}
        >
          {HEART_SVGS[h.typeIndex]}
        </motion.span>
      ))}
    </div>
  );
}
