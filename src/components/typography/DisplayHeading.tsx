import React from 'react';

interface DisplayHeadingProps {
  children: React.ReactNode;
  className?: string;
  level?: 'h1' | 'h2' | 'h3';
  includeKhmer?: string;
  animated?: boolean;
}

/**
 * Premium Display Heading Component
 * Uses Playfair Display + Moul (Khmer) for luxury headers with cinematic fade-in
 * Perfect for landing pages and section titles
 */
export default function DisplayHeading({
  children,
  className = '',
  level = 'h1',
  includeKhmer,
  animated = false,
}: DisplayHeadingProps) {
  const baseClasses = 'font-display font-bold text-foreground';

  const sizeClasses = {
    h1: 'text-5xl sm:text-6xl lg:text-7xl',
    h2: 'text-4xl sm:text-5xl lg:text-6xl',
    h3: 'text-3xl sm:text-4xl lg:text-5xl',
  };

  const animationClass = animated ? 'animate-cinematic-fade' : '';

  const Tag = level as keyof JSX.IntrinsicElements;

  return (
    <div className={animationClass}>
      <Tag className={`${baseClasses} ${sizeClasses[level]} ${className}`}>
        {children}
      </Tag>
      {includeKhmer && (
        <p className="font-khmer-display text-2xl sm:text-3xl text-muted-foreground mt-2">
          {includeKhmer}
        </p>
      )}
    </div>
  );
}
