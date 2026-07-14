/**
 * Font loader for Dear Guest wedding invitations.
 * Loads English fonts from Google Fonts, Khmer fonts from Supabase storage.
 * Handles font fallback and prevents layout shift.
 */
import { FONT_PAIRS, type FontPairDef } from '@/config/fontPairs';
import { V2_FONT_STYLES } from "@/lib/v2-design-system";

const SUPABASE_FONTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/fonts`;
const LOADED_GOOGLE_FONTS = new Set<string>();

const V2_FONT_STYLE_MAP: Record<string, string> = {
  "elegant-script": "elegant-serif",
  "luxury-serif": "classic-book",
  "modern-sans": "modern-sans",
  "editorial-style": "editorial-sans",
  "minimal-style": "minimal-clean",
};




/** Exact filenames in Supabase storage */
const KHMER_FONT_STORAGE_MAP: Record<string, string> = {
  'Battambang': 'Battambang-Regular.ttf',
  'Angkor': 'Angkor.ttf',
  'Bayon': 'Bayon.ttf',
  'Chenla': 'Chenla.ttf',
  'Kantumruy Pro': 'Kantumruy-Regular.ttf',
  'Koulen': 'Koulen.ttf',
  'Moulpali': 'Moulpali.ttf',
  'Preahvihear': 'Preahvihear.ttf',
  'Siemreap': 'Siemreap.ttf',
  'AKbalthom KhmerLer': 'AKbalthom KhmerLer Regular.ttf',
  'Kh BL LazyOutline': 'Kh BL LazyOutline Regular.ttf',
};

/** Google Fonts families available via the API */
const GOOGLE_FONT_FAMILIES: Set<string> = new Set([
  'Playfair Display', 'Lora', 'Libre Baskerville', 'Cormorant Garamond',
  'Merriweather', 'Inter', 'DM Sans', 'Poppins', 'Montserrat', 'Raleway',
  'Josefin Sans', 'Source Sans 3', 'Great Vibes', 'Noto Serif Khmer',
  'Noto Sans Khmer', 'Hanuman',
]);

/** Fallback font stacks for different writing systems */
const FALLBACK_STACKS: Record<string, string> = {
  serif: "'Noto Serif Khmer', 'Hanuman', 'Battambang', Georgia, serif",
  'sans-serif': "'Noto Sans Khmer', 'Kantumruy Pro', 'Battambang', Arial, sans-serif",
  display: "'Angkor', 'Bayon', Georgia, serif",
  handwriting: "'Great Vibes', 'Playfair Display', Georgia, serif",
};

function createGoogleFontLink(family: string, weights: number[]) {
  const familyParam = family.replace(/\s+/g, '+');
  const w = Array.from(new Set(weights)).sort((a, b) => a - b);
  const weightParam = w.join(';');
  return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightParam}&display=swap`;
}

