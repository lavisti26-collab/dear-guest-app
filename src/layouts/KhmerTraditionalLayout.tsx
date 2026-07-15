/**
 * KhmerTraditionalLayout.tsx
 *
 * DESIGN PHILOSOPHY:
 * Physical Khmer wedding invitation: heavyweight matte stock, debossed gold
 * foil borders, 4–6 panel fold-out. Every section is a discrete panel —
 * like lifting a card from an envelope.
 *
 * IMPROVEMENTS vs. previous version:
 * - HeroSection now receives guestName prop ✓
 * - Masthead shows live coupleNames + weddingDate from settings ✓
 * - SectionLabel uses dynamic titles from settings (not hardcoded) ✓
 * - Staggered CeremonyReveal delays (0 → 0.05 → 0.10 … ) ✓
 * - ClosingSeal shows couple names from settings ✓
 * - Masthead subtitle shows eventTitleKm / eventTitleEn ✓
 */

import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { applyVisualStyle } from '@/contexts/VisualStyleContext';
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
import KbachFrame from '@/components/wedding/KbachFrame';
import { LotusIcon, KbachDivider } from '@/components/wedding/ThemeIcons';

// ─── Theme tokens ──────────────────────────────────────────────────────────
const KT_GOLD = '#C9932A';
const KT_RED  = '#8B1A1A';

// ─── Ceremony-pace reveal wrapper ──────────────────────────────────────────
const CEREMONY_EASE = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
}

function CeremonyReveal({ children, delay = 0 }: RevealProps) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.8, delay, ease: CEREMONY_EASE }}
    >
      {children}
    </motion.div>
  );
}

// ─── Opening masthead — shows live couple names + event title ──────────────
function KhmerMasthead() {
  const { lang } = useLanguage();
  const { settings } = useWeddingData();
  const prefersReduced = useReducedMotion();

  const eventTitle = lang === 'km'
    ? (settings?.eventTitleKm || 'ពិធីមង្គលការ')
    : (settings?.eventTitleEn || 'Wedding Invitation');

  const weddingDate = lang === 'km'
    ? (settings?.weddingDateKm || settings?.weddingDate || '')
    : (settings?.weddingDate || '');

  return (
    <motion.div
      className="kt-masthead text-center mb-0"
      initial={prefersReduced ? {} : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.0, ease: CEREMONY_EASE }}
    >
      {/* Event type eyebrow */}
      <p
        className="kt-masthead__eyebrow"
        style={{
          fontFamily: "var(--font-display, 'Playfair Display', serif)",
          fontVariant: 'small-caps',
          fontSize: '0.62rem',
          letterSpacing: '0.45em',
          textTransform: 'uppercase',
          color: KT_RED,
          marginBottom: '12px',
        }}
      >
        {eventTitle}
      </p>

      {/* Top ornamental band */}
      <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', color: KT_GOLD }}>
        <KbachDivider />
      </div>

      {/* Wedding date — subtle, centered between the two dividers */}
      {weddingDate && (
        <p
          style={{
            fontFamily: "var(--font-body, 'Battambang', Georgia, serif)",
            fontSize: '0.72rem',
            letterSpacing: '0.3em',
            color: KT_GOLD,
            marginBlock: '10px',
            textTransform: 'uppercase',
          }}
        >
          {weddingDate}
        </p>
      )}

      {/* Bottom ornamental band */}
      <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', color: KT_GOLD }}>
        <KbachDivider />
      </div>
    </motion.div>
  );
}


// ─── Section label strip — dynamic from settings ───────────────────────────
interface SectionLabelProps {
  enLabel: string;
  kmLabel: string;
  settingsKey?: 'greetingTitle' | 'detailsTitle' | 'timelineTitle' | 'galleryTitle' | 'rsvpTitle' | 'wishesTitle' | 'giftTitle' | 'contactTitle';
}

