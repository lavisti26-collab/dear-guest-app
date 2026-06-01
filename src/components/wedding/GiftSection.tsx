import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { toast } from 'sonner';

const spring = { type: "spring" as const, duration: 0.8, bounce: 0.08 };

export default function GiftSection() {
  const { t, lang } = useLanguage();
  const { bankName, bankAccount, bankQR, giftEnabled } = useWeddingData();
  const fontClass = lang === 'km' ? 'font-khmer' : '';
  const [copied, setCopied] = useState(false);

  if (!giftEnabled) return null;

  const copyAccount = () => {
    navigator.clipboard.writeText(bankAccount).then(() => {
      setCopied(true);
      toast.success(t('gift.copied'));
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.section
      className="py-14 sm:py-20 px-5 bg-champagne/30"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={spring}
    >
      <div className="max-w-md mx-auto text-center">
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}>
          {t('gift.title')}
        </h2>
        <div className="section-divider mb-8" />

        <motion.div className="luxury-card rounded-3xl p-6 sm:p-8 mb-5" whileHover={{ scale: 1.005 }}>
          <div className="text-3xl mb-3">🎁</div>
          
          {bankQR && (
            <div className="mb-5">
              <img src={bankQR} alt="Bank QR Code" className="w-48 h-48 object-contain mx-auto rounded-2xl shadow-luxury" />
            </div>
          )}

          <p className={`text-xs text-muted-foreground mb-1 ${fontClass}`}>{t('gift.bank')}</p>
          <p className="text-lg font-semibold text-foreground">{bankName}</p>
          <div className="mt-2 bg-ivory/90 rounded-xl py-2.5 px-6 inline-block gold-border">
            <p className="text-2xl font-sans font-bold text-foreground tracking-widest">{bankAccount}</p>
          </div>
        </motion.div>

        <motion.button
          onClick={copyAccount}
          className={`rounded-full min-h-[44px] px-6 py-2.5 text-sm shadow-luxury gold-border ${fontClass}`}
          style={{ background: 'linear-gradient(135deg, hsl(38 55% 58%), hsl(38 60% 48%))', color: 'white' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {copied ? `✅ ${t('gift.copied')}` : `📋 ${t('gift.copy')}`}
        </motion.button>
      </div>
    </motion.section>
  );
}
