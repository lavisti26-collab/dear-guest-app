import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/lovable-cloud';
import AuthGuard from '@/components/AuthGuard';
import { WeddingDataProvider } from '@/contexts/WeddingDataContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AdminDashboard from './AdminDashboard';

function AdminInner() {
  const [profile, setProfile] = useState<{ user_id: string; slug: string; theme: string; is_super_admin: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      let { data } = await supabase
        .from('profiles')
        .select('user_id, slug, theme, is_super_admin')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!data) {
        // Safety net: create profile if the signup trigger didn't run
        const base = (user.email || 'couple').split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const slug = `${base}-${user.id.slice(0, 6)}`;
        const { data: inserted, error: insErr } = await supabase
          .from('profiles')
          .insert({ user_id: user.id, email: user.email, display_name: base, slug })
          .select('user_id, slug, theme, is_super_admin')
          .maybeSingle();
        if (insErr) { setError(insErr.message); return; }
        data = inserted as any;
      }
      if (data) setProfile(data as any);
      else setError('Could not load your profile.');
    })();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-destructive mb-2">{error}</p>
          <button onClick={() => supabase.auth.signOut().then(() => location.reload())} className="text-accent underline">Sign out & retry</button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" /></div>;
  }

  return (
    <ThemeProvider initialTheme={profile.theme as any} ownerUserId={profile.user_id}>
      <WeddingDataProvider ownerUserId={profile.user_id}>
        <AdminDashboard publicSlug={profile.slug} isSuperAdmin={profile.is_super_admin} />
      </WeddingDataProvider>
    </ThemeProvider>
  );
}

export default function AdminRoute() {
  return <AuthGuard><AdminInner /></AuthGuard>;
}
