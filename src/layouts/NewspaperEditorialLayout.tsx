/**
 * NewspaperEditorialLayout.tsx
 *
 * DESIGN: A broadsheet newspaper front page — NYT / The Guardian print edition.
 * NOT a color-swap. A genuine editorial print layout.
 *
 * KEY PRINCIPLE: Reuse all shared section components so data is always correct.
 * The newspaper look is achieved via:
 *   1. Injected scoped <style> that re-skins child component DOM inside [data-layout="newspaper-editorial"]
 *   2. Broadsheet grid (masthead → hero → 3-col grid → full sections)
 *   3. Real column rules, ruled separators, sepia print filter
 *   4. Drop caps, pull quotes, clip-out coupon RSVP
 */

import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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

// ── Animation ────────────────────────────────────────────────────────────────
const PRINT_EASE = [0.16, 1, 0.3, 1] as const;

function PrintReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.65, delay, ease: PRINT_EASE }}
    >
      {children}
    </motion.div>
  );
}

// ── Ruled dividers ────────────────────────────────────────────────────────────
function DoubleRule() {
  return <div className="w-full border-t-4 border-double border-[#1a1a1a] my-0" />;
}
function ThinRule() {
  return <div className="w-full border-t border-[#bbb] my-0" />;
}

// ── Section label — broadsheet column header ──────────────────────────────────
function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="ne-col-label mb-0">
      <ThinRule />
      <p className="text-[9.5px] font-bold uppercase tracking-[0.28em] text-[#555] py-[5px] font-mono leading-none">
        {children}
      </p>
      <ThinRule />
    </div>
  );
}

