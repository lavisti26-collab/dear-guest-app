-- Sync visual layout style from Admin → Guest invite link
-- Run once in Supabase SQL Editor (safe to re-run)

-- 1) Column on profiles (couple's saved layout style)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS visual_style text NOT NULL DEFAULT 'classic';

-- 2) Allow all current app layout style ids (drop old constraint if present)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_visual_style;
ALTER TABLE public.profiles ADD CONSTRAINT valid_visual_style CHECK (
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

-- Migrate legacy value
UPDATE public.profiles SET visual_style = 'minimalist' WHERE visual_style = 'minimal';

-- 3) Public RPC — expose visual_style to anon invite pages
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

-- 4) Public view fallback
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
