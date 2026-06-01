import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';

const spring = { type: "spring" as const, duration: 0.8, bounce: 0.08 };

function useCountdown(dateStr: string) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    // Return early if dateStr is empty or invalid
    if (!dateStr || dateStr.trim() === '') {
      return;
    }
    
    const target = new Date(dateStr).getTime();
    
    // Return early if date is invalid
    if (isNaN(target)) {
      return;
    }
    
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dateStr]);
  return time;
}

function generateICSUrl(settings: { weddingDateTime: string; coupleNames: string; venueName: string }): string | null {
  // Validate that weddingDateTime is not empty and is a valid date
  if (!settings.weddingDateTime || settings.weddingDateTime.trim() === '') {
    return null;
  }
  
  const start = new Date(settings.weddingDateTime);
  
  // Check if the date is valid
  if (isNaN(start.getTime())) {
    return null;
  }
  
  const end = new Date(start.getTime() + 4 * 3600000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${settings.coupleNames} Wedding`,
    `LOCATION:${settings.venueName}`, 'DESCRIPTION:Wedding Ceremony',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export default function DetailsSection() {
  const { t, lang } = useLanguage();
  const { settings } = useWeddingData();
  const countdown = useCountdown(settings.weddingDateTime);
  const fontClass = lang === 'km' ? 'font-khmer' : '';

  const dateDisplay = lang === 'km' ? settings.weddingDateKm : settings.weddingDate;
  const timeDisplay = lang === 'km' ? settings.weddingTimeKm : settings.weddingTime;
  const venueDisplay = lang === 'km' ? settings.venueNameKm : settings.venueName;
  const icsUrl = generateICSUrl(settings);

  const handleAddToCalendar = () => {
    if (!icsUrl) return;
    const a = document.createElement('a');
    a.href = icsUrl;
    a.download = 'wedding.ics';
    a.click();
  };

  return (
    <motion.section
      className="py-14 sm:py-20 px-5"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={spring}
    >
      <div className="max-w-lg mx-auto text-center">
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}>
          {t('details.title')}
        </h2>
        <div className="section-divider mb-8" />

        <div className="grid grid-cols-1 gap-3 mb-8">
          {[
            { label: t('details.date'), value: dateDisplay, icon: '📅' },
            { label: t('details.time'), value: timeDisplay, icon: '🕐' },
            { label: t('details.venue'), value: venueDisplay, icon: '📍' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="luxury-card rounded-2xl p-4 sm:p-5 flex items-center gap-4"
              initial={{ opacity: 0, x: i % 2 === 0 ? -15 : 15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: i * 0.1 }}
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="text-left">
                <p className={`text-xs text-muted-foreground ${fontClass}`}>{item.label}</p>
                <p className={`text-sm sm:text-base font-semibold text-foreground ${fontClass}`}>{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cinematic Flip-Clock Countdown */}
        <p className={`text-muted-foreground text-xs uppercase tracking-[0.2em] mb-4 ${fontClass}`}>{t('details.countdown')}</p>
        <div className="grid grid-cols-4 gap-2 sm:gap-3.5 mb-8">
          {[
            { val: countdown.days, label: t('details.days') },
            { val: countdown.hours, label: t('details.hours') },
            { val: countdown.minutes, label: t('details.minutes') },
            { val: countdown.seconds, label: t('details.seconds') },
          ].map(({ val, label }) => {
            const formattedVal = val < 10 ? `0${val}` : `${val}`;

            return (
              <motion.div
                key={label}
                className="relative flex flex-col items-center select-none"
                whileHover={{ scale: 1.04, y: -2 }}
                transition={spring}
              >
                {/* Flip-Clock Split Cell */}
                <div className="relative w-full aspect-square sm:aspect-auto sm:min-h-[88px] rounded-2xl bg-gradient-to-b from-card via-card/90 to-card/75 border border-border/40 shadow-luxury overflow-hidden flex items-center justify-center z-0 border-b-[3px] border-b-gold">
                  {/* Flaps separator divider */}
                  <div className="absolute top-[49%] left-0 right-0 h-[1.5px] bg-black/22 z-10 shadow-[0_0.5px_0_rgba(255,255,255,0.15)]" />
                  
                  {/* Ambient top flap shading */}
                  <div className="absolute top-0 left-0 right-0 h-[49%] bg-black/[0.03] pointer-events-none" />
                  
                  {/* Digital value */}
                  <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-tight text-foreground drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.15)] z-0">
                    {formattedVal}
                  </div>
                </div>

                {/* Subtitle label underneath */}
                <div className={`text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-2.5 ${fontClass}`}>
                  {label}
                </div>
              </motion.div>
            );
          })}
        </div>

        {icsUrl && (
          <motion.button
            onClick={handleAddToCalendar}
            className={`inline-flex items-center gap-2 rounded-full min-h-[44px] px-6 py-2.5 text-sm shadow-luxury gold-border ${fontClass}`}
            style={{ background: 'linear-gradient(135deg, hsl(38 55% 58%), hsl(38 60% 48%))', color: 'white' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            📅 {t('details.calendar')}
          </motion.button>
        )}
      </div>
    </motion.section>
  );
}
