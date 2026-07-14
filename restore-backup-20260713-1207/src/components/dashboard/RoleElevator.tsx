import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { UserRole } from '@/contexts/RoleContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import DashboardText from '@/components/typography/DashboardText';
import EmojiSticker from '@/components/stickers/EmojiSticker';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';

const ROLES: {
  value: UserRole;
  label: string;
  description: string;
  path: string;
  icon: string;
}[] = [
  {
    value: 'guest',
    label: 'Guest portal',
    description: 'Public hub, invitation lookup, access requests',
    path: '/hub',
    icon: 'icon-fluent-emoji-flat:waving-hand',
  },
  {
    value: 'admin',
    label: 'Wedding admin',
    description: 'Manage guests, RSVP, theme & invite link',
    path: '/admin',
    icon: 'icon-fluent-emoji-flat:briefcase',
  },
  {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Platform couples + system diagnostics',
    path: '/admin/super?tab=system',
    icon: 'icon-fluent-emoji-flat:crown',
  },
];

interface RoleElevatorProps {
  /** When true, uses navigation only (no RoleContext required) */
  standalone?: boolean;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export default function RoleElevator({
  standalone = true,
  currentRole = 'super_admin',
  onRoleChange,
}: RoleElevatorProps) {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<UserRole>(currentRole);

  useEffect(() => {
    setPreview(currentRole);
  }, [currentRole]);

  const selected = ROLES.find((r) => r.value === preview) ?? ROLES[0];

  const openPortal = () => {
    onRoleChange?.(preview);
    navigate(selected.path);
    toast.success(`Opening ${selected.label}`);
  };

  return (
    <div className="space-y-6">
      <div className="luxury-card rounded-2xl p-5 space-y-4 warm-border-admin max-w-xl">
        <div className="flex items-center gap-3">
          <EmojiSticker emoji="icon-fluent-emoji-flat:elevator" size="md" animated />
          <div>
            <DashboardText variant="title" className="text-lg">
              Role elevator
            </DashboardText>
            <DashboardText variant="label" className="normal-case text-muted-foreground">
              Preview each portal in a new tab — does not change Supabase permissions
            </DashboardText>
          </div>
        </div>

        <Select value={preview} onValueChange={(v) => setPreview(v as UserRole)}>
          <SelectTrigger className="font-dashboard">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value} className="font-dashboard">
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-sm text-muted-foreground font-dashboard">{selected.description}</p>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={openPortal} className="flex-1 font-dashboard">
            Open {selected.label}
          </Button>
          <Button variant="outline" asChild className="font-dashboard gap-2">
            <Link to={selected.path} target="_blank" rel="noreferrer">
              New tab <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 max-w-3xl">
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => {
              setPreview(r.value);
              navigate(r.path);
            }}
            className={`luxury-card rounded-xl p-4 text-left transition-all hover:shadow-glow ${
              preview === r.value ? 'ring-2 ring-primary' : ''
            }`}
          >
            <EmojiSticker emoji={r.icon} size="sm" />
            <p className="font-dashboard font-semibold text-sm mt-2">{r.label}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
