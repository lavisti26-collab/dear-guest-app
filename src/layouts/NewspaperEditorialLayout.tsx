/**
 * NewspaperEditorialLayout.tsx
 *
 * DESIGN: A broadsheet newspaper front page — NYT / The Guardian print edition.
 * NOT a color-swap. A genuine editorial print layout.
 *
 * KEY PRINCIPLE: Reuse all shared section components (HeroSection, WishesSection,
 * RSVPSection, etc.) so data always displays correctly. The newspaper aesthetic
 * is applied via wrapper CSS classes and print-filter styles on the container.
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, delay, ease: PRINT_EASE }}
    >
      {children}
    </motion.div>
  );
}

// ── Thin ruled divider ────────────────────────────────────────────────────────
function Rule({ thick = false }: { thick?: boolean }) {
  return (
    <div className={`w-full ${thick ? 'border-t-4 border-double border-neutral-900' : 'border-t border-neutral-400'} my-0`} />
  );
}

// ── Section heading in broadsheet style ───────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="ne-section-head">
      <Rule />
      <h2
        className="text-[11px] uppercase tracking-[0.25em] font-bold text-neutral-600 py-1 px-0 font-mono"
      >
        {children}
      </h2>
      <Rule />
    </div>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function NewspaperEditorialLayout({ initialGuestName }: { initialGuestName?: string }) {
  const { lang } = useLanguage();
  const { settings } = useWeddingData();

  // Apply newspaper data-layout attribute for any CSS targeting
  useEffect(() => {
    document.documentElement.setAttribute('data-layout', 'newspaper-editorial');
    return () => {
      document.documentElement.removeAttribute('data-layout');
    };
  }, []);

  return (
    <div
      className="ne-root min-h-screen bg-[#F4F1E8] text-[#111] selection:bg-[#8B1E1E] selection:text-white"
      style={{ fontFamily: 'var(--font-body, Georgia, serif)' }}
    >
      {/* ══ Outer broadsheet border ══════════════════════════════════════════ */}
      <div className="max-w-2xl mx-auto px-3 py-6 sm:py-10 sm:px-6 border-x border-neutral-300">

        {/* ── MASTHEAD ─────────────────────────────────────────────────────── */}
        <PrintReveal delay={0}>
          <header className="text-center mb-0">
            {/* Top info bar */}
            <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold text-neutral-500 border-b border-neutral-400 pb-1 mb-2">
              <span>{lang === 'km' ? 'ច្បាប់ជូនភ្ញៀវ' : 'COMPLIMENTARY COPY'}</span>
              <span>{lang === 'km' ? 'ឆ្នាំ ២០២៦' : 'ANNO MMXXVI'}</span>
              <span>{lang === 'km' ? 'បោះពុម្ពលេខ ០០១' : 'ISSUE No. 001'}</span>
            </div>

            {/* Paper nameplate */}
            <div className="border-t-4 border-b-4 border-double border-neutral-900 py-3 mb-2">
              <h1
                className="text-4xl sm:text-6xl font-black uppercase leading-none tracking-tight text-neutral-950"
                style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}
              >
                {lang === 'km'
                  ? settings?.coupleNamesKm || 'ប្រកាសអាពាហ៍ពិពាហ៍'
                  : settings?.coupleNames || 'THE WEDDING CHRONICLE'}
              </h1>
              <p
                className="text-[11px] uppercase tracking-[0.3em] text-neutral-600 mt-1"
                style={{ fontFamily: 'var(--font-body, Georgia, serif)' }}
              >
                {lang === 'km' ? settings?.eventTitleKm || 'ពិធីរៀបអាពាហ៍ពិពាហ៍' : settings?.eventTitleEn || 'WEDDING INVITATION'}
              </p>
            </div>

            {/* Guest byline */}
            <div className="border-b-2 border-neutral-900 py-1.5 mb-1 text-center">
              <span className="italic text-sm text-neutral-700" style={{ fontFamily: 'var(--font-body, Georgia, serif)' }}>
                {lang === 'km'
                  ? `ច្បាប់ជូន ៖ ${initialGuestName || 'ភ្ញៀវកិត្តិយស'}`
                  : `Special Edition for: ${initialGuestName || 'Honored Guest'}`}
              </span>
            </div>
          </header>
        </PrintReveal>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <PrintReveal delay={0.1}>
          <div className="ne-hero mt-4 mb-0 border border-neutral-900 overflow-hidden">
            {/* Sepia/grayscale newspaper photo effect applied via CSS filter on the wrapper */}
            <div
              style={{ filter: 'grayscale(0.25) sepia(0.15) contrast(1.05) brightness(0.97)' }}
              className="ne-hero-inner"
            >
              <HeroSection guestName={initialGuestName} />
            </div>
            <div className="border-t border-neutral-900 bg-[#F4F1E8] px-3 py-1 text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                {lang === 'km' ? 'រូបថតផ្លូវការ' : 'OFFICIAL PORTRAIT'}
              </p>
            </div>
          </div>
        </PrintReveal>

        {/* ── GREETING / ANNOUNCEMENT ──────────────────────────────────────── */}
        <PrintReveal delay={0.15}>
          <div className="ne-section mt-8">
            <SectionHeading>
              {lang === 'km' ? settings?.greetingTitleKm || 'ការអញ្ជើញ' : settings?.greetingTitleEn || 'INVITATION'}
            </SectionHeading>
            <div className="ne-body mt-3">
              <GreetingSection guestName={initialGuestName} />
            </div>
          </div>
        </PrintReveal>

        {/* ── DETAILS ──────────────────────────────────────────────────────── */}
        <PrintReveal delay={0.2}>
          <div className="ne-section mt-8 border border-neutral-900 p-4 bg-white">
            <SectionHeading>
              {lang === 'km' ? settings?.detailsTitleKm || 'កាលបរិច្ឆេទ & ទីកន្លែង' : settings?.detailsTitleEn || 'DATE & VENUE'}
            </SectionHeading>
            <div className="mt-3">
              <DetailsSection />
            </div>
          </div>
        </PrintReveal>

        {/* ── TIMELINE / ORDER OF CEREMONY ─────────────────────────────────── */}
        <PrintReveal delay={0.25}>
          <div className="ne-section mt-8">
            <SectionHeading>
              {lang === 'km' ? settings?.timelineTitleKm || 'កម្មវិធី' : settings?.timelineTitleEn || 'ORDER OF CEREMONIES'}
            </SectionHeading>
            <div className="mt-3">
              <TimelineSection />
            </div>
          </div>
        </PrintReveal>

        {/* ── GALLERY ──────────────────────────────────────────────────────── */}
        <PrintReveal delay={0.3}>
          <div className="ne-section mt-8">
            <SectionHeading>
              {lang === 'km' ? settings?.galleryTitleKm || 'រូបភាព' : settings?.galleryTitleEn || 'PHOTOGRAPHS'}
            </SectionHeading>
            <div
              className="mt-3"
              style={{ filter: 'grayscale(0.2) sepia(0.12) contrast(1.05) brightness(0.97)' }}
            >
              <GallerySection />
            </div>
          </div>
        </PrintReveal>

        {/* ── MAP ──────────────────────────────────────────────────────────── */}
        <PrintReveal delay={0.35}>
          <div className="ne-section mt-8">
            <SectionHeading>
              {lang === 'km' ? 'ផែនទី' : 'LOCATION MAP'}
            </SectionHeading>
            <div className="mt-3 border border-neutral-900 overflow-hidden">
              <MapSection />
            </div>
          </div>
        </PrintReveal>

        {/* ── GIFT / REGISTRY ──────────────────────────────────────────────── */}
        <PrintReveal delay={0.4}>
          <div className="ne-section mt-8">
            <SectionHeading>
              {lang === 'km' ? settings?.giftTitleKm || 'អំណោយ' : settings?.giftTitleEn || 'REGISTRY & GIFTS'}
            </SectionHeading>
            <div className="mt-3 border border-neutral-900 p-4 bg-white">
              <GiftSection />
            </div>
          </div>
        </PrintReveal>

        {/* ── RSVP — "Clip-out coupon" ─────────────────────────────────────── */}
        <PrintReveal delay={0.45}>
          <div className="ne-section mt-8">
            <SectionHeading>
              {lang === 'km' ? settings?.rsvpTitleKm || 'ការឆ្លើយតប' : settings?.rsvpTitleEn || 'RSVP RESPONSE COUPON'}
            </SectionHeading>
            {/* Dashed coupon border */}
            <div className="mt-3 border-2 border-dashed border-neutral-700 relative p-4 bg-white">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#F4F1E8] px-3 text-[10px] font-mono uppercase tracking-widest text-neutral-500 whitespace-nowrap">
                ✂ {lang === 'km' ? 'កាត់ & ឆ្លើយតបនៅទីនេះ' : 'CUT & RETURN THIS COUPON'}
              </div>
              <RSVPSection guestName={initialGuestName} />
            </div>
          </div>
        </PrintReveal>

        {/* ── WISHES — "Letters to the Editor" ─────────────────────────────── */}
        <PrintReveal delay={0.5}>
          <div className="ne-section mt-8">
            <SectionHeading>
              {lang === 'km' ? settings?.wishesTitleKm || 'សារជូនពរ' : settings?.wishesTitleEn || 'LETTERS TO THE COUPLE'}
            </SectionHeading>
            <div className="mt-3">
              <WishesSection guestName={initialGuestName} />
            </div>
          </div>
        </PrintReveal>

        {/* ── CONTACT ──────────────────────────────────────────────────────── */}
        <PrintReveal delay={0.55}>
          <div className="ne-section mt-8">
            <SectionHeading>
              {lang === 'km' ? settings?.contactTitleKm || 'ទំនាក់ទំនង' : settings?.contactTitleEn || 'CONTACT'}
            </SectionHeading>
            <div className="mt-3">
              <ContactSection />
            </div>
          </div>
        </PrintReveal>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <PrintReveal delay={0.6}>
          <footer className="mt-12 border-t-4 border-double border-neutral-900 pt-4 text-center">
            <p className="text-[9px] uppercase tracking-widest font-mono text-neutral-500">
              {lang === 'km'
                ? `© ២០២៦ · ${settings?.coupleNamesKm || ''} · រៀបចំដោយ Lavisti`
                : `© 2026 · ${settings?.coupleNames || ''} · Published by Lavisti`}
            </p>
          </footer>
        </PrintReveal>

      </div>
    </div>
  );
}
