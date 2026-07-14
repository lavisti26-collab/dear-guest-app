-- Dear Guest — database setup (RLS, RPC, triggers) for Supabase project jxtmjmsxziowyihktpoq
-- SQL Editor: https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq/sql/new
--
-- APP TABLES (keep these — matches the React app):
--   profiles, guests, wishes, program_schedule, settings, photos
--
-- LEGACY TABLES (remove if present — run DROP-LEGACY-TABLES.sql first):
--   couples, gallery_images, rsvps, timeline_events
--
-- Recommended order on a project that already has all 10 tables:
--   1) DROP-LEGACY-TABLES.sql
--   2) FULL-SETUP.sql (this file)

-- =============================================================================
-- Extensions
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- updated_at helper
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- Tables (canonical column names)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  email text,
  display_name text,
  groom_name text,
  bride_name text,
  wedding_date timestamptz,
  theme text NOT NULL DEFAULT 'gold',
  visual_style text NOT NULL DEFAULT 'classic',
  background_music_url text,
  bank_qr_url text,
  is_super_admin boolean NOT NULL DEFAULT false,
  account_status text NOT NULL DEFAULT 'pending'
    CHECK (account_status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  attendance_status text NOT NULL DEFAULT 'pending'
    CHECK (attendance_status IN ('pending', 'attending', 'not_attending')),
  total_guests integer NOT NULL DEFAULT 1,
  meal_preference text,
  note text,
  phone_number text,
  dietary_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  wish_message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.program_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  event_time text,
  event_title text,
  time_en text,
  time_km text,
  title_en text,
  title_km text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  couple_names text,
  couple_names_km text,
  wedding_date timestamptz,
  venue text,
  venue_maps text,
  hero_image text,
  music_file text,
  music_url text,
  contact_telegram text DEFAULT '',
  contact_phone text DEFAULT '',
  contact_facebook text DEFAULT '',
  contact_email text DEFAULT '',
  gift_enabled boolean NOT NULL DEFAULT true,
  gift_bank_name text,
  gift_account_number text,
  gift_account_name text,
  gift_qr_url text,
  event_title_en text DEFAULT '✦  The Wedding of  ✦',
  event_title_km text DEFAULT 'ពិធីមង្គលការ',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- updated_at triggers
-- =============================================================================
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS guests_updated_at ON public.guests;
CREATE TRIGGER guests_updated_at
  BEFORE UPDATE ON public.guests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS program_schedule_updated_at ON public.program_schedule;
CREATE TRIGGER program_schedule_updated_at
  BEFORE UPDATE ON public.program_schedule
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS settings_updated_at ON public.settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- Public profile RPC (anon-safe slug lookup)
-- =============================================================================
DROP FUNCTION IF EXISTS public.get_public_profile_by_slug(text);

CREATE OR REPLACE FUNCTION public.get_public_profile_by_slug(p_slug text)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  slug text,
  email text,
  display_name text,
  groom_name text,
  bride_name text,
  wedding_date timestamptz,
  theme text,
  visual_style text,
  background_music_url text,
  bank_qr_url text,
  is_super_admin boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.user_id,
    p.slug,
    p.email,
    p.display_name,
    p.groom_name,
    p.bride_name,
    p.wedding_date,
    p.theme,
    p.visual_style,
    p.background_music_url,
    p.bank_qr_url,
    p.is_super_admin
  FROM public.profiles p
  WHERE p.slug = p_slug
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile_by_slug(text) TO anon, authenticated;

-- Optional public view (fallback if RPC unavailable)
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT
  id,
  user_id,
  slug,
  display_name,
  groom_name,
  bride_name,
  wedding_date,
  theme,
  visual_style,
  background_music_url,
  bank_qr_url
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- =============================================================================
-- Super-admin check (SECURITY DEFINER — avoids RLS infinite recursion on profiles)
-- Used only in RLS policies, not from the React app.
-- =============================================================================
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

-- =============================================================================
-- Row Level Security
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_super_admin_select" ON public.profiles;
CREATE POLICY "profiles_super_admin_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.current_user_is_super_admin());

DROP POLICY IF EXISTS "profiles_super_admin_update" ON public.profiles;
CREATE POLICY "profiles_super_admin_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS "profiles_super_admin_delete" ON public.profiles;
CREATE POLICY "profiles_super_admin_delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.current_user_is_super_admin());

-- guests
DROP POLICY IF EXISTS "guests_owner_all" ON public.guests;
CREATE POLICY "guests_owner_all" ON public.guests
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "guests_super_admin_all" ON public.guests;
CREATE POLICY "guests_super_admin_all" ON public.guests
  FOR ALL TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS "guests_anon_insert" ON public.guests;
CREATE POLICY "guests_anon_insert" ON public.guests
  FOR INSERT TO anon
  WITH CHECK (user_id IS NOT NULL);

-- wishes
DROP POLICY IF EXISTS "wishes_owner_all" ON public.wishes;
CREATE POLICY "wishes_owner_all" ON public.wishes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "wishes_super_admin_all" ON public.wishes;
CREATE POLICY "wishes_super_admin_all" ON public.wishes
  FOR ALL TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS "wishes_anon_select" ON public.wishes;
CREATE POLICY "wishes_anon_select" ON public.wishes
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "wishes_anon_insert" ON public.wishes;
CREATE POLICY "wishes_anon_insert" ON public.wishes
  FOR INSERT TO anon
  WITH CHECK (user_id IS NOT NULL);

-- program_schedule
DROP POLICY IF EXISTS "program_owner_all" ON public.program_schedule;
CREATE POLICY "program_owner_all" ON public.program_schedule
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "program_super_admin_all" ON public.program_schedule;
CREATE POLICY "program_super_admin_all" ON public.program_schedule
  FOR ALL TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS "program_anon_select" ON public.program_schedule;
CREATE POLICY "program_anon_select" ON public.program_schedule
  FOR SELECT TO anon
  USING (true);

-- settings
DROP POLICY IF EXISTS "settings_owner_all" ON public.settings;
CREATE POLICY "settings_owner_all" ON public.settings
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "settings_super_admin_all" ON public.settings;
CREATE POLICY "settings_super_admin_all" ON public.settings
  FOR ALL TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS "settings_anon_select" ON public.settings;
CREATE POLICY "settings_anon_select" ON public.settings
  FOR SELECT TO anon
  USING (true);

-- photos
DROP POLICY IF EXISTS "photos_owner_all" ON public.photos;
CREATE POLICY "photos_owner_all" ON public.photos
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "photos_super_admin_all" ON public.photos;
CREATE POLICY "photos_super_admin_all" ON public.photos
  FOR ALL TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS "photos_anon_select" ON public.photos;
CREATE POLICY "photos_anon_select" ON public.photos
  FOR SELECT TO anon
  USING (true);

-- =============================================================================
-- Grants
-- =============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles_public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guests TO authenticated;
GRANT INSERT ON public.guests TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishes TO authenticated;
GRANT SELECT, INSERT ON public.wishes TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_schedule TO authenticated;
GRANT SELECT ON public.program_schedule TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT SELECT ON public.settings TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.photos TO authenticated;
GRANT SELECT ON public.photos TO anon;

-- =============================================================================
-- OPTIONAL: wipe all data (uncomment only if you intend to reset)
-- =============================================================================
-- TRUNCATE public.photos, public.program_schedule, public.wishes, public.guests, public.settings, public.profiles CASCADE;

-- =============================================================================
-- OPTIONAL: mark super admin by email (after they sign up once)
-- =============================================================================
-- UPDATE public.profiles SET is_super_admin = true
-- WHERE email ILIKE 'phatsopheakdey08@gmail.com';

NOTIFY pgrst, 'reload schema';
