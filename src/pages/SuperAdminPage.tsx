import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { getThemeForRole } from '@/lib/role-themes';
import { VisualStyleProvider } from '@/contexts/VisualStyleContext';
import { toast } from 'sonner';
import AuthGuard from '@/components/AuthGuard';
import { Users, UserCheck, Heart, MessageSquare, Percent, Eye, Settings, Trash2, X } from 'lucide-react';
import CinematicTransition from '@/components/effects/CinematicTransition';
import RoleBasedSticker from '@/components/stickers/RoleBasedSticker';
import EmojiSticker from '@/components/stickers/EmojiSticker';
import DisplayHeading from '@/components/typography/DisplayHeading';
import DashboardText from '@/components/typography/DashboardText';
import GlowButton from '@/components/effects/GlowButton';
import AdminCardGrid from '@/components/layouts/AdminCardGrid';
import StickerBadge from '@/components/stickers/StickerBadge';
import ThemeAwareParticles from '@/components/effects/ThemeAwareParticles';

interface Couple { 
  user_id: string; 
  slug: string; 
  display_name: string; 
  email: string; 
  created_at: string;
  guestCount?: number;
  rsvpCount?: number;
  wishCount?: number;
  theme?: string;
}

type DeniedInfo = { email: string; reason: string };
type SortBy = 'recent' | 'name' | 'guests' | 'rsvps';

