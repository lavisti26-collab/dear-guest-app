import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { useVisualStyleOptional } from '@/contexts/VisualStyleContext';
import CoupleCard from '@/components/wedding/CoupleCard';
import type { CoupleConnector, CoupleDivider } from '@/components/wedding/CoupleCard';
import heroBg from '@/assets/hero-bg.jpg';

const spring = { type: 'spring' as const, duration: 1, bounce: 0.05 };

interface HeroPetal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

function HeroPetals() {
  const [petals, setPetals] = useState<HeroPetal[]>([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 10 + Math.random() * 8,
        size: 14 + Math.random() * 10,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
      {petals.map((p) => (
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
            opacity: 0.65,
          }}
        >
          <svg className="w-full h-full fill-rose-300/60 drop-shadow-[0_1px_3px_rgba(244,63,94,0.2)]" viewBox="0 0 24 24">
            <path d="M12 2C12 2 4 10 4 15C4 18.87 7.13 22 11 22C11.55 22 12.08 21.94 12.59 21.82C16.89 20.82 20 17.03 20 12.5C20 6.5 12 2 12 2Z" />
          </svg>
        </span>
      ))}
    </div>
  );
}

// ── Split "Name & Name" or "Name និង Name" into groom/bride ─────────────────
function splitCoupleNames(names: string): { groom: string; bride: string } {
  if (!names) return { groom: '', bride: '' };
  // Clean zero-width spaces (e.g. \u200b) and non-breaking spaces
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
  // Fallback: treat entire string as groom name
  return { groom: cleanNames.trim(), bride: '' };
}

// ── Resolve hero overlay tint per visual style ────────────────────────────────────
function getHeroOverlay(visualStyle: string) {
  switch (visualStyle) {
    case 'neo-brutalism':
      return { overlay: 'bg-white/55', titleColor: '#0a0a0a', subtitleColor: '#333333', dateColor: '#555555' };
    case 'minimalist':
    case 'white-minimal':
      return { overlay: 'bg-white/40', titleColor: '#111111', subtitleColor: '#444444', dateColor: '#666666' };
    case 'romantic':
    case 'romantic-floral':
    case 'japanese-sakura':
      return { overlay: 'bg-pink-950/10', titleColor: '#ffffff', subtitleColor: '#fce7f3', dateColor: '#fbcfe8' };
    case 'elegant':
    case 'royal-khmer':
    case 'modern-khmer':
    case 'luxury-gold':
    case 'black-gold':
      return { overlay: 'bg-amber-950/10', titleColor: '#ffffff', subtitleColor: '#fef3c7', dateColor: '#fde68a' };
    case 'editorial':
      return { overlay: 'bg-stone-100/55', titleColor: '#0a0a0a', subtitleColor: '#1c1917', dateColor: '#44403c' };
    case 'glassmorphism':
    case 'cinematic-dark':
    default:
      return { overlay: 'bg-black/10', titleColor: '#ffffff', subtitleColor: '#f8fafc', dateColor: '#e2e8f0' };
  }
}

// ── Resolve connector and divider style from visual style ────────────────────
function getHeroCardOptions(visualStyle: string): { connector: CoupleConnector; divider: CoupleDivider } {
  switch (visualStyle) {
    case 'royal-khmer':
    case 'modern-khmer':
    case 'luxury-gold':
    case 'elegant':
      return { connector: 'ning', divider: 'kbach-gold' };
    case 'romantic':
    case 'romantic-floral':
    case 'japanese-sakura':
    case 'korean-elegant':
      return { connector: 'hearts', divider: 'minimal' };
    case 'neo-brutalism':
    case 'editorial':
      return { connector: 'ampersand', divider: 'none' };
    case 'minimalist':
    case 'white-minimal':
      return { connector: 'ampersand', divider: 'minimal' };
    default:
      return { connector: 'hearts', divider: 'star' };
  }
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
  const springDefault = { type: 'spring' as const, duration: 1.0, bounce: 0.05 };
  switch (anim) {
    case 'none':
      return { initial: { opacity: targetOpacity }, animate: { opacity: targetOpacity } };
    case 'fade':
      return { initial: { opacity: 0 }, animate: { opacity: targetOpacity }, transition: { duration: 1.2 } };
    case 'zoom':
      return { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: targetOpacity, scale: 1 }, transition: { duration: 1.0, ease: 'easeOut' } };
    case 'bounce':
      return { initial: { y: -45, opacity: 0 }, animate: { y: 0, opacity: targetOpacity }, transition: { type: 'spring', stiffness: 120, damping: 12 } };
    case 'shimmer':
      return { initial: { opacity: targetOpacity * 0.4 }, animate: { opacity: [targetOpacity * 0.4, targetOpacity, targetOpacity * 0.4] }, transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } };
    case 'fade-up':
    default:
      return { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: targetOpacity }, transition: { ...springDefault, delay: 0.3 } };
  }
};

