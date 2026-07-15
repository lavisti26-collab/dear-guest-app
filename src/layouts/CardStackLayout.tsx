/**
 * CardStackLayout.tsx — ULTIMATE PREMIUM CARD STACK EDITION
 *
 * DESIGN: Styled like an open binder deck of luxury hand-made cotton paper cards.
 * - Warm canvas/ linen textured background (#FAF8F5).
 * - Left-aligned binder ring spine that connects the cards visually like a leather planner.
 * - Alternating subtle rotation offsets on cards that hover-stabilize to 0.
 * - Interactive card-index tabs on the right side of the deck.
 * - Scoped CSS overrides to reskin all sub-components into a clean cotton/gold theme:
 *   - Cards: luxury textured cream matte background with thin gold borders.
 *   - Inputs: clean warm cream-gold borders.
 *   - Buttons: elegant gold-foil gradient.
 *   - Timeline nodes: styled with golden star points.
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

export default function CardStackLayout({ initialGuestName }: { initialGuestName?: string }) {
  const { lang } = useLanguage();
  const { settings } = useWeddingData();

  // Sync data-layout attribute for targeted styles
  useEffect(() => {
    document.documentElement.setAttribute('data-layout', 'card-stack');
    return () => document.documentElement.removeAttribute('data-layout');
  }, []);

  const cardBase = "max-w-xl mx-auto p-6 sm:p-8 bg-[#FDFBF7] border border-[#D4AF37]/25 shadow-[0_8px_30px_rgba(180,140,90,0.06)] rounded-3xl relative transition-all duration-500 hover:scale-[1.015] hover:rotate-0 hover:z-30 hover:shadow-[0_15px_40px_rgba(180,140,90,0.12)]";

  return (
    <div className="card-stack-layout bg-[#FAF8F5] py-16 px-4 space-y-12 overflow-hidden relative font-sans tracking-tight antialiased">
      {/* Scoped CSS overrides to reskin widgets into a premium card-stack binder design */}
      <style>{`
        [data-layout="card-stack"] {
          --cs-bg-card: #FDFBF7;
          --cs-border: rgba(212, 175, 55, 0.25);
          --cs-accent: #C4912A;
          --cs-text-primary: #2C2620;
          --cs-text-secondary: #7C6D60;
        }

        /* ── Re-skin standard layout cards into cotton/gold textured blocks (excluding the Hero card) ── */
        [data-layout="card-stack"] :not(#hero) .card,
        [data-layout="card-stack"] :not(#hero) [class*="rounded-3xl"].p-6,
        [data-layout="card-stack"] :not(#hero) [class*="rounded-2xl"].p-6,
        [data-layout="card-stack"] :not(#hero) [class*="bg-white"],
        [data-layout="card-stack"] :not(#hero) [class*="bg-card"],
        [data-layout="card-stack"] :not(#hero) .luxury-card {
          background-color: var(--cs-bg-card) !important;
          border: 1px solid var(--cs-border) !important;
          color: var(--cs-text-primary) !important;
          box-shadow: 0 4px 15px rgba(180, 140, 90, 0.04) !important;
          border-radius: 20px !important;
        }

        /* ── Hide duplicate inner headings and lines ── */
        [data-layout="card-stack"] #details h2,
        [data-layout="card-stack"] #details .section-divider,
        [data-layout="card-stack"] #timeline h2,
        [data-layout="card-stack"] #timeline .section-divider,
        [data-layout="card-stack"] #gallery h2,
        [data-layout="card-stack"] #gallery .section-divider,
        [data-layout="card-stack"] #rsvp h2,
        [data-layout="card-stack"] #rsvp .section-divider,
        [data-layout="card-stack"] #rsvp .max-w-lg > div > div:nth-child(5),
        [data-layout="card-stack"] #gift h2,
        [data-layout="card-stack"] #gift .section-divider,
        [data-layout="card-stack"] #wishes h2,
        [data-layout="card-stack"] #wishes .section-divider,
        [data-layout="card-stack"] #contact h2,
        [data-layout="card-stack"] #contact .section-divider {
          display: none !important;
        }

        /* ── Remove raw section padding/bg ── */
        [data-layout="card-stack"] section {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* ── Cotton typography override ── */
        [data-layout="card-stack"] h2,
        [data-layout="card-stack"] h3,
        [data-layout="card-stack"] h4 {
          color: var(--cs-text-primary) !important;
        }

        [data-layout="card-stack"] p,
        [data-layout="card-stack"] span,
        [data-layout="card-stack"] label {
          color: var(--cs-text-primary) !important;
        }

        [data-layout="card-stack"] .text-muted-foreground {
          color: var(--cs-text-secondary) !important;
        }

        /* ── Form inputs reskin ── */
        [data-layout="card-stack"] input,
        [data-layout="card-stack"] select,
        [data-layout="card-stack"] textarea {
          background-color: #ffffff !important;
          border-color: #E6DFD3 !important;
          color: var(--cs-text-primary) !important;
          border-radius: 12px !important;
        }
        [data-layout="card-stack"] input:focus,
        [data-layout="card-stack"] select:focus,
        [data-layout="card-stack"] textarea:focus {
          border-color: var(--cs-accent) !important;
          box-shadow: 0 0 0 3px rgba(196, 145, 42, 0.12) !important;
        }

        /* ── Submit button reskin (Elegant gold gradient) ── */
        [data-layout="card-stack"] button[type="submit"],
        [data-layout="card-stack"] .btn-primary {
          background: linear-gradient(135deg, #D4A76A 0%, #C4912A 50%, #D4A76A 100%) !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          border: none !important;
          border-radius: 9999px !important;
          box-shadow: 0 4px 15px rgba(196, 145, 42, 0.25) !important;
          transition: all 0.25s ease !important;
        }
        [data-layout="card-stack"] button[type="submit"]:hover,
        [data-layout="card-stack"] .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(196, 145, 42, 0.35) !important;
        }

        /* ── Timeline nodes (Gold dots) ── */
        [data-layout="card-stack"] .timeline-box {
          background-color: #FDFBF7 !important;
          border: 1px solid var(--cs-border) !important;
        }
        [data-layout="card-stack"] .timeline-middle span {
          background-color: #FDFBF7 !important;
          border-color: #C4912A !important;
        }

        /* ── Wishes / congratulations list ── */
        [data-layout="card-stack"] [class*="wish-card"],
        [data-layout="card-stack"] .kt-wish-card {
          background-color: #FDFBF7 !important;
          border: 1px solid var(--cs-border) !important;
          border-left: 3.5px solid #C4912A !important;
        }
      `}</style>

      {/* 1. Binder ring spine visualization on the left (scroll side) */}
      <div className="absolute top-0 bottom-0 left-3 w-px bg-zinc-300 z-40 hidden sm:block">
        {/* Binder metal rings looping every 280px */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-[-6px] w-4 h-6 rounded-full border-2 border-zinc-400 bg-gradient-to-r from-zinc-200 to-zinc-400 shadow-sm"
            style={{ top: `${i * 280 + 120}px` }}
          />
        ))}
      </div>

      {/* ══ 1. Intro Hero Card ══ */}
      <div className={`${cardBase} z-[10]`} style={{ transform: 'rotate(0.3deg)' }}>
        {/* Index Tab */}
        <span className="absolute top-4 right-[-10px] bg-[#C4912A] text-white text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-l-md uppercase select-none shadow-sm">
          INDEX 01
        </span>
        <HeroSection guestName={initialGuestName} />
      </div>

      {/* ══ 2. Greeting Section ══ */}
      <div className={`${cardBase} z-[11] -mt-10`} style={{ transform: 'rotate(-0.6deg)' }}>
        <span className="absolute top-4 right-[-10px] bg-[#C4912A] text-white text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-l-md uppercase select-none shadow-sm">
          INDEX 02
        </span>
        <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">
          {lang === 'km' ? 'លិខិតអញ្ជើញមង្គលការ' : 'GREETINGS & WELCOME'}
        </div>
        <GreetingSection guestName={initialGuestName} />
      </div>

      {/* ══ 3. Event Details ══ */}
      <div className={`${cardBase} z-[12] -mt-10`} style={{ transform: 'rotate(0.5deg)' }}>
        <span className="absolute top-4 right-[-10px] bg-[#C4912A] text-white text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-l-md uppercase select-none shadow-sm">
          INDEX 03
        </span>
        <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">
          {lang === 'km' ? 'ព័ត៌មានលម្អិតនៃពិធីការ' : 'THE CELEBRATION SCHEDULE'}
        </div>
        <DetailsSection />
      </div>

      {/* ══ 4. Timeline Chronology ══ */}
      <div className={`${cardBase} z-[13] -mt-10`} style={{ transform: 'rotate(-0.5deg)' }}>
        <span className="absolute top-4 right-[-10px] bg-[#C4912A] text-white text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-l-md uppercase select-none shadow-sm">
          INDEX 04
        </span>
        <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">
          {lang === 'km' ? 'កម្មវិធីលម្អិត' : 'EVENT CHRONOLOGY'}
        </div>
        <TimelineSection />
      </div>

      {/* ══ 5. Photo Gallery ══ */}
      <div className={`${cardBase} z-[14] -mt-10`} style={{ transform: 'rotate(0.4deg)' }}>
        <span className="absolute top-4 right-[-10px] bg-[#C4912A] text-white text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-l-md uppercase select-none shadow-sm">
          INDEX 05
        </span>
        <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">
          {lang === 'km' ? 'រូបថតអនុស្សាវរីយ៍' : 'CAPTURED GALLERY'}
        </div>
        <GallerySection />
      </div>

      {/* ══ 6. Maps & Directions ══ */}
      <div className={`${cardBase} z-[15] -mt-10`} style={{ transform: 'rotate(-0.4deg)' }}>
        <span className="absolute top-4 right-[-10px] bg-[#C4912A] text-white text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-l-md uppercase select-none shadow-sm">
          INDEX 06
        </span>
        <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">
          {lang === 'km' ? 'សេចក្ដីណែនាំទីតាំង' : 'THE LOCATION INDEX'}
        </div>
        <MapSection />
      </div>

      {/* ══ 7. Gift Registry ══ */}
      <div className={`${cardBase} z-[16] -mt-10`} style={{ transform: 'rotate(0.6deg)' }}>
        <span className="absolute top-4 right-[-10px] bg-[#C4912A] text-white text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-l-md uppercase select-none shadow-sm">
          INDEX 07
        </span>
        <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">
          {lang === 'km' ? 'ចងដៃមង្គលការ' : 'BLESSINGS REGISTRY'}
        </div>
        <GiftSection />
      </div>

      {/* ══ 8. RSVP Panel ══ */}
      <div className={`${cardBase} z-[17] -mt-10`} style={{ transform: 'rotate(-0.8deg)' }}>
        <span className="absolute top-4 right-[-10px] bg-[#C4912A] text-white text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-l-md uppercase select-none shadow-sm">
          INDEX 08
        </span>
        <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">
          {lang === 'km' ? 'ឆ្លើយតបការអញ្ជើញ' : 'RSVP GATEWAY'}
        </div>
        <RSVPSection guestName={initialGuestName} />
      </div>

      {/* ══ 9. Wishes Feed ══ */}
      <div className={`${cardBase} z-[18] -mt-10`} style={{ transform: 'rotate(0.3deg)' }}>
        <span className="absolute top-4 right-[-10px] bg-[#C4912A] text-white text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-l-md uppercase select-none shadow-sm">
          INDEX 09
        </span>
        <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">
          {lang === 'km' ? 'ពាក្យជូនពរពីភ្ញៀវ' : 'CONGRATULATORY WISHES'}
        </div>
        <WishesSection guestName={initialGuestName} />
      </div>

      {/* ══ 10. Contact Details ══ */}
      <div className={`${cardBase} z-[19] -mt-10`} style={{ transform: 'rotate(-0.3deg)' }}>
        <span className="absolute top-4 right-[-10px] bg-[#C4912A] text-white text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-l-md uppercase select-none shadow-sm">
          INDEX 10
        </span>
        <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">
          {lang === 'km' ? 'ព័ត៌មានទំនាក់ទំនង' : 'SUPPORT LINES'}
        </div>
        <ContactSection />
      </div>
    </div>
  );
}
