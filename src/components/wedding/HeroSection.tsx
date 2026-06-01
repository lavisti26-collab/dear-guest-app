import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
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
          className="absolute animate-petal-fall"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}px`,
            top: '-20px',
            opacity: 0.65,
            filter: 'saturate(0.8)',
          }}
        >
          🌸
        </span>
      ))}
    </div>
  );
}

export default function HeroSection() {
  const { lang } = useLanguage();
  const { settings } = useWeddingData();
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });

  const bgY        = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const bgScale    = useTransform(scrollYProgress, [0, 1], [1.06, 1.18]);
  const glowY      = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const contentY   = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOp  = useTransform(scrollYProgress, [0, 1], [1, 0.38]);

  const names    = lang === 'km' ? settings.coupleNamesKm : settings.coupleNames;
  const date     = lang === 'km' ? settings.weddingDateKm : settings.weddingDate;
  const eventTitle = lang === 'km' ? settings.eventTitleKm : settings.eventTitleEn;
  const bgImage  = settings.heroImage || heroBg;

  // Multi-layer shadows so text is crisp over any photo
  const nameShadow     = '0 2px 4px rgba(0,0,0,0.95), 0 6px 20px rgba(0,0,0,0.75), 0 0 60px rgba(0,0,0,0.4)';
  const subtitleShadow = '0 1px 3px rgba(0,0,0,0.99), 0 4px 14px rgba(0,0,0,0.85)';
  const goldGlow       = '0 0 14px rgba(251,191,36,0.9), 0 2px 4px rgba(0,0,0,0.8)';

  return (
    <motion.section
      ref={sectionRef}
      className="relative min-h-[100svh] flex flex-col items-center justify-center text-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      {/* ── Background image + layered dark overlays ── */}
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY, scale: bgScale }}>
        <img src={bgImage} alt="Wedding hero background" className="h-full w-full object-cover" />
        {/* Base dark veil */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Gradient darkens more toward bottom where text sits */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black/75" />
        {/* Warm amber tint at the very top */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/25 via-transparent to-transparent" />
      </motion.div>

      <HeroPetals />

      {/* Ambient gold glow behind text */}
      <motion.div
        className="absolute top-[22%] left-1/2 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-amber-400/12 blur-[100px] pointer-events-none"
        style={{ y: glowY }}
      />

      {/* ── Text content ── */}
      <motion.div
        className="relative z-10 max-w-lg px-6 sm:px-8 w-full"
        style={{ y: contentY, opacity: contentOp }}
      >
        {/* Subtitle: "ពិធីមង្គលការ" / "The Wedding of" */}
        <motion.p
          className={`mb-5 uppercase tracking-[0.35em] font-bold text-white ${
            lang === 'km' ? 'font-khmer text-base' : 'font-sans text-sm'
          }`}
          style={{ textShadow: subtitleShadow }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: 0.3 }}
        >
          {eventTitle}
        </motion.p>

        {/* Couple name inside a frosted-glass card */}
        <motion.div
          className="mb-2 rounded-2xl px-6 py-5"
          style={{
            background: 'rgba(0,0,0,0.32)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: 0.5 }}
        >
          <h1
            className={`font-bold text-white leading-tight ${
              lang === 'km'
                ? 'text-4xl sm:text-5xl font-khmer'
                : 'text-5xl sm:text-6xl md:text-7xl font-display'
            }`}
            style={{ textShadow: nameShadow }}
          >
            {names}
          </h1>
        </motion.div>

        {/* Decorative gold divider */}
        <motion.div
          className="my-5 flex items-center justify-center gap-4"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ ...spring, delay: 0.7 }}
        >
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-amber-300/70" />
          <span
            className="animate-gentle-float text-xl text-amber-300"
            style={{ textShadow: goldGlow }}
          >
            ✦
          </span>
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-amber-300/70" />
        </motion.div>

        {/* Wedding date */}
        <motion.p
          className={`font-semibold text-white ${
            lang === 'km' ? 'text-lg font-khmer' : 'font-display text-xl italic'
          }`}
          style={{ textShadow: subtitleShadow }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: 0.9 }}
        >
          {date}
        </motion.p>

        {/* Scroll hint pill */}
        <motion.div
          className="mt-10"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...spring, delay: 1.2 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm text-white/95 font-medium"
            style={{
              background: 'rgba(0,0,0,0.40)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.22)',
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
