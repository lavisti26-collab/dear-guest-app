import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { toast } from 'sonner';

const spring = { type: "spring" as const, duration: 0.8, bounce: 0.08 };

interface WishesSectionProps {
  guestName?: string;
}

export default function WishesSection({ guestName }: WishesSectionProps) {
  const { t, lang } = useLanguage();
  const { wishes, addWish } = useWeddingData();
  const fontClass = lang === 'km' ? 'font-khmer' : '';
  const [name, setName] = useState(guestName || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (guestName && !name) {
      setName(guestName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    addWish(name.trim(), message.trim());
    // Keep name prefilled with guestName if available, otherwise clear it
    setName(guestName || '');
    setMessage('');
    toast.success('💌 Wish sent!');
  };

  return (
    <motion.section
      id="wishes"
      className="py-14 sm:py-20 px-5 bg-champagne/30"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={spring}
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}>
          {t('wishes.title')}
        </h2>
        <div className="section-divider mb-8" />

        <form onSubmit={handleSubmit} className="mb-8 space-y-3 max-w-md mx-auto">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('wishes.name')}
            maxLength={100}
            className={`w-full min-h-[44px] rounded-xl bg-ivory/80 backdrop-blur-sm gold-border px-4 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-gold text-sm ${fontClass}`}
          />
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={t('wishes.placeholder')}
            maxLength={500}
            rows={3}
            className={`w-full rounded-xl bg-ivory/80 backdrop-blur-sm gold-border px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-gold resize-none text-sm ${fontClass}`}
          />
          <motion.button
            type="submit"
            className={`rounded-full min-h-[44px] px-6 py-2.5 text-sm shadow-luxury ${fontClass}`}
            style={{ background: 'linear-gradient(135deg, hsl(38 55% 58%), hsl(38 60% 48%))', color: 'white' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            💌 {t('wishes.send')}
          </motion.button>
        </form>

        <div className="max-h-[52vh] overflow-y-auto space-y-3 pr-1">
          <div className="grid gap-3 sm:grid-cols-2">
            {wishes.length === 0 ? (
              <div className="luxury-card rounded-2xl p-4 text-left col-span-full">
                <p className={`text-foreground text-sm leading-relaxed ${fontClass}`}>
                  {lang === 'km' ? 'មិនទាន់មានពាក្យជូនពរទេ។' : 'No wishes yet.'}
                </p>
              </div>
            ) : (
              wishes.map((w, i) => (
                <motion.div
                  key={w.id}
                  className="luxury-card rounded-2xl p-4 text-left"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: i * 0.08 }}
                >
                  <p className={`text-foreground text-sm mb-2.5 leading-relaxed ${fontClass}`}>
                    "{w.message}"
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gold-light/40 flex items-center justify-center text-xs font-display font-bold text-foreground">
                      {w.guestName ? w.guestName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <p className={`text-xs text-muted-foreground ${fontClass}`}>{w.guestName || 'Anonymous'}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
