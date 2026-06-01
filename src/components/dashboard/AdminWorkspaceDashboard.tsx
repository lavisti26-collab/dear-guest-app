import { useCallback, useEffect, useState } from 'react';
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
  email: string;
  status: string;
  guests: number;
};

export function AdminWorkspaceDashboard() {
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [requests, setRequests] = useState<AccessRequestRow[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(true);

  const loadGuests = useCallback(async () => {
    setLoadingGuests(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoadingGuests(false);
      return;
    }

    const { data } = await supabase
      .from('guests')
      .select('id, guest_name, attendance_status, total_guests, phone_number')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setGuests(
      (data || []).map((g) => ({
        id: g.id,
        name: g.guest_name,
        email: g.phone_number || '—',
        status: g.attendance_status === 'attending' ? 'confirmed' : g.attendance_status,
        guests: g.total_guests ?? 1,
      }))
    );
    setLoadingGuests(false);
  }, []);

  const loadRequests = useCallback(async () => {
    const { data } = await fetchAccessRequests('pending');
    setRequests(data);
  }, []);

  useEffect(() => {
    loadGuests();
    loadRequests();
  }, [loadGuests, loadRequests]);

  const columns: DataTableColumn<GuestRow>[] = [
    { key: 'name', header: 'Guest', render: (r) => r.name },
    { key: 'email', header: 'Contact', render: (r) => r.email },
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
    { title: 'Wishes', value: '—', icon: '💝' },
  ];

  const handleGuestBatch = async (rows: GuestRow[], status: 'attending' | 'pending' | 'not_attending') => {
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
          <DataTable
            data={guests}
            columns={columns}
            searchKeys={['name', 'email', 'status']}
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
