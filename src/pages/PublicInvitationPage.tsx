import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/lovable-cloud';
import { WeddingDataProvider } from '@/contexts/WeddingDataContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import InvitationPage from './InvitationPage';

export default function PublicInvitationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<{ user_id: string; theme: string } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase.from('profiles_public' as any).select('user_id, theme').eq('slug', slug).maybeSingle()
      .then(({ data }) => {
        if (data) setProfile(data as any);
        else setNotFound(true);
      });
  }, [slug]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-center p-6">
        <div>
          <h1 className="font-display text-3xl mb-2">Invitation not found</h1>
          <p className="text-muted-foreground">This wedding invitation link doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <ThemeProvider initialTheme={profile.theme as any}>
      <WeddingDataProvider ownerUserId={profile.user_id}>
        <InvitationPage />
      </WeddingDataProvider>
    </ThemeProvider>
  );
}
