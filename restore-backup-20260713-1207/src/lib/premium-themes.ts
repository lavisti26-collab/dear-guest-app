import type { ThemeName } from '@/contexts/ThemeContext';

/** Premium dashboard palettes (extends wedding themes) */
export const PREMIUM_THEME_NAMES = [
  'luxury-emerald',
  'rose-gold-elegance',
  'nordic-frost',
  'midnight-corporate',
] as const;

export type PremiumThemeName = (typeof PREMIUM_THEME_NAMES)[number];

export function isPremiumTheme(t: string): t is PremiumThemeName {
  return PREMIUM_THEME_NAMES.includes(t as PremiumThemeName);
}

export const PREMIUM_THEME_ACCENTS: Record<
  PremiumThemeName,
  {
    gold: string;
    goldLight: string;
    roseGold: string;
    champagne: string;
    ivory: string;
    blush: string;
    isDark: boolean;
  }
> = {
  'luxury-emerald': {
    gold: '38 72% 52%',
    goldLight: '42 65% 72%',
    roseGold: '38 55% 58%',
    champagne: '40 45% 88%',
    ivory: '42 40% 96%',
    blush: '150 25% 90%',
    isDark: false,
  },
  'rose-gold-elegance': {
    gold: '15 55% 62%',
    goldLight: '18 50% 78%',
    roseGold: '12 48% 58%',
    champagne: '20 40% 92%',
    ivory: '15 35% 97%',
    blush: '350 45% 88%',
    isDark: false,
  },
  'nordic-frost': {
    gold: '210 18% 55%',
    goldLight: '210 25% 75%',
    roseGold: '210 12% 48%',
    champagne: '210 20% 94%',
    ivory: '210 25% 98%',
    blush: '210 15% 90%',
    isDark: false,
  },
  'midnight-corporate': {
    gold: '199 89% 58%',
    goldLight: '199 70% 72%',
    roseGold: '220 60% 55%',
    champagne: '220 25% 18%',
    ivory: '222 35% 12%',
    blush: '220 30% 22%',
    isDark: true,
  },
};

export const PREMIUM_THEME_INFO: Record<
  PremiumThemeName,
  { label: string; emoji: string; description: string; colors: string[] }
> = {
  'luxury-emerald': {
    label: 'Luxury Gold / Emerald',
    emoji: '👑',
    description: 'Deep emerald tones with brilliant gold accents',
    colors: ['#0D3B2E', '#D4A76A', '#F4E4D0', '#1A5C45'],
  },
  'rose-gold-elegance': {
    label: 'Rose Gold Elegance',
    emoji: '💎',
    description: 'Romantic rose-gold and blush premium palette',
    colors: ['#C9A08A', '#E8B4A8', '#FFF0EB', '#8B5E52'],
  },
  'nordic-frost': {
    label: 'Nordic Frost / Slate',
    emoji: '❄️',
    description: 'Ultra-modern minimalist professional slate',
    colors: ['#5C6B7A', '#B8C5D0', '#F0F4F8', '#2D3748'],
  },
  'midnight-corporate': {
    label: 'Midnight Corporate',
    emoji: '🌃',
    description: 'High-contrast deep blues with neon admin borders',
    colors: ['#0B1220', '#38BDF8', '#1E293B', '#22D3EE'],
  },
};

export const ALL_DASHBOARD_THEMES = [
  'luxury-emerald',
  'rose-gold-elegance',
  'nordic-frost',
  'midnight-corporate',
  'gold',
] as const;
