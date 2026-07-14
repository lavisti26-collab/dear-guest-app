import React, { createContext, useContext, useEffect, useMemo, useCallback, useState } from 'react';
import { Theme, ThemeTokens } from './types';
import { THEME_REGISTRY } from './registry';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
/** The default warm / elegant theme shown to users on first visit. */
const DEFAULT_THEME_ID = 'elegant-gold';

/** Key used to persist the theme choice in localStorage. */
const THEME_STORAGE_KEY = 'dear_guest_theme_id';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads the stored theme ID from localStorage.
 * Returns null if absent, empty, or not a recognised registry key
 * (i.e. the stored value is stale / invalid).
 */
function readStoredThemeId(): string | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    // Validate: the ID must actually exist in the current registry.
    if (THEME_REGISTRY[raw]) return raw;
    // Stale / unknown value — remove it so we fall back to the default.
    console.warn(
      `[ThemeEngine] localStorage contains unknown theme "${raw}". Removing and falling back to default.`,
    );
    localStorage.removeItem(THEME_STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

/** Writes the theme ID to localStorage, silently ignoring storage errors. */
function writeStoredThemeId(id: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    /* ignore – private / incognito mode */
  }
}

/** Removes the persisted theme from localStorage (used by resetToDefault). */
function clearStoredThemeId(): void {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strips the `hsl(...)` wrapper from a color value so it contains only the
 * raw H S% L% channels.  Tailwind uses the variable as `hsl(var(--color))`,
 * so the variable itself must NOT include the `hsl()` call — otherwise the
 * browser would see `hsl(hsl(40 35% 97%))` which is invalid and silently
 * ignored, meaning theme changes appear to do nothing.
 *
 * Examples:
 *   "hsl(40 35% 97%)"   → "40 35% 97%"
 *   "hsl(210 20% 15%)"  → "210 20% 15%"
 *   "40 35% 97%"        → "40 35% 97%"   (passthrough — already stripped)
 */
function toChannels(value: string): string {
  const m = value.match(/^hsl\(\s*(.+?)\s*\)$/i);
  return m ? m[1] : value;
}

/**
 * Applies ALL theme tokens as CSS variables on :root.
 */
export function applyThemeTokens(tokens: ThemeTokens) {
  const root = document.documentElement;
  const { colors, typography, visuals, identity, components } = tokens;

  // 1. Color tokens (kebab-case CSS variables)
  // Strip hsl() wrapper so values are raw channels compatible with Tailwind's
  // `hsl(var(--color))` usage pattern.
  Object.entries(colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    root.style.setProperty(`--${cssKey}`, toChannels(value));
  });

  // 2. Typography as CSS variables
  // Only overwrite if they haven't already been set by the font_pair system.
  if (!root.style.getPropertyValue('--font-heading') || root.style.getPropertyValue('--font-heading').includes('sans-serif')) {
    root.style.setProperty('--font-heading', typography.headingFont);
  }
  if (!root.style.getPropertyValue('--font-body') || root.style.getPropertyValue('--font-body').includes('sans-serif')) {
    root.style.setProperty('--font-body', typography.bodyFont);
  }
  if (!root.style.getPropertyValue('--font-khmer-heading') || root.style.getPropertyValue('--font-khmer-heading').includes('sans-serif')) {
    root.style.setProperty('--font-khmer-heading', typography.khmerHeadingFont);
  }
  if (!root.style.getPropertyValue('--font-khmer-body') || root.style.getPropertyValue('--font-khmer-body').includes('sans-serif')) {
    root.style.setProperty('--font-khmer-body', typography.khmerBodyFont);
  }
  root.style.setProperty('--heading-weight', typography.headingWeight);
  root.style.setProperty('--body-weight', typography.bodyWeight);
  root.style.setProperty('--letter-spacing', typography.letterSpacing);

  // 3. Visual tokens
  root.style.setProperty('--radius', visuals.radius);
  root.style.setProperty('--shadow-base', visuals.shadow);

  // 4. Identity tokens
  root.style.setProperty('--bg-gradient', identity.backgroundGradient);
  root.style.setProperty('--bg-pattern', identity.backgroundPattern || 'none');
  root.style.setProperty('--texture', identity.texture || 'none');
  root.style.setProperty('--section-decoration', identity.sectionDecoration);

  // 5. Component tokens
  root.style.setProperty('--card-border', components.card.border);
  root.style.setProperty('--card-shadow', components.card.shadow);
  root.style.setProperty('--card-style', components.card.style);
  root.style.setProperty('--btn-transition', components.button.transition);
  root.style.setProperty('--btn-style', components.button.style);
  root.style.setProperty('--timeline-style', components.timeline.style);
  root.style.setProperty('--timeline-marker', components.timeline.markerStyle);
  root.style.setProperty('--gallery-style', components.gallery.style);
  root.style.setProperty('--gallery-gap', components.gallery.gap);
  root.style.setProperty('--rsvp-style', components.rsvp.style);
  root.style.setProperty('--footer-style', components.footer.style);

  // 6. Body font-family
  root.style.fontFamily = `var(--font-body)`;
}

