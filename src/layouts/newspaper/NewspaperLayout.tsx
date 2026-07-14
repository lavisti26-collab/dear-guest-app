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

export default function NewspaperLayout({ initialGuestName }:{ initialGuestName?: string }) {
  const blockClass = "border border-neutral-900 p-6 bg-[#FAF9F5] shadow-[3px_3px_0px_#111] my-8 font-serif";
  const doubleBorder = "border-y-4 border-double border-neutral-900 py-3 my-6 text-center";
  return (
    <div className="newspaper-layout max-w-4xl mx-auto py-12 px-6 bg-[#F3EFE3] text-neutral-900 antialiased">
      {/* Newspaper masthead header */}
      <div className="text-center py-6 mb-6">
        <h1 className="font-serif text-5xl md:text-6xl font-black uppercase tracking-wider text-neutral-900">THE WEDDING POST</h1>
        <div className={doubleBorder}>
          <p className="text-xs uppercase tracking-[0.3em] font-bold">Special Edition • Live Celebration</p>
        </div>
      </div>

      <div className={blockClass}><HeroSection guestName={initialGuestName} /></div>
      
      {/* Asymmetric layout with drop caps and multiple columns */}
      <div className="grid md:grid-cols-3 gap-6 my-6 items-start">
        <div className={`${blockClass} md:col-span-2`}><GreetingSection guestName={initialGuestName} /></div>
        <div className={blockClass}><DetailsSection /></div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 my-6">
        <div className={blockClass}><TimelineSection /></div>
        <div className={blockClass}><GallerySection /></div>
      </div>

      <div className={blockClass}><MapSection /></div>
      <div className={blockClass}><RSVPSection guestName={initialGuestName} /></div>
      <div className={blockClass}><GiftSection /></div>
      <div className={blockClass}><WishesSection guestName={initialGuestName} /></div>
      <div className={blockClass}><ContactSection /></div>
    </div>
  );
}
