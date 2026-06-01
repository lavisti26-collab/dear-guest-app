import { supabase } from '@/integrations/supabase/client';
import type { AccountStatus } from '@/lib/account-approval';

interface Props {
  status: AccountStatus;
  email?: string;
}

export default function AccountStatusGate({ status, email }: Props) {
  const signOut = () => supabase.auth.signOut();

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="text-5xl">⏳</div>
          <h1 className="text-2xl font-display text-foreground">Account pending approval</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your signup for <strong>{email}</strong> was received. A platform super-admin must
            approve your account before you can manage your wedding dashboard.
          </p>
          <p className="text-xs text-muted-foreground">
            You will receive access once approved — try signing in again later.
          </p>
          <button
            type="button"
            onClick={signOut}
            className="w-full py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-2xl p-8 shadow-lg">
        <div className="text-5xl">🚫</div>
        <h1 className="text-2xl font-display text-foreground">Account not approved</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your request for <strong>{email}</strong> was declined. Contact the platform operator if
          you believe this is a mistake.
        </p>
        <button
          type="button"
          onClick={signOut}
          className="w-full py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
