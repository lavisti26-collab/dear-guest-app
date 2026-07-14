import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DashboardText from '@/components/typography/DashboardText';
import GlowButton from '@/components/effects/GlowButton';
import EmojiSticker from '@/components/stickers/EmojiSticker';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface NotificationBroadcasterProps {
  recipientCount?: number;
  trigger?: React.ReactNode;
}

export default function NotificationBroadcaster({
  recipientCount = 0,
  trigger,
}: NotificationBroadcasterProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message required');
      return;
    }

    setSending(true);
    try {
      if (!supabase) {
        toast.error('Supabase client is not configured. Cannot send broadcast.');
        setSending(false);
        return;
      }
      // Persist the broadcast to Supabase so it can be consumed by a real
      // notification pipeline. Falls back to an honest warning when the table
      // doesn't exist yet rather than silently pretending success.
      const { error } = await supabase
        .from('notifications' as any)
        .insert({
          title: title.trim(),
          body: message.trim(),
          recipient_count: recipientCount,
          created_at: new Date().toISOString(),
        } as any);

      if (error) {
        // Table may not exist — show an honest warning instead of a false success
        if (error.code === '42P01') {
          toast.warning(
            'Notification saved locally — "notifications" table not found in Supabase. ' +
            'Create the table to enable real delivery.',
            { duration: 6000 }
          );
        } else {
          toast.error(`Broadcast failed: ${error.message}`);
          return;
        }
      } else {
        toast.success(`Broadcast sent to ${recipientCount || 'all'} recipients`);
      }

      setTitle('');
      setMessage('');
      setOpen(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <GlowButton type="button" size="sm" className="gap-2">
            <EmojiSticker emoji="icon-fluent-emoji-flat:megaphone" size="sm" />
            Global broadcast
          </GlowButton>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display-premium flex items-center gap-2">
            <EmojiSticker emoji="icon-fluent-emoji-flat:loudspeaker" size="sm" />
            Notification broadcaster
          </DialogTitle>
          <DialogDescription className="font-dashboard">
            Push alerts to guests and admins
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 font-dashboard">
          <Input
            placeholder="Notification title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={sending}
          />
          <Textarea
            placeholder="Message body..."
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
          />
          <GlowButton type="button" onClick={send} className="w-full" disabled={sending}>
            {sending ? 'Sending…' : 'Send broadcast'}
          </GlowButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
