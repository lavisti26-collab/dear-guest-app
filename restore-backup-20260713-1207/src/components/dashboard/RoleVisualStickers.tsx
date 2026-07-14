import { useRole } from '@/contexts/RoleContext';
import { ROLE_VISUAL_STICKERS } from '@/lib/visual-styles';
import EmojiSticker from '@/components/stickers/EmojiSticker';

export default function RoleVisualStickers() {
  const { role } = useRole();
  const stickers = ROLE_VISUAL_STICKERS[role];

  return (
    <div className="flex flex-wrap gap-3">
      {stickers.map((s) => (
        <div
          key={s.id}
          className="vs-sticker-pill flex items-center gap-2 rounded-full px-3 py-1.5 border border-border/50 bg-card/50"
        >
          <EmojiSticker emoji={s.icon} size="sm" />
          <span className="text-xs font-dashboard font-medium text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
