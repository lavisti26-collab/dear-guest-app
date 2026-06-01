-- Access requests: guest hub → admin approval (run in Supabase SQL Editor)
-- https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq/sql/new

CREATE TABLE IF NOT EXISTS public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  requested_level text NOT NULL DEFAULT 'admin'
    CHECK (requested_level IN ('admin', 'staff')),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'declined')),
  reviewed_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS access_requests_updated_at ON public.access_requests;
CREATE TRIGGER access_requests_updated_at
  BEFORE UPDATE ON public.access_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "access_requests_anon_insert" ON public.access_requests;
CREATE POLICY "access_requests_anon_insert" ON public.access_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "access_requests_auth_select" ON public.access_requests;
CREATE POLICY "access_requests_auth_select" ON public.access_requests
  FOR SELECT TO authenticated
  USING (true);

-- Super admins always see all rows (platform operators)
DROP POLICY IF EXISTS "access_requests_super_admin_all" ON public.access_requests;
CREATE POLICY "access_requests_super_admin_all" ON public.access_requests
  FOR ALL TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS "access_requests_auth_update" ON public.access_requests;
CREATE POLICY "access_requests_auth_update" ON public.access_requests
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (status IN ('approved', 'declined'));

GRANT SELECT, INSERT ON public.access_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.access_requests TO authenticated;
