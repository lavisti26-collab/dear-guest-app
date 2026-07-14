/**
 * KhmerTraditionalLayout.tsx
 *
 * A complete redesign of the Khmer Traditional invitation layout.
 *
 * DESIGN PHILOSOPHY:
 * This layout should feel like a physical Khmer wedding invitation:
 * heavyweight matte stock, debossed gold foil borders, 4–6 panel fold-out.
 * Every section is a discrete panel — like lifting a card from an envelope.
 *
 * WHAT'S DIFFERENT FROM THE OLD LAYOUT:
 * - data-layout="khmer-traditional" activates layout-khmer.css
 * - data-visual-style="royal-khmer" gives HeroSection its correct overlay
 * - Each section is wrapped in KbachFrame (ornamental SVG borders)
 * - Opening masthead: bilingual title strip + top ornamental band
 * - Emoji decorations (✦ ✨ ❋) replaced with SVG LotusIcon / KbachDiamond
 * - RSVP elevated to a full-width wax-seal CTA at the bottom
 * - Ceremony-paced motion: 800ms expo ease-out, no spring bounce
 * - Closing seal with lotus ornament
 */

import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { applyVisualStyle } from '@/contexts/VisualStyleContext';
import HeroSection from '@/components/wedding/HeroSection';
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
// No spring bounce. Expo ease-out — like a curtain parting.
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
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay, ease: CEREMONY_EASE }}
    >
      {children}
    </motion.div>
  );
}

// ─── Opening masthead ornament ─────────────────────────────────────────────
// The "edition header" of the invitation — institution name, date line.
function KhmerMasthead() {
  const { lang } = useLanguage();
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className="kt-masthead text-center mb-0"
      initial={prefersReduced ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.0, ease: CEREMONY_EASE }}
    >
      {/* Eyebrow line */}
      <p
        className="kt-masthead__eyebrow"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontVariant: 'small-caps',
          fontSize: '0.62rem',
          letterSpacing: '0.45em',
          textTransform: 'uppercase',
          color: KT_RED,
          marginBottom: '12px',
        }}
      >
        {lang === 'km' ? 'ពិធីមង្គលការ' : 'Wedding Invitation'}
      </p>

      {/* Top ornamental band */}
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
          color: KT_GOLD,
        }}
      >
        <KbachDivider />
      </div>
    </motion.div>
  );
}

// ─── Section label strip ───────────────────────────────────────────────────
// Printed before each KbachFrame panel — like a chapter tab in a program.
interface SectionLabelProps {
  enLabel: string;
  kmLabel: string;
}

function SectionLabel({ enLabel, kmLabel }: SectionLabelProps) {
  const { lang } = useLanguage();
  return (
    <div
      className="flex items-center gap-3 mb-0 mt-12"
      aria-hidden="true"
    >
      {/* Left rule */}
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${KT_GOLD}60)` }}
      />
      {/* Label */}
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontVariant: 'small-caps',
          fontSize: '0.62rem',
          letterSpacing: '0.38em',
          textTransform: 'uppercase',
          color: KT_RED,
          flexShrink: 0,
        }}
      >
        {lang === 'km' ? kmLabel : enLabel}
      </span>
      {/* Right rule */}
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(to left, transparent, ${KT_GOLD}60)` }}
      />
    </div>
  );
}

// ─── Closing seal ──────────────────────────────────────────────────────────
function ClosingSeal() {
  const { lang } = useLanguage();
  const prefersReduced = useReducedMotion();
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
        {/* Closing text */}
        <p
          className="kt-closing-seal__text"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            color: '#B8892A',
            marginTop: '16px',
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
  // Frame gold/ink — use CSS tokens where possible, explicit fallbacks here
  const gold = KT_GOLD;
  const ink  = KT_RED;

  // Apply royal-khmer visual style so HeroSection reads the correct overlay.
  // Restore the previous data-visual-style on unmount to avoid contaminating
  // other layouts (e.g. when navigating back to ClassicScroll).
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
    // data-layout activates layout-khmer.css
    // data-visual-style activates the correct HeroSection overlay (royal-khmer)
    <div
      data-layout="khmer-traditional"
      data-visual-style="royal-khmer"
      className="khmer-traditional-layout"
      style={{ background: '#FDF6EC', minHeight: '100vh' }}
    >
      {/* ── Full-width hero — no frame, bleeds edge-to-edge ── */}
      <HeroSection />

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
        {/* Opening masthead */}
        <KhmerMasthead />

        {/* ── Greeting ── */}
        <SectionLabel enLabel="Dear Guest" kmLabel="ជូនដំណឹង" />
        <CeremonyReveal delay={0}>
          <KbachFrame variant="full" gold={gold} ink={ink} className="kt-panel">
            <GreetingSection guestName={initialGuestName} />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Wedding Details / Countdown ── */}
        <SectionLabel enLabel="The Ceremony" kmLabel="ពិធីការ" />
        <CeremonyReveal delay={0.05}>
          <KbachFrame variant="full" gold={gold} ink={ink} className="kt-panel">
            <DetailsSection />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Program timeline ── */}
        <SectionLabel enLabel="Program" kmLabel="កម្មវិធី" />
        <CeremonyReveal delay={0.05}>
          <KbachFrame variant="cap" gold={gold} ink={ink} className="kt-panel">
            <TimelineSection />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Gallery ── */}
        <SectionLabel enLabel="Memories" kmLabel="រូបភាព" />
        <CeremonyReveal delay={0.05}>
          <KbachFrame variant="cap" gold={gold} ink={ink} className="kt-panel">
            <GallerySection />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Map / Venue ── */}
        <SectionLabel enLabel="Venue" kmLabel="ទីកន្លែង" />
        <CeremonyReveal delay={0.05}>
          <KbachFrame variant="full" gold={gold} ink={ink} className="kt-panel">
            <MapSection />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Gift / QR ── */}
        <SectionLabel enLabel="Gift" kmLabel="គ្រឿងបរិក្ខារ" />
        <CeremonyReveal delay={0.05}>
          <KbachFrame variant="full" gold={gold} ink={ink} className="kt-panel">
            <GiftSection />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Wishes ── */}
        <SectionLabel enLabel="Wishes" kmLabel="ជូនពរ" />
        <CeremonyReveal delay={0.05}>
          <KbachFrame variant="cap" gold={gold} ink={ink} className="kt-panel">
            <WishesSection guestName={initialGuestName} />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── Contacts ── */}
        <SectionLabel enLabel="Contact" kmLabel="ទំនាក់ទំនង" />
        <CeremonyReveal delay={0.05}>
          <KbachFrame variant="full" gold={gold} ink={ink} className="kt-panel">
            <ContactSection />
          </KbachFrame>
        </CeremonyReveal>

        {/* ── RSVP — elevated to a full-width wax-seal CTA ──
             Placed LAST in the scroll so guests read the whole
             invitation before being prompted to respond.
             This matches the physical invitation convention. ── */}
        <SectionLabel enLabel="RSVP" kmLabel="ការឆ្លើយតប" />
        <CeremonyReveal delay={0.05}>
          <div className="kt-rsvp-wrapper" style={{ marginTop: '0' }}>
            {/* Top band only on RSVP — this section is the climax */}
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
