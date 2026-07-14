import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PREMIUM_THEME_ACCENTS, PREMIUM_THEME_INFO } from '@/lib/premium-themes';
import {
  EXTENDED_INVITATION_COLORS,
  EXTENDED_INVITATION_INFO,
  EXTENDED_INVITATION_ACCENTS,
   type ExtendedInvitationTheme,
 } from '@/lib/invitation-themes';
import type { V2ThemeId } from '@/lib/v2-design-system';
import { V2_THEMES } from '@/lib/v2-design-system';

export type ThemeName =
   | 'gold'
   | 'pink'
   | 'lavender'
   | 'rainbow'
   | 'classic'
   | 'modern'
   | 'romantic'
   | 'luxury-emerald'
   | 'rose-gold-elegance'
   | 'nordic-frost'
   | 'midnight-corporate'
   | ExtendedInvitationTheme
   | V2ThemeId;

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

// Define theme colors that map to CSS variables
// All values are bare HSL triplets (no hsl() wrapper) because Tailwind uses hsl(var(--x))
type ThemeColorTokens = {
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
  // Shadows (full values, not HSL)
  shadowSurface: string;
  shadowLuxury: string;
   shadowGlow: string;
 };

 function hexToHsl(hex: string) {
  let r = 0, g = 0, b = 0;
  // 3-digit hex
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255; g /= 255; b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Helper to convert hex to HSL and format for CSS variables
function hexToCssHsl(hex: string): string {
  if (!hex || hex.startsWith("hsl(") || hex.includes("var(")) return hex; // Already HSL or CSS var

  let r = 0, g = 0, b = 0;

  // Handle rgba values if present e.g. rgba(255, 255, 255, 0.72)
  if (hex.startsWith("rgba")) {
    const parts = hex.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (parts) {
      r = parseInt(parts[1], 10);
      g = parseInt(parts[2], 10);
      b = parseInt(parts[3], 10);
      // Alpha is handled in CSS, so we only need HSL for the color
    }
  } else {
    // Standard hex conversion
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      r = parseInt(result[1], 16);
      g = parseInt(result[2], 16);
      b = parseInt(result[3], 16);
    }
  }

  r /= 255; g /= 255; b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const CORE_THEME_COLORS: Record<string, ThemeColorTokens> = {
  gold: {
    primary:            '38 55% 58%',
    primaryForeground:  '25 15% 18%',
    accent:             '38 65% 52%',
    accentForeground:   '38 60% 12%',
    background:         '40 35% 97%',
    foreground:         '25 15% 18%',
    secondary:          '36 25% 91%',
    secondaryForeground:'25 15% 25%',
    muted:              '30 20% 88%',
    mutedForeground:    '25 10% 45%',
    card:               '38 30% 96%',
    cardForeground:     '25 15% 18%',
    popover:            '38 30% 96%',
    popoverForeground:  '25 15% 18%',
    border:             '36 18% 82%',
    input:              '36 18% 82%',
    ring:               '38 55% 52%',
    shadowSurface:      '0 2px 16px 0 hsl(38 55% 40% / 0.10)',
    shadowLuxury:       '0 8px 40px 0 hsl(38 55% 40% / 0.18)',
    shadowGlow:         '0 0 24px 4px hsl(38 65% 52% / 0.20)',
  },
  classic: {
    primary:            '345 45% 72%',
    primaryForeground:  '345 30% 15%',
    accent:             '38 65% 52%',
    accentForeground:   '38 60% 12%',
    background:         '42 40% 96%',
    foreground:         '25 15% 18%',
    secondary:          '36 25% 91%',
    secondaryForeground:'25 15% 25%',
    muted:              '30 20% 88%',
    mutedForeground:    '25 10% 45%',
    card:               '40 35% 95%',
    cardForeground:     '25 15% 18%',
    popover:            '40 35% 95%',
    popoverForeground:  '25 15% 18%',
    border:             '36 18% 80%',
    input:              '36 18% 80%',
    ring:               '345 45% 65%',
    shadowSurface:      '0 2px 16px 0 hsl(345 45% 40% / 0.10)',
    shadowLuxury:       '0 8px 40px 0 hsl(38 65% 40% / 0.18)',
    shadowGlow:         '0 0 24px 4px hsl(38 65% 52% / 0.20)',
  },
  modern: {
    primary:            '0 0% 50%',
    primaryForeground:  '0 0% 10%',
    accent:             '0 0% 20%',
    accentForeground:   '0 0% 100%',
    background:         '0 0% 98%',
    foreground:         '0 0% 10%',
    secondary:          '0 0% 95%',
    secondaryForeground:'0 0% 20%',
    muted:              '0 0% 85%',
    mutedForeground:    '0 0% 50%',
    card:               '0 0% 96%',
    cardForeground:     '0 0% 10%',
    popover:            '0 0% 96%',
    popoverForeground:  '0 0% 10%',
    border:             '0 0% 80%',
    input:              '0 0% 80%',
    ring:               '0 0% 60%',
    shadowSurface:      '0 2px 16px 0 hsl(0 0% 0% / 0.06)',
    shadowLuxury:       '0 8px 40px 0 hsl(0 0% 0% / 0.12)',
    shadowGlow:         '0 0 24px 4px hsl(0 0% 50% / 0.15)',
  },
  romantic: {
    primary:            '15 50% 72%',
    primaryForeground:  '25 15% 18%',
    accent:             '15 65% 60%',
    accentForeground:   '25 15% 18%',
    background:         '15 30% 96%',
    foreground:         '25 15% 18%',
    secondary:          '15 40% 92%',
    secondaryForeground:'25 15% 25%',
    muted:              '15 25% 88%',
    mutedForeground:    '25 10% 45%',
    card:               '15 28% 95%',
    cardForeground:     '25 15% 18%',
    popover:            '15 28% 95%',
    popoverForeground:  '25 15% 18%',
    border:             '15 20% 82%',
    input:              '15 20% 82%',
    ring:               '15 50% 65%',
    shadowSurface:      '0 2px 16px 0 hsl(15 50% 40% / 0.10)',
    shadowLuxury:       '0 8px 40px 0 hsl(15 65% 40% / 0.18)',
    shadowGlow:         '0 0 24px 4px hsl(15 65% 60% / 0.20)',
  },
  pink: {
    primary:            '345 45% 72%',
    primaryForeground:  '345 30% 15%',
    accent:             '345 65% 60%',
    accentForeground:   '345 30% 15%',
    background:         '345 30% 97%',
    foreground:         '25 15% 18%',
    secondary:          '345 40% 92%',
    secondaryForeground:'25 15% 25%',
    muted:              '345 25% 88%',
    mutedForeground:    '25 10% 45%',
    card:               '345 28% 96%',
    cardForeground:     '25 15% 18%',
    popover:            '345 28% 96%',
    popoverForeground:  '25 15% 18%',
    border:             '345 18% 82%',
    input:              '345 18% 82%',
    ring:               '345 45% 65%',
    shadowSurface:      '0 2px 16px 0 hsl(345 45% 40% / 0.10)',
    shadowLuxury:       '0 8px 40px 0 hsl(345 65% 40% / 0.18)',
    shadowGlow:         '0 0 24px 4px hsl(345 65% 60% / 0.20)',
  },
  lavender: {
    primary:            '260 45% 72%',
    primaryForeground:  '260 30% 15%',
    accent:             '260 65% 60%',
    accentForeground:   '260 50% 12%',
    background:         '260 30% 97%',
    foreground:         '25 15% 18%',
    secondary:          '260 40% 92%',
    secondaryForeground:'25 15% 25%',
    muted:              '260 25% 88%',
    mutedForeground:    '25 10% 45%',
    card:               '260 28% 96%',
    cardForeground:     '25 15% 18%',
    popover:            '260 28% 96%',
    popoverForeground:  '25 15% 18%',
    border:             '260 18% 82%',
    input:              '260 18% 82%',
    ring:               '260 45% 65%',
    shadowSurface:      '0 2px 16px 0 hsl(260 45% 40% / 0.10)',
    shadowLuxury:       '0 8px 40px 0 hsl(260 65% 40% / 0.18)',
    shadowGlow:         '0 0 24px 4px hsl(260 65% 60% / 0.20)',
  },
  'luxury-emerald': {
    primary:            '158 45% 28%',
    primaryForeground:  '42 40% 96%',
    accent:             '38 72% 52%',
    accentForeground:   '158 50% 12%',
    background:         '155 30% 96%',
    foreground:         '158 40% 14%',
    secondary:          '150 25% 90%',
    secondaryForeground:'158 35% 20%',
    muted:              '150 18% 85%',
    mutedForeground:    '158 15% 40%',
    card:               '42 40% 97%',
    cardForeground:     '158 40% 14%',
    popover:            '42 40% 97%',
    popoverForeground:  '158 40% 14%',
    border:             '158 20% 78%',
    input:              '158 20% 78%',
    ring:               '38 72% 52%',
    shadowSurface:      '0 2px 16px 0 hsl(158 45% 20% / 0.12)',
    shadowLuxury:       '0 8px 40px 0 hsl(38 72% 40% / 0.20)',
    shadowGlow:         '0 0 28px 4px hsl(38 72% 52% / 0.25)',
  },
  'rose-gold-elegance': {
    primary:            '12 48% 58%',
    primaryForeground:  '15 35% 97%',
    accent:             '18 55% 68%',
    accentForeground:   '12 40% 15%',
    background:         '15 35% 97%',
    foreground:         '12 30% 18%',
    secondary:          '350 45% 92%',
    secondaryForeground:'12 25% 25%',
    muted:              '15 25% 88%',
    mutedForeground:    '12 15% 42%',
    card:               '20 40% 96%',
    cardForeground:     '12 30% 18%',
    popover:            '20 40% 96%',
    popoverForeground:  '12 30% 18%',
    border:             '12 22% 82%',
    input:              '12 22% 82%',
    ring:               '12 48% 55%',
    shadowSurface:      '0 2px 16px 0 hsl(12 48% 40% / 0.10)',
    shadowLuxury:       '0 8px 40px 0 hsl(18 55% 50% / 0.18)',
    shadowGlow:         '0 0 24px 4px hsl(12 48% 58% / 0.22)',
  },
  'nordic-frost': {
    primary:            '210 18% 42%',
    primaryForeground:  '210 25% 98%',
    accent:             '210 25% 55%',
    accentForeground:   '210 30% 12%',
    background:         '210 25% 98%',
    foreground:         '215 25% 18%',
    secondary:          '210 20% 93%',
    secondaryForeground:'215 20% 28%',
    muted:              '210 15% 88%',
    mutedForeground:    '215 12% 45%',
    card:               '210 22% 97%',
    cardForeground:     '215 25% 18%',
    popover:            '210 22% 97%',
    popoverForeground:  '215 25% 18%',
    border:             '210 15% 82%',
    input:              '210 15% 82%',
    ring:               '210 18% 50%',
    shadowSurface:      '0 2px 16px 0 hsl(210 18% 30% / 0.08)',
    shadowLuxury:       '0 8px 32px 0 hsl(210 25% 40% / 0.12)',
    shadowGlow:         '0 0 20px 2px hsl(210 25% 60% / 0.15)',
  },
  'midnight-corporate': {
    primary:            '199 89% 48%',
    primaryForeground:  '210 40% 98%',
    accent:             '187 85% 53%',
    accentForeground:   '222 47% 8%',
    background:         '222 47% 8%',
    foreground:         '210 40% 96%',
    secondary:          '220 30% 16%',
    secondaryForeground:'210 30% 90%',
    muted:              '220 25% 18%',
    mutedForeground:    '215 15% 58%',
    card:               '222 40% 11%',
    cardForeground:     '210 40% 96%',
    popover:            '222 40% 11%',
    popoverForeground:  '210 40% 96%',
    border:             '199 50% 35%',
    input:              '220 25% 22%',
    ring:               '199 89% 48%',
    shadowSurface:      '0 2px 20px 0 hsl(199 89% 30% / 0.25)',
    shadowLuxury:       '0 8px 40px 0 hsl(187 85% 40% / 0.20)',
    shadowGlow:         '0 0 32px 6px hsl(199 89% 48% / 0.35)',
  },
  rainbow: {
    primary:            '30 70% 70%',
    primaryForeground:  '25 15% 18%',
    accent:             '180 70% 60%',
    accentForeground:   '170 50% 12%',
    background:         '60 50% 96%',
    foreground:         '25 15% 18%',
    secondary:          '300 70% 90%',
    secondaryForeground:'25 15% 25%',
    muted:              '45 50% 85%',
    mutedForeground:    '25 10% 45%',
    card:               '55 45% 95%',
    cardForeground:     '25 15% 18%',
    popover:            '55 45% 95%',
    popoverForeground:  '25 15% 18%',
    border:             '40 25% 80%',
    input:              '40 25% 80%',
    ring:               '200 50% 60%',
    shadowSurface:      '0 2px 16px 0 hsl(30 70% 40% / 0.10)',
    shadowLuxury:       '0 8px 40px 0 hsl(180 70% 40% / 0.18)',
    shadowGlow:         '0 0 24px 4px hsl(30 70% 60% / 0.20)',
  },
};

// Mapped V2 Themes (from hex to HSL for CSS variables)
const V2_THEME_COLORS_MAPPED = Object.fromEntries(
  V2_THEMES.map((theme) => [
    theme.id,
    {
      primary: hexToCssHsl(theme.colors.primary),
      primaryForeground: hexToCssHsl(theme.colors.text),
      accent: hexToCssHsl(theme.colors.accent),
      accentForeground: hexToCssHsl(theme.colors.text),
      background: hexToCssHsl(theme.colors.background),
      foreground: hexToCssHsl(theme.colors.text),
      secondary: hexToCssHsl(theme.colors.secondary),
      secondaryForeground: hexToCssHsl(theme.colors.text),
      muted: hexToCssHsl(theme.colors.border),
      mutedForeground: hexToCssHsl(theme.colors.secondary),
      card: hexToCssHsl(theme.colors.card),
      cardForeground: hexToCssHsl(theme.colors.text),
      popover: hexToCssHsl(theme.colors.card),
      popoverForeground: hexToCssHsl(theme.colors.text),
      border: hexToCssHsl(theme.colors.border),
      input: hexToCssHsl(theme.colors.border),
      ring: hexToCssHsl(theme.colors.accent),
      shadowSurface: theme.colors.shadow, // V2 shadows are full CSS values
      shadowLuxury: theme.colors.shadow,
      shadowGlow: theme.colors.shadow.replace(/rgba\(([^,]+),([^,]+),([^,]+),([\d.]+)\)/, 'hsl(var(--accent) / 0.15)').replace(/rgb\(([^,]+),([^,]+),([^,]+)\)/, 'hsl(var(--accent) / 0.15)'),
    },
  ])
);

export const THEME_COLORS = {
  ...CORE_THEME_COLORS,
  ...EXTENDED_INVITATION_COLORS,
  ...V2_THEME_COLORS_MAPPED,
} as Record<ThemeName, ThemeColorTokens>;

const CORE_THEME_INFO: Record<string, { label: string; emoji: string; description: string; colors: string[] }> = {
  classic: { label: 'Classic Elegant Khmer', emoji: '🪷', description: 'Traditional gold with Moul script', colors: ['#B8893E', '#E8C8A0', '#FAF3E7', '#5C3A1E'] },
  modern:  { label: 'Modern Minimalist',      emoji: '⚪', description: 'Clean neutrals, sharp typography', colors: ['#2D2D2D', '#888888', '#F5F5F5', '#000000'] },
  romantic:{ label: 'Romantic Luxury',        emoji: '💗', description: 'Rose-gold with soft blush tones', colors: ['#D4A76A', '#E8C8A0', '#F4C2C2', '#C9A96E'] },
  gold:    { label: 'Champagne Gold',         emoji: '✨', description: 'Classic luxury with warm gold tones', colors: ['#D4A76A', '#E8C8A0', '#F4E4D0', '#C9A96E'] },
  pink:    { label: 'Blush Pink',             emoji: '🌸', description: 'Soft romantic pink with rosy warmth', colors: ['#E8A0B4', '#F4C2D0', '#FFD6E0', '#D4708A'] },
  lavender:{ label: 'Dreamy Lavender',        emoji: '💜', description: 'Elegant purple with gentle calm', colors: ['#B8A0D4', '#D0B8E8', '#E8D0F4', '#9A7EBE'] },
  rainbow: { label: 'Pastel Rainbow',         emoji: '🌈', description: 'Playful mix of soft pastels', colors: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA'] },
  'luxury-emerald': PREMIUM_THEME_INFO['luxury-emerald'],
  'rose-gold-elegance': PREMIUM_THEME_INFO['rose-gold-elegance'],
  'nordic-frost': PREMIUM_THEME_INFO['nordic-frost'],
  'midnight-corporate': PREMIUM_THEME_INFO['midnight-corporate'],
};

const V2_THEME_INFO_MAPPED = Object.fromEntries(
  V2_THEMES.map((theme) => [
    theme.id,
    {
      label: theme.label,
      emoji: '🎨', // Default emoji for V2 themes, can be refined later
      description: theme.description,
      colors: theme.swatches,
    },
  ])
);

export const THEME_INFO = {
  ...CORE_THEME_INFO,
  ...Object.fromEntries(
    Object.entries(EXTENDED_INVITATION_INFO).map(([k, v]) => [
      k,
      { label: v.label, emoji: v.emoji, description: v.description, colors: v.colors },
    ])
  ),
  ...V2_THEME_INFO_MAPPED,
} as Record<ThemeName, { label: string; emoji: string; description: string; colors: string[] }>;

const DARK_THEMES: ThemeName[] = ['midnight-corporate', 'midnight-gala', ...V2_THEMES.filter(t => t.isDark).map(t => t.id)];

interface Props {
  children: ReactNode;
  initialTheme?: ThemeName;
  ownerUserId?: string | null; // when set, theme changes persist to profile
}

export function applyThemeColors(themeName: ThemeName) {
  const c = THEME_COLORS[themeName] ?? THEME_COLORS.gold;
  const root = document.documentElement;

  // Core semantic tokens (used by Tailwind config via hsl(var(--x)))
  root.style.setProperty('--primary',              c.primary);
  root.style.setProperty('--primary-foreground',   c.primaryForeground);
  root.style.setProperty('--accent',               c.accent);
  root.style.setProperty('--accent-foreground',    c.accentForeground);
  root.style.setProperty('--background',           c.background);
  root.style.setProperty('--foreground',           c.foreground);
  root.style.setProperty('--secondary',            c.secondary);
  root.style.setProperty('--secondary-foreground', c.secondaryForeground);
  root.style.setProperty('--muted',                c.muted);
  root.style.setProperty('--muted-foreground',     c.mutedForeground);
  root.style.setProperty('--card',                 c.card);
  root.style.setProperty('--card-foreground',      c.cardForeground);
  root.style.setProperty('--popover',              c.popover);
  root.style.setProperty('--popover-foreground',   c.popoverForeground);
  root.style.setProperty('--border',               c.border);
  root.style.setProperty('--input',                c.input);
  root.style.setProperty('--ring',                 c.ring);

  // Shadow tokens (used by tailwind boxShadow config)
  root.style.setProperty('--shadow-surface', c.shadowSurface);
  root.style.setProperty('--shadow-luxury',  c.shadowLuxury);
  root.style.setProperty('--shadow-glow',    c.shadowGlow);

  // Premium accent tokens (Tailwind: gold, rose-gold, champagne, etc.)
  const extendedAccent = EXTENDED_INVITATION_ACCENTS[themeName as ExtendedInvitationTheme];
  const premium = PREMIUM_THEME_ACCENTS[themeName as keyof typeof PREMIUM_THEME_ACCENTS];
  
  const v2Theme = V2_THEMES.find(t => t.id === themeName);

  if (v2Theme) {
    // For V2 themes, derive accents from primary/secondary or use defaults if not explicitly provided.
    // Note: V2 themes don't have explicit accent sets like premium/extended themes.
    root.style.setProperty("--gold", hexToCssHsl(v2Theme.colors.accent));
    root.style.setProperty("--gold-light", hexToCssHsl(v2Theme.colors.secondary));
    root.style.setProperty("--rose-gold", hexToCssHsl(v2Theme.colors.primary));
    root.style.setProperty("--champagne", hexToCssHsl(v2Theme.colors.background));
    root.style.setProperty("--ivory", hexToCssHsl(v2Theme.colors.card));
    root.style.setProperty("--blush", hexToCssHsl(v2Theme.colors.border));
  } else {
    const accentSet = extendedAccent ?? premium;
    if (accentSet) {
      root.style.setProperty("--gold", accentSet.gold);
      root.style.setProperty("--gold-light", accentSet.goldLight);
      root.style.setProperty("--rose-gold", accentSet.roseGold);
      root.style.setProperty("--champagne", accentSet.champagne);
      root.style.setProperty("--ivory", accentSet.ivory);
      root.style.setProperty("--blush", accentSet.blush);
    } else {
      // Fallback for core themes if no specific accent set
      root.style.setProperty("--gold", "38 55% 58%");
      root.style.setProperty("--gold-light", "42 65% 72%");
      root.style.setProperty("--rose-gold", "15 50% 65%");
      root.style.setProperty("--champagne", "40 45% 88%");
      root.style.setProperty("--ivory", "42 40% 96%");
      root.style.setProperty("--blush", "345 40% 90%");
    }
  }

  const isDark = DARK_THEMES.includes(themeName);
  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", themeName);
  root.setAttribute("data-theme-mode", isDark ? "dark" : "light");
}

export function ThemeProvider({ children, initialTheme = 'gold', ownerUserId }: Props) {
  const [theme, setThemeState] = useState<ThemeName>(initialTheme);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    applyThemeColors(t);
    if (ownerUserId) {
      supabase
        .from('profiles')
        .update({ theme: t })
        .eq('user_id', ownerUserId)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to persist theme to Supabase:', error);
          }
        })
        .catch((error) => {
          console.error('Supabase theme update exception:', error);
        });
    }
  };

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyThemeColors(theme);
    // No cleanup — we intentionally keep the theme applied globally.
    // Unmounting a child ThemeProvider should NOT strip the attribute.
  }, [theme]);

  // If the parent passes a new initialTheme (e.g. route change), sync it
  useEffect(() => {
    setThemeState(initialTheme);
    applyThemeColors(initialTheme);
  }, [initialTheme]);

  const isDark = useMemo(() => DARK_THEMES.includes(theme), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
