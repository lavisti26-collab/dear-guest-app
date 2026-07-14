import React, { useEffect, useState } from 'react';
import { useTheme } from '@/theme/ThemeEngine';

const THEME_SVGS: Record<string, React.ReactNode[]> = {
  gold: [
    // 4-point gold sparkle
    <svg className="w-full h-full fill-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" viewBox="0 0 24 24"><path d="M12,2 L14.5,9.5 L22,12 L14.5,14.5 L12,22 L9.5,14.5 L2,12 L9.5,9.5 Z" /></svg>,
    // 8-point star
    <svg className="w-full h-full fill-amber-200" viewBox="0 0 24 24"><path d="M12 2l2 4 4-2-2 4 4 2-4 2 2 4-4-2-2 4-2-4-4 2 2-4-4-2 4-2-2-4 4 2z" /></svg>,
    // Gold sparkle dust
    <svg className="w-full h-full fill-amber-100/90" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>
  ],
  classic: [
    // Khmer lotus petal
    <svg className="w-full h-full fill-amber-500/80 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" viewBox="0 0 24 24"><path d="M12 2C12 2 8 8 8 13C8 16.5 10 19.5 12 22C14 19.5 16 16.5 16 13C16 8 12 2 12 2Z" /></svg>,
    // Kbach flame ornament element
    <svg className="w-full h-full fill-amber-400" viewBox="0 0 24 24"><path d="M12 3 C10 8, 5 11, 5 15 C5 19 8.5 21 12 21 C15.5 21 19 19 19 15 C19 11, 14 8, 12 3 Z M12 8 C13.5 11, 15 13, 15 15 C15 16.5 13.5 17.5 12 17.5 C10.5 17.5 9 16.5 9 15 C9 13, 10.5 11, 12 8 Z" /></svg>,
    // Gold sparkle dust
    <svg className="w-full h-full fill-amber-200/90" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" /></svg>
  ],
  modern: [
    // Minimalist thin ring
    <svg className="w-full h-full stroke-zinc-400 fill-none" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>,
    // Minimalist diagonal cross
    <svg className="w-full h-full stroke-zinc-300" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>,
    // Minimalist dot
    <svg className="w-full h-full fill-zinc-400" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /></svg>
  ],
  romantic: [
    // Soft red rose petal
    <svg className="w-full h-full fill-rose-400/90 drop-shadow-[0_0_6px_rgba(251,113,133,0.4)]" viewBox="0 0 24 24"><path d="M12 2C9 5 5 10 5 14C5 18 8.5 21 12 21C15.5 21 19 18 19 14C19 10 15 5 12 2Z" /></svg>,
    // Romantic heart
    <svg className="w-full h-full fill-pink-400/80" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>,
    // Soft blush dust
    <svg className="w-full h-full fill-rose-200/90" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" /></svg>
  ],
  pink: [
    // Cherry blossom petal 1
    <svg className="w-full h-full fill-rose-300" viewBox="0 0 24 24"><path d="M12 2C12 2 6 8 6 14C6 18 9 21 12 21C15 21 18 18 18 14C18 8 12 2 12 2Z" /></svg>,
    // Cherry blossom petal 2
    <svg className="w-full h-full fill-pink-300" viewBox="0 0 24 24"><path d="M12 4C10 3 7 3 5 6C3 9 4 13 7 16C10 19 12 20 12 20C12 20 14 19 17 16C20 13 21 9 19 6C17 3 14 3 12 4Z" /></svg>,
    // Pointed pink petal
    <svg className="w-full h-full fill-rose-200" viewBox="0 0 24 24"><path d="M12 2C6 8 5 14 8 18C11 22 13 22 16 18C19 14 18 8 12 2Z" /></svg>
  ],
  lavender: [
    // Butterfly wing left & right path for flapping animation
    <svg className="w-full h-full fill-violet-300 stroke-violet-400" strokeWidth="1" viewBox="0 0 24 24">
      <path d="M12 10c0-3.5 2.5-6.5 5.5-6.5S23 6 23 9.5c0 3-4.5 6.5-11 9.5-6.5-3-11-6.5-11-9.5C1 6 3.5 3.5 6.5 3.5S12 6.5 12 10z" opacity="0.4"/>
      <path d="M12,18 C10.5,15.5 3,11 3,8 C3,4.5 6,4 7.5,6 C8.5,7.3 10.5,10 12,10.5 C13.5,10 15.5,7.3 16.5,6 C18,4 21,4.5 21,8 C21,11 13.5,15.5 12,18 Z" />
    </svg>,
    // Lavender heart outline
    <svg className="w-full h-full stroke-indigo-400 fill-none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ],
  'luxury-emerald': [
    // Emerald green luxury leaf
    <svg className="w-full h-full fill-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" viewBox="0 0 24 24"><path d="M17 3H21V7C21 12.5 15.5 18 10 18H6V14C6 8.5 11.5 3 17 3Z" /></svg>,
    // 8-point gold star matching emerald theme accents
    <svg className="w-full h-full fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" viewBox="0 0 24 24"><path d="M12 2l2 4 4-2-2 4 4 2-4 2 2 4-4-2-2 4-2-4-4 2 2-4-4-2 4-2-2-4 4 2z" /></svg>,
    // Emerald green glowing dot
    <svg className="w-full h-full fill-emerald-300/80" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" /></svg>
  ],
  'rose-gold-elegance': [
    // Soft pink/gold metallic rose petal
    <svg className="w-full h-full fill-rose-300/90 drop-shadow-[0_0_8px_rgba(244,143,177,0.5)]" viewBox="0 0 24 24"><path d="M12,2 C15,5 20,8 20,13 C20,17.5 16.5,21 12,21 C7.5,21 4,17.5 4,13 C4,8 9,5 12,2 Z" /></svg>,
    // Sparkling rose gold star
    <svg className="w-full h-full fill-rose-200" viewBox="0 0 24 24"><path d="M12,2 L14.5,9.5 L22,12 L14.5,14.5 L12,22 L9.5,14.5 L2,12 L9.5,9.5 Z" /></svg>,
    // Pink diamond sparkle
    <svg className="w-full h-full fill-pink-100/95" viewBox="0 0 24 24"><polygon points="12,4 19,12 12,20 5,12" /></svg>
  ],
  'nordic-frost': [
    // Elegant snowflake crystal
    <svg className="w-full h-full stroke-sky-300 fill-none" strokeWidth="1.5" viewBox="0 0 24 24">
      <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
      <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="12" cy="12" r="3" fill="none" />
    </svg>,
    // Ice sparkle star
    <svg className="w-full h-full fill-sky-100" viewBox="0 0 24 24"><path d="M12,4 L14,10 L20,12 L14,14 L12,20 L10,14 L4,12 L10,10 Z" /></svg>,
    // Frost dust
    <svg className="w-full h-full fill-sky-200/80" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /></svg>
  ],
  'midnight-corporate': [
    // Blue glowing tech orb
    <svg className="w-full h-full fill-cyan-400/80 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" /></svg>,
    // Tech sparkle node
    <svg className="w-full h-full stroke-blue-400" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="4" x2="12" y2="20" /><line x1="4" y1="12" x2="20" y2="12" /></svg>,
    // Dim cyber particle
    <svg className="w-full h-full fill-indigo-300/65" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /></svg>
  ],
  rainbow: [
    // Pastel circle
    <svg className="w-full h-full fill-rose-300" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>,
    // Pastel star
    <svg className="w-full h-full fill-amber-300" viewBox="0 0 24 24"><path d="M12,2 L14.5,9.5 L22,12 L14.5,14.5 L12,22 L9.5,14.5 L2,12 L9.5,9.5 Z" /></svg>,
    // Pastel blue circle
    <svg className="w-full h-full fill-sky-300" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>,
    // Pastel violet heart
    <svg className="w-full h-full fill-violet-300" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
  ]
};

function getCanonicalThemeKey(t: any): string {
  if (!t) return 'gold';
  let str = '';
  if (typeof t === 'string') {
    str = t;
  } else if (typeof t === 'object' && t.id && typeof t.id === 'string') {
    str = t.id;
  } else {
    return 'gold';
  }
  const k = str.toLowerCase();
  if (k.includes('emerald')) return 'luxury-emerald';
  if (k.includes('frost') || k.includes('nordic')) return 'nordic-frost';
  if (k.includes('rose') || k.includes('blush')) return 'rose-gold-elegance';
  if (k.includes('midnight') || k.includes('dark') || k.includes('black') || k.includes('cinema') || k.includes('apple')) return 'midnight-corporate';
  if (k.includes('pink') || k.includes('sakura')) return 'pink';
  if (k.includes('lavender') || k.includes('purple')) return 'lavender';
  if (k.includes('rainbow') || k.includes('pastel')) return 'rainbow';
  if (k.includes('classic') || k.includes('khmer')) return 'classic';
  if (k.includes('modern') || k.includes('clean')) return 'modern';
  if (k.includes('romantic')) return 'romantic';
  return 'gold';
}

interface Particle {
  id: number;
  typeIndex: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
}

export default function ThemeAnimations() {
  const { theme } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);

  const canonical = getCanonicalThemeKey(theme);

  useEffect(() => {
    const svgs = THEME_SVGS[canonical] || THEME_SVGS.gold;
    const count = canonical === 'rainbow' ? 18 : 14;
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        typeIndex: i % svgs.length,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 11 + Math.random() * 10,
        size: 14 + Math.random() * 12,
        drift: (Math.random() - 0.5) * 60,
      }))
    );
  }, [canonical]);

  const isButterfly = canonical === 'lavender';
  const svgs = THEME_SVGS[canonical] || THEME_SVGS.gold;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {particles.map(p => (
        <span
          key={`${canonical}-${p.id}`}
          className={isButterfly ? 'absolute animate-butterfly-float block' : 'absolute animate-petal-fall block'}
          style={{
            left: `${p.left}%`,
            top: '-30px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: 0.55,
            ['--drift' as string]: `${p.drift}px`,
            filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.35))',
          }}
        >
          {svgs[p.typeIndex]}
        </span>
      ))}
    </div>
  );
}
