import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ThemeName = 'gold' | 'pink' | 'lavender' | 'rainbow' | 'classic' | 'modern' | 'romantic';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const THEME_INFO: Record<ThemeName, { label: string; emoji: string; description: string; colors: string[] }> = {
  classic: { label: 'Classic Elegant Khmer', emoji: '🪷', description: 'Traditional gold with Moul script', colors: ['#B8893E', '#E8C8A0', '#FAF3E7', '#5C3A1E'] },
  modern: { label: 'Modern Minimalist', emoji: '⚪', description: 'Clean neutrals, sharp typography', colors: ['#2D2D2D', '#888888', '#F5F5F5', '#000000'] },
  romantic: { label: 'Romantic Luxury', emoji: '💗', description: 'Rose-gold with soft blush tones', colors: ['#D4A76A', '#E8C8A0', '#F4C2C2', '#C9A96E'] },
  gold: { label: 'Champagne Gold', emoji: '✨', description: 'Classic luxury with warm gold tones', colors: ['#D4A76A', '#E8C8A0', '#F4E4D0', '#C9A96E'] },
  pink: { label: 'Blush Pink', emoji: '🌸', description: 'Soft romantic pink with rosy warmth', colors: ['#E8A0B4', '#F4C2D0', '#FFD6E0', '#D4708A'] },
  lavender: { label: 'Dreamy Lavender', emoji: '💜', description: 'Elegant purple with gentle calm', colors: ['#B8A0D4', '#D0B8E8', '#E8D0F4', '#9A7EBE'] },
  rainbow: { label: 'Pastel Rainbow', emoji: '🌈', description: 'Playful mix of soft pastels', colors: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA'] },
};

interface Props {
  children: ReactNode;
  initialTheme?: ThemeName;
  ownerUserId?: string | null; // when set, theme changes persist to profile
}

export function ThemeProvider({ children, initialTheme = 'gold', ownerUserId }: Props) {
  const [theme, setThemeState] = useState<ThemeName>(initialTheme);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    if (ownerUserId) {
      supabase.from('profiles').update({ theme: t }).eq('user_id', ownerUserId).then(() => {});
    }
  };

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  useEffect(() => () => { document.documentElement.removeAttribute('data-theme'); }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
