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
  const blockClass = "border-2 border-neutral-950 p-6 bg-[#FAF9F5] shadow-[4px_4px_0px_#111] my-8";
  return (
    <div className="newspaper-layout max-w-4xl mx-auto py-12 px-4 bg-[#F2F0E8] text-neutral-900">
      {/* Newspaper masthead header */}
      <div className="border-b-4 border-neutral-950 text-center py-6 mb-8">
        <h1 className="font-display text-4xl font-black uppercase tracking-wider text-neutral-950">THE WEDDING POST</h1>
        <p className="text-xs uppercase tracking-widest mt-1 font-semibold">Special Edition • Live Celebration</p>
      </div>

      <div className={blockClass}><HeroSection guestName={initialGuestName} /></div>
      <div className={blockClass}><GreetingSection guestName={initialGuestName} /></div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className={blockClass}><DetailsSection /></div>
        <div className={blockClass}><TimelineSection /></div>
      </div>

      <div className={blockClass}><GallerySection /></div>
      <div className={blockClass}><MapSection /></div>
      <div className={blockClass}><RSVPSection guestName={initialGuestName} /></div>
      <div className={blockClass}><GiftSection /></div>
      <div className={blockClass}><WishesSection guestName={initialGuestName} /></div>
      <div className={blockClass}><ContactSection /></div>
    </div>
  );
}
