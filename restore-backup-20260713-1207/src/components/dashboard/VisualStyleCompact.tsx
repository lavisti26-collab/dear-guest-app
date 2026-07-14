import { useVisualStyle } from '@/contexts/VisualStyleContext';
import { VISUAL_STYLE_OPTIONS } from '@/lib/visual-styles';
import { cn } from '@/lib/utils';

/** Compact sidebar control — full picker lives in Admin → Theme tab */
export default function VisualStyleCompact() {
  const { visualStyle, setVisualStyle } = useVisualStyle();

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-dashboard uppercase tracking-widest text-muted-foreground">
        Layout style
      </p>
      <div className="flex flex-wrap gap-1">
        {VISUAL_STYLE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            title={opt.label}
            onClick={() => setVisualStyle(opt.id)}
            className={cn(
              'text-base p-1.5 rounded-lg border transition-all',
              visualStyle === opt.id
                ? 'border-primary bg-primary/10 scale-110'
                : 'border-transparent hover:border-border'
            )}
          >
            {opt.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
