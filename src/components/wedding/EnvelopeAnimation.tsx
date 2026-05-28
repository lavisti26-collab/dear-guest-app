import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import confetti from 'canvas-confetti';
import { requestPlayMusic } from '@/lib/wedding-music';

interface EnvelopeProps {
  guestName: string;
  onOpen: () => void;
  isOpen: boolean;
}

const spring = { type: "spring" as const, duration: 0.6, bounce: 0.08 };

function launchFireworks() {
  const colors = ['#D4A76A', '#E8C8A0', '#F4C2C2', '#C9A96E', '#F0D5B8', '#E0B4A5'];
  const duration = 2500;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({ particleCount: 2, angle: 60, spread: 50, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 2, angle: 120, spread: 50, origin: { x: 1, y: 0.7 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();

  setTimeout(() => {
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 }, colors, startVelocity: 40, gravity: 0.9, scalar: 1.1 });
  }, 200);

  [500, 1000, 1500].forEach((delay) => {
    setTimeout(() => {
      confetti({ particleCount: 30, spread: 360, origin: { x: Math.random(), y: Math.random() * 0.4 + 0.1 }, colors, startVelocity: 25, ticks: 60 });
    }, delay);
  });
}

export default function EnvelopeAnimation({ guestName, onOpen, isOpen }: EnvelopeProps) {
  const { t, lang } = useLanguage();

  const handleOpen = useCallback(() => {
    // Trigger music inside the user gesture to satisfy browser autoplay policies.
    requestPlayMusic();
    launchFireworks();
    onOpen();
  }, [onOpen]);

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(36 33% 97%) 0%, hsl(36 30% 93%) 50%, hsl(345 20% 90%) 100%)',
          }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8 }}
        >
          {/* Subtle gold glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gold-light/10 blur-[120px]" />

          {/* Corner ornaments */}
          {['top-4 left-4', 'top-4 right-4 scale-x-[-1]', 'bottom-4 left-4 scale-y-[-1]', 'bottom-4 right-4 scale-[-1]'].map((pos, i) => (
            <motion.div
              key={i}
              className={`absolute ${pos} text-gold/20 text-3xl sm:text-4xl`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              ❋
            </motion.div>
          ))}

          <motion.div
            className="flex flex-col items-center gap-8 px-6"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...spring, duration: 1 }}
          >
            {/* Envelope */}
            <motion.div
              className="relative w-72 h-44 sm:w-80 sm:h-48 cursor-pointer"
              whileHover={{ scale: 1.02, y: -3 }}
              onClick={handleOpen}
            >
              {/* Body */}
              <div className="absolute inset-0 rounded-2xl luxury-card gold-border" />

              {/* Flap */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl origin-top overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(212,167,106,.15), rgba(212,167,106,.08))',
                  borderBottom: '1px solid rgba(212,167,106,.1)',
                }}
                initial={{ rotateX: 0 }}
                whileHover={{ rotateX: -15 }}
                transition={spring}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    className="text-2xl"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    💌
                  </motion.span>
                </div>
              </motion.div>

              {/* Card inside */}
              <div className="absolute inset-3 top-6 bg-ivory/90 backdrop-blur-sm rounded-xl gold-border flex flex-col items-center justify-center p-4 text-center">
                <p className={`text-xs text-muted-foreground tracking-widest uppercase ${lang === 'km' ? 'font-khmer text-sm tracking-normal' : 'font-sans'}`}>
                  {t('envelope.to')}
                </p>
                <p className={`text-xl sm:text-2xl font-bold text-foreground mt-1 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}>
                  {guestName || t('greeting.guest')}
                </p>
                <motion.span
                  className="mt-1 text-lg text-gold"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ♡
                </motion.span>
              </div>
            </motion.div>

            {/* Open button */}
            <motion.button
              onClick={handleOpen}
              className={`min-h-[48px] px-10 py-3 text-base shadow-luxury transition-all rounded-full gold-border ${lang === 'km' ? 'font-khmer' : 'font-display'}`}
              style={{
                background: 'linear-gradient(135deg, hsl(38 55% 58%), hsl(38 60% 48%))',
                color: 'white',
              }}
              whileHover={{ scale: 1.04, y: -2, boxShadow: '0 8px 30px rgba(212,167,106,.3)' }}
              whileTap={{ scale: 0.97 }}
              animate={{ y: [0, -3, 0] }}
              transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, ...spring }}
            >
              ✨ {t('hero.open')}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
