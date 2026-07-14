import React from 'react';
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

export default function CardStackLayout({ initialGuestName }:{ initialGuestName?: string }) {
  const cardStyle = "max-w-xl mx-auto my-8 p-6 bg-card border border-border/80 shadow-luxury rounded-2xl relative z-10 transition-transform duration-300 hover:scale-[1.01]";
  return (
    <div className="card-stack-layout bg-background py-10 px-4">
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
