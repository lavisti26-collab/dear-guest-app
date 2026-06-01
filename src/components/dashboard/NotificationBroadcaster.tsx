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

  const send = () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message required');
      return;
    }
    toast.success(`Broadcast queued for ${recipientCount || 'all'} recipients`);
    setTitle('');
    setMessage('');
    setOpen(false);
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
          />
          <Textarea
            placeholder="Message body..."
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <GlowButton type="button" onClick={send} className="w-full">
            Send broadcast
          </GlowButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
