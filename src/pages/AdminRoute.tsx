import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthGuard from '@/components/AuthGuard';
import { WeddingDataProvider } from '@/contexts/WeddingDataContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { VisualStyleProvider } from '@/contexts/VisualStyleContext';
import AdminDashboard from './AdminDashboard';
import { normalizeTheme } from '@/lib/theme';
import { normalizeVisualStyle, type VisualStyleId } from '@/lib/visual-styles';

type AdminProfile = {
  user_id: string;
  slug: string;
  theme: string;
  is_super_admin: boolean;
};

function AdminInner() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const coupleIdFromQuery = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('couple');
    } catch {
      return null;
    }
  }, []);

  const [effectiveOwnerUserId, setEffectiveOwnerUserId] = useState<string | null>(null);
  const [effectiveTheme, setEffectiveTheme] = useState<string | null>(null);
  const [effectiveVisualStyle, setEffectiveVisualStyle] = useState<VisualStyleId | null>(null);

  useEffect(() => {
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
        // New accounts are NOT granted super-admin by default. Super-admin
        // status must be granted explicitly by an existing super-admin via
        // the Super Admin dashboard.
        const isSuperAdmin = false;
        const { data: inserted, error: insErr } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            user_id: user.id,
            email: user.email,
            display_name: base,
            slug,
            theme: 'gold',
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
      let theme = data.theme;
      let visualStyle = normalizeVisualStyle(data.visual_style) ?? 'classic';

      // If super admin provided ?couple=..., allow managing that couple's data
      if (data.is_super_admin && coupleIdFromQuery) {
        const { data: coupleProfile, error: coupleErr } = await supabase
          .from('profiles')
          .select('user_id, theme, visual_style')
          .eq('user_id', coupleIdFromQuery)
          .maybeSingle();

        if (!coupleErr && coupleProfile?.user_id) {
          ownerUserId = coupleProfile.user_id;
          theme = coupleProfile.theme ?? theme;
          visualStyle = normalizeVisualStyle(coupleProfile.visual_style) ?? visualStyle;
        }
      }

      setEffectiveOwnerUserId(ownerUserId);
      setEffectiveTheme(theme);
      setEffectiveVisualStyle(visualStyle);
    })();
  }, [coupleIdFromQuery]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-destructive mb-2">{error}</p>
          <button
            onClick={() => supabase.auth.signOut().then(() => location.reload())}
            className="text-accent underline"
          >
            Sign out & retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile || !effectiveOwnerUserId || !effectiveTheme || !effectiveVisualStyle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <ThemeProvider initialTheme={normalizeTheme(effectiveTheme)} ownerUserId={effectiveOwnerUserId}>
      <VisualStyleProvider ownerUserId={effectiveOwnerUserId} initialStyle={effectiveVisualStyle}>
        <WeddingDataProvider ownerUserId={effectiveOwnerUserId}>
          <AdminDashboard publicSlug={profile.slug} isSuperAdmin={profile.is_super_admin} />
        </WeddingDataProvider>
      </VisualStyleProvider>
    </ThemeProvider>
  );
}

export default function AdminRoute() {
  return <AuthGuard><AdminInner /></AuthGuard>;
}
