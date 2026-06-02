import { Link } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import DisplayHeading from '@/components/typography/DisplayHeading';
import DashboardText from '@/components/typography/DashboardText';
import ThemeSelector from './ThemeSelector';
import RoleElevator from './RoleElevator';
import EmojiSticker from '@/components/stickers/EmojiSticker';
import { cn } from '@/lib/utils';
import { useVisualSurface } from '@/hooks/useVisualSurface';
import VisualStyleCompact from './VisualStyleCompact';

const NAV = {
  super_admin: [
    { to: '/admin/super', label: 'Platform control', icon: 'icon-fluent-emoji-flat:crown' },
    { to: '/admin/super?tab=system', label: 'Control center', icon: 'icon-fluent-emoji-flat:desktop' },
    { to: '/studio', label: 'Design studio', icon: 'icon-fluent-emoji-flat:artist-palette' },
    { to: '/admin', label: 'Couple admin', icon: 'icon-fluent-emoji-flat:heart-with-ribbon' },
  ],
  admin: [
    { to: '/admin', label: 'Wedding admin', icon: 'icon-fluent-emoji-flat:memo' },
    { to: '/studio', label: 'Design studio', icon: 'icon-fluent-emoji-flat:artist-palette' },
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
  const links = NAV[role];
  const { sidebar } = useVisualSurface();

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
        {showRoleElevator && <RoleElevator />}
      </div>
    </aside>
  );
}
