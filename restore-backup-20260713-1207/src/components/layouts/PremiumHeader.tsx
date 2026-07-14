import React from 'react';
import CinematicTransition from '@/components/effects/CinematicTransition';
import DisplayHeading from '@/components/typography/DisplayHeading';

interface PremiumHeaderProps {
  title: string;
  subtitle?: string;
  khmerTitle?: string;
  khmerSubtitle?: string;
  className?: string;
}

/**
 * Premium Header Component
 * Displays cinematic fade entrance with rich typography hierarchy
 * Combines Display Heading with support for Khmer dual-language content
 */
export default function PremiumHeader({
  title,
  subtitle,
  khmerTitle,
  khmerSubtitle,
  className = '',
}: PremiumHeaderProps) {
  return (
    <CinematicTransition>
      <div className={`text-center py-10 ${className}`}>
        <DisplayHeading
          level="h1"
          animated
          includeKhmer={khmerTitle}
          className="mb-6"
        >
          {title}
        </DisplayHeading>

        {subtitle && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-3">
            {subtitle}
          </p>
        )}

        {khmerSubtitle && (
          <p className="font-khmer text-base text-muted-foreground max-w-2xl mx-auto">
            {khmerSubtitle}
          </p>
        )}
      </div>
    </CinematicTransition>
  );
}
