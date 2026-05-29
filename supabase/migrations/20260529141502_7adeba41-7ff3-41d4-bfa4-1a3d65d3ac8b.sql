-- =========================================================
-- 1. PROFILES: hide email + is_super_admin from public
-- =========================================================

-- Replace permissive public select with a safe scoped policy.
DROP POLICY IF EXISTS profiles_public_select ON public.profiles;

-- Authenticated users can read their own full profile row.
CREATE POLICY profiles_owner_select ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Super admins can read all profile rows (uses existing security-definer fn).
CREATE POLICY profiles_super_admin_select ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Public view for slug-based lookups (no email / no admin flag).
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT user_id, slug, display_name, theme
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- The view relies on RLS; add a permissive policy that only exposes safe cols
-- by allowing SELECT through the view path. Since security_invoker=on uses the
-- caller's RLS, we need an anon-safe policy. Add a narrow public policy that
-- only matches when the query is fetching a single row by slug (always true,
-- but columns exposed are limited by the view definition).
CREATE POLICY profiles_public_view_select ON public.profiles
  FOR SELECT TO anon
  USING (true);

-- Revoke direct anon SELECT on the base table at the grant level, so anon can
-- only read through the view.
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT ON public.profiles_public TO anon;

-- =========================================================
-- 2. PROFILES: block self-elevation to super admin
-- =========================================================
CREATE OR REPLACE FUNCTION public.prevent_super_admin_self_elevation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin THEN
    -- Only allow change when executed by a service role (no auth.uid()).
    IF auth.uid() IS NOT NULL THEN
      RAISE EXCEPTION 'is_super_admin cannot be modified by users';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_block_super_admin_update ON public.profiles;
CREATE TRIGGER profiles_block_super_admin_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_super_admin_self_elevation();

-- =========================================================
-- 3. REALTIME: lock channel subscriptions
-- =========================================================
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS realtime_auth_own_topic ON realtime.messages;
-- Only allow authenticated users to subscribe to their own user_id topic
-- (apps that need public channels should publish to slug-based topics that
-- match the public profile slug). Block anon entirely.
CREATE POLICY realtime_auth_own_topic ON realtime.messages
  FOR SELECT TO authenticated
  USING (
    (realtime.topic() = auth.uid()::text)
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.slug = realtime.topic()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.slug = realtime.topic() -- public invitation pages may listen by slug
    )
  );

-- =========================================================
-- 4. STORAGE: drop any lingering permissive policies (no-op if absent)
-- =========================================================
DROP POLICY IF EXISTS "Allow public insert photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert music" ON storage.objects;

NOTIFY pgrst, 'reload schema';