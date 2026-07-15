import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { useTheme } from '@/theme/ThemeEngine';
import confetti from 'canvas-confetti';
import { requestPlayMusic } from '@/lib/wedding-music';
import injectFontFaces from '@/lib/font-loader';
import { getTextStyle } from '../CoupleCard';

// ── Font stack mapping identical to CoupleCard.tsx ──
const FONT_MAP = {
  angkor:              "'Angkor', serif",
  bayon:               "'Bayon', serif",
  battambang:          "'Battambang', serif",
  chenla:              "'Chenla', serif",
  kantumruy:           "'Kantumruy Pro', sans-serif",
  kantumruypro:        "'Kantumruy Pro', sans-serif",
  koulen:              "'Koulen', sans-serif",
  moulpali:            "'Moulpali', serif",
  preahvihear:         "'Preahvihear', serif",
  siemreap:            "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
  akbalthoMkhmerler:   "'AKbalthom KhmerLer', sans-serif",
  akbalthomkhmerler:   "'AKbalthom KhmerLer', sans-serif",
  akbalthom:           "'AKbalthom KhmerLer', sans-serif",
  khbllazyoutline:     "'Kh BL LazyOutline', sans-serif",
  notosanskhmer:       "'Noto Sans Khmer', 'Kantumruy Pro', sans-serif",
  notoserifkhmer:      "'Noto Serif Khmer', 'Hanuman', serif",
  hanuman:             "'Hanuman', 'Koh Santepheap', serif",
  kohsantepheap:       "'Koh Santepheap', 'Hanuman', serif",
  moul:                "'Moul', serif",
  cormorant:           "'Cormorant Garamond', Georgia, serif",
  cormorantgaramond:   "'Cormorant Garamond', Georgia, serif",
  playfair:            "'Playfair Display', Georgia, serif",
  playfairdisplay:     "'Playfair Display', Georgia, serif",
  greatvibes:          "'Great Vibes', 'Dancing Script', cursive",
  dancingscript:       "'Dancing Script', cursive",
  cinzel:              "'Cinzel', serif",
  lora:                "'Lora', Georgia, serif",
  auto:                "var(--font-display, var(--font-khmer, 'Kantumruy Pro', sans-serif))",
} as const;

function getFontStack(f?: string) {
  if (!f || f === 'auto') return FONT_MAP.auto;
  const key = f.toLowerCase().replace(/[^a-z]/g, '') as keyof typeof FONT_MAP;
  const SUPABASE_KHMER = [
    'Battambang','Angkor','Bayon','Chenla','Kantumruy Pro','Koulen',
    'Moulpali','Preahvihear','Siemreap','AKbalthom KhmerLer','Kh BL LazyOutline',
  ];
  const exactName = SUPABASE_KHMER.find(n => n.toLowerCase().replace(/[^a-z]/g,'') === key);
  if (exactName) {
    try {
      injectFontFaces({ display: exactName, body: exactName, khmer: exactName, weights: [400, 700] } as any, `couple-card-${key}`);
    } catch (_) { /* non-critical */ }
  }
  return FONT_MAP[key] ?? FONT_MAP.auto;
}

function isKhmerFont(f?: string) {
  if (!f || f === 'auto') return true;
  const k = f.toLowerCase().replace(/[^a-z]/g, '');
  return [
    'moul','moulpali','koulen','kantumruy','kantumruypro','hanuman','battambang',
    'angkor','bayon','chenla','preahvihear','siemreap',
    'akbalthomkhmerler','akbalthom','khbllazyoutline',
    'notosanskhmer','notoserifkhmer','kohsantepheap','auto',
  ].includes(k);
}

function splitCoupleNames(names: string): { groom: string; bride: string } {
  if (!names) return { groom: '', bride: '' };
  // eslint-disable-next-line no-misleading-character-class
  const cleanNames = names.replace(/[\u200b\u200c\u200d\ufeff]/g, '').trim();
  const regex = /\s*(?:&|and|និង|&amp;)\s*/i;
  const match = cleanNames.match(regex);
  if (match && match.index !== undefined) {
    return {
      groom: cleanNames.slice(0, match.index).trim(),
      bride: cleanNames.slice(match.index + match[0].length).trim(),
    };
  }
  return { groom: cleanNames.trim(), bride: '' };
}

interface EnvelopeProps {
  guestName: string;
  onOpen: () => void;
  isOpen: boolean;
  inlinePreview?: boolean;
}

const spring = { type: 'spring' as const, duration: 0.7, bounce: 0.1 };

