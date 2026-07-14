import React, { ReactNode } from 'react';
import { useRole, type UserRole, type Permission } from '@/contexts/RoleContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { role } = useRole();

  if (!allowedRoles.includes(role)) {
    return (
      fallback || (
        <div className="p-6 bg-destructive/10 rounded-lg border border-destructive">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Access Denied</h3>
              <p className="text-sm text-destructive/80 mt-1">You don't have permission to view this content.</p>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

interface PermissionGuardProps {
  permission: keyof Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { hasPermission } = useRole();

  if (!hasPermission(permission)) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface SuperAdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SuperAdminOnly({ children, fallback }: SuperAdminOnlyProps) {
  return (
    <RoleGuard allowedRoles={['super_admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

interface AdminOrAboveProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminOrAbove({ children, fallback }: AdminOrAboveProps) {
  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
