import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import confetti from 'canvas-confetti';
import { requestPlayMusic } from '@/lib/wedding-music';

interface EnvelopeProps {
  guestName: string;
  onOpen: () => void;
  isOpen: boolean;
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
function Sparkle({ angle, radius, delay }: { angle: number; radius: number; delay: number }) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;
  return (
    <motion.div
      className="absolute text-amber-300 text-xs pointer-events-none"
      style={{ left: '50%', top: '50%' }}
      animate={{ x: [x * 0.8, x, x * 0.8], y: [y * 0.8, y, y * 0.8], scale: [0.6, 1.2, 0.6], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 3, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      ✦
    </motion.div>
  );
}

// ── Wax seal SVG ─────────────────────────────────────────────────────────────
function WaxSeal({ popping }: { popping: boolean }) {
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
          <text x="24" y="29" textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.9)" fontFamily="serif" fontWeight="bold">
            ♡
          </text>
        </svg>
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EnvelopeAnimation({ guestName, onOpen, isOpen }: EnvelopeProps) {
  const { t, lang } = useLanguage();
  const { settings } = useWeddingData();
  const [flapOpen, setFlapOpen] = useState(false);
  const [cardRising, setCardRising] = useState(false);
  const [sealPopping, setSealPopping] = useState(false);
  const [petals] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({ id: i, delay: i * 0.7, x: (i * 5.5 + Math.random() * 4) % 100, size: 14 + Math.random() * 10 }))
  );

