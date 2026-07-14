/**
 * Maps legacy theme names (from ThemeContext) to new theme IDs in THEME_REGISTRY.
 * This ensures backward compatibility with existing Supabase profile data.
 */
export const LEGACY_THEME_MAP: Record<string, string> = {
  // Existing Supabase themes not in the new registry
  'mocha-latte': 'modern-khmer-luxury',
  'apple': 'apple-modern',

  // Core themes
  'gold': 'elegant-gold',
  'classic': 'basic-white', // Mapped to the new basic-white theme for a truly neutral look
  'modern': 'modern-minimal',
  'romantic': 'flower-garden',
  'pink': 'flower-garden',
  'lavender': 'watercolor',
  'rainbow': 'instagram-story',
  'luxury-emerald': 'forest',
  'rose-gold-elegance': 'watercolor',
  'nordic-frost': 'film-camera',
  'midnight-corporate': 'apple-event',

  // V2 themes (already using new IDs mostly)
  'royal-khmer': 'khmer-traditional',
  'modern-khmer': 'modern-khmer-luxury',
  'luxury-gold': 'elegant-gold',
  'black-gold': 'luxury-black',
  'white-minimal': 'minimal-white',
  'korean-elegant': 'korean',
  'japanese-sakura': 'japanese',
  'romantic-floral': 'flower-garden',
  'beach-sunset': 'beach',
  'vintage-film': 'film-camera',
  'glassmorphism': 'glassmorphism',
  'cinematic-dark': 'cinema',

  // Extended themes
  'vintage-magazine': 'newspaper',
  'editorial': 'editorial',
  'pinterest-moodboard': 'pinterest',

  // Extended V2 themes catalog mappings
  'champagne-gold': 'elegant-gold',
  'champagne-dream': 'european-luxury',
  'luxury-gold-emerald': 'dark-luxury',
  'khmer-heritage': 'khmer-traditional',
  'classic-elegant-khmer': 'royal-palace',
  'romantic-luxury': 'fine-art',
  'blush-pink': 'flower-garden',
  'cherry-sakura': 'japanese',
  'blush-pearl': 'photo-album',
  'burgundy-royal': 'luxury-black',
  'sage-botanical': 'forest',
  'ocean-breeze': 'beach',
  'copper-autumn': 'scrapbook',
  'sunset-glow': 'story-book',
  'modern-minimalist': 'apple-modern',
  'nordic-frost-slate': 'minimal-white',
  'pearl-luxe': 'modern-minimal',
  'celestial-blue': 'instagram-story',
  'midnight-gala': 'luxury-black',
  'royal-amethyst': 'cinema',
  'dreamy-lavender': 'glassmorphism',
  'pastel-rainbow': 'pastel-garden',
};

/**
 * Resolves a legacy theme name to a valid registry ID.
 */
export function resolveLegacyTheme(legacyTheme: string | null | undefined): string {
  if (!legacyTheme) return 'apple-modern';
  const mapped = LEGACY_THEME_MAP[legacyTheme];
  if (mapped) return mapped;
  // If it's already a new ID, return as-is
  return legacyTheme;
}