/**
 * AppleProductLayout.tsx — ULTIMATE APPLE SPEC EDITION
 *
 * DESIGN: Styled like an Apple high-end product announcement page (MacBook Pro / iPhone Pro).
 * - Premium Apple product bar: sticky sub-navigation bar with couple's initials and a blue RSVP action button.
 * - Bold, cinematic text gradients: "Love. In a whole new light." or "The next chapter. Pro."
 * - "Tech Specs" Grid: custom specs panel representing wedding details (Date, Venue, Dress Code, Program, etc.)
 * - Apple-style product grid cards: frosted black/charcoal cards with clean neon-blue and white accents.
 * - Scoped CSS overrides to re-skin all sub-components into Apple's signature sleek dark product design.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';

import HeroSection from '@/components/wedding/hero/HeroSection';
import GreetingSection from '@/components/wedding/GreetingSection';
import DetailsSection from '@/components/wedding/DetailsSection';
import TimelineSection from '@/components/wedding/TimelineSection';
import GallerySection from '@/components/wedding/GallerySection';
import MapSection from '@/components/wedding/MapSection';
import RSVPSection from '@/components/wedding/RSVPSection';
import GiftSection from '@/components/wedding/GiftSection';
import WishesSection from '@/components/wedding/WishesSection';
import ContactSection from '@/components/wedding/ContactSection';

export default function AppleProductLayout({ initialGuestName }: { initialGuestName?: string }) {
  const { lang, t } = useLanguage();
  const { settings } = useWeddingData();
  const [scrolled, setScrolled] = useState(false);

  // Sync data-layout attribute for target styles
  useEffect(() => {
    document.documentElement.setAttribute('data-layout', 'apple-product');
    return () => document.documentElement.removeAttribute('data-layout');
  }, []);

  // Sticky sub-nav header observer
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToRSVP = () => {
    const el = document.getElementById('apple-rsvp');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const coupleNames = settings?.coupleNames || 'Groom & Bride';
  const weddingDate = settings?.weddingDate || '01.07.2026';
  const venueName = settings?.venueName || 'Grand Palace';

  return (
    <div className="apple-product-layout bg-black text-[#f5f5f7] min-h-screen font-sans tracking-tight antialiased">
      {/* Scoped CSS to skin nested content into Apple's signature sleek dark product design */}
      <style>{`
        [data-layout="apple-product"] {
          --ap-bg: #000000;
          --ap-card-bg: #161617;
          --ap-accent: #2997ff;
          --ap-text-primary: #f5f5f7;
          --ap-text-secondary: #86868b;
          --ap-border: #333336;
          background-color: var(--ap-bg);
          color: var(--ap-text-primary);
        }

        /* ── Re-skin standard layout cards into Apple gray blocks (excluding the Hero card) ── */
        [data-layout="apple-product"] :not(#hero) .card,
        [data-layout="apple-product"] :not(#hero) [class*="rounded-3xl"].p-6,
        [data-layout="apple-product"] :not(#hero) [class*="rounded-2xl"].p-6,
        [data-layout="apple-product"] :not(#hero) [class*="bg-white"],
        [data-layout="apple-product"] :not(#hero) [class*="bg-card"],
        [data-layout="apple-product"] :not(#hero) .luxury-card {
          background-color: var(--ap-card-bg) !important;
          border: 1px solid var(--ap-border) !important;
          color: var(--ap-text-primary) !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
          border-radius: 18px !important;
        }

        /* ── Hide duplicate headings and lines inside child sections to prevent clutter ── */
        [data-layout="apple-product"] #details h2,
        [data-layout="apple-product"] #details .section-divider,
        [data-layout="apple-product"] #timeline h2,
        [data-layout="apple-product"] #timeline .section-divider,
        [data-layout="apple-product"] #gallery h2,
        [data-layout="apple-product"] #gallery .section-divider,
        [data-layout="apple-product"] #rsvp h2,
        [data-layout="apple-product"] #rsvp .section-divider,
        [data-layout="apple-product"] #rsvp .max-w-lg > div > div:nth-child(5),
        [data-layout="apple-product"] #gift h2,
        [data-layout="apple-product"] #gift .section-divider,
        [data-layout="apple-product"] #wishes h2,
        [data-layout="apple-product"] #wishes .section-divider,
        [data-layout="apple-product"] #contact h2,
        [data-layout="apple-product"] #contact .section-divider {
          display: none !important;
        }

        /* ── Reduce section paddings to fit inside Apple layout sections ── */
        [data-layout="apple-product"] section {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* ── Text styling overrides ── */
        [data-layout="apple-product"] h2,
        [data-layout="apple-product"] h3,
        [data-layout="apple-product"] h4 {
          color: var(--ap-text-primary) !important;
        }

        [data-layout="apple-product"] p,
        [data-layout="apple-product"] span,
        [data-layout="apple-product"] label {
          color: var(--ap-text-primary) !important;
        }

        [data-layout="apple-product"] .text-muted-foreground {
          color: var(--ap-text-secondary) !important;
        }

        /* ── Timeline items ── */
        [data-layout="apple-product"] .timeline-box {
          background-color: rgba(22, 22, 23, 0.8) !important;
          border: 1px solid var(--ap-border) !important;
        }
        [data-layout="apple-product"] .timeline-middle span {
          background-color: var(--ap-bg) !important;
          border-color: var(--ap-accent) !important;
        }

        /* ── Form inputs ── */
        [data-layout="apple-product"] input,
        [data-layout="aple-product"] select,
        [data-layout="apple-product"] textarea {
          background-color: #2d2d30 !important;
          border-color: var(--ap-border) !important;
          color: #ffffff !important;
          border-radius: 12px !important;
        }

        /* ── Wish cards ── */
        [data-layout="apple-product"] [class*="wish-card"],
        [data-layout="apple-product"] .kt-wish-card {
          background-color: rgba(22, 22, 23, 0.7) !important;
          border: 1px solid var(--ap-border) !important;
          border-left: 3px solid var(--ap-accent) !important;
        }

        /* ── Apple blue button styling ── */
        [data-layout="apple-product"] button[type="submit"],
        [data-layout="apple-product"] .btn-primary {
          background: var(--ap-accent) !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          border: none !important;
          border-radius: 9999px !important;
          transition: all 0.2s ease !important;
        }
        [data-layout="apple-product"] button[type="submit"]:hover,
        [data-layout="apple-product"] .btn-primary:hover {
          background: #47a7ff !important;
          transform: scale(1.02);
        }
      `}</style>

      {/* ══ Apple Product Bar (Sticky Sub-nav) ═══════════════════════════════ */}
      <nav
        className={`sticky top-0 z-[45] w-full border-b transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-md border-zinc-800' : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <span className="text-[13px] font-bold text-white tracking-tight">
            {coupleNames}
          </span>
          <div className="flex items-center gap-6">
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              {weddingDate}
            </span>
            <button
              onClick={handleScrollToRSVP}
              className="bg-[#0071e3] hover:bg-[#147ce5] text-white text-[11px] font-medium px-3 py-1 rounded-full transition-all"
            >
              RSVP
            </button>
          </div>
        </div>
      </nav>

      {/* ══ Dramatic Slogan Header ═══════════════════════════════════════════ */}
      <header className="py-20 md:py-28 px-6 text-center max-w-4xl mx-auto">
        <span className="text-zinc-500 text-xs md:text-sm font-semibold tracking-widest uppercase">
          Introducing
        </span>
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mt-4 leading-none bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          {lang === 'km' ? 'ពិធីការមង្គលជាប្រវត្តិសាស្ត្រ' : 'The Next Chapter. Pro.'}
        </h1>
        <p className="text-lg md:text-2xl text-zinc-400 mt-6 max-w-xl mx-auto font-medium">
          {lang === 'km' ? 'ស្នេហាដ៏អស្ចារ្យ។ កាន់តែរលូន។ កាន់តែរឹងមាំ។' : 'Love. In a whole new light.'}
        </p>
      </header>

      {/* ══ Highlights Specs Panel (The Features Grid) ═══════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Spec */}
          <div className="bg-[#161617] rounded-3xl p-8 border border-zinc-800 flex flex-col justify-between min-h-[180px]">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Date & Time</span>
            <div>
              <p className="text-3xl font-extrabold text-white mt-4">{weddingDate}</p>
              <p className="text-[13px] text-zinc-500 mt-2 font-medium">
                {lang === 'km' ? 'កម្មវិធីពេញមួយថ្ងៃ' : 'Full Day Celebration'}
              </p>
            </div>
          </div>
          {/* Venue Spec */}
          <div className="bg-[#161617] rounded-3xl p-8 border border-zinc-800 flex flex-col justify-between min-h-[180px]">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Venue</span>
            <div>
              <p className="text-3xl font-extrabold text-white mt-4">{venueName}</p>
              <p className="text-[13px] text-zinc-500 mt-2 font-medium">
                {lang === 'km' ? 'ផែនទីធ្វើដំណើរលម្អិតខាងក្រោម' : 'Directions & maps included'}
              </p>
            </div>
          </div>
          {/* Dress Code Swatch Spec */}
          <div className="bg-[#161617] rounded-3xl p-8 border border-zinc-800 flex flex-col justify-between min-h-[180px]">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Dress Code</span>
            <div>
              <div className="flex gap-2.5 mt-4">
                <span className="w-8 h-8 rounded-full border border-white/20 bg-[#D4AF37]" title="Gold" />
                <span className="w-8 h-8 rounded-full border border-white/20 bg-[#800020]" title="Maroon" />
                <span className="w-8 h-8 rounded-full border border-white/20 bg-[#FAF0D7]" title="Cream" />
              </div>
              <p className="text-[13px] text-zinc-500 mt-3.5 font-medium">
                {lang === 'km' ? 'ពណ៌មាស ក្រហមទុំ ឬគ្រីម' : 'Gold, Burgundy, or Cream tone'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Content Sections ══════════════════════════════════════════════════ */}
      <main className="space-y-16 pb-32">
        {/* Intro */}
        <div className="max-w-5xl mx-auto px-6">
          <HeroSection guestName={initialGuestName} />
        </div>

        {/* Greeting card */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 text-center">
            {lang === 'km' ? 'លិខិតអញ្ជើញ' : 'THE INVITATION'}
          </div>
          <GreetingSection guestName={initialGuestName} />
        </div>

        {/* Ceremony details */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 text-center">
            {lang === 'km' ? 'ពិធីការលម្អិត' : 'CEREMONY PROFILE'}
          </div>
          <DetailsSection />
        </div>

        {/* Schedule timeline */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 text-center">
            {lang === 'km' ? 'កម្មវិធីលម្អិត' : 'CHRONOLOGY'}
          </div>
          <TimelineSection />
        </div>

        {/* Image gallery */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 text-center">
            {lang === 'km' ? 'រូបថតអនុស្សាវរីយ៍' : 'CAPTURED MOMENTS'}
          </div>
          <GallerySection />
        </div>

        {/* Map & Venue location */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 text-center">
            {lang === 'km' ? 'ទីតាំងរៀបចំពិធី' : 'DIRECTIONS'}
          </div>
          <MapSection />
        </div>

        {/* Online gift registry */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 text-center">
            {lang === 'km' ? 'ចងដៃអនឡាញ' : 'REGISTRY'}
          </div>
          <GiftSection />
        </div>

        {/* Guest wishes */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 text-center">
            {lang === 'km' ? 'ជូនពរ' : 'CONGRATULATIONS'}
          </div>
          <WishesSection guestName={initialGuestName} />
        </div>

        {/* Contact details */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 text-center">
            {lang === 'km' ? 'ទំនាក់ទំនង' : 'SUPPORT HOTLINE'}
          </div>
          <ContactSection />
        </div>

        {/* RSVP Card */}
        <div id="apple-rsvp" className="max-w-3xl mx-auto px-6">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 text-center">
            {lang === 'km' ? 'ឆ្លើយតបការចូលរួម' : 'RSVP GATEWAY'}
          </div>
          <RSVPSection guestName={initialGuestName} />
        </div>
      </main>
    </div>
  );
}