function loadGoogleFontFamily(family: string, weights: number[]) {
  if (!GOOGLE_FONT_FAMILIES.has(family)) return;
  if (family === 'SF Pro Display') return;
  const key = `${family}-${weights.join(',')}`;
  if (LOADED_GOOGLE_FONTS.has(key)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = createGoogleFontLink(family, weights);
  document.head.appendChild(link);
  LOADED_GOOGLE_FONTS.add(key);
}

function buildStorageFontFace(fontName: string, weight: number = 400) {
  const filename = KHMER_FONT_STORAGE_MAP[fontName];
  if (!filename) return '';
  const fontUrl = `${SUPABASE_FONTS_URL}/${encodeURIComponent(filename)}`;
  return `@font-face {
  font-family: '${fontName}';
  src: url('${fontUrl}') format('truetype');
  font-weight: ${weight};
  font-style: normal;
  font-display: swap;
  unicode-range: U+1780-17FF, U+19E0-19FF, U+200C-200D, U+25CC;
}
`;
}

function getFallbackStack(family: string): string {
  if (KHMER_FONT_STORAGE_MAP[family]) {
    return "'Battambang', 'Kantumruy Pro', 'Noto Sans Khmer', sans-serif";
  }
  if (family.includes('Serif')) {
    return "'Noto Serif Khmer', 'Hanuman', Georgia, serif";
  }
  return "'Noto Sans Khmer', 'Kantumruy Pro', 'Battambang', sans-serif";
}

function internalInject(
  pair: { display: string; body: string; khmer: string; weights?: number[] },
  pairKey?: string
) {
  if (typeof document === 'undefined') return;

  const id = `font-faces-${pairKey || pair.display}-${pair.body}-${pair.khmer}`;
  if (document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;

  const weights = pair.weights ?? [400, 700];

  // Load English fonts from Google Fonts
  loadGoogleFontFamily(pair.display, weights);
  loadGoogleFontFamily(pair.body, weights);
  if (pair.khmer && GOOGLE_FONT_FAMILIES.has(pair.khmer)) {
    loadGoogleFontFamily(pair.khmer, weights);
  }

  // Build @font-face rules for fonts from storage
  let faces = '';
  if (KHMER_FONT_STORAGE_MAP[pair.display]) faces += buildStorageFontFace(pair.display);
  if (KHMER_FONT_STORAGE_MAP[pair.body]) faces += buildStorageFontFace(pair.body);
  if (pair.khmer && KHMER_FONT_STORAGE_MAP[pair.khmer]) {
    for (const w of weights) faces += buildStorageFontFace(pair.khmer, w);
  }

  // CSS custom properties for font stacks — ALWAYS quote font names to support names with spaces (e.g. "AKbalthom KhmerLer")
  const displayFont = `'${pair.display}'`;
  const bodyFont = `'${pair.body}'`;
  const khmerFont = pair.khmer ? `'${pair.khmer}'` : `'${pair.body}'`;

  faces += `
:root {
  --font-display: ${displayFont}, ${getFallbackStack(pair.display)};
  --font-body: ${bodyFont}, ${getFallbackStack(pair.body)};
  --font-khmer: ${khmerFont}, ${getFallbackStack(pair.khmer || pair.body)};
  --font-khmer-body: 'Kantumruy Pro', 'Noto Sans Khmer', 'Battambang', sans-serif;
}
.font-display { font-family: var(--font-display); }
.font-body { font-family: var(--font-body); }
.font-khmer { font-family: 'Kantumruy Pro', 'Noto Sans Khmer', 'Battambang', sans-serif; }
h1.font-khmer, h2.font-khmer, h3.font-khmer, h4.font-khmer, h5.font-khmer, h6.font-khmer, .font-display.font-khmer, .font-khmer-display {
  font-family: var(--font-khmer);
}
.font-khmer-body { font-family: var(--font-khmer-body); }
`;

  style.textContent = faces;
  document.head.appendChild(style);
}

/** Known font name overrides for proper casing after unslugging */
const FONT_NAME_CASE_MAP: Record<string, string> = {
  'akbalthom khmerler': 'AKbalthom KhmerLer',
  'kh bl lazyoutline': 'Kh BL LazyOutline',
  'playfair display': 'Playfair Display',
  'libre baskerville': 'Libre Baskerville',
  'cormorant garamond': 'Cormorant Garamond',
  'source sans 3': 'Source Sans 3',
  'great vibes': 'Great Vibes',
  'dm sans': 'DM Sans',
  'josefin sans': 'Josefin Sans',
  'noto sans khmer': 'Noto Sans Khmer',
  'noto serif khmer': 'Noto Serif Khmer',
  'kantumruy pro': 'Kantumruy Pro',
  'battambang': 'Battambang',
  'angkor': 'Angkor',
  'bayon': 'Bayon',
  'chenla': 'Chenla',
  'koulen': 'Koulen',
  'moulpali': 'Moulpali',
  'preahvihear': 'Preahvihear',
  'siemreap': 'Siemreap',
  'hanuman': 'Hanuman',
};

/** Parse a custom key like 'custom-d:name--b:name--k:name' back into a pair */
function parseCustomKey(key: string): { display: string; body: string; khmer: string } | null {
  const match = key.match(/^custom-d:(.+)--b:(.+)--k:(.+)$/);
  if (!match) return null;
  const unslug = (s: string) => {
    const spaced = s.replace(/-/g, ' ');
    return FONT_NAME_CASE_MAP[spaced.toLowerCase()] || spaced;
  };
  return {
    display: unslug(match[1]),
    body: unslug(match[2]),
    khmer: unslug(match[3]),
  };
}

/**
 * Inject @font-face rules. Accepts a pair object or a string key.
 * Supports both predefined keys (e.g. 'elegant-serif') and custom keys
 * (e.g. 'custom-d:akbalthom-khmerler--b:battambang--k:akbalthom-khmerler').
 */
export function injectFontFaces(
  pairOrKey: { display: string; body: string; khmer: string; weights?: number[] } | string,
  pairKey?: string
) {
  if (typeof pairOrKey === "string") {
    let resolvedPairKey = pairOrKey;

    // Check if it's a V2 font style ID and map it to a FontPairDef key
    const v2MappedKey = V2_FONT_STYLE_MAP[pairOrKey];
    if (v2MappedKey) {
      resolvedPairKey = v2MappedKey;
    }

    let pair = FONT_PAIRS[resolvedPairKey];
    if (!pair) {
      // Try parsing as a custom key from English/Khmer tabs
      const parsed = parseCustomKey(resolvedPairKey);
      if (parsed) {
        pair = { ...parsed, weights: [400, 700], category: "modern" };
        // Register so it's found next time
        (FONT_PAIRS as any)[resolvedPairKey] = pair;
      }
    }
    pair = pair || FONT_PAIRS["elegant-serif"];
    internalInject(pair, resolvedPairKey);
  } else {
    internalInject(pairOrKey, pairKey);
  }
}

export function injectFontPairByKey(pairKey: string) {
  let resolvedPairKey = pairKey;
  const v2MappedKey = V2_FONT_STYLE_MAP[pairKey];
  if (v2MappedKey) {
    resolvedPairKey = v2MappedKey;
  }

  let pair = FONT_PAIRS[resolvedPairKey];
  if (!pair) {
    const parsed = parseCustomKey(resolvedPairKey);
    if (parsed) {
      pair = { ...parsed, weights: [400, 700], category: "modern" };
      (FONT_PAIRS as any)[resolvedPairKey] = pair;
    }
  }
  pair = pair || FONT_PAIRS["elegant-serif"];
  internalInject(pair, resolvedPairKey);
}

export { KHMER_FONT_STORAGE_MAP, GOOGLE_FONT_FAMILIES, SUPABASE_FONTS_URL };
export default injectFontFaces;
