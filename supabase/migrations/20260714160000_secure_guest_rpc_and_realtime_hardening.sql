-- Hardening guest table access and cleaning realtime subscriptions
-- Run in Supabase SQL editor or deploy via CLI migration:

-- 1. Revoke SELECT on guests table for anonymous users
REVOKE SELECT ON public.guests FROM anon;

-- 2. Drop the loose RLS select policy
DROP POLICY IF EXISTS "guests_anon_select" ON public.guests;

-- 3. Create the RPC function to query a single guest securely (runs as SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_public_guest_by_id_or_name(
  p_user_id uuid,
  p_name text,
  p_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  guest_name text,
  attendance_status text,
  total_guests integer,
  note text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT g.id, g.guest_name, g.attendance_status, g.total_guests, g.note
  FROM public.guests g
  WHERE g.user_id = p_user_id
    AND (
      (p_id IS NOT NULL AND g.id = p_id)
      OR (p_name IS NOT NULL AND g.guest_name = p_name)
      OR (p_name IS NOT NULL AND g.guest_name ILIKE p_name)
      OR (p_name IS NOT NULL AND replace(g.guest_name, ' ', '-') ILIKE p_name)
    )
  LIMIT 1;
END;
$$;

-- 4. Grant execute on function to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_public_guest_by_id_or_name(uuid, text, uuid) TO anon, authenticated;

-- 5. Modify supabase_realtime publication to only include wishes table
ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles, public.guests, public.settings, public.photos, public.program_schedule;