function Inner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'system' ? 'system' : 'couples';
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [denied, setDenied] = useState<DeniedInfo | null>(null);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [stats, setStats] = useState({ guests: 0, wishes: 0, rsvps: 0, totalCouples: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  
  // FlyonUI Drawer state
  const [selectedCouple, setSelectedCouple] = useState<Couple | null>(null);
  const [coupleDetails, setCoupleDetails] = useState<{ guestsList: any[]; wishesList: any[] } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const filteredAndSorted = useMemo(() => {
    const filtered = couples.filter(c => 
      c.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return (a.display_name || '').localeCompare(b.display_name || '');
        case 'guests': return (b.guestCount || 0) - (a.guestCount || 0);
        case 'rsvps': return (b.rsvpCount || 0) - (a.rsvpCount || 0);
        case 'recent':
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [couples, searchTerm, sortBy]);

  const fetchCoupleStats = async (coupleIds: string[]) => {
    if (coupleIds.length === 0) return {};
    
    const stats: Record<string, { guests: number; rsvps: number; wishes: number }> = {};
    for (const id of coupleIds) {
      stats[id] = { guests: 0, rsvps: 0, wishes: 0 };
    }

    // Batch fetch all guests for the requested couple IDs
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('user_id, attendance_status')
      .in('user_id', coupleIds);

    if (!guestsError && guests) {
      for (const g of guests) {
        if (stats[g.user_id]) {
          stats[g.user_id].guests += 1;
          if (g.attendance_status === 'attending') {
            stats[g.user_id].rsvps += 1;
          }
        }
      }
    }

    // Batch fetch all wishes for the requested couple IDs
    const { data: wishes, error: wishesError } = await supabase
      .from('wishes')
      .select('user_id')
      .in('user_id', coupleIds);

    if (!wishesError && wishes) {
      for (const w of wishes) {
        if (stats[w.user_id]) {
          stats[w.user_id].wishes += 1;
        }
      }
    }
    
    return stats;
  };

  const fetchCoupleDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const [{ data: gList }, { data: wList }] = await Promise.all([
        supabase.from('guests').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('wishes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);
      setCoupleDetails({
        guestsList: gList || [],
        wishesList: wList || [],
      });
    } catch (err) {
      toast.error('Failed to load couple details');
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthorized(false); return; }
      const { data: prof, error } = await supabase.from('profiles').select('is_super_admin').eq('user_id', user.id).maybeSingle();
      if (error) {
        setDenied({ email: user.email ?? 'unknown', reason: error.message });
        setAuthorized(false);
        return;
      }
      if (!prof || !prof.is_super_admin) {
        setDenied({
          email: user.email ?? 'unknown',
          reason: 'Your account is not marked as super admin.',
        });
        setAuthorized(false);
        return;
      }
      setAuthorized(true);

      const [{ data: cps }, { count: gc }, { count: wc }, { count: rc }] = await Promise.all([
        supabase.from('profiles').select('user_id, slug, display_name, email, created_at, theme').order('created_at', { ascending: false }),
        supabase.from('guests').select('*', { count: 'exact', head: true }),
        supabase.from('wishes').select('*', { count: 'exact', head: true }),
        supabase.from('guests').select('*', { count: 'exact', head: true }).eq('attendance_status', 'attending'),
      ]);
      
      const couplesData = (cps as Couple[]) || [];
      setCouples(couplesData);
      setStats({ guests: gc || 0, wishes: wc || 0, rsvps: rc || 0, totalCouples: couplesData.length });

      // Fetch per-couple stats
      const coupleStats = await fetchCoupleStats(couplesData.map(c => c.user_id));
      setCouples(prev => prev.map(c => ({
        ...c,
        guestCount: coupleStats[c.user_id]?.guests || 0,
        rsvpCount: coupleStats[c.user_id]?.rsvps || 0,
        wishCount: coupleStats[c.user_id]?.wishes || 0,
      })));
    })();
  }, []);

  // Fetch details whenever selected couple changes
  useEffect(() => {
    if (selectedCouple) {
      fetchCoupleDetails(selectedCouple.user_id);
    } else {
      setCoupleDetails(null);
    }
  }, [selectedCouple]);

  const handleDeleteCouple = async (userId: string, displayName: string) => {
    if (!confirm(`Delete all data for "${displayName}"? This cannot be undone.`)) return;
    
    try {
      // Delete related data
      await Promise.all([
        supabase.from('guests').delete().eq('user_id', userId),
        supabase.from('wishes').delete().eq('user_id', userId),
        supabase.from('photos').delete().eq('user_id', userId),
        supabase.from('settings').delete().eq('user_id', userId),
        supabase.from('program_schedule').delete().eq('user_id', userId),
      ]);
      
      // Delete profile
      await supabase.from('profiles').delete().eq('user_id', userId);
      
      setCouples(prev => prev.filter(c => c.user_id !== userId));
      toast.success(`${displayName} deleted`);
      if (selectedCouple?.user_id === userId) {
        setSelectedCouple(null);
      }
    } catch (err) {
      toast.error('Failed to delete couple');
    }
  };

  const downloadCSV = () => {
    const header = 'Couple,Email,Slug,Guests,RSVPs,Wishes,Joined,Theme\n';
    const rows = filteredAndSorted.map(c => 
      `"${c.display_name}","${c.email}","${c.slug}",${c.guestCount},${c.rsvpCount},${c.wishCount},"${new Date(c.created_at).toLocaleDateString()}","${c.theme || 'N/A'}"`
    ).join('\n');
    
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `couples-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authorized === null) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" /></div>;
  if (!authorized) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-center p-6">
      <div className="max-w-lg">
        <h1 className="font-display text-3xl mb-2">🔒 Access Denied</h1>
        <p className="text-muted-foreground mb-4">Only super admins can view this page.</p>
        {denied && (
          <div className="text-left text-sm bg-muted/40 rounded-xl p-4 mb-4 space-y-2">
            <p><span className="text-muted-foreground">Signed in as:</span> {denied.email}</p>
            <p><span className="text-muted-foreground">Reason:</span> {denied.reason}</p>
            <p className="text-muted-foreground pt-2">
              In Supabase SQL Editor, run{' '}
              <code className="text-xs">supabase/scripts/PROMOTE-SUPER-ADMIN.sql</code>
              , then sign out and sign in again.
            </p>
          </div>
        )}
        <Link to="/admin" className="text-accent underline">← Back to dashboard</Link>
      </div>
    </div>
  );

  const rsvpPercentage = Math.round(stats.rsvps / Math.max(stats.guests, 1) * 100);

  return (
    <ThemeProvider initialTheme={getThemeForRole('super_admin')}>
    <VisualStyleProvider>
    <CinematicTransition>
      <div className="min-h-screen bg-background p-6">
        {/* Premium Header with Control Stickers */}
        <header className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <RoleBasedSticker 
              role="super-admin" 
              variant="primary" 
              size="lg" 
              animated={false}
            />
            <div>
              <DisplayHeading 
                level="h2"
                className="mb-0"
              >
                Super Admin Dashboard
              </DisplayHeading>
              <DashboardText variant="label" className="text-xs text-accent mt-1">
                🛡️ Manage invite profiles and system diagnostics
              </DashboardText>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/hub" className="text-sm border border-border rounded-full px-4 py-2 font-dashboard hover:bg-muted/50">
              Guest hub
            </Link>
            <Link to="/admin" className="text-sm bg-accent text-accent-foreground font-medium rounded-full px-5 py-2 hover:bg-accent/90 transition-all shadow-glow">
              ← My Dashboard
            </Link>
          </div>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setSearchParams(v === 'couples' ? {} : { tab: v })}
          className="max-w-6xl mx-auto mb-8"
        >
          <TabsList className="font-dashboard">
            <TabsTrigger value="couples">All couples</TabsTrigger>
            <TabsTrigger value="system">System diagnostics</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="mt-6 animate-cinematic-fade">
            <SuperAdminDashboard />
          </TabsContent>

          <TabsContent value="couples" className="mt-6 space-y-6">
        {/* Premium Stats Grid with Glow Effects */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-muted/20 border border-border/40 p-4 rounded-3xl shadow-surface">
            <ThemeAwareParticles effect="glow">
              <div className="stat p-4 text-center border-r border-border/30 last:border-0 md:block flex flex-col justify-center hover:bg-muted/10 rounded-lg transition-all">
                <div className="stat-title text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" /> Couples
                </div>
                <div className="stat-value text-3xl font-extrabold text-foreground">{stats.totalCouples}</div>
                <div className="stat-desc text-[10px] text-muted-foreground mt-0.5">Active web profiles</div>
              </div>
            </ThemeAwareParticles>

            <ThemeAwareParticles effect="glow">
              <div className="stat p-4 text-center border-r border-border/30 last:border-0 md:block flex flex-col justify-center hover:bg-muted/10 rounded-lg transition-all">
                <div className="stat-title text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" /> Guests
                </div>
                <div className="stat-value text-3xl font-extrabold text-foreground">{stats.guests}</div>
                <div className="stat-desc text-[10px] text-muted-foreground mt-0.5">Registered guests</div>
              </div>
            </ThemeAwareParticles>

            <ThemeAwareParticles effect="glow">
              <div className="stat p-4 text-center border-r border-border/30 last:border-0 md:block flex flex-col justify-center hover:bg-muted/10 rounded-lg transition-all">
                <div className="stat-title text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-accent" /> Confirmed
                </div>
                <div className="stat-value text-3xl font-extrabold text-accent">{stats.rsvps}</div>
                <div className="stat-desc text-[10px] text-accent/80 mt-0.5">Attending list</div>
              </div>
            </ThemeAwareParticles>

            <ThemeAwareParticles effect="glow">
              <div className="stat p-4 text-center border-r border-border/30 last:border-0 md:block flex flex-col justify-center hover:bg-muted/10 rounded-lg transition-all">
                <div className="stat-title text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Wishes
                </div>
                <div className="stat-value text-3xl font-extrabold text-foreground">{stats.wishes}</div>
                <div className="stat-desc text-[10px] text-muted-foreground mt-0.5">Messages received</div>
              </div>
            </ThemeAwareParticles>

            <ThemeAwareParticles effect="glow">
              <div className="stat p-4 text-center col-span-2 md:col-span-1 md:block flex flex-col justify-center hover:bg-muted/10 rounded-lg transition-all">
                <div className="stat-title text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-500" /> RSVP Rate
                </div>
                <div className="stat-value text-3xl font-extrabold text-foreground">{rsvpPercentage}%</div>
                <div className="stat-desc text-[10px] text-muted-foreground mt-0.5">Attendance engagement</div>
              </div>
            </ThemeAwareParticles>
          </div>
        </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, email, or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-h-[42px] rounded-2xl border border-border bg-background px-4 text-foreground focus:ring-2 focus:ring-ring text-sm"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="min-h-[42px] rounded-2xl border border-border bg-background px-4 text-foreground focus:ring-2 focus:ring-ring text-sm"
        >
          <option value="recent">Sort by: Recent</option>
          <option value="name">Sort by: Name (A-Z)</option>
          <option value="guests">Sort by: Guests count</option>
          <option value="rsvps">Sort by: RSVPs count</option>
        </select>
        <button
          onClick={downloadCSV}
          className="min-h-[42px] rounded-2xl bg-muted border border-border hover:bg-muted/70 text-foreground px-6 font-semibold text-sm transition-all flex items-center justify-center gap-2"
        >
          📊 Export Report CSV
        </button>
      </div>

      {/* Couples Table */}
      <div className="max-w-6xl mx-auto glass-card rounded-3xl overflow-hidden shadow-luxury border border-border/40">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border/30">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Couple Name</th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Email Address</th>
                <th className="text-center px-4 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">👥 Guests</th>
                <th className="text-center px-4 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">✓ RSVPs</th>
                <th className="text-center px-4 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">💌 Wishes</th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Active Theme</th>
                <th className="text-center px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredAndSorted.map(c => (
                <tr 
                  key={c.user_id} 
                  className="hover:bg-muted/15 transition-colors cursor-pointer group"
                  onClick={() => setSelectedCouple(c)}
                >
                  <td className="px-6 py-4 font-medium text-foreground group-hover:text-primary transition-colors">{c.display_name || '—'}</td>
                  <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{c.email}</td>
                  <td className="px-4 py-4 text-center font-bold text-base">{c.guestCount || 0}</td>
                  <td className="px-4 py-4 text-center font-bold text-base text-accent">{c.rsvpCount || 0}</td>
                  <td className="px-4 py-4 text-center text-xs text-muted-foreground">{c.wishCount || 0}</td>
                  <td className="px-6 py-4 text-xs font-medium">
                    <span className="bg-primary/10 text-primary-foreground text-[11px] px-2.5 py-1 rounded-full font-semibold">
                      {c.theme || 'classic'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-1.5 flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedCouple(c)}
                      title="Quick details drawer"
                      className="p-2 rounded-xl bg-muted/40 hover:bg-muted text-foreground transition-all"
                    >
                      👁️
                    </button>
                    <a
                      href={`/admin?couple=${c.user_id}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Manage Couple Dashboard"
                      className="p-2 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all"
                    >
                      <Settings className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteCouple(c.user_id, c.display_name || c.email)}
                      title="Delete profile"
                      className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="max-w-6xl mx-auto text-center py-16 bg-muted/5 border border-dashed border-border rounded-3xl mt-4">
          <Users className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
          <p className="text-muted-foreground font-medium">No couples found matching your search query.</p>
        </div>
      )}

      {/* Slide-out interactive FlyonUI Drawer for detailed analytics */}
      {selectedCouple && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedCouple(null)}
          />
          {/* Drawer content body */}
          <div className="relative w-full max-w-lg bg-background border-l border-border h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">{selectedCouple.display_name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">slug: {selectedCouple.slug}</p>
              </div>
              <button 
                onClick={() => setSelectedCouple(null)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile info block */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Wedding Settings Info</h4>
                <div className="bg-muted/25 rounded-2xl p-4 space-y-2 text-sm border border-border/30">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Admin Email</span> 
                    <span className="font-semibold font-mono text-xs text-foreground">{selectedCouple.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Registered On</span> 
                    <span className="font-semibold text-xs text-foreground">{new Date(selectedCouple.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Visual Theme</span> 
                    <span className="font-bold text-[10px] uppercase bg-primary/20 text-primary-foreground px-2 py-0.5 rounded-full">{selectedCouple.theme || 'classic'}</span>
                  </div>
                </div>
              </div>

              {/* Individual quick stats inside drawer */}
              <div className="grid grid-cols-3 gap-2 bg-muted/10 border border-border/40 p-3 rounded-2xl">
                <div className="text-center p-2">
                  <div className="text-2xl font-black text-foreground">{selectedCouple.guestCount || 0}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">Guests</div>
                </div>
                <div className="text-center p-2 border-x border-border/20">
                  <div className="text-2xl font-black text-accent">{selectedCouple.rsvpCount || 0}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">Confirmed</div>
                </div>
                <div className="text-center p-2">
                  <div className="text-2xl font-black text-foreground">{selectedCouple.wishCount || 0}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">Wishes</div>
                </div>
              </div>

              {/* Lists of detailed RSVPs and messages */}
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-7 w-7 border-2 border-primary border-t-transparent"></div>
                  <span className="text-xs text-muted-foreground font-medium">Fetching real-time updates…</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* RSVPs section */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      👥 Live Guest RSVPs ({coupleDetails?.guestsList.length || 0})
                    </h4>
                    {coupleDetails?.guestsList.length === 0 ? (
                      <div className="bg-muted/10 text-center py-6 rounded-2xl border border-dashed border-border/30">
                        <p className="text-xs text-muted-foreground italic">No guest records loaded yet.</p>
                      </div>
                    ) : (
                      <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1 border border-border/30 rounded-2xl p-3 bg-muted/5">
                        {coupleDetails?.guestsList.map((g: any) => (
                          <div key={g.id} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-muted/20 border border-border/20">
                            <span className="font-semibold text-foreground">{g.guest_name}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              g.attendance_status === 'attending' 
                                ? 'bg-accent/20 text-accent' 
                                : g.attendance_status === 'declined' 
                                  ? 'bg-destructive/20 text-destructive' 
                                  : 'bg-muted/50 text-muted-foreground'
                            }`}>
                              {g.attendance_status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Wishes messages section */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      💌 Latest Guest Wishes ({coupleDetails?.wishesList.length || 0})
                    </h4>
                    {coupleDetails?.wishesList.length === 0 ? (
                      <div className="bg-muted/10 text-center py-6 rounded-2xl border border-dashed border-border/30">
                        <p className="text-xs text-muted-foreground italic">No wishes received yet.</p>
                      </div>
                    ) : (
                      <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 border border-border/30 rounded-2xl p-3 bg-muted/5">
                        {coupleDetails?.wishesList.map((w: any) => (
                          <div key={w.id} className="p-3 rounded-xl bg-muted/20 border border-border/20 text-xs space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                              <span className="font-bold text-foreground">{w.guest_name}</span>
                              <span className="font-mono">{new Date(w.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="italic text-foreground/80 leading-relaxed font-sans">"{w.wish_message}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-5 border-t border-border flex gap-3 bg-muted/10">
              <a
                href={`/invite/${selectedCouple.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-h-[40px] rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all shadow-glow text-center flex items-center justify-center"
              >
                👁️ View Invitation
              </a>
              <a
                href={`/admin?couple=${selectedCouple.user_id}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-h-[40px] rounded-xl bg-accent text-accent-foreground hover:bg-accent/95 text-xs font-bold transition-all text-center flex items-center justify-center shadow-glow"
              >
                ⚙️ Admin Panel
              </a>
            </div>
          </div>
        </div>
      )}
          </TabsContent>
        </Tabs>
      </div>
    </CinematicTransition>
    </VisualStyleProvider>
    </ThemeProvider>
  );
}

export default function SuperAdminPage() { return <AuthGuard><Inner /></AuthGuard>; }
