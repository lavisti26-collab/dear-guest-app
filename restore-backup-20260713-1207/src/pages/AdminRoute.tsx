import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthGuard from '@/components/AuthGuard';
import { WeddingDataProvider } from '@/contexts/WeddingDataContext';
import { ThemeProvider } from '@/theme/ThemeEngine';
import { THEME_REGISTRY } from '@/theme/registry';
import { resolveLegacyTheme } from '@/theme/legacy-migration';
import AdminDashboard from './AdminDashboard';
import { VisualStyleProvider } from '@/contexts/VisualStyleContext';
import { normalizeVisualStyle, resolveVisualStyle, type VisualStyleId } from '@/lib/visual-styles';
import { LanguageProvider } from '@/contexts/LanguageContext';

/** Warm light default used when the profile has no theme or an unknown one. */
const ADMIN_DEFAULT_THEME = 'elegant-gold';

/**
 * Theme IDs (after legacy resolution) that render a dark UI in the admin dashboard.
 * If a profile has one of these stored, we auto-reset to the light default so the
 * admin never gets stuck with a dark UI they can't see the controls in.
 */
const ADMIN_DARK_THEMES = new Set([
  'luxury-black',
  'dark-luxury',
  'apple-event',
  'cinema',
  'midnight-gala',
  'midnight-corporate',
  'luxury-magazine',
]);

/**
 * Resolves a raw theme string from Supabase into a valid THEME_REGISTRY key.
 * Falls back to ADMIN_DEFAULT_THEME if the value is absent or unrecognised.
 */
function resolveProfileTheme(raw: string | null | undefined): string {
  if (!raw) return ADMIN_DEFAULT_THEME;
  const mapped = resolveLegacyTheme(raw);
  // After mapping, make sure the ID actually exists in the registry.
  if (THEME_REGISTRY[mapped]) return mapped;
  console.warn(`[AdminRoute] Unknown theme "${raw}" → falling back to default.`);
  return ADMIN_DEFAULT_THEME;
}

type AdminProfile = {
  user_id: string;
  slug: string;
  theme: string;
  is_super_admin: boolean;
};

/** Module-level cache — survives React remounts but resets on hard refresh */
let _cachedAdminProfile: {
  profile: AdminProfile;
  ownerUserId: string;
  theme: string;
  visualStyle: VisualStyleId;
  coupleId: string | null;
} | null = null;

