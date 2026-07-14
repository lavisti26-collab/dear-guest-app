import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';

const spring = { type: 'spring' as const, duration: 0.6, bounce: 0.12 };
const springFast = { type: 'spring' as const, duration: 0.4, bounce: 0.08 };

interface Props { guestName: string; }

const mealOptions = [
  { value: '', label: 'No preference', labelKm: 'គ្មានចំណូលចិត្ត', icon: '🍽️' },
  { value: 'meat', label: 'Meat', labelKm: 'សាច់', icon: '🍖' },
  { value: 'seafood', label: 'Seafood', labelKm: 'អាហារសមុទ្រ', icon: '🦐' },
  { value: 'vegetarian', label: 'Vegetarian', labelKm: 'បន្លែ', icon: '🥗' },
  { value: 'vegan', label: 'Vegan', labelKm: 'ម្ហូបបន្លែ', icon: '🌱' },
];

function FloatingInput({
  label, value, onChange, type = 'text', maxLength, rows,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; maxLength?: number; rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;
  const Tag = rows ? 'textarea' : 'input';

  return (
    <div className="relative">
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
          isActive
            ? 'top-2 text-[10px] font-semibold text-accent tracking-wider uppercase'
            : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground'
        }`}
      >
        {label}
      </label>
      <Tag
        // @ts-ignore
        type={type}
        value={value}
        maxLength={maxLength}
        rows={rows}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-white/70 backdrop-blur-sm border rounded-2xl px-4 text-foreground text-sm outline-none transition-all duration-200 ${
          rows ? 'pt-6 pb-3' : 'pt-6 pb-2 min-h-[56px]'
        } ${focused ? 'border-accent/70 shadow-[0_0_0_3px_hsl(var(--accent)/0.12)]' : 'border-border/50 hover:border-accent/40'}`}
      />
      {maxLength && (
        <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/50">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

export default function RSVPSection({ guestName }: Props) {
  const { t, lang } = useLanguage();
  const { updateRSVP } = useWeddingData();
  const [searchParams] = useSearchParams();
  const guestId = searchParams.get('id') || undefined;
  const fontClass = lang === 'km' ? 'font-khmer' : '';
  const [attending, setAttending] = useState<boolean | null>(null);
  const [numGuests, setNumGuests] = useState(1);
  const [meal, setMeal] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attending === null || loading) return;
    setLoading(true);
    try {
      await updateRSVP(guestName || 'Guest', attending ? 'attending' : 'not_attending', numGuests, meal, note, guestId);
      setSubmitted(true);
      if (attending) {
        // multi-burst confetti
        const fire = (particleRatio: number, opts: confetti.Options) =>
          confetti({ origin: { y: 0.4 }, ...opts, particleCount: Math.floor(150 * particleRatio) });
        fire(0.25, { spread: 26, startVelocity: 55, colors: ['#D4AF37', '#F4C2C2'] });
        fire(0.2,  { spread: 60, colors: ['#C9A96E', '#E8C8A0'] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#FFD700', '#FFC0CB', '#fff'] });
        fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#D4AF37'] });
        fire(0.1,  { spread: 120, startVelocity: 45, colors: ['#F4C2C2', '#DDA0DD'] });
      }
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ─────────────────────────────────────── */
  if (submitted) {
    return (
      <motion.section
        id="rsvp"
        className="py-16 sm:py-24 px-5 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="max-w-sm mx-auto"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={spring}
        >
          {/* Animated ring */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-accent/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-accent/20"
              animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.4, delay: 0.4, ease: 'easeInOut' }}
            />
            <div className="relative z-10 w-full h-full rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border border-accent/30">
              <motion.span
                className="text-4xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...spring, delay: 0.2 }}
              >
                {attending ? '💍' : '🙏'}
              </motion.span>
            </div>
          </div>

          <motion.h2
            className={`text-2xl font-bold text-foreground mb-2 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {t('rsvp.success')}
          </motion.h2>
          <motion.p
            className={`text-sm text-muted-foreground mt-2 ${fontClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {attending
              ? (lang === 'km' ? 'យើងរង់ចាំជួបអ្នកនៅថ្ងៃនោះ! 🎊' : "We can't wait to celebrate with you! 🎊")
              : (lang === 'km' ? 'សូមអរគុណ។ លើកក្រោយ! 💙' : 'We understand. We appreciate your response! 💙')
            }
          </motion.p>

          {attending && (
            <motion.div
              className="mt-6 flex flex-wrap justify-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { icon: '👥', label: `${numGuests} ${numGuests > 1 ? 'guests' : 'guest'}` },
                ...(meal ? [{ icon: mealOptions.find(m => m.value === meal)?.icon || '🍽️', label: mealOptions.find(m => m.value === meal)?.label || meal }] : []),
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-full px-3 py-1.5 text-xs font-medium text-foreground">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.section>
    );
  }

  /* ── Main RSVP form ──────────────────────────────────────── */
  return (
    <motion.section
      id="rsvp"
      className="py-16 sm:py-24 px-4 sm:px-5 relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={spring}
    >
      <div className="max-w-lg mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}>
            {t('rsvp.title')}
          </h2>
          <div className="section-divider mb-4" />
          <p className={`text-sm text-muted-foreground ${fontClass}`}>
            {lang === 'km'
              ? 'សូមបញ្ជាក់ការចូលរួមរបស់អ្នកតាមរយៈទម្រង់ខាងក្រោម'
              : 'Kindly confirm your attendance by filling out the form below'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Attendance cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: true,
                icon: '🎊',
                label: t('rsvp.attending'),
                labelKm: 'បាទ/ចាស ខ្ញុំនឹងចូលរួម',
                gradient: 'from-emerald-50 to-green-50',
                border: 'border-emerald-400',
                check: 'text-emerald-600',
                ring: 'ring-emerald-300/50',
              },
              {
                value: false,
                icon: '🙏',
                label: t('rsvp.not_attending'),
                labelKm: 'សូមទោស មិនអាចចូលរួម',
                gradient: 'from-rose-50 to-pink-50',
                border: 'border-rose-300',
                check: 'text-rose-500',
                ring: 'ring-rose-200/50',
              },
            ].map(({ value, icon, label, labelKm, gradient, border, check, ring }) => {
              const isSelected = attending === value;
              return (
                <motion.button
                  key={String(value)}
                  type="button"
                  onClick={() => setAttending(value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative p-5 rounded-3xl border-2 text-center transition-all duration-300 overflow-hidden ${
                    isSelected
                      ? `bg-gradient-to-br ${gradient} ${border} shadow-lg ring-4 ${ring} scale-[1.02]`
                      : 'bg-white/60 border-border/40 hover:border-border hover:bg-white/80'
                  }`}
                >
                  {/* Selected checkmark */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center ${check} bg-white shadow-sm`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={springFast}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="text-3xl mb-2">{icon}</div>
                  <p className={`text-xs font-semibold leading-snug text-foreground ${fontClass}`}>
                    {lang === 'km' ? labelKm : label}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Expanded fields for attending */}
          <AnimatePresence>
            {attending === true && (
              <motion.div
                key="attend-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-1">
                  {/* Guest counter */}
                  <div className="bg-white/70 border border-border/50 rounded-2xl p-4">
                    <p className={`text-xs font-semibold text-muted-foreground uppercase mb-3 ${lang === 'km' ? 'font-khmer tracking-normal' : 'tracking-wider'}`}>
                      {t('rsvp.guests')}
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <motion.button
                            key={n}
                            type="button"
                            onClick={() => setNumGuests(n)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-9 h-9 rounded-full text-sm font-bold transition-all duration-200 flex items-center justify-center ${
                              numGuests === n
                                ? 'bg-accent text-accent-foreground shadow-md scale-110'
                                : 'bg-muted/50 text-muted-foreground hover:bg-accent/20 hover:text-accent'
                            }`}
                          >
                            {n}
                          </motion.button>
                        ))}
                      </div>
                      <span className={`text-xs text-muted-foreground ${fontClass}`}>
                        {lang === 'km' ? `${numGuests} នាក់` : `${numGuests} ${numGuests > 1 ? 'people' : 'person'}`}
                      </span>
                    </div>
                  </div>

                  {/* Meal preference - icon grid */}
                  <div className="bg-white/70 border border-border/50 rounded-2xl p-4">
                    <p className={`text-xs font-semibold text-muted-foreground uppercase mb-3 ${lang === 'km' ? 'font-khmer tracking-normal' : 'tracking-wider'}`}>
                      {lang === 'km' ? 'ចំណូលចិត្តម្ហូប' : 'Meal Preference'}
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {mealOptions.map((opt) => {
                        const isSelected = meal === opt.value;
                        return (
                          <motion.button
                            key={opt.value}
                            type="button"
                            onClick={() => setMeal(opt.value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 text-center ${
                              isSelected
                                ? 'bg-accent/15 border-accent/50 shadow-sm'
                                : 'bg-white/50 border-border/30 hover:border-accent/30 hover:bg-accent/5'
                            }`}
                          >
                            <span className="text-xl">{opt.icon}</span>
                            <span className={`text-[9px] font-semibold leading-tight ${isSelected ? 'text-accent' : 'text-muted-foreground'}`}>
                              {lang === 'km' ? opt.labelKm : opt.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Note */}
                  <FloatingInput
                    label={lang === 'km' ? 'ចំណាំ (ស្រេចចិត្ត)' : 'Note for the couple (optional)'}
                    value={note}
                    onChange={setNote}
                    maxLength={280}
                    rows={3}
                  />
                </div>
              </motion.div>
            )}

            {attending === false && (
              <motion.div
                key="decline-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-1">
                  <FloatingInput
                    label={lang === 'km' ? 'ជូនចំពោះគូស្នេហ៍ (ស្រេចចិត្ត)' : 'Leave a kind message (optional)'}
                    value={note}
                    onChange={setNote}
                    maxLength={200}
                    rows={3}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={attending === null || loading}
            whileHover={attending !== null ? { scale: 1.02, y: -1 } : {}}
            whileTap={attending !== null ? { scale: 0.97 } : {}}
            className={`relative w-full rounded-2xl py-4 px-6 font-semibold text-sm overflow-hidden transition-all duration-300 ${
              lang === 'km' ? 'font-khmer tracking-normal' : 'tracking-wide'
            } ${
              attending !== null
                ? 'shadow-[0_8px_32px_hsl(38_55%_58%/0.4)] cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}
            style={{
              background: attending !== null
                ? 'linear-gradient(135deg, hsl(38 60% 52%), hsl(40 70% 42%))'
                : 'hsl(var(--muted))',
              color: 'white',
            }}
          >
            {/* Shimmer */}
            {attending !== null && (
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full"
                animate={{ x: ['−100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <motion.span
                    className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  />
                  {lang === 'km' ? 'កំពុងផ្ញើ...' : 'Sending...'}
                </>
              ) : (
                <>
                  <span>{attending === true ? '💍' : attending === false ? '🙏' : '💌'}</span>
                  {t('rsvp.submit')}
                </>
              )}
            </span>
          </motion.button>

          {/* Privacy note */}
          <p className="text-center text-[11px] text-muted-foreground/60">
            {lang === 'km'
              ? 'ការឆ្លើយតបរបស់អ្នកនឹងត្រូវបញ្ជូនដល់គូស្នេហ៍ដោយផ្ទាល់'
              : 'Your response goes directly to the couple'}
          </p>
        </form>
      </div>
    </motion.section>
  );
}
