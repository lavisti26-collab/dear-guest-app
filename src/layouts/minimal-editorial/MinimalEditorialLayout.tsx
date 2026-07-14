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

export default function MinimalEditorialLayout({ initialGuestName }:{ initialGuestName?: string }) {
  const cellClass = "py-16 md:py-24 border-b border-neutral-200/60 first:pt-0 last:border-b-0";
  return (
    <div className="minimal-editorial-layout bg-[#FBFBFA] py-12 px-6 sm:px-12 md:px-20 max-w-5xl mx-auto text-neutral-800 antialiased">
      {/* Editorial Title Header */}
      <header className="border-b-[3px] border-neutral-900 pb-8 pt-6 mb-12 text-left">
        <h1 className="font-serif italic font-light text-5xl md:text-7xl leading-tight text-neutral-900 tracking-tight">The Celebration</h1>
        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-neutral-500 mt-2">Special Editorial Edition</p>
      </header>

      <div className={cellClass}><HeroSection guestName={initialGuestName} /></div>
      <div className={cellClass}><GreetingSection guestName={initialGuestName} /></div>
      <div className={cellClass}><DetailsSection /></div>
      <div className={cellClass}><TimelineSection /></div>
      <div className={cellClass}><GallerySection /></div>
      <div className={cellClass}><MapSection /></div>
      <div className={cellClass}><RSVPSection guestName={initialGuestName} /></div>
      <div className={cellClass}><GiftSection /></div>
      <div className={cellClass}><WishesSection guestName={initialGuestName} /></div>
      <div className={cellClass}><ContactSection /></div>
    </div>
  );
}