function AdminInner() {
  const [profile, setProfile] = useState<AdminProfile | null>(_cachedAdminProfile?.profile ?? null);
  const [error, setError] = useState<string | null>(null);

  const coupleIdFromQuery = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('couple');
    } catch {
      return null;
    }
  }, []);

  const [effectiveOwnerUserId, setEffectiveOwnerUserId] = useState<string | null>(_cachedAdminProfile?.ownerUserId ?? null);
  // Always initialise to the warm default — never null — so the loading spinner
  // disappears even if the profile query returns an unknown/null theme.
  const [effectiveTheme, setEffectiveTheme] = useState<string>(_cachedAdminProfile?.theme ?? ADMIN_DEFAULT_THEME);
  const [effectiveVisualStyle, setEffectiveVisualStyle] = useState<VisualStyleId>(_cachedAdminProfile?.visualStyle ?? 'classic');
  const [profileLoaded, setProfileLoaded] = useState(_cachedAdminProfile !== null);

  useEffect(() => {
    // If we already have cached data for the same coupleId, skip re-fetching.
    // This prevents a loading flash when navigating back from the guest invite page.
    if (_cachedAdminProfile && _cachedAdminProfile.coupleId === coupleIdFromQuery) return;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data } = await supabase
        .from('profiles')
        .select('user_id, slug, theme, visual_style, is_super_admin')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!data) {
        // Safety net: create profile if the signup trigger didn't run
        const base = (user.email || 'couple').split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const slug = `${base}-${user.id.slice(0, 6)}`;
        const isSuperAdmin = false;
        const { data: inserted, error: insErr } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            user_id: user.id,
            email: user.email,
            display_name: base,
            slug,
            theme: ADMIN_DEFAULT_THEME,
            is_super_admin: isSuperAdmin,
            account_status: 'pending',
          })
          .select('user_id, slug, theme, visual_style, is_super_admin')
          .maybeSingle();
        if (insErr) { setError(insErr.message); return; }
        data = inserted;
      }

      if (!data) {
        setError('Could not load your profile.');
        return;
      }

      setProfile(data);

      // Default: manage own data/theme
      let ownerUserId = data.user_id;
      let theme = resolveProfileTheme(data.theme);
      let visualStyle: VisualStyleId = resolveVisualStyle(data.visual_style, theme as any);

      // ── Dark-theme guard ────────────────────────────────────────────────────
      // If the stored theme renders a dark admin UI, we use the warm default theme
      // locally for the admin dashboard so the controls remain readable, but we
      // do NOT write this default back to Supabase. This keeps the couple's selected
      // dark invitation theme intact for public guests.
      if (ADMIN_DARK_THEMES.has(theme)) {
        console.info(`[AdminRoute] Dark theme "${theme}" selected — rendering admin UI in light default theme.`);
        theme = ADMIN_DEFAULT_THEME;
      }

      // If super admin provided ?couple=..., allow managing that couple's data
      if (data.is_super_admin && coupleIdFromQuery) {
        const { data: coupleProfile, error: coupleErr } = await supabase
          .from('profiles')
          .select('user_id, theme, visual_style')
          .eq('user_id', coupleIdFromQuery)
          .maybeSingle();

        if (!coupleErr && coupleProfile?.user_id) {
          ownerUserId = coupleProfile.user_id;
          theme = resolveProfileTheme(coupleProfile.theme);
          visualStyle = resolveVisualStyle(coupleProfile.visual_style, theme as any);

          // Apply dark-theme guard to the couple's profile too — we don't want
          // the super admin's admin UI to go dark just because a couple chose a
          // dark invitation theme.
          if (ADMIN_DARK_THEMES.has(theme)) {
            console.info(`[AdminRoute] Couple's dark theme "${theme}" — using ${ADMIN_DEFAULT_THEME} for admin UI.`);
            theme = ADMIN_DEFAULT_THEME;
          }
        }
      }

      setEffectiveOwnerUserId(ownerUserId);
      setEffectiveTheme(theme);
      setEffectiveVisualStyle(visualStyle);
      setProfileLoaded(true);

      // Cache the result so navigating back to /admin is instant
      _cachedAdminProfile = {
        profile: data,
        ownerUserId,
        theme,
        visualStyle,
        coupleId: coupleIdFromQuery,
      };
    })();
  }, [coupleIdFromQuery]);

  /**
   * Called by ThemeProvider whenever setTheme(id, persist=true) or resetToDefault() fires.
   * Saves the new theme ID back to the Supabase profile so it persists across browsers.
   */
  const handleThemeChange = useCallback((themeId: string) => {
    if (!effectiveOwnerUserId) return;
    setEffectiveTheme(themeId);
    if (_cachedAdminProfile) {
      _cachedAdminProfile.theme = themeId;
    }
    supabase
      .from('profiles')
      .update({ theme: themeId })
      .eq('user_id', effectiveOwnerUserId)
      .then(({ error }) => {
        if (error) console.error('[AdminRoute] Failed to save theme to Supabase:', error);
      });
  }, [effectiveOwnerUserId]);

  const handleVisualStyleChange = useCallback((style: VisualStyleId) => {
    setEffectiveVisualStyle(style);
    if (_cachedAdminProfile) {
      _cachedAdminProfile.visualStyle = style;
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-destructive mb-2">{error}</p>
          <button
            onClick={() => supabase.auth.signOut().then(() => location.reload())}
            className="text-accent underline"
          >
            Sign out &amp; retry
          </button>
        </div>
      </div>
    );
  }

  // Wait until we have the user ID — but theme/visualStyle always have safe defaults
  if (!profile || !effectiveOwnerUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <LanguageProvider>
      <VisualStyleProvider
        initialStyle={effectiveVisualStyle}
        ownerUserId={effectiveOwnerUserId}
        onVisualStyleChange={handleVisualStyleChange}
      >
        <ThemeProvider
          initialTheme={effectiveTheme}
          onThemeChange={handleThemeChange}
        >
          <WeddingDataProvider ownerUserId={effectiveOwnerUserId}>
            <AdminDashboard publicSlug={profile.slug} isSuperAdmin={profile.is_super_admin} />
          </WeddingDataProvider>
        </ThemeProvider>
      </VisualStyleProvider>
    </LanguageProvider>
  );
}

export default function AdminRoute() {
  return <AuthGuard><AdminInner /></AuthGuard>;
}
