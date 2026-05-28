
-- Lock down SECURITY DEFINER helpers so only the DB (postgres/service_role) can call them.
REVOKE EXECUTE ON FUNCTION public.get_user_id_by_slug(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Tighten public insert policies: require user_id to match an existing profile
DROP POLICY IF EXISTS guests_public_insert ON public.guests;
CREATE POLICY guests_public_insert ON public.guests
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = guests.user_id));

DROP POLICY IF EXISTS wishes_public_insert ON public.wishes;
CREATE POLICY wishes_public_insert ON public.wishes
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = wishes.user_id));
