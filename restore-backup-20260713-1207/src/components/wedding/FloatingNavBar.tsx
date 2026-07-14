import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';

interface NavItem {
  id: string;
  icon: string;
  labelEn: string;
  labelKm: string;
}

export default function FloatingNavBar() {
  const { lang } = useLanguage();
  const { giftEnabled, settings } = useWeddingData();
  const [activeSection, setActiveSection] = useState('hero');
  const [visible, setVisible] = useState(false);

  // Define nav items matching the section IDs we'll add
  const navItems: NavItem[] = [
    { id: 'hero', icon: '🏠', labelEn: 'Home', labelKm: 'ទំព័រដើម' },
    { id: 'details', icon: '📅', labelEn: 'Details', labelKm: 'ព័ត៌មាន' },
    { id: 'gallery', icon: '🖼️', labelEn: 'Gallery', labelKm: 'រូបភាព' },
    { id: 'rsvp', icon: '✉️', labelEn: 'RSVP', labelKm: 'ឆ្លើយតប' },
    ...(giftEnabled ? [{ id: 'gift', icon: '🎁', labelEn: 'Gift', labelKm: 'អំណោយ' }] : []),
  ];

  // 1. Scroll listener to show/hide the bar and detect active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Only show the floating nav bar after scrolling past the first 300px of Hero
      setVisible(scrollY > 300);

      // Find which section is currently in view
      for (const item of navItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the top of the section is in the top portion of the screen, set it active
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to set initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [giftEnabled]);

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const fontClass = lang === 'km' ? 'font-khmer' : 'font-sans';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[92%] sm:max-w-md w-max"
        >
          {/* Glassmorphic Shell */}
          <div className="flex items-center gap-1.5 sm:gap-3 bg-white/20 dark:bg-black/35 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-luxury rounded-full px-4 sm:px-6 py-2.5">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const label = lang === 'km' ? item.labelKm : item.labelEn;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="relative flex flex-col items-center justify-center min-h-[44px] min-w-[50px] sm:min-w-[60px] rounded-full transition-all group focus:outline-none"
                >
                  {/* Icon */}
                  <span className={`text-lg sm:text-xl transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'scale-110' : 'opacity-70 group-hover:opacity-100'
                  }`}>
                    {item.icon}
                  </span>

                  {/* Label (small, below the icon) */}
                  <span className={`text-[9px] sm:text-[10px] font-semibold mt-0.5 tracking-wider uppercase transition-all duration-200 ${fontClass} ${
                    isActive ? 'text-gold opacity-100 scale-105' : 'text-foreground/60 opacity-0 group-hover:opacity-100 group-hover:scale-100'
                  }`}>
                    {label}
                  </span>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-gold shadow-glow"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
