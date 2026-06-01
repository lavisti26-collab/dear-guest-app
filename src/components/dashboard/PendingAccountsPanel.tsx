import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardText from '@/components/typography/DashboardText';
import EmojiSticker from '@/components/stickers/EmojiSticker';
import {
  fetchPendingAccounts,
  updateAccountStatus,
  type PendingAccountRow,
} from '@/lib/account-approval';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { useVisualSurface } from '@/hooks/useVisualSurface';
import { cn } from '@/lib/utils';

export default function PendingAccountsPanel() {
  const { card } = useVisualSurface();
  const [accounts, setAccounts] = useState<PendingAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await fetchPendingAccounts();
    if (err) setError(err);
    setAccounts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (userId: string, status: 'approved' | 'rejected', label: string) => {
    const { ok, error: err } = await updateAccountStatus(userId, status);
    if (!ok) {
      toast.error(err || 'Could not update account — check super-admin permissions');
      return;
    }
    toast.success(status === 'approved' ? `${label} can now sign in` : `${label} declined`);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <EmojiSticker emoji="icon-fluent-emoji-flat:bust-in-silhouette" size="sm" />
          <DashboardText variant="subtitle" className="text-muted-foreground">
            New signups waiting for platform approval
          </DashboardText>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive font-dashboard">{error}</p>
      )}

      {loading && accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground font-dashboard">Loading…</p>
      ) : accounts.length === 0 ? (
        <Card className={cn(card)}>
          <CardContent className="py-10 text-center text-muted-foreground font-dashboard text-sm">
            No pending signups — all clear ✓
          </CardContent>
        </Card>
      ) : (
        accounts.map((acc) => (
          <Card key={acc.user_id} className={cn(card)}>
            <CardHeader className="pb-2">
              <CardTitle className="font-dashboard text-base flex flex-wrap justify-between gap-2">
                <span>{acc.display_name || acc.email || 'New couple'}</span>
                <Badge className="badge-warning">Pending</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="font-dashboard text-sm space-y-2">
              <p className="text-muted-foreground">{acc.email}</p>
              <p className="text-xs text-muted-foreground">Slug: {acc.slug}</p>
              <p className="text-xs text-muted-foreground">
                Signed up {formatDistanceToNow(new Date(acc.created_at), { addSuffix: true })}
              </p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => review(acc.user_id, 'approved', acc.email || 'User')}>
                  Approve account
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => review(acc.user_id, 'rejected', acc.email || 'User')}
                >
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
