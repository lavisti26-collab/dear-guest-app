import React, { useMemo } from 'react';
import EmojiSticker from './EmojiSticker';

type UserRole = 'super-admin' | 'admin' | 'guest';

interface RoleBasedStickerProps {
  role: UserRole;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

/**
 * Role-Based Sticker Component
 * Renders context-aware emojis based on user role
 * Super Admin: Control/System emojis (🔒 🖥️ ⚡ 🔧 📊)
 * Admin: Management emojis (👥 📈 📢 📋 ✨)
 * Guest: Warm engagement emojis (✨ 💌 👋 🎉 💍)
 */
export default function RoleBasedSticker({
  role,
  variant = 'primary',
  size = 'md',
  className = '',
  animated = true,
}: RoleBasedStickerProps) {
  const stickerSets = {
    'super-admin': ['🔒', '🖥️', '⚡', '🔧', '📊', '🛡️', '⚙️'],
    admin: ['👥', '📈', '📢', '📋', '✨', '🎯', '📝'],
    guest: ['✨', '💌', '👋', '🎉', '💍', '🌟', '💝'],
  };

  // Rotate through emojis based on variant
  const variantIndex = {
    primary: 0,
    secondary: 1,
    accent: 2,
  };

  const selectedEmoji = useMemo(() => {
    const stickers = stickerSets[role];
    return stickers[variantIndex[variant] % stickers.length];
  }, [role, variant]);

  return (
    <EmojiSticker
      emoji={selectedEmoji}
      size={size}
      className={className}
      animated={animated}
    />
  );
}
