import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'super_admin' | 'admin' | 'guest';

export interface Permission {
  manage_users: boolean;
  manage_system: boolean;
  view_analytics: boolean;
  manage_content: boolean;
  create_weddings: boolean;
  view_all_weddings: boolean;
}

export interface RoleConfig {
  permissions: Permission;
  label: string;
  description: string;
}

const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  super_admin: {
    permissions: {
      manage_users: true,
      manage_system: true,
      view_analytics: true,
      manage_content: true,
      create_weddings: true,
      view_all_weddings: true,
    },
    label: 'Super Admin',
    description: 'System administrator with full access',
  },
  admin: {
    permissions: {
      manage_users: true,
      manage_system: false,
      view_analytics: true,
      manage_content: true,
      create_weddings: true,
      view_all_weddings: false,
    },
    label: 'Admin',
    description: 'Wedding coordinator and staff manager',
  },
  guest: {
    permissions: {
      manage_users: false,
      manage_system: false,
      view_analytics: false,
      manage_content: false,
      create_weddings: false,
      view_all_weddings: false,
    },
    label: 'Guest',
    description: 'Public user with limited access',
  },
};

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  permissions: Permission;
  hasPermission: (permission: keyof Permission) => boolean;
  roleConfig: RoleConfig;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children, initialRole = 'guest' }: { children: ReactNode; initialRole?: UserRole }) {
  const [role, setRole] = useState<UserRole>(initialRole);

  useEffect(() => {
    // Persist role to localStorage for development
    localStorage.setItem('user_role', role);
  }, [role]);

  const roleConfig = ROLE_CONFIGS[role];
  const permissions = roleConfig.permissions;

  const hasPermission = (permission: keyof Permission): boolean => {
    return permissions[permission] === true;
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        permissions,
        hasPermission,
        roleConfig,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be inside RoleProvider');
  return ctx;
}
