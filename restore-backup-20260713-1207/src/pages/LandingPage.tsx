import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GuestHubContainer from '@/components/layouts/GuestHubContainer';
import PremiumHeader from '@/components/layouts/PremiumHeader';
import DisplayHeading from '@/components/typography/DisplayHeading';
import GlowButton from '@/components/effects/GlowButton';
import StickerBadge from '@/components/stickers/StickerBadge';
import EmojiSticker from '@/components/stickers/EmojiSticker';

export default function LandingPage() {
  return (
    <GuestHubContainer 
      enableParticles={true} 
      particleEffect="petal-fall" 
      particleIntensity="low"
    >
      {/* Premium Header with Navigation */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto mb-10 relative z-20">
        <Link to="/" className="font-display text-2xl font-bold text-foreground hover:text-accent transition-colors">
          💍 LoveInvite
        </Link>
        <div className="flex gap-2">
          <Link
            to="/hub"
            className="text-sm border border-border rounded-full px-5 py-2 hover:bg-muted/50 transition-colors font-dashboard"
          >
            Guest hub
          </Link>
          <Link
            to="/admin"
            className="text-sm bg-accent text-accent-foreground rounded-full px-5 py-2 hover:opacity-90 transition-opacity shadow-lg font-dashboard"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        {/* Premium Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <DisplayHeading 
            level="h1"
            animated
            includeKhmer="សំបុត្រអញ្ជើញមង្គលការដ៏ស្រស់ស្អាត"
            className="mb-6"
          >
            Beautiful Wedding Invitations
          </DisplayHeading>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Create your own bilingual Khmer & English wedding invitation in minutes.
            Share a unique link with your guests, collect RSVPs, and celebrate in style.
          </p>

          {/* Premium CTA Button with Glow */}
          <Link to="/admin" className="inline-block">
            <GlowButton 
              variant="accent" 
              size="lg" 
              glowIntensity="medium"
              className="mb-16"
            >
              Create Your Invitation →
            </GlowButton>
          </Link>
        </motion.div>

        {/* Feature Cards with Emoji Stickers */}
        <div className="grid sm:grid-cols-3 gap-6 mt-10">
          {[
            { emoji: '🎨', title: 'Multiple Themes', desc: 'Classic Khmer, Modern, Romantic Luxury' },
            { emoji: '📱', title: 'Unique Public Link', desc: 'Share with guests via QR code' },
            { emoji: '💌', title: 'RSVP & Wishes', desc: 'Track attendance, meals, and notes' },
          ].map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <StickerBadge
                emoji={f.emoji}
                label={f.title}
                description={f.desc}
                highlighted={false}
              />
            </motion.div>
          ))}
        </div>

        {/* Decorative Sticker Section */}
        <div className="flex justify-center gap-8 mt-16 mb-8">
          <EmojiSticker emoji="✨" size="lg" animated />
          <EmojiSticker emoji="💍" size="lg" animated />
          <EmojiSticker emoji="✨" size="lg" animated />
        </div>
      </main>

      <footer className="text-center py-8 text-sm text-muted-foreground relative z-20">
        Made with love ♡
      </footer>
    </GuestHubContainer>
  );
}
