import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

interface ParticleBackgroundProps {
  enabled?: boolean;
  effect?: 'petal-fall' | 'butterfly-float' | 'sparkle' | 'confetti' | 'fireflies' | 'stars';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

/**
 * Particle Background Component
 * Creates beautiful ambient particle effects with toggleable animations
 * Effects: petal-fall, butterfly-float, sparkle (+ confetti/fireflies/stars fallback to sparkle)
 * Automatically adjusts opacity based on light/dark theme
 */
export default function ParticleBackground({
  enabled = true,
  effect = 'petal-fall',
  intensity = 'medium',
  className = '',
}: ParticleBackgroundProps) {
  const themeCtx = useContext(ThemeContext);
  const isDark = (themeCtx as any)?.isDark ?? false;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isClient || !enabled || reducedMotion) return null;

  const intensityOpacity = {
    low: isDark ? 'opacity-20' : 'opacity-10',
    medium: isDark ? 'opacity-35' : 'opacity-20',
    high: isDark ? 'opacity-50' : 'opacity-35',
  };

  // Map extended effect names to supported CSS animation classes
  const resolvedEffect: 'petal-fall' | 'butterfly-float' | 'sparkle' =
    effect === 'confetti' || effect === 'stars' ? 'sparkle'
    : effect === 'fireflies' ? 'butterfly-float'
    : (effect as 'petal-fall' | 'butterfly-float' | 'sparkle');

  const animationClass = {
    'petal-fall': `animate-petal-fall`,
    'butterfly-float': `animate-butterfly-float`,
    'sparkle': `animate-sparkle`,
  };

  return (
    <div
      className={`
        fixed inset-0 pointer-events-none overflow-hidden
        ${className}
      `}
      style={{ zIndex: 0 }}
    >
      {/* Main particle container */}
      <div
        className={`
          absolute inset-0 
          ${animationClass[resolvedEffect]}
          ${intensityOpacity[intensity]}
          transition-opacity duration-500
        `}
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 0%, rgba(212,167,106,0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 0%, rgba(212,167,106,0.05) 0%, transparent 70%)',
        }}
      >
        {/* Particle dots for visual richness */}
        {resolvedEffect !== 'sparkle' && (
          <>
            <div className={`absolute top-10 left-1/4 w-2 h-2 rounded-full bg-accent ${animationClass[resolvedEffect]}`} />
            <div className={`absolute top-1/3 left-1/3 w-1 h-1 rounded-full bg-primary ${animationClass[resolvedEffect]}`} style={{ animationDelay: '1s' }} />
            <div className={`absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full bg-accent/50 ${animationClass[resolvedEffect]}`} style={{ animationDelay: '2s' }} />
            <div className={`absolute top-2/3 left-1/2 w-1 h-1 rounded-full bg-primary/70 ${animationClass[resolvedEffect]}`} style={{ animationDelay: '0.5s' }} />
          </>
        )}
      </div>

      {/* Theme-aware glow overlay for dark mode */}
      {isDark && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(212,167,106,0.05) 0%, transparent 80%)',
          }}
        />
      )}
    </div>
  );
}
