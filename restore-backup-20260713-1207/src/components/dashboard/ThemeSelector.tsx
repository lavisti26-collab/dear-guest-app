import React, { useState, useMemo } from 'react';
import { useTheme } from '@/theme/ThemeEngine';
import { THEME_REGISTRY } from '@/theme/registry';

// ── V2-style theme catalogue ─────────────────────────────────────────────────
// These are the beautiful categorised themes the user sees.
// Each maps to the closest THEME_REGISTRY id for actual token application.
const V2_CATALOGUE = [
  // ── Signature & Gold ─────────────────────────────────────────────────────
  {
    id: 'champagne-gold', registryId: 'elegant-gold',
    category: 'Signature & Gold', emoji: '✨',
    name: 'Champagne Gold', description: 'Classic luxury with warm golden tones',
    swatches: ['#C9A96E', '#E8D5A3', '#F5EFE0', '#A07850'],
  },
  {
    id: 'champagne-dream', registryId: 'european-luxury',
    category: 'Signature & Gold', emoji: '🥂',
    name: 'Champagne Dream', description: 'Soft ivory & sparkling champagne',
    swatches: ['#D4B896', '#E8D5C4', '#F2EAE0', '#B89C78'],
  },
  {
    id: 'luxury-gold-emerald', registryId: 'dark-luxury',
    category: 'Signature & Gold', emoji: '👑',
    name: 'Luxury Gold · Emerald', description: 'Deep emerald tones with brilliant gold accents',
    swatches: ['#1B4D3E', '#C8A96E', '#2D6B52', '#0F2E26'],
  },
  {
    id: 'khmer-heritage', registryId: 'khmer-traditional',
    category: 'Signature & Gold', emoji: '🏛️',
    name: 'Khmer Heritage', description: 'Gold & crimson — perfect for Khmer weddings',
    swatches: ['#8B0000', '#D4AF37', '#6B3A1F', '#1A0A00'],
  },
  {
    id: 'mocha-latte', registryId: 'modern-khmer-luxury',
    category: 'Signature & Gold', emoji: '☕',
    name: 'Mocha Latte', description: 'Silky café mocha & cream',
    swatches: ['#6B4F3A', '#C4A882', '#E8D5B7', '#3D2B1F'],
  },
  {
    id: 'classic-elegant-khmer', registryId: 'royal-palace',
    category: 'Signature & Gold', emoji: '🎪',
    name: 'Classic Elegant Khmer', description: 'Traditional gold with Khmer script',
    swatches: ['#8B4513', '#D4AF37', '#C19A6B', '#5C2D0E'],
  },

  // ── Romantic & Blush ─────────────────────────────────────────────────────
  {
    id: 'rose-gold-elegance', registryId: 'watercolor',
    category: 'Romantic & Blush', emoji: '💎',
    name: 'Rose Gold Elegance', description: 'Romantic rose-gold and blush premium warmth',
    swatches: ['#C8796E', '#E8B4A8', '#F2D4C8', '#8B4A42'],
  },
  {
    id: 'romantic-luxury', registryId: 'fine-art',
    category: 'Romantic & Blush', emoji: '💗',
    name: 'Romantic Luxury', description: 'Rose-gold with soft blush tones',
    swatches: ['#B5686E', '#D4979A', '#ECC8C0', '#8B3840'],
  },
  {
    id: 'blush-pink', registryId: 'flower-garden',
    category: 'Romantic & Blush', emoji: '🌷',
    name: 'Blush Pink', description: 'Soft romantic pink with rosy warmth',
    swatches: ['#D4848A', '#E8B0B4', '#F5D4D8', '#A05858'],
  },
  {
    id: 'cherry-sakura', registryId: 'japanese',
    category: 'Romantic & Blush', emoji: '🌸',
    name: 'Cherry Sakura', description: 'Soft sakura pink blossoms',
    swatches: ['#C4607E', '#E89EAE', '#F5C8D4', '#8B3050'],
  },
  {
    id: 'blush-pearl', registryId: 'photo-album',
    category: 'Romantic & Blush', emoji: '🫧',
    name: 'Blush Pearl', description: 'Delicate blush over pearl white',
    swatches: ['#C8A0A8', '#E0C4C8', '#F0E0E4', '#A07880'],
  },
  {
    id: 'burgundy-royal', registryId: 'luxury-black',
    category: 'Romantic & Blush', emoji: '🍷',
    name: 'Burgundy Royal', description: 'Deep wine-red with gold trim',
    swatches: ['#6B0F1A', '#A8324A', '#C86478', '#8B1A2E'],
  },

  // ── Nature & Garden ──────────────────────────────────────────────────────
  {
    id: 'sage-botanical', registryId: 'forest',
    category: 'Nature & Garden', emoji: '🌿',
    name: 'Sage Botanical', description: 'Garden greens & natural elegance',
    swatches: ['#4A7856', '#8FAF8A', '#C4D8BE', '#2E4A38'],
  },
  {
    id: 'ocean-breeze', registryId: 'beach',
    category: 'Nature & Garden', emoji: '🌊',
    name: 'Ocean Breeze', description: 'Coastal teal & serene blues',
    swatches: ['#2E6E8A', '#6AAEC4', '#A8D4E4', '#1A4458'],
  },
  {
    id: 'copper-autumn', registryId: 'scrapbook',
    category: 'Nature & Garden', emoji: '🍂',
    name: 'Copper Autumn', description: 'Rustic copper & harvest warmth',
    swatches: ['#8B5A2B', '#C47A3E', '#D4A878', '#5A3018'],
  },
  {
    id: 'sunset-glow', registryId: 'story-book',
    category: 'Nature & Garden', emoji: '🌅',
    name: 'Sunset Glow', description: 'Warm amber & golden dusk',
    swatches: ['#C45E2A', '#E87848', '#F4C080', '#8B3A18'],
  },

  // ── Modern & Minimal ─────────────────────────────────────────────────────
  {
    id: 'modern-minimalist', registryId: 'apple-modern',
    category: 'Modern & Minimal', emoji: '⬛',
    name: 'Modern Minimalist', description: 'Clean neutrals, sharp typography',
    swatches: ['#1A1A1A', '#6B6B6B', '#C8C8C8', '#F4F4F4'],
  },
  {
    id: 'nordic-frost-slate', registryId: 'minimal-white',
    category: 'Modern & Minimal', emoji: '❄️',
    name: 'Nordic Frost · Slate', description: 'Ultra modern minimalist professional slate',
    swatches: ['#2E3A4A', '#5A7A8A', '#B0C8D4', '#E8F0F4'],
  },
  {
    id: 'pearl-luxe', registryId: 'modern-minimal',
    category: 'Modern & Minimal', emoji: '🤍',
    name: 'Pearl Luxe', description: 'Understated pearl & platinum',
    swatches: ['#C8C4BC', '#E0DCD8', '#F0EEE8', '#A0A0A0'],
  },
  {
    id: 'celestial-blue', registryId: 'instagram-story',
    category: 'Modern & Minimal', emoji: '✨',
    name: 'Celestial Blue', description: 'Sleek navy & silver accents',
    swatches: ['#1A2E4A', '#3A6A8A', '#7AB0C8', '#0A1828'],
  },

  // ── Evening & Jewel ──────────────────────────────────────────────────────
  {
    id: 'midnight-gala', registryId: 'luxury-black',
    category: 'Evening & Jewel', emoji: '🌙',
    name: 'Midnight Gala', description: 'Entrancing black-tie with gold-sparkle',
    swatches: ['#0D0D0D', '#C4A840', '#E8D070', '#1A1A1A'],
  },
  {
    id: 'royal-amethyst', registryId: 'cinema',
    category: 'Evening & Jewel', emoji: '💜',
    name: 'Royal Amethyst', description: 'Regal violet & jewel tones',
    swatches: ['#4A2870', '#8A54A8', '#B888D4', '#2A1440'],
  },
  {
    id: 'dreamy-lavender', registryId: 'glassmorphism',
    category: 'Evening & Jewel', emoji: '💫',
    name: 'Dreamy Lavender', description: 'Elegant purple with gentle calm',
    swatches: ['#7A70A0', '#A898C4', '#D0C8E4', '#5A5078'],
  },
  {
    id: 'midnight-corporate', registryId: 'apple-event',
    category: 'Evening & Jewel', emoji: '🖤',
    name: 'Midnight Corporate', description: 'High-contrast deep blue with neo-admin borders',
    swatches: ['#0A0E1A', '#1E3A6A', '#4A78A8', '#C4D8E8'],
  },

  // ── Playful & Pastel ─────────────────────────────────────────────────────
  {
    id: 'pastel-rainbow', registryId: 'pastel-garden',
    category: 'Playful & Pastel', emoji: '🌈',
    name: 'Pastel Rainbow', description: 'Playful mix of soft pastels',
    swatches: ['#F4C0D0', '#C0D8F0', '#D0F0C0', '#F0E4C0'],
  },
] as const;

