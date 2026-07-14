import { useRole } from '@/contexts/RoleContext';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { AdminWorkspaceDashboard } from '@/components/dashboard/AdminWorkspaceDashboard';
import { GuestDashboard } from '@/components/dashboard/GuestDashboard';

export function RoleBasedDashboard() {
  const { role } = useRole();

  switch (role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminWorkspaceDashboard />;
    case 'guest':
    default:
      return <GuestDashboard />;
  }
}
