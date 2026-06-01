import React from 'react';

interface EmojiStickerProps {
  emoji: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
  label?: string;
}

/**
 * Rich Emoji Sticker Component
 * Renders beautiful high-fidelity emojis with optional animations
 * Can use native emojis or Iconify icons via emoji property
 */
export default function EmojiSticker({
  emoji,
  size = 'md',
  className = '',
  animated = false,
  label,
}: EmojiStickerProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl',
  };

  const animationClass = animated ? 'animate-gentle-float' : '';

  const isIconify = emoji.startsWith('icon-');

  if (isIconify) {
    const iconName = emoji.replace('icon-', '');
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <iconify-icon
          icon={iconName}
          className={`${sizeClasses[size]} ${animationClass}`}
          style={{ display: 'inline-block' }}
        />
        {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} ${animationClass} inline-block`}>
        {emoji}
      </div>
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
    </div>
  );
}
