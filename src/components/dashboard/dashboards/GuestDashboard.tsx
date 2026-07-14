import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OnboardingSteps from './OnboardingSteps';
import AccessRequestModal from './AccessRequestModal';
import InviteSlugLookup from './InviteSlugLookup';
import GlowButton from '@/components/effects/GlowButton';
import EmojiSticker from '@/components/stickers/EmojiSticker';
import DisplayHeading from '@/components/typography/DisplayHeading';
import LuxuryBody from '@/components/typography/LuxuryBody';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVisualSurface } from '@/hooks/useVisualSurface';

export function GuestDashboard() {
  const { t } = useLanguage();
  const { card } = useVisualSurface();
  const [accessOpen, setAccessOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className={cn('relative overflow-hidden rounded-3xl p-8 md:p-10 animate-cinematic-fade', card)}>
        <div className="flex flex-wrap items-center gap-6">
          <EmojiSticker emoji="icon-fluent-emoji-flat:waving-hand" size="xl" animated />
          <div className="flex-1 min-w-[200px]">
            <DisplayHeading level="h2" className="!text-3xl md:!text-4xl" includeKhmer="សូមស្វាគមន៍">
              {t('hub.welcome')}
            </DisplayHeading>
            <LuxuryBody className="mt-3 text-muted-foreground max-w-xl">
              {t('hub.welcome_desc')}
            </LuxuryBody>
          </div>
          <GlowButton
            type="button"
            onClick={() => setAccessOpen(true)}
            className="shrink-0"
            glowIntensity="intense"
          >
            {t('hub.request_access')}
          </GlowButton>
        </div>
        <div className="flex gap-3 mt-6">
          <EmojiSticker emoji="icon-fluent-emoji-flat:sparkles" size="sm" />
          <EmojiSticker emoji="icon-fluent-emoji-flat:love-letter" size="sm" />
          <EmojiSticker emoji="icon-fluent-emoji-flat:waving-hand" size="sm" />
        </div>
      </div>

      <InviteSlugLookup />

      <OnboardingSteps />

      <Card className="luxury-card">
        <CardHeader>
          <CardTitle className="font-display-premium">Are you a Wedding Couple?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 font-dashboard">
          <p className="text-xs text-muted-foreground leading-relaxed">
            If you are a bride, groom, or wedding organizer, sign in to your dashboard to manage your guest list, theme, and invitation settings.
          </p>
          <Button asChild className="w-full">
            <Link to="/admin">{t('admin.enter') || 'Couple Dashboard Login'}</Link>
          </Button>
        </CardContent>
      </Card>

      <AccessRequestModal open={accessOpen} onOpenChange={setAccessOpen} />
    </div>
  );
}
