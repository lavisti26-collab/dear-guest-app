import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
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

export default function InvitationPage() {
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get('guest') || '';
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  return (
    <LanguageProvider>
      <div className="relative min-h-screen bg-background">
        <EnvelopeAnimation
          guestName={guestName}
          onOpen={() => setEnvelopeOpen(true)}
          isOpen={envelopeOpen}
        />

        {envelopeOpen && (
          <>
            <FallingPetals />
            <FloatingHearts />
            <FloatingDaisies />
            <SparkleEffect />
            <CuteEmojiRain />
            <EmojiTrail />
            <ThemeAnimations />
            <LanguageSwitcher />
            <MusicToggle />

            <main className="relative z-[1]">
              <HeroSection />
              <SectionReveal><GreetingSection guestName={guestName} /></SectionReveal>
              <SectionReveal><DetailsSection /></SectionReveal>
              <SectionReveal><TimelineSection /></SectionReveal>
              <SectionReveal><GallerySection /></SectionReveal>
              <SectionReveal><MapSection /></SectionReveal>
              <SectionReveal><RSVPSection guestName={guestName} /></SectionReveal>
              <SectionReveal><GiftSection /></SectionReveal>
              <SectionReveal><WishesSection /></SectionReveal>
              <SectionReveal><ContactSection /></SectionReveal>

              <SectionReveal>
                <footer className="pb-10 pt-6 text-center">
                  <div className="section-divider mb-4" />
                  <p className="font-display text-sm italic text-muted-foreground">Made with love ♡</p>
                </footer>
              </SectionReveal>
            </main>
          </>
        )}
      </div>
    </LanguageProvider>
  );
}
