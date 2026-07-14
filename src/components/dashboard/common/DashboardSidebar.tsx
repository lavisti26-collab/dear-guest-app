import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import DisplayHeading from '@/components/typography/DisplayHeading';
import DashboardText from '@/components/typography/DashboardText';
import ThemeSelector from './ThemeSelector';
import RoleElevator from './RoleElevator';
import EmojiSticker from '@/components/stickers/EmojiSticker';
import { cn } from '@/lib/utils';
import { useVisualSurface } from '@/hooks/useVisualSurface';
import VisualStyleCompact from './VisualStyleCompact';
import { supabase } from '@/integrations/supabase/client';

const NAV = {
  super_admin: [
    { to: '/admin/super', label: 'Platform control', icon: 'icon-fluent-emoji-flat:crown' },
    { to: '/admin/super?tab=system', label: 'Control center', icon: 'icon-fluent-emoji-flat:desktop' },
    { to: '/admin?tab=theme', label: 'Design studio', icon: 'icon-fluent-emoji-flat:artist-palette' },
    { to: '/admin', label: 'Couple admin', icon: 'icon-fluent-emoji-flat:heart-with-ribbon' },
  ],
  admin: [
    { to: '/admin', label: 'Wedding admin', icon: 'icon-fluent-emoji-flat:memo' },
    { to: '/admin?tab=theme', label: 'Design studio', icon: 'icon-fluent-emoji-flat:artist-palette' },
  ],
  guest: [
    { to: '/hub', label: 'Guest hub', icon: 'icon-fluent-emoji-flat:house-with-garden' },
    { to: '/', label: 'Landing', icon: 'icon-fluent-emoji-flat:globe-showing-asia-australia' },
  ],
};

interface DashboardSidebarProps {
  className?: string;
  showRoleElevator?: boolean;
}

export default function DashboardSidebar({
  className,
  showRoleElevator = false,
}: DashboardSidebarProps) {
  const { role, roleConfig } = useRole();
  const { sidebar } = useVisualSurface();

  // Check if the actual logged-in DB user is a super admin (regardless of context role).
  // This lets super admins see the role elevator + platform link even when viewing /hub as guest.
  const [isActualSuperAdmin, setIsActualSuperAdmin] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (mounted && profile?.is_super_admin) setIsActualSuperAdmin(true);
    })();
    return () => { mounted = false; };
  }, []);

  // Build nav links; if actual super admin viewing a non-super_admin view, append shortcut
  const baseLinks = NAV[role];
  const links = (isActualSuperAdmin && role !== 'super_admin')
    ? [
        ...baseLinks,
        { to: '/admin/super', label: 'Platform control', icon: 'icon-fluent-emoji-flat:crown' },
        { to: '/admin', label: 'My Dashboard', icon: 'icon-fluent-emoji-flat:heart-with-ribbon' },
      ]
    : baseLinks;

  return (
    <aside
      className={cn(
        'flex flex-col gap-6 w-full lg:w-64 shrink-0 p-4 lg:p-5 min-h-full',
        'bg-sidebar text-sidebar-foreground border-r border-sidebar-border',
        sidebar,
        className
      )}
    >
      <div>
        <DisplayHeading level="h3" className="text-lg gold-text">
          Dear Guest
        </DisplayHeading>
        <DashboardText variant="label" includeKhmer="កន្លែងធ្វើការ">
          {roleConfig.label} workspace
        </DashboardText>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-dashboard hover:bg-sidebar-accent transition-colors"
          >
            <EmojiSticker emoji={item.icon} size="sm" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <ThemeSelector compact />
        <VisualStyleCompact />
        {(showRoleElevator || isActualSuperAdmin) && <RoleElevator />}
      </div>
    </aside>
  );
}
