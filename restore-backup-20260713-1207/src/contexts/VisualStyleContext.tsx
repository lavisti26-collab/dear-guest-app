import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import type { VisualStyleId } from '@/lib/visual-styles';
import { normalizeVisualStyle, VISUAL_STYLE_OPTIONS } from '@/lib/visual-styles';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'dear_guest_visual_style';

// ─────────────────────────────────────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a raw localStorage string against the known VisualStyleId set.
 * Returns null if the value is absent, empty, or an unknown (stale) ID.
 * Also purges the stale entry from localStorage so the app never gets stuck.
 */
function validateVisualStyleId(raw: string | null): VisualStyleId | null {
  if (!raw) return null;
  const valid = VISUAL_STYLE_OPTIONS.some(o => o.id === raw);
  if (valid) return raw as VisualStyleId;
  // Stale / unknown value — remove it so we fall back cleanly.
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  console.warn(`[VisualStyle] Stale visual style "${raw}" cleared from localStorage.`);
  return null;
}

/**
 * Reads and validates the stored visual style.
 * Falls back to 'classic' if absent or invalid.
 */
function readStored(): VisualStyleId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return validateVisualStyleId(raw) ?? 'classic';
  } catch {
    return 'classic';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface VisualStyleContextType {
  visualStyle: VisualStyleId;
  setVisualStyle: (style: VisualStyleId) => void;
  styleInfo: (typeof VISUAL_STYLE_OPTIONS)[number];
}

const VisualStyleContext = createContext<VisualStyleContextType | null>(null);

export function applyVisualStyle(style: VisualStyleId) {
  const root = document.documentElement;
  root.setAttribute('data-visual-style', style);
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
  /** Saved style from Supabase (invite/admin) — takes priority over localStorage */
  initialStyle?: VisualStyleId;
  /** When set, loads & saves visual_style on profiles for this couple */
  ownerUserId?: string;
  /** Guest/public invite: read-only — do not write to profiles */
  readOnly?: boolean;
  onVisualStyleChange?: (style: VisualStyleId) => void;
}

/** Appends structural visual language — does not modify ThemeContext color palettes */
export function VisualStyleProvider({ children, initialStyle, ownerUserId, readOnly, onVisualStyleChange }: Props) {
  // IMPORTANT: Apply the style immediately on mount, before any async fetch happens.
  // This prevents a flash of the wrong visual style.
  const initialStyleValue = initialStyle ?? readStored();
  const [visualStyle, setVisualStyleState] = useState<VisualStyleId>(initialStyleValue);

  // Apply IMMEDIATELY on mount — not awaiting DOM paint.
  useEffect(() => {
    applyVisualStyle(visualStyle);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When the parent passes a new initialStyle (e.g. after a Supabase fetch), adopt it.
  useEffect(() => {
    if (initialStyle) {
      setVisualStyleState(initialStyle);
      applyVisualStyle(initialStyle);
    }
  }, [initialStyle]);

  // Optional: fetch the saved visual_style from Supabase when no initialStyle was passed.
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

  // ── setVisualStyle ────────────────────────────────────────────────────────
  const setVisualStyle = (style: VisualStyleId) => {
    // ① Update React state (causes re-render)
    setVisualStyleState(style);
    // ② Apply immediately to DOM
    applyVisualStyle(style);
    // ③ Always overwrite localStorage so stale values cannot get stuck
    try {
      localStorage.setItem(STORAGE_KEY, style);
    } catch {
      /* ignore */
    }

    if (onVisualStyleChange) {
      onVisualStyleChange(style);
    }

    if (readOnly) return;

    if (ownerUserId && supabase) {
      supabase
        .from('profiles')
        .update({ visual_style: style })
        .eq('user_id', ownerUserId)
        .then(
          ({ error }) => {
            if (error) {
              console.error('Failed to persist visual style to Supabase:', error);
            }
          },
          (error) => {
            console.error('Supabase visual style update exception:', error);
          }
        );
    }
  };

  // Keep the DOM in sync whenever state changes (e.g. from external updates).
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

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

export function useVisualStyle() {
  const ctx = useContext(VisualStyleContext);
  if (!ctx) throw new Error('useVisualStyle must be inside VisualStyleProvider');
  return ctx;
}

export function useVisualStyleOptional() {
  return useContext(VisualStyleContext);
}