/**
 * Reverts CSS variables to defaults (used when unmounting the provider).
 */
export function revertToDefaults() {
  const root = document.documentElement;
  const vars = [
    '--primary', '--primary-foreground', '--accent', '--accent-foreground',
    '--background', '--foreground', '--secondary', '--secondary-foreground',
    '--muted', '--muted-foreground', '--card', '--card-foreground',
    '--popover', '--popover-foreground', '--border', '--input', '--ring',
    '--font-heading', '--font-body', '--font-khmer-heading', '--font-khmer-body',
    '--heading-weight', '--body-weight', '--letter-spacing',
    '--radius', '--shadow-base', '--shadow-surface', '--shadow-luxury', '--shadow-glow',
    '--bg-gradient', '--bg-pattern', '--texture', '--section-decoration',
    '--card-border', '--card-shadow', '--card-style', '--btn-transition', '--btn-style',
    '--timeline-style', '--timeline-marker', '--gallery-style', '--gallery-gap',
    '--rsvp-style', '--footer-style',
  ];
  vars.forEach(v => root.style.removeProperty(v));
  root.removeAttribute('data-theme');
  // DO NOT remove data-visual-style — VisualStyleProvider manages this independently.
  root.style.fontFamily = '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: string, persist?: boolean) => Promise<void>;
  resetToDefault: () => void;
  tokens: ThemeTokens;
  isDark: boolean;
  categories: { label: string; themes: Theme[] }[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// ThemeProvider
// ─────────────────────────────────────────────────────────────────────────────

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  /**
   * The theme ID sourced from Supabase (or role defaults).
   * This is the "server truth" — it wins over localStorage on first render,
   * but once the user picks a theme locally, the local choice takes effect
   * until the next provider mount.
   */
  initialTheme: string;
  onThemeChange?: (themeId: string) => void;
}> = ({ children, initialTheme, onThemeChange }) => {

  // ── Resolve the starting theme ID ──────────────────────────────────────────
  // Priority: initialTheme prop (from Supabase) → stored localStorage value → DEFAULT_THEME_ID.
  // localStorage is only used as a tiebreaker when initialTheme is absent or unknown.
  const resolveStartingTheme = (): string => {
    // If the server gave us a valid theme, always trust it.
    if (initialTheme && THEME_REGISTRY[initialTheme]) return initialTheme;
    // Otherwise try the localStorage cache.
    const stored = readStoredThemeId();
    if (stored) return stored;
    // Final fallback: warm default.
    return DEFAULT_THEME_ID;
  };

  // ── State ──────────────────────────────────────────────────────────────────
  // `currentThemeId` is proper React state — updating it causes a re-render
  // and immediately re-applies the CSS tokens.
  const [currentThemeId, setCurrentThemeId] = useState<string>(resolveStartingTheme);

  // Resolve the Theme object (always falls back to the default if unknown).
  const theme = useMemo(
    () => THEME_REGISTRY[currentThemeId] ?? THEME_REGISTRY[DEFAULT_THEME_ID],
    [currentThemeId],
  );

  // Derived values — isDark is computed based on whether the background HSL light value is < 30%
  const isDark = useMemo(() => {
    const bg = theme.tokens.colors.background;
    const match = bg.match(/hsl\(\d+\s+\d+%\s+(\d+)%\)/);
    if (match) return parseInt(match[1]) < 30;
    return false;
  }, [theme]);

  // ── Sync with parent prop changes ──────────────────────────────────────────
  // When the parent re-fetches from Supabase and hands us a new initialTheme,
  // adopt it (e.g. super-admin switching between couple profiles).
  useEffect(() => {
    if (initialTheme && THEME_REGISTRY[initialTheme] && initialTheme !== currentThemeId) {
      setCurrentThemeId(initialTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTheme]);

  // ── Apply CSS tokens whenever the active theme changes ────────────────────
  useEffect(() => {
    applyThemeTokens(theme.tokens);
    document.documentElement.setAttribute('data-theme', theme.id);
    document.documentElement.setAttribute('data-theme-mode', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
    // NOTE: data-visual-style is managed by VisualStyleProvider — do NOT touch it here.
  }, [theme, isDark]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      const root = document.documentElement;
      const vars = [
        '--shadow-surface', '--shadow-luxury', '--shadow-glow',
        '--bg-gradient', '--bg-pattern', '--texture', '--section-decoration',
        '--card-border', '--card-shadow', '--card-style', '--btn-transition', '--btn-style',
        '--timeline-style', '--timeline-marker', '--gallery-style', '--gallery-gap',
        '--rsvp-style', '--footer-style',
      ];
      vars.forEach(v => root.style.removeProperty(v));
    };
  }, []);

  // ── setTheme ──────────────────────────────────────────────────────────────
  /**
   * Switches the active theme.
   *
   * @param id      A key from THEME_REGISTRY.
   * @param persist Whether to notify the parent (`onThemeChange`) so it can
   *                persist the choice to Supabase. Default: true.
   */
  const setTheme = useCallback(async (id: string, persist = true) => {
    const found = THEME_REGISTRY[id];
    if (!found) {
      console.warn(`[ThemeEngine] setTheme("${id}") — unknown theme ID, ignoring.`);
      return;
    }

    // ① Update React state → triggers re-render and the useEffect above.
    setCurrentThemeId(found.id);

    // ② Immediately apply CSS so there is zero visual delay.
    applyThemeTokens(found.tokens);
    document.documentElement.setAttribute('data-theme', found.id);

    // ③ Persist to localStorage so the choice survives a hard refresh.
    writeStoredThemeId(found.id);

    // ④ Optionally notify the parent (e.g. to save to Supabase).
    if (persist && onThemeChange) {
      onThemeChange(found.id);
    }
  }, [onThemeChange]);

  // ── resetToDefault ────────────────────────────────────────────────────────
  /**
   * Clears any stale localStorage value and resets to the warm default theme.
   * Call this from an emergency "Reset Theme" button or on startup validation.
   */
  const resetToDefault = useCallback(() => {
    clearStoredThemeId();
    const defaultTheme = THEME_REGISTRY[DEFAULT_THEME_ID];
    setCurrentThemeId(DEFAULT_THEME_ID);
    applyThemeTokens(defaultTheme.tokens);
    document.documentElement.setAttribute('data-theme', DEFAULT_THEME_ID);
    if (onThemeChange) {
      onThemeChange(DEFAULT_THEME_ID);
    }
  }, [onThemeChange]);



  const categories = useMemo(() => {
    const cats: { label: string; themes: Theme[] }[] = [];
    const grouped: Record<string, Theme[]> = {};
    Object.values(THEME_REGISTRY).forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = [];
      grouped[t.category].push(t);
    });
    Object.entries(grouped).forEach(([label, themes]) => {
      cats.push({ label, themes });
    });
    return cats;
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetToDefault, tokens: theme.tokens, isDark, categories }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

/** Safe version — returns a light-mode default if no ThemeProvider is present */
export const useThemeOptional = () => {
  const context = useContext(ThemeContext);
  return context ?? {
    isDark: false,
    theme: null,
    tokens: null,
    setTheme: async () => {},
    resetToDefault: () => {},
    categories: [],
  };
};