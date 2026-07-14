import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import EnvelopeAnimation from '@/components/wedding/EnvelopeAnimation';
import FallingPetals from '@/components/wedding/FallingPetals';
import FloatingHearts from '@/components/wedding/FloatingHearts';
import FloatingDaisies from '@/components/wedding/FloatingDaisies';
import SparkleEffect from '@/components/wedding/SparkleEffect';
import CuteEmojiRain from '@/components/wedding/CuteEmojiRain';
import EmojiTrail from '@/components/wedding/EmojiTrail';
import ThemeAnimations from '@/components/wedding/ThemeAnimations';
import LanguageSwitcher from '@/components/wedding/LanguageSwitcher';
import MusicToggle from '@/components/wedding/MusicToggle';
import FloatingNavBar from '@/components/wedding/FloatingNavBar';
import HeroSection from '@/components/wedding/HeroSection';
import GreetingSection from '@/components/wedding/GreetingSection';
import TimelineSection from '@/components/wedding/TimelineSection';
import GallerySection from '@/components/wedding/GallerySection';
import DetailsSection from '@/components/wedding/DetailsSection';
import MapSection from '@/components/wedding/MapSection';
import RSVPSection from '@/components/wedding/RSVPSection';
import GiftSection from '@/components/wedding/GiftSection';
import ContactSection from '@/components/wedding/ContactSection';
import WishesSection from '@/components/wedding/WishesSection';
import SectionReveal from '@/components/wedding/SectionReveal';
import ClassicScrollLayout from '@/layouts/ClassicScrollLayout';
import CinematicLayout from '@/layouts/CinematicLayout';
import MinimalEditorialLayout from '@/layouts/MinimalEditorialLayout';
import RomanticBloomLayout from '@/layouts/RomanticBloomLayout';
import KhmerTraditionalLayout from '@/layouts/KhmerTraditionalLayout';
import CardStackLayout from '@/layouts/CardStackLayout';
import NewspaperLayout from '@/layouts/NewspaperLayout';
import AppleProductLayout from '@/layouts/AppleProductLayout';
import injectFontFaces from '@/lib/font-loader';

function normalizeGuestName(rawName?: string) {
  if (!rawName) return '';
  try {
    return decodeURIComponent(rawName).replace(/[-_]+/g, ' ').trim();
  } catch {
    return rawName.replace(/[-_]+/g, ' ').trim();
  }
}

function InvitationContent({ initialGuestName }: { initialGuestName?: string }) {
  const [searchParams] = useSearchParams();

  const rawGuestName = (searchParams.get('guest')?.trim() || initialGuestName || '').trim();
  const guestName = normalizeGuestName(rawGuestName);
  const showEnvelope = searchParams.get('envelope') !== '0';
  const { ready, settings } = useWeddingData();
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const hideMain = showEnvelope && !envelopeOpen;

  useEffect(() => {
    const pair = settings?.fontPair || 'elegant-serif';
    try { injectFontFaces(pair); } catch (e) { /* ignore */ }
  }, [settings?.fontPair]);

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading your invitation…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      {showEnvelope && (
        <EnvelopeAnimation
          guestName={guestName}
          onOpen={() => setEnvelopeOpen(true)}
          isOpen={envelopeOpen}
        />
      )}


      <div className={hideMain ? 'sr-only' : undefined} aria-hidden={hideMain}>
          <>
            {/* Conditional Ambiance Effects for high-performance mobile scrolling */}
            {settings?.coupleCardConfig?.ambiance === 'flowers' && <FallingPetals />}
            {settings?.coupleCardConfig?.ambiance === 'roses' && <FallingPetals />}
            {settings?.coupleCardConfig?.ambiance === 'hearts' && <FloatingHearts />}
            {settings?.coupleCardConfig?.ambiance === 'sparkles' && <SparkleEffect />}
            {(settings?.coupleCardConfig?.ambiance === 'butterflies' || 
              settings?.coupleCardConfig?.ambiance === 'stars' || 
              settings?.coupleCardConfig?.ambiance === 'diamonds' || 
              settings?.coupleCardConfig?.ambiance === 'bokeh') && <ThemeAnimations />}
            {/* If no heavy effect is chosen, render lightweight static daisies */}
            {(settings?.coupleCardConfig?.ambiance === 'none' || !settings?.coupleCardConfig?.ambiance) && <FloatingDaisies />}
            
            {/* Optimised Cute Emojis & Interactive mouse/touch trail
                Suppressed for khmer-traditional, newspaper, and apple-product —
                those themes use hand-coded SVG icons or typographic elements,
                no emoji decoration. */}
            {!['khmer-traditional', 'newspaper', 'apple-product'].includes(settings?.layoutTemplate ?? '') && <CuteEmojiRain />}
            {!['khmer-traditional', 'newspaper', 'apple-product'].includes(settings?.layoutTemplate ?? '') && <EmojiTrail />}
            <LanguageSwitcher />
            <MusicToggle />
            <FloatingNavBar />

            <main className="relative z-[1]">
              {
                (() => {
                  const layoutKey = settings?.layoutTemplate || 'classic-scroll';
                  const map: Record<string, any> = {
                    'classic-scroll': ClassicScrollLayout,
                    cinematic: CinematicLayout,
                    'minimal-editorial': MinimalEditorialLayout,
                    'romantic-bloom': RomanticBloomLayout,
                    'khmer-traditional': KhmerTraditionalLayout,
                    'card-stack': CardStackLayout,
                    newspaper: NewspaperLayout,
                    'apple-product': AppleProductLayout,
                  };
                  const Chosen = map[layoutKey] || ClassicScrollLayout;
                  return <Chosen initialGuestName={guestName} />;
                })()
              }
            </main>
          </>
      </div>
    </div>
  );
}

export default function InvitationPage({ initialGuestName }: { initialGuestName?: string }) {
  return (
    <LanguageProvider>
      <InvitationContent initialGuestName={initialGuestName} />
    </LanguageProvider>
  );
}
