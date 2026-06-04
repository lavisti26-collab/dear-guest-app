import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import type { VisualStyleId } from '@/lib/visual-styles';
import { normalizeVisualStyle, VISUAL_STYLE_OPTIONS } from '@/lib/visual-styles';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'dear_guest_visual_style';

interface VisualStyleContextType {
  visualStyle: VisualStyleId;
  setVisualStyle: (style: VisualStyleId) => void;
  styleInfo: (typeof VISUAL_STYLE_OPTIONS)[number];
}

const VisualStyleContext = createContext<VisualStyleContextType | null>(null);

function readStored(): VisualStyleId {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && VISUAL_STYLE_OPTIONS.some((o) => o.id === v)) return v as VisualStyleId;
  } catch {
    /* ignore */
  }
  return 'classic';
}

export function applyVisualStyle(style: VisualStyleId) {
  const root = document.documentElement;
  root.setAttribute('data-visual-style', style);
  root.classList.toggle('dark', style === 'cyberpunk');
}

interface Props {
  children: ReactNode;
  /** Saved style from Supabase (invite/admin) — takes priority over localStorage */
  initialStyle?: VisualStyleId;
  /** When set, loads & saves visual_style on profiles for this couple */
  ownerUserId?: string;
  /** Guest/public invite: read-only — do not write to profiles */
  readOnly?: boolean;
}

/** Appends structural visual language — does not modify ThemeContext color palettes */
export function VisualStyleProvider({ children, initialStyle, ownerUserId, readOnly }: Props) {
  const [visualStyle, setVisualStyleState] = useState<VisualStyleId>(
    initialStyle ?? readStored()
  );

  useEffect(() => {
    if (initialStyle) {
      setVisualStyleState(initialStyle);
      applyVisualStyle(initialStyle);
    }
  }, [initialStyle]);

  useEffect(() => {
    if (!ownerUserId || readOnly || initialStyle) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('visual_style')
        .eq('user_id', ownerUserId)
        .maybeSingle();
      if (cancelled || !data?.visual_style) return;
      const normalized = normalizeVisualStyle(data.visual_style);
      if (!normalized) return;
      setVisualStyleState(normalized);
      applyVisualStyle(normalized);
      try {
        localStorage.setItem(STORAGE_KEY, normalized);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ownerUserId, readOnly, initialStyle]);

  const setVisualStyle = (style: VisualStyleId) => {
    setVisualStyleState(style);
    applyVisualStyle(style);
    try {
      localStorage.setItem(STORAGE_KEY, style);
    } catch {
      /* ignore */
    }
    
    if (readOnly) return;

    if (ownerUserId && supabase) {
      supabase
        .from('profiles')
        .update({ visual_style: style })
        .eq('user_id', ownerUserId)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to persist visual style to Supabase:', error);
          }
        })
        .catch((error) => {
          console.error('Supabase visual style update exception:', error);
        });
    }
  };

  useEffect(() => {
    applyVisualStyle(visualStyle);
  }, [visualStyle]);

  const styleInfo = useMemo(
    () => VISUAL_STYLE_OPTIONS.find((o) => o.id === visualStyle) ?? VISUAL_STYLE_OPTIONS[0],
    [visualStyle]
  );

  return (
    <VisualStyleContext.Provider value={{ visualStyle, setVisualStyle, styleInfo }}>
      {children}
    </VisualStyleContext.Provider>
  );
}

export function useVisualStyle() {
  const ctx = useContext(VisualStyleContext);
  if (!ctx) throw new Error('useVisualStyle must be inside VisualStyleProvider');
  return ctx;
}

export function useVisualStyleOptional() {
  return useContext(VisualStyleContext);
}
