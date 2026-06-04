import type { ThemeName } from '@/contexts/ThemeContext';
import type { UserRole } from '@/contexts/RoleContext';

/** Structural / layout language — independent of color ThemeName palettes */
export type VisualStyleId =
  | 'classic'
  | 'minimalist'
  | 'cyberpunk'
  | 'glassmorphism'
  | 'neo-brutalism'
  | 'romantic'
  | 'elegant';

export const VISUAL_STYLE_OPTIONS: {
  id: VisualStyleId;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: 'classic',
    label: 'Classic (current)',
    emoji: '✨',
    description: 'Your existing Shadcn + FlyonUI look — no structural override',
  },
  {
    id: 'minimalist',
    label: 'Minimalist & Clean',
    emoji: '◻️',
    description: 'Spacious, thin borders, wide tracking, divider lines',
  },
  {
    id: 'cyberpunk',
    label: 'Dark Cyberpunk',
    emoji: '⚡',
    description: 'Neon outlines, pulse glow, dark tech aesthetic',
  },
  {
    id: 'glassmorphism',
    label: 'Glassmorphism',
    emoji: '🪟',
    description: 'Frosted glass layers, soft depth, rounded surfaces',
  },
  {
    id: 'neo-brutalism',
    label: 'Neo-Brutalism',
    emoji: '🧱',
    description: 'Bold blocks, thick outlines, hard shadows, bento grid',
  },
  {
    id: 'romantic',
    label: 'Romantic',
    emoji: '💖',
    description: 'Soft strokes, blush tones, rounded cards with warm glow',
  },
  {
    id: 'elegant',
    label: 'Elegant Luxe',
    emoji: '🎀',
    description: 'Calm neutrals, crisp lines, polished surfaces with soft contrast',
  },
];

const VALID_VISUAL_STYLE_IDS = new Set(VISUAL_STYLE_OPTIONS.map((o) => o.id));

/** Map legacy DB values → current ids */
const LEGACY_VISUAL_STYLE_MAP: Record<string, VisualStyleId> = {
  minimal: 'minimalist',
  'split-screen': 'elegant',
  'dashboard-grid': 'neo-brutalism',
};

export function normalizeVisualStyle(value: string | null | undefined): VisualStyleId | null {
  if (!value) return null;
  const mapped = LEGACY_VISUAL_STYLE_MAP[value] ?? value;
  if (VALID_VISUAL_STYLE_IDS.has(mapped as VisualStyleId)) return mapped as VisualStyleId;
  return null;
}

export function resolveVisualStyle(
  saved: string | null | undefined,
  theme: ThemeName
): VisualStyleId {
  return normalizeVisualStyle(saved) ?? getDefaultVisualStyleForTheme(theme);
}

export function getDefaultVisualStyleForTheme(theme: ThemeName): VisualStyleId {
  if (theme === 'romantic' || theme === 'rose-gold-elegance') return 'romantic';
  if (theme === 'luxury-emerald' || theme === 'pink' || theme === 'lavender' || theme === 'rainbow') return 'glassmorphism';
  if (theme === 'midnight-corporate' || theme === 'modern' || theme === 'classic') return 'neo-brutalism';
  if (theme === 'nordic-frost' || theme === 'gold') return 'elegant';
  return 'classic';
}

/** Role-aware Iconify Fluent emoji stickers */
export const ROLE_VISUAL_STICKERS: Record<
  UserRole,
  { id: string; label: string; icon: string }[]
> = {
  super_admin: [
    { id: 'sec', label: 'Security', icon: 'icon-fluent-emoji-flat:locked' },
    { id: 'sys', label: 'System', icon: 'icon-fluent-emoji-flat:desktop-computer' },
    { id: 'spd', label: 'Speed', icon: 'icon-fluent-emoji-flat:high-voltage' },
  ],
  admin: [
    { id: 'trend', label: 'Analytics', icon: 'icon-fluent-emoji-flat:chart-increasing' },
    { id: 'mega', label: 'Broadcast', icon: 'icon-fluent-emoji-flat:megaphone' },
    { id: 'memo', label: 'Content', icon: 'icon-fluent-emoji-flat:memo' },
  ],
  guest: [
    { id: 'spark', label: 'Sparkles', icon: 'icon-fluent-emoji-flat:sparkles' },
    { id: 'wave', label: 'Welcome', icon: 'icon-fluent-emoji-flat:waving-hand' },
    { id: 'mail', label: 'Inquiries', icon: 'icon-fluent-emoji-flat:love-letter' },
  ],
};

export function shouldEnableGuestAmbient(
  visualStyle: VisualStyleId,
  role: UserRole
): boolean {
  if (role !== 'guest') return false;
  return visualStyle === 'glassmorphism' || visualStyle === 'minimalist';
}

export function ambientEffectForStyle(visualStyle: VisualStyleId): 'petal-fall' | 'butterfly-float' | 'sparkle' {
  if (visualStyle === 'cyberpunk') return 'sparkle';
  if (visualStyle === 'minimalist') return 'butterfly-float';
  if (visualStyle === 'glassmorphism') return 'petal-fall';
  return 'petal-fall';
}
