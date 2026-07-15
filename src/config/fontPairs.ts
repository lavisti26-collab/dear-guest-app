/**
 * Complete font library for Dear Guest wedding invitation platform.
 * Supports English (Google Fonts) and Khmer (Supabase storage + Google Fonts).
 */
export interface FontPairDef {
  display: string;
  body: string;
  khmer: string;
  weights: number[];
  category: 'classic' | 'modern' | 'khmer-traditional' | 'khmer-modern' | 'romantic' | 'editorial';
}

/** Fonts available in Google Fonts (loaded via <link>) */
export const ENGLISH_FONT_OPTIONS = [
  'Playfair Display', 'Lora', 'Libre Baskerville', 'Cormorant Garamond',
  'Merriweather', 'Inter', 'DM Sans', 'Poppins', 'Montserrat', 'Raleway',
  'Josefin Sans', 'Source Sans 3', 'Great Vibes',
  'Noto Serif Khmer', 'Noto Sans Khmer', 'Hanuman',
] as const;

/** Fonts available in Supabase storage (loaded via @font-face) */
export const KHMER_FONT_OPTIONS = [
  'Battambang', 'Angkor', 'Bayon', 'Chenla', 'Kantumruy Pro',
  'Koulen', 'Moulpali', 'Preahvihear', 'Siemreap',
  'AKbalthom KhmerLer', 'Kh BL LazyOutline',
] as const;

export type EnglishFont = (typeof ENGLISH_FONT_OPTIONS)[number];
export type KhmerFont = (typeof KHMER_FONT_OPTIONS)[number];

export const FONT_PAIRS: Record<string, FontPairDef> = {
  // === CLASSIC ENGLISH ===
  'elegant-serif': {
    display: 'Playfair Display',
    body: 'Lora',
    khmer: 'Noto Serif Khmer',
    weights: [400, 700],
    category: 'classic',
  },
  'classic-book': {
    display: 'Libre Baskerville',
    body: 'Lora',
    khmer: 'Noto Serif Khmer',
    weights: [400, 700],
    category: 'classic',
  },
  'sophisticated-serif': {
    display: 'Cormorant Garamond',
    body: 'Lora',
    khmer: 'Noto Serif Khmer',
    weights: [400, 600, 700],
    category: 'classic',
  },
  'literary-serif': {
    display: 'Merriweather',
    body: 'Lora',
    khmer: 'Noto Sans Khmer',
    weights: [300, 400, 700],
    category: 'classic',
  },

  // === MODERN ENGLISH ===
  'modern-sans': {
    display: 'Cormorant Garamond',
    body: 'Inter',
    khmer: 'Noto Sans Khmer',
    weights: [300, 400, 500],
    category: 'modern',
  },
  'clean-sans': {
    display: 'DM Sans',
    body: 'Inter',
    khmer: 'Noto Sans Khmer',
    weights: [400, 500, 700],
    category: 'modern',
  },
  'playful-sans': {
    display: 'Poppins',
    body: 'Inter',
    khmer: 'Noto Sans Khmer',
    weights: [400, 500, 600],
    category: 'modern',
  },
  'geometric-sans': {
    display: 'Montserrat',
    body: 'DM Sans',
    khmer: 'Noto Sans Khmer',
    weights: [400, 500, 700],
    category: 'modern',
  },
  'apple-style': {
    display: 'Inter',
    body: 'DM Sans',
    khmer: 'Noto Sans Khmer',
    weights: [400, 500, 600],
    category: 'modern',
  },

  // === ROMANTIC ===
  'romantic-script': {
    display: 'Great Vibes',
    body: 'Raleway',
    khmer: 'Hanuman',
    weights: [400, 700],
    category: 'romantic',
  },
  'romantic-modern': {
    display: 'Cormorant Garamond',
    body: 'Raleway',
    khmer: 'Hanuman',
    weights: [400, 600],
    category: 'romantic',
  },

  // === MINIMAL / EDITORIAL ===
  'minimal-clean': {
    display: 'Josefin Sans',
    body: 'Source Sans 3',
    khmer: 'Noto Sans Khmer',
    weights: [300, 400, 600],
    category: 'editorial',
  },
  'editorial-sans': {
    display: 'DM Sans',
    body: 'Source Sans 3',
    khmer: 'Noto Sans Khmer',
    weights: [400, 500],
    category: 'editorial',
  },

  // === KHMER TRADITIONAL — fonts from Supabase storage ===
  'khmer-classic': {
    display: 'Angkor',
    body: 'Kantumruy Pro',
    khmer: 'Kantumruy Pro',
    weights: [400, 700],
    category: 'khmer-traditional',
  },
  'khmer-royal': {
    display: 'Angkor',
    body: 'Battambang',
    khmer: 'Battambang',
    weights: [400, 700],
    category: 'khmer-traditional',
  },
  'khmer-temple': {
    display: 'Bayon',
    body: 'Kantumruy Pro',
    khmer: 'Kantumruy Pro',
    weights: [400, 700],
    category: 'khmer-traditional',
  },
  'khmer-chenla': {
    display: 'Chenla',
    body: 'Kantumruy Pro',
    khmer: 'Chenla',
    weights: [400],
    category: 'khmer-traditional',
  },
  'khmer-koulen': {
    display: 'Koulen',
    body: 'Battambang',
    khmer: 'Koulen',
    weights: [400],
    category: 'khmer-traditional',
  },
  'khmer-preahvihear': {
    display: 'Preahvihear',
    body: 'Kantumruy Pro',
    khmer: 'Preahvihear',
    weights: [400],
    category: 'khmer-traditional',
  },
  'khmer-moulpali': {
    display: 'Moulpali',
    body: 'Kantumruy Pro',
    khmer: 'Moulpali',
    weights: [400],
    category: 'khmer-traditional',
  },
  'khmer-siemreap': {
    display: 'Kantumruy Pro',
    body: 'Battambang',
    khmer: 'Kantumruy Pro',
    weights: [400, 700],
    category: 'khmer-traditional',
  },

  // === KHMER MODERN ===
  'khmer-akhmer': {
    display: 'AKbalthom KhmerLer',
    body: 'Battambang',
    khmer: 'AKbalthom KhmerLer',
    weights: [400],
    category: 'khmer-modern',
  },
  'khmer-modern': {
    display: 'Kantumruy Pro',
    body: 'Battambang',
    khmer: 'Battambang',
    weights: [400, 700],
    category: 'khmer-modern',
  },
  'khmer-lazyoutline': {
    display: 'Kh BL LazyOutline',
    body: 'Battambang',
    khmer: 'Kh BL LazyOutline',
    weights: [400],
    category: 'khmer-modern',
  },
};

/**
 * Get a font pair definition. Falls back to 'elegant-serif' if key not found.
 */
export function getFontPair(key: string): FontPairDef {
  return FONT_PAIRS[key] || FONT_PAIRS['elegant-serif'];
}

/** Group font pair keys by a category, ignore if user picks from admin */
export function getFontPairKeysByCategory() {
  const cats: Record<string, string[]> = {};
  for (const [key, def] of Object.entries(FONT_PAIRS)) {
    if (!cats[def.category]) cats[def.category] = [];
    cats[def.category].push(key);
  }
  return cats;
}

export default FONT_PAIRS;