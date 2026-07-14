import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
import { KbachDivider, LotusIcon, KbachDiamond } from '@/components/wedding/ThemeIcons';

// ─── Animation ease (gentle, editorial) ────────────────────────────────────
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.75, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

// ─── Ornamental separator ───────────────────────────────────────────────────────
function SectionDivider({ lotus = false }: { lotus?: boolean }) {
  return (
    <div className="relative flex items-center justify-center my-10 sm:my-14 px-6">
      {/* Side rules */}
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,147,42,0.5))' }} />
      <div className="mx-4 flex items-center gap-2" style={{ color: 'rgba(201,147,42,0.65)' }}>
        {lotus ? (
          <LotusIcon className="w-6 h-6" />
        ) : (
          <>
            <KbachDiamond className="w-4 h-4" />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(201,147,42,0.5)' }} />
            <KbachDiamond className="w-4 h-4" />
          </>
        )}
      </div>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(201,147,42,0.5))' }} />
    </div>
  );
}

// ─── Parchment section wrapper ──────────────────────────────────────────────
function ParchmentCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      relative max-w-3xl mx-auto
      bg-gradient-to-b from-[#2a1f14]/80 to-[#241a0f]/85
      backdrop-blur-sm
      border border-[#C9932A]/20
      rounded-[1.5rem] sm:rounded-[2rem]
      shadow-[0_8px_40px_rgba(0,0,0,0.35),0_1px_4px_rgba(0,0,0,0.2)]
      overflow-hidden
      ${className}
    `}>
      {/* Top decorative accent bar */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#C9932A]/50 to-transparent" />
      {/* Corner ornaments */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[#C9932A]/30 rounded-tl-sm" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-[#C9932A]/30 rounded-tr-sm" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-[#C9932A]/30 rounded-bl-sm" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-[#C9932A]/30 rounded-br-sm" />
      {children}
    </div>
  );
}

// ─── Open (no card) section wrapper ────────────────────────────────────────
function OpenSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4">
      {children}
    </div>
  );
}

export default function ClassicScrollLayout({ initialGuestName }: { initialGuestName?: string }) {
  return (
    <div
      className="classic-scroll-layout relative min-h-screen"
      style={{
        // Deep warm dark — matches the floral hero, flows naturally into sections
        background: 'linear-gradient(180deg, #16100a 0%, #1e1508 18%, #231a0c 35%, #1a1208 55%, #120d06 80%, #0e0a04 100%)',
      }}
    >
      {/* ── Grain texture for depth ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      {/* ── Warm radial glows — like candlelight ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Top center warm glow — bridges hero bottom */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(ellipse, rgba(180,110,30,0.18) 0%, transparent 70%)' }} />
        {/* Mid left */}
        <div className="absolute top-[55%] left-0 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(140,80,20,0.12) 0%, transparent 70%)' }} />
        {/* Mid right */}
        <div className="absolute top-[72%] right-0 w-[350px] h-[350px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, rgba(160,100,25,0.10) 0%, transparent 70%)' }} />
        {/* Bottom warm pool */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(120,70,15,0.15) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 px-4 sm:px-6 pb-20">

        {/* ── HERO ──────────────────────────────────────────────── */}
        <HeroSection guestName={initialGuestName} />

        {/* ── GREETING ──────────────────────────────────────────── */}
        <ScrollReveal delay={0.05}>
          <div className="pt-4 pb-2">
            <OpenSection>
              <GreetingSection guestName={initialGuestName} />
            </OpenSection>
          </div>
        </ScrollReveal>

        <SectionDivider lotus />

        {/* ── DETAILS ───────────────────────────────────────────── */}
        <ScrollReveal>
          <ParchmentCard>
            <DetailsSection />
          </ParchmentCard>
        </ScrollReveal>

        <SectionDivider />

        {/* ── TIMELINE / PROGRAM ────────────────────────────────── */}
        <ScrollReveal delay={0.05}>
          <OpenSection>
            <TimelineSection />
          </OpenSection>
        </ScrollReveal>

        <SectionDivider lotus />

        {/* ── GALLERY ───────────────────────────────────────────── */}
        <ScrollReveal>
          <ParchmentCard>
            <GallerySection />
          </ParchmentCard>
        </ScrollReveal>

        <SectionDivider />

        {/* ── MAP ───────────────────────────────────────────────── */}
        <ScrollReveal delay={0.05}>
          <OpenSection>
            <MapSection />
          </OpenSection>
        </ScrollReveal>

        <SectionDivider lotus />

        {/* ── RSVP ──────────────────────────────────────────────── */}
        <ScrollReveal>
          <ParchmentCard className="ring-1 ring-accent/20">
            <RSVPSection guestName={initialGuestName} />
          </ParchmentCard>
        </ScrollReveal>

        <SectionDivider />

        {/* ── GIFT ──────────────────────────────────────────────── */}
        <ScrollReveal delay={0.05}>
          <OpenSection>
            <GiftSection />
          </OpenSection>
        </ScrollReveal>

        <SectionDivider lotus />

        {/* ── WISHES ────────────────────────────────────────────── */}
        <ScrollReveal>
          <ParchmentCard>
            <WishesSection guestName={initialGuestName} />
          </ParchmentCard>
        </ScrollReveal>

        <SectionDivider />

        {/* ── CONTACT ───────────────────────────────────────────── */}
        <ScrollReveal delay={0.05}>
          <OpenSection>
            <ContactSection />
          </OpenSection>
        </ScrollReveal>

        {/* ── CLOSING SEAL ──────────────────────────────────────── */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-col items-center gap-3 mt-16 mb-4" style={{ color: 'rgba(201,147,42,0.55)' }}>
            <div className="flex items-center gap-3">
              <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(201,147,42,0.5))' }} />
              <LotusIcon className="w-8 h-8" />
              <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(201,147,42,0.5))' }} />
            </div>
            <KbachDivider className="w-48 opacity-50" />
            <p className="text-[10px] uppercase tracking-[0.3em] font-medium mt-1" style={{ color: 'rgba(201,147,42,0.5)' }}>
              With Love &amp; Gratitude
            </p>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
