import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';

const spring = { type: "spring" as const, duration: 0.8, bounce: 0.08 };

export default function TimelineSection() {
  const { t, lang } = useLanguage();
  const { programSchedule } = useWeddingData();
  const fontClass = lang === 'km' ? 'font-khmer' : '';

  const items = programSchedule
    .filter((item) => item.time_en || item.time_km || item.title_en || item.title_km)
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const isEmpty = items.length === 0;

  return (
    <motion.section
      className="py-14 sm:py-20 px-5 bg-champagne/30"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={spring}
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}>
          {t('timeline.title')}
        </h2>
        <div className="section-divider mb-10" />

        {isEmpty ? (
          <div className="luxury-card rounded-xl p-5 text-center">
            <p className={`text-sm text-muted-foreground ${fontClass}`}>
              {lang === 'km'
                ? 'មិនទាន់មានដំណើរកម្មវិធីនៅឡើយទេ។'
                : 'Program schedule has not been published yet.'}
            </p>
          </div>
        ) : (
          <div className="max-h-[62vh] overflow-y-auto pr-1">
            <ul className="timeline timeline-vertical timeline-snap-icon max-md:timeline-compact w-full text-left">
              {items.map((item, i) => {
              const time = (lang === 'km' ? item.time_km || item.time_en : item.time_en || item.time_km) || '';
              const title = (lang === 'km' ? item.title_km || item.title_en : item.title_en || item.title_km) || '';
              const isEven = i % 2 === 0;

              return (
                <li key={item.id || i}>
                  {/* Left part: Time on desktop, else placeholder */}
                  <div className={`timeline-start md:text-end mb-1 text-sm font-bold text-gold ${fontClass} ${isEven ? '' : 'md:text-right'}`}>
                    {isEven ? time : <span className="md:hidden">{time}</span>}
                  </div>

                  {/* Middle part: Circle indicator */}
                  <div className="timeline-middle text-accent hover:scale-125 transition-transform cursor-pointer">
                    <span className="w-7 h-7 rounded-full bg-champagne border-2 border-gold-light flex items-center justify-center text-xs shadow-glow">
                      ✦
                    </span>
                  </div>

                  {/* Right part: Card box */}
                  <div className={`timeline-end timeline-box mb-6 w-full ${isEven ? '' : 'md:timeline-start md:text-right'}`}>
                    <motion.div
                      className="luxury-card rounded-2xl p-4 shadow-surface border border-border/30"
                      initial={{ opacity: 0, x: isEven ? 20 : -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ ...spring, delay: i * 0.05 }}
                    >
                      {!isEven && <p className={`hidden md:block text-xs font-bold text-gold mb-1 ${fontClass}`}>{time}</p>}
                      {isEven && <p className={`md:hidden text-xs font-bold text-gold mb-1 ${fontClass}`}>{time}</p>}
                      <h3 className={`font-semibold text-foreground text-sm sm:text-base leading-snug ${fontClass}`}>{title}</h3>
                    </motion.div>
                  </div>

                  {i < items.length - 1 && <hr className="bg-gradient-to-b from-gold-light/80 to-transparent" />}
                </li>
              );
            })}
          </ul>
          </div>
        )}
      </div>
    </motion.section>
  );
}
