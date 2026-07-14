import React from 'react';

interface DashboardTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'title' | 'subtitle' | 'body' | 'label';
  includeKhmer?: string;
}

/**
 * Clean Dashboard Text Component
 * Uses Figtree (English) + Kantumruy Pro (Khmer) for maximum scannability
 * Ideal for data tables, forms, and information hierarchies
 */
export default function DashboardText({
  children,
  className = '',
  variant = 'body',
  includeKhmer,
}: DashboardTextProps) {
  const baseClasses = 'font-sans text-foreground';

  const variantClasses = {
    title: 'text-xl sm:text-2xl font-semibold',
    subtitle: 'text-base sm:text-lg font-medium',
    body: 'text-sm sm:text-base font-normal',
    label: 'text-xs sm:text-sm font-medium uppercase tracking-wide',
  };

  return (
    <div>
      <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
        {children}
      </div>
      {includeKhmer && (
        <p className="font-khmer text-xs sm:text-sm text-muted-foreground mt-1">
          {includeKhmer}
        </p>
      )}
    </div>
  );
}
