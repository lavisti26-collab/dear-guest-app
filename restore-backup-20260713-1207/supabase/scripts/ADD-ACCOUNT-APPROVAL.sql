-- Account approval: new signups stay pending until super-admin approves
-- Run once in Supabase SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_account_status;
ALTER TABLE public.profiles ADD CONSTRAINT valid_account_status CHECK (
  account_status IN ('pending', 'approved', 'rejected')
);

-- Existing couples + super admins keep access
UPDATE public.profiles
SET account_status = 'approved'
WHERE account_status IS NULL OR account_status = 'pending';

UPDATE public.profiles
SET account_status = 'approved'
WHERE is_super_admin = true;

-- Super admins can approve / reject new accounts
DROP POLICY IF EXISTS "profiles_super_admin_update" ON public.profiles;
CREATE POLICY "profiles_super_admin_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());
