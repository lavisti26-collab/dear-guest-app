/**
 * NewspaperEditorialLayout.tsx — PREMIUM BROADSHEET EDITION
 *
 * DESIGN: A broadsheet newspaper front page — NYT / The Guardian print edition.
 * Enhancements:
 *   1. Newsprint grain texture via CSS SVG noise
 *   2. Rotated "SPECIAL EDITION" red ink stamp on masthead
 *   3. Ornamental ◆ glyph section dividers
 *   4. Page number labels on each section (Page 1, 2, 3…)
 *   5. "Continued →" editorial notes
 *   6. "ADVERTISEMENT" label on Gift section
 *   7. Red "BREAKING NEWS" banner before RSVP
 *   8. Ink corner dot decorations
 *   9. Simulated newspaper fold crease line
 *  10. Sepia print filter on hero + gallery
 */

import React, { useEffect, useRef } from 'react';
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
      viewport={{ once: true, amount: 0.06 }}
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

// ── Ornamental section label ──────────────────────────────────────────────────
function ColumnLabel({ children, page }: { children: React.ReactNode; page?: number }) {
  return (
    <div className="ne-col-label mb-0">
      <div className="flex items-center gap-0">
        <div className="flex-1 border-t border-[#bbb]" />
        <span className="px-2 text-[#bbb] text-[10px] select-none">◆</span>
        <div className="flex-1 border-t border-[#bbb]" />
      </div>
      <div className="flex items-center justify-between py-[4px]">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.28em] text-[#555] font-mono leading-none flex-1">
          {children}
        </p>
        {page && (
          <span className="text-[8px] font-mono text-[#aaa] border border-[#ddd] px-1 py-0.5 leading-none ml-2 select-none">
            pg.{page}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0">
        <div className="flex-1 border-t border-[#bbb]" />
        <span className="px-2 text-[#bbb] text-[10px] select-none">◆</span>
        <div className="flex-1 border-t border-[#bbb]" />
      </div>
    </div>
  );
}

// ── "Continued on next page" note ─────────────────────────────────────────────
function ContinuedNote({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-end mt-2 gap-1 select-none">
      <div className="flex-1 border-t border-dashed border-[#ccc]" />
      <span className="text-[9px] italic font-mono text-[#999] whitespace-nowrap pl-2">
        {label} →
      </span>
    </div>
  );
}

// ── Pull-quote block ──────────────────────────────────────────────────────────
function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-5 border-l-4 border-[#8B1E1E] pl-4 py-1 relative">
      {/* Opening quote mark */}
      <span className="absolute -top-3 -left-1 text-[#8B1E1E] text-4xl font-serif opacity-25 select-none leading-none">"</span>
      <p
        className="text-base sm:text-lg font-serif italic leading-snug text-[#1a1a1a]"
        style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}
      >
        {children}
      </p>
    </blockquote>
  );
}

// ── Red BREAKING NEWS banner ──────────────────────────────────────────────────
function BreakingBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4 select-none overflow-hidden">
      <span className="bg-[#8B1E1E] text-white text-[9px] font-black uppercase tracking-[0.25em] px-2 py-1 shrink-0 font-mono">
        ◉ BREAKING
      </span>
      <div className="flex-1 border-t border-[#8B1E1E]" />
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E1E] shrink-0 font-mono">
        {children}
      </p>
      <div className="flex-1 border-t border-[#8B1E1E]" />
    </div>
  );
}

