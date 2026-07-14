export type ExtendedInvitationTheme =
  | 'champagne-dream'
  | 'burgundy-royal'
  | 'sage-botanical'
  | 'ocean-breeze'
  | 'sunset-glow'
  | 'royal-amethyst'
  | 'khmer-heritage'
  | 'pearl-luxe'
  | 'cherry-sakura'
  | 'midnight-gala'
  | 'copper-autumn'
  | 'celestial-blue'
  | 'mocha-latte'
  | 'blush-pearl';

export type ThemeColorSet = {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  border: string;
  input: string;
  ring: string;
  shadowSurface: string;
  shadowLuxury: string;
  shadowGlow: string;
};

export type ThemeMeta = {
  label: string;
  emoji: string;
  description: string;
  colors: string[];
  category: 'signature' | 'romantic' | 'nature' | 'cultural' | 'modern' | 'evening';
};

function palette(p: Partial<ThemeColorSet> & Pick<ThemeColorSet, 'primary' | 'accent' | 'background' | 'foreground'>): ThemeColorSet {
  return {
    primaryForeground: p.foreground,
    accentForeground: p.foreground,
    secondary: p.background,
    secondaryForeground: p.foreground,
    muted: p.border ?? '30 15% 85%',
    mutedForeground: '25 10% 42%',
    card: p.background,
    cardForeground: p.foreground,
    popover: p.background,
    popoverForeground: p.foreground,
    border: p.border ?? '30 15% 82%',
    input: p.border ?? '30 15% 82%',
    ring: p.primary,
    shadowSurface: p.shadowSurface ?? '0 2px 16px 0 hsl(0 0% 0% / 0.08)',
    shadowLuxury: p.shadowLuxury ?? '0 8px 36px 0 hsl(0 0% 0% / 0.12)',
    shadowGlow: p.shadowGlow ?? '0 0 24px 4px hsl(var(--primary) / 0.15)',
    ...p,
  } as ThemeColorSet;
}

