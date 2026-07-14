import { useState } from 'react';
import { Button } from '@/components/ui/button';
import DashboardText from '@/components/typography/DashboardText';
import LuxuryBody from '@/components/typography/LuxuryBody';
import EmojiSticker from '@/components/stickers/EmojiSticker';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    title: 'Welcome',
    desc: 'Discover your guest portal and wedding hub features.',
    icon: 'icon-fluent-emoji-flat:waving-hand',
  },
  {
    title: 'RSVP & wishes',
    desc: 'Confirm attendance and send heartfelt messages.',
    icon: 'icon-fluent-emoji-flat:love-letter',
  },
  {
    title: 'Explore',
    desc: 'Gallery, music, map, and program timeline.',
    icon: 'icon-fluent-emoji-flat:sparkles',
  },
  {
    title: 'Stay connected',
    desc: 'Request elevated access if you are part of the planning team.',
    icon: 'icon-fluent-emoji-flat:locked',
  },
];

export default function OnboardingSteps() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const done = step >= STEPS.length - 1;

  return (
    <div className="luxury-card rounded-2xl p-6 space-y-6">
      <ul className="steps steps-vertical sm:steps-horizontal w-full flyon-steps">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className={cn('step font-dashboard text-xs', i <= step && 'step-primary')}
            data-content={i + 1}
          >
            {s.title}
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row items-center gap-6 animate-cinematic-fade">
        <EmojiSticker emoji={current.icon} size="lg" animated />
        <div className="flex-1 text-center sm:text-left">
          <DashboardText variant="title" className="text-xl font-display-premium">
            {current.title}
          </DashboardText>
          <LuxuryBody className="mt-2 text-muted-foreground">{current.desc}</LuxuryBody>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="font-dashboard"
        >
          Back
        </Button>
        <Button
          onClick={() => (done ? setStep(0) : setStep((s) => s + 1))}
          className="font-dashboard"
        >
          {done ? 'Restart tour' : 'Next step'}
        </Button>
      </div>
    </div>
  );
}
