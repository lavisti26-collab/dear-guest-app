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

export default function RomanticBloomLayout({ initialGuestName }:{ initialGuestName?: string }) {
  const cardStyle = "max-w-4xl mx-auto my-10 p-8 bg-white/60 border border-pink-200/40 rounded-[2rem] shadow-[0_10px_40px_rgba(244,114,182,0.04)] backdrop-blur-md relative overflow-hidden";
  const openStyle = "max-w-4xl mx-auto my-14 p-4 text-center";
  return (
    <div className="romantic-bloom-layout bg-gradient-to-b from-[#FFF5F6] via-white to-[#FDF2F8] py-12 px-4 relative">
      {/* Radial Light Source Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(253,242,248,0.7)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_65%,rgba(255,241,242,0.7)_0%,transparent_60%)] pointer-events-none" />
      
      <div className={cardStyle}><HeroSection guestName={initialGuestName} /></div>
      <div className={openStyle}><GreetingSection guestName={initialGuestName} /></div>
      <div className={cardStyle}><DetailsSection /></div>
      <div className={openStyle}><TimelineSection /></div>
      <div className={cardStyle}><GallerySection /></div>
      <div className={openStyle}><MapSection /></div>
      <div className={cardStyle}><RSVPSection guestName={initialGuestName} /></div>
      <div className={openStyle}><GiftSection /></div>
      <div className={cardStyle}><WishesSection guestName={initialGuestName} /></div>
      <div className={openStyle}><ContactSection /></div>
    </div>
  );
}
