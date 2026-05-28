import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthGuard from '@/components/AuthGuard';
import { WeddingDataProvider } from '@/contexts/WeddingDataContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AdminDashboard from './AdminDashboard';

function AdminInner() {
  const [profile, setProfile] = useState<{ user_id: string; slug: string; theme: string; is_super_admin: boolean } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('user_id, slug, theme, is_super_admin').eq('user_id', user.id).maybeSingle();
      if (data) setProfile(data as any);
    })();
  }, []);

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