// ── Confetti burst ──────────────────────────────────────────────────────────
function launchFireworks() {
  const colors = ['#D4A76A', '#E8C8A0', '#F4C2C2', '#C9A96E', '#F0D5B8', '#E0B4A5', '#fff9f0'];
  const duration = 3000;
  const end = Date.now() + duration;
  const frame = () => {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  setTimeout(() => confetti({ particleCount: 100, spread: 100, origin: { y: 0.55 }, colors, startVelocity: 45, gravity: 0.85, scalar: 1.15 }), 150);
  [600, 1200, 1900].forEach((d) =>
    setTimeout(() =>
      confetti({ particleCount: 40, spread: 360, origin: { x: Math.random(), y: Math.random() * 0.35 + 0.1 }, colors, startVelocity: 28, ticks: 70 }),
      d
    )
  );
}

// ── Floating petal particle ──────────────────────────────────────────────────
function Petal({ delay, x, size }: { delay: number; x: number; size: number }) {
  const emojis = ['🌸', '🌺', '✿', '❀', '🌹'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${x}%`, top: '-40px', fontSize: size, opacity: 0.55 }}
      animate={{ y: ['0vh', '110vh'], rotate: [0, 360], x: [0, (Math.random() - 0.5) * 80] }}
      transition={{ duration: 9 + Math.random() * 8, delay, repeat: Infinity, ease: 'linear' }}
    >
      {emoji}
    </motion.div>
  );
}

// ── Orbiting sparkle ────────────────────────────────────────────────────────
function Sparkle({ angle, radius, delay, color }: { angle: number; radius: number; delay: number; color: string }) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;
  return (
    <motion.div
      className="absolute text-xs pointer-events-none font-bold"
      style={{ left: '50%', top: '50%', color }}
      animate={{ x: [x * 0.8, x, x * 0.8], y: [y * 0.8, y, y * 0.8], scale: [0.6, 1.2, 0.6], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 3, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      ✦
    </motion.div>
  );
}

// ── Wax seal SVG ─────────────────────────────────────────────────────────────
function WaxSeal({ popping, initials = '♡' }: { popping: boolean; initials?: string }) {
  return (
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 z-20 cursor-pointer"
      style={{ bottom: '-18px' }}
      animate={popping ? { scale: [1, 1.4, 0], opacity: [1, 1, 0] } : { scale: [1, 1.05, 1] }}
      transition={popping ? { duration: 0.45, ease: 'easeOut' } : { duration: 2.5, repeat: Infinity }}
    >
      <div className="relative w-12 h-12">
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full bg-amber-400/40 blur-md" />
        {/* Seal body */}
        <svg viewBox="0 0 48 48" className="w-12 h-12 drop-shadow-lg">
          <defs>
            <radialGradient id="sealG" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#F0C97A" />
              <stop offset="55%" stopColor="#C9913A" />
              <stop offset="100%" stopColor="#8B5E1A" />
            </radialGradient>
            <radialGradient id="sealShine" cx="30%" cy="25%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          {/* 12-point starburst */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            const x1 = 24 + 21 * Math.cos(a);
            const y1 = 24 + 21 * Math.sin(a);
            const a2 = ((i * 30 + 15) * Math.PI) / 180;
            const x2 = 24 + 17 * Math.cos(a2);
            const y2 = 24 + 17 * Math.sin(a2);
            return <polygon key={i} points={`24,24 ${x1},${y1} ${x2},${y2}`} fill="url(#sealG)" />;
          })}
          <circle cx="24" cy="24" r="16" fill="url(#sealG)" />
          <circle cx="24" cy="24" r="16" fill="url(#sealShine)" />
          <text x="24" y="28" textAnchor="middle" fontSize={initials.includes('•') ? 9 : 13} fill="rgba(255,255,255,0.9)" fontFamily="serif" fontWeight="bold">
            {initials}
          </text>
        </svg>
      </div>
    </motion.div>
  );
}

// ── Theme style resolver ──────────────────────────────────────────────────────
type ThemeStyleType = 'apple' | 'khmer' | 'vintage' | 'romantic' | 'neo-brutalism' | 'glassmorphism' | 'minimalist';

function getThemeStyleType(themeId: string): ThemeStyleType {
  const id = themeId.toLowerCase();
  // Khmer / gold / royal
  if (
    id.includes('khmer') ||
    id.includes('gold') ||
    id.includes('emerald') ||
    id.includes('royal') ||
    id.includes('traditional') ||
    id.includes('palace') ||
    id.includes('heritage') ||
    id.includes('elegant-gold') ||
    id.includes('watercolor')
  ) return 'khmer';
  // Vintage / editorial / cinema
  if (
    id.includes('film') ||
    id.includes('vintage') ||
    id.includes('news') ||
    id.includes('editorial') ||
    id.includes('chronicle') ||
    id.includes('fashion') ||
    id.includes('cinematic')
  ) return 'vintage';
  // Romantic
  if (
    id.includes('romantic') ||
    id.includes('rose') ||
    id.includes('sakura') ||
    id.includes('floral') ||
    id.includes('korean') ||
    id.includes('blush') ||
    id.includes('pink')
  ) return 'romantic';
  // Neo-brutalism
  if (
    id.includes('neo') ||
    id.includes('brutalism') ||
    id.includes('corporate') ||
    id.includes('modern') ||
    id.includes('classic')
  ) return 'neo-brutalism';
  // Glassmorphism
  if (
    id.includes('glass') ||
    id.includes('frost') ||
    id.includes('beach') ||
    id.includes('sunset')
  ) return 'glassmorphism';
  // Minimalist
  if (
    id.includes('minimal') ||
    id.includes('nordic') ||
    id.includes('white') ||
    id.includes('clean') ||
    id.includes('lavender')
  ) return 'minimalist';
  return 'apple';
}

// ── Envelope dynamic style mapper ──
interface EnvelopeStyles {
  containerBg: string;
  envelopeBg: string;
  envelopeBorder: string;
  flapFaceBg: string;
  flapInnerBg: string;
  liningBg: string;
  dividerLineColor: string;
  shadowColor: string;
  helperTextColor: string;
  btnBg: string;
  btnHoverBg: string;
  btnShadow: string;
  btnBorder: string;
  accentStarsColor: string;
  glowOpacity: number;
  isDark?: boolean;
}

function getEnvelopeStyles(themeStyle: ThemeStyleType, isDark: boolean): EnvelopeStyles {
  if (isDark || themeStyle === 'glassmorphism') {
    return {
      containerBg: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0a 100%)',
      envelopeBg: 'rgba(255, 255, 255, 0.05)',
      envelopeBorder: '1px solid rgba(255, 255, 255, 0.12)',
      flapFaceBg: 'linear-gradient(170deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
      flapInnerBg: 'linear-gradient(170deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
      liningBg: 'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 8px)',
      dividerLineColor: 'rgba(255, 255, 255, 0.08)',
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      helperTextColor: 'text-white/40',
      btnBg: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      btnHoverBg: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
      btnShadow: '0 4px 24px rgba(255, 255, 255, 0.05)',
      btnBorder: '1px solid rgba(255, 255, 255, 0.15)',
      accentStarsColor: 'rgba(251,191,36,0.3)',
      glowOpacity: 0.15,
      isDark: true,
    };
  }

  if (themeStyle === 'romantic') {
    return {
      containerBg: 'radial-gradient(ellipse at 30% 40%, #FFF0F2 0%, #FEE2E6 45%, #FCE7F3 100%)',
      envelopeBg: 'linear-gradient(160deg, #FFF5F6 0%, #FCE7F3 60%, #FBCFE8 100%)',
      envelopeBorder: '1px solid rgba(244, 114, 182, 0.35)',
      flapFaceBg: 'linear-gradient(170deg, #FFF5F6 0%, #FCE7F3 100%)',
      flapInnerBg: 'linear-gradient(170deg, #FBCFE8 0%, #F472B6 100%)',
      liningBg: 'repeating-linear-gradient(45deg, rgba(244, 114, 182, 0.08) 0px, rgba(244, 114, 182, 0.08) 1px, transparent 1px, transparent 8px)',
      dividerLineColor: 'rgba(244, 114, 182, 0.18)',
      shadowColor: 'rgba(120, 40, 60, 0.15)',
      helperTextColor: 'text-rose-700/50',
      btnBg: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
      btnHoverBg: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
      btnShadow: '0 4px 24px rgba(219, 39, 119, 0.3)',
      btnBorder: '1px solid rgba(255, 255, 255, 0.2)',
      accentStarsColor: 'rgba(244, 114, 182, 0.4)',
      glowOpacity: 0.25,
      isDark: false,
    };
  }

  if (themeStyle === 'vintage' || themeStyle === 'neo-brutalism') {
    return {
      containerBg: 'radial-gradient(ellipse at 30% 40%, #F5F2EB 0%, #EBE7DC 60%, #DDD8C8 100%)',
      envelopeBg: '#EBE7DC',
      envelopeBorder: '2px solid #111111',
      flapFaceBg: '#EBE7DC',
      flapInnerBg: '#DDD8C8',
      liningBg: 'repeating-linear-gradient(45deg, rgba(17, 17, 17, 0.05) 0px, rgba(17, 17, 17, 0.05) 1px, transparent 1px, transparent 8px)',
      dividerLineColor: 'rgba(17, 17, 17, 0.12)',
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      helperTextColor: 'text-neutral-700/60',
      btnBg: '#111111',
      btnHoverBg: '#222222',
      btnShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      btnBorder: '1px solid #111111',
      accentStarsColor: 'rgba(17, 17, 17, 0.2)',
      glowOpacity: 0,
      isDark: false,
    };
  }

  // default / khmer / elegant-gold
  return {
    containerBg: 'radial-gradient(ellipse at 30% 40%, hsl(38 45% 95%) 0%, hsl(36 35% 91%) 45%, hsl(345 25% 87%) 100%)',
    envelopeBg: 'linear-gradient(160deg, hsl(36 40% 96%) 0%, hsl(36 35% 92%) 60%, hsl(36 30% 88%) 100%)',
    envelopeBorder: '1px solid rgba(212,167,106,0.35)',
    flapFaceBg: 'linear-gradient(170deg, hsl(36 42% 94%) 0%, hsl(36 38% 90%) 100%)',
    flapInnerBg: 'linear-gradient(170deg, hsl(38 50% 88%) 0%, hsl(36 42% 84%) 100%)',
    liningBg: 'repeating-linear-gradient(45deg, rgba(212,167,106,0.06) 0px, rgba(212,167,106,0.06) 1px, transparent 1px, transparent 8px)',
    dividerLineColor: 'rgba(180,140,90,0.12)',
    shadowColor: 'rgba(140,90,30,0.18)',
    helperTextColor: 'text-amber-800/50',
    btnBg: 'linear-gradient(135deg, #D4A76A 0%, #C4912A 50%, #D4A76A 100%)',
    btnHoverBg: 'linear-gradient(135deg, #E8C8A0 0%, #D4A76A 50%, #E8C8A0 100%)',
    btnShadow: '0 4px 24px rgba(196,145,42,0.35)',
    btnBorder: '1px solid rgba(255,220,140,0.25)',
    accentStarsColor: 'hsl(38 55% 55%)',
    glowOpacity: 0.3,
    isDark: false,
  };
}

// ── Fluid Font Size clamp helper ─────────────────────────────────────────────
function getFluidFontSize(name: string, isKhmer: boolean, maxRem = 2.2, minRem = 1.1): string {
  const len = name.length;
  let computedMax = maxRem;
  if (len > 24) {
    computedMax = maxRem * 0.6;
  } else if (len > 16) {
    computedMax = maxRem * 0.75;
  } else if (len > 10) {
    computedMax = maxRem * 0.9;
  }
  const fluidSizeVw = 32 / Math.max(len, 8);
  return `clamp(${minRem}rem, ${fluidSizeVw}vw, ${computedMax}rem)`;
}

// ── SVG divider & connector components ────────────────────────────────────────
const EleganceLineDivider = ({ color }: { color: string }) => (
  <div className="flex items-center justify-center gap-2 py-1.5 w-full max-w-[200px] mx-auto">
    <div className="h-[0.5px] flex-1" style={{ background: `linear-gradient(to right, transparent, ${color})` }} />
    <span className="text-[8px]" style={{ color }}>✦</span>
    <div className="h-[0.5px] flex-1" style={{ background: `linear-gradient(to left, transparent, ${color})` }} />
  </div>
);

const AppleDivider = () => (
  <div className="w-full flex items-center justify-center py-2 opacity-20">
    <div className="w-16 h-[0.5px] bg-white" />
  </div>
);

const AppleConnector = () => (
  <div className="py-2 flex items-center justify-center">
    <svg viewBox="0 0 100 24" className="w-20 h-6 text-white/40 fill-none stroke-current" strokeWidth="1.2" strokeLinecap="round">
      <line x1="5" y1="12" x2="35" y2="12" />
      <circle cx="45" cy="12" r="8" />
      <circle cx="55" cy="12" r="8" />
      <line x1="65" y1="12" x2="95" y2="12" />
    </svg>
  </div>
);

const KhmerDivider = () => (
  <div className="py-3 flex items-center justify-center w-full">
    <svg viewBox="0 0 160 20" className="w-48 h-6 text-[#B8893E]" fill="currentColor">
      <path d="M80 0 C83 6, 88 10, 95 10 C88 10, 83 14, 80 20 C77 14, 72 10, 65 10 C72 10, 77 6, 80 0 Z" />
      <path d="M10 10 Q45 2 65 10 T105 10 T150 10" fill="none" stroke="#B8893E" strokeWidth="1" strokeLinecap="round" />
      <circle cx="5" cy="10" r="1.5" />
      <circle cx="155" cy="10" r="1.5" />
    </svg>
  </div>
);

const KhmerConnector = () => (
  <div className="py-2">
    <span className="font-bold text-base text-[#991b1b] uppercase leading-[1.95] block px-4" style={{ fontFamily: "'Moul', serif" }}>
      និង
    </span>
  </div>
);

const VintageDivider = () => (
  <div className="flex flex-col gap-1 w-full max-w-[160px] py-3 items-center justify-center mx-auto">
    <div className="h-1 bg-neutral-950 w-full" />
    <div className="h-[2px] bg-neutral-950 w-full" />
  </div>
);

const VintageConnector = () => (
  <div className="py-2 flex items-center justify-center">
    <svg viewBox="0 0 100 30" className="w-24 h-8 text-neutral-950 fill-current" preserveAspectRatio="xMidYMid meet">
      <path d="M50 5 C53 10, 58 12, 63 12 C58 12, 53 14, 50 20 C47 14, 42 12, 37 12 C42 12, 47 10, 50 5 Z" />
      <path d="M50 20 L50 25" stroke="currentColor" strokeWidth="1.5" />
      <line x1="15" y1="15" x2="35" y2="15" stroke="currentColor" strokeWidth="1" />
      <line x1="65" y1="15" x2="85" y2="15" stroke="currentColor" strokeWidth="1" />
      <circle cx="10" cy="15" r="2" />
      <circle cx="90" cy="15" r="2" />
    </svg>
  </div>
);

// Romantic
const RomanticDivider = () => (
  <div className="flex items-center justify-center gap-2 py-2 w-full">
    <div className="h-px flex-1 max-w-[50px]" style={{ background: 'linear-gradient(to right, transparent, rgba(244,114,182,0.5))' }} />
    <span className="text-rose-400 text-sm">🌸</span>
    <div className="h-px flex-1 max-w-[50px]" style={{ background: 'linear-gradient(to left, transparent, rgba(244,114,182,0.5))' }} />
  </div>
);

const RomanticConnector = () => (
  <div className="py-1 flex items-center justify-center gap-1">
    <span className="text-rose-400 text-base animate-pulse">💗</span>
    <span className="text-pink-300 text-sm">💗</span>
    <span className="text-rose-400 text-base animate-pulse" style={{ animationDelay: '0.3s' }}>💗</span>
  </div>
);

// Neo-Brutalism
const NeoBrutalDivider = () => (
  <div className="w-full py-2">
    <div className="h-[3px] bg-neutral-950 w-full" />
  </div>
);

const NeoBrutalConnector = () => (
  <div className="py-1 flex items-center justify-center">
    <span className="text-2xl font-black text-neutral-950">&</span>
  </div>
);

// Glassmorphism
const GlassDivider = () => (
  <div className="flex items-center justify-center gap-3 py-2 w-full">
    <div className="h-px flex-1 max-w-[50px]" style={{ background: 'rgba(255,255,255,0.3)' }} />
    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.5)' }} />
    <div className="h-px flex-1 max-w-[50px]" style={{ background: 'rgba(255,255,255,0.3)' }} />
  </div>
);

const GlassConnector = () => (
  <div className="py-2 flex items-center justify-center">
    <svg viewBox="0 0 100 24" className="w-20 h-6 fill-none stroke-current" style={{ color: 'rgba(255,255,255,0.5)' }} strokeWidth="1.2" strokeLinecap="round">
      <circle cx="38" cy="12" r="9" />
      <circle cx="62" cy="12" r="9" />
    </svg>
  </div>
);

// Minimalist
const MinimalDivider = () => (
  <div className="w-full flex items-center justify-center py-2">
    <div className="w-12 h-px" style={{ background: 'rgba(100,100,100,0.3)' }} />
  </div>
);

const MinimalConnector = () => (
  <div className="py-1 flex items-center justify-center">
    <span className="text-sm text-neutral-400 tracking-widest">·</span>
  </div>
);

// ── Theme card frame styles — ONE consistent design ──────────────────────────
// Always a clean cream/white card. Theme only changes font + accent color.
const getThemeCardStyles = (_themeId: string) => ({
  cardStyle: {
    background: 'linear-gradient(145deg, #FAF8F5, #F5EFE6)',
    border: '1px solid rgba(212, 167, 106, 0.35)',
    boxShadow: '0 -4px 20px rgba(180, 130, 60, 0.12), 0 8px 32px rgba(0, 0, 0, 0.06)',
    borderRadius: '1rem',
  },
  staticCardClass: 'bg-[#FAF8F5] border border-[#D4AF37]/35 rounded-2xl',
});

const KhmerCorner = ({ strokeColor }: { strokeColor: string }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-40">
    <path d="M4 4 Q30 4 30 30 Q4 30 4 4Z" fill="none" stroke={strokeColor} strokeWidth="1" />
    <path d="M4 4 L22 4 M4 4 L4 22" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="8" cy="8" r="1.8" fill={strokeColor} />
    <path d="M12 4 Q28 4 28 20" fill="none" stroke={strokeColor} strokeWidth="0.6" opacity="0.7" />
  </svg>
);

const RomanticCorner = ({ strokeColor }: { strokeColor: string }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-35">
    <path d="M 4,4 C 18,4 28,14 28,28" fill="none" stroke={strokeColor} strokeWidth="1" />
    <path d="M 4,4 C 4,18 14,28 28,28" fill="none" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="2,2" />
    <path d="M 4,4 C 8,14 14,18 20,20" fill="none" stroke={strokeColor} strokeWidth="0.8" />
    <circle cx="8" cy="8" r="2.2" fill={strokeColor} />
    <circle cx="15" cy="15" r="1.8" fill={strokeColor} />
    <circle cx="21" cy="21" r="1.2" fill={strokeColor} />
    <path d="M 11,5 Q 13,8 11,10 Q 9,8 11,5 Z" fill={strokeColor} />
    <path d="M 5,11 Q 8,13 10,11 Q 8,9 5,11 Z" fill={strokeColor} />
  </svg>
);

const MinimalCorner = ({ strokeColor }: { strokeColor: string }) => (
  <svg width="45" height="45" viewBox="0 0 45 45" className="opacity-30">
    <line x1="4" y1="4" x2="35" y2="4" stroke={strokeColor} strokeWidth="1" />
    <line x1="4" y1="4" x2="4" y2="35" stroke={strokeColor} strokeWidth="1" />
    <circle cx="4" cy="4" r="1.5" fill={strokeColor} />
  </svg>
);

function StaticPeekContent({
  guestName, fontFamily, textEffectStyle, lang, t
}: { guestName: string; fontFamily: string; textEffectStyle: React.CSSProperties; lang: string; t: (k: string) => string }) {
  return (
    <div className="text-center py-4">
      <p className={`text-[9px] text-[#B8893E]/80 font-bold uppercase mb-1 ${lang === 'km' ? 'tracking-normal' : 'tracking-widest'}`}>
        {t('envelope.to')}
      </p>
      <p className="text-base font-bold leading-[1.95]" style={{ fontFamily, ...textEffectStyle }}>
        {guestName || t('greeting.guest')}
      </p>
    </div>
  );
}

const EVENT_TITLE_FONT_MAP: Record<string, string> = {
  'Moul': "'Moul', serif",
  'Koulen': "'Koulen', sans-serif",
  'Hanuman': "'Hanuman', serif",
  'Kantumruy Pro': "'Kantumruy Pro', sans-serif",
  'Playfair Display': "'Playfair Display', serif",
  'Great Vibes': "'Great Vibes', cursive",
  'Cinzel': "'Cinzel', serif",
  'Inter': "'Inter', sans-serif"
};

function getEventTitleFontFamily(fontName?: string) {
  if (!fontName) return '';
  return EVENT_TITLE_FONT_MAP[fontName] || fontName;
}

const getEventTitleAnimationProps = (anim?: string, targetOpacity = 1): any => {
  switch (anim) {
    case 'none':
      return { initial: { opacity: targetOpacity }, animate: { opacity: targetOpacity } };
    case 'fade':
      return { initial: { opacity: 0 }, animate: { opacity: targetOpacity }, transition: { duration: 1.2 } };
    case 'zoom':
      return { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: targetOpacity, scale: 1 }, transition: { duration: 1.0, ease: 'easeOut' } };
    case 'bounce':
      return { initial: { y: -40, opacity: 0 }, animate: { y: 0, opacity: targetOpacity }, transition: { type: 'spring', stiffness: 120, damping: 12 } };
    case 'shimmer':
      return { initial: { opacity: targetOpacity * 0.4 }, animate: { opacity: [targetOpacity * 0.4, targetOpacity, targetOpacity * 0.4] }, transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } };
    case 'fade-up':
    default:
      return { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: targetOpacity }, transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] } };
  }
};

