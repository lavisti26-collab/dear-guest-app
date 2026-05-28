import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';

const spring = { type: "spring" as const, duration: 0.8, bounce: 0.08 };

interface Props { guestName: string; }

export default function RSVPSection({ guestName }: Props) {
  const { t, lang } = useLanguage();
  const { updateRSVP } = useWeddingData();
  const fontClass = lang === 'km' ? 'font-khmer' : '';
  const [attending, setAttending] = useState<boolean | null>(null);
  const [numGuests, setNumGuests] = useState(1);
  const [meal, setMeal] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (attending === null) return;
    updateRSVP(guestName || 'Guest', attending ? 'attending' : 'not_attending', numGuests, meal, note);
    setSubmitted(true);
    if (attending) {
      confetti({
        particleCount: 100, spread: 80, origin: { y: 0.4 },
        colors: ['#D4A76A', '#E8C8A0', '#F4C2C2', '#C9A96E'],
      });
    }
  };

  if (submitted) {
    return (
      <motion.section
        className="py-14 sm:py-20 px-5 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="luxury-card rounded-3xl p-8 max-w-md mx-auto"
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={spring}
        >
          <div className="text-4xl mb-3">🎉</div>
          <h2 className={`text-xl font-bold text-foreground ${fontClass}`}>{t('rsvp.success')}</h2>
        </motion.div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="py-14 sm:py-20 px-5"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={spring}
    >
      <div className="max-w-md mx-auto text-center">
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}>
          {t('rsvp.title')}
        </h2>
        <div className="section-divider mb-8" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2.5">
            <motion.button
              type="button"
              onClick={() => setAttending(true)}
              className={`w-full p-4 rounded-2xl transition-all ${attending === true ? 'luxury-card ring-2 ring-gold shadow-luxury scale-[1.01]' : 'glass-card hover:shadow-surface'}`}
              whileTap={{ scale: 0.98 }}
            >
              <span className={`text-base ${fontClass}`}>✅ {t('rsvp.attending')}</span>
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setAttending(false)}
              className={`w-full p-4 rounded-2xl transition-all ${attending === false ? 'luxury-card ring-2 ring-gold shadow-luxury scale-[1.01]' : 'glass-card hover:shadow-surface'}`}
              whileTap={{ scale: 0.98 }}
            >
              <span className={`text-base ${fontClass}`}>😔 {t('rsvp.not_attending')}</span>
            </motion.button>
          </div>

          {attending && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
              <div className="space-y-3 text-left">
                <div>
                  <label className={`block text-xs text-muted-foreground mb-1.5 ${fontClass}`}>{t('rsvp.guests')}</label>
                  <select value={numGuests} onChange={e => setNumGuests(Number(e.target.value))}
                    className="w-full min-h-[44px] rounded-xl border border-border bg-ivory/80 backdrop-blur-sm px-4 text-foreground focus:ring-2 focus:ring-gold">
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs text-muted-foreground mb-1.5 ${fontClass}`}>Meal preference</label>
                  <select value={meal} onChange={e => setMeal(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-border bg-ivory/80 backdrop-blur-sm px-4 text-foreground focus:ring-2 focus:ring-gold">
                    <option value="">No preference</option>
                    <option value="meat">🍖 Meat</option>
                    <option value="seafood">🦐 Seafood</option>
                    <option value="vegetarian">🥗 Vegetarian</option>
                    <option value="vegan">🌱 Vegan</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs text-muted-foreground mb-1.5 ${fontClass}`}>Note for the couple (optional)</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} maxLength={300}
                    className="w-full rounded-xl border border-border bg-ivory/80 backdrop-blur-sm px-4 py-2 text-foreground focus:ring-2 focus:ring-gold" />
                </div>
              </div>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={attending === null}
            className={`w-full rounded-full min-h-[44px] px-6 py-2.5 text-sm shadow-luxury disabled:opacity-50 ${fontClass}`}
            style={{ background: 'linear-gradient(135deg, hsl(38 55% 58%), hsl(38 60% 48%))', color: 'white' }}
            whileHover={{ scale: attending !== null ? 1.02 : 1 }}
            whileTap={{ scale: 0.97 }}
          >
            {t('rsvp.submit')}
          </motion.button>
        </form>
      </div>
    </motion.section>
  );
}