type V2Theme = typeof V2_CATALOGUE[number];

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🎨' },
  { id: 'Signature & Gold', label: 'Signature & Gold', emoji: '✨' },
  { id: 'Romantic & Blush', label: 'Romantic & Blush', emoji: '💖' },
  { id: 'Nature & Garden', label: 'Nature & Garden', emoji: '🌿' },
  { id: 'Modern & Minimal', label: 'Modern & Minimal', emoji: '✳️' },
  { id: 'Evening & Jewel', label: 'Evening & Jewel', emoji: '💎' },
  { id: 'Playful & Pastel', label: 'Playful & Pastel', emoji: '🌈' },
];

// Map a V2 id → the best THEME_REGISTRY id we have
function resolveRegistryId(registryId: string): string {
  if (THEME_REGISTRY[registryId]) return registryId;
  // fallback: pick the first entry
  return Object.keys(THEME_REGISTRY)[0];
}

export default function ThemeSelector({
  onPersistTheme,
  compact = false,
}: {
  onPersistTheme?: (themeId: string) => void;
  compact?: boolean;
}) {
  const { theme: currentTheme, setTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // The user's currently stored theme id (could be a v2 id or registry id)
  const activeId = currentTheme.id;

  const visibleThemes = useMemo<V2Theme[]>(() => {
    if (activeCategory === 'all') return [...V2_CATALOGUE];
    return V2_CATALOGUE.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  // Group by category for "all" view
  const grouped = useMemo(() => {
    if (activeCategory !== 'all') return null;
    const map = new Map<string, V2Theme[]>();
    for (const t of V2_CATALOGUE) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
    }
    return map;
  }, [activeCategory]);

  const handleSelect = async (v2Theme: V2Theme) => {
    const rid = resolveRegistryId(v2Theme.registryId);
    await setTheme(rid, true);
    // Store the original v2 id so it shows as active
    if (onPersistTheme) onPersistTheme(v2Theme.id);
  };

  const isActive = (t: V2Theme) =>
    activeId === t.id || activeId === t.registryId;

  if (compact) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-dashboard uppercase tracking-widest text-muted-foreground">
          Color theme
        </p>
        <div className="relative">
          <select
            value={activeId}
            onChange={(e) => {
              const found = V2_CATALOGUE.find(
                (t) => t.id === e.target.value || t.registryId === e.target.value
              );
              if (found) handleSelect(found);
            }}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none cursor-pointer"
          >
            {V2_CATALOGUE.map((t) => (
              <option key={t.id} value={t.id}>
                {t.emoji} {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  const ThemeCard = ({ t }: { t: V2Theme }) => {
    const active = isActive(t);
    return (
      <button
        type="button"
        onClick={() => handleSelect(t)}
        className={`group relative flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-200 bg-card hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring ${
          active
            ? 'border-accent ring-2 ring-accent/30 scale-[1.02] shadow-lg'
            : 'border-border/40 hover:border-muted-foreground/30 hover:shadow-md'
        }`}
      >
        {/* Emoji badge */}
        <div
          className={`absolute -top-2 -right-2 h-7 w-7 rounded-full flex items-center justify-center text-sm shadow-sm border border-border/30 bg-card transition-all ${
            active ? 'scale-110' : 'scale-0 group-hover:scale-100'
          }`}
        >
          {active ? '✓' : t.emoji}
        </div>

        {/* Color swatches */}
        <div className="flex gap-1.5">
          {t.swatches.slice(0, 4).map((c, i) => (
            <span
              key={i}
              className="h-5 w-5 rounded-full border border-black/10 shadow-inner flex-shrink-0"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Name & description */}
        <div>
          <p className="font-semibold text-sm text-foreground leading-tight">{t.name}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
        </div>

        {/* Active badge overlay */}
        {active && (
          <div className="absolute top-2 right-2 flex items-center justify-center h-6 w-6 rounded-full bg-accent text-accent-foreground shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 border ${
              activeCategory === cat.id
                ? 'bg-accent text-accent-foreground border-accent shadow-sm scale-[1.02]'
                : 'bg-card text-muted-foreground border-border/50 hover:bg-muted/40 hover:border-muted-foreground/30'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Theme grid */}
      <div className="max-h-[380px] overflow-y-auto pr-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
        {grouped ? (
          // "All" view — show by category
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([cat, themes]) => (
              <div key={cat}>
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <span>{CATEGORIES.find((c) => c.id === cat)?.emoji}</span>
                  <span>{cat}</span>
                </h4>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  {themes.map((t) => (
                    <ThemeCard key={t.id} t={t} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Filtered category view
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {visibleThemes.map((t) => (
              <ThemeCard key={t.id} t={t} />
            ))}
          </div>
        )}
      </div>

      {/* Live preview footer */}
      <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-4 py-2.5">
        <span className="text-base">{V2_CATALOGUE.find((t) => isActive(t))?.emoji ?? '🎨'}</span>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Live preview:</span>{' '}
          {V2_CATALOGUE.find((t) => isActive(t))?.name ?? currentTheme.name} — guests see this on your invitation immediately after save.
        </p>
      </div>
    </div>
  );
}