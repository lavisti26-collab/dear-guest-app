import React, { useEffect, useState } from 'react';

const RAIN_SVGS = [
  // 1. Double pink hearts
  <svg className="w-full h-full fill-rose-400" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>,
  // 2. Butterfly
  <svg className="w-full h-full fill-indigo-300 stroke-indigo-400" strokeWidth="1" viewBox="0 0 24 24">
    <path d="M12,18.5 C10.5,16 3,11.5 3,8.5 C3,5 6,4.5 7.5,6.5 C8.5,7.8 10.5,10.5 12,11 C13.5,10.5 15.5,7.8 16.5,6.5 C18,4.5 21,5 21,8.5 C21,11.5 13.5,16 12,18.5 Z" />
  </svg>,
  // 3. Tulip flower
  <svg className="w-full h-full fill-pink-400" viewBox="0 0 24 24">
    <path d="M12,2 C10,4.5 9,6.5 9,9.5 C9,13.5 12,15 12,15 C12,15 15,13.5 15,9.5 C15,6.5 14,4.5 12,2 Z" />
  </svg>,
  // 4. Gold Wedding Ring
  <svg className="w-full h-full stroke-amber-400 fill-none" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="14" r="6" />
    <path d="M12,3 L15,8 L9,8 Z" fill="currentColor" stroke="none" />
  </svg>,
  // 5. Ribbon bow
  <svg className="w-full h-full fill-rose-300 stroke-rose-400" strokeWidth="1" viewBox="0 0 24 24">
    <path d="M12,12 C9.5,8 4.5,8 4.5,11.5 C4.5,14 8,14 12,12 C16,14 19.5,14 19.5,11.5 C19.5,8 14.5,8 12,12 Z" />
    <path d="M12,12 L9,19 M12,12 L15,19" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="2" className="fill-rose-500" />
  </svg>,
  // 6. Gold Sparkles
  <svg className="w-full h-full fill-amber-300" viewBox="0 0 24 24">
    <path d="M12,2 L14.5,9.5 L22,12 L14.5,14.5 L12,22 L9.5,14.5 L2,12 L9.5,9.5 Z" />
  </svg>,
  // 7. Soft white heart
  <svg className="w-full h-full fill-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
];

interface EmojiDrop {
  id: number;
  typeIndex: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export default function CuteEmojiRain() {
  const [drops, setDrops] = useState<EmojiDrop[]>([]);

  useEffect(() => {
    setDrops(Array.from({ length: 6 }, (_, i) => ({
      id: i,
      typeIndex: i % RAIN_SVGS.length,
      left: 5 + Math.random() * 90,
      delay: Math.random() * 18,
      duration: 14 + Math.random() * 10,
      size: 14 + Math.random() * 10,
    })));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {drops.map(d => (
        <span
          key={d.id}
          className="absolute animate-petal-fall block"
          style={{
            left: `${d.left}%`,
            top: '-30px',
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            opacity: 0.45,
            filter: 'drop-shadow(0 0 4px hsl(var(--gold) / 0.3))',
          }}
        >
          {RAIN_SVGS[d.typeIndex]}
        </span>
      ))}
    </div>
  );
}
