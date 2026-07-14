import React from 'react';

interface GlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  glowIntensity?: 'soft' | 'medium' | 'intense';
  className?: string;
}

/**
 * Premium Glow Button Component
 * CTA button with pulse-glow animation and luxury styling
 * Perfect for "Request Access", "Broadcast Alert", key actions
 */
export default function GlowButton({
  children,
  variant = 'accent',
  size = 'md',
  glowIntensity = 'medium',
  className = '',
  ...props
}: GlowButtonProps) {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const glowClasses = {
    soft: 'shadow-[0_0_20px_rgba(212,167,106,0.3)] hover:shadow-[0_0_30px_rgba(212,167,106,0.4)]',
    medium: 'shadow-[0_0_30px_rgba(212,167,106,0.5)] hover:shadow-[0_0_40px_rgba(212,167,106,0.6)]',
    intense: 'shadow-[0_0_40px_rgba(212,167,106,0.7)] hover:shadow-[0_0_50px_rgba(212,167,106,0.8)]',
  };

  return (
    <button
      className={`
        relative inline-flex items-center justify-center font-semibold rounded-full
        transition-all duration-300 ease-out
        animate-pulse-glow
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${glowClasses[glowIntensity]}
        ${className}
      `}
      {...props}
    >
      {/* Shine effect overlay */}
      <span
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"
        style={{
          background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)',
        }}
      />
      {children}
    </button>
  );
}
