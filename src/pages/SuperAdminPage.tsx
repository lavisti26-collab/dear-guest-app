import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/lovable-cloud';
import { Link } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';

interface Couple { user_id: string; slug: string; display_name: string; email: string; created_at: string; }

function Inner() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [stats, setStats] = useState({ guests: 0, wishes: 0, rsvps: 0 });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthorized(false); return; }
      const { data: prof } = await supabase.from('profiles').select('is_super_admin').eq('user_id', user.id).maybeSingle();
      if (!prof?.is_super_admin) { setAuthorized(false); return; }
      setAuthorized(true);

      const [{ data: cps }, { count: gc }, { count: wc }, { count: rc }] = await Promise.all([
        supabase.from('profiles').select('user_id, slug, display_name, email, created_at').order('created_at', { ascending: false }),
        supabase.from('guests').select('*', { count: 'exact', head: true }),
        supabase.from('wishes').select('*', { count: 'exact', head: true }),
        supabase.from('guests').select('*', { count: 'exact', head: true }).eq('rsvp_status', 'attending'),
      ]);
      setCouples((cps as Couple[]) || []);
      setStats({ guests: gc || 0, wishes: wc || 0, rsvps: rc || 0 });
    })();
  }, []);

  if (authorized === null) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" /></div>;
  if (!authorized) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-center p-6">
      <div>
        <h1 className="font-display text-3xl mb-2">🔒 Access Denied</h1>
        <p className="text-muted-foreground mb-4">Only super admins can view this page.</p>
        <Link to="/admin" className="text-accent underline">← Back to dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">👑 Super Admin</h1>
        <Link to="/admin" className="text-sm bg-accent text-accent-foreground rounded-full px-4 py-2">← My Dashboard</Link>
      </header>

      <div className="max-w-5xl mx-auto grid sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5"><div className="text-3xl font-bold">{couples.length}</div><div className="text-sm text-muted-foreground">Couples</div></div>
        <div className="glass-card rounded-2xl p-5"><div className="text-3xl font-bold">{stats.guests}</div><div className="text-sm text-muted-foreground">Total Guests</div></div>
        <div className="glass-card rounded-2xl p-5"><div className="text-3xl font-bold">{stats.rsvps}</div><div className="text-sm text-muted-foreground">Confirmed RSVPs</div></div>
        <div className="glass-card rounded-2xl p-5"><div className="text-3xl font-bold">{stats.wishes}</div><div className="text-sm text-muted-foreground">Wishes</div></div>
      </div>

      <div className="max-w-5xl mx-auto glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40"><tr>
            <th className="text-left px-4 py-3">Couple</th><th className="text-left px-4 py-3">Email</th>
            <th className="text-left px-4 py-3">Public Link</th><th className="text-left px-4 py-3">Joined</th>
          </tr></thead>
          <tbody className="divide-y divide-border/30">
            {couples.map(c => (
              <tr key={c.user_id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{c.display_name || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3"><a className="text-accent underline" href={`/invite/${c.slug}`} target="_blank" rel="noreferrer">/invite/{c.slug}</a></td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SuperAdminPage() { return <AuthGuard><Inner /></AuthGuard>; }
