import React from 'react';
import ParticleBackground from '@/components/effects/ParticleBackground';
import CinematicTransition from '@/components/effects/CinematicTransition';

interface GuestHubContainerProps {
  children: React.ReactNode;
  enableParticles?: boolean;
  particleEffect?: 'petal-fall' | 'butterfly-float';
  particleIntensity?: 'low' | 'medium' | 'high';
  className?: string;
}

/**
 * Guest Hub Container Component
 * Beautiful container with floating particles and emoji-enriched content
 * Creates warm, welcoming, interactive engagement experience
 * Perfect for public invitation landing pages
 */
export default function GuestHubContainer({
  children,
  enableParticles = true,
  particleEffect = 'petal-fall',
  particleIntensity = 'low',
  className = '',
}: GuestHubContainerProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Particle background layer */}
      <ParticleBackground
        enabled={enableParticles}
        effect={particleEffect}
        intensity={particleIntensity}
      />

      {/* Content layer with cinematic transition */}
      <CinematicTransition>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </CinematicTransition>
    </div>
  );
}