// ── Pull-quote ornament ───────────────────────────────────────────────────────
function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="ne-pull-quote my-6 border-l-4 border-[#8B1E1E] pl-4 py-1">
      <p className="text-base sm:text-lg font-serif italic leading-snug text-[#1a1a1a]"
         style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}>
        {children}
      </p>
    </blockquote>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function NewspaperEditorialLayout({ initialGuestName }: { initialGuestName?: string }) {
  const { lang } = useLanguage();
  const { settings } = useWeddingData();

  useEffect(() => {
    document.documentElement.setAttribute('data-layout', 'newspaper-editorial');
    return () => document.documentElement.removeAttribute('data-layout');
  }, []);

  const coupleNameDisplay = lang === 'km'
    ? (settings?.coupleNamesKm || 'កូនប្រុស & កូនក្រមុំ')
    : (settings?.coupleNames || 'Groom & Bride');

  const eventTitle = lang === 'km'
    ? (settings?.eventTitleKm || 'ពិធីរៀបអាពាហ៍ពិពាហ៍')
    : (settings?.eventTitleEn || 'WEDDING CEREMONY');

  const weddingDate = lang === 'km'
    ? (settings?.weddingDateKm || settings?.weddingDate || '')
    : (settings?.weddingDate || '');

  return (
    <>
      {/* ══ Scoped newspaper CSS injected at mount ══════════════════════════════
          Targets child components rendered inside [data-layout="newspaper-editorial"].
          Overrides colours, shadows, borders, radius, backgrounds to match print. */}
      <style>{`
        [data-layout="newspaper-editorial"] {
          --ne-bg: #F4F1E8;
          --ne-ink: #111111;
          --ne-rule: #bbbbbb;
          --ne-accent: #8B1E1E;
          --ne-card-bg: #FDFBF5;
          font-family: var(--font-body, Georgia, serif);
        }

        /* ── Strip shadows from card-like containers ONLY — not floating UI ── */
        /* Target semantic content blocks, not navigation or floating overlays   */
        [data-layout="newspaper-editorial"] .card {
          border-radius: 0 !important;
          box-shadow: none !important;
          background: var(--ne-card-bg) !important;
          border: 1px solid #c8c4b0 !important;
        }

        /* ── Section headings inside child components ── */
        [data-layout="newspaper-editorial"] h2,
        [data-layout="newspaper-editorial"] h3 {
          font-family: var(--font-display, Georgia, serif) !important;
          color: #1a1a1a !important;
          letter-spacing: 0.02em;
        }

        /* ── Wish cards ── */
        [data-layout="newspaper-editorial"] [class*="wish-card"] {
          border: 1px solid #c8c4b0 !important;
          background: var(--ne-card-bg) !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }

        /* ── RSVP/Gift form inputs ── */
        [data-layout="newspaper-editorial"] form input,
        [data-layout="newspaper-editorial"] form select,
        [data-layout="newspaper-editorial"] form textarea {
          border-radius: 0 !important;
          background: #FDFBF5 !important;
          border-color: #aaa !important;
        }

        /* ── Submit buttons inside forms ── */
        [data-layout="newspaper-editorial"] form button[type="submit"] {
          border-radius: 0 !important;
          background: #111 !important;
          color: #F4F1E8 !important;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-size: 11px;
          font-weight: 700;
        }
      `}</style>

      {/* ══ Page wrapper ════════════════════════════════════════════════════════ */}
      <div
        className="ne-root min-h-screen bg-[#F4F1E8] text-[#111] selection:bg-[#8B1E1E] selection:text-white antialiased"
        style={{ fontFamily: 'var(--font-body, Georgia, serif)' }}
      >
        {/* Newspaper outer border */}
        <div className="max-w-[700px] mx-auto px-4 py-6 sm:py-10 sm:px-8 border-x-2 border-[#1a1a1a] min-h-screen">

          {/* ────────────────────────────────────────────────────────────────────
              MASTHEAD — THE NAMEPLATE
          ──────────────────────────────────────────────────────────────────── */}
          <PrintReveal delay={0}>
            <header className="text-center select-none">

              {/* Top metadata strip */}
              <div className="flex justify-between items-center text-[8.5px] uppercase tracking-[0.2em] font-bold text-[#666] pb-1.5 mb-0">
                <span>{weddingDate}</span>
                <span>{lang === 'km' ? 'ច្បាប់ប្រចាំ: ១' : 'ISSUE NO. 1'}</span>
                <span>{lang === 'km' ? 'ជូនដោយឥតគិតថ្លៃ' : 'COMPLIMENTARY'}</span>
              </div>

              <DoubleRule />

              {/* Couple names as paper nameplate */}
              <div className="py-4 px-2">
                <h1
                  className="text-5xl sm:text-7xl font-black leading-none tracking-tight text-[#111] uppercase"
                  style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}
                >
                  {coupleNameDisplay}
                </h1>
                <p
                  className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[#555] mt-2"
                >
                  {eventTitle} &nbsp;·&nbsp; {lang === 'km' ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'KINGDOM OF CAMBODIA'}
                </p>
              </div>

              <DoubleRule />

              {/* Guest byline bar */}
              <div className="flex justify-between items-center py-1.5 text-[9px]">
                <span className="text-[#666] uppercase tracking-widest">
                  {lang === 'km' ? 'ចំពោះ' : 'TO'}:
                </span>
                <span className="font-serif italic text-[13px] text-[#111]">
                  {initialGuestName || (lang === 'km' ? 'ភ្ញៀវកិត្តិយស' : 'Honored Guest')}
                </span>
                <span className="text-[#666] uppercase tracking-widest">
                  {lang === 'km' ? 'ច្បាប់ពិសេស' : 'SPECIAL EDITION'}
                </span>
              </div>

              <DoubleRule />
            </header>
          </PrintReveal>

          {/* ────────────────────────────────────────────────────────────────────
              FRONT PAGE — HERO PHOTO (full bleed, sepia toned)
          ──────────────────────────────────────────────────────────────────── */}
          <PrintReveal delay={0.1}>
            <div className="ne-hero mt-0 relative overflow-hidden border-b-2 border-[#1a1a1a]">
              <div style={{ filter: 'grayscale(0.3) sepia(0.18) contrast(1.07) brightness(0.95)' }}>
                <HeroSection guestName={initialGuestName} />
              </div>
              {/* Photo caption bar */}
              <div className="bg-[#F4F1E8] border-t border-[#1a1a1a] px-3 py-1.5 flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#555] font-mono">
                  {lang === 'km' ? 'រូបថតផ្លូវការ' : 'OFFICIAL PORTRAIT'}
                </span>
                <span className="text-[9px] italic text-[#777]">
                  {coupleNameDisplay}, {weddingDate}
                </span>
              </div>
            </div>
          </PrintReveal>

          {/* ────────────────────────────────────────────────────────────────────
              LEAD STORY — GREETING (with drop cap simulation via pull quote)
          ──────────────────────────────────────────────────────────────────── */}
          <PrintReveal delay={0.15}>
            <div className="ne-section mt-5">
              <ColumnLabel>
                {lang === 'km'
                  ? (settings?.greetingTitleKm || 'ការអញ្ជើញ')
                  : (settings?.greetingTitleEn || 'INVITATION')}
              </ColumnLabel>

              {/* Pull quote before the greeting text */}
              <PullQuote>
                {lang === 'km'
                  ? `"${coupleNameDisplay} — ពិធីរៀបអាពាហ៍ពិពាហ៍ — ${weddingDate}"`
                  : `"${coupleNameDisplay} — A Wedding Celebration — ${weddingDate}"`}
              </PullQuote>

              <div className="ne-body">
                <GreetingSection guestName={initialGuestName} />
              </div>
            </div>
          </PrintReveal>

          {/* ────────────────────────────────────────────────────────────────────
              TWO-COLUMN: DETAILS (left) + sidebar rule (right decoration)
          ──────────────────────────────────────────────────────────────────── */}
          <PrintReveal delay={0.2}>
            <div className="ne-section mt-6">
              <ColumnLabel>
                {lang === 'km'
                  ? (settings?.detailsTitleKm || 'ព័ត៌មានកម្មវិធី')
                  : (settings?.detailsTitleEn || 'DATE, TIME & VENUE')}
              </ColumnLabel>

              <div className="mt-3 border border-[#c8c4b0] bg-[#FDFBF5] p-4">
                {/* Small "BULLETIN" stamp top-right */}
                <div className="flex justify-end mb-2">
                  <span className="text-[8px] uppercase tracking-[0.3em] font-bold font-mono text-[#8B1E1E] border border-[#8B1E1E] px-1.5 py-0.5 leading-none">
                    {lang === 'km' ? 'ព័ត៌មានផ្លូវការ' : 'OFFICIAL BULLETIN'}
                  </span>
                </div>
                <DetailsSection />
              </div>
            </div>
          </PrintReveal>

          {/* ────────────────────────────────────────────────────────────────────
              ORDER OF CEREMONIES — TIMELINE
          ──────────────────────────────────────────────────────────────────── */}
          <PrintReveal delay={0.25}>
            <div className="ne-section mt-6">
              <ColumnLabel>
                {lang === 'km'
                  ? (settings?.timelineTitleKm || 'កម្មវិធីលម្អិត')
                  : (settings?.timelineTitleEn || 'ORDER OF CEREMONIES')}
              </ColumnLabel>
              <div className="mt-3">
                <TimelineSection />
              </div>
            </div>
          </PrintReveal>

          {/* ────────────────────────────────────────────────────────────────────
              PHOTOGRAPHS — GALLERY with sepia ink filter
          ──────────────────────────────────────────────────────────────────── */}
          <PrintReveal delay={0.3}>
            <div className="ne-section mt-6">
              <ColumnLabel>
                {lang === 'km'
                  ? (settings?.galleryTitleKm || 'រូបភាពអនុស្សាវរីយ៍')
                  : (settings?.galleryTitleEn || 'PHOTOGRAPHS')}
              </ColumnLabel>
              <div
                className="mt-3"
                style={{ filter: 'grayscale(0.25) sepia(0.15) contrast(1.06) brightness(0.96)' }}
              >
                <GallerySection />
              </div>
            </div>
          </PrintReveal>

          {/* ────────────────────────────────────────────────────────────────────
              MAP — LOCATION GUIDE
          ──────────────────────────────────────────────────────────────────── */}
          <PrintReveal delay={0.35}>
            <div className="ne-section mt-6">
              <ColumnLabel>
                {lang === 'km' ? 'ផែនទីណែនាំ' : 'LOCATION MAP'}
              </ColumnLabel>
              <div className="mt-3 border border-[#c8c4b0] overflow-hidden">
                <MapSection />
              </div>
            </div>
          </PrintReveal>

          {/* ────────────────────────────────────────────────────────────────────
              REGISTRY — GIFT / QR
          ──────────────────────────────────────────────────────────────────── */}
          <PrintReveal delay={0.4}>
            <div className="ne-section mt-6">
              <ColumnLabel>
                {lang === 'km'
                  ? (settings?.giftTitleKm || 'អំណោយ')
                  : (settings?.giftTitleEn || 'REGISTRY & GIFTS')}
              </ColumnLabel>
              <div className="mt-3 border border-[#c8c4b0] bg-[#FDFBF5] p-4">
                <GiftSection />
              </div>
            </div>
          </PrintReveal>

          {/* ────────────────────────────────────────────────────────────────────
              RSVP — CLIP-OUT COUPON
          ──────────────────────────────────────────────────────────────────── */}
          <PrintReveal delay={0.45}>
            <div className="ne-section mt-6">
              <ColumnLabel>
                {lang === 'km'
                  ? (settings?.rsvpTitleKm || 'ការឆ្លើយតប')
                  : (settings?.rsvpTitleEn || 'RSVP RESPONSE COUPON')}
              </ColumnLabel>

              {/* Dashed coupon box with scissor mark */}
              <div className="mt-3 relative">
                {/* Scissor strip top */}
                <div className="flex items-center gap-2 mb-1 select-none">
                  <div className="flex-1 border-t-2 border-dashed border-[#888]" />
                  <span className="text-[10px] font-mono text-[#888] whitespace-nowrap">
                    ✂ {lang === 'km' ? 'កាត់ & ស្នើកម្មវិធីនៅទីនេះ' : 'CLIP HERE & RETURN'}
                  </span>
                  <div className="flex-1 border-t-2 border-dashed border-[#888]" />
                </div>

                <div className="border-2 border-dashed border-[#888] p-4 bg-[#FDFBF5]">
                  <RSVPSection guestName={initialGuestName} />
                </div>

                {/* Scissor strip bottom */}
                <div className="border-t-2 border-dashed border-[#888] mt-0" />
              </div>
            </div>
          </PrintReveal>

          {/* ────────────────────────────────────────────────────────────────────
              WISHES — LETTERS TO THE COUPLE
          ──────────────────────────────────────────────────────────────────── */}
          <PrintReveal delay={0.5}>
            <div className="ne-section mt-6">
              <ColumnLabel>
                {lang === 'km'
                  ? (settings?.wishesTitleKm || 'លិខិតជូនពរ')
                  : (settings?.wishesTitleEn || 'LETTERS TO THE COUPLE')}
              </ColumnLabel>
              <div className="mt-3">
                <WishesSection guestName={initialGuestName} />
              </div>
            </div>
          </PrintReveal>

          {/* ────────────────────────────────────────────────────────────────────
              CONTACT
          ──────────────────────────────────────────────────────────────────── */}
          <PrintReveal delay={0.55}>
            <div className="ne-section mt-6">
              <ColumnLabel>
                {lang === 'km'
                  ? (settings?.contactTitleKm || 'ទំនាក់ទំនង')
                  : (settings?.contactTitleEn || 'CONTACT US')}
              </ColumnLabel>
              <div className="mt-3">
                <ContactSection />
              </div>
            </div>
          </PrintReveal>

          {/* ────────────────────────────────────────────────────────────────────
              FOOTER — EDITORIAL CLOSING LINE
          ──────────────────────────────────────────────────────────────────── */}
          <PrintReveal delay={0.6}>
            <footer className="mt-10 pt-3 select-none">
              <DoubleRule />
              <div className="flex justify-between items-center pt-2 text-[8.5px] uppercase tracking-[0.2em] font-bold text-[#666] font-mono">
                <span>© 2026 {lang === 'km' ? 'រក្សាសិទ្ធិ' : 'ALL RIGHTS RESERVED'}</span>
                <span className="italic font-serif text-[10px] normal-case tracking-normal text-[#888]">
                  {coupleNameDisplay}
                </span>
                <span>{lang === 'km' ? 'Lavisti Production' : 'LAVISTI PRODUCTION'}</span>
              </div>
            </footer>
          </PrintReveal>

        </div>
      </div>
    </>
  );
}