// ── Corner ink dot decoration ─────────────────────────────────────────────────
function InkCorners() {
  return (
    <>
      {/* Top-left */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#1a1a1a] select-none pointer-events-none" />
      {/* Top-right */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#1a1a1a] select-none pointer-events-none" />
      {/* Bottom-left */}
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#1a1a1a] select-none pointer-events-none" />
      {/* Bottom-right */}
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#1a1a1a] select-none pointer-events-none" />
    </>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function NewspaperEditorialLayout({ initialGuestName }: { initialGuestName?: string }) {
  const { lang } = useLanguage();
  const { settings } = useWeddingData();
  const pageRef = useRef<HTMLDivElement>(null);

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
      {/* ══ Scoped newspaper CSS ═══════════════════════════════════════════════ */}
      <style>{`
        /* ── Base token reset ── */
        [data-layout="newspaper-editorial"] {
          --ne-bg: #F4F1E8;
          --ne-ink: #111111;
          --ne-rule: #bbbbbb;
          --ne-accent: #8B1E1E;
          --ne-card-bg: #FDFBF5;
          font-family: var(--font-body, Georgia, serif);
        }

        /* ── Newsprint grain texture overlay ── */
        .ne-grain::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          mix-blend-mode: multiply;
        }

        /* ── Targeted card resets — NOT floating nav/buttons ── */
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

        /* ── Form inputs ── */
        [data-layout="newspaper-editorial"] form input,
        [data-layout="newspaper-editorial"] form select,
        [data-layout="newspaper-editorial"] form textarea {
          border-radius: 0 !important;
          background: #FDFBF5 !important;
          border-color: #aaa !important;
        }

        /* ── Form submit buttons only ── */
        [data-layout="newspaper-editorial"] form button[type="submit"] {
          border-radius: 0 !important;
          background: #111 !important;
          color: #F4F1E8 !important;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-size: 11px;
          font-weight: 700;
        }

        /* ── ADVERTISEMENT stamp text ── */
        .ne-advert-label {
          text-align: center;
          font-size: 8.5px;
          letter-spacing: 0.3em;
          font-weight: 700;
          text-transform: uppercase;
          color: #999;
          font-family: monospace;
          border-top: 1px solid #ddd;
          border-bottom: 1px solid #ddd;
          padding: 3px 0;
          margin-bottom: 8px;
        }

        /* ── Fold crease line ── */
        .ne-fold-crease {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent 0%, #d0cbbf 20%, #d0cbbf 80%, transparent 100%);
          opacity: 0.4;
          pointer-events: none;
        }

        /* ── Rotated stamp ── */
        .ne-stamp {
          position: absolute;
          top: 12px;
          right: 10px;
          transform: rotate(12deg);
          border: 2.5px solid #8B1E1E;
          color: #8B1E1E;
          font-size: 7.5px;
          font-weight: 900;
          font-family: monospace;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 4px 7px;
          opacity: 0.75;
          line-height: 1.4;
          text-align: center;
          pointer-events: none;
          select-none: none;
          user-select: none;
        }
        .ne-stamp::before {
          content: '';
          position: absolute;
          inset: 2px;
          border: 1px solid #8B1E1E;
          opacity: 0.4;
        }
      `}</style>

      {/* ══ Page root ════════════════════════════════════════════════════════ */}
      <div
        ref={pageRef}
        className="ne-root ne-grain min-h-screen bg-[#F4F1E8] text-[#111] selection:bg-[#8B1E1E] selection:text-white antialiased"
        style={{ fontFamily: 'var(--font-body, Georgia, serif)' }}
      >
        {/* Outer broadsheet border with simulated fold crease */}
        <div className="max-w-[700px] mx-auto px-4 py-6 sm:py-10 sm:px-8 border-x-2 border-[#1a1a1a] min-h-screen relative">

          {/* Fold crease vertical line */}
          <div className="ne-fold-crease" />

          {/* ── MASTHEAD ────────────────────────────────────────────────── */}
          <PrintReveal delay={0}>
            <header className="text-center select-none relative">

              {/* Top metadata strip */}
              <div className="flex justify-between items-center text-[8.5px] uppercase tracking-[0.2em] font-bold text-[#666] pb-1.5 mb-0 font-mono">
                <span>{weddingDate}</span>
                <span>{lang === 'km' ? 'ច្បាប់លេខ ០០១' : 'ISSUE No. 001'}</span>
                <span>{lang === 'km' ? 'ជូនដោយឥតគិតថ្លៃ' : 'COMPLIMENTARY'}</span>
              </div>

              <DoubleRule />

              {/* Nameplate + rotated stamp */}
              <div className="py-4 px-2 relative">
                {/* Rotated red stamp */}
                <div className="ne-stamp">
                  {lang === 'km' ? 'ច្បាប់\nពិសេស' : 'SPECIAL\nEDITION'}
                </div>

                <h1
                  className="text-4xl sm:text-6xl md:text-7xl font-black leading-none tracking-tight text-[#111] uppercase"
                  style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}
                >
                  {coupleNameDisplay}
                </h1>
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[#555] mt-2 font-mono">
                  {eventTitle} &nbsp;◆&nbsp; {lang === 'km' ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'KINGDOM OF CAMBODIA'}
                </p>
              </div>

              <DoubleRule />

              {/* Guest byline */}
              <div className="flex justify-between items-center py-1.5 text-[9px] font-mono">
                <span className="text-[#666] uppercase tracking-widest">{lang === 'km' ? 'ចំពោះ' : 'TO'}:</span>
                <span className="font-serif italic text-[13px] text-[#111] font-normal tracking-normal">
                  {initialGuestName || (lang === 'km' ? 'ភ្ញៀវកិត្តិយស' : 'Honored Guest')}
                </span>
                <span className="text-[#666] uppercase tracking-widest">◆</span>
              </div>

              <DoubleRule />

              {/* Ink corner decorations on masthead */}
              <InkCorners />
            </header>
          </PrintReveal>

          {/* ── HERO PHOTO ──────────────────────────────────────────────── */}
          <PrintReveal delay={0.1}>
            <div className="ne-hero mt-0 relative overflow-hidden border-b-2 border-[#1a1a1a]">
              {/* Sepia print photo treatment */}
              <div style={{ filter: 'grayscale(0.28) sepia(0.2) contrast(1.07) brightness(0.94)' }}>
                <HeroSection guestName={initialGuestName} />
              </div>
              {/* Caption footer bar */}
              <div className="bg-[#F4F1E8] border-t border-[#1a1a1a] px-3 py-1.5 flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#555] font-mono">
                  {lang === 'km' ? 'រូបថតផ្លូវការ' : 'OFFICIAL PORTRAIT'}
                </span>
                <span className="text-[9px] italic text-[#777]">
                  {coupleNameDisplay}
                </span>
              </div>
            </div>
          </PrintReveal>

          {/* ── GREETING ────────────────────────────────────────────────── */}
          <PrintReveal delay={0.15}>
            <div className="ne-section mt-5">
              <ColumnLabel page={1}>
                {lang === 'km'
                  ? (settings?.greetingTitleKm || 'ការអញ្ជើញ')
                  : (settings?.greetingTitleEn || 'INVITATION')}
              </ColumnLabel>

              <PullQuote>
                {lang === 'km'
                  ? `"${coupleNameDisplay} — ${eventTitle} — ${weddingDate}"`
                  : `"${coupleNameDisplay} — A Wedding Celebration — ${weddingDate}"`}
              </PullQuote>

              <div className="ne-body">
                <GreetingSection guestName={initialGuestName} />
              </div>

              <ContinuedNote label={lang === 'km' ? 'ព័ត៌មានបន្ថែម' : 'See details'} />
            </div>
          </PrintReveal>

          {/* ── DETAILS ─────────────────────────────────────────────────── */}
          <PrintReveal delay={0.2}>
            <div className="ne-section mt-6">
              <ColumnLabel page={2}>
                {lang === 'km'
                  ? (settings?.detailsTitleKm || 'ព័ត៌មានកម្មវិធី')
                  : (settings?.detailsTitleEn || 'DATE, TIME & VENUE')}
              </ColumnLabel>

              <div className="mt-3 border border-[#c8c4b0] bg-[#FDFBF5] p-4 relative">
                <InkCorners />
                <div className="flex justify-end mb-2">
                  <span className="text-[8px] uppercase tracking-[0.3em] font-bold font-mono text-[#8B1E1E] border border-[#8B1E1E] px-1.5 py-0.5 leading-none">
                    {lang === 'km' ? 'ព័ត៌មានផ្លូវការ' : 'OFFICIAL BULLETIN'}
                  </span>
                </div>
                <DetailsSection />
              </div>
            </div>
          </PrintReveal>

          {/* ── TIMELINE ────────────────────────────────────────────────── */}
          <PrintReveal delay={0.25}>
            <div className="ne-section mt-6">
              <ColumnLabel page={3}>
                {lang === 'km'
                  ? (settings?.timelineTitleKm || 'កម្មវិធីលម្អិត')
                  : (settings?.timelineTitleEn || 'ORDER OF CEREMONIES')}
              </ColumnLabel>
              <div className="mt-3">
                <TimelineSection />
              </div>
              <ContinuedNote label={lang === 'km' ? 'បន្ត' : 'Continued'} />
            </div>
          </PrintReveal>

          {/* ── GALLERY ─────────────────────────────────────────────────── */}
          <PrintReveal delay={0.3}>
            <div className="ne-section mt-6">
              <ColumnLabel page={4}>
                {lang === 'km'
                  ? (settings?.galleryTitleKm || 'រូបភាពអនុស្សាវរីយ៍')
                  : (settings?.galleryTitleEn || 'PHOTOGRAPHS')}
              </ColumnLabel>
              {/* Sepia ink treatment for gallery photos */}
              <div
                className="mt-3"
                style={{ filter: 'grayscale(0.22) sepia(0.16) contrast(1.06) brightness(0.95)' }}
              >
                <GallerySection />
              </div>
            </div>
          </PrintReveal>

          {/* ── MAP ─────────────────────────────────────────────────────── */}
          <PrintReveal delay={0.35}>
            <div className="ne-section mt-6">
              <ColumnLabel page={5}>
                {lang === 'km' ? 'ផែនទីណែនាំ' : 'LOCATION MAP'}
              </ColumnLabel>
              <div className="mt-3 border border-[#c8c4b0] overflow-hidden">
                <MapSection />
              </div>
            </div>
          </PrintReveal>

          {/* ── GIFT / REGISTRY — "ADVERTISEMENT" ──────────────────────── */}
          <PrintReveal delay={0.4}>
            <div className="ne-section mt-6">
              <ColumnLabel page={6}>
                {lang === 'km'
                  ? (settings?.giftTitleKm || 'អំណោយ')
                  : (settings?.giftTitleEn || 'REGISTRY & GIFTS')}
              </ColumnLabel>
              <div className="mt-3 border border-[#c8c4b0] bg-[#FDFBF5] p-4">
                {/* ADVERTISEMENT newspaper label */}
                <div className="ne-advert-label">
                  — {lang === 'km' ? 'ប្រកាសពាណិជ្ជកម្ម' : 'ADVERTISEMENT'} —
                </div>
                <GiftSection />
              </div>
            </div>
          </PrintReveal>

          {/* ── RSVP — BREAKING NEWS + CLIP COUPON ─────────────────────── */}
          <PrintReveal delay={0.45}>
            <div className="ne-section mt-6">
              <ColumnLabel page={7}>
                {lang === 'km'
                  ? (settings?.rsvpTitleKm || 'ការឆ្លើយតប')
                  : (settings?.rsvpTitleEn || 'RSVP RESPONSE COUPON')}
              </ColumnLabel>

              {/* Breaking news banner */}
              <div className="mt-3">
                <BreakingBanner>
                  {lang === 'km'
                    ? 'ពេលវេលាឆ្លើយតបកំណត់ — សូមឆ្លើយតបភ្លាមៗ'
                    : 'RESPONSE REQUIRED — KINDLY REPLY AT YOUR EARLIEST'}
                </BreakingBanner>

                {/* Scissor clip coupon */}
                <div className="flex items-center gap-2 mb-0 select-none">
                  <div className="flex-1 border-t-2 border-dashed border-[#888]" />
                  <span className="text-[10px] font-mono text-[#888] whitespace-nowrap px-1">
                    ✂ {lang === 'km' ? 'កាត់ & ស្នើ' : 'CLIP & RETURN'}
                  </span>
                  <div className="flex-1 border-t-2 border-dashed border-[#888]" />
                </div>

                <div className="border-2 border-dashed border-[#aaa] p-4 bg-[#FDFBF5] relative">
                  <InkCorners />
                  <RSVPSection guestName={initialGuestName} />
                </div>

                <div className="border-t-2 border-dashed border-[#aaa]" />
              </div>
            </div>
          </PrintReveal>

          {/* ── WISHES — "Letters to the Editor" ───────────────────────── */}
          <PrintReveal delay={0.5}>
            <div className="ne-section mt-6">
              <ColumnLabel page={8}>
                {lang === 'km'
                  ? (settings?.wishesTitleKm || 'លិខិតជូនពរ')
                  : (settings?.wishesTitleEn || 'LETTERS TO THE COUPLE')}
              </ColumnLabel>
              <div className="mt-3">
                <WishesSection guestName={initialGuestName} />
              </div>
              <ContinuedNote label={lang === 'km' ? 'ចែករំលែក' : 'Share your wishes'} />
            </div>
          </PrintReveal>

          {/* ── CONTACT ─────────────────────────────────────────────────── */}
          <PrintReveal delay={0.55}>
            <div className="ne-section mt-6">
              <ColumnLabel page={9}>
                {lang === 'km'
                  ? (settings?.contactTitleKm || 'ទំនាក់ទំនង')
                  : (settings?.contactTitleEn || 'CONTACT US')}
              </ColumnLabel>
              <div className="mt-3">
                <ContactSection />
              </div>
            </div>
          </PrintReveal>

          {/* ── FOOTER ──────────────────────────────────────────────────── */}
          <PrintReveal delay={0.6}>
            <footer className="mt-10 pt-3 select-none relative">
              <DoubleRule />
              <div className="flex justify-between items-center pt-2 text-[8.5px] uppercase tracking-[0.2em] font-bold text-[#666] font-mono">
                <span>◆</span>
                <span className="font-serif italic text-[11px] normal-case tracking-normal text-[#888]">
                  {coupleNameDisplay}
                </span>
                <span>◆</span>
              </div>
              <p className="text-center text-[8px] font-mono text-[#bbb] mt-1 uppercase tracking-widest">
                © 2026 &nbsp;·&nbsp; {lang === 'km' ? 'Lavisti Production · រក្សាសិទ្ធិ' : 'Lavisti Production · All Rights Reserved'}
              </p>
            </footer>
          </PrintReveal>

        </div>
      </div>
    </>
  );
}