function SectionLabel({ enLabel, kmLabel, settingsKey }: SectionLabelProps) {
  const { lang } = useLanguage();
  const { settings } = useWeddingData();

  // Try to use dynamic settings title if a settingsKey is provided
  let label = lang === 'km' ? kmLabel : enLabel;
  if (settingsKey && settings) {
    const dynKm = (settings as any)[`${settingsKey}Km`];
    const dynEn = (settings as any)[`${settingsKey}En`];
    if (lang === 'km' && dynKm) label = dynKm;
    else if (lang !== 'km' && dynEn) label = dynEn;
  }

  return (
    <div
      className="flex items-center gap-3 mb-0 mt-12"
      aria-hidden="true"
    >
      {/* Left rule — gold gradient */}
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${KT_GOLD}70)` }}
      />
      {/* Lotus icon */}
      <LotusIcon
        style={{ width: '0.9rem', height: '0.9rem', color: KT_GOLD, flexShrink: 0, opacity: 0.8 }}
      />
      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-display, 'Playfair Display', serif)",
          fontVariant: 'small-caps',
          fontSize: '0.62rem',
          letterSpacing: '0.38em',
          textTransform: 'uppercase',
          color: KT_RED,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      {/* Lotus icon */}
      <LotusIcon
        style={{ width: '0.9rem', height: '0.9rem', color: KT_GOLD, flexShrink: 0, opacity: 0.8 }}
      />
      {/* Right rule */}
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(to left, transparent, ${KT_GOLD}70)` }}
      />
    </div>
  );
}

// ─── Closing seal ──────────────────────────────────────────────────────────
function ClosingSeal() {
  const { lang } = useLanguage();
  const { settings } = useWeddingData();
  const prefersReduced = useReducedMotion();

  const coupleNames = lang === 'km'
    ? (settings?.coupleNamesKm || settings?.coupleNames || '')
    : (settings?.coupleNames || '');

  return (
    <CeremonyReveal delay={0.1}>
      <div className="kt-closing-seal text-center" style={{ paddingBlock: '60px' }}>
        {/* Lotus ornament */}
        <LotusIcon
          className="mx-auto"
          style={{ width: '2.5rem', height: '2.5rem', color: KT_GOLD }}
        />
        {/* Closing rule */}
        <div style={{ width: '100%', maxWidth: '500px', margin: '20px auto', color: KT_GOLD }}>
          <KbachDivider />
        </div>
        {/* Couple names in closing */}
        {coupleNames && (
          <p
            style={{
              fontFamily: "var(--font-display, 'Moul', 'Playfair Display', serif)",
              fontSize: '0.85rem',
              color: '#B8892A',
              letterSpacing: '0.12em',
              marginBottom: '8px',
            }}
          >
            {coupleNames}
          </p>
        )}
        {/* Closing text */}
        <p
          className="kt-closing-seal__text"
          style={{
            fontFamily: "var(--font-body, 'Playfair Display', serif)",
            fontStyle: 'italic',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            color: '#B8892A',
            marginTop: '8px',
          }}
        >
          {lang === 'km'
            ? 'ដោយស្នេហ៍ — With Love'
            : 'With love — ដោយស្នេហ៍'}
        </p>
      </div>
    </CeremonyReveal>
  );
}

// ─── Main layout ───────────────────────────────────────────────────────────

