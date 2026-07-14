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

export default function MinimalEditorialLayout({ initialGuestName }:{ initialGuestName?: string }) {
  const spacer = <div className="h-16 md:h-24" />;
  return (
    <div className="minimal-editorial-layout bg-background py-16 px-6 max-w-4xl mx-auto space-y-12 divide-y divide-border/30">
      <div><HeroSection guestName={initialGuestName} /></div>
      {spacer}
      <div className="pt-12"><GreetingSection guestName={initialGuestName} /></div>
      {spacer}
      <div className="pt-12"><DetailsSection /></div>
      {spacer}
      <div className="pt-12"><TimelineSection /></div>
      {spacer}
      <div className="pt-12"><GallerySection /></div>
      {spacer}
      <div className="pt-12"><MapSection /></div>
      {spacer}
      <div className="pt-12"><RSVPSection guestName={initialGuestName} /></div>
      {spacer}
      <div className="pt-12"><GiftSection /></div>
      {spacer}
      <div className="pt-12"><WishesSection guestName={initialGuestName} /></div>
      {spacer}
      <div className="pt-12"><ContactSection /></div>
    </div>
  );
}
