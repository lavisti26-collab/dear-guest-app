-- Dear Guest — Combined Supabase setup
-- Run this once in Supabase SQL Editor for project jxtmjmsxziowyihktpoq.
-- This file creates the app tables, helper functions, RLS, public RPC/view, access requests, and storage buckets.
--
-- If your project still has old tables, run DROP-LEGACY-TABLES.sql first.
-- SQL Editor: https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq/sql/new

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Profiles
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
  account_status text NOT NULL DEFAULT 'pending' CHECK (account_status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS valid_account_status;
ALTER TABLE public.profiles
  ADD CONSTRAINT valid_account_status CHECK (
    account_status IN ('pending', 'approved', 'rejected')
  );

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS valid_visual_style;
ALTER TABLE public.profiles
  ADD CONSTRAINT valid_visual_style CHECK (
    visual_style IN (
      'classic',
      'minimalist',
      'glassmorphism',
      'neo-brutalism',
      'romantic',
      'editorial',
      'elegant'
    )
  );

-- Guests
CREATE TABLE IF NOT EXISTS public.guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  attendance_status text NOT NULL DEFAULT 'pending' CHECK (attendance_status IN ('pending', 'attending', 'not_attending')),
  total_guests integer NOT NULL DEFAULT 1,
  meal_preference text,
  note text,
  phone_number text,
  dietary_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Wishes
CREATE TABLE IF NOT EXISTS public.wishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  wish_message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Program schedule
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

-- Settings
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  couple_names text,
  couple_names_km text,
  wedding_date timestamptz,
  wedding_date_km text,
  wedding_time text,
  wedding_time_km text,
  venue text,
  venue_km text,
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
  wedding_description text,
  wedding_description_km text,
  event_title_en text DEFAULT '✦  The Wedding of  ✦',
  event_title_km text DEFAULT 'ពិធីមង្គលការ',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Photos
CREATE TABLE IF NOT EXISTS public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Access requests
CREATE TABLE IF NOT EXISTS public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  requested_level text NOT NULL DEFAULT 'admin' CHECK (requested_level IN ('admin', 'staff')),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  reviewed_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at triggers
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

DROP TRIGGER IF EXISTS photos_updated_at ON public.photos;
CREATE TRIGGER photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS access_requests_updated_at ON public.access_requests;
CREATE TRIGGER access_requests_updated_at
  BEFORE UPDATE ON public.access_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public profile RPC + view
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

-- Super-admin helper
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

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS profiles_super_admin_select ON public.profiles;
CREATE POLICY profiles_super_admin_select ON public.profiles
  FOR SELECT TO authenticated
  USING (public.current_user_is_super_admin());

DROP POLICY IF EXISTS profiles_super_admin_update ON public.profiles;
CREATE POLICY profiles_super_admin_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS profiles_super_admin_delete ON public.profiles;
CREATE POLICY profiles_super_admin_delete ON public.profiles
  FOR DELETE TO authenticated
  USING (public.current_user_is_super_admin());

DROP POLICY IF EXISTS guests_owner_all ON public.guests;
CREATE POLICY guests_owner_all ON public.guests
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS guests_super_admin_all ON public.guests;
CREATE POLICY guests_super_admin_all ON public.guests
  FOR ALL TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS guests_anon_insert ON public.guests;
CREATE POLICY guests_anon_insert ON public.guests
  FOR INSERT TO anon
  WITH CHECK (user_id IS NOT NULL);

DROP POLICY IF EXISTS wishes_owner_all ON public.wishes;
CREATE POLICY wishes_owner_all ON public.wishes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS wishes_super_admin_all ON public.wishes;
CREATE POLICY wishes_super_admin_all ON public.wishes
  FOR ALL TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS wishes_anon_select ON public.wishes;
CREATE POLICY wishes_anon_select ON public.wishes
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS wishes_anon_insert ON public.wishes;
CREATE POLICY wishes_anon_insert ON public.wishes
  FOR INSERT TO anon
  WITH CHECK (user_id IS NOT NULL);

DROP POLICY IF EXISTS program_owner_all ON public.program_schedule;
CREATE POLICY program_owner_all ON public.program_schedule
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS program_super_admin_all ON public.program_schedule;
CREATE POLICY program_super_admin_all ON public.program_schedule
  FOR ALL TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS program_anon_select ON public.program_schedule;
CREATE POLICY program_anon_select ON public.program_schedule
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS settings_owner_all ON public.settings;
CREATE POLICY settings_owner_all ON public.settings
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS settings_super_admin_all ON public.settings;
CREATE POLICY settings_super_admin_all ON public.settings
  FOR ALL TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS settings_anon_select ON public.settings;
CREATE POLICY settings_anon_select ON public.settings
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS photos_owner_all ON public.photos;
CREATE POLICY photos_owner_all ON public.photos
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS photos_super_admin_all ON public.photos;
CREATE POLICY photos_super_admin_all ON public.photos
  FOR ALL TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS photos_anon_select ON public.photos;
CREATE POLICY photos_anon_select ON public.photos
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS access_requests_anon_insert ON public.access_requests;
CREATE POLICY access_requests_anon_insert ON public.access_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS access_requests_auth_select ON public.access_requests;
CREATE POLICY access_requests_auth_select ON public.access_requests
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS access_requests_super_admin_all ON public.access_requests;
CREATE POLICY access_requests_super_admin_all ON public.access_requests
  FOR ALL TO authenticated
  USING (public.current_user_is_super_admin())
  WITH CHECK (public.current_user_is_super_admin());

DROP POLICY IF EXISTS access_requests_auth_update ON public.access_requests;
CREATE POLICY access_requests_auth_update ON public.access_requests
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (status IN ('approved', 'declined'));

-- Grants
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
GRANT SELECT, INSERT, UPDATE ON public.access_requests TO authenticated;
GRANT SELECT, INSERT ON public.access_requests TO anon;

-- Optional storage bucket creation and MIME fix
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('photos', 'photos', true, true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('music', 'music', true, false, 104857600, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a', 'audio/aac'])
ON CONFLICT (id) DO NOTHING;

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'], file_size_limit = 52428800
WHERE id = 'photos';

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a', 'audio/aac'], file_size_limit = 104857600
WHERE id = 'music';
