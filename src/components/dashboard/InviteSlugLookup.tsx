import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DashboardText from '@/components/typography/DashboardText';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchPublicProfileBySlug } from '@/lib/public-invite';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function InviteSlugLookup() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);

  const openInvite = async () => {
    const cleaned = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!cleaned) {
      toast.error(t('hub.slug_required'));
      return;
    }

    setLoading(true);
    const { profile, error } = await fetchPublicProfileBySlug(cleaned);
    setLoading(false);

    if (profile) {
      navigate(`/invite/${cleaned}`);
      return;
    }
    toast.error(error || t('hub.slug_not_found'));
  };

  return (
    <div className="luxury-card rounded-2xl p-6 space-y-4">
      <DashboardText variant="title">{t('hub.find_invite')}</DashboardText>
      <DashboardText variant="body" className="text-muted-foreground">
        {t('hub.find_invite_desc')}
      </DashboardText>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={t('hub.slug_placeholder')}
          className="font-dashboard"
          onKeyDown={(e) => e.key === 'Enter' && openInvite()}
        />
        <Button onClick={openInvite} disabled={loading} className="font-dashboard shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('hub.open_invite')}
        </Button>
      </div>
    </div>
  );
}
