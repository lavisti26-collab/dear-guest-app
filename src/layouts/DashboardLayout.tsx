import { useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import CinematicTransition from '@/components/effects/CinematicTransition';
import ParticleBackground from '@/components/effects/ParticleBackground';
import RoleBasedSticker from '@/components/stickers/RoleBasedSticker';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardLangSwitcher from '@/components/dashboard/DashboardLangSwitcher';
import RoleVisualStickers from '@/components/dashboard/RoleVisualStickers';
import { useVisualStyleOptional } from '@/contexts/VisualStyleContext';
import {
  ambientEffectForStyle,
  shouldEnableGuestAmbient,
} from '@/lib/visual-styles';
import { useVisualSurface } from '@/hooks/useVisualSurface';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  enableParticles?: boolean;
  showLangSwitcher?: boolean;
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  enableParticles = false,
  showLangSwitcher = false,
}: DashboardLayoutProps) {
  const { role } = useRole();
  const visualCtx = useVisualStyleOptional();
  const visualStyle = visualCtx?.visualStyle ?? 'classic';
  const surfaces = useVisualSurface();
  const [particles, setParticles] = useState(enableParticles);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const autoAmbient =
    shouldEnableGuestAmbient(visualStyle, role) ||
    (enableParticles && visualStyle === 'classic');
  const particlesOn = (particles || autoAmbient) && !reducedMotion;
  const particleEffect = ambientEffectForStyle(visualStyle);

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row bg-background relative overflow-hidden ${surfaces.root}`}
    >
      {particlesOn && (
        <ParticleBackground
          effect={particleEffect}
          className="pointer-events-none"
          intensity="low"
        />
      )}

      <div className="hidden lg:block">
        <DashboardSidebar showRoleElevator={role === 'super_admin'} />
      </div>

      <div className="lg:hidden border-b p-3 flex items-center justify-between bg-card/80 backdrop-blur z-20">
        <RoleBasedSticker
          role={role === 'super_admin' ? 'super-admin' : role}
        />
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <DashboardSidebar showRoleElevator={role === 'super_admin'} />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 p-4 md:p-8 z-10 max-w-6xl w-full mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="animate-cinematic-fade">
            {title && (
              <h1 className={`${surfaces.heading} text-3xl md:text-4xl font-bold`}>{title}</h1>
            )}
            {subtitle && (
              <p className={`${surfaces.subheading} text-muted-foreground mt-1`}>{subtitle}</p>
            )}
            <RoleVisualStickers />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showLangSwitcher && <DashboardLangSwitcher />}
            {enableParticles && !reducedMotion && (
              <Button
                variant="outline"
                size="sm"
                className="font-dashboard"
                onClick={() => setParticles((p) => !p)}
              >
                {particles ? 'Hide' : 'Show'} atmosphere
              </Button>
            )}
          </div>
        </header>

        <CinematicTransition key={role}>{children}</CinematicTransition>
      </main>
    </div>
  );
}
