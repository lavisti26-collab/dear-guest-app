/**
 * CinematicLayout.tsx — PREMIUM CINE-SLIDESHOW EDITION
 *
 * DESIGN: A widescreen cinematic presentation.
 * - Deep dark charcoal backdrop with radial vignette shadows
 * - Soft warm spotlight/bokeh ambiance background
 * - Widescreen letterbox frame rules on desktop viewports
 * - Stretched gold progress timeline indicator at the top
 * - Snap-to-viewport scrolling with Intersection Observer sync
 * - Glassmorphic viewport cards to contain sections
 * - Scoped CSS overrides to re-skin all sub-components into cinematic dark mode
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { settings } = useWeddingData();
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
      threshold: 0.6, // Slide is active if 60% of it is visible
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

  // Progress percentage
  const progressPercent = ((activeSlide + 1) / sections.length) * 100;

  return (
    <>
      {/* Scoped CSS to skin nested content into cinematic dark-mode */}
      <style>{`
        [data-layout="cinematic"] {
          --cl-bg: #0c0c0e;
          --cl-card-bg: rgba(18, 18, 22, 0.45);
          --cl-border: rgba(212, 175, 55, 0.15);
          --cl-accent: #d4af37;
          --cl-text-primary: #f1f5f9;
          --cl-text-secondary: #94a3b8;
          background-color: var(--cl-bg);
          color: var(--cl-text-primary);
        }

        /* ── Re-skin standard layout cards ── */
        [data-layout="cinematic"] .card,
        [data-layout="cinematic"] [class*="rounded-3xl"].p-6,
        [data-layout="cinematic"] [class*="rounded-2xl"].p-6,
        [data-layout="cinematic"] [class*="bg-white"],
        [data-layout="cinematic"] [class*="bg-card"],
        [data-layout="cinematic"] .luxury-card {
          background-color: var(--cl-card-bg) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border: 1px solid var(--cl-border) !important;
          color: var(--cl-text-primary) !important;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5) !important;
        }

        /* ── Override text colors inside child sections ── */
        [data-layout="cinematic"] h2,
        [data-layout="cinematic"] h3,
        [data-layout="cinematic"] h4 {
          color: var(--cl-accent) !important;
          text-shadow: 0 2px 10px rgba(212, 175, 55, 0.15) !important;
        }

        [data-layout="cinematic"] p,
        [data-layout="cinematic"] span:not(.text-accent-foreground),
        [data-layout="cinematic"] label {
          color: var(--cl-text-primary) !important;
        }

        [data-layout="cinematic"] .text-muted-foreground,
        [data-layout="cinematic"] .text-foreground\/60 {
          color: var(--cl-text-secondary) !important;
        }

        /* ── Timeline adjustments ── */
        [data-layout="cinematic"] .timeline-box {
          background-color: rgba(24, 24, 28, 0.6) !important;
          border: 1px solid rgba(255,255,255,0.06) !important;
        }
        [data-layout="cinematic"] .timeline-middle span {
          background-color: var(--cl-bg) !important;
          border-color: var(--cl-accent) !important;
        }

        /* ── Form field re-skinning ── */
        [data-layout="cinematic"] input,
        [data-layout="cinematic"] select,
        [data-layout="cinematic"] textarea {
          background-color: rgba(10, 10, 12, 0.6) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #ffffff !important;
        }
        [data-layout="cinematic"] input:focus,
        [data-layout="cinematic"] select:focus,
        [data-layout="cinematic"] textarea:focus {
          border-color: var(--cl-accent) !important;
        }

        /* ── Specific wish cards ── */
        [data-layout="cinematic"] [class*="wish-card"],
        [data-layout="cinematic"] .kt-wish-card {
          background-color: rgba(20, 20, 25, 0.5) !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
          border-left: 3px solid var(--cl-accent) !important;
        }

        /* ── Submit button styling ── */
        [data-layout="cinematic"] button[type="submit"],
        [data-layout="cinematic"] .btn-primary {
          background: linear-gradient(135deg, #e5c158 0%, #b89124 100%) !important;
          color: #0c0c0e !important;
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

      {/* ══ Background spotlight gradient ════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0c0c0e]">
        {/* Soft radial spotlights */}
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[70%] bg-[#d4af37]/[0.035] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[70%] bg-[#d4af37]/[0.025] rounded-full blur-[150px]" />
        {/* Dark vignette */}
        <div className="absolute inset-0 bg-radial-vignette opacity-80" style={{ backgroundImage: 'radial-gradient(circle, rgba(12,12,14,0) 30%, rgba(6,6,8,0.92) 100%)' }} />
      </div>

      {/* ══ Cinematic Frame Rules (Letterbox bars) ═══════════════════════════ */}
      <div className="fixed inset-x-0 top-0 h-4 bg-[#060608] z-50 border-b border-white/[0.03] pointer-events-none hidden md:block" />
      <div className="fixed inset-x-0 bottom-0 h-4 bg-[#060608] z-50 border-t border-white/[0.03] pointer-events-none hidden md:block" />

      {/* ══ Top progress bar indicator ════════════════════════════════════════ */}
      <div className="fixed top-0 inset-x-0 h-1 bg-[#1c1c22] z-50">
        <motion.div
          className="h-full bg-gradient-to-right"
          style={{
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #d4af37, #f3dfa2)',
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
              {/* Overlay container card: Only warp other sections into custom glass wrappers.
                  Hero handles its own fullscreen overlay. */}
              {isHero ? (
                <div className="w-full max-w-4xl">
                  {s.comp}
                </div>
              ) : (
                <div className="w-full max-w-2xl bg-black/35 border border-white/[0.08] backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                  {/* Subtle golden corner highlights */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#d4af37]/45" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#d4af37]/45" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#d4af37]/45" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#d4af37]/45" />

                  {/* Micro index indicator */}
                  <div className="flex justify-between items-center mb-6 border-b border-white/[0.05] pb-3 text-[10px] uppercase tracking-[0.2em] font-mono text-neutral-500">
                    <span>{lang === 'km' ? s.titleKm : s.titleEn}</span>
                    <span>{idx + 1} / {sections.length}</span>
                  </div>

                  {s.comp}

                  {/* Animated Next Indicator caret */}
                  {idx + 1 < sections.length && (
                    <div className="flex justify-center mt-6 pt-4 border-t border-white/[0.04]">
                      <button
                        onClick={() => handleNextClick(idx)}
                        className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[#d4af37] hover:text-[#f3dfa2] transition-colors group cursor-pointer focus:outline-none"
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
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3 bg-black/45 backdrop-blur-md p-4 rounded-full border border-white/[0.08] shadow-2xl">
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
              <span className="absolute right-7 bg-black/70 border border-white/10 text-white text-[9px] uppercase tracking-wider px-2 py-0.5 rounded opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap font-mono">
                {label}
              </span>

              {/* Central dot */}
              <span
                className={`rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-3 h-3 bg-gradient-to-br from-[#e5c158] to-[#b89124] scale-110 shadow-[0_0_8px_rgba(212,175,55,0.45)]'
                    : 'w-2 h-2 bg-neutral-600 group-hover:bg-neutral-400'
                }`}
              />
            </button>
          );
        })}
      </div>
    </>
  );
}
