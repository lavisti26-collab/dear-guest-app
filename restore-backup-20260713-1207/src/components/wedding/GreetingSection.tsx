import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';

const spring = { type: "spring" as const, duration: 0.8, bounce: 0.08 };

interface Props { guestName: string; }

export default function GreetingSection({ guestName }: Props) {
  const { t, lang } = useLanguage();
  const { settings } = useWeddingData();
  const desc = lang === 'km' ? settings.weddingDescriptionKm : settings.weddingDescription;
  const personalizedTag = guestName
    ? lang === 'km'
      ? 'សំបុត្រផ្ទាល់ខ្លួនសម្រាប់អ្នក' 
      : 'A special invitation just for you'
    : lang === 'km'
      ? 'សូមរីករាយចូលរួមអបអរសាទរ' 
      : 'Your presence makes the day shine brighter';

  return (
    <motion.section
      className="relative py-14 sm:py-20 flex items-center justify-center text-center overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={spring}
    >
      <div className="max-w-md px-5 w-full">
        <motion.div
          className="luxury-card rounded-3xl p-6 sm:p-8 relative overflow-hidden"
          initial={{ scale: 0.95 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={spring}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer rounded-3xl pointer-events-none" />

          <p className={`text-xs uppercase text-amber-100/80 ${lang === 'km' ? 'font-khmer tracking-normal' : 'font-display tracking-[0.28em]'}`}>
            {personalizedTag}
          </p>
          <p className={`text-sm text-muted-foreground ${lang === 'km' ? 'font-khmer' : 'font-sans'}`}>
            {t('greeting.dear')}
          </p>
          <h2 className={`text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-5 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}>
            {guestName || t('greeting.guest')}
          </h2>
          <div className="section-divider mb-5" />
          <p className={`text-foreground/80 leading-relaxed text-sm sm:text-base ${lang === 'km' ? 'font-khmer' : 'font-sans'}`}>
            {desc || t('greeting.message')}
          </p>
          <div className="mt-5 text-2xl text-gold">❋</div>
        </motion.div>
      </div>
    </motion.section>
  );
}
