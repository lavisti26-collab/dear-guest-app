import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WeddingDataProvider } from '@/contexts/WeddingDataContext';
import { ThemeProvider } from '@/theme/ThemeEngine';
import { resolveLegacyTheme } from '@/theme/legacy-migration';
import { fetchPublicProfileBySlug, type PublicInviteProfile } from '@/lib/public-invite';
import { VisualStyleProvider, applyVisualStyle } from '@/contexts/VisualStyleContext';
import { normalizeVisualStyle, resolveVisualStyle } from '@/lib/visual-styles';
import InvitationPage from './InvitationPage';

export default function PublicInvitationPage() {
  const { slug, guestName } = useParams<{ slug: string; guestName?: string }>();
  const [profile, setProfile] = useState<PublicInviteProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visualStyle, setVisualStyle] = useState<string>('classic');
  // Separate "slow network" state from "truly not found".
  // The 12-second timeout now shows a warning overlay while keeping the spinner
  // active. notFound is only set when the API explicitly confirms the slug
  // doesn't exist — never by the timeout alone.
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setIsTimedOut(true);
      }
    }, 12000);

    (async () => {
      setNotFound(false);
      setLoadError(null);
      setIsTimedOut(false);
      setProfile(null);
      const { profile: loaded, error } = await fetchPublicProfileBySlug(slug);
      if (cancelled) return;
      window.clearTimeout(timeout);
      if (loaded) {
        setIsTimedOut(false);
        setProfile(loaded);
        const vs = resolveVisualStyle(loaded.visual_style, loaded.theme);
        setVisualStyle(vs);
        applyVisualStyle(vs);
      } else {
        // Only mark as "not found" when the fetch itself confirms it
        setLoadError(error);
        setNotFound(true);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [slug]);

  // Handle empty slug case
  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-center p-6">
        <div>
          <h1 className="font-display text-3xl mb-2">Wedding Invitation</h1>
          <p className="text-muted-foreground">
            Please provide a valid invitation link.
          </p>
        </div>
      </div>
    );
  }

  if (notFound) {
    const isNetworkError = loadError && (
      loadError.includes('Failed to fetch') || 
      loadError.includes('network') || 
      loadError.includes('Connection') || 
      loadError.includes('TypeError') ||
      loadError.includes('fetch')
    );
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-center p-6">
        {isNetworkError ? (
          <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-red-200/50 shadow-xl space-y-6 flex flex-col items-center">
            <div className="text-5xl animate-bounce">🌐</div>
            <h1 className="font-display text-2xl font-bold text-foreground">Connection Error</h1>
            <p className="text-sm text-muted-foreground">
              We couldn't connect to the database. Please check your internet connection or try again in a few moments.
            </p>
            {loadError && (
              <p className="text-xs font-mono text-destructive bg-destructive/5 rounded-lg p-2.5 break-all max-h-24 overflow-y-auto w-full">
                {loadError}
              </p>
            )}
            <button
              className="w-full bg-primary text-primary-foreground rounded-2xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </button>
          </div>
        ) : (
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
        )}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        {isTimedOut && (
          <div className="text-center px-6 max-w-sm">
            <p className="text-sm text-muted-foreground">
              Still loading… this is taking longer than expected.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Check your network connection or try refreshing the page.
            </p>
            <button
              className="mt-4 text-xs underline text-primary"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <VisualStyleProvider initialStyle={visualStyle as any} readOnly>
      <ThemeProvider initialTheme={resolveLegacyTheme(profile.theme)}>
        <WeddingDataProvider ownerUserId={profile.user_id} publicProfile={profile}>
          <InvitationPage initialGuestName={guestName} />
        </WeddingDataProvider>
      </ThemeProvider>
    </VisualStyleProvider>
  );
}