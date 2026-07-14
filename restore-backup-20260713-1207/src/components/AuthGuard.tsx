import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import AdminLogin from '@/pages/AdminLogin';
import AccountStatusGate from '@/components/auth/AccountStatusGate';
import { getMyAccountStatus } from '@/lib/account-approval';

type GateState = 'loading' | 'allowed' | 'pending' | 'rejected' | 'no_profile';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [gate, setGate] = useState<GateState>('loading');
  const [gateError, setGateError] = useState<string | null>(null);
  const lastUserIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    try {
      if (!supabase || !supabase.auth || typeof supabase.auth.onAuthStateChange !== 'function') {
        setLoading(false);
        setSession(null);
        return;
      }

      const sub = supabase.auth.onAuthStateChange((_event: unknown, nextSession: Session | null) => {
        setSession(nextSession);
        setLoading(false);
      });

      supabase.auth
        .getSession()
        .then(({ data: { session: nextSession } }: { data: { session: Session | null } }) => {
          setSession(nextSession);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      return () => {
        try {
          sub?.data?.subscription?.unsubscribe?.();
        } catch {
          /* ignore */
        }
      };
    } catch (err) {
      console.error('AuthGuard error checking Supabase auth:', err);
      setLoading(false);
      setSession(null);
    }
  }, []);

  useEffect(() => {
    if (!session) {
      setGate('allowed');
      setGateError(null);
      lastUserIdRef.current = null;
      return;
    }

    const userId = session.user.id;
    const isNewUser = userId !== lastUserIdRef.current;
    lastUserIdRef.current = userId;

    let cancelled = false;
    (async () => {
      if (isNewUser) {
        setGate('loading');
      }
      const { status, isSuperAdmin, error } = await getMyAccountStatus();
      if (cancelled) return;

      if (error) {
        setGateError(error);
        setGate('no_profile');
        return;
      }

      setGateError(null);

      if (isSuperAdmin || status === 'approved') {
        setGate('allowed');
      } else if (status === 'rejected') {
        setGate('rejected');
      } else if (status === 'pending') {
        setGate('pending');
      } else {
        setGate('no_profile');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (loading || (session && gate === 'loading')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">Supabase not configured</h2>
          <p className="text-muted-foreground mb-4">
            This app requires Supabase environment variables to be set to access the admin dashboard.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Add the following to your `.env.local` and restart the dev server:
          </p>
          <pre className="bg-card border border-border rounded-md p-3 text-left text-xs">
            VITE_SUPABASE_URL=your_project_url{'\n'}VITE_SUPABASE_ANON_KEY=your_anon_key
          </pre>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AdminLogin />;
  }

  if (gate === 'pending') {
    return <AccountStatusGate status="pending" email={session.user.email} />;
  }

  if (gate === 'rejected') {
    return <AccountStatusGate status="rejected" email={session.user.email} />;
  }

  if (gate === 'no_profile') {
    const retry = () => {
      if (!session) return;
      setGate('loading');
      getMyAccountStatus().then(({ status, isSuperAdmin, error }) => {
        if (error) {
          setGateError(error);
          setGate('no_profile');
          return;
        }
        setGateError(null);
        if (isSuperAdmin || status === 'approved') setGate('allowed');
        else if (status === 'rejected') setGate('rejected');
        else if (status === 'pending') setGate('pending');
        else setGate('no_profile');
      });
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-xl font-semibold">Could not set up profile</h2>
          <p className="text-muted-foreground text-sm">
            {gateError ||
              'Your login exists but the wedding profile could not be created automatically.'}
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={retry}
              className="py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="text-accent underline text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
