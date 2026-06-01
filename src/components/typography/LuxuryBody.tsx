import React from 'react';

interface LuxuryBodyProps {
  children: React.ReactNode;
  className?: string;
  includeKhmer?: string;
  highlight?: boolean;
}

/**
 * Luxury Body Text Component
 * Uses Battambang (Khmer-inspired serif) for warm, traditional, premium content
 * Perfect for descriptions, event details, and heartfelt messages
 */
export default function LuxuryBody({
  children,
  className = '',
  includeKhmer,
  highlight = false,
}: LuxuryBodyProps) {
  const baseClasses = highlight
    ? 'font-khmer-serif text-lg leading-relaxed text-foreground font-semibold'
    : 'font-khmer-serif text-base leading-relaxed text-foreground';

  return (
    <div>
      <p className={`${baseClasses} ${className}`}>{children}</p>
      {includeKhmer && (
        <p className="font-khmer-serif text-sm leading-relaxed text-muted-foreground mt-3">
          {includeKhmer}
        </p>
      )}
    </div>
  );
}
