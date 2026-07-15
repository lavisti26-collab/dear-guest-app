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

export default function CardStackLayout({ initialGuestName }:{ initialGuestName?: string }) {
  const cardBase = "max-w-xl mx-auto p-6 sm:p-8 bg-card border border-border/80 shadow-luxury rounded-3xl relative transition-all duration-300 hover:scale-[1.01] hover:z-20";
  return (
    <div className="card-stack-layout bg-[#F8F9FA] py-16 px-4 space-y-0 overflow-hidden">
      <div className={`${cardBase} z-[10]`}><HeroSection guestName={initialGuestName} /></div>
      <div className={`${cardBase} z-[11] -mt-8 sm:-mt-10 rotate-1`}><GreetingSection guestName={initialGuestName} /></div>
      <div className={`${cardBase} z-[12] -mt-8 sm:-mt-10 -rotate-1`}><DetailsSection /></div>
      <div className={`${cardBase} z-[13] -mt-8 sm:-mt-10 rotate-1.5`}><TimelineSection /></div>
      <div className={`${cardBase} z-[14] -mt-8 sm:-mt-10 -rotate-0.5`}><GallerySection /></div>
      <div className={`${cardBase} z-[15] -mt-8 sm:-mt-10 rotate-0.5`}><MapSection /></div>
      <div className={`${cardBase} z-[16] -mt-8 sm:-mt-10 -rotate-1`}><RSVPSection guestName={initialGuestName} /></div>
      <div className={`${cardBase} z-[17] -mt-8 sm:-mt-10 rotate-1`}><GiftSection /></div>
      <div className={`${cardBase} z-[18] -mt-8 sm:-mt-10 -rotate-1.5`}><WishesSection guestName={initialGuestName} /></div>
      <div className={`${cardBase} z-[19] -mt-8 sm:-mt-10 rotate-0.5`}><ContactSection /></div>
    </div>
  );
}
