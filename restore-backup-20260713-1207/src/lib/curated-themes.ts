import type { ThemeName } from '@/contexts/ThemeContext';
import { ALL_INVITATION_THEME_NAMES } from '@/lib/invitation-themes';

/** Full invitation picker list (25+ themes) */
export const INVITATION_THEME_PICKER = ALL_INVITATION_THEME_NAMES as ThemeName[];

/** Sidebar dashboard — keep compact */
export const CURATED_THEME_PICKER: ThemeName[] = [
  'gold',
  'luxury-emerald',
  'rose-gold-elegance',
  'khmer-heritage',
  'champagne-dream',
  'nordic-frost',
  'midnight-gala',
];
