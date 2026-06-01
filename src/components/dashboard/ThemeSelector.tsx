import { THEME_INFO, useTheme } from '@/contexts/ThemeContext';
import { CURATED_THEME_PICKER } from '@/lib/curated-themes';
import DashboardText from '@/components/typography/DashboardText';
import { cn } from '@/lib/utils';

export default function ThemeSelector({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  const displayThemes = CURATED_THEME_PICKER.includes(theme)
    ? CURATED_THEME_PICKER
    : [theme, ...CURATED_THEME_PICKER].slice(0, 7);

  return (
    <div className={cn('space-y-2', compact && 'space-y-1')}>
      <DashboardText variant="label" className="text-muted-foreground">
        Premium palette
      </DashboardText>
      <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'grid-cols-2')}>
        {displayThemes.map((t) => {
          const info = THEME_INFO[t];
          const active = theme === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={cn(
                'flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all duration-300',
                'hover:border-primary/50 hover:shadow-glow',
                active && 'border-primary neon-border-admin bg-primary/5'
              )}
            >
              <span className="text-xl">{info.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-dashboard text-xs font-semibold truncate">{info.label}</p>
                <div className="flex gap-0.5 mt-1">
                  {info.colors.slice(0, 4).map((c) => (
                    <span
                      key={c}
                      className="h-2 w-2 rounded-full ring-1 ring-border"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