export const EXTENDED_INVITATION_COLORS: Record<ExtendedInvitationTheme, ThemeColorSet> = {
  'champagne-dream': palette({
    primary: '43 48% 62%',
    accent: '40 55% 72%',
    background: '40 42% 98%',
    foreground: '30 20% 16%',
    border: '40 25% 88%',
    shadowGlow: '0 0 28px 4px hsl(43 48% 55% / 0.22)',
  }),
  'burgundy-royal': palette({
    primary: '350 55% 38%',
    accent: '38 60% 55%',
    background: '350 30% 97%',
    foreground: '350 40% 14%',
    border: '350 22% 85%',
    shadowGlow: '0 0 24px 4px hsl(350 55% 38% / 0.2)',
  }),
  'sage-botanical': palette({
    primary: '145 28% 42%',
    accent: '85 35% 55%',
    background: '140 25% 97%',
    foreground: '150 25% 16%',
    border: '140 18% 84%',
    shadowGlow: '0 0 24px 4px hsl(145 28% 42% / 0.18)',
  }),
  'ocean-breeze': palette({
    primary: '195 55% 45%',
    accent: '180 50% 55%',
    background: '200 35% 97%',
    foreground: '205 30% 16%',
    border: '195 22% 86%',
    shadowGlow: '0 0 24px 4px hsl(195 55% 45% / 0.2)',
  }),
  'sunset-glow': palette({
    primary: '22 75% 55%',
    accent: '35 85% 62%',
    background: '28 50% 97%',
    foreground: '20 30% 16%',
    border: '25 30% 88%',
    shadowGlow: '0 0 28px 4px hsl(22 75% 55% / 0.22)',
  }),
  'royal-amethyst': palette({
    primary: '275 45% 52%',
    accent: '290 50% 65%',
    background: '275 30% 97%',
    foreground: '275 35% 16%',
    border: '275 20% 86%',
    shadowGlow: '0 0 24px 4px hsl(275 45% 52% / 0.2)',
  }),
  'khmer-heritage': palette({
    primary: '38 65% 50%',
    accent: '0 65% 42%',
    background: '35 40% 96%',
    foreground: '25 25% 14%',
    border: '30 22% 82%',
    shadowGlow: '0 0 28px 4px hsl(38 65% 50% / 0.25)',
  }),
  'pearl-luxe': palette({
    primary: '220 8% 55%',
    accent: '40 30% 75%',
    background: '0 0% 99%',
    foreground: '220 15% 18%',
    border: '220 10% 90%',
    shadowGlow: '0 0 20px 4px hsl(220 8% 70% / 0.15)',
  }),
  'cherry-sakura': palette({
    primary: '340 55% 72%',
    accent: '350 70% 82%',
    background: '345 45% 98%',
    foreground: '340 25% 20%',
    border: '340 25% 90%',
    shadowGlow: '0 0 24px 4px hsl(340 55% 72% / 0.2)',
  }),
  'midnight-gala': palette({
    primary: '265 55% 65%',
    accent: '45 70% 55%',
    background: '260 30% 10%',
    foreground: '45 30% 95%',
    primaryForeground: '260 20% 96%',
    accentForeground: '260 30% 12%',
    secondary: '260 25% 16%',
    secondaryForeground: '260 15% 90%',
    muted: '260 20% 18%',
    mutedForeground: '260 10% 60%',
    card: '260 28% 13%',
    cardForeground: '45 30% 95%',
    popover: '260 28% 13%',
    popoverForeground: '45 30% 95%',
    border: '265 30% 28%',
    input: '260 22% 22%',
    ring: '265 55% 65%',
    shadowSurface: '0 2px 20px 0 hsl(265 50% 20% / 0.4)',
    shadowLuxury: '0 8px 40px 0 hsl(45 70% 40% / 0.15)',
    shadowGlow: '0 0 32px 6px hsl(265 55% 50% / 0.3)',
  }),
  'copper-autumn': palette({
    primary: '25 55% 48%',
    accent: '35 70% 58%',
    background: '30 35% 96%',
    foreground: '25 30% 16%',
    border: '28 25% 84%',
    shadowGlow: '0 0 24px 4px hsl(25 55% 48% / 0.2)',
  }),
  'celestial-blue': palette({
    primary: '225 55% 48%',
    accent: '210 70% 62%',
    background: '220 40% 98%',
    foreground: '225 35% 14%',
    border: '220 25% 88%',
    shadowGlow: '0 0 24px 4px hsl(225 55% 48% / 0.2)',
  }),
  'mocha-latte': palette({
    primary: '25 30% 42%',
    accent: '35 45% 62%',
    background: '35 30% 96%',
    foreground: '25 25% 16%',
    border: '30 20% 86%',
    shadowGlow: '0 0 22px 4px hsl(25 30% 42% / 0.15)',
  }),
  'blush-pearl': palette({
    primary: '10 40% 68%',
    accent: '350 50% 78%',
    background: '15 40% 98%',
    foreground: '15 25% 18%',
    border: '12 25% 90%',
    shadowGlow: '0 0 24px 4px hsl(10 40% 68% / 0.18)',
  }),
};

