import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardText from '@/components/typography/DashboardText';
import EmojiSticker from '@/components/stickers/EmojiSticker';
import {
  fetchAccessRequests,
  updateAccessRequestStatus,
  type AccessRequestRow,
} from '@/lib/access-requests';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { useVisualSurface } from '@/hooks/useVisualSurface';
import { cn } from '@/lib/utils';

export default function AccessRequestsPanel() {
  const { card } = useVisualSurface();
  const [pending, setPending] = useState<AccessRequestRow[]>([]);
  const [history, setHistory] = useState<AccessRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [pRes, allRes] = await Promise.all([
      fetchAccessRequests('pending'),
      fetchAccessRequests(),
    ]);
    if (pRes.error || allRes.error) {
      setError(pRes.error || allRes.error || 'Could not load requests');
    }
    setPending(pRes.data);
    setHistory((allRes.data || []).filter((r) => r.status !== 'pending'));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id: string, status: 'approved' | 'declined') => {
    const { ok, error: err, email, profileFound } = await updateAccessRequestStatus(id, status);
    if (!ok) {
      toast.error(err || 'Update failed — check you are signed in');
      return;
    }
    if (status === 'approved') {
      if (profileFound) {
        toast.success(
          `${email} approved — they can sign in at /admin with their password.`,
          { duration: 6000 }
        );
      } else {
        toast.success(
          `${email} approved — tell them to go to /admin → Create Account with this same email, then sign in.`,
          { duration: 8000 }
        );
      }
    } else {
      toast.success('Request declined');
    }
    load();
  };

  const RequestCard = ({ req, showActions }: { req: AccessRequestRow; showActions: boolean }) => (
    <Card key={req.id} className={cn(card)}>
      <CardHeader className="pb-2">
        <CardTitle className="font-dashboard text-base flex flex-wrap justify-between gap-2">
          <span>{req.full_name}</span>
          <div className="flex gap-2">
            <Badge variant="outline">{req.requested_level}</Badge>
            {!showActions && (
              <Badge className={req.status === 'approved' ? 'badge-success' : 'badge-error'}>
                {req.status}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="font-dashboard text-sm space-y-2">
        <p className="text-muted-foreground">{req.email}</p>
        <p className="font-body-khmer text-foreground/90">{req.reason}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
        </p>
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => review(req.id, 'approved')}>
              Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => review(req.id, 'declined')}>
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <EmojiSticker emoji="icon-fluent-emoji-flat:love-letter" size="md" />
          <div>
            <DashboardText variant="title">Access requests</DashboardText>
            <DashboardText variant="subtitle" className="text-muted-foreground">
              From Guest hub · approving also unlocks login if they already registered at /admin
            </DashboardText>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="font-dashboard gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-dashboard text-destructive">
          {error}
          <p className="mt-2 text-xs text-muted-foreground">
            Run <code className="text-foreground">supabase/scripts/ADD-ACCESS-REQUESTS.sql</code> and sign in again.
          </p>
        </div>
      )}

      <Tabs defaultValue="pending">
        <TabsList className="font-dashboard">
          <TabsTrigger value="pending">
            Pending
            {pending.length > 0 && (
              <Badge className="ml-2 badge-primary">{pending.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Reviewed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {loading ? (
            <p className="text-muted-foreground font-dashboard text-sm">Loading…</p>
          ) : pending.length === 0 ? (
            <Card className="luxury-card">
              <CardContent className="py-10 text-center text-muted-foreground font-dashboard">
                No pending requests
              </CardContent>
            </Card>
          ) : (
            pending.map((req) => <RequestCard key={req.id} req={req} showActions />)
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {history.length === 0 ? (
            <p className="text-muted-foreground font-dashboard text-sm">No reviewed requests yet</p>
          ) : (
            history.map((req) => <RequestCard key={req.id} req={req} showActions={false} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
