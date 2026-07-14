import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ensureUserProfile } from '@/lib/account-approval';
import { toast } from 'sonner';
export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message);
      } else if (data.user) {
        const { error: profileErr, status } = await ensureUserProfile({
          id: data.user.id,
          email: data.user.email ?? email,
        });
        if (profileErr) {
          toast.error(`Account created but profile failed: ${profileErr}`);
        } else if (status === 'approved') {
          toast.success('Account ready! You can manage your dashboard now.');
        } else {
          toast.success(
            'Account created! A super-admin will approve it at Admin → Super → New accounts.'
          );
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      }
    }
    setLoading(false);
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 bg-card border border-border rounded-2xl p-8 shadow-lg"
      >
        <div className="text-center">
          <h1 className="text-2xl font-display text-foreground">
            {mode === 'login' ? 'Admin Login' : 'Create Admin Account'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'login' ? 'Sign in to manage your wedding' : 'Set up your wedding dashboard'}
          </p>
        </div>

        {/* Google OAuth removed: new accounts must be approved by a super-admin */}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">or use email</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button type="button" onClick={() => setMode('signup')} className="text-accent hover:underline">
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('login')} className="text-accent hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
