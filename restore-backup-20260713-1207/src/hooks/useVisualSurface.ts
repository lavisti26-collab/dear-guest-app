import { useVisualStyleOptional } from '@/contexts/VisualStyleContext';
import { cn } from '@/lib/utils';

/** Composable surface classes that morph with data-visual-style on <html> */
export function useVisualSurface() {
  const vs = useVisualStyleOptional()?.visualStyle ?? 'classic';

  return {
    visualStyle: vs,
    root: cn('vs-root', vs !== 'classic' && 'vs-root-active'),
    surface: cn('vs-surface'),
    card: cn('vs-surface vs-card'),
    stat: cn('vs-surface vs-stat'),
    heading: cn('vs-heading font-display-premium'),
    subheading: cn('vs-subheading font-dashboard'),
    divider: cn('vs-divider'),
    metricGlow: cn(''),
    tableWrap: cn('vs-surface vs-table-wrap overflow-hidden'),
    buttonPrimary: cn('vs-btn-primary'),
    sidebar: cn('vs-sidebar'),
  };
}
