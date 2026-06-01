import React, { useState } from 'react';
import { useRole, type UserRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Crown, Settings, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function RoleSwitcher() {
  const { role, setRole, roleConfig } = useRole();
  const [isOpen, setIsOpen] = useState(false);

  const roles: UserRole[] = ['super_admin', 'admin', 'guest'];

  const roleIcons = {
    super_admin: Crown,
    admin: Settings,
    guest: Users,
  };

  const Icon = roleIcons[role];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950"
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-semibold">{roleConfig.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Switch Role (Dev Only)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((r) => (
          <DropdownMenuCheckboxItem
            key={r}
            checked={role === r}
            onCheckedChange={() => {
              setRole(r);
              setIsOpen(false);
            }}
          >
            {ROLE_LABELS[r]}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: '👑 Super Admin',
  admin: '⚙️ Admin',
  guest: '👤 Guest',
};
