import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { toast } from 'sonner';
import MapSection from '@/components/wedding/MapSection';

const normalizeGuestName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '');

const printReveal = {
  hidden: { opacity: 0, y: 15 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: custom * 0.15, ease: 'easeOut' }
  })
};

export default function NewspaperEditorialLayout({ initialGuestName }: { initialGuestName?: string }) {
  const { lang } = useLanguage();
  const { settings, updateRSVP, guests, wishes, photos, programSchedule, bankName, bankAccount, bankQR, giftEnabled } = useWeddingData();
  const [searchParams] = useSearchParams();

  // Find guest ID dynamically from context using the initialGuestName prop
  const dbGuest = initialGuestName ? guests.find(g => normalizeGuestName(g.name) === normalizeGuestName(initialGuestName)) : null;
  const guestId = dbGuest?.id || searchParams.get('id') || undefined;

  // Form State
  const [guestNameInput, setGuestNameInput] = useState(initialGuestName || '');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [numGuests, setNumGuests] = useState(1);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync initial guest name
  useEffect(() => {
    if (initialGuestName) {
      setGuestNameInput(initialGuestName);
    }
  }, [initialGuestName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attending === null || loading) return;
    setLoading(true);
    try {
      await updateRSVP(guestNameInput || 'Guest', attending ? 'attending' : 'not_attending', numGuests, '', note, guestId);
      setSubmitted(true);
      toast.success(lang === 'km' ? 'បានបញ្ជូនសន្លឹកឆ្លើយតបរួចរាល់!' : 'RSVP coupon submitted successfully!');
    } catch (err) {
      toast.error(lang === 'km' ? 'មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្ដងទៀត។' : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determine main headline picture (Hero Image or first photo)
  const leadPhotoUrl = settings?.heroImage || (photos && photos.length > 0 ? photos[0].url : null);
  
  // Filter out the lead photo from the rest of the gallery to avoid duplication
  const galleryPhotos = photos ? photos.filter(p => p.url !== leadPhotoUrl) : [];

  return (
    <div className="newspaper-editorial-layout min-h-screen bg-[#F5F2E9] text-[#1a1a1a] px-3 py-6 sm:py-12 sm:px-6 md:px-12 selection:bg-[#8B1E1E] selection:text-white antialiased">
      <div 
        className="max-w-5xl mx-auto border-2 border-neutral-900 p-4 sm:p-8 bg-[#F5F2E9] shadow-none"
        style={{ fontFamily: 'var(--font-body), Georgia, serif' }}
      >
        
        {/* ── Broadsheet Header / Masthead ── */}
        <motion.header 
          custom={0}
          initial="hidden"
          animate="visible"
          variants={printReveal}
          className="border-t-2 border-b-2 border-neutral-900 py-6 text-center select-none"
        >
          {/* Top small info row */}
          <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold text-neutral-500 mb-2 border-b border-neutral-300 pb-2 px-1">
            <span>{lang === 'km' ? 'អាកាសធាតុ៖ មនោសញ្ចេតនាផ្អែមល្ហែម ១០០%' : 'FORECAST: SUNNY HEARTS & CELEBRATION'}</span>
            <span>{lang === 'km' ? 'ច្បាប់ពិសេសគម្រប់ ២០២៦' : 'ESTABLISHED 2026'}</span>
          </div>

          {/* Main Paper Title */}
          <div className="border-b-4 border-double border-neutral-900 pb-1 mb-1">
            <h1 
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-neutral-950 uppercase py-2 leading-none" 
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {lang === 'km' ? 'សេចក្តីប្រកាសអាពាហ៍ពិពាហ៍' : 'THE WEDDING CHRONICLE'}
            </h1>
          </div>

          {/* Subheader banner */}
          <div className="py-2 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-neutral-700 px-2 gap-1.5">
            <span>{lang === 'km' ? 'លេខពិសេស ០០១' : 'ISSUE NO. 001'}</span>
            <span className="font-bold text-[#8B1E1E]">
              {lang === 'km' ? settings?.coupleNamesKm || 'កូនប្រុស & កូនស្រី' : settings?.coupleNames || 'GROOM & BRIDE'}
            </span>
            <span>{lang === 'km' ? 'ច្បាប់ជូនដោយឥតគិតថ្លៃ' : 'PRICE: COMPLIMENTARY'}</span>
          </div>
        </motion.header>

        {/* ── Guest copy byline ── */}
        <motion.div 
          custom={1}
          initial="hidden"
          animate="visible"
          variants={printReveal}
          className="border-b-2 border-neutral-900 py-3 text-center my-4 select-none"
        >
          <span className="font-serif italic text-sm sm:text-base text-neutral-800">
            {lang === 'km' 
              ? `ច្បាប់ពិសេសជូនចំពោះ៖ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ${guestNameInput || 'ភ្ញៀវកិត្តិយស'}`
              : `Special copy delivered to: ${guestNameInput || 'Honored Guest'}`}
          </span>
        </motion.div>

        {/* ── Main broadsheet content grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start my-6">
          
          {/* Left Column: Lead Story & Portrait */}
          <motion.div 
            custom={2}
            initial="hidden"
            animate="visible"
            variants={printReveal}
            className="md:col-span-2 space-y-6"
          >
            <article className="prose max-w-none text-neutral-950 font-serif">
              <h2 
                className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 border-b border-neutral-300 pb-2 mb-4" 
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                {lang === 'km' 
                  ? settings?.greetingTitleKm || 'សេចក្តីប្រកាសរៀបអាពាហ៍ពិពាហ៍ផ្លូវការ' 
                  : settings?.greetingTitleEn || 'OFFICIAL ANNOUNCEMENT OF HOLY MATRIMONY'}
              </h2>
              
              <p 
                className="leading-relaxed text-justify text-sm sm:text-base first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-[#8B1E1E]"
                style={{ fontFamily: 'var(--font-body), Georgia, serif' }}
              >
                {lang === 'km'
                  ? settings?.weddingDescriptionKm || 'យើងខ្ញុំមានកិត្តិយសសូមជម្រាបជូនដំណឹងដល់...'
                  : settings?.weddingDescription || 'With joyful hearts, we request the honor of your presence...'}
              </p>
            </article>

            {/* Main Portrait Picture with sepia/newsprint print effect */}
            {leadPhotoUrl && (
              <div className="border border-neutral-900 p-2 bg-white mt-8 shadow-none select-none">
                <img 
                  src={leadPhotoUrl} 
                  alt="Couple Featured" 
                  className="w-full grayscale contrast-[1.1] brightness-[0.98] sepia-[0.12] filter"
                />
                <div className="mt-2 text-center border-t border-neutral-200 pt-2">
                  <p className="text-xs font-serif italic text-neutral-700">
                    {lang === 'km' ? 'រូបថតអនុស្សាវរីយ៍គូស្វាមីភរិយាថ្មី' : 'Featured Portrait of the Bride and Groom.'}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column: Sidebar Details Box */}
          <motion.div 
            custom={3}
            initial="hidden"
            animate="visible"
            variants={printReveal}
            className="border border-neutral-900 p-6 bg-white relative shadow-none md:border-l md:border-t"
          >
            <div className="absolute top-1.5 right-3.5 text-[9px] font-bold font-mono text-neutral-400 select-none tracking-widest">BULLETIN</div>
            <h3 
              className="text-lg font-bold tracking-tight text-neutral-950 border-b-2 border-neutral-900 pb-2 mb-4 uppercase" 
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {lang === 'km' ? settings?.detailsTitleKm || 'ព័ត៌មានកម្មវិធី' : settings?.detailsTitleEn || 'SCHEDULE & VENUE'}
            </h3>
            
            <div className="space-y-4 font-serif text-xs sm:text-sm">
              <div className="border-b border-neutral-200 pb-3">
                <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1">{lang === 'km' ? 'កាលបរិច្ឆេទ' : 'DATE'}</div>
                <p className="font-semibold text-neutral-950" style={{ fontFamily: 'var(--font-body), Georgia, serif' }}>
                  {lang === 'km' ? settings?.weddingDateKm : settings?.weddingDate}
                </p>
              </div>

              <div className="border-b border-neutral-200 pb-3">
                <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1">{lang === 'km' ? 'ពេលវេលា' : 'TIME'}</div>
                <p className="font-semibold text-neutral-950" style={{ fontFamily: 'var(--font-body), Georgia, serif' }}>
                  {lang === 'km' ? settings?.weddingTimeKm : settings?.weddingTime}
                </p>
              </div>

              <div className="pb-1">
                <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1">{lang === 'km' ? 'ទីកន្លែង' : 'VENUE'}</div>
                <p className="font-semibold text-neutral-950" style={{ fontFamily: 'var(--font-body), Georgia, serif' }}>
                  {lang === 'km' ? settings?.venueNameKm : settings?.venueName}
                </p>
                <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed text-justify" style={{ fontFamily: 'var(--font-body), Georgia, serif' }}>
                  {lang === 'km' ? settings?.venueAddressKm : settings?.venueAddress}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Detailed Timeline Section ── */}
        {programSchedule && programSchedule.length > 0 && (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={printReveal}
            className="border-t-2 border-neutral-900 pt-8 mt-12"
          >
            <h2 
              className="text-2xl sm:text-3xl font-serif font-black uppercase text-center tracking-tight mb-8" 
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {lang === 'km' ? settings?.timelineTitleKm || 'កម្មវិធីលម្អិត' : settings?.timelineTitleEn || 'ORDER OF CEREMONIES'}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programSchedule.map((item, idx) => (
                <div key={item.id || idx} className="border border-neutral-900 p-4 bg-white relative rounded-none shadow-none">
                  <div className="absolute top-2 right-2 text-[10px] font-mono text-neutral-400 select-none">#{idx + 1}</div>
                  <span className="font-mono text-xs uppercase font-bold text-neutral-500 block mb-1">
                    {lang === 'km' ? item.timeKm || item.time : item.time}
                  </span>
                  <h4 
                    className="font-serif font-bold text-base text-neutral-950 mb-1" 
                    style={{ fontFamily: 'var(--font-body), Georgia, serif' }}
                  >
                    {lang === 'km' ? item.titleKm || item.title : item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs font-serif text-neutral-600 leading-relaxed mt-1 text-justify" style={{ fontFamily: 'var(--font-body), Georgia, serif' }}>
                      {lang === 'km' ? item.descriptionKm || item.description : item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Photo Gallery Section ── */}
        {galleryPhotos && galleryPhotos.length > 0 && (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={printReveal}
            className="border-t-2 border-neutral-900 pt-8 mt-12"
          >
            <h2 
              className="text-2xl sm:text-3xl font-serif font-black uppercase text-center tracking-tight mb-8" 
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {lang === 'km' ? settings?.galleryTitleKm || 'រូបភាពអនុស្សាវរីយ៍' : settings?.galleryTitleEn || 'CAPTURED IMAGES'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryPhotos.map((photo, idx) => (
                <div key={photo.id || idx} className="border border-neutral-900 p-2 bg-white rounded-none shadow-none select-none">
                  <img 
                    src={photo.url} 
                    alt={`Gallery ${idx}`} 
                    className="w-full h-64 object-cover grayscale contrast-[1.1] brightness-[0.98] sepia-[0.12] filter"
                  />
                  <div className="mt-2 text-center border-t border-neutral-200 pt-2">
                    <p className="text-xs font-serif italic text-neutral-600">
                      {photo.caption || (lang === 'km' ? `រូបថតទី ${idx + 1}` : `Photo ${idx + 1}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Map / Venue Section ── */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={printReveal}
          className="border-t-2 border-neutral-900 pt-8 mt-12"
        >
          <h2 
            className="text-2xl sm:text-3xl font-serif font-black uppercase text-center tracking-tight mb-8" 
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            {lang === 'km' ? 'ផែនទីណែនាំផ្លូវ' : 'LOCATION MAP GUIDE'}
          </h2>
          <div className="border border-neutral-900 p-2 bg-white rounded-none shadow-none">
            <MapSection />
          </div>
        </motion.div>

        {/* ── Gift / Financial Contribution Registry Section ── */}
        {giftEnabled && (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={printReveal}
            className="border-t-2 border-neutral-900 pt-8 mt-12 max-w-xl mx-auto"
          >
            <h2 
              className="text-2xl sm:text-3xl font-serif font-black uppercase text-center tracking-tight mb-8" 
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {lang === 'km' ? settings?.giftTitleKm || 'មជ្ឈមណ្ឌលអំណោយ និងគ្រឿងបរិក្ខារ' : settings?.giftTitleEn || 'REGISTRY & CONTRIBUTIONS'}
            </h2>
            
            <div className="border border-neutral-900 p-6 bg-white flex flex-col sm:flex-row items-center gap-6 rounded-none shadow-none">
              {bankQR && (
                <div className="w-44 h-44 border border-neutral-900 p-1 flex-shrink-0 bg-white select-none">
                  <img src={bankQR} alt="QR Code" className="w-full h-full object-contain grayscale contrast-[1.1] sepia-[0.12] filter" />
                </div>
              )}
              <div className="space-y-3 font-serif text-xs sm:text-sm flex-1">
                <div className="border-b border-neutral-200 pb-2">
                  <div className="text-[10px] uppercase font-bold text-neutral-500">{lang === 'km' ? 'ឈ្មោះធនាគារ' : 'BANK NAME'}</div>
                  <p className="font-bold text-neutral-950">{bankName || 'ABA Bank'}</p>
                </div>
                <div className="border-b border-neutral-200 pb-2">
                  <div className="text-[10px] uppercase font-bold text-neutral-500">{lang === 'km' ? 'លេខគណនី' : 'ACCOUNT NUMBER'}</div>
                  <p className="font-mono font-bold text-neutral-950">{bankAccount}</p>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed italic text-justify">
                  {lang === 'km' 
                    ? 'ការចូលរួមផ្តល់ជាអំណោយ ឬពរជ័យរបស់អ្នកជាមោទនភាពដ៏ធំធេងសម្រាប់យើងខ្ញុំ។'
                    : 'Your support and well-wishes are greatly appreciated by the family.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Wishes Section (Letters to the Editor) ── */}
        {wishes && wishes.length > 0 && (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={printReveal}
            className="border-t-2 border-neutral-900 pt-8 mt-12"
          >
            <h2 
              className="text-2xl sm:text-3xl font-serif font-black uppercase text-center tracking-tight mb-8" 
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {lang === 'km' ? settings?.wishesTitleKm || 'លិខិតជូនពរពីមិត្តភក្តិ' : settings?.wishesTitleEn || 'LETTERS TO THE COUPLE'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wishes.slice(0, 10).map((wish, idx) => (
                <div key={wish.id || idx} className="border border-neutral-300 p-4 bg-white font-serif text-xs sm:text-sm rounded-none shadow-none">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2">
                    <span className="font-bold text-neutral-950">{wish.name}</span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(wish.created_at || Date.now()).toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US')}
                    </span>
                  </div>
                  <p className="text-neutral-700 italic leading-relaxed text-justify">"{wish.wish_message}"</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── RSVP coupon classified block ── */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={printReveal}
          className="border-2 border-dashed border-neutral-900 p-6 sm:p-8 bg-white my-12 max-w-lg mx-auto rounded-none shadow-none"
        >
          <div className="absolute -top-3 left-4 bg-[#F5F2E9] px-2 text-[10px] uppercase font-mono tracking-wider text-neutral-500 select-none">
            ✂️ {lang === 'km' ? 'កាត់តាមចំនុចនេះ' : 'CLIP HERE'}
          </div>
          
          <h2 
            className="text-xl sm:text-2xl font-serif font-black uppercase text-center text-neutral-900 mb-2" 
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            {lang === 'km' ? settings?.rsvpTitleKm || 'សន្លឹកឆ្លើយតបការអញ្ជើញ' : settings?.rsvpTitleEn || 'RSVP RESPONSE COUPON'}
          </h2>
          <p className="text-[11px] font-serif text-center text-neutral-600 mb-6 leading-relaxed">
            {lang === 'km'
              ? 'សូមបំពេញសន្លឹកប័ណ្ណនេះ ដើម្បីចូលរួមផ្តល់ព័ត៌មានអំពីការអញ្ជើញរបស់អ្នក។'
              : 'Please complete and submit this coupon to inform us of your attendance.'}
          </p>

          {submitted ? (
            <div className="text-center py-8 border border-neutral-300 bg-neutral-50 font-serif select-none">
              <div className="text-3xl mb-2">📬</div>
              <h3 className="font-bold text-neutral-950 tracking-wider">{lang === 'km' ? 'បានផ្ញើជោគជ័យ!' : 'SUBMISSION RECEIVED!'}</h3>
              <p className="text-xs text-neutral-600 mt-1">
                {lang === 'km' ? 'សូមអរគុណសម្រាប់ការឆ្លើយតប។' : 'Thank you for your response.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-serif">
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-neutral-500 block">
                  {lang === 'km' ? 'ឈ្មោះភ្ញៀវ' : 'GUEST NAME'}
                </label>
                <input 
                  type="text" 
                  value={guestNameInput}
                  onChange={(e) => setGuestNameInput(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-neutral-900 p-2.5 outline-none font-serif text-sm focus:border-[#8B1E1E] rounded-none shadow-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-neutral-500 block">
                  {lang === 'km' ? 'វត្តមានរបស់អ្នក' : 'ATTENDANCE'}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAttending(true)}
                    className={`border p-2.5 font-bold text-xs uppercase tracking-wider rounded-none shadow-none transition-colors ${attending === true ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900'}`}
                  >
                    {lang === 'km' ? 'រីករាយនឹងចូលរួម' : 'WILL ATTEND'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttending(false)}
                    className={`border p-2.5 font-bold text-xs uppercase tracking-wider rounded-none shadow-none transition-colors ${attending === false ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900'}`}
                  >
                    {lang === 'km' ? 'សោកស្តាយមិនអាចចូលរួម' : 'DECLINE'}
                  </button>
                </div>
              </div>

              {attending === true && (
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-neutral-500 block">
                    {lang === 'km' ? 'ចំនួនអ្នកចូលរួម' : 'NUMBER OF GUESTS'}
                  </label>
                  <select
                    value={numGuests}
                    onChange={(e) => setNumGuests(Number(e.target.value))}
                    className="w-full bg-[#FAF9F6] border border-neutral-900 p-2.5 outline-none font-serif text-sm focus:border-[#8B1E1E] rounded-none shadow-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? (lang === 'km' ? 'នាក់' : 'Guest') : (lang === 'km' ? 'នាក់' : 'Guests')}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-neutral-500 block">
                  {lang === 'km' ? 'សារជូនពរ' : 'CONGRATULATORY NOTE'}
                </label>
                <textarea 
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={lang === 'km' ? 'សូមសរសេរសារជូនពររបស់អ្នកនៅទីនេះ...' : 'Enter your wishes here...'}
                  className="w-full bg-[#FAF9F6] border border-neutral-900 p-2.5 outline-none font-serif text-sm focus:border-[#8B1E1E] resize-none rounded-none shadow-none"
                />
              </div>

              <button
                type="submit"
                disabled={attending === null || loading}
                className="w-full bg-[#8B1E1E] hover:bg-[#7A1E1E] text-white p-3 text-xs uppercase tracking-widest font-bold disabled:opacity-50 transition-colors rounded-none shadow-none"
              >
                {loading ? (lang === 'km' ? 'កំពុងបញ្ជូន...' : 'SUBMITTING...') : (lang === 'km' ? 'បញ្ជូនសន្លឹកឆ្លើយតប' : 'SUBMIT COUPON')}
              </button>
            </form>
          )}
        </motion.div>

        {/* ── Footer / Editorial credits ── */}
        <footer className="border-t-2 border-neutral-900 pt-6 mt-8 text-center select-none font-serif">
          <div className="text-[9px] uppercase tracking-wider text-neutral-500 mb-2">
            {lang === 'km' ? 'រៀបរៀង និងបោះពុម្ពផ្សាយដោយ ក្រុមការងារ Lavisti' : 'PUBLISHED BY LAVISTI TEAM'}
          </div>
          <p className="text-[10px] text-neutral-600">
            © 2026 {lang === 'km' ? 'រក្សាសិទ្ធិគ្រប់យ៉ាង' : 'All rights reserved.'} • {lang === 'km' ? 'សូមអញ្ជើញមកដោយក្តីរីករាយ' : 'Thank you for reading.'}
          </p>
        </footer>

      </div>
    </div>
  );
}
