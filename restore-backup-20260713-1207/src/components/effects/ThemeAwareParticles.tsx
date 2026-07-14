import React, { useMemo } from 'react';
import { useThemeOptional } from '@/theme/ThemeEngine';

interface ThemeAwareParticlesProps {
  children: React.ReactNode;
  className?: string;
  effect?: 'glow' | 'sparkle' | 'blur';
}

/**
 * Theme-Aware Particles Wrapper Component
 * Automatically adjusts particle opacity, color, and blend modes
 * based on light/dark theme preference
 */
export default function ThemeAwareParticles({
  children,
  className = '',
  effect = 'glow',
}: ThemeAwareParticlesProps) {
  const { isDark } = useThemeOptional();

  const effectStyles = useMemo(() => {
    if (effect === 'glow') {
      return isDark
        ? {
            filter: 'drop-shadow(0 0 15px rgba(212, 167, 106, 0.3))',
            mixBlendMode: 'screen' as const,
          }
        : {
            filter: 'drop-shadow(0 0 10px rgba(212, 167, 106, 0.15))',
            mixBlendMode: 'multiply' as const,
          };
    }

    if (effect === 'sparkle') {
      return isDark
        ? {
            filter: 'brightness(1.1) drop-shadow(0 0 8px rgba(212, 167, 106, 0.4))',
            mixBlendMode: 'screen' as const,
          }
        : {
            filter: 'brightness(0.95) drop-shadow(0 0 4px rgba(212, 167, 106, 0.2))',
            mixBlendMode: 'overlay' as const,
          };
    }

    return {
      filter: 'none',
      backdropFilter: isDark ? 'blur(0px)' : 'blur(0px)',
    };
  }, [isDark, effect]);

  return (
    <div
      style={effectStyles}
      className={`transition-all duration-500 ${className}`}
    >
      {children}
    </div>
  );
}