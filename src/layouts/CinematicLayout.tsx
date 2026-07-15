/**
 * CinematicLayout.tsx — ROMANTIC GLASS-CINEMA EDITION
 *
 * DESIGN: Widescreen presentation where the couple's Hero Photo covers the entire background.
 * - Full-screen fixed background photo (settings.heroImage or first gallery photo)
 * - Frosted glass overlay (backdrop-blur + warm white mask) to keep text legible
 * - Highly transparent, floating glassmorphic viewport cards so guests can see through to the photo
 * - Sleek gold progress indicator at the top
 * - Snap-to-viewport scrolling with Intersection Observer sync
 * - Scoped CSS overrides to re-skin all sub-components into elegant transparent glass style
 */

import React, { useState, useEffect, useRef } from 'react';
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

export default function CinematicLayout({ initialGuestName }: { initialGuestName?: string }) {
  const { lang } = useLanguage();
  const { settings, photos } = useWeddingData();
  const [activeSlide, setActiveSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const sections = [
    { key: 'hero', titleEn: 'Home', titleKm: 'ទំព័រដើម', comp: <HeroSection guestName={initialGuestName} /> },
    { key: 'greeting', titleEn: 'Invitation', titleKm: 'ការអញ្ជើញ', comp: <GreetingSection guestName={initialGuestName} /> },
    { key: 'details', titleEn: 'Details', titleKm: 'ព័ត៌មានលម្អិត', comp: <DetailsSection /> },
    { key: 'timeline', titleEn: 'Program', titleKm: 'កម្មវិធីលម្អិត', comp: <TimelineSection /> },
    { key: 'gallery', titleEn: 'Gallery', titleKm: 'រូបភាព', comp: <GallerySection /> },
    { key: 'map', titleEn: 'Map', titleKm: 'ផែនទីណែនាំ', comp: <MapSection /> },
    { key: 'rsvp', titleEn: 'RSVP', titleKm: 'ឆ្លើយតប', comp: <RSVPSection guestName={initialGuestName} /> },
    { key: 'gift', titleEn: 'Gift', titleKm: 'អំណោយ', comp: <GiftSection /> },
    { key: 'wishes', titleEn: 'Wishes', titleKm: 'សារជូនពរ', comp: <WishesSection guestName={initialGuestName} /> },
    { key: 'contact', titleEn: 'Contact', titleKm: 'ទំនាក់ទំនង', comp: <ContactSection /> },
  ];

  // 1. Sync data-layout attribute for target styles
  useEffect(() => {
    document.documentElement.setAttribute('data-layout', 'cinematic');
    return () => document.documentElement.removeAttribute('data-layout');
  }, []);

  // 2. Use Intersection Observer to detect current snap slide on scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observerOptions = {
      root: container,
      rootMargin: '0px',
      threshold: 0.6,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sections.findIndex((s) => `slide-${s.key}` === entry.target.id);
          if (index !== -1) {
            setActiveSlide(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    sections.forEach((s) => {
      const el = document.getElementById(`slide-${s.key}`);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  const handleDotClick = (key: string, index: number) => {
    const el = document.getElementById(`slide-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSlide(index);
    }
  };

  const handleNextClick = (index: number) => {
    if (index + 1 < sections.length) {
      handleDotClick(sections[index + 1].key, index + 1);
    }
  };

  // Get background image URL
  const bgImageUrl = settings?.heroImage || (photos && photos.length > 0 ? photos[0].url : '');

  // Progress percentage
  const progressPercent = ((activeSlide + 1) / sections.length) * 100;

  return (
    <>
      {/* Scoped CSS to skin nested content into elegant white/gold glassmorphic look */}
      <style>{`
        [data-layout="cinematic"] {
          --cl-bg: #FAF6EE;
          --cl-card-bg: rgba(255, 255, 255, 0.72);
          --cl-border: rgba(201, 147, 42, 0.35);
          --cl-accent: #b8892a;
          --cl-text-primary: #1a0a00;
          --cl-text-secondary: #5a4b3b;
          background-color: var(--cl-bg);
          color: var(--cl-text-primary);
        }

        /* ── Re-skin standard layout cards into frosted white glass ── */
        [data-layout="cinematic"] .card,
        [data-layout="cinematic"] [class*="rounded-3xl"].p-6,
        [data-layout="cinematic"] [class*="rounded-2xl"].p-6,
        [data-layout="cinematic"] [class*="bg-white"],
        [data-layout="cinematic"] [class*="bg-card"],
        [data-layout="cinematic"] .luxury-card {
          background-color: var(--cl-card-bg) !important;
          backdrop-filter: blur(20px) saturate(130%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(130%) !important;
          border: 1px solid rgba(255, 255, 255, 0.45) !important;
          color: var(--cl-text-primary) !important;
          box-shadow: 0 10px 40px -15px rgba(26, 10, 0, 0.12) !important;
        }

        /* ── Inner headings ── */
        [data-layout="cinematic"] h2,
        [data-layout="cinematic"] h3,
        [data-layout="cinematic"] h4 {
          color: var(--cl-accent) !important;
        }

        [data-layout="cinematic"] p,
        [data-layout="cinematic"] span,
        [data-layout="cinematic"] label {
          color: var(--cl-text-primary) !important;
        }

        [data-layout="cinematic"] .text-muted-foreground {
          color: var(--cl-text-secondary) !important;
        }

        /* ── Timeline items ── */
        [data-layout="cinematic"] .timeline-box {
          background-color: rgba(255, 255, 255, 0.6) !important;
          border: 1px solid rgba(201, 147, 42, 0.2) !important;
        }
        [data-layout="cinematic"] .timeline-middle span {
          background-color: #ffffff !important;
          border-color: var(--cl-accent) !important;
        }

        /* ── Form fields ── */
        [data-layout="cinematic"] input,
        [data-layout="cinematic"] select,
        [data-layout="cinematic"] textarea {
          background-color: rgba(255, 255, 255, 0.65) !important;
          border-color: rgba(201, 147, 42, 0.25) !important;
          color: var(--cl-text-primary) !important;
        }

        /* ── Wish cards ── */
        [data-layout="cinematic"] [class*="wish-card"],
        [data-layout="cinematic"] .kt-wish-card {
          background-color: rgba(255, 255, 255, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          border-left: 3px solid var(--cl-accent) !important;
        }

        /* ── Submit buttons ── */
        [data-layout="cinematic"] button[type="submit"],
        [data-layout="cinematic"] .btn-primary {
          background: linear-gradient(135deg, #d4af37 0%, #b8892a 100%) !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          border: none !important;
          text-shadow: none !important;
        }

        /* ── Scrollbar removal ── */
        .cinematic-container::-webkit-scrollbar {
          display: none;
        }
        .cinematic-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ══ Full-Screen Fixed Background Image ══════════════════════════════ */}
      {bgImageUrl && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url(${bgImageUrl})` }}
        />
      )}

      {/* ══ Frosted Overlay Mask to keep background warm, clean, and text legible ══ */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-white/20 backdrop-blur-[3px]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,248,235,0.15) 30%, rgba(255,248,235,0.45) 100%)',
        }}
      />

      {/* ══ Top progress bar indicator ════════════════════════════════════════ */}
      <div className="fixed top-0 inset-x-0 h-1.5 bg-white/30 z-50">
        <motion.div
          className="h-full bg-gradient-to-right"
          style={{
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #b8892a, #d4af37)',
          }}
          layoutId="cinematicProgress"
        />
      </div>

      {/* ══ Main Snap-Scroll Container ════════════════════════════════════════ */}
      <div
        ref={containerRef}
        className="cinematic-container snap-y snap-mandatory overflow-y-scroll h-screen w-full relative z-10 scroll-smooth"
      >
        {sections.map((s, idx) => {
          const isHero = s.key === 'hero';
          return (
            <section
              id={`slide-${s.key}`}
              key={s.key}
              className="snap-start min-h-screen w-full flex items-center justify-center relative py-12 px-4"
            >
              {/* Overlay container card: Only wrap other sections into custom glass wrappers.
                  Hero handles its own fullscreen overlay. */}
              {isHero ? (
                <div className="w-full max-w-4xl">
                  {s.comp}
                </div>
              ) : (
                <div className="w-full max-w-2xl bg-white/72 border border-white/50 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                  {/* Subtle golden corner highlights */}
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#b8892a]/50" />
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#b8892a]/50" />
                  <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#b8892a]/50" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#b8892a]/50" />

                  {/* Micro index indicator */}
                  <div className="flex justify-between items-center mb-6 border-b border-[#b8892a]/15 pb-3 text-[10px] uppercase tracking-[0.2em] font-mono text-[#7a6a57]">
                    <span>{lang === 'km' ? s.titleKm : s.titleEn}</span>
                    <span>{idx + 1} / {sections.length}</span>
                  </div>

                  {s.comp}

                  {/* Animated Next Indicator caret */}
                  {idx + 1 < sections.length && (
                    <div className="flex justify-center mt-6 pt-4 border-t border-[#b8892a]/10">
                      <button
                        onClick={() => handleNextClick(idx)}
                        className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[#b8892a] hover:text-[#d4af37] transition-colors group cursor-pointer focus:outline-none"
                      >
                        <span>{lang === 'km' ? 'បន្តទៅមុខ' : 'NEXT SECTION'}</span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="w-3 h-3 animate-bounce mt-0.5 group-hover:translate-y-0.5 transition-transform"
                        >
                          <path d="M12 5v14M19 12l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* ══ Sidebar Interactive Dot Navigation (Desktop) ═════════════════════ */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3 bg-white/45 backdrop-blur-md p-4 rounded-full border border-[#b8892a]/15 shadow-xl">
        {sections.map((s, idx) => {
          const isActive = activeSlide === idx;
          const label = lang === 'km' ? s.titleKm : s.titleEn;
          return (
            <button
              key={s.key}
              onClick={() => handleDotClick(s.key, idx)}
              className="group relative flex items-center justify-center w-3 h-3 focus:outline-none"
              title={label}
            >
              {/* Floating label tag on hover */}
              <span className="absolute right-7 bg-white/90 border border-[#b8892a]/20 text-[#1a0a00] text-[9px] uppercase tracking-wider px-2 py-0.5 rounded opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap font-mono">
                {label}
              </span>

              {/* Central dot */}
              <span
                className={`rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-3 h-3 bg-gradient-to-br from-[#d4af37] to-[#b8892a] scale-110 shadow-[0_0_8px_rgba(201,147,42,0.4)]'
                    : 'w-2 h-2 bg-neutral-400 group-hover:bg-neutral-500'
                }`}
              />
            </button>
          );
        })}
      </div>
    </>
  );
}
