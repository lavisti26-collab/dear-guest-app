import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';

const EASE = [0.22, 1, 0.36, 1] as const;

function Diamond() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <rect x="7" y="0.7" width="9" height="9" rx="0.5" transform="rotate(45 7 0.7)"
        fill="hsl(var(--accent) / 0.2)" stroke="hsl(var(--accent))" strokeWidth="1.2" />
    </svg>
  );
}

export default function TimelineSection() {
  const { t, lang } = useLanguage();
  const { settings, programSchedule } = useWeddingData();
  const fontClass = lang === 'km' ? 'font-khmer' : '';

  const items = programSchedule
    .filter((item) => item.time_en || item.time_km || item.title_en || item.title_km)
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const isEmpty = items.length === 0;

  return (
    <section className={`py-8 sm:py-12 px-5 sm:px-8 ${fontClass}`}>

      {/* ── Heading ─────────────────────────────────────────────── */}
      <motion.div
        className="text-center mb-8 sm:mb-10"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <h2
          className={`text-3xl sm:text-4xl font-bold mb-3 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}
          style={{
            color: 'hsl(var(--foreground))',
            fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-display)',
          }}
        >
          {lang === 'km'
            ? settings.timelineTitleKm || t('timeline.title')
            : settings.timelineTitleEn || t('timeline.title')}
        </h2>
        {/* Ornament */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-14" style={{ background: 'linear-gradient(to right, transparent, hsl(var(--accent) / 0.6))' }} />
          <Diamond />
          <div className="h-px w-14" style={{ background: 'linear-gradient(to left, transparent, hsl(var(--accent) / 0.6))' }} />
        </div>
      </motion.div>

      {/* ── Empty state ─────────────────────────────────────────── */}
      {isEmpty ? (
        <p
          className={`text-center text-base ${fontClass}`}
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          {lang === 'km' ? 'មិនទាន់មានដំណើរកម្មវិធីនៅឡើយទេ។' : 'Program schedule has not been published yet.'}
        </p>
      ) : (
        /* ── Timeline rows ────────────────────────────────────── */
        <div className="relative max-w-lg mx-auto">

          {/* Vertical spine */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '1px',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to bottom, transparent, hsl(var(--accent) / 0.4) 5%, hsl(var(--accent) / 0.4) 95%, transparent)',
            }}
          />

          <ul>
            {items.map((item, i) => {
              const time = (lang === 'km' ? item.time_km || item.time_en : item.time_en || item.time_km) || '';
              const title = (lang === 'km' ? item.title_km || item.title_en : item.title_en || item.title_km) || '';
              const isLast = i === items.length - 1;

              return (
                <motion.li
                  key={item.id || i}
                  className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-x-4"
                  style={{
                    paddingTop: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: isLast ? 'none' : '1px solid hsl(var(--accent) / 0.18)',
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
                >
                  {/* Time — left, right-aligned */}
                  <div className="text-right pr-2">
                    <span
                      className="font-bold leading-tight"
                      style={{
                        fontSize: 'clamp(0.95rem, 3.5vw, 1.15rem)',
                        color: 'hsl(var(--accent))',
                        fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-display)',
                      }}
                    >
                      {time}
                    </span>
                  </div>

                  {/* Diamond center node */}
                  <div className="relative z-10 flex items-center justify-center">
                    <motion.div whileHover={{ scale: 1.4 }} transition={{ duration: 0.2 }}>
                      <Diamond />
                    </motion.div>
                  </div>

                  {/* Title — right, left-aligned */}
                  <div className="pl-2">
                    <span
                      className="font-semibold leading-snug"
                      style={{
                        fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                        color: 'hsl(var(--foreground))',
                        fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)',
                      }}
                    >
                      {title}
                    </span>
                  </div>
                </motion.li>
              );
            })}

            {/* Closing heart */}
            <motion.li
              className="flex justify-center pt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: items.length * 0.07 }}
            >
              <span style={{ color: 'hsl(var(--accent) / 0.6)', fontSize: '16px' }}>♡</span>
            </motion.li>
          </ul>
        </div>
      )}
    </section>
  );
}
