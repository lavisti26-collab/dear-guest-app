import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const spring = { type: "spring" as const, duration: 0.5, bounce: 0.1 };

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();

  return (
    <motion.button
      onClick={() => setLang(lang === 'en' ? 'km' : 'en')}
      className="fixed top-4 right-4 z-40 rounded-full px-3.5 py-1.5 text-xs shadow-luxury gold-border font-khmer"
      style={{
        background: 'rgba(255,253,248,.85)',
        backdropFilter: 'blur(20px)',
        color: 'hsl(25 15% 18%)',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={spring}
    >
      {t('lang.switch')}
    </motion.button>
  );
}