// ── Main component ────────────────────────────────────────────────────────────
export default function EnvelopeAnimation({ guestName, onOpen, isOpen, inlinePreview = false }: EnvelopeProps) {
  const { t, lang } = useLanguage();
  const { settings } = useWeddingData();
  const { theme, isDark } = useTheme();
  const themeStyle = getThemeStyleType(theme.id);
  const envStyles = getEnvelopeStyles(themeStyle, isDark);

  const renderCorner = () => {
    const strokeColor = envStyles.accentStarsColor || '#D4AF37';
    if (themeStyle === 'khmer') {
      return <KhmerCorner strokeColor={strokeColor} />;
    }
    if (themeStyle === 'romantic') {
      return <RomanticCorner strokeColor={strokeColor} />;
    }
    return <MinimalCorner strokeColor={strokeColor} />;
  };
  const [flapOpen, setFlapOpen] = useState(false);
  const [cardRising, setCardRising] = useState(false);
  const [sealPopping, setSealPopping] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [petals] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({ id: i, delay: i * 0.7, x: (i * 5.5 + Math.random() * 4) % 100, size: 14 + Math.random() * 10 }))
  );

  const cardThemeStyles = getThemeCardStyles(theme.id);

  // 3D Card Tilt calculations
  const envelopeRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-12, 12]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (flapOpen) return;
    const el = envelopeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Couple names for the card interior
  const coupleNames = lang === 'km' ? settings.coupleNamesKm : settings.coupleNames;
  const weddingDate  = lang === 'km' ? settings.weddingDateKm  : settings.weddingDate;
  const eventTitle   = lang === 'km' ? settings.eventTitleKm : settings.eventTitleEn;

  // Resolve custom font from coupleCardConfig
  const resolvedFont = settings?.coupleCardConfig?.groomFont || 'auto';
  
  const fontFamily = resolvedFont && resolvedFont !== 'auto'
    ? getFontStack(resolvedFont)
    : themeStyle === 'khmer'
    ? "'Moul', 'Koulen', serif"
    : themeStyle === 'vintage'
    ? "'Hanuman', 'Koh Santepheap', serif"
    : "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif";

  // Resolve custom text effect
  const cardConfig = settings?.coupleCardConfig;
  const textEffect = cardConfig?.textEffect || 'none';
  const textEffectStyle = getTextStyle(textEffect, '#8B0000', cardConfig?.accentColor || '#D4AF37');

  // Compute English initials for the wax seal
  const { groom: enGroom, bride: enBride } = splitCoupleNames(settings.coupleNames || '');
  const gLetter = enGroom ? enGroom.trim().charAt(0).toUpperCase() : '';
  const bLetter = enBride ? enBride.trim().charAt(0).toUpperCase() : '';
  const initials = gLetter && bLetter ? `${gLetter}•${bLetter}` : '♡';

  const handleOpen = useCallback(() => {
    if (flapOpen) return;
    // 1. Pop the seal
    setSealPopping(true);
    setTimeout(() => {
      // 2. Open the flap
      setFlapOpen(true);
      setTimeout(() => {
        // 3. Card rises out
        setCardRising(true);
        // 4. Music + confetti + transition
        setTimeout(() => {
          if (!inlinePreview) {
            requestPlayMusic();
            launchFireworks();
            onOpen();
          } else {
            launchFireworks();
            setInternalOpen(true);
          }
        }, 900);
      }, 500);
    }, 350);
  }, [flapOpen, onOpen, inlinePreview]);

  const shouldRender = inlinePreview || !isOpen;

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          className={inlinePreview ? "relative w-full h-[380px] flex items-center justify-center overflow-visible rounded-3xl" : "fixed inset-0 z-50 flex items-center justify-center overflow-hidden"}
          style={{
            background: inlinePreview ? 'transparent' : envStyles.containerBg,
          }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          {/* ── Layered ambient background ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Large warm glow */}
            {envStyles.glowOpacity > 0 && (
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
                style={{
                  background: `radial-gradient(ellipse, ${envStyles.accentStarsColor}25 0%, transparent 70%)`,
                  opacity: envStyles.glowOpacity,
                }}
              />
            )}
            {/* Rose corner glow */}
            {themeStyle === 'romantic' && (
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-35"
                style={{ background: 'radial-gradient(ellipse, rgba(244,114,182,0.3) 0%, transparent 70%)' }} />
            )}

            {/* Drifting Bokeh Circles for Luxury feel */}
            {!inlinePreview && Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`bokeh-${i}`}
                className="absolute rounded-full bg-amber-400/5 blur-xl pointer-events-none"
                style={{
                  width: 120 + i * 40,
                  height: 120 + i * 40,
                  left: `${10 + i * 15}%`,
                  top: `${15 + i * 10}%`,
                }}
                animate={{
                  y: [0, -35, 0],
                  x: [0, 20, 0],
                  scale: [1, 1.15, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 9 + i * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>

          {/* ── Floating petals ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {petals.map((p) => <Petal key={p.id} delay={p.delay} x={p.x} size={p.size} />)}
          </div>

          {/* ── Luxury border frame ── */}
          {!inlinePreview && (
            <div 
              className="absolute inset-4 border rounded-[2rem] pointer-events-none z-10"
              style={{ borderColor: `${envStyles.accentStarsColor}35` }}
            >
              <div 
                className="absolute inset-1 border rounded-[1.8rem] pointer-events-none opacity-50"
                style={{ borderColor: `${envStyles.accentStarsColor}15` }}
              />
            </div>
          )}

          {/* ── Ornate corner decorations ── */}
          {!inlinePreview && [
            'top-4 left-4',
            'top-4 right-4 scale-x-[-1]',
            'bottom-4 left-4 scale-y-[-1]',
            'bottom-4 right-4 scale-[-1]',
          ].map((pos, i) => (
            <motion.div
              key={i}
              className={`absolute ${pos} pointer-events-none z-20`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1, ...spring }}
            >
              {renderCorner()}
            </motion.div>
          ))}

          {/* ── Centre content ── */}
          <motion.div
            className="relative flex flex-col items-center gap-6 px-6 text-center"
            initial={{ scale: 0.82, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ ...spring, duration: 1.1, delay: 0.2 }}
          >
            <motion.div
              className="w-full max-w-[420px]"
            >
              <motion.p
                className={`mx-auto max-w-full uppercase ${
                  settings.eventTitleSize || 'text-xl sm:text-2xl md:text-3xl'
                } ${
                  (!settings.eventTitleFont || settings.eventTitleFont === 'Moul' || settings.eventTitleFont === 'Koulen') && lang === 'km' 
                    ? 'font-khmer font-bold tracking-normal' 
                    : 'font-sans font-bold'
                }`}
                style={{
                  fontFamily: settings.eventTitleFont ? getEventTitleFontFamily(settings.eventTitleFont) : undefined,
                  letterSpacing: settings.eventTitleFont && settings.eventTitleFont !== 'Moul' && settings.eventTitleFont !== 'Koulen' ? '0.12em' : undefined,
                  background: 'linear-gradient(135deg, #B8893E 0%, #F0C97A 40%, #C9913A 70%, #B8893E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0px 2px 3px rgba(184, 137, 62, 0.25))',
                }}
                {...getEventTitleAnimationProps(settings.eventTitleAnimation || 'fade-up', settings.eventTitleOpacity !== undefined ? settings.eventTitleOpacity : 1.0)}
              >
                {eventTitle}
              </motion.p>
            </motion.div>
            {/* Orbiting sparkles around envelope */}
            <div className="absolute inset-0 pointer-events-none">
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <Sparkle key={i} angle={angle} radius={130} delay={i * 0.55} color={envStyles.accentStarsColor} />
              ))}
            </div>

            {/* ──── THE ENVELOPE ──── */}
            <div className="relative" style={{ perspective: '800px' }}>
              <motion.div
                ref={envelopeRef}
                className="relative w-[300px] h-[192px] sm:w-[340px] sm:h-[216px] cursor-pointer"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleOpen}
                style={{
                  transformStyle: 'preserve-3d',
                  rotateX: !flapOpen ? rotateX : 0,
                  rotateY: !flapOpen ? rotateY : 0,
                }}
                whileHover={!flapOpen ? { scale: 1.025, y: -4 } : {}}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >
                {/* ─ Envelope body shadow ─ */}
                <motion.div
                  className="absolute -bottom-4 left-4 right-4 h-8 rounded-full blur-2xl opacity-40"
                  style={{ background: envStyles.isDark ? 'rgba(0,0,0,0.85)' : 'rgba(100,60,20,0.45)' }}
                  animate={{ scaleX: [1, 1.04, 1], opacity: [0.4, 0.3, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                {/* ─ Envelope body ─ */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden"
                  style={{
                    background: envStyles.envelopeBg,
                    boxShadow: `0 12px 48px ${envStyles.shadowColor}, 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`,
                    border: envStyles.envelopeBorder,
                  }}
                >
                  {/* Faint repeating stripes on envelope body pocket */}
                  {envStyles.liningBg !== 'none' && (
                    <div
                      className="absolute inset-0 opacity-40 pointer-events-none"
                      style={{
                        background: envStyles.liningBg,
                      }}
                    />
                  )}
                </div>

                {/* ─ Interior lining (visible past flap) ─ */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden"
                  style={{ clipPath: 'inset(0 0 50% 0 round 1rem 1rem 0 0)' }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: envStyles.liningBg,
                    }}
                  />
                </div>

                {/* ─ Diagonal fold lines ─ */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 216">
                  <line x1="0" y1="216" x2="170" y2="108" stroke={envStyles.dividerLineColor} strokeWidth="1" />
                  <line x1="340" y1="216" x2="170" y2="108" stroke={envStyles.dividerLineColor} strokeWidth="1" />
                </svg>

                {/* ─ Envelope FLAP (rotates open) ─ */}
                <motion.div
                  className="absolute top-0 left-0 right-0 origin-top rounded-t-2xl overflow-hidden"
                  style={{ height: '55%', transformStyle: 'preserve-3d', zIndex: 10 }}
                  animate={flapOpen ? { rotateX: -175 } : { rotateX: 0 }}
                  transition={flapOpen ? { duration: 0.75, ease: [0.4, 0, 0.2, 1] } : spring}
                  whileHover={!flapOpen ? { rotateX: -20 } : {}}
                >
                  {/* Flap face */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: envStyles.flapFaceBg,
                      borderBottom: `1px solid ${envStyles.dividerLineColor}`,
                      clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                    }}
                  />
                  {/* Flap inner (visible when flipped) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: envStyles.flapInnerBg,
                      clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                      transform: 'rotateX(180deg)',
                      backfaceVisibility: 'hidden',
                    }}
                  />
                  {/* Flap shadow line */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${envStyles.dividerLineColor}, transparent)` }}
                  />
                </motion.div>

                {/* ─ Rising invitation card ─ */}
                <AnimatePresence>
                  {cardRising ? (
                    <motion.div
                      className="absolute left-4 right-4 overflow-visible flex flex-col items-center justify-center"
                      style={{
                        bottom: 12,
                        minHeight: 280,
                        zIndex: 5,
                        ...cardThemeStyles.cardStyle,
                      }}
                      initial={{ y: 0, opacity: 0.85 }}
                      animate={{ y: -170, opacity: 1 }}
                      transition={{ duration: 0.92, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <CardContent guestName={guestName} coupleNames={coupleNames} weddingDate={weddingDate} eventTitle={eventTitle} lang={lang} t={t} fontFamily={fontFamily} textEffectStyle={textEffectStyle} />
                    </motion.div>
                  ) : (
                    /* Static card peek while closed */
                    <div
                      className={`absolute left-4 right-4 bottom-3 overflow-visible flex flex-col items-center justify-center px-4 py-4 min-h-[180px] ${cardThemeStyles.staticCardClass}`}
                      style={{
                        zIndex: 5,
                        boxShadow: cardThemeStyles.cardStyle.boxShadow,
                      }}
                    >
                      <StaticPeekContent guestName={guestName} fontFamily={fontFamily} textEffectStyle={textEffectStyle} lang={lang} t={t} />
                    </div>
                  )}
                </AnimatePresence>

                {/* ─ Wax seal (on top of flap join) ─ */}
                <WaxSeal popping={sealPopping} initials={initials} />
              </motion.div>
            </div>

            {/* ──── CTA Button ──── */}
            <motion.button
              onClick={handleOpen}
              disabled={flapOpen}
              className={`relative min-h-[52px] px-12 py-3.5 text-base rounded-full overflow-hidden ${lang === 'km' ? 'font-khmer' : 'font-display italic'}`}
              style={{
                background: envStyles.btnBg,
                backgroundSize: '200% 100%',
                color: 'white',
                boxShadow: `${envStyles.btnShadow}, 0 1px 0 rgba(255,255,255,0.2) inset`,
                border: envStyles.btnBorder,
              }}
              whileHover={!flapOpen ? {
                scale: 1.05,
                y: -3,
                boxShadow: themeStyle === 'khmer' ? '0 10px 40px rgba(196,145,42,0.45)' : '0 10px 40px rgba(255,255,255,0.1)',
                backgroundPosition: '100% 0',
              } : {}}
              whileTap={{ scale: 0.97 }}
              animate={!flapOpen ? { y: [0, -4, 0] } : { opacity: 0.5 }}
              transition={{ y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } }}
            >
              {/* Shimmer overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
              <span className="relative flex items-center gap-2">
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  ✨
                </motion.span>
                {t('hero.open')}
              </span>
            </motion.button>

            {/* ──── Tiny helper text / Reset Button ──── */}
            {inlinePreview && internalOpen ? (
              <button
                type="button"
                onClick={() => {
                  setFlapOpen(false);
                  setCardRising(false);
                  setSealPopping(false);
                  setInternalOpen(false);
                }}
                className="relative z-[30] mt-4 px-4 py-2 text-xs font-semibold rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 active:scale-95 transition-all shadow-md select-none"
              >
                🔄 Reset Envelope
              </button>
            ) : (
              <motion.p
                className={`text-xs -mt-4 opacity-70 ${envStyles.helperTextColor} ${lang === 'km' ? 'font-khmer' : 'font-sans'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                {lang === 'km' ? 'ចុចខាងលើដើម្បីបើក' : 'Click the envelope or button to open'}
              </motion.p>
            )}
          </motion.div>

          {/* ── Bottom ornament ── */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="h-px w-16" style={{ background: `linear-gradient(to right, transparent, ${envStyles.accentStarsColor}40)` }} />
            <span className="text-sm" style={{ color: `${envStyles.accentStarsColor}60` }}>❋</span>
            <div className="h-px w-16" style={{ background: `linear-gradient(to left, transparent, ${envStyles.accentStarsColor}40)` }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Card interior (shown when rising out of envelope) — ONE unified design ─────
// ── Card interior (shown when rising out of envelope) ─────
function CardContent({
  guestName, coupleNames, weddingDate, lang, t, fontFamily, textEffectStyle
}: { guestName: string; coupleNames: string; weddingDate: string; eventTitle: string; lang: string; t: (k: string) => string; fontFamily: string; textEffectStyle: React.CSSProperties }) {
  const { settings } = useWeddingData();
  const isKm = lang === 'km';

  const cfg = settings.coupleCardConfig || {
    groomFont: 'Moul',
    brideFont: 'Moul',
    connector: 'hearts',
    layout: 'vertical',
    textEffect: 'none',
    accentColor: '#D4AF37',
    fontSize: 1.0,
  };

  const activeColor = cfg.accentColor || '#D4AF37';

  // Resolve fonts for groom/bride separately matching CoupleCard
  const groomFontStack = getFontStack(cfg.groomFont);
  const brideFontStack = getFontStack(cfg.brideFont);
  const isGroomKhmer = cfg.groomFont ? isKhmerFont(cfg.groomFont) : true;
  const isBrideKhmer = cfg.brideFont ? isKhmerFont(cfg.brideFont) : true;

  // Split names
  const { groom, bride } = splitCoupleNames(coupleNames);

  const isHoriz = cfg.layout === 'horizontal';
  const sizeMultiplier = cfg.fontSize || 1.0;
  
  // Base font sizes scaled down for the envelope card's smaller viewport
  const baseSizeGroom = isHoriz
    ? (isGroomKhmer ? 0.95 : 1.1)
    : (isGroomKhmer ? 1.25 : 1.4);
  const baseSizeBride = isHoriz
    ? (isBrideKhmer ? 0.95 : 1.1)
    : (isBrideKhmer ? 1.25 : 1.4);

  const groomFontSizeCSS = `max(0.85rem, ${(baseSizeGroom * sizeMultiplier).toFixed(3)}rem)`;
  const brideFontSizeCSS = `max(0.85rem, ${(baseSizeBride * sizeMultiplier).toFixed(3)}rem)`;

  const resolvedTextEffectStyle = getTextStyle(cfg.textEffect || 'none', '#8B0000', activeColor);

  const groomStyle: React.CSSProperties = {
    fontFamily: groomFontStack,
    lineHeight: isGroomKhmer ? 1.6 : 1.2,
    paddingBlock: isGroomKhmer ? '0.12rem' : '0.04rem',
    fontWeight: isGroomKhmer ? 700 : 600,
    fontSize: groomFontSizeCSS,
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
    whiteSpace: 'nowrap',
    ...resolvedTextEffectStyle,
  };

  const brideStyle: React.CSSProperties = {
    fontFamily: brideFontStack,
    lineHeight: isBrideKhmer ? 1.6 : 1.2,
    paddingBlock: isBrideKhmer ? '0.12rem' : '0.04rem',
    fontWeight: isBrideKhmer ? 700 : 600,
    fontSize: brideFontSizeCSS,
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
    whiteSpace: 'nowrap',
    ...resolvedTextEffectStyle,
  };

  const renderConnector = () => {
    switch (cfg.connector) {
      case 'hearts':
        return (
          <div className="flex items-center justify-center gap-1 py-0.5 select-none">
            <span className="text-sm" style={{ color: activeColor }}>💗</span>
          </div>
        );
      case 'ampersand':
        return (
          <span className="text-base font-bold select-none px-1" style={{ fontFamily: groomFontStack, color: activeColor }}>
            &
          </span>
        );
      case 'ning':
        return (
          <span className="text-xs font-bold select-none px-1" style={{ fontFamily: "'Moul', serif", color: activeColor, lineHeight: 1.6 }}>
            និង
          </span>
        );
      case 'pjuab':
        return (
          <span className="text-[10px] font-semibold select-none px-1" style={{ fontFamily: "'Kantumruy Pro', sans-serif", color: activeColor }}>
            ភ្ជាប់ពាក្យ
          </span>
        );
      default:
        return <span className="select-none" style={{ color: activeColor }}>💗</span>;
    }
  };

  // Fluid font size for Guest Name
  const guestFontSize = getFluidFontSize(guestName || t('greeting.guest'), isKm, isKm ? 1.7 : 1.9, 1.1);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 py-4 select-none relative overflow-visible leading-[1.8]">
      {/* Top divider */}
      <EleganceLineDivider color={activeColor} />

      {/* TO label */}
      <p className={`text-[9px] font-bold uppercase mt-1 mb-0.5 ${lang === 'km' ? 'tracking-normal' : 'tracking-widest'}`} style={{ color: activeColor, opacity: 0.85 }}>
        {t('envelope.to')}
      </p>

      {/* Guest name */}
      <div className="w-full py-1 px-2">
        <h2
          className="font-bold leading-[1.8]"
          style={{ fontSize: guestFontSize, fontFamily, ...textEffectStyle }}
        >
          {guestName || t('greeting.guest')}
        </h2>
      </div>

      {/* Gold heart separator */}
      <div className="py-0.5 font-bold" style={{ color: activeColor, fontSize: '0.8rem' }}>♡</div>

      {/* Couple names rendering matching the card customizer */}
      <div className="w-full py-0.5 px-2 flex flex-col items-center justify-center">
        {isHoriz ? (
          <div className="flex items-center justify-center flex-wrap gap-1">
            <span style={groomStyle}>{groom || 'Groom'}</span>
            {renderConnector()}
            <span style={brideStyle}>{bride || 'Bride'}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div style={groomStyle}>{groom || 'Groom'}</div>
            <div className="h-4 flex items-center justify-center">{renderConnector()}</div>
            <div style={brideStyle}>{bride || 'Bride'}</div>
          </div>
        )}
      </div>

      {/* Wedding date */}
      {weddingDate && (
        <p className={`text-[10px] font-semibold mt-1.5 ${lang === 'km' ? 'tracking-normal' : 'tracking-wider'}`} style={{ color: activeColor, opacity: 0.75 }}>
          {weddingDate}
        </p>
      )}

      {/* Bottom divider */}
      <div className="mt-1">
        <EleganceLineDivider color={activeColor} />
      </div>
    </div>
  );
}



