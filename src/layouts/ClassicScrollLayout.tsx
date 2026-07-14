import React from 'react';
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

export default function ClassicScrollLayout({ initialGuestName }:{ initialGuestName?:string }){
  return (
    <main className="classic-scroll-layout">
      <HeroSection guestName={initialGuestName} />
      <div className="ornamental-divider" />
      <GreetingSection guestName={initialGuestName} />
      <DetailsSection />
      <TimelineSection />
      <GallerySection />
      <MapSection />
      <RSVPSection guestName={initialGuestName} />
      <GiftSection />
      <WishesSection guestName={initialGuestName} />
      <ContactSection />
    </main>
  );
}
