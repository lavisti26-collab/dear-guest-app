import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import { WeddingDataProvider } from '@/contexts/WeddingDataContext';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { VisualStyleProvider } from '@/contexts/VisualStyleContext';

import type { ThemeName } from '@/contexts/ThemeContext';
import { resolveVisualStyle } from '@/lib/visual-styles';

import { fetchPublicProfileBySlug, type PublicInviteProfile } from '@/lib/public-invite';

import InvitationPage from './InvitationPage';



export default function PublicInvitationPage() {

  const { slug } = useParams<{ slug: string }>();

  const [profile, setProfile] = useState<PublicInviteProfile | null>(null);

  const [notFound, setNotFound] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);



  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setLoadError('Loading timed out. Check .env.local and run FULL-SETUP.sql in Supabase.');
        setNotFound(true);
      }
    }, 12000);

    (async () => {
      setNotFound(false);
      setLoadError(null);
      setProfile(null);
      const { profile: loaded, error } = await fetchPublicProfileBySlug(slug);
      if (cancelled) return;
      window.clearTimeout(timeout);
      if (loaded) setProfile(loaded);
      else {
        setLoadError(error);
        setNotFound(true);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [slug]);



  if (notFound) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-background text-center p-6">

        <div>

          <h1 className="font-display text-3xl mb-2">Invitation not found</h1>

          <p className="text-muted-foreground">

            {loadError || "This wedding invitation link doesn't exist."}

          </p>

          <p className="text-sm text-muted-foreground mt-4">

            Check the link from your admin dashboard, or run{' '}

            <code className="text-xs">FULL-SETUP.sql</code> in Supabase.

          </p>

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

    <ThemeProvider initialTheme={profile.theme as ThemeName}>
      <VisualStyleProvider
        initialStyle={resolveVisualStyle(profile.visual_style ?? null, profile.theme)}
        readOnly
      >
        <WeddingDataProvider ownerUserId={profile.user_id} publicProfile={profile}>
          <InvitationPage />
        </WeddingDataProvider>
      </VisualStyleProvider>
    </ThemeProvider>

  );

}

