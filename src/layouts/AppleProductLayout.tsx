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
  const cardStyle = "max-w-4xl mx-auto my-8 p-6 bg-white/80 border border-slate-200/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md";
  return (
    <div className="apple-product-layout bg-[#f5f5f7] py-12 px-4 space-y-8">
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
