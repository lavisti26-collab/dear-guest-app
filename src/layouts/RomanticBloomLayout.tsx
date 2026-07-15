/**
 * RomanticBloomLayout.tsx — LUXURY FLORAL EDITORIAL EDITION
 *
 * DESIGN: Styled like a high-end luxury floral editorial brochure.
 * - Soft blush/lavender-pink gradient background with radial light overflows.
 * - Delicate gold rose outline dividers between sections.
 * - Scoped CSS overrides to re-skin all sub-components into a gorgeous blush-glass theme:
 *   - Cards: frosted white-pink with thin rose-gold borders.
 *   - Inputs: soft pink-tinted backgrounds with gold outlines.
 *   - Buttons: rose-pink gradient pill buttons.
 *   - Timeline nodes: styled with warm rose-blossom points.
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

// Premium golden rose flower divider SVG
const RoseDivider = () => (
  <div className="flex items-center justify-center gap-3 py-8 w-full select-none pointer-events-none opacity-80">
    <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#E0A899]" />
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#E0A899]">
      <path
        d="M12 2C11.5 4 10 5.5 8 6C10 6.5 11.5 8 12 10C12.5 8 14 6.5 16 6C14 5.5 12.5 4 12 2Z"
        fill="currentColor"
      />
      <circle cx="12" cy="14" r="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 17V22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10 19C9 19 8 18.5 8 17.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
    <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#E0A899]" />
  </div>
);

export default function RomanticBloomLayout({ initialGuestName }: { initialGuestName?: string }) {
  const { lang } = useLanguage();
  const { settings } = useWeddingData();

  // Sync data-layout attribute for targeted styles
  useEffect(() => {
    document.documentElement.setAttribute('data-layout', 'romantic-bloom');
    return () => document.documentElement.removeAttribute('data-layout');
  }, []);

  const sectionClass = "max-w-4xl mx-auto py-10 px-4 sm:px-6 relative z-10";

  return (
    <div className="romantic-bloom-layout bg-gradient-to-b from-[#FFFDFB] via-[#FFF0F2] to-[#FAF2F8] min-h-screen py-12 px-4 relative overflow-hidden font-sans tracking-tight antialiased">
      {/* Scoped CSS overrides to reskin widgets into a premium blush-floral design */}
      <style>{`
        [data-layout="romantic-bloom"] {
          --rb-bg-card: rgba(255, 255, 255, 0.76);
          --rb-border: rgba(244, 114, 182, 0.28);
          --rb-accent: #EC4899;
          --rb-text-primary: #5C4A4D;
          --rb-text-secondary: #8C7377;
        }

        /* ── Re-skin standard layout cards into frosted pink-blush blocks (excluding the Hero card) ── */
        [data-layout="romantic-bloom"] :not(#hero) .card,
        [data-layout="romantic-bloom"] :not(#hero) [class*="rounded-3xl"].p-6,
        [data-layout="romantic-bloom"] :not(#hero) [class*="rounded-2xl"].p-6,
        [data-layout="romantic-bloom"] :not(#hero) [class*="bg-white"],
        [data-layout="romantic-bloom"] :not(#hero) [class*="bg-card"],
        [data-layout="romantic-bloom"] :not(#hero) .luxury-card {
          background-color: var(--rb-bg-card) !important;
          border: 1px solid var(--rb-border) !important;
          backdrop-filter: blur(16px) saturate(110%) !important;
          -webkit-backdrop-filter: blur(16px) saturate(110%) !important;
          color: var(--rb-text-primary) !important;
          box-shadow: 0 10px 40px -10px rgba(244, 114, 182, 0.12) !important;
          border-radius: 24px !important;
        }

        /* ── Hide duplicate inner headings and lines ── */
        [data-layout="romantic-bloom"] #details h2,
        [data-layout="romantic-bloom"] #details .section-divider,
        [data-layout="romantic-bloom"] #timeline h2,
        [data-layout="romantic-bloom"] #timeline .section-divider,
        [data-layout="romantic-bloom"] #gallery h2,
        [data-layout="romantic-bloom"] #gallery .section-divider,
        [data-layout="romantic-bloom"] #rsvp h2,
        [data-layout="romantic-bloom"] #rsvp .section-divider,
        [data-layout="romantic-bloom"] #rsvp .max-w-lg > div > div:nth-child(5),
        [data-layout="romantic-bloom"] #gift h2,
        [data-layout="romantic-bloom"] #gift .section-divider,
        [data-layout="romantic-bloom"] #wishes h2,
        [data-layout="romantic-bloom"] #wishes .section-divider,
        [data-layout="romantic-bloom"] #contact h2,
        [data-layout="romantic-bloom"] #contact .section-divider {
          display: none !important;
        }

        /* ── Remove raw section padding/bg ── */
        [data-layout="romantic-bloom"] section {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* ── Soft typography override ── */
        [data-layout="romantic-bloom"] h2,
        [data-layout="romantic-bloom"] h3,
        [data-layout="romantic-bloom"] h4 {
          color: var(--rb-text-primary) !important;
        }

        [data-layout="romantic-bloom"] p,
        [data-layout="romantic-bloom"] span,
        [data-layout="romantic-bloom"] label {
          color: var(--rb-text-primary) !important;
        }

        [data-layout="romantic-bloom"] .text-muted-foreground {
          color: var(--rb-text-secondary) !important;
        }

        /* ── Form inputs reskin ── */
        [data-layout="romantic-bloom"] input,
        [data-layout="romantic-bloom"] select,
        [data-layout="romantic-bloom"] textarea {
          background-color: rgba(255, 255, 255, 0.85) !important;
          border-color: rgba(244, 114, 182, 0.4) !important;
          color: var(--rb-text-primary) !important;
          border-radius: 14px !important;
        }
        [data-layout="romantic-bloom"] input:focus,
        [data-layout="romantic-bloom"] select:focus,
        [data-layout="romantic-bloom"] textarea:focus {
          border-color: var(--rb-accent) !important;
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.15) !important;
        }

        /* ── Submit button reskin ── */
        [data-layout="romantic-bloom"] button[type="submit"],
        [data-layout="romantic-bloom"] .btn-primary {
          background: linear-gradient(135deg, #F472B6 0%, #E11D48 100%) !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          border: none !important;
          border-radius: 9999px !important;
          box-shadow: 0 6px 20px rgba(225, 29, 72, 0.25) !important;
          transition: all 0.25s ease !important;
        }
        [data-layout="romantic-bloom"] button[type="submit"]:hover,
        [data-layout="romantic-bloom"] .btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 25px rgba(225, 29, 72, 0.35) !important;
        }

        /* ── Timeline nodes ── */
        [data-layout="romantic-bloom"] .timeline-box {
          background-color: rgba(255, 255, 255, 0.82) !important;
          border: 1px solid var(--rb-border) !important;
        }
        [data-layout="romantic-bloom"] .timeline-middle span {
          background-color: #FFF0F2 !important;
          border-color: #F472B6 !important;
        }

        /* ── Wishes / congratulations list ── */
        [data-layout="romantic-bloom"] [class*="wish-card"],
        [data-layout="romantic-bloom"] .kt-wish-card {
          background-color: rgba(255, 255, 255, 0.72) !important;
          border: 1px solid var(--rb-border) !important;
          border-left: 4px solid #F472B6 !important;
        }
      `}</style>

      {/* Radial soft light overflow background spots */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(251,207,232,0.45)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,rgba(254,205,211,0.45)_0%,transparent_60%)] pointer-events-none" />

      {/* ══ 1. Intro Hero Card ══ */}
      <div className={sectionClass}>
        <HeroSection guestName={initialGuestName} />
      </div>

      <RoseDivider />

      {/* ══ 2. Greeting Section ══ */}
      <div className={sectionClass}>
        <div className="text-[#8C7377] text-xs font-bold uppercase tracking-widest mb-4 text-center">
          {lang === 'km' ? 'លិខិតអញ្ជើញមង្គលការ' : 'GREETINGS & WELCOME'}
        </div>
        <GreetingSection guestName={initialGuestName} />
      </div>

      <RoseDivider />

      {/* ══ 3. Event Details ══ */}
      <div className={sectionClass}>
        <div className="text-[#8C7377] text-xs font-bold uppercase tracking-widest mb-4 text-center">
          {lang === 'km' ? 'ព័ត៌មានលម្អិតនៃពិធីការ' : 'THE CELEBRATION SCHEDULE'}
        </div>
        <DetailsSection />
      </div>

      <RoseDivider />

      {/* ══ 4. Timeline Chronology ══ */}
      <div className={sectionClass}>
        <div className="text-[#8C7377] text-xs font-bold uppercase tracking-widest mb-4 text-center">
          {lang === 'km' ? 'កម្មវិធីលម្អិត' : 'EVENT CHRONOLOGY'}
        </div>
        <TimelineSection />
      </div>

      <RoseDivider />

      {/* ══ 5. Photo Gallery ══ */}
      <div className={sectionClass}>
        <div className="text-[#8C7377] text-xs font-bold uppercase tracking-widest mb-4 text-center">
          {lang === 'km' ? 'រូបថតអនុស្សាវរីយ៍' : 'CAPTURED BLOOM GALLERY'}
        </div>
        <GallerySection />
      </div>

      <RoseDivider />

      {/* ══ 6. Maps & Directions ══ */}
      <div className={sectionClass}>
        <div className="text-[#8C7377] text-xs font-bold uppercase tracking-widest mb-4 text-center">
          {lang === 'km' ? 'សេចក្ដីណែនាំទីតាំង' : 'THE LOCATION INDEX'}
        </div>
        <MapSection />
      </div>

      <RoseDivider />

      {/* ══ 7. Gift Registry ══ */}
      <div className={sectionClass}>
        <div className="text-[#8C7377] text-xs font-bold uppercase tracking-widest mb-4 text-center">
          {lang === 'km' ? 'ចងដៃមង្គលការ' : 'BLESSINGS REGISTRY'}
        </div>
        <GiftSection />
      </div>

      <RoseDivider />

      {/* ══ 8. RSVP Panel ══ */}
      <div className={sectionClass}>
        <div className="text-[#8C7377] text-xs font-bold uppercase tracking-widest mb-4 text-center">
          {lang === 'km' ? 'ឆ្លើយតបការអញ្ជើញ' : 'RSVP GATEWAY'}
        </div>
        <RSVPSection guestName={initialGuestName} />
      </div>

      <RoseDivider />

      {/* ══ 9. Wishes Feed ══ */}
      <div className={sectionClass}>
        <div className="text-[#8C7377] text-xs font-bold uppercase tracking-widest mb-4 text-center">
          {lang === 'km' ? 'ពាក្យជូនពរពីភ្ញៀវ' : 'CONGRATULATORY WISHES'}
        </div>
        <WishesSection guestName={initialGuestName} />
      </div>

      <RoseDivider />

      {/* ══ 10. Contact Details ══ */}
      <div className={sectionClass}>
        <div className="text-[#8C7377] text-xs font-bold uppercase tracking-widest mb-4 text-center">
          {lang === 'km' ? 'ព័ត៌មានទំនាក់ទំនង' : 'SUPPORT LINES'}
        </div>
        <ContactSection />
      </div>
    </div>
  );
}
