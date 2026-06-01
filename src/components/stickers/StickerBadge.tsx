import React from 'react';
import EmojiSticker from './EmojiSticker';

interface StickerBadgeProps {
  emoji: string;
  label: string;
  description?: string;
  className?: string;
  highlighted?: boolean;
  onClick?: () => void;
}

/**
 * Sticker Badge Component
 * Embeds emojis in FlyonUI Cards and Modals with labels and descriptions
 * Perfect for creating micro-illustration visual hierarchies
 */
export default function StickerBadge({
  emoji,
  label,
  description,
  className = '',
  highlighted = false,
  onClick,
}: StickerBadgeProps) {
  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col items-center gap-3 p-4 rounded-xl transition-all
        ${highlighted 
          ? 'bg-accent/10 border-2 border-accent shadow-lg' 
          : 'bg-card border border-border hover:border-accent/50'
        }
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
    >
      <EmojiSticker emoji={emoji} size="lg" animated={highlighted} />
      <div className="text-center">
        <p className="font-semibold text-foreground text-sm">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}
