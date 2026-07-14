import type { ThemeName } from '@/contexts/ThemeContext';
import { ALL_INVITATION_THEME_NAMES } from '@/lib/invitation-themes';

const VALID_THEMES: ThemeName[] = ALL_INVITATION_THEME_NAMES as ThemeName[];

/** Map legacy DB values (e.g. classic-elegant-khmer) to app themes */
export function normalizeTheme(value: string | null | undefined): ThemeName {
  if (!value) return 'gold';
  const v = value.toLowerCase().replace(/\s+/g, '-');
  if (VALID_THEMES.includes(v as ThemeName)) return v as ThemeName;

  if (v.includes('champagne')) return 'champagne-dream';
  if (v.includes('burgundy') || v.includes('wine')) return 'burgundy-royal';
  if (v.includes('sage') || v.includes('botanical')) return 'sage-botanical';
  if (v.includes('ocean') || v.includes('breeze')) return 'ocean-breeze';
  if (v.includes('sunset')) return 'sunset-glow';
  if (v.includes('amethyst') || v.includes('royal-purple')) return 'royal-amethyst';
  if (v.includes('heritage') || v.includes('khmer')) return 'khmer-heritage';
  if (v.includes('pearl')) return 'pearl-luxe';
  if (v.includes('sakura') || v.includes('cherry')) return 'cherry-sakura';
  if (v.includes('gala') && v.includes('midnight')) return 'midnight-gala';
  if (v.includes('copper') || v.includes('autumn')) return 'copper-autumn';
  if (v.includes('celestial')) return 'celestial-blue';
  if (v.includes('mocha') || v.includes('latte')) return 'mocha-latte';
  if (v.includes('blush-pearl')) return 'blush-pearl';
  if (v.includes('classic')) return 'classic';
  if (v.includes('modern')) return 'modern';
  if (v.includes('romantic') || v.includes('rose')) return 'romantic';
  if (v.includes('pink') || v.includes('blush')) return 'pink';
  if (v.includes('lavender')) return 'lavender';
  if (v.includes('rainbow')) return 'rainbow';
  if (v.includes('emerald') || v.includes('luxury')) return 'luxury-emerald';
  if (v.includes('rose-gold') || v.includes('rose_gold')) return 'rose-gold-elegance';
  if (v.includes('nordic') || v.includes('frost') || v.includes('slate')) return 'nordic-frost';
  if (v.includes('midnight') || v.includes('corporate')) return 'midnight-corporate';

  return 'gold';
}
