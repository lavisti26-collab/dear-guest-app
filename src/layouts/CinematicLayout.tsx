import React, { useState } from 'react';
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

export default function CinematicLayout({ initialGuestName }:{ initialGuestName?: string }) {
  const slideClass = "snap-start min-h-screen w-full flex flex-col justify-center py-16 px-4 scrollbar-none relative";
  const [activeSlide, setActiveSlide] = useState(0);

  const sections = [
    { key: 'hero', comp: <HeroSection guestName={initialGuestName} /> },
    { key: 'greeting', comp: <GreetingSection guestName={initialGuestName} /> },
    { key: 'details', comp: <DetailsSection /> },
    { key: 'timeline', comp: <TimelineSection /> },
    { key: 'gallery', comp: <GallerySection /> },
    { key: 'map', comp: <MapSection /> },
    { key: 'rsvp', comp: <RSVPSection guestName={initialGuestName} /> },
    { key: 'gift', comp: <GiftSection /> },
    { key: 'wishes', comp: <WishesSection guestName={initialGuestName} /> },
    { key: 'contact', comp: <ContactSection /> },
  ];

  return (
    <div className="cinematic-layout snap-y snap-mandatory overflow-y-scroll h-screen bg-background relative">
      {/* Floating Indicator Dots */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-2.5 bg-black/10 backdrop-blur-sm p-3 rounded-full border border-white/10">
        {sections.map((s, idx) => (
          <button
            key={s.key}
            onClick={() => {
              const el = document.getElementById(`slide-${s.key}`);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              setActiveSlide(idx);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeSlide === idx ? 'bg-accent scale-125' : 'bg-muted-foreground/45 hover:bg-muted-foreground/75'}`}
            title={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {sections.map((s, idx) => (
        <section 
          id={`slide-${s.key}`} 
          key={s.key} 
          className={slideClass}
          onMouseEnter={() => setActiveSlide(idx)}
        >
          {s.comp}
        </section>
      ))}
    </div>
  );
}