  // Couple names for the card interior
  const coupleNames = lang === 'km' ? settings.coupleNamesKm : settings.coupleNames;
  const weddingDate  = lang === 'km' ? settings.weddingDateKm  : settings.weddingDate;
  const eventTitle   = lang === 'km' ? settings.eventTitleKm : settings.eventTitleEn;

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
          requestPlayMusic();
          launchFireworks();
          onOpen();
        }, 900);
      }, 500);
    }, 350);
  }, [flapOpen, onOpen]);

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 30% 40%, hsl(38 45% 95%) 0%, hsl(36 35% 91%) 45%, hsl(345 25% 87%) 100%)',
          }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          {/* ── Layered ambient background ── */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Large warm glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-40"
              style={{ background: 'radial-gradient(ellipse, rgba(212,167,106,0.25) 0%, transparent 70%)' }} />
            {/* Rose corner glow */}
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-30"
              style={{ background: 'radial-gradient(ellipse, rgba(240,180,165,0.35) 0%, transparent 70%)' }} />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-30"
              style={{ background: 'radial-gradient(ellipse, rgba(212,167,106,0.3) 0%, transparent 70%)' }} />
          </div>

          {/* ── Floating petals ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {petals.map((p) => <Petal key={p.id} delay={p.delay} x={p.x} size={p.size} />)}
          </div>

          {/* ── Ornate corner decorations ── */}
          {[
            'top-3 left-3',
            'top-3 right-3 scale-x-[-1]',
            'bottom-3 left-3 scale-y-[-1]',
            'bottom-3 right-3 scale-[-1]',
          ].map((pos, i) => (
            <motion.div
              key={i}
              className={`absolute ${pos} pointer-events-none`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.12, ...spring }}
            >
              <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-25">
                <path d="M4 4 Q30 4 30 30 Q4 30 4 4Z" fill="none" stroke="hsl(38 55% 55%)" strokeWidth="0.8" />
                <path d="M4 4 L20 4 M4 4 L4 20" stroke="hsl(38 55% 55%)" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="8" cy="8" r="1.5" fill="hsl(38 55% 55%)" />
                <path d="M12 4 Q28 4 28 20" fill="none" stroke="hsl(38 55% 55%)" strokeWidth="0.5" opacity="0.6" />
              </svg>
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
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <p className={`mx-auto max-w-full tracking-[0.24em] uppercase text-amber-800/80 text-xl sm:text-2xl md:text-3xl ${lang === 'km' ? 'font-khmer font-semibold tracking-wide' : 'font-sans font-semibold'}`}>
                {eventTitle}
              </p>
            </motion.div>
            {/* Orbiting sparkles around envelope */}
            <div className="absolute inset-0 pointer-events-none">
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <Sparkle key={i} angle={angle} radius={130} delay={i * 0.55} />
              ))}
            </div>

            {/* ──── THE ENVELOPE ──── */}
            <div className="relative" style={{ perspective: '800px' }}>
              <motion.div
                className="relative w-[300px] h-[192px] sm:w-[340px] sm:h-[216px] cursor-pointer"
                whileHover={!flapOpen ? { y: -6, scale: 1.015 } : {}}
                onClick={handleOpen}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* ─ Envelope body shadow ─ */}
                <motion.div
                  className="absolute -bottom-3 left-4 right-4 h-6 rounded-full blur-xl opacity-30"
                  style={{ background: 'rgba(100,60,20,0.5)' }}
                  animate={{ scaleX: [1, 1.04, 1], opacity: [0.3, 0.22, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                {/* ─ Envelope body ─ */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(160deg, hsl(36 40% 96%) 0%, hsl(36 35% 92%) 60%, hsl(36 30% 88%) 100%)',
                    boxShadow: '0 12px 48px rgba(140,90,30,0.18), 0 2px 8px rgba(140,90,30,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
                    border: '1px solid rgba(212,167,106,0.35)',
                  }}
                />

                {/* ─ Interior lining (visible past flap) ─ */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden"
                  style={{ clipPath: 'inset(0 0 50% 0 round 1rem 1rem 0 0)' }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'repeating-linear-gradient(45deg, rgba(212,167,106,0.06) 0px, rgba(212,167,106,0.06) 1px, transparent 1px, transparent 8px)',
                    }}
                  />
                </div>

                {/* ─ Diagonal fold lines ─ */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 216">
                  <line x1="0" y1="216" x2="170" y2="108" stroke="rgba(180,140,90,0.12)" strokeWidth="1" />
                  <line x1="340" y1="216" x2="170" y2="108" stroke="rgba(180,140,90,0.12)" strokeWidth="1" />
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
                      background: 'linear-gradient(170deg, hsl(36 42% 94%) 0%, hsl(36 38% 90%) 100%)',
                      borderBottom: '1px solid rgba(212,167,106,0.2)',
                      clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                    }}
                  />
                  {/* Flap inner (visible when flipped) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(170deg, hsl(38 50% 88%) 0%, hsl(36 42% 84%) 100%)',
                      clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                      transform: 'rotateX(180deg)',
                      backfaceVisibility: 'hidden',
                    }}
                  />
                  {/* Flap shadow line */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(180,130,70,0.3), transparent)' }}
                  />
                </motion.div>

                {/* ─ Rising invitation card ─ */}
                <AnimatePresence>
                  {cardRising ? (
                    <motion.div
                      className="absolute left-4 right-4 rounded-xl overflow-visible"
                      style={{
                        bottom: 12,
                        minHeight: 280,
                        background: 'linear-gradient(145deg, #fffdf8, #fdf6e8)',
                        boxShadow: '0 -4px 20px rgba(180,130,60,0.15), 0 8px 32px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(212,167,106,0.4)',
                        zIndex: 5,
                      }}
                      initial={{ y: 0, opacity: 0.85 }}
                      animate={{ y: -170, opacity: 1 }}
                      transition={{ duration: 0.92, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <CardContent guestName={guestName} coupleNames={coupleNames} weddingDate={weddingDate} eventTitle={eventTitle} lang={lang} t={t} />
                    </motion.div>
                  ) : (
                    /* Static card peek while closed */
                    <div
                      className="absolute left-4 right-4 bottom-3 rounded-xl overflow-visible flex flex-col items-center justify-center px-4 py-4 min-h-[180px]"
                      style={{
                        background: 'linear-gradient(145deg, #fffdf8, #fdf6e8)',
                        border: '1px solid rgba(212,167,106,0.25)',
                        zIndex: 5,
                      }}
                    >
                      <p className={`text-xs text-amber-700/50 tracking-widest mb-1 ${lang === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        {t('envelope.to')}
                      </p>
                      <p className={`text-base font-bold text-amber-900/70 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}>
                        {guestName || t('greeting.guest')}
                      </p>
                    </div>
                  )}
                </AnimatePresence>

                {/* ─ Wax seal (on top of flap join) ─ */}
                <WaxSeal popping={sealPopping} />
              </motion.div>
            </div>

            {/* ──── CTA Button ──── */}
            <motion.button
              onClick={handleOpen}
              disabled={flapOpen}
              className={`relative min-h-[52px] px-12 py-3.5 text-base rounded-full overflow-hidden ${lang === 'km' ? 'font-khmer' : 'font-display italic'}`}
              style={{
                background: 'linear-gradient(135deg, #D4A76A 0%, #C4912A 50%, #D4A76A 100%)',
                backgroundSize: '200% 100%',
                color: 'white',
                boxShadow: '0 4px 24px rgba(196,145,42,0.35), 0 1px 0 rgba(255,255,255,0.2) inset',
                border: '1px solid rgba(255,220,140,0.25)',
              }}
              whileHover={!flapOpen ? {
                scale: 1.05,
                y: -3,
                boxShadow: '0 10px 40px rgba(196,145,42,0.45)',
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

            {/* ──── Tiny helper text ──── */}
            <motion.p
              className={`text-xs text-amber-700/40 -mt-4 ${lang === 'km' ? 'font-khmer' : 'font-sans'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {lang === 'km' ? 'ចុចខាងលើដើម្បីបើក' : 'Click the envelope or button to open'}
            </motion.p>
          </motion.div>

          {/* ── Bottom ornament ── */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400/30" />
            <span className="text-amber-400/40 text-sm">❋</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400/30" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Card interior (shown when rising out of envelope) ─────────────────────────
function CardContent({
  guestName, coupleNames, weddingDate, eventTitle, lang, t,
}: { guestName: string; coupleNames: string; weddingDate: string; eventTitle: string; lang: string; t: (k: string) => string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-3 min-h-[260px] px-6 py-6 text-center overflow-visible"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      style={{ overflow: 'visible' }}
    >
      {/* Top line */}
      <div className="flex items-center gap-2 w-full">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300/50" />
        <span className="text-amber-400 text-xs">✦</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300/50" />
      </div>

      <p className={`text-[10px] tracking-[0.35em] uppercase text-amber-700/60 ${lang === 'km' ? 'font-khmer tracking-wide' : 'font-sans'}`}>
        {t('envelope.to')}
      </p>
      <p className={`text-lg sm:text-xl font-bold text-amber-900 leading-tight ${lang === 'km' ? 'font-khmer' : 'font-display italic'}`}>
        {guestName || t('greeting.guest')}
      </p>

      {/* Middle divider */}
      <motion.div
        className="flex items-center gap-1"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-amber-400 text-base">♡</span>
      </motion.div>

      {/* Couple names */}
      <p className={`text-base font-bold text-amber-800 leading-snug ${lang === 'km' ? 'font-khmer' : 'font-display italic'}`}>
        {coupleNames}
      </p>

      {weddingDate && (
        <p className={`text-xs text-amber-600/60 ${lang === 'km' ? 'font-khmer' : 'font-sans'}`}>
          {weddingDate}
        </p>
      )}

      {/* Bottom line */}
      <div className="flex items-center gap-2 w-full">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300/50" />
        <span className="text-amber-400 text-xs">✦</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300/50" />
      </div>
    </motion.div>
  );
}
