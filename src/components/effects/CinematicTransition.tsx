import React from 'react';
import { motion } from 'framer-motion';

interface CinematicTransitionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

/**
 * Cinematic Transition Wrapper Component
 * Applies smooth hardware-accelerated fade and scale transitions
 * Perfect for switching between Guest, Admin, and Super Admin views
 * Triggers animate-cinematic-fade on mount
 */
export default function CinematicTransition({
  children,
  delay = 0,
  duration = 0.8,
}: CinematicTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
        type: 'spring',
        damping: 25,
        stiffness: 100,
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
