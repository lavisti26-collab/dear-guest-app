-- Make phatsopheakdey08@gmail.com a super admin (run in SQL Editor)
-- https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq/sql/new

-- Fix RLS recursion if you have not already:
CREATE OR REPLACE FUNCTION public.current_user_is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT p.is_super_admin FROM public.profiles p WHERE p.user_id = auth.uid() LIMIT 1),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.current_user_is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_is_super_admin() TO authenticated;

DROP POLICY IF EXISTS "profiles_super_admin_select" ON public.profiles;
CREATE POLICY "profiles_super_admin_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.current_user_is_super_admin());

-- Promote account
UPDATE public.profiles
SET is_super_admin = true
WHERE email ILIKE 'phatsopheakdey08@gmail.com';

-- Verify (should return 1 row with is_super_admin = true)
SELECT user_id, email, slug, is_super_admin
FROM public.profiles
WHERE email ILIKE 'phatsopheakdey08@gmail.com';

NOTIFY pgrst, 'reload schema';
