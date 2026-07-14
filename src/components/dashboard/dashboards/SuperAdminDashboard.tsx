import { useCallback, useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MetricGrid from '../MetricGrid';
import RadialHealthMetric from '../RadialHealthMetric';
import ActivityLogFeed, { type ActivityLogEntry } from '../ActivityLogFeed';
import RoleElevator from '../RoleElevator';
import PendingAccountsPanel from '../PendingAccountsPanel';
import AccessRequestsPanel from '../AccessRequestsPanel';
import EmojiSticker from '@/components/stickers/EmojiSticker';
import DashboardText from '@/components/typography/DashboardText';
import { useVisualSurface } from '@/hooks/useVisualSurface';
import { fetchAccessRequests } from '@/lib/access-requests';
import { fetchPendingAccounts } from '@/lib/account-approval';
import { supabase } from '@/integrations/supabase/client';

// No more mock data — the activity log now queries Supabase and shows an honest
// empty state when the `super_admin_activity_log` table hasn't been created yet.

export function SuperAdminDashboard() {
  const [pendingAccessCount, setPendingAccessCount] = useState(0);
  const [pendingAccountCount, setPendingAccountCount] = useState(0);
  const [platformStats, setPlatformStats] = useState({
    couples: 0,
    guests: 0,
    wishes: 0,
    rsvps: 0,
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [activityLogsError, setActivityLogsError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!supabase) return;
    const [{ count: couples }, { count: guests }, { count: wishes }, { count: rsvps }] =
      await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('guests').select('*', { count: 'exact', head: true }),
        supabase.from('wishes').select('*', { count: 'exact', head: true }),
        supabase
          .from('guests')
          .select('*', { count: 'exact', head: true })
          .eq('attendance_status', 'attending'),
      ]);

    setPlatformStats({
      couples: couples ?? 0,
      guests: guests ?? 0,
      wishes: wishes ?? 0,
      rsvps: rsvps ?? 0,
    });

    const [{ data: accessPending }, { data: accountPending }] = await Promise.all([
      fetchAccessRequests('pending'),
      fetchPendingAccounts(),
    ]);
    setPendingAccessCount(accessPending.length);
    setPendingAccountCount(accountPending.length);
  }, []);

  const loadActivityLogs = useCallback(async () => {
    if (!supabase) {
      setActivityLogsError('Supabase client is not configured.');
      return;
    }
    // Query the real activity log table. If it doesn't exist (42P01) we show
    // a clear setup hint rather than fake hardcoded data.
    const { data, error } = await (supabase as any)
      .from('super_admin_activity_log')
      .select('id, action, actor, created_at, severity')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      if (error.code === '42P01') {
        setActivityLogsError(
          'Activity log table not found. Run the migration to create "super_admin_activity_log".'
        );
      } else {
        setActivityLogsError(`Failed to load activity log: ${error.message}`);
      }
      setActivityLogs([]);
      return;
    }

    setActivityLogsError(null);
    setActivityLogs(
      (data ?? []).map((row: any) => ({
        id: row.id,
        action: row.action ?? '—',
        user: row.actor ?? 'System',
        timestamp: new Date(row.created_at),
        severity: (['low', 'medium', 'high'] as const).includes(row.severity)
          ? row.severity
          : 'low',
      }))
    );
  }, []);

  useEffect(() => {
    loadStats();
    loadActivityLogs();
    const interval = setInterval(() => {
      loadStats();
      loadActivityLogs();
    }, 30_000);
    return () => clearInterval(interval);
  }, [loadStats, loadActivityLogs]);

  const metrics = useMemo(
    () => [
      { title: 'Couples', value: platformStats.couples, icon: '👑', change: { value: 0, isPositive: true } },
      { title: 'Guests', value: platformStats.guests, icon: '👥', change: { value: 0, isPositive: true } },
      { title: 'RSVPs attending', value: platformStats.rsvps, icon: '✓', change: { value: 0, isPositive: true } },
      { title: 'Pending signups', value: pendingAccountCount, icon: '🆕', change: { value: 0, isPositive: false } },
      { title: 'Access requests', value: pendingAccessCount, icon: '📋', change: { value: 0, isPositive: false } },
    ],
    [platformStats, pendingAccessCount, pendingAccountCount]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start gap-4 justify-between">
        <div className="flex items-center gap-3">
          <EmojiSticker emoji="icon-fluent-emoji-flat:crown" size="lg" animated />
          <div>
            <DashboardText variant="title">Super Admin control center</DashboardText>
            <DashboardText variant="subtitle" className="text-muted-foreground">
              Live Supabase stats · approve access · portal preview
            </DashboardText>
          </div>
        </div>
        <div className="flex gap-2">
          <EmojiSticker emoji="icon-fluent-emoji-flat:locked" size="sm" label="Security" />
          <EmojiSticker emoji="icon-fluent-emoji-flat:desktop-computer" size="sm" label="System" />
          <EmojiSticker emoji="icon-fluent-emoji-flat:high-voltage" size="sm" label="Metrics" />
        </div>
      </div>

      <MetricGrid metrics={metrics} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RadialHealthMetric label="CPU" value={42} icon="🖥️" status="healthy" />
        <RadialHealthMetric label="Memory" value={68} icon="💾" status="warning" />
        <RadialHealthMetric label="Database" value={91} icon="🗄️" status="healthy" />
        <RadialHealthMetric label="CDN edge" value={88} icon="⚡" status="healthy" />
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="font-dashboard flex-wrap h-auto gap-1">
          <TabsTrigger value="accounts">
            New accounts
            {pendingAccountCount > 0 && (
              <Badge className="ml-2 badge-warning">{pendingAccountCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="access">
            Access requests
            {pendingAccessCount > 0 && (
              <Badge className="ml-2 badge-primary">{pendingAccessCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity log</TabsTrigger>
          <TabsTrigger value="elevator">Role elevator</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-6 animate-cinematic-fade">
          <PendingAccountsPanel />
        </TabsContent>

        <TabsContent value="access" className="mt-6 animate-cinematic-fade">
          <AccessRequestsPanel />
        </TabsContent>

        <TabsContent value="activity" className="mt-6 animate-cinematic-fade">
          {activityLogsError ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
              <p className="text-2xl">📋</p>
              <p className="font-dashboard text-sm text-muted-foreground">{activityLogsError}</p>
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-2xl mb-2">🕐</p>
              <p className="font-dashboard text-sm text-muted-foreground">No activity logged yet.</p>
            </div>
          ) : (
            <ActivityLogFeed logs={activityLogs} />
          )}
        </TabsContent>

        <TabsContent value="elevator" className="mt-6 animate-cinematic-fade">
          <RoleElevator standalone currentRole="super_admin" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
