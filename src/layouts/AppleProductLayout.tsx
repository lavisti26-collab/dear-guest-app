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

export default function AppleProductLayout({ initialGuestName }:{ initialGuestName?: string }) {
  const sectionClass = "max-w-5xl mx-auto py-16 md:py-24 px-6 border-b border-zinc-800 last:border-b-0";
  return (
    <div className="apple-product-layout bg-black text-[#f5f5f7] min-h-screen font-sans tracking-tight antialiased">
      {/* Spec Hero Header */}
      <header className="py-12 border-b border-zinc-800 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white">The New Wedding</h1>
        <p className="text-sm md:text-lg text-zinc-400 mt-2 font-medium">Thin. Light. Together.</p>
      </header>

      <div className={sectionClass}><HeroSection guestName={initialGuestName} /></div>
      <div className={sectionClass}><GreetingSection guestName={initialGuestName} /></div>
      <div className={sectionClass}><DetailsSection /></div>
      <div className={sectionClass}><TimelineSection /></div>
      <div className={sectionClass}><GallerySection /></div>
      <div className={sectionClass}><MapSection /></div>
      <div className={sectionClass}><RSVPSection guestName={initialGuestName} /></div>
      <div className={sectionClass}><GiftSection /></div>
      <div className={sectionClass}><WishesSection guestName={initialGuestName} /></div>
      <div className={sectionClass}><ContactSection /></div>
    </div>
  );
}
