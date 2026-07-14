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
  const cardStyle = "max-w-4xl mx-auto my-10 p-8 bg-white/70 border border-pink-200/50 rounded-[2.5rem] shadow-[0_10px_40px_rgba(244,114,182,0.06)] relative overflow-hidden";
  return (
    <div className="romantic-bloom-layout bg-gradient-to-b from-[#FFF0F2] via-white to-[#FCE7F3] py-12 px-4 relative">
      {/* Background Bokeh Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(252,231,243,0.6)_0%,transparent_50%)] pointer-events-none" />
      
      <div className={cardStyle}><HeroSection guestName={initialGuestName} /></div>
      <div className={cardStyle}><GreetingSection guestName={initialGuestName} /></div>
      <div className={cardStyle}><DetailsSection /></div>
      <div className={cardStyle}><TimelineSection /></div>
      <div className={cardStyle}><GallerySection /></div>
      <div className={cardStyle}><MapSection /></div>
      <div className={cardStyle}><RSVPSection guestName={initialGuestName} /></div>
      <div className={cardStyle}><GiftSection /></div>
      <div className={cardStyle}><WishesSection guestName={initialGuestName} /></div>
      <div className={cardStyle}><ContactSection /></div>
    </div>
  );
}
