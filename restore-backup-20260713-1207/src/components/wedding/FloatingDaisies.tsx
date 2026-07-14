import React from 'react';
import { motion } from 'framer-motion';

const daisies = [
  { emoji: '✦', x: '8%', y: '20%', size: 12, delay: 0 },
  { emoji: '✧', x: '90%', y: '30%', size: 10, delay: 1 },
  { emoji: '✦', x: '12%', y: '55%', size: 10, delay: 2 },
  { emoji: '✧', x: '85%', y: '65%', size: 12, delay: 1.5 },
  { emoji: '✦', x: '50%', y: '85%', size: 8, delay: 3 },
  { emoji: '✧', x: '25%', y: '10%', size: 8, delay: 0.5 },
];

export default function FloatingDaisies() {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {daisies.map((d, i) => (
        <motion.span
          key={i}
          className="absolute text-gold-light/30"
          style={{ left: d.x, top: d.y, fontSize: `${d.size}px` }}
          animate={{
            y: [0, -12, 0, -8, 0],
            x: [0, 6, -6, 6, 0],
            rotate: [0, 12, -12, 10, 0],
            scale: [1, 1.02, 0.98, 1.03, 1],
            opacity: [0.2, 0.35, 0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 6 + Math.random() * 2,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: d.delay,
            ease: 'easeInOut',
          }}
        >
          {d.emoji}
        </motion.span>
      ))}
    </div>
  );
}
