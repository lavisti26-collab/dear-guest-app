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

export default function CinematicLayout({ initialGuestName }:{ initialGuestName?: string }) {
  const slideClass = "snap-start h-screen w-full overflow-y-auto flex flex-col justify-center py-10 px-4 scrollbar-none";
  return (
    <div className="cinematic-layout snap-y snap-mandatory overflow-y-scroll h-screen bg-background">
      <section className={slideClass}><HeroSection guestName={initialGuestName} /></section>
      <section className={slideClass}><GreetingSection guestName={initialGuestName} /></section>
      <section className={slideClass}><DetailsSection /></section>
      <section className={slideClass}><TimelineSection /></section>
      <section className={slideClass}><GallerySection /></section>
      <section className={slideClass}><MapSection /></section>
      <section className={slideClass}><RSVPSection guestName={initialGuestName} /></section>
      <section className={slideClass}><GiftSection /></section>
      <section className={slideClass}><WishesSection guestName={initialGuestName} /></section>
      <section className={slideClass}><ContactSection /></section>
    </div>
  );
}