interface HeroSectionProps {
  guestName?: string;
}

export default function HeroSection({ guestName }: HeroSectionProps = {}) {
  const { lang } = useLanguage();
  const { settings } = useWeddingData();
  const vs = useVisualStyleOptional();
  const visualStyle = vs?.visualStyle ?? 'classic';
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });

  const bgY       = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const bgScale   = useTransform(scrollYProgress, [0, 1], [1.06, 1.18]);
  const glowY     = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const contentY  = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOp = useTransform(scrollYProgress, [0, 1], [1, 0.38]);

  const names      = lang === 'km' ? settings.coupleNamesKm : settings.coupleNames;
  const date       = lang === 'km' ? settings.weddingDateKm : settings.weddingDate;
  const eventTitle = lang === 'km' ? settings.eventTitleKm : settings.eventTitleEn;
  const bgImage    = settings.heroImage || heroBg;

  const { groom, bride } = splitCoupleNames(names ?? '');
  const cardDefaults = getHeroCardOptions(visualStyle);
  // coupleCardConfig from DB overrides visual-style defaults if set
  const cardConfig = settings.coupleCardConfig;
  const connector: CoupleConnector = (cardConfig?.connector as CoupleConnector) ?? cardDefaults.connector;
  const divider: CoupleDivider = cardDefaults.divider;
  const { overlay, subtitleColor, dateColor } = getHeroOverlay(visualStyle);

  // Neo-brutalism: no blur/dark overlay on bg — show full image with white overlay
  const isLight = ['neo-brutalism', 'minimalist', 'white-minimal', 'editorial'].includes(visualStyle);
  const subtitleShadow = isLight ? 'none' : '0 1px 3px rgba(0,0,0,0.99), 0 4px 14px rgba(0,0,0,0.85)';
  const goldGlow = isLight ? 'none' : '0 0 14px rgba(251,191,36,0.9), 0 2px 4px rgba(0,0,0,0.8)';

  return (
    <motion.section
      id="hero"
      ref={sectionRef}
      className="relative min-h-[100svh] flex flex-col items-center justify-center text-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY, scale: bgScale }}>
        <img 
          src={bgImage} 
          alt="Wedding hero background" 
          className="h-full w-full object-cover" 
          style={{ opacity: settings.heroImageOpacity !== undefined ? settings.heroImageOpacity : 1.0 }}
        />
        {/* Thin flat tint — keeps photo vivid but tones colour cast slightly */}
        <div className={`absolute inset-0 ${overlay}`} />
        {/* Bottom scrim only — text area darkens, top stays clear */}
        {!isLight && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% via-black/20 via-60% to-black/55" />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-950/10 via-transparent to-transparent" />
          </>
        )}
        {isLight && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/30" />
        )}
      </motion.div>

      <HeroPetals />

      {/* Ambient gold glow behind text — only for dark themes */}
      {!isLight && (
        <motion.div
          className="absolute top-[22%] left-1/2 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-amber-400/12 blur-[100px] pointer-events-none"
          style={{ y: glowY }}
        />
      )}

      {/* ── Text content ── */}
      <motion.div
        className="relative z-10 max-w-xl px-4 sm:px-6 w-full"
        style={{ y: contentY, opacity: contentOp }}
      >
        {/* Event title */}
        <motion.p
          className={`mb-5 uppercase font-bold ${
            settings.eventTitleSize || (lang === 'km' ? 'text-base' : 'text-sm')
          } ${
            (!settings.eventTitleFont || settings.eventTitleFont === 'Moul' || settings.eventTitleFont === 'Koulen') && lang === 'km'
              ? 'font-khmer tracking-normal'
              : ''
          }`}
          style={{ 
            color: subtitleColor, 
            textShadow: subtitleShadow,
            fontFamily: settings.eventTitleFont ? getEventTitleFontFamily(settings.eventTitleFont) : undefined,
            letterSpacing: settings.eventTitleFont && settings.eventTitleFont !== 'Moul' && settings.eventTitleFont !== 'Koulen' ? '0.12em' : (lang === 'km' ? undefined : '0.35em'),
            opacity: settings.eventTitleOpacity !== undefined ? settings.eventTitleOpacity : 1.0,
          }}
          {...getEventTitleAnimationProps(settings.eventTitleAnimation || 'fade-up', settings.eventTitleOpacity !== undefined ? settings.eventTitleOpacity : 1.0)}
        >
          {eventTitle}
        </motion.p>

        {/* ── CoupleCard — theme-aware glassmorphism ── */}
        <motion.div
          className="mb-2"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: 0.5 }}
        >
          <CoupleCard
            groomName={groom}
            brideName={bride}
            groomFont={cardConfig?.groomFont as any}
            brideFont={cardConfig?.brideFont as any}
            layout={(cardConfig?.layout ?? 'vertical') as any}
            connector={(cardConfig?.connector as any) ?? cardDefaults.connector}
            ornament={(cardConfig?.ornament as any) ?? (cardDefaults.divider === 'kbach-gold' ? 'kbach' : cardDefaults.divider === 'star' ? 'star' : cardDefaults.divider === 'minimal' ? 'minimal' : 'none')}
            ambiance={(cardConfig?.ambiance as any) ?? 'none'}
            accentColor={cardConfig?.accentColor}
            fontSize={cardConfig?.fontSize}
            cardStyle={cardConfig?.cardStyle}
            textEffect={cardConfig?.textEffect}
            ornamentOpacity={cardConfig?.ornamentOpacity}
            ornamentScale={cardConfig?.ornamentScale}
            stickers={cardConfig?.stickers}
            stickerPosition={cardConfig?.stickerPosition}
            bgOpacity={cardConfig?.bgOpacity}
            bgBlur={cardConfig?.bgBlur}
          />
        </motion.div>

        {/* Decorative gold divider */}
        <motion.div
          className="my-5 flex items-center justify-center gap-4"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ ...spring, delay: 0.7 }}
        >
          <div className="h-px flex-1 max-w-[80px]" style={{
            background: isLight
              ? 'linear-gradient(to right, transparent, rgba(0,0,0,0.3))'
              : 'linear-gradient(to right, transparent, rgba(251,191,36,0.7))'
          }} />
          <span
            className="animate-gentle-float text-xl"
            style={{ color: isLight ? '#b45309' : '#fbbf24', textShadow: goldGlow }}
          >
            ✦
          </span>
          <div className="h-px flex-1 max-w-[80px]" style={{
            background: isLight
              ? 'linear-gradient(to left, transparent, rgba(0,0,0,0.3))'
              : 'linear-gradient(to left, transparent, rgba(251,191,36,0.7))'
          }} />
        </motion.div>

        {/* Wedding date */}
        <motion.p
          className={`font-semibold ${
            lang === 'km' ? 'text-lg font-khmer' : 'font-display text-xl italic'
          }`}
          style={{ color: dateColor, textShadow: subtitleShadow }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: 0.9 }}
        >
          {date}
        </motion.p>

        {/* Scroll hint */}
        <motion.div
          className="mt-10"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...spring, delay: 1.2 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium"
            style={{
              background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.40)',
              backdropFilter: isLight ? 'none' : 'blur(14px)',
              WebkitBackdropFilter: isLight ? 'none' : 'blur(14px)',
              border: isLight ? '1.5px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.22)',
              color: isLight ? '#111111' : 'rgba(255,255,255,0.95)',
              ...(visualStyle === 'neo-brutalism' ? { borderRadius: 0, border: '2px solid #0a0a0a', boxShadow: '3px 3px 0 #0a0a0a' } : { borderRadius: '9999px' }),
            }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="animate-sparkle text-amber-300">✨</span>
            <span className={lang === 'km' ? 'font-khmer' : 'font-display italic'}>
              {lang === 'km' ? 'រំកិលចុះក្រោម' : 'Scroll to explore'}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