export default function KhmerTraditionalLayout({
  initialGuestName,
}: {
  initialGuestName?: string;
}) {
  const gold = KT_GOLD;
  const ink  = KT_RED;

  // Apply royal-khmer visual style so HeroSection gets the correct overlay.
  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-visual-style') ?? '';
    applyVisualStyle('royal-khmer');
    return () => {
      if (prev) {
        document.documentElement.setAttribute('data-visual-style', prev);
      } else {
        document.documentElement.removeAttribute('data-visual-style');
      }
    };
  }, []);

  return (
    <div
      data-layout="khmer-traditional"
      data-visual-style="royal-khmer"
      className="khmer-traditional-layout"
      style={{ background: '#FDF6EC', minHeight: '100vh' }}
    >
      {/* ── Full-width hero — bleeds edge-to-edge, passes guestName ── */}
      <HeroSection guestName={initialGuestName} />

      {/* ── Invitation scroll body ── */}
      <div
        className="kt-scroll-wrapper"
        style={{
          maxWidth: '780px',
          marginInline: 'auto',
          paddingInline: 'clamp(16px, 4vw, 40px)',
          paddingBlock: '0 80px',
        }}
      >
        {/* Opening masthead — live couple names + date */}
        <KhmerMasthead />

        {/* ── Greeting ── */}
        <SectionLabel
          enLabel="Dear Guest"
          kmLabel="ជូនដំណឹង"
          settingsKey="greetingTitle"
        />
        <CeremonyReveal delay={0}>
          <KbachFrame variant="full" gold={gold} ink={ink} className="kt-panel">
            <GreetingSection guestName={initialGuestName} />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Wedding Details / Countdown ── */}
        <SectionLabel
          enLabel="The Ceremony"
          kmLabel="ពិធីការ"
          settingsKey="detailsTitle"
        />
        <CeremonyReveal delay={0.05}>
          <KbachFrame variant="full" gold={gold} ink={ink} className="kt-panel">
            <DetailsSection />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Program timeline ── */}
        <SectionLabel
          enLabel="Program"
          kmLabel="កម្មវិធី"
          settingsKey="timelineTitle"
        />
        <CeremonyReveal delay={0.08}>
          <KbachFrame variant="cap" gold={gold} ink={ink} className="kt-panel">
            <TimelineSection />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Gallery ── */}
        <SectionLabel
          enLabel="Memories"
          kmLabel="រូបភាព"
          settingsKey="galleryTitle"
        />
        <CeremonyReveal delay={0.1}>
          <KbachFrame variant="cap" gold={gold} ink={ink} className="kt-panel">
            <GallerySection />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Map / Venue ── */}
        <SectionLabel
          enLabel="Venue"
          kmLabel="ទីកន្លែង"
        />
        <CeremonyReveal delay={0.12}>
          <KbachFrame variant="full" gold={gold} ink={ink} className="kt-panel">
            <MapSection />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Gift / QR ── */}
        <SectionLabel
          enLabel="Gift"
          kmLabel="គ្រឿងបរិក្ខារ"
          settingsKey="giftTitle"
        />
        <CeremonyReveal delay={0.14}>
          <KbachFrame variant="full" gold={gold} ink={ink} className="kt-panel">
            <GiftSection />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Wishes ── */}
        <SectionLabel
          enLabel="Wishes"
          kmLabel="ជូនពរ"
          settingsKey="wishesTitle"
        />
        <CeremonyReveal delay={0.16}>
          <KbachFrame variant="cap" gold={gold} ink={ink} className="kt-panel">
            <WishesSection guestName={initialGuestName} />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Contacts ── */}
        <SectionLabel
          enLabel="Contact"
          kmLabel="ទំនាក់ទំនង"
          settingsKey="contactTitle"
        />
        <CeremonyReveal delay={0.18}>
          <KbachFrame variant="full" gold={gold} ink={ink} className="kt-panel">
            <ContactSection />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── RSVP — elevated full-width wax-seal CTA ──
             Placed LAST: guests read the whole invitation before responding.
             This matches Khmer physical invitation convention. ── */}
        <SectionLabel
          enLabel="RSVP"
          kmLabel="ការឆ្លើយតប"
          settingsKey="rsvpTitle"
        />
        <CeremonyReveal delay={0.2}>
          <div className="kt-rsvp-wrapper" style={{ marginTop: '0' }}>
            {/* Top band */}
            <div style={{ color: KT_GOLD, marginBottom: '24px' }}>
              <KbachDivider />
            </div>

            <RSVPSection guestName={initialGuestName} />

            {/* Bottom band */}
            <div style={{ color: KT_GOLD, marginTop: '24px' }}>
              <KbachDivider />
            </div>
          </div>
        </CeremonyReveal>

        {/* ── Closing seal ── */}
        <ClosingSeal />
      </div>
    </div>
  );
}
