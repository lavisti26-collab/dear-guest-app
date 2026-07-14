import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { toast } from 'sonner';

const spring = { type: "spring" as const, duration: 0.8, bounce: 0.08 };

export default function GiftSection() {
  const { t, lang } = useLanguage();
  const { settings, bankName, bankAccount, bankQR, giftEnabled } = useWeddingData();
  const fontClass = lang === 'km' ? 'font-khmer' : '';
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const giftTitle = lang === 'km'
    ? (settings.eventTitleKm 
        ? `អំណោយ${settings.eventTitleKm.replace(/^ពិធី/, '')}` 
        : t('gift.title'))
    : (settings.eventTitleEn
        ? (settings.eventTitleEn.toLowerCase().includes('engagement')
            ? 'Engagement Gift'
            : settings.eventTitleEn.toLowerCase().includes('wedding')
              ? 'Wedding Gift'
              : 'Gift')
        : t('gift.title'));

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
      id="gift"
      className="py-14 sm:py-20 px-5 bg-champagne/30"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={spring}
    >
      <div className="max-w-md mx-auto text-center">
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}>
          {giftTitle}
        </h2>
        <div className="section-divider mb-8" />

        {/* ── Digital Wedding Envelope Container ── */}
        <div className="relative w-[280px] sm:w-[320px] h-[360px] sm:h-[410px] mx-auto overflow-hidden rounded-3xl border border-border/40 shadow-luxury bg-card">
          {/* Background tint */}
          <div className="absolute inset-0 bg-gradient-to-br from-champagne/10 to-ivory opacity-30 pointer-events-none" />

          {/* ── CARD CONTENTS (QR & Bank details) ── */}
          <div className="absolute inset-0 p-5 flex flex-col justify-between items-center text-center z-10">
            <div className="text-xl mb-0.5">🎁</div>
            
            {bankQR && (
              <div className="my-1">
                <img src={bankQR} alt="Bank QR Code" className="w-32 h-32 sm:w-40 sm:h-40 object-contain mx-auto rounded-2xl shadow-md border border-[#E6DFD3]/40 bg-white p-1" />
              </div>
            )}

            <div className="space-y-0.5">
              <p className={`text-[9px] text-muted-foreground uppercase tracking-widest ${fontClass}`}>{t('gift.bank')}</p>
              <p className="text-xs font-bold text-foreground">{bankName}</p>
              <div className="bg-ivory/80 rounded-xl py-1 px-3 inline-block border border-[#E6DFD3]">
                <p className="text-base sm:text-lg font-sans font-bold text-foreground tracking-wider">{bankAccount}</p>
              </div>
            </div>

            <button
              onClick={copyAccount}
              className={`w-full rounded-full min-h-[36px] text-[11px] font-semibold shadow-md border transition-all hover:scale-103 active:scale-97 text-foreground bg-card flex items-center justify-center gap-1.5 mt-1`}
            >
              {copied ? `✅ ${t('gift.copied')}` : `📋 ${t('gift.copy')}`}
            </button>
          </div>

          {/* ── ENVELOPE TOP FLAP ── */}
          <motion.div
            animate={{ 
              y: isOpen ? -190 : 0, 
              opacity: isOpen ? 0 : 1,
              pointerEvents: isOpen ? 'none' : 'auto'
            }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="absolute top-0 left-0 w-full h-[50.5%] bg-gradient-to-b from-rose-500 to-pink-600 border-b-2 border-[#FCF6BA]/30 z-20 flex flex-col justify-end pb-4 px-6 cursor-pointer select-none"
          >
            <div className="absolute top-3 left-3 text-xs text-[#FCF6BA]/50">🔱</div>
            <div className="absolute top-3 right-3 text-xs text-[#FCF6BA]/50">🔱</div>

            <p className={`text-xs sm:text-sm font-bold text-[#FCF6BA] leading-relaxed ${fontClass}`}>
              {lang === 'km' ? 'ផ្ញើចំណងដៃតាម' : 'Send Blessing via'}
            </p>
            <p className={`text-sm sm:text-base font-bold text-white tracking-wide ${fontClass}`}>
              {lang === 'km' ? 'ស្រោមសំបុត្រឌីជីថល' : 'Digital Envelope'}
            </p>
          </motion.div>

          {/* ── ENVELOPE BOTTOM FLAP ── */}
          <motion.div
            animate={{ 
              y: isOpen ? 190 : 0, 
              opacity: isOpen ? 0 : 1,
              pointerEvents: isOpen ? 'none' : 'auto'
            }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="absolute bottom-0 left-0 w-full h-[50.5%] bg-gradient-to-t from-rose-700 to-pink-600 border-t-2 border-[#FCF6BA]/30 z-20 flex flex-col justify-start pt-8 px-6 cursor-pointer select-none text-center"
          >
            <div className="flex flex-col items-center gap-1 mt-1">
              <span className={`text-[9px] uppercase font-semibold text-[#FCF6BA]/80 tracking-widest ${fontClass}`}>
                {lang === 'km' ? 'ចុចទីនេះដើម្បីបើកសំបុត្រ' : 'Tap here to open envelope'}
              </span>
              <motion.span 
                animate={{ y: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-white text-xs"
              >
                👇
              </motion.span>
            </div>
          </motion.div>

          {/* ── WAX SEAL (Middle button) ── */}
          <motion.div
            animate={{ 
              scale: isOpen ? 0 : 1, 
              opacity: isOpen ? 0 : 1,
              pointerEvents: isOpen ? 'none' : 'auto'
            }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            onClick={() => setIsOpen(true)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer select-none"
          >
            <motion.div
              className="w-14 h-14 sm:w-18 sm:h-18 rounded-full flex items-center justify-center shadow-2xl relative"
              style={{
                background: 'radial-gradient(circle, #FCF6BA 0%, #B38728 60%, #AA771C 100%)',
                border: '3px solid #FAF9F6',
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-[#FAF9F6]/40 flex items-center justify-center text-xl text-white">
                囍
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border border-white/50"
                animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        </div>

        {isOpen && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setIsOpen(false)}
            className={`mt-4 text-xs font-semibold text-muted-foreground/80 hover:text-accent flex items-center justify-center gap-1 mx-auto transition-all ${fontClass}`}
          >
            ↩️ {lang === 'km' ? 'បិទស្រោមសំបុត្រឡើងវិញ' : 'Close envelope'}
          </motion.button>
        )}
      </div>
    </motion.section>
  );
}
