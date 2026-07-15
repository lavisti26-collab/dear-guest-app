import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import injectFontFaces from '@/lib/font-loader';

// ── Font stacks — Khmer (Supabase storage + Google Fonts) + Latin ────────────
const FONT_MAP = {
  // ── Khmer from Supabase storage ──
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
  // ── Khmer from Google Fonts ──
  notosanskhmer:       "'Noto Sans Khmer', 'Kantumruy Pro', sans-serif",
  notoserifkhmer:      "'Noto Serif Khmer', 'Hanuman', serif",
  hanuman:             "'Hanuman', 'Koh Santepheap', serif",
  kohsantepheap:       "'Koh Santepheap', 'Hanuman', serif",
  // ── Also add Moul (separate Google Font from Moulpali) ──
  moul:                "'Moul', serif",
  // ── Latin serif / script ──
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

export type CoupleFont = keyof typeof FONT_MAP | 'Moul' | 'Koulen' | 'Kantumruy Pro' | 'Hanuman'
  | 'Cormorant Garamond' | 'Playfair Display' | 'Great Vibes' | 'Dancing Script' | 'Cinzel' | 'Lora' | 'auto';
export type CoupleLayout = 'vertical' | 'horizontal';
export type CoupleConnector = 'hearts' | 'ampersand' | 'ning' | 'pjuab';
export type CoupleDivider = 'kbach-gold' | 'minimal' | 'star' | 'none';

interface CoupleCardProps {
  groomName: string;
  brideName: string;
  /** Primary font override */
  font?: CoupleFont;
  /** Separate Groom font */
  groomFont?: CoupleFont;
  /** Separate Bride font */
  brideFont?: CoupleFont;
  /** Stack vertically or side-by-side */
  layout?: CoupleLayout;
  /** Connector between the two names */
  connector?: CoupleConnector;
  /** Top/bottom ornament style */
  divider?: CoupleDivider;
  /** Custom ornament option */
  ornament?: 'kbach' | 'star' | 'minimal' | 'none';
  /** Ambiance background particles */
  ambiance?: 'bokeh' | 'flowers' | 'sparkles' | 'none' | 'hearts' | 'roses' | 'butterflies' | 'stars' | 'diamonds';
  /** Live accent color override */
  accentColor?: string;
  /** Font size multiplier */
  fontSize?: number;
  className?: string;
  /** Extra inline style for the outer container */
  style?: React.CSSProperties;
  /** Card frame style theme */
  cardStyle?: 'dark-glass' | 'light-glass' | 'royal-gold' | 'romantic-blush' | 'emerald-luxury' | 'vintage-parchment' | 'minimal-clean';
  /** Name text style effect */
  textEffect?: 'none' | 'gold-foil' | 'soft-glow' | 'letterpress' | 'embossed';
  ornamentOpacity?: number;
  ornamentScale?: number;
  stickers?: string[];
  stickerPosition?: 'top-corners' | 'top-center' | 'bottom-accent';
  bgOpacity?: number;
  bgBlur?: number;
}

// Helper to resolve font name safely — fixes: 'Moul' and 'Kantumruy Pro' must
// resolve to their actual stacks, not fall through to auto.
function getFontStack(f?: string) {
  if (!f || f === 'auto') return FONT_MAP.auto;
  const key = f.toLowerCase().replace(/[^a-z]/g, '') as keyof typeof FONT_MAP;
  // Inject @font-face for Supabase storage fonts (idempotent — won't double-load)
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

// Detect if a font is Khmer-script (needs bigger lineHeight / paddingBlock)
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

// ── SVG Ornaments & Dividers ─────────────────────────────────────────────────

const KbachOrnament = ({ color }: { color: string }) => (
  <div className="flex items-center justify-center w-full py-1.5 z-10 relative">
    <svg viewBox="0 0 200 22" className="w-full max-w-[220px] h-6" fill="none">
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#BF953F" />
          <stop offset="25%" stopColor="#FCF6BA" />
          <stop offset="50%" stopColor="#B38728" />
          <stop offset="75%" stopColor="#FBF5B7" />
          <stop offset="100%" stopColor="#AA771C" />
        </linearGradient>
      </defs>
      <path d="M100 1 C104 7, 111 11, 120 11 C111 11, 104 15, 100 21 C96 15, 89 11, 80 11 C89 11, 96 7, 100 1 Z"
        fill="url(#goldGradient)" opacity="0.95" />
      <path d="M15 11 Q57 3 80 11 T120 11 T185 11"
        fill="none" stroke="url(#goldGradient)" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
      <circle cx="8" cy="11" r="2" fill="url(#goldGradient)" opacity="0.8" />
      <circle cx="192" cy="11" r="2" fill="url(#goldGradient)" opacity="0.8" />
    </svg>
  </div>
);

const StarOrnament = ({ color }: { color: string }) => (
  <div className="flex items-center justify-center gap-3 py-2.5 w-full z-10 relative">
    <svg viewBox="0 0 160 20" className="w-full max-w-[200px] h-5" fill="none">
      <defs>
        <linearGradient id="goldGradientStar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#BF953F" />
          <stop offset="25%" stopColor="#FCF6BA" />
          <stop offset="50%" stopColor="#B38728" />
          <stop offset="75%" stopColor="#FBF5B7" />
          <stop offset="100%" stopColor="#AA771C" />
        </linearGradient>
      </defs>
      {/* Central Sparkle with curved bezier */}
      <path d="M80 2 Q80 10 88 10 Q80 10 80 18 Q80 10 72 10 Q80 10 80 2 Z" fill="url(#goldGradientStar)" />
      {/* Double lines left */}
      <line x1="15" y1="8" x2="65" y2="8" stroke="url(#goldGradientStar)" strokeWidth="0.8" opacity="0.8" />
      <line x1="15" y1="12" x2="65" y2="12" stroke="url(#goldGradientStar)" strokeWidth="0.8" opacity="0.8" />
      {/* Double lines right */}
      <line x1="95" y1="8" x2="145" y2="8" stroke="url(#goldGradientStar)" strokeWidth="0.8" opacity="0.8" />
      <line x1="95" y1="12" x2="145" y2="12" stroke="url(#goldGradientStar)" strokeWidth="0.8" opacity="0.8" />
    </svg>
  </div>
);

const MinimalOrnament = ({ color }: { color: string }) => (
  <div className="flex items-center justify-center gap-3 py-2 w-full z-10 relative">
    <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(90deg, transparent, #BF953F, transparent)', opacity: 0.8 }} />
    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'linear-gradient(45deg, #BF953F, #FCF6BA)', opacity: 0.9 }} />
    <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(90deg, transparent, #BF953F, transparent)', opacity: 0.8 }} />
  </div>
);

// ── Connectors ───────────────────────────────────────────────────────────────

const HeartsConnector = ({ color }: { color?: string }) => {
  const activeColor = color || '#f43f5e';
  return (
    <div className="flex items-center justify-center gap-2 py-1.5 z-10 relative">
      <motion.svg
        animate={{ scale: [0.9, 1.1, 0.9] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        viewBox="0 0 24 24"
        className="w-4 h-4 drop-shadow-[0_0_4px_rgba(244,63,94,0.5)]"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={activeColor} />
      </motion.svg>
      <motion.svg
        animate={{ scale: [1.1, 0.9, 1.1] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay: 0.2 }}
        viewBox="0 0 24 24"
        className="w-3 h-3 opacity-80"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={activeColor} />
      </motion.svg>
      <motion.svg
        animate={{ scale: [0.9, 1.1, 0.9] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay: 0.4 }}
        viewBox="0 0 24 24"
        className="w-4 h-4 drop-shadow-[0_0_4px_rgba(244,63,94,0.5)]"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={activeColor} />
      </motion.svg>
    </div>
  );
};

const AmpersandConnector = ({ font, color }: { font: string; color?: string }) => (
  <div className="flex items-center justify-center py-1 z-10 relative">
    <span className="text-3xl font-bold" style={{ fontFamily: font, color: color || 'rgba(255,255,255,0.75)' }}>
      &
    </span>
  </div>
);

const NingConnector = ({ color }: { color?: string }) => (
  <div className="flex items-center justify-center py-1 z-10 relative">
    <span className="text-lg font-bold" style={{ fontFamily: "'Moul', serif", lineHeight: 1.95, color: color || '#fcd34d' }}>
      និង
    </span>
  </div>
);

const PjuabConnector = ({ color }: { color?: string }) => (
  <div className="flex items-center justify-center py-1 z-10 relative">
    <span className="text-sm font-semibold" style={{ fontFamily: "'Kantumruy Pro', sans-serif", letterSpacing: 'normal', color: color || 'rgba(253,230,138,0.85)' }}>
      ភ្ជាប់ពាក្យ
    </span>
  </div>
);

// ── Premium Card frame themes ──
function getCardFrame(style: string, accentColor: string, customOpacity?: number, customBlur?: number) {
  switch (style) {
    case 'light-glass':
      return {
        background: `rgba(255, 255, 255, ${customOpacity !== undefined ? customOpacity : 0.45})`,
        backdropFilter: `blur(${customBlur !== undefined ? customBlur : 16}px)`,
        WebkitBackdropFilter: `blur(${customBlur !== undefined ? customBlur : 16}px)`,
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        borderRadius: '1.5rem',
        color: '#2D271E',
        textColor: '#2D271E',
        accentColor: accentColor || '#b45309',
      };
    case 'royal-gold':
      return {
        background: 'linear-gradient(135deg, #1A1712 0%, #2D2517 50%, #1A1712 100%)',
        border: '1px solid rgba(191, 149, 63, 0.55)',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.65), 0 0 15px rgba(191, 149, 63, 0.15) inset',
        borderRadius: '1.5rem',
        color: '#FAF9F6',
        textColor: '#FAF9F6',
        accentColor: '#BF953F',
      };
    case 'romantic-blush':
      return {
        background: `linear-gradient(135deg, rgba(253, 244, 245, ${customOpacity !== undefined ? customOpacity : 0.7}) 0%, rgba(252, 231, 235, ${customOpacity !== undefined ? customOpacity : 0.7}) 100%)`,
        backdropFilter: `blur(${customBlur !== undefined ? customBlur : 12}px)`,
        WebkitBackdropFilter: `blur(${customBlur !== undefined ? customBlur : 12}px)`,
        border: '1px solid rgba(244, 114, 182, 0.35)',
        boxShadow: '0 10px 42px rgba(120, 40, 60, 0.06)',
        borderRadius: '1.5rem',
        color: '#4C1D24',
        textColor: '#4C1D24',
        accentColor: '#DB2777',
      };
    case 'emerald-luxury':
      return {
        background: 'linear-gradient(135deg, #022013 0%, #063C26 50%, #022013 100%)',
        border: '1px solid rgba(212, 167, 106, 0.5)',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 167, 106, 0.1) inset',
        borderRadius: '1.5rem',
        color: '#FAF9F6',
        textColor: '#FAF9F6',
        accentColor: '#D4A76A',
      };
    case 'vintage-parchment':
      return {
        background: '#FAF6EE',
        backgroundImage: 'radial-gradient(ellipse at center, #FAF6EE 0%, #F3ECDC 100%)',
        border: '2px solid #3E2723',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12), inset 0 0 30px rgba(109, 76, 65, 0.08)',
        borderRadius: '0.75rem',
        color: '#3E2723',
        textColor: '#3E2723',
        accentColor: '#5D4037',
      };
    case 'minimal-clean':
      return {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        borderRadius: '0px',
        color: '#FAF9F6',
        textColor: '#FAF9F6',
        accentColor: accentColor || '#fbbf24',
      };
    case 'dark-glass':
    default:
      return {
        background: `rgba(0, 0, 0, ${customOpacity !== undefined ? customOpacity : 0.38})`,
        backdropFilter: `blur(${customBlur !== undefined ? customBlur : 14}px)`,
        WebkitBackdropFilter: `blur(${customBlur !== undefined ? customBlur : 14}px)`,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        borderRadius: '1.5rem',
        color: '#FAF9F6',
        textColor: '#FAF9F6',
        accentColor: accentColor || '#fbbf24',
      };
  }
}

// ── Text effect helper ──
export function getTextStyle(effect: string, textColor: string, accentColor: string): React.CSSProperties {
  switch (effect) {
    case 'gold-foil':
      return {
        background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block',
      };
    case 'soft-glow':
      return {
        color: textColor,
        textShadow: `0 0 8px ${accentColor}, 0 2px 4px rgba(0,0,0,0.5)`,
      };
    case 'letterpress':
      return {
        color: textColor,
        textShadow: '0 -1px 1px rgba(0, 0, 0, 0.8), 0 1px 1px rgba(255, 255, 255, 0.3)',
      };
    case 'embossed':
      return {
        color: textColor,
        textShadow: '0 1px 1px rgba(255, 255, 255, 0.9), 0 -1px 1px rgba(0, 0, 0, 0.4)',
      };
    case 'none':
    default:
      return {
        color: textColor,
        textShadow: '0 2px 20px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.3)',
      };
  }
}

// ── Dynamic Floating Particle ──
function CardParticle({
  type,
  color,
  delay,
  left,
  size,
  duration
}: {
  type: string;
  color: string;
  delay: number;
  left: number;
  size: number;
  duration: number;
}) {
  let content = '🌸';
  if (type === 'sparkles') content = '✨';
  else if (type === 'hearts') content = '💕';
  else if (type === 'roses') content = '🌹';
  else if (type === 'butterflies') content = '🦋';
  else if (type === 'stars') content = '⭐';
  else if (type === 'diamonds') content = '💎';

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${left}%`,
        top: '-24px',
        fontSize: `${size}px`,
        color: type === 'sparkles' || type === 'stars' ? color : undefined,
        opacity: 0,
      }}
      animate={{
        y: ['0px', '220px'],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
        x: [0, (Math.random() - 0.5) * 40],
        opacity: [0, 0.65, 0.65, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {content}
    </motion.div>
  );
}

// ── Dynamic Bokeh Particle ──
function BokehParticle({
  color,
  delay,
  left,
  top,
  size,
  duration
}: {
  color: string;
  delay: number;
  left: number;
  top: number;
  size: number;
  duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full blur-[8px] pointer-events-none select-none"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        opacity: 0,
      }}
      animate={{
        scale: [0.8, 1.4, 0.8],
        y: [0, -25, 0],
        opacity: [0, 0.12, 0.12, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}



// ── Main CoupleCard component ─────────────────────────────────────────────────
export default function CoupleCard({
  groomName,
  brideName,
  font = 'auto',
  groomFont,
  brideFont,
  layout = 'vertical',
  connector = 'hearts',
  divider = 'kbach-gold',
  ornament,
  ambiance = 'none',
  accentColor,
  fontSize = 1.0,
  className = '',
  style,
  cardStyle = 'dark-glass',
  textEffect = 'none',
  ornamentOpacity = 0.9,
  ornamentScale = 1.0,
  stickers = [],
  stickerPosition = 'top-center',
  bgOpacity,
  bgBlur,
}: CoupleCardProps) {
  const frame = getCardFrame(cardStyle, accentColor || '#D4AF37', bgOpacity, bgBlur);
  const activeColor = frame.accentColor;

  const [particles] = React.useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: i * 0.7,
      size: 10 + Math.random() * 8,
      duration: 5 + Math.random() * 4,
    }))
  );

  const [bokehParticles] = React.useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: i * 0.8,
      size: 15 + Math.random() * 25,
      duration: 6 + Math.random() * 4,
    }))
  );
  
  // Resolve fonts
  const resolvedGroomFont = groomFont ?? font;
  const resolvedBrideFont = brideFont ?? font;
  const groomFontStack = getFontStack(resolvedGroomFont);
  const brideFontStack = getFontStack(resolvedBrideFont);
  
  const isGroomKhmer = isKhmerFont(resolvedGroomFont);
  const isBrideKhmer = isKhmerFont(resolvedBrideFont);

  // 3D Tilt Hook Calculations
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
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

  const renderConnector = () => {
    switch (connector) {
      case 'hearts':     return <HeartsConnector color={activeColor} />;
      case 'ampersand':  return <AmpersandConnector font={groomFontStack} color={activeColor} />;
      case 'ning':       return <NingConnector color={activeColor} />;
      case 'pjuab':      return <PjuabConnector color={activeColor} />;
      default:           return <HeartsConnector color={activeColor} />;
    }
  };

  const renderDivider = () => {
    const activeOrnament = ornament ?? (divider === 'kbach-gold' ? 'kbach' : divider === 'star' ? 'star' : divider === 'minimal' ? 'minimal' : 'none');
    if (activeOrnament === 'none') return null;

    const divStyle: React.CSSProperties = {
      opacity: ornamentOpacity !== undefined ? ornamentOpacity : 0.9,
      transform: `scale(${ornamentScale !== undefined ? ornamentScale : 1.0})`,
      transition: 'all 0.3s ease-out',
    };

    return (
      <div style={divStyle}>
        {activeOrnament === 'kbach' && <KbachOrnament color={activeColor} />}
        {activeOrnament === 'star' && <StarOrnament color={activeColor} />}
        {activeOrnament === 'minimal' && <MinimalOrnament color={activeColor} />}
      </div>
    );
  };

// ── Premium Gold SVG Stickers ────────────────────────────────────────────────
const GoldBlessingBadge = () => (
  <div className="relative flex items-center justify-center pointer-events-none select-none">
    <svg viewBox="0 0 180 40" className="w-[130px] h-[30px] drop-shadow-md">
      <defs>
        <linearGradient id="goldStickerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#BF953F" />
          <stop offset="25%" stopColor="#FCF6BA" />
          <stop offset="50%" stopColor="#B38728" />
          <stop offset="75%" stopColor="#FBF5B7" />
          <stop offset="100%" stopColor="#AA771C" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="176" height="36" rx="8" fill="rgba(15, 12, 10, 0.75)" stroke="url(#goldStickerGradient)" strokeWidth="1.2" />
      <path d="M 8 2 L 4 6 L 4 34 L 8 38 M 172 2 L 176 6 L 176 34 L 172 38" fill="none" stroke="url(#goldStickerGradient)" strokeWidth="0.8" opacity="0.8" />
      <circle cx="4" cy="4" r="1" fill="url(#goldStickerGradient)" />
      <circle cx="176" cy="4" r="1" fill="url(#goldStickerGradient)" />
      <circle cx="4" cy="36" r="1" fill="url(#goldStickerGradient)" />
      <circle cx="176" cy="36" r="1" fill="url(#goldStickerGradient)" />
    </svg>
    <span className="absolute text-[10px] tracking-normal font-bold font-khmer bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#AA771C] bg-clip-text text-transparent drop-shadow-sm select-none">
      សិរីសួស្តី អាពាហ៍ពិពាហ៍
    </span>
  </div>
);

const GoldHeartsIcon = () => (
  <svg viewBox="0 0 64 48" className="w-11 h-9 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldStickerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BF953F" />
        <stop offset="25%" stopColor="#FCF6BA" />
        <stop offset="50%" stopColor="#B38728" />
        <stop offset="75%" stopColor="#FBF5B7" />
        <stop offset="100%" stopColor="#AA771C" />
      </linearGradient>
    </defs>
    <path
      d="M18 34 C12 28.5 9 24 9 19C9 12.5 14 7.5 20.5 7.5C24.5 7.5 27.5 10 29 13C30.5 10 33.5 7.5 37.5 7.5C44 7.5 49 12.5 49 19 C49 24 46 28.5 40 34 L29 44 L18 34 Z"
      fill="url(#goldStickerGradient)"
      stroke="rgba(20, 15, 10, 0.4)"
      strokeWidth="0.8"
    />
    <path
      d="M36 38 C31 33.5 28.5 30 28.5 26C28.5 21 32.5 17 37.5 17C40.5 17 43 19 44 21.5C45 19 47.5 17 50.5 17C55.5 17 59.5 21 59.5 26C59.5 30 57 33.5 52 38 L44 45.5 L36 38 Z"
      fill="url(#goldStickerGradient)"
      stroke="#1E160E"
      strokeWidth="1.2"
    />
  </svg>
);

const GoldRingsIcon = () => (
  <svg viewBox="0 0 64 48" className="w-11 h-9 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldStickerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BF953F" />
        <stop offset="25%" stopColor="#FCF6BA" />
        <stop offset="50%" stopColor="#B38728" />
        <stop offset="75%" stopColor="#FBF5B7" />
        <stop offset="100%" stopColor="#AA771C" />
      </linearGradient>
    </defs>
    <circle cx="23" cy="24" r="12" stroke="url(#goldStickerGradient)" strokeWidth="3" />
    <circle cx="23" cy="24" r="12" stroke="#1E160E" strokeWidth="0.5" />
    <circle cx="37" cy="24" r="12" stroke="url(#goldStickerGradient)" strokeWidth="3" />
    <circle cx="37" cy="24" r="12" stroke="#1E160E" strokeWidth="0.5" />
    <path d="M29 13 Q29 18 31 18 Q29 18 29 23 Q29 18 27 18 Q29 18 29 13 Z" fill="url(#goldStickerGradient)" />
  </svg>
);

const GoldKhmerFlower = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9 drop-shadow-md animate-spin" style={{ animationDuration: '30s' }} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldStickerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BF953F" />
        <stop offset="25%" stopColor="#FCF6BA" />
        <stop offset="50%" stopColor="#B38728" />
        <stop offset="75%" stopColor="#FBF5B7" />
        <stop offset="100%" stopColor="#AA771C" />
      </linearGradient>
    </defs>
    {Array.from({ length: 8 }).map((_, i) => {
      const rot = i * 45;
      return (
        <path
          key={i}
          d="M24 24 C24 14, 21 8, 24 8 C27 8, 24 14, 24 24 Z"
          fill="url(#goldStickerGradient)"
          transform={`rotate(${rot} 24 24)`}
        />
      );
    })}
    <circle cx="24" cy="24" r="4.5" fill="#1E160E" />
    <circle cx="24" cy="24" r="3.2" fill="url(#goldStickerGradient)" />
    <circle cx="24" cy="24" r="1.2" fill="#FFF" />
  </svg>
);

const GoldKbachIcon = () => (
  <svg viewBox="0 0 48 48" className="w-[42px] h-[42px] drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldStickerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BF953F" />
        <stop offset="25%" stopColor="#FCF6BA" />
        <stop offset="50%" stopColor="#B38728" />
        <stop offset="75%" stopColor="#FBF5B7" />
        <stop offset="100%" stopColor="#AA771C" />
      </linearGradient>
    </defs>
    <path
      d="M24 6 C27 12, 34 16, 34 24 C34 29.5 29.5 34 24 34 C18.5 34 14 29.5 14 24 C14 16, 21 12, 24 6 Z M24 13 C21.5 16.5 18.5 19 18.5 24 C18.5 27 21 29.5 24 29.5 C27 29.5 29.5 27 29.5 24 C29.5 19, 26.5 16.5 24 13 Z"
      fill="url(#goldStickerGradient)"
    />
    <path
      d="M24 17 C25 19.5 27 20.5 27 24 C27 25.7 25.7 27 24 27 C22.3 27 21 25.7 21 24 C21 20.5 23 19.5 24 17 Z"
      fill="url(#goldStickerGradient)"
      opacity="0.8"
    />
    <circle cx="24" cy="24" r="1.5" fill="#FFF" />
  </svg>
);

  const renderStickers = () => {
    if (!stickers || stickers.length === 0) return null;

    let posClass = 'absolute pointer-events-none z-20 flex gap-4';
    if (stickerPosition === 'top-corners') {
      posClass += ' inset-x-4 top-4 justify-between';
    } else if (stickerPosition === 'bottom-accent') {
      posClass += ' inset-x-4 bottom-4 justify-between';
    } else {
      // top-center
      posClass += ' inset-x-4 top-3.5 justify-center';
    }

    return (
      <div className={posClass}>
        {stickers.map((s, idx) => {
          let content = null;
          let loopAnimate = {};
          let loopTransition = {};

          if (s === 'blessing') {
            content = <GoldBlessingBadge />;
            loopAnimate = { scale: [0.97, 1.03, 0.97] };
            loopTransition = { duration: 3.2, repeat: Infinity, ease: 'easeInOut' };
          } else if (s === 'hearts') {
            content = <GoldHeartsIcon />;
            loopAnimate = { y: [-3.5, 3.5, -3.5] };
            loopTransition = { duration: 2.4, repeat: Infinity, ease: 'easeInOut' };
          } else if (s === 'rings') {
            content = <GoldRingsIcon />;
            loopAnimate = { rotate: [-4.5, 4.5, -4.5] };
            loopTransition = { duration: 2.8, repeat: Infinity, ease: 'easeInOut' };
          } else if (s === 'flowers') {
            content = <GoldKhmerFlower />;
            loopAnimate = { y: [-2, 2, -2] };
            loopTransition = { duration: 3.5, repeat: Infinity, ease: 'easeInOut' };
          } else if (s === 'kbach') {
            content = <GoldKbachIcon />;
            loopAnimate = { scale: [0.95, 1.05, 0.95] };
            loopTransition = { duration: 3.0, repeat: Infinity, ease: 'easeInOut' };
          }

          return (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1.0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="flex items-center justify-center"
            >
              <motion.div
                animate={loopAnimate}
                transition={loopTransition}
                className="flex items-center justify-center"
              >
                {content}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Base sizes at fontSize=1.0 (100%) intentionally small so the
  // Font Size slider (60%→200%) gives the full range from compact → headline.
  // Vertical = one name per row (can be wider). Horizontal = two names in one row.
  const isHoriz = layout === 'horizontal';
  const baseSizeGroom = isHoriz
    ? (isGroomKhmer ? 1.5 : 1.75)   // horizontal: compact, shares row with bride
    : (isGroomKhmer ? 2.0 : 2.4);   // vertical: each name owns full width
  const baseSizeBride = isHoriz
    ? (isBrideKhmer ? 1.5 : 1.75)
    : (isBrideKhmer ? 2.0 : 2.4);

  // Direct rem = base * fontSize — the slider controls the size, no vw interference.
  // max(1.0rem, ...) acts as a minimum floor so names never vanish at 60%.
  const groomFontSizeCSS = `max(1.0rem, ${(baseSizeGroom * fontSize).toFixed(3)}rem)`;
  const brideFontSizeCSS = `max(1.0rem, ${(baseSizeBride * fontSize).toFixed(3)}rem)`;

  const textEffectStyle = getTextStyle(textEffect, frame.textColor, activeColor);

  const groomStyle: React.CSSProperties = {
    fontFamily: groomFontStack,
    lineHeight: isGroomKhmer ? 1.65 : 1.2,
    paddingBlock: isGroomKhmer ? '0.35rem' : '0.1rem',
    fontWeight: isGroomKhmer ? 700 : 600,
    fontSize: groomFontSizeCSS,
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
    whiteSpace: 'nowrap',
    letterSpacing: isGroomKhmer ? 'normal' : '0.03em',
    ...textEffectStyle,
  };

  const brideStyle: React.CSSProperties = {
    fontFamily: brideFontStack,
    lineHeight: isBrideKhmer ? 1.65 : 1.2,
    paddingBlock: isBrideKhmer ? '0.35rem' : '0.1rem',
    fontWeight: isBrideKhmer ? 700 : 600,
    fontSize: brideFontSizeCSS,
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
    whiteSpace: 'nowrap',
    letterSpacing: isBrideKhmer ? 'normal' : '0.03em',
    ...textEffectStyle,
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative w-full ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...frame,
        border: (ornament === 'star' || ornament === 'kbach' || divider === 'kbach-gold' || divider === 'star')
          ? '1px solid rgba(191, 149, 63, 0.35)'
          : frame.border,
        boxShadow: (ornament === 'star' || ornament === 'kbach' || divider === 'kbach-gold' || divider === 'star')
          ? `0 8px 32px rgba(191, 149, 63, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06)`
          : frame.boxShadow,
        padding: '1.25rem 1.5rem',
        overflow: 'hidden',
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        ...style,
      }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      {renderStickers()}
      {/* Ambiance sparkles — subtle corners, always gold */}
      {ornament === 'star' && (
        <>
          <div className="absolute left-3 top-3 z-10 pointer-events-none text-xs" style={{ color: activeColor, opacity: 0.4 }}>✦</div>
          <div className="absolute right-3 top-3 z-10 pointer-events-none text-xs" style={{ color: activeColor, opacity: 0.4 }}>✦</div>
          <div className="absolute left-3 bottom-3 z-10 pointer-events-none text-xs" style={{ color: activeColor, opacity: 0.4 }}>✦</div>
          <div className="absolute right-3 bottom-3 z-10 pointer-events-none text-xs" style={{ color: activeColor, opacity: 0.4 }}>✦</div>
          {/* Side border sparkles — centered on the left/right borders */}
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none text-xs" style={{ color: activeColor }}>✦</div>
          <div className="absolute right-0 translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none text-xs" style={{ color: activeColor }}>✦</div>
        </>
      )}
      {/* Dynamic particles falling / floating */}
      {ambiance !== 'none' && ambiance !== 'bokeh' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          {particles.map((p) => (
            <CardParticle
              key={p.id}
              type={ambiance}
              color={activeColor}
              delay={p.delay}
              left={p.left}
              size={p.size}
              duration={p.duration}
            />
          ))}
        </div>
      )}
      {ambiance === 'bokeh' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          {bokehParticles.map((bp) => (
            <BokehParticle
              key={bp.id}
              color={activeColor}
              delay={bp.delay}
              left={bp.left}
              top={bp.top}
              size={bp.size}
              duration={bp.duration}
            />
          ))}
        </div>
      )}


      {/* Top Divider */}
      <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
        {renderDivider()}
      </div>

      {/* Names wrapper with 3D Parallax */}
      {layout === 'horizontal' ? (
        <div
          className="w-full z-10 relative text-center"
          style={{
            transform: 'translateZ(40px)',
            transformStyle: 'preserve-3d',
            paddingBlock: '0.5rem',
          }}
        >
          <div
            style={{
              color: frame.textColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            <span style={{ transform: 'translateZ(10px)', ...groomStyle }}>
              {groomName || 'ឈ្មោះប្ដី'}
            </span>
            
            <span className="flex-shrink-0 px-1" style={{ transform: 'translateZ(25px)' }}>
              {connector === 'hearts' ? (
                <span style={{ color: activeColor }}>💗</span>
              ) : connector === 'ning' ? (
                <span style={{ fontFamily: "'Moul', serif", color: activeColor, lineHeight: 1.95 }}>និង</span>
              ) : connector === 'pjuab' ? (
                <span style={{ fontFamily: "'Kantumruy Pro', sans-serif", color: activeColor, fontSize: '0.75rem', fontWeight: 600 }}>ភ្ជាប់ពាក្យ</span>
              ) : (
                <span style={{ color: frame.textColor, fontFamily: groomFontStack }}>{'&'}</span>
              )}
            </span>

            <span style={{ transform: 'translateZ(10px)', ...brideStyle }}>
              {brideName || 'ឈ្មោះប្រពន្ធ'}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center w-full z-10 relative"
          style={{
            flexDirection: 'column',
            gap: 0,
            transform: 'translateZ(40px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Groom */}
          <div className="w-full overflow-hidden text-center" style={{ paddingBlock: '0.2rem', transform: 'translateZ(10px)' }}>
            <div style={groomStyle}>
              {groomName || 'ឈ្មោះប្ដី'}
            </div>
          </div>

          {/* Connector */}
          <div style={{ transform: 'translateZ(25px)' }}>
            {renderConnector()}
          </div>

          {/* Bride */}
          <div className="w-full overflow-hidden text-center" style={{ paddingBlock: '0.2rem', transform: 'translateZ(10px)' }}>
            <div style={brideStyle}>
              {brideName || 'ឈ្មោះប្រពន្ធ'}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Divider */}
      <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
        {renderDivider()}
      </div>
    </motion.div>
  );
}
