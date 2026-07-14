import React, { useState } from 'react';
import { useTheme } from '@/theme/ThemeEngine';
import { toast } from 'sonner';

/**
 * Emergency fallback button that clears any stale localStorage theme value
 * and resets the app to the default warm "Elegant Gold" theme.
 *
 * Place this inside any component that is wrapped by ThemeProvider.
 *
 * @example
 * <ResetThemeButton />
 * <ResetThemeButton label="Restore Default Theme" showIcon={false} />
 */
export default function ResetThemeButton({
  label = 'Reset to Default Theme',
  showIcon = true,
  className,
}: {
  label?: string;
  showIcon?: boolean;
  className?: string;
}) {
  const { resetToDefault } = useTheme();
  const [done, setDone] = useState(false);

  const handleReset = () => {
    resetToDefault();
    setDone(true);
    toast.success('✨ Theme reset to default (Elegant Gold)');
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      className={
        className ??
        'flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-accent/50 hover:bg-accent/10 hover:text-accent-foreground active:scale-95'
      }
    >
      {showIcon && (
        <span className={done ? 'animate-spin' : ''} aria-hidden>
          {done ? '✓' : '↺'}
        </span>
      )}
      {done ? 'Reset!' : label}
    </button>
  );
}
