-- Add appearance columns and create fonts bucket (idempotent)
BEGIN;

-- Add new appearance columns to settings
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS layout_template text DEFAULT 'classic-scroll';

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS font_pair text DEFAULT 'elegant-serif';

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS animation_style text DEFAULT 'elegant';

-- Create fonts storage bucket if not exists
-- Supabase storage tables are in the storage schema
INSERT INTO storage.buckets (id, name, public)
VALUES ('fonts', 'fonts', true)
ON CONFLICT (id) DO NOTHING;

-- Try to create a simple policy to allow public reads on storage.objects for fonts bucket
-- If the storage schema or policy creation is not available in this environment, ignore the error
DO $$
BEGIN
  CREATE POLICY public_font_access ON storage.objects
    FOR SELECT USING (bucket_id = 'fonts');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create storage policy for fonts bucket: %', SQLERRM;
END$$;

COMMIT;
