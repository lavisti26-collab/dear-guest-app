import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/contexts/RoleContext';

export function useResolvedDashboardRole(fallback: UserRole = 'guest') {
  const [role, setRole] = useState<UserRole>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function resolve() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (mounted) {
          setRole(fallback);
          setLoading(false);
        }
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profile?.is_super_admin) setRole('super_admin');
      else if (fallback === 'guest') setRole('admin');
      else setRole(fallback);

      setLoading(false);
    }

    resolve();
    return () => {
      mounted = false;
    };
  }, [fallback]);

  return { role, loading };
}