export const EXTENDED_INVITATION_INFO: Record<ExtendedInvitationTheme, ThemeMeta> = {
  'champagne-dream': {
    label: 'Champagne Dream',
    emoji: '🥂',
    description: 'Soft ivory & sparkling champagne',
    colors: ['#E8D5B5', '#FAF6EF', '#C9A86C', '#F5EDE0'],
    category: 'signature',
  },
  'burgundy-royal': {
    label: 'Burgundy Royal',
    emoji: '🍷',
    description: 'Deep wine red with gold trim',
    colors: ['#6B1D2A', '#D4A76A', '#F8F0F0', '#4A1520'],
    category: 'evening',
  },
  'sage-botanical': {
    label: 'Sage Botanical',
    emoji: '🌿',
    description: 'Garden greens & natural elegance',
    colors: ['#4A7C59', '#A8C5A0', '#F4FAF5', '#2D5A3D'],
    category: 'nature',
  },
  'ocean-breeze': {
    label: 'Ocean Breeze',
    emoji: '🌊',
    description: 'Coastal aqua & serene blues',
    colors: ['#3A8FA8', '#B8E4F0', '#F0FAFC', '#1E6B80'],
    category: 'nature',
  },
  'sunset-glow': {
    label: 'Sunset Glow',
    emoji: '🌅',
    description: 'Warm amber & golden hour',
    colors: ['#E07A3A', '#F5C98A', '#FFF8F0', '#C45E20'],
    category: 'romantic',
  },
  'royal-amethyst': {
    label: 'Royal Amethyst',
    emoji: '💜',
    description: 'Regal violet & jewel tones',
    colors: ['#7B5BA6', '#D4C0E8', '#F8F4FC', '#5A4080'],
    category: 'evening',
  },
  'khmer-heritage': {
    label: 'Khmer Heritage',
    emoji: '🪷',
    description: 'Gold & crimson — perfect for Khmer weddings',
    colors: ['#C9A227', '#8B1A1A', '#FAF3E7', '#5C3A1E'],
    category: 'cultural',
  },
  'pearl-luxe': {
    label: 'Pearl Luxe',
    emoji: '🤍',
    description: 'Understated pearl & platinum',
    colors: ['#9CA3AF', '#F9FAFB', '#E5E7EB', '#6B7280'],
    category: 'modern',
  },
  'cherry-sakura': {
    label: 'Cherry Sakura',
    emoji: '🌸',
    description: 'Soft sakura pink blossoms',
    colors: ['#F4A8B8', '#FFE4EC', '#FFF5F7', '#D4708A'],
    category: 'romantic',
  },
  'midnight-gala': {
    label: 'Midnight Gala',
    emoji: '🌙',
    description: 'Evening black-tie with gold sparkle',
    colors: ['#1A1528', '#D4AF37', '#9B7EDE', '#F5F0E8'],
    category: 'evening',
  },
  'copper-autumn': {
    label: 'Copper Autumn',
    emoji: '🍂',
    description: 'Rustic copper & harvest warmth',
    colors: ['#B87333', '#E8C4A0', '#FBF6F0', '#8B5A2B'],
    category: 'nature',
  },
  'celestial-blue': {
    label: 'Celestial Blue',
    emoji: '✨',
    description: 'Starlit navy & silver accents',
    colors: ['#3D5A80', '#C8D9E8', '#F0F6FC', '#293241'],
    category: 'modern',
  },
  'mocha-latte': {
    label: 'Mocha Latte',
    emoji: '☕',
    description: 'Cozy café browns & cream',
    colors: ['#6F4E37', '#D4B896', '#FAF6F1', '#4A3728'],
    category: 'signature',
  },
  'blush-pearl': {
    label: 'Blush Pearl',
    emoji: '🦪',
    description: 'Delicate blush over pearl white',
    colors: ['#E8B4A8', '#FFF5F2', '#FADCD4', '#C99588'],
    category: 'romantic',
  },
};

export const EXTENDED_INVITATION_ACCENTS: Record<
  ExtendedInvitationTheme,
  { gold: string; goldLight: string; roseGold: string; champagne: string; ivory: string; blush: string }
