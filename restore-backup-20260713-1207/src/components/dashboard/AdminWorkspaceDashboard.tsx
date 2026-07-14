import { useCallback, useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import MetricGrid from './MetricGrid';
import DataTable, { type DataTableColumn } from './DataTable';
import NotificationBroadcaster from './NotificationBroadcaster';
import EmojiSticker from '@/components/stickers/EmojiSticker';
import DashboardText from '@/components/typography/DashboardText';
import {
  fetchAccessRequests,
  updateAccessRequestStatus,
  type AccessRequestRow,
} from '@/lib/access-requests';
import { toast } from 'sonner';

type GuestRow = {
  id: string;
  name: string;
  contact: string;
  status: string;
  guests: number;
};

function guestFromPayload(payload: Record<string, unknown>): GuestRow {
  return {
    id: String(payload.id),
    name: String(payload.guest_name ?? ''),
    contact: String(payload.phone_number || '—'),
    status: payload.attendance_status === 'attending' ? 'confirmed' : String(payload.attendance_status ?? 'pending'),
    guests: Number(payload.total_guests ?? 1),
  };
}

export function AdminWorkspaceDashboard() {
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [requests, setRequests] = useState<AccessRequestRow[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // F3: real wishes count from Supabase (null = still loading)
  const [wishesCount, setWishesCount] = useState<number | null>(null);
  const userIdRef = useRef<string | null>(null);
  const optimisticGuestsRef = useRef<Set<string>>(new Set());

  const loadGuests = useCallback(async () => {
    setLoadError(null);
    if (!supabase) {
      setLoadingGuests(false);
      return;
    }
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) {
        setLoadingGuests(false);
        return;
      }
      userIdRef.current = user.id;

      const { data, error: dbErr } = await supabase
        .from('guests')
        .select('id, guest_name, attendance_status, total_guests, phone_number')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dbErr) throw dbErr;

      setGuests(
        (data || []).map((g) => guestFromPayload(g as unknown as Record<string, unknown>))
      );

      // F3: Fetch real wishes count so the metric shows actual data
      const { count: wCount, error: wishesErr } = await supabase
        .from('wishes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (wishesErr) console.warn('Could not fetch wishes count:', wishesErr.message);
      setWishesCount(wCount ?? 0);
    } catch (err: any) {
      console.error('loadGuests error:', err);
      setLoadError(err.message || 'Failed to load guest list');
    } finally {
      setLoadingGuests(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    const { data } = await fetchAccessRequests('pending');
    setRequests(data);
  }, []);

  // Initial load
  useEffect(() => {
    loadGuests();
    loadRequests();
  }, [loadGuests, loadRequests]);

  // Realtime subscriptions for guests table
  useEffect(() => {
    if (!userIdRef.current || !supabase) return;
    const uid = userIdRef.current;

    const channel = supabase
      .channel(`admin-guests-${uid}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'guests',
        filter: `user_id=eq.${uid}`,
      }, (payload) => {
        // Skip if this was our own optimistic insert (already added)
        const newId = String(payload.new.id);
        if (optimisticGuestsRef.current.has(newId)) {
          optimisticGuestsRef.current.delete(newId);
          return;
        }
        setGuests(prev => {
          if (prev.find(g => g.id === newId)) return prev;
          return [guestFromPayload(payload.new as Record<string, unknown>), ...prev];
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'guests',
        filter: `user_id=eq.${uid}`,
      }, (payload) => {
        setGuests(prev => prev.map(g =>
          g.id === payload.new.id
            ? guestFromPayload(payload.new as Record<string, unknown>)
            : g
        ));
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'guests',
        filter: `user_id=eq.${uid}`,
      }, (payload) => {
        setGuests(prev => prev.filter(g => g.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // B1: renamed "Contact" → "Phone / Contact" to reflect the underlying phone_number field
  const columns: DataTableColumn<GuestRow>[] = [
    { key: 'name', header: 'Guest', render: (r) => r.name },
    { key: 'contact', header: 'Phone / Contact', render: (r) => r.contact },
    {
      key: 'status',
      header: 'RSVP',
      render: (r) => (
        <Badge
          className={
            r.status === 'confirmed' || r.status === 'attending'
              ? 'badge-success'
              : r.status === 'pending'
                ? 'badge-warning'
                : 'badge-ghost'
          }
        >
          {r.status}
        </Badge>
      ),
    },
    { key: 'guests', header: 'Party', render: (r) => r.guests },
  ];

  const confirmed = guests.filter(
    (g) => g.status === 'confirmed' || g.status === 'attending'
  ).length;

  const metrics = [
    { title: 'Total guests', value: loadingGuests ? '…' : guests.length, icon: '👥' },
    { title: 'Confirmed', value: loadingGuests ? '…' : confirmed, icon: '✓' },
    { title: 'Pending access', value: requests.length, icon: '📋' },
    // F3: real count from Supabase — shows '…' while loading
    { title: 'Wishes', value: wishesCount === null ? '…' : wishesCount, icon: '💝' },
  ];

  const handleGuestBatch = async (rows: GuestRow[], status: 'attending' | 'pending' | 'not_attending') => {
    if (!supabase) {
      toast.error('Supabase client is not configured.');
      return;
    }
    const ids = rows.map((r) => r.id);
    const { error } = await supabase
      .from('guests')
      .update({ attendance_status: status })
      .in('id', ids);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Guests updated');
    loadGuests();
  };

  const reviewRequest = async (id: string, status: 'approved' | 'declined') => {
    const { ok, error } = await updateAccessRequestStatus(id, status);
    if (!ok) {
      toast.error(error || 'Update failed');
      return;
    }
    toast.success(status === 'approved' ? 'Approved' : 'Declined');
    loadRequests();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <EmojiSticker emoji="icon-fluent-emoji-flat:briefcase" size="lg" animated />
          <div>
            <DashboardText variant="title">Admin operations</DashboardText>
            <DashboardText variant="subtitle" className="text-muted-foreground">
              Live guests from Supabase · access approvals
            </DashboardText>
          </div>
        </div>
        <NotificationBroadcaster recipientCount={guests.length} />
      </div>

      <MetricGrid metrics={metrics} flyonStats />

      <Tabs defaultValue="guests" className="w-full">
        <TabsList className="font-dashboard">
          <TabsTrigger value="guests">Guests</TabsTrigger>
          <TabsTrigger value="access">
            Access requests
            {requests.length > 0 && (
              <Badge className="ml-2 badge-primary">{requests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guests" className="mt-6 animate-cinematic-fade">
          {loadError ? (
            <Card className="luxury-card border-destructive/20 bg-destructive/5">
              <CardContent className="py-8 text-center space-y-4">
                <p className="text-sm text-destructive font-dashboard font-semibold">⚠️ {loadError}</p>
                <Button size="sm" onClick={loadGuests} className="gap-2">
                  🔄 Retry Loading
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              data={guests}
              columns={columns}
              searchKeys={['name', 'contact', 'status']}
              emptyMessage={loadingGuests ? 'Loading…' : 'No guests yet — add some in Wedding admin'}
              batchActions={[
                {
                  label: 'Confirm attending',
                  onAction: (rows) => handleGuestBatch(rows, 'attending'),
                },
                {
                  label: 'Set pending',
                  onAction: (rows) => handleGuestBatch(rows, 'pending'),
                },
              ]}
            />
          )}
        </TabsContent>

        <TabsContent value="access" className="mt-6 space-y-3 animate-cinematic-fade">
          {requests.length === 0 ? (
            <Card className="luxury-card">
              <CardContent className="py-10 text-center text-muted-foreground font-dashboard">
                No pending requests
              </CardContent>
            </Card>
          ) : (
            requests.map((req) => (
              <Card key={req.id} className="luxury-card">
                <CardHeader className="pb-2">
                  <CardTitle className="font-dashboard text-base flex justify-between gap-2">
                    {req.full_name}
                    <Badge>{req.requested_level}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="font-dashboard text-sm space-y-2">
                  <p className="text-muted-foreground">{req.email}</p>
                  <p className="font-body-khmer">{req.reason}</p>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => reviewRequest(req.id, 'approved')}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reviewRequest(req.id, 'declined')}>
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const AdminDashboard = AdminWorkspaceDashboard;
