import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CUTE_HEARTS = ['💗', '💕', '💖', '🤍', '♡', '🩷', '🩵'];

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<{ id: number; left: number; bottom: number; emoji: string; size: number; direction: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHearts(prev => {
        const next = [...prev, {
          id: Date.now() + Math.random(),
          left: 8 + Math.random() * 84,
          bottom: Math.random() * 15,
          emoji: CUTE_HEARTS[Math.floor(Math.random() * CUTE_HEARTS.length)],
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
          className="absolute"
          style={{
            left: `${h.left}%`,
            bottom: `${h.bottom}%`,
            fontSize: `${h.size}px`,
            filter: 'drop-shadow(0 0 6px hsl(var(--blush) / 0.4))',
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
          {h.emoji}
        </motion.span>
      ))}
    </div>
  );
}
