import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Particle {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
}

const THEME_EMOJIS: Record<string, string[]> = {
  gold: ['✨', '⭐', '💫', '🌟'],
  pink: ['🌸', '🌷', '🌺', '💮', '🏵️'],
  lavender: ['🦋', '🦋', '💜', '🪻'],
  rainbow: ['🎉', '🎊', '✨', '🌈', '💫', '🩷', '🩵', '💛', '💚'],
};

export default function ThemeAnimations() {
  const { theme } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const emojis = THEME_EMOJIS[theme] || THEME_EMOJIS.gold;
    const count = theme === 'rainbow' ? 18 : 14;
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: emojis[i % emojis.length],
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 11 + Math.random() * 10,
        size: 14 + Math.random() * 12,
        drift: (Math.random() - 0.5) * 60,
      }))
    );
  }, [theme]);

  const isLavender = theme === 'lavender';

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {particles.map(p => (
        <span
          key={`${theme}-${p.id}`}
          className={isLavender ? 'absolute animate-butterfly-float' : 'absolute animate-petal-fall'}
          style={{
            left: `${p.left}%`,
            top: '-30px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}px`,
            opacity: 0.55,
            ['--drift' as any]: `${p.drift}px`,
            filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.35))',
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
