import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { useTheme } from '@/theme/ThemeEngine';
import { toast } from 'sonner';

const springTransition = { type: "spring" as const, stiffness: 140, damping: 20 };

// Beautiful traditional Khmer SVG ornament for the wax seal
function KbachSealIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current" strokeWidth="1.5">
      <path d="M12 2 C13.5 5, 16 7, 19 7 C16 7, 13.5 9, 12 12 C10.5 9, 8 7, 5 7 C8 7, 10.5 5, 12 2 Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12 C13.5 15, 16 17, 19 17 C16 17, 13.5 19, 12 22 C10.5 19, 8 17, 5 17 C8 17, 10.5 15, 12 12 Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default function GiftSection() {
  const { t, lang } = useLanguage();
  const { settings, bankName, bankAccount, bankQR, giftEnabled } = useWeddingData();
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showFullQr, setShowFullQr] = useState(false);

  // Cover styles state
  const [coverType, setCoverType] = useState<'red' | 'khmer' | 'dark' | 'blue'>('red');

  // Sync initial cover with current page theme or admin settings selection
  useEffect(() => {
    const adminCover = settings?.coupleCardConfig?.giftEnvelopeCover;
    if (adminCover) {
      setCoverType(adminCover as any);
      return;
    }

    if (theme?.id) {
      const id = theme.id.toLowerCase();
      if (id.includes('khmer') || id.includes('traditional') || id.includes('classic') || id.includes('gold')) {
        setCoverType('khmer');
      } else if (id.includes('dark') || id.includes('night') || id.includes('luxury')) {
        setCoverType('dark');
      } else if (id.includes('blue') || id.includes('royal')) {
        setCoverType('blue');
      } else {
        setCoverType('red');
      }
    }
  }, [theme?.id, settings?.coupleCardConfig?.giftEnvelopeCover]);

  const giftTitle = lang === 'km'
    ? (settings.giftTitleKm || (settings.eventTitleKm
      ? `អំណោយ${settings.eventTitleKm.replace(/^ពិធី/, '')}`
      : t('gift.title')))
    : (settings.giftTitleEn || (settings.eventTitleEn
      ? (settings.eventTitleEn.toLowerCase().includes('engagement')
        ? 'Engagement Gift'
        : settings.eventTitleEn.toLowerCase().includes('wedding')
          ? 'Wedding Gift'
          : 'Gift')
      : t('gift.title')));

  if (!giftEnabled) return null;

  const copyAccount = () => {
    navigator.clipboard.writeText(bankAccount).then(() => {
      setCopied(true);
      toast.success(t('gift.copied'));
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error(lang === 'km' ? 'មិនអាចចម្លងបាន។ សូមចម្លងដោយខ្លួនឯង។' : 'Could not copy — please copy manually.');
    });
  };

  // Define cover properties
  const covers = {
    red: {
      bgTop: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
      bgBottom: 'linear-gradient(0deg, #9a0007 0%, #d32f2f 100%)',
      bgInside: 'linear-gradient(to bottom, #7f0000 0%, #4a0000 100%)',
      border: 'border-[#FCF6BA]/30',
      accentColor: '#FCF6BA',
      textColor: '#FFFFFF',
      sealChar: '囍',
      corners: '✨',
    },
    khmer: {
      bgTop: 'linear-gradient(135deg, #FAF7F0 0%, #E6DFD3 100%)',
      bgBottom: 'linear-gradient(0deg, #D4AF37 0%, #FAF7F0 100%)',
      bgInside: 'linear-gradient(to bottom, #c5a059 0%, #8c6a21 100%)',
      border: 'border-[#b38827]/40',
      accentColor: '#8A6615',
      textColor: '#4E3606',
      sealChar: '🔱',
      corners: '🔱',
    },
    dark: {
      bgTop: 'linear-gradient(135deg, #2D2418 0%, #1A1208 100%)',
      bgBottom: 'linear-gradient(0deg, #120A02 0%, #2D2418 100%)',
      bgInside: 'linear-gradient(to bottom, #1f1810 0%, #0c0804 100%)',
      border: 'border-[#E6C687]/30',
      accentColor: '#E6C687',
      textColor: '#F3E4C6',
      sealChar: '⚜️',
      corners: '✦',
    },
    blue: {
      bgTop: 'linear-gradient(135deg, #1B365D 0%, #0C1E36 100%)',
      bgBottom: 'linear-gradient(0deg, #061122 0%, #1B365D 100%)',
      bgInside: 'linear-gradient(to bottom, #0a182d 0%, #030812 100%)',
      border: 'border-[#F1E3B8]/30',
      accentColor: '#F1E3B8',
      textColor: '#FFFFFF',
      sealChar: '👑',
      corners: '❈',
    },
  };

  const activeCover = covers[coverType];

  return (
    <motion.section
      id="gift"
      className="py-12 sm:py-16 px-5"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={springTransition}
    >
      <div className="max-w-md mx-auto text-center">
        
        {/* Title */}
        <h2
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{
            color: 'hsl(var(--foreground))',
            fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-display)',
          }}
        >
          {giftTitle}
        </h2>
        
        {/* Divider */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-px w-10 bg-accent/30" />
          <span className="text-accent text-[9px]">✦</span>
          <div className="h-px w-10 bg-accent/30" />
        </div>

        {/* ── Digital Wedding Envelope Container (Supports 3D perspective) ── */}
        <div 
          className="relative w-[300px] sm:w-[340px] h-[380px] sm:h-[430px] mx-auto rounded-3xl shadow-luxury overflow-hidden animate-fade-in"
          style={{
            perspective: '1200px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Envelope Inner Back Shadow */}
          <div 
            className="absolute inset-0 rounded-3xl z-0"
            style={{ background: activeCover.bgInside }}
          />

          {/* ── THE CARD (QR & Bank details - Slides Up & Zooms Forward) ── */}
          <motion.div 
            className="absolute inset-2 p-5 flex flex-col justify-between items-center text-center rounded-2xl bg-card border border-border/40"
            style={{
              zIndex: isOpen ? 15 : 5,
              transformStyle: 'preserve-3d',
            }}
            animate={{
              y: isOpen ? -10 : 0,
              scale: isOpen ? 1.025 : 0.96,
              rotateX: isOpen ? 0 : -8,
              boxShadow: isOpen 
                ? '0 20px 40px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.4) inset' 
                : '0 4px 10px rgba(0,0,0,0.05)',
            }}
            transition={springTransition}
          >
            <div className="text-xl">🎁</div>

            {/* Clickable QR Code Image */}
            {bankQR && (
              <div 
                className="my-1.5 w-full flex justify-center cursor-zoom-in group"
                onClick={() => setShowFullQr(true)}
                title={lang === 'km' ? 'ចុចលើ QR ដើម្បីមើលធំ និងរក្សាទុក' : 'Click QR to expand and save'}
              >
                <img 
                  src={bankQR} 
                  alt="Bank QR Code" 
                  className="w-36 h-36 sm:w-46 sm:h-46 object-contain rounded-2xl shadow-md border border-[#E6DFD3]/40 bg-white p-1.5 transition-transform duration-300 group-hover:scale-105 active:scale-95" 
                />
              </div>
            )}

            {/* Bank details */}
            <div className="space-y-1 w-full">
              <p
                className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest"
                style={{ fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)' }}
              >
                {t('gift.bank')}
              </p>
              <p
                className="text-xs sm:text-sm font-bold text-foreground"
                style={{ fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)' }}
              >
                {bankName}
              </p>
              <div className="bg-ivory/80 dark:bg-neutral-800/80 rounded-xl py-1 px-3.5 inline-block border border-[#E6DFD3] dark:border-white/10">
                <p className="text-base sm:text-lg font-sans font-bold text-foreground tracking-wider">{bankAccount}</p>
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={copyAccount}
              className="w-full rounded-full min-h-[38px] text-[11px] font-bold shadow-sm border transition-all hover:scale-103 active:scale-97 text-foreground bg-card flex items-center justify-center gap-1.5"
              style={{
                fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)',
                borderColor: 'hsl(var(--border) / 0.5)',
              }}
            >
              {copied ? `✅ ${t('gift.copied')}` : `📋 ${t('gift.copy')}`}
            </button>
          </motion.div>

          {/* ── ENVELOPE TOP FLAP (3D Flip Upward) ── */}
          <motion.div
            animate={{
              rotateX: isOpen ? -170 : 0,
              y: isOpen ? -10 : 0,
              zIndex: isOpen ? 2 : 20,
            }}
            transition={springTransition}
            onClick={() => setIsOpen(true)}
            className={`absolute top-0 left-0 w-full h-[50%] border-b flex flex-col justify-end pb-5 px-6 cursor-pointer select-none origin-top ${activeCover.border}`}
            style={{ 
              background: activeCover.bgTop,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="absolute top-4 left-4 text-xs" style={{ color: activeCover.accentColor }}>{activeCover.corners}</div>
            <div className="absolute top-4 right-4 text-xs" style={{ color: activeCover.accentColor }}>{activeCover.corners}</div>

            <p
              className="text-xs sm:text-sm font-bold leading-normal"
              style={{
                color: activeCover.accentColor,
                fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)',
              }}
            >
              {lang === 'km' ? 'ផ្ញើចំណងដៃតាម' : 'Send Blessing via'}
            </p>
            <p
              className="text-sm sm:text-base font-bold tracking-wide"
              style={{
                color: activeCover.textColor,
                fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-display)',
              }}
            >
              {lang === 'km' ? 'ស្រោមសំបុត្រឌីជីថល' : 'Digital Envelope'}
            </p>
          </motion.div>

          {/* ── ENVELOPE BOTTOM FLAP (3D Flip Downward) ── */}
          <motion.div
            animate={{
              rotateX: isOpen ? 170 : 0,
              y: isOpen ? 10 : 0,
              zIndex: isOpen ? 2 : 20,
            }}
            transition={springTransition}
            onClick={() => setIsOpen(true)}
            className={`absolute bottom-0 left-0 w-full h-[50.2%] border-t flex flex-col justify-start pt-11 px-6 cursor-pointer select-none text-center origin-bottom ${activeCover.border}`}
            style={{ 
              background: activeCover.bgBottom,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="flex flex-col items-center gap-1.5 mt-0.5">
              <span
                className="text-[9px] uppercase font-bold tracking-widest"
                style={{
                  color: activeCover.accentColor,
                  fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)',
                }}
              >
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

          {/* ── WAX SEAL (Centered Badge - Pops out on Open) ── */}
          <motion.div
            animate={{
              scale: isOpen ? 0 : 1,
              opacity: isOpen ? 0 : 1,
              pointerEvents: isOpen ? 'none' : 'auto'
            }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer select-none"
          >
            <motion.div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl relative border-2 border-white/90"
              style={{
                background: 'radial-gradient(circle, #FCF6BA 0%, #B38728 60%, #AA771C 100%)',
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-white/20 flex items-center justify-center text-lg text-white font-bold select-none">
                {coverType === 'khmer' ? <KbachSealIcon /> : activeCover.sealChar}
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border border-white/40"
                animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* ── Close control button ── */}
        <AnimatePresence>
          {isOpen ? (
            <motion.button
              key="close-btn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => setIsOpen(false)}
              className="mt-6 text-xs font-semibold text-muted-foreground/80 hover:text-accent flex items-center justify-center gap-1 mx-auto transition-all"
              style={{ fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)' }}
            >
              ↩️ {lang === 'km' ? 'បិទស្រោមសំបុត្រឡើងវិញ' : 'Close envelope'}
            </motion.button>
          ) : null}
        </AnimatePresence>

      </div>

      {/* ── FULL SCREEN QR LIGHTBOX & SAVE MODAL ── */}
      <AnimatePresence>
        {showFullQr && bankQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFullQr(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Prevent modal closure when clicking container
              className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-sm w-full flex flex-col items-center gap-6 shadow-2xl relative border border-neutral-100 dark:border-white/10"
            >
              {/* Close Icon Button */}
              <button 
                onClick={() => setShowFullQr(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>

              {/* Header Title */}
              <div className="text-center mt-2">
                <h3 className="font-bold text-neutral-800 dark:text-neutral-100 text-lg">{bankName}</h3>
                <p 
                  className="text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide mt-0.5"
                  style={{ fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)' }}
                >
                  {lang === 'km' ? 'គណនី៖' : 'Account:'} {bankAccount}
                </p>
              </div>

              {/* Large QR Code Visual */}
              <img 
                src={bankQR} 
                alt="Bank QR Code Full" 
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-2xl bg-white p-2 border border-neutral-100 dark:border-white/5" 
              />

              {/* Save actions */}
              <div className="w-full flex flex-col gap-2">
                <a 
                  href={bankQR}
                  download={`${bankName.replace(/\s+/g, '_')}_QR.png`}
                  onClick={(e) => {
                    e.preventDefault();
                    fetch(bankQR)
                      .then(response => response.blob())
                      .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${bankName.replace(/\s+/g, '_')}_QR.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        toast.success(lang === 'km' ? 'បានទាញយកដោយជោគជ័យ' : 'Downloaded successfully');
                      })
                      .catch(() => {
                        // CORS fallback
                        window.open(bankQR, '_blank');
                        toast.info(lang === 'km' ? 'សូមចុចឱ្យជាប់លើរូបភាពដើម្បីរក្សាទុក' : 'Hold or right-click the image to save');
                      });
                  }}
                  className="w-full py-3 bg-[#D4AF37] hover:bg-[#B38728] text-white rounded-full text-xs font-bold shadow-md transition-all hover:scale-102 flex items-center justify-center gap-1.5"
                  style={{ fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)' }}
                >
                  📥 {lang === 'km' ? 'រក្សាទុករូបភាព QR' : 'Save QR Image'}
                </a>

                {/* Info Text */}
                <p 
                  className="text-[10px] text-neutral-400 dark:text-neutral-500 text-center font-medium mt-1 leading-normal"
                  style={{ fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)' }}
                >
                  {lang === 'km' 
                    ? 'ឬចុចរូបភាពឱ្យជាប់ដើម្បីរក្សាទុកក្នុងអាល់ប៊ុមរូបថត' 
                    : 'Or press and hold image to save to your photos'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
