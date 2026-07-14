import React, { useEffect, useState } from 'react';

const PETAL_SVGS = [
  // Petal A: Classic teardrop rose petal
  <svg className="w-full h-full fill-rose-400/50 drop-shadow-[0_1px_2px_rgba(244,63,94,0.15)]" viewBox="0 0 24 24">
    <path d="M12 2C12 2 6 8 6 14C6 18 9 21 12 21C15 21 18 18 18 14C18 8 12 2 12 2Z" />
  </svg>,
  // Petal B: Heart-shaped blossom petal
  <svg className="w-full h-full fill-pink-300/60 drop-shadow-[0_1px_2px_rgba(236,72,153,0.15)]" viewBox="0 0 24 24">
    <path d="M12 4C10 3 7 3 5 6C3 9 4 13 7 16C10 19 12 20 12 20C12 20 14 19 17 16C20 13 21 9 19 6C17 3 14 3 12 4Z" />
  </svg>,
  // Petal C: Elegant pointed petal
  <svg className="w-full h-full fill-rose-300/40 drop-shadow-[0_1px_2px_rgba(244,63,94,0.15)]" viewBox="0 0 24 24">
    <path d="M12 2C6 8 5 14 8 18C11 22 13 22 16 18C19 14 18 8 12 2Z" />
  </svg>,
  // Petal D: Slender willow-like leaf/petal
  <svg className="w-full h-full fill-rose-200/50 drop-shadow-[0_1px_1px_rgba(244,63,94,0.1)]" viewBox="0 0 24 24">
    <path d="M12 2C9 7 8 13 10 18C12 22 12 22 14 18C16 13 15 7 12 2Z" />
  </svg>,
  // Petal E: Asymmetric organic petal
  <svg className="w-full h-full fill-pink-400/40 drop-shadow-[0_1px_2px_rgba(236,72,153,0.15)]" viewBox="0 0 24 24">
    <path d="M12 2C7 5 6 11 9 16C12 21 15 21 17 17C19 13 17 7 12 2Z" />
  </svg>,
];

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export default function FallingPetals() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    // Reduced count for performance
    setPetals(Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 12 + Math.random() * 10,
      size: 12 + Math.random() * 8,
    })));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {petals.map(p => (
        <span
          key={p.id}
          className="absolute animate-petal-fall block"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            top: '-20px',
            opacity: 0.5,
          }}
        >
          {PETAL_SVGS[p.id % PETAL_SVGS.length]}
        </span>
      ))}
    </div>
  );
}
