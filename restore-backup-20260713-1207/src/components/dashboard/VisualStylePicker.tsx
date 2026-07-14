import { useVisualStyle } from '@/contexts/VisualStyleContext';
import { VISUAL_STYLE_OPTIONS } from '@/lib/visual-styles';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

/** Mini visual preview for each layout style */
const StylePreview = ({ id }: { id: string }) => {
  switch (id) {
    case 'classic':
      return (
        <div className="w-full h-16 rounded-lg overflow-hidden bg-white border border-gray-200 flex flex-col gap-1.5 p-2">
          <div className="h-2 w-3/4 bg-gray-800 rounded" />
          <div className="h-1.5 w-full bg-gray-200 rounded" />
          <div className="h-1.5 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/3 bg-amber-400/80 rounded-full mt-auto" />
        </div>
      );
    case 'minimalist':
      return (
        <div className="w-full h-16 rounded-lg overflow-hidden bg-white flex flex-col gap-1 p-2 border border-gray-100">
          <div className="h-0.5 w-full bg-gray-900 rounded" />
          <div className="h-2.5 w-1/2 bg-gray-900 rounded mt-1" />
          <div className="h-1 w-full bg-gray-200 rounded" />
          <div className="h-1 w-4/5 bg-gray-200 rounded" />
          <div className="h-0.5 w-full bg-gray-900 rounded mt-auto" />
        </div>
      );
    case 'glassmorphism':
      return (
        <div className="w-full h-16 rounded-lg overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #f0c4d4, #c4d4f0)' }}>
          <div className="absolute inset-1 rounded-lg bg-white/30 backdrop-blur-sm border border-white/50 p-1.5 flex flex-col gap-1">
            <div className="h-1.5 w-2/3 bg-white/60 rounded" />
            <div className="h-1 w-full bg-white/40 rounded" />
            <div className="h-1 w-4/5 bg-white/40 rounded" />
          </div>
        </div>
      );
    case 'neo-brutalism':
      return (
        <div className="w-full h-16 rounded-lg overflow-hidden bg-yellow-100 border-2 border-black p-1.5 flex flex-col gap-1" style={{ boxShadow: '3px 3px 0 #000' }}>
          <div className="h-2.5 w-2/3 bg-black rounded-sm" />
          <div className="h-1.5 w-full bg-black/30 rounded-sm" />
          <div className="mt-auto flex gap-1">
            <div className="h-4 w-10 bg-black rounded-none border border-black" />
          </div>
        </div>
      );
    case 'romantic':
      return (
        <div className="w-full h-16 rounded-lg overflow-hidden bg-rose-50 border border-rose-200 p-2 flex flex-col gap-1">
          <div className="h-2 w-2/3 bg-rose-400/80 rounded-full" />
          <div className="h-1 w-full bg-rose-200 rounded-full" />
          <div className="h-1 w-4/5 bg-rose-200 rounded-full" />
          <div className="mt-auto flex items-center gap-1">
            <span className="text-[10px]">💖</span>
            <div className="h-3 w-12 bg-rose-300/80 rounded-full" />
          </div>
        </div>
      );
    case 'elegant':
      return (
        <div className="w-full h-16 rounded-lg overflow-hidden bg-stone-50 border border-stone-200 p-2">
          <div className="flex items-center gap-1 mb-1.5">
            <div className="h-px w-4 bg-amber-500" />
            <div className="h-1.5 w-16 bg-stone-700 rounded" />
            <div className="h-px w-4 bg-amber-500" />
          </div>
          <div className="h-px w-full bg-amber-400/60 mb-1.5" />
          <div className="h-1 w-full bg-stone-300 rounded" />
          <div className="h-1 w-2/3 bg-stone-300 rounded mt-1" />
        </div>
      );
    case 'editorial':
      return (
        <div className="w-full h-16 rounded-lg overflow-hidden bg-white border border-gray-300 p-2">
          <div className="flex gap-1.5">
            <div className="flex-1">
              <div className="h-2.5 w-full bg-gray-900 rounded-sm mb-1" />
              <div className="h-1 w-full bg-gray-300 rounded" />
              <div className="h-1 w-4/5 bg-gray-300 rounded mt-0.5" />
            </div>
            <div className="w-12 bg-gray-200 rounded-sm" />
          </div>
          <div className="h-px w-full bg-gray-900 mt-1.5" />
        </div>
      );
    default:
      return (
        <div className="w-full h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-200 flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
      );
  }
};

export default function VisualStylePicker() {
  const { visualStyle, setVisualStyle } = useVisualStyle();

  return (
    <div className="space-y-4">
      <div className="max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {VISUAL_STYLE_OPTIONS.map((opt) => {
            const active = visualStyle === opt.id;
            return (
              <motion.button
                key={opt.id}
                type="button"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setVisualStyle(opt.id);
                  toast.success(`${opt.emoji} ${opt.label} applied`);
                }}
                className={cn(
                  'relative text-left p-3 rounded-2xl border-2 transition-all duration-300 flex flex-col gap-2 group overflow-hidden',
                  active
                    ? 'border-amber-400 bg-amber-50/60 shadow-[0_0_0_3px_hsl(38_100%_50%/0.15)] shadow-lg'
                    : 'border-border/40 bg-card hover:border-amber-300/60 hover:shadow-md'
                )}
              >
                {/* Active badge */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center z-10"
                    >
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Visual preview */}
                <StylePreview id={opt.id} />

                {/* Label */}
                <div className="flex items-start gap-1.5 mt-0.5">
                  <span className="text-base flex-shrink-0">{opt.emoji}</span>
                  <div>
                    <p className={cn(
                      'text-xs font-semibold leading-tight',
                      active ? 'text-amber-700' : 'text-foreground'
                    )}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                      {opt.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Current selection display */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60">
        <span className="text-amber-500 text-sm">✦</span>
        <p className="text-xs text-amber-700 font-medium">
          Active: <span className="font-bold">{VISUAL_STYLE_OPTIONS.find(o => o.id === visualStyle)?.label ?? visualStyle}</span>
        </p>
        <span className="ml-auto text-[10px] text-amber-500/70 uppercase tracking-wide">Live on invitation</span>
      </div>
    </div>
  );
}
