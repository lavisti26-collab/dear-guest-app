import { ThemeProvider } from '@/theme/ThemeEngine';
import { resolveLegacyTheme } from '@/theme/legacy-migration';
import { RoleProvider } from '@/contexts/RoleContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import DashboardLayout from '@/layouts/DashboardLayout';
import { RoleBasedDashboard } from './RoleBasedDashboard';
import type { UserRole } from '@/contexts/RoleContext';
import { useResolvedDashboardRole } from '@/hooks/useResolvedDashboardRole';
import { getThemeForRole } from '@/lib/role-themes';
import { VisualStyleProvider } from '@/contexts/VisualStyleContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const META: Record<UserRole, { title: string; subtitle: string; particles: boolean }> = {
  super_admin: {
    title: 'Platform command',
    subtitle: 'System health, tenants & role simulation',
    particles: false,
  },
  admin: {
    title: 'Operations workspace',
    subtitle: 'Guests, access requests & broadcasts',
    particles: false,
  },
  guest: {
    title: 'Guest portal',
    subtitle: 'Onboarding, celebration hub & access upgrades',
    particles: true,
  },
};

interface DashboardShellPageProps {
  forcedRole?: UserRole;
}

export default function DashboardShellPage({ forcedRole }: DashboardShellPageProps) {
  const fallback = forcedRole ?? 'guest';
  const { role: resolved, loading } = useResolvedDashboardRole(fallback);
  const role = forcedRole ?? resolved;
  const meta = META[role];
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    })();
  }, []);

  if (loading && !forcedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center font-dashboard text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  const defaultTheme = getThemeForRole(role);

  return (
    <LanguageProvider>
      <ThemeProvider initialTheme={resolveLegacyTheme(defaultTheme)}>
        <VisualStyleProvider ownerUserId={userId ?? undefined}>
          <RoleProvider initialRole={role}>
          <DashboardLayout
            title={meta.title}
            subtitle={meta.subtitle}
            enableParticles={meta.particles}
            showLangSwitcher
          >
            <RoleBasedDashboard />
          </DashboardLayout>
          </RoleProvider>
        </VisualStyleProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
