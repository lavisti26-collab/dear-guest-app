import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import DashboardText from '@/components/typography/DashboardText';
import GlowButton from '@/components/effects/GlowButton';
import EmojiSticker from '@/components/stickers/EmojiSticker';
import { useLanguage } from '@/contexts/LanguageContext';
import { submitAccessRequest } from '@/lib/access-requests';
import { toast } from 'sonner';

interface AccessRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AccessRequestModal({ open, onOpenChange }: AccessRequestModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState('admin');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !reason.trim()) {
      toast.error(t('hub.form_required'));
      return;
    }

    setSubmitting(true);
    const { ok, error } = await submitAccessRequest({
      full_name: name.trim(),
      email: email.trim(),
      requested_level: level,
      reason: reason.trim(),
    });
    setSubmitting(false);

    if (!ok) {
      toast.error(error || 'Failed to submit');
      return;
    }

    toast.success(t('hub.access_submitted'));
    setName('');
    setEmail('');
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md modal-box">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <EmojiSticker emoji="icon-fluent-emoji-flat:sparkles" size="sm" animated />
            <div>
              <DialogTitle className="font-display-premium text-xl">
                {t('hub.request_access')}
              </DialogTitle>
              <DialogDescription className="font-dashboard">
                {t('hub.access_review')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 font-dashboard">
          <div>
            <DashboardText variant="label">Name / ឈ្មោះ</DashboardText>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <DashboardText variant="label">Email</DashboardText>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <DashboardText variant="label">Level</DashboardText>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <DashboardText variant="label">Reason / មូលហេតុ</DashboardText>
            <Textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="font-body-khmer"
            />
          </div>
          <GlowButton
            type="button"
            onClick={submit}
            disabled={submitting}
            className="w-full"
            glowIntensity="intense"
          >
            {submitting ? '…' : t('hub.request_access')}
          </GlowButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
