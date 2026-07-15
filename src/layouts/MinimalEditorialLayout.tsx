/**
 * MinimalEditorialLayout.tsx — PREMIUM FASHION BROADSHEET EDITION
 *
 * DESIGN: Styled like a high-fashion editorial magazine layout (Vogue / Kinfolk style).
 * - Soft alabaster/warm cotton canvas background (#FAF9F6).
 * - Thin brass/bronze frames, large space gaps, and high-contrast editorial serif headings.
 * - Side index indicators (e.g. [01] / INTRODUCTION, [02] / THE SCHEDULE).
 * - Scoped CSS overrides to re-skin all sub-components into a clean minimal broadsheet design:
 *   - Cards: flat alabaster blocks with thin borders, sharp corners, and no shadows.
 *   - Inputs: flat white with sharp black rectangular boundaries.
 *   - Buttons: flat matte charcoal pill/rectangles.
 *   - Timeline nodes: styled with clean black geometric dots.
 *   - Exempts the Hero Couple Card (#hero) so custom Studio blur/opacity sliders work perfectly.
 */

import React, { useEffect } from 'react';
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

export default function MinimalEditorialLayout({ initialGuestName }: { initialGuestName?: string }) {
  const { lang } = useLanguage();
  const { settings } = useWeddingData();

  // Sync data-layout attribute for targeted styles
  useEffect(() => {
    document.documentElement.setAttribute('data-layout', 'minimal-editorial');
    return () => document.documentElement.removeAttribute('data-layout');
  }, []);

  const coupleNames = settings?.coupleNames || 'Groom & Bride';
  const weddingDate = settings?.weddingDate || '01.07.2026';

  const sectionClass = "max-w-4xl mx-auto py-16 md:py-24 px-6 border-b border-[#E5E5E0] last:border-b-0 relative z-10";

  return (
    <div className="minimal-editorial-layout bg-[#FAF9F6] text-[#1C1917] min-h-screen py-12 px-6 sm:px-12 md:px-20 max-w-5xl mx-auto font-sans tracking-tight antialiased">
      {/* Scoped CSS overrides to reskin widgets into a premium minimal-editorial fashion design */}
      <style>{`
        [data-layout="minimal-editorial"] {
          --me-bg-card: #FAF9F6;
          --me-border: #E5E5E0;
          --me-accent: #1C1917;
          --me-text-primary: #1C1917;
          --me-text-secondary: #706F6C;
        }

        /* ── Re-skin standard layout cards into flat alabaster blocks (excluding the Hero card) ── */
        [data-layout="minimal-editorial"] :not(#hero) .card,
        [data-layout="minimal-editorial"] :not(#hero) [class*="rounded-3xl"].p-6,
        [data-layout="minimal-editorial"] :not(#hero) [class*="rounded-2xl"].p-6,
        [data-layout="minimal-editorial"] :not(#hero) [class*="bg-white"],
        [data-layout="minimal-editorial"] :not(#hero) [class*="bg-card"],
        [data-layout="minimal-editorial"] :not(#hero) .luxury-card {
          background-color: var(--me-bg-card) !important;
          border: 1px solid var(--me-border) !important;
          color: var(--me-text-primary) !important;
          box-shadow: none !important;
          border-radius: 4px !important;
        }

        /* ── Hide duplicate inner headings and lines ── */
        [data-layout="minimal-editorial"] #details h2,
        [data-layout="minimal-editorial"] #details .section-divider,
        [data-layout="minimal-editorial"] #timeline h2,
        [data-layout="minimal-editorial"] #timeline .section-divider,
        [data-layout="minimal-editorial"] #gallery h2,
        [data-layout="minimal-editorial"] #gallery .section-divider,
        [data-layout="minimal-editorial"] #rsvp h2,
        [data-layout="minimal-editorial"] #rsvp .section-divider,
        [data-layout="minimal-editorial"] #rsvp .max-w-lg > div > div:nth-child(5),
        [data-layout="minimal-editorial"] #gift h2,
        [data-layout="minimal-editorial"] #gift .section-divider,
        [data-layout="minimal-editorial"] #wishes h2,
        [data-layout="minimal-editorial"] #wishes .section-divider,
        [data-layout="minimal-editorial"] #contact h2,
        [data-layout="minimal-editorial"] #contact .section-divider {
          display: none !important;
        }

        /* ── Remove raw section padding/bg ── */
        [data-layout="minimal-editorial"] section {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* ── Minimalist typography override ── */
        [data-layout="minimal-editorial"] h2,
        [data-layout="minimal-editorial"] h3,
        [data-layout="minimal-editorial"] h4 {
          color: var(--me-text-primary) !important;
        }

        [data-layout="minimal-editorial"] p,
        [data-layout="minimal-editorial"] span,
        [data-layout="minimal-editorial"] label {
          color: var(--me-text-primary) !important;
        }

        [data-layout="minimal-editorial"] .text-muted-foreground {
          color: var(--me-text-secondary) !important;
        }

        /* ── Form inputs reskin (Sharp rectangles) ── */
        [data-layout="minimal-editorial"] input,
        [data-layout="minimal-editorial"] select,
        [data-layout="minimal-editorial"] textarea {
          background-color: #ffffff !important;
          border: 1px solid var(--me-border) !important;
          color: var(--me-text-primary) !important;
          border-radius: 4px !important;
        }
        [data-layout="minimal-editorial"] input:focus,
        [data-layout="minimal-editorial"] select:focus,
        [data-layout="minimal-editorial"] textarea:focus {
          border-color: var(--me-accent) !important;
          box-shadow: none !important;
        }

        /* ── Submit button reskin (Flat matte charcoal) ── */
        [data-layout="minimal-editorial"] button[type="submit"],
        [data-layout="minimal-editorial"] .btn-primary {
          background: var(--me-accent) !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          border: none !important;
          border-radius: 4px !important;
          box-shadow: none !important;
          transition: all 0.2s ease !important;
        }
        [data-layout="minimal-editorial"] button[type="submit"]:hover,
        [data-layout="minimal-editorial"] .btn-primary:hover {
          background: #383734 !important;
        }

        /* ── Timeline nodes (Clean dots) ── */
        [data-layout="minimal-editorial"] .timeline-box {
          background-color: #FAF9F6 !important;
          border: 1px solid var(--me-border) !important;
        }
        [data-layout="minimal-editorial"] .timeline-middle span {
          background-color: #FAF9F6 !important;
          border-color: #1C1917 !important;
        }

        /* ── Wishes / congratulations list ── */
        [data-layout="minimal-editorial"] [class*="wish-card"],
        [data-layout="minimal-editorial"] .kt-wish-card {
          background-color: #FAF9F6 !important;
          border: 1px solid var(--me-border) !important;
          border-left: 3px solid #1C1917 !important;
        }
      `}</style>

      {/* Editorial Title Header */}
      <header className="border-b-[3px] border-neutral-900 pb-8 pt-6 mb-12 flex items-baseline justify-between select-none">
        <div>
          <h1 className="font-serif italic font-light text-5xl md:text-7xl leading-tight text-neutral-900 tracking-tight">
            {coupleNames}
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-neutral-500 mt-2">
            {lang === 'km' ? 'លិខិតអញ្ជើញមង្គលការសន្លឹកព័ត៌មានលម្អិត' : 'SPECIAL EDITORIAL EDITION'}
          </p>
        </div>
        <span className="font-serif italic text-2xl md:text-4xl text-neutral-400">
          {weddingDate}
        </span>
      </header>

      {/* ══ 1. Intro Hero Card ══ */}
      <div className={sectionClass}>
        <HeroSection guestName={initialGuestName} />
      </div>

      {/* ══ 2. Greeting Section ══ */}
      <div className={sectionClass}>
        <div className="flex gap-4 items-baseline mb-6">
          <span className="font-serif italic text-2xl text-neutral-400">[01]</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#706F6C]">
            {lang === 'km' ? 'លិខិតអញ្ជើញមង្គលការ' : 'GREETINGS & WELCOME'}
          </span>
        </div>
        <GreetingSection guestName={initialGuestName} />
      </div>

      {/* ══ 3. Event Details ══ */}
      <div className={sectionClass}>
        <div className="flex gap-4 items-baseline mb-6">
          <span className="font-serif italic text-2xl text-neutral-400">[02]</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#706F6C]">
            {lang === 'km' ? 'ព័ត៌មានលម្អិតនៃពិធីការ' : 'THE CELEBRATION SCHEDULE'}
          </span>
        </div>
        <DetailsSection />
      </div>

      {/* ══ 4. Timeline Chronology ══ */}
      <div className={sectionClass}>
        <div className="flex gap-4 items-baseline mb-6">
          <span className="font-serif italic text-2xl text-neutral-400">[03]</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#706F6C]">
            {lang === 'km' ? 'កម្មវិធីលម្អិត' : 'EVENT CHRONOLOGY'}
          </span>
        </div>
        <TimelineSection />
      </div>

      {/* ══ 5. Photo Gallery ══ */}
      <div className={sectionClass}>
        <div className="flex gap-4 items-baseline mb-6">
          <span className="font-serif italic text-2xl text-neutral-400">[04]</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#706F6C]">
            {lang === 'km' ? 'រូបថតអនុស្សាវរីយ៍' : 'CAPTURED GALLERY'}
          </span>
        </div>
        <GallerySection />
      </div>

      {/* ══ 6. Maps & Directions ══ */}
      <div className={sectionClass}>
        <div className="flex gap-4 items-baseline mb-6">
          <span className="font-serif italic text-2xl text-neutral-400">[05]</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#706F6C]">
            {lang === 'km' ? 'សេចក្ដីណែនាំទីតាំង' : 'THE LOCATION INDEX'}
          </span>
        </div>
        <MapSection />
      </div>

      {/* ══ 7. Gift Registry ══ */}
      <div className={sectionClass}>
        <div className="flex gap-4 items-baseline mb-6">
          <span className="font-serif italic text-2xl text-neutral-400">[06]</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#706F6C]">
            {lang === 'km' ? 'ចងដៃមង្គលការ' : 'BLESSINGS REGISTRY'}
          </span>
        </div>
        <GiftSection />
      </div>

      {/* ══ 8. RSVP Panel ══ */}
      <div className={sectionClass}>
        <div className="flex gap-4 items-baseline mb-6">
          <span className="font-serif italic text-2xl text-neutral-400">[07]</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#706F6C]">
            {lang === 'km' ? 'ឆ្លើយតបការអញ្ជើញ' : 'RSVP GATEWAY'}
          </span>
        </div>
        <RSVPSection guestName={initialGuestName} />
      </div>

      {/* ══ 9. Wishes Feed ══ */}
      <div className={sectionClass}>
        <div className="flex gap-4 items-baseline mb-6">
          <span className="font-serif italic text-2xl text-neutral-400">[08]</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#706F6C]">
            {lang === 'km' ? 'ពាក្យជូនពរពីភ្ញៀវ' : 'CONGRATULATORY WISHES'}
          </span>
        </div>
        <WishesSection guestName={initialGuestName} />
      </div>

      {/* ══ 10. Contact Details ══ */}
      <div className={sectionClass}>
        <div className="flex gap-4 items-baseline mb-6">
          <span className="font-serif italic text-2xl text-neutral-400">[09]</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#706F6C]">
            {lang === 'km' ? 'ព័ត៌មានទំនាក់ទំនង' : 'SUPPORT LINES'}
          </span>
        </div>
        <ContactSection />
      </div>
    </div>
  );
}
