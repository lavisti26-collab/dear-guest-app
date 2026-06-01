import React from 'react';
import ThemeAwareParticles from '@/components/effects/ThemeAwareParticles';

interface AdminCardGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Admin Card Grid Component
 * Creates a responsive grid of cards with glow effects on hover
 * Automatically adapts styling based on light/dark theme
 * Perfect for displaying dashboards, analytics, and management controls
 */
export default function AdminCardGrid({
  children,
  columns = 3,
  gap = 'medium',
  className = '',
}: AdminCardGridProps) {
  const gapClasses = {
    small: 'gap-4',
    medium: 'gap-6',
    large: 'gap-8',
  };

  const colClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  return (
    <div
      className={`
        grid grid-cols-1 
        ${colClasses[columns as keyof typeof colClasses] || 'md:grid-cols-3'}
        ${gapClasses[gap]}
        ${className}
      `}
    >
      {React.Children.map(children, (child) => (
        <ThemeAwareParticles effect="glow">
          <div
            className={`
              p-6 rounded-xl border border-border bg-card
              transition-all duration-300 ease-out
              hover:border-accent/50 hover:shadow-[0_0_20px_rgba(212,167,106,0.2)]
              hover:scale-105
            `}
          >
            {child}
          </div>
        </ThemeAwareParticles>
      ))}
    </div>
  );
}
