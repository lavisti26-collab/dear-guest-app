import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/" className="font-display text-xl font-semibold">💍 LoveInvite</Link>
        <Link to="/admin" className="text-sm bg-accent text-accent-foreground rounded-full px-5 py-2 hover:opacity-90 transition-opacity">
          Sign in
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="font-display text-5xl sm:text-6xl font-bold mb-6 gold-text"
        >
          Beautiful Wedding Invitations
        </motion.h1>
        <p className="font-khmer text-2xl text-muted-foreground mb-4">សំបុត្រអញ្ជើញមង្គលការដ៏ស្រស់ស្អាត</p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Create your own bilingual Khmer & English wedding invitation in minutes.
          Share a unique link with your guests, collect RSVPs, and celebrate in style.
        </p>
        <Link to="/admin" className="inline-block bg-accent text-accent-foreground rounded-full px-8 py-4 text-lg font-medium shadow-luxury hover:scale-105 transition-transform">
          Create Your Invitation →
        </Link>

        <div className="grid sm:grid-cols-3 gap-6 mt-20">
          {[
            { icon: '🎨', title: 'Multiple Themes', desc: 'Classic Khmer, Modern, Romantic Luxury' },
            { icon: '📱', title: 'Unique Public Link', desc: 'Share with guests via QR code' },
            { icon: '💌', title: 'RSVP & Wishes', desc: 'Track attendance, meals, and notes' },
          ].map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-6">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-display text-lg font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-8 text-sm text-muted-foreground">
        Made with love ♡
      </footer>
    </div>
  );
}