> = {
  'champagne-dream': { gold: '43 48% 62%', goldLight: '40 55% 78%', roseGold: '38 50% 58%', champagne: '40 45% 90%', ivory: '40 42% 98%', blush: '40 35% 92%' },
  'burgundy-royal': { gold: '38 60% 55%', goldLight: '38 55% 70%', roseGold: '350 50% 45%', champagne: '350 30% 92%', ivory: '350 30% 97%', blush: '350 40% 88%' },
  'sage-botanical': { gold: '85 35% 55%', goldLight: '140 30% 75%', roseGold: '145 28% 42%', champagne: '140 25% 92%', ivory: '140 25% 97%', blush: '140 30% 90%' },
  'ocean-breeze': { gold: '195 55% 45%', goldLight: '195 45% 65%', roseGold: '180 50% 55%', champagne: '200 35% 92%', ivory: '200 35% 97%', blush: '195 40% 90%' },
  'sunset-glow': { gold: '35 85% 62%', goldLight: '28 70% 75%', roseGold: '22 75% 55%', champagne: '28 50% 92%', ivory: '28 50% 97%', blush: '22 60% 88%' },
  'royal-amethyst': { gold: '275 45% 52%', goldLight: '290 40% 70%', roseGold: '290 50% 65%', champagne: '275 30% 92%', ivory: '275 30% 97%', blush: '275 35% 88%' },
  'khmer-heritage': { gold: '38 65% 50%', goldLight: '42 55% 68%', roseGold: '0 65% 42%', champagne: '35 40% 90%', ivory: '35 40% 96%', blush: '15 40% 88%' },
  'pearl-luxe': { gold: '40 30% 75%', goldLight: '220 8% 70%', roseGold: '220 8% 55%', champagne: '0 0% 94%', ivory: '0 0% 99%', blush: '220 15% 92%' },
  'cherry-sakura': { gold: '340 55% 72%', goldLight: '350 60% 82%', roseGold: '340 50% 65%', champagne: '345 45% 94%', ivory: '345 45% 98%', blush: '350 70% 88%' },
  'midnight-gala': { gold: '45 70% 55%', goldLight: '45 60% 70%', roseGold: '265 55% 65%', champagne: '260 25% 20%', ivory: '260 30% 12%', blush: '265 30% 22%' },
  'copper-autumn': { gold: '35 70% 58%', goldLight: '30 55% 72%', roseGold: '25 55% 48%', champagne: '30 35% 90%', ivory: '30 35% 96%', blush: '25 40% 88%' },
  'celestial-blue': { gold: '210 70% 62%', goldLight: '220 40% 75%', roseGold: '225 55% 48%', champagne: '220 40% 92%', ivory: '220 40% 98%', blush: '220 35% 90%' },
  'mocha-latte': { gold: '35 45% 62%', goldLight: '35 40% 75%', roseGold: '25 30% 42%', champagne: '35 30% 90%', ivory: '35 30% 96%', blush: '25 35% 88%' },
  'blush-pearl': { gold: '10 40% 68%', goldLight: '15 45% 78%', roseGold: '350 50% 72%', champagne: '15 40% 94%', ivory: '15 40% 98%', blush: '350 50% 88%' },
};

/** All invitation themes for the admin picker (grouped) */
export const INVITATION_THEME_GROUPS: {
  id: string;
  label: string;
  emoji: string;
  themes: string[];
}[] = [
  {
    id: 'signature',
    label: 'Signature & Gold',
    emoji: '✨',
    themes: [
      'gold',
      'champagne-dream',
      'luxury-emerald',
      'khmer-heritage',
      'mocha-latte',
      'classic',
    ],
  },
  {
    id: 'romantic',
    label: 'Romantic & Blush',
    emoji: '💕',
    themes: [
      'rose-gold-elegance',
      'romantic',
      'pink',
      'cherry-sakura',
      'blush-pearl',
      'burgundy-royal',
    ],
  },
  {
    id: 'nature',
    label: 'Nature & Garden',
    emoji: '🌿',
    themes: ['sage-botanical', 'ocean-breeze', 'copper-autumn', 'sunset-glow'],
  },
  {
    id: 'modern',
    label: 'Modern & Minimal',
    emoji: '◻️',
    themes: ['modern', 'nordic-frost', 'pearl-luxe', 'celestial-blue'],
  },
  {
    id: 'evening',
    label: 'Evening & Jewel',
    emoji: '🌙',
    themes: [
      'midnight-gala',
      'royal-amethyst',
      'lavender',
      'midnight-corporate',
    ],
  },
  {
    id: 'playful',
    label: 'Playful & Pastel',
    emoji: '🌈',
    themes: ['rainbow'],
  },
];

export const ALL_INVITATION_THEME_NAMES: string[] = INVITATION_THEME_GROUPS.flatMap(
  (g) => g.themes
).filter((t, i, arr) => arr.indexOf(t) === i);

export const INVITATION_DARK_THEMES = ['midnight-gala', 'midnight-corporate'] as const;
