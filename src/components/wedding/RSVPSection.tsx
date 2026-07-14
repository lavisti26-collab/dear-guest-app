import React, { useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { toast } from 'sonner';

import { normalizeGuestName } from '@/pages/InvitationPage';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props { guestName: string; }

function FloatingInput({
  label, value, onChange, type = 'text', maxLength, rows, lang,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; maxLength?: number; rows?: number; lang: string;
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;
  const Tag = rows ? 'textarea' : 'input';

  return (
    <div className="relative">
      <label
        className="absolute left-4 transition-all duration-300 pointer-events-none z-10"
        style={{
          fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)',
          color: isActive ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground) / 0.7)',
          transform: isActive ? 'translateY(6px) scale(0.85)' : 'translateY(16px) scale(1)',
          transformOrigin: 'top left',
          fontSize: '14px',
          fontWeight: isActive ? '600' : '400',
        }}
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
        className={`w-full bg-white/40 backdrop-blur-md border rounded-2xl px-4 text-foreground outline-none transition-all duration-300 ${
          rows ? 'pt-7 pb-3 min-h-[96px]' : 'pt-6 pb-2 min-h-[58px]'
        }`}
        style={{
          fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)',
          fontSize: '15px',
          borderColor: focused ? 'hsl(var(--accent))' : 'hsl(var(--border) / 0.5)',
          boxShadow: focused ? '0 0 0 3px hsl(var(--accent) / 0.12)' : 'none',
        }}
      />
      {maxLength && (
        <span className="absolute bottom-2.5 right-3 text-[10px] text-muted-foreground/60">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

export default function RSVPSection({ guestName }: Props) {
  const { t, lang } = useLanguage();
  const { settings, updateRSVP, guests } = useWeddingData();
  const [searchParams] = useSearchParams();

  // Find guest ID dynamically from context using the guestName prop
  const dbGuest = guestName ? guests.find(g => normalizeGuestName(g.name) === normalizeGuestName(guestName)) : null;
  const guestId = dbGuest?.id || searchParams.get('id') || undefined;

  const [attending, setAttending] = useState<boolean | null>(null);
  const [numGuests, setNumGuests] = useState(1);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attending === null || loading) return;
    setLoading(true);
    try {
      await updateRSVP(guestName || 'Guest', attending ? 'attending' : 'not_attending', numGuests, '', note, guestId);
      // Only mark as submitted AFTER the DB write succeeds
      setSubmitted(true);
      if (attending) {
        const fire = (particleRatio: number, opts: confetti.Options) =>
          confetti({ origin: { y: 0.4 }, ...opts, particleCount: Math.floor(150 * particleRatio) });
        fire(0.25, { spread: 26, startVelocity: 55, colors: ['#e2b96a', '#ffffff'] });
        fire(0.2,  { spread: 60, colors: ['#c9932a', '#e8d5a8'] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#e2b96a', '#fff'] });
        fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#c9932a'] });
      }
    } catch (err) {
      toast.error(lang === 'km' ? 'មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្ដងទៀត។' : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      id="rsvp"
      className="py-12 sm:py-16 px-4 relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="max-w-lg mx-auto">

        {/* ── Virtual Premium RSVP Card ── */}
        <div
          className="relative p-6 sm:p-8 rounded-3xl border-2 border-double shadow-luxury bg-white/50 backdrop-blur-md overflow-hidden"
          style={{
            borderColor: 'hsl(var(--accent) / 0.5)',
            backgroundImage: 'radial-gradient(circle at 100% 150%, hsl(var(--accent)/0.03) 24%, transparent 24%), radial-gradient(circle at 0% 150%, hsl(var(--accent)/0.03) 24%, transparent 24%)',
          }}
        >
          {/* Traditional Khmer Corner Ornaments */}
          <div className="absolute top-2 left-2 text-[10px] text-accent/40 select-none">🔱</div>
          <div className="absolute top-2 right-2 text-[10px] text-accent/40 select-none">🔱</div>
          <div className="absolute bottom-2 left-2 text-[10px] text-accent/40 select-none">🔱</div>
          <div className="absolute bottom-2 right-2 text-[10px] text-accent/40 select-none">🔱</div>

          {/* Card Header */}
          <div className="text-center mb-8 pt-2">
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2 tracking-wide"
              style={{
                color: 'hsl(var(--foreground))',
                fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-display)',
              }}
            >
              {lang === 'km' ? (settings.rsvpTitleKm || t('rsvp.title')) : (settings.rsvpTitleEn || t('rsvp.title'))}
            </h2>
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px w-8 bg-accent/30" />
              <span className="text-accent text-[8px]">✦</span>
              <div className="h-px w-8 bg-accent/30" />
            </div>
            <p
              className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed"
              style={{ fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)' }}
            >
              {lang === 'km'
                ? 'សូមបញ្ជាក់ការចូលរួមរបស់អ្នកតាមរយៈទម្រង់ខាងក្រោម'
                : 'Kindly confirm your attendance by filling out the form below'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="text-center py-8"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                  <span className="text-2xl">{attending ? '💍' : '🙏'}</span>
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{
                    color: 'hsl(var(--foreground))',
                    fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-display)',
                  }}
                >
                  {t('rsvp.success')}
                </h3>
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  style={{ fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)' }}
                >
                  {attending
                    ? (lang === 'km' ? 'យើងរង់ចាំជួបអ្នកនៅថ្ងៃនោះ! 🎊' : "We can't wait to celebrate with you! 🎊")
                    : (lang === 'km' ? 'សូមអរគុណ។ លើកក្រោយ! 💙' : 'We understand. We appreciate your response! 💙')
                  }
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── Sliding Golden Pill Selector ── */}
                <div className="relative flex p-1 bg-black/5 rounded-2xl border border-border/30 max-w-sm mx-auto z-0">
                  
                  <div
                    className="absolute inset-y-1 rounded-xl border z-10 transition-all duration-300 ease-out"
                    style={{
                      left: attending === null ? '2.5%' : attending === true ? '2.5%' : '52.5%',
                      width: attending === null ? '95%' : '45%',
                      background: attending === null ? 'transparent' : 'linear-gradient(135deg, #FAF6EE 0%, #D4AF37 100%)',
                      borderColor: attending === null ? 'transparent' : 'rgba(255,255,255,0.2)',
                      boxShadow: attending === null ? 'none' : '0 4px 15px -2px hsl(var(--accent) / 0.3)',
                      opacity: attending === null ? 0 : 1,
                    }}
                  />

                  {/* Yes Option */}
                  <button
                    type="button"
                    onClick={() => setAttending(true)}
                    className="relative z-20 flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5"
                    style={{
                      fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)',
                      color: attending === true ? '#4E3606' : 'hsl(var(--foreground) / 0.65)',
                    }}
                  >
                    <span>💍</span>
                    <span>{lang === 'km' ? 'យល់ព្រមចូលរួម' : 'Will Attend'}</span>
                  </button>

                  {/* No Option */}
                  <button
                    type="button"
                    onClick={() => setAttending(false)}
                    className="relative z-20 flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5"
                    style={{
                      fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)',
                      color: attending === false ? '#4E3606' : 'hsl(var(--foreground) / 0.65)',
                    }}
                  >
                    <span>✉️</span>
                    <span>{lang === 'km' ? 'មិនអាចចូលរួម' : 'Regretfully Decline'}</span>
                  </button>
                </div>

                {/* Conditional Fields */}
                <AnimatePresence mode="wait">
                  {attending === true && (
                    <motion.div
                      key="attend-options"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="space-y-5 overflow-hidden pt-1"
                    >
                      {/* Guest Counter */}
                      <div className="bg-white/40 backdrop-blur-md border border-border/40 rounded-2xl p-4 sm:p-5">
                        <p
                          className="text-[11px] font-bold text-accent uppercase tracking-wider mb-3"
                          style={{ fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)' }}
                        >
                          {t('rsvp.guests')}
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <motion.button
                                key={n}
                                type="button"
                                onClick={() => setNumGuests(n)}
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.94 }}
                                className="w-9 h-9 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition-all duration-300 border"
                                style={{
                                  fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)',
                                  backgroundColor: numGuests === n ? 'hsl(var(--accent))' : 'rgba(255,255,255,0.4)',
                                  color: numGuests === n ? 'white' : 'hsl(var(--foreground))',
                                  borderColor: numGuests === n ? 'hsl(var(--accent))' : 'hsl(var(--border) / 0.5)',
                                  boxShadow: numGuests === n ? '0 4px 10px hsl(var(--accent) / 0.2)' : 'none',
                                }}
                              >
                                {n}
                              </motion.button>
                            ))}
                          </div>
                          <span
                            className="text-xs sm:text-sm font-bold text-foreground"
                            style={{ fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)' }}
                          >
                            {lang === 'km' ? `${numGuests} នាក់` : `${numGuests} ${numGuests > 1 ? 'people' : 'person'}`}
                          </span>
                        </div>
                      </div>

                      {/* Note */}
                      <FloatingInput
                        label={lang === 'km' ? 'ចំណាំផ្សេងៗ (ស្រេចចិត្ត)' : 'Special notes or allergies (optional)'}
                        value={note}
                        onChange={setNote}
                        maxLength={280}
                        rows={3}
                        lang={lang}
                      />
                    </motion.div>
                  )}

                  {attending === false && (
                    <motion.div
                      key="decline-options"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden pt-1"
                    >
                      <FloatingInput
                        label={lang === 'km' ? 'ជូនពរដល់គូស្រករ (ស្រេចចិត្ត)' : 'Send your warm wishes (optional)'}
                        value={note}
                        onChange={setNote}
                        maxLength={200}
                        rows={3}
                        lang={lang}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={attending === null || loading}
                  whileHover={attending !== null ? { scale: 1.01 } : {}}
                  whileTap={attending !== null ? { scale: 0.99 } : {}}
                  className="relative w-full rounded-2xl py-4 px-6 font-bold text-sm sm:text-base overflow-hidden transition-all duration-300 flex items-center justify-center gap-2 border shadow-md"
                  style={{
                    fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)',
                    backgroundColor: attending !== null ? 'hsl(var(--accent))' : 'hsl(var(--muted) / 0.5)',
                    color: attending !== null ? 'white' : 'hsl(var(--muted-foreground) / 0.6)',
                    borderColor: attending !== null ? 'hsl(var(--accent))' : 'hsl(var(--border) / 0.3)',
                    cursor: attending !== null && !loading ? 'pointer' : 'not-allowed',
                    boxShadow: attending !== null ? '0 6px 20px hsl(var(--accent) / 0.2)' : 'none',
                  }}
                >
                  {loading ? (
                    <>
                      <motion.span
                        className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      />
                      <span>{lang === 'km' ? 'កំពុងផ្ញើ...' : 'Sending...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{attending === true ? '💍' : attending === false ? '🙏' : '💌'}</span>
                      <span>{t('rsvp.submit')}</span>
                    </>
                  )}
                </motion.button>

                {/* Privacy Footer */}
                <p
                  className="text-center text-[10px] text-muted-foreground/60 pt-1"
                  style={{ fontFamily: lang === 'km' ? 'var(--font-khmer)' : 'var(--font-body)' }}
                >
                  {lang === 'km'
                    ? 'ការឆ្លើយតបរបស់អ្នកនឹងត្រូវបញ្ជូនទៅកាន់គូស្នេហ៍ដោយផ្ទាល់'
                    : 'Your response goes directly to the couple'}
                </p>
              </form>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.section>
  );
}
