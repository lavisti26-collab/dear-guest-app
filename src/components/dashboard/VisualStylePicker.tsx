import { useVisualStyle } from '@/contexts/VisualStyleContext';
import { VISUAL_STYLE_OPTIONS } from '@/lib/visual-styles';
import DashboardText from '@/components/typography/DashboardText';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function VisualStylePicker() {
  const { visualStyle, setVisualStyle } = useVisualStyle();

  return (
    <div className="space-y-4">
      <DashboardText variant="subtitle" className="text-muted-foreground">
        Morph layout shapes, borders, and shadows — your color theme palette stays the same.
        Changes save to your profile and apply automatically on your guest invite link.
      </DashboardText>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {VISUAL_STYLE_OPTIONS.map((opt) => {
          const active = visualStyle === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setVisualStyle(opt.id);
                toast.success(`${opt.emoji} ${opt.label} layout applied`);
              }}
              className={cn(
                'vs-surface text-left p-4 rounded-2xl border-2 transition-all duration-300',
                active ? 'border-primary ring-2 ring-primary/30' : 'border-border/50 hover:border-primary/40'
              )}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <p className="vs-heading font-semibold text-sm mt-2">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-1 font-dashboard">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
