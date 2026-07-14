-- Dear Guest — Storage Buckets Setup
-- Run this in Supabase SQL Editor AFTER FULL-SETUP.sql
-- https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq/sql/new

-- =============================================================================
-- Create Storage Buckets
-- =============================================================================

-- Create 'photos' bucket for wedding gallery photos
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Create 'music' bucket for background music
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'music',
  'music',
  true,
  false,
  104857600, -- 100MB
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a', 'audio/aac']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Storage RLS Policies (allow public reads, authenticated writes)
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read music" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to music" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own music" ON storage.objects;

-- Photos bucket policies
CREATE POLICY "Public read photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload to photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete own photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Music bucket policies
CREATE POLICY "Public read music"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'music');

CREATE POLICY "Authenticated users can upload to music"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'music' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete own music"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'music' AND auth.role() = 'authenticated');

-- =============================================================================
-- Verify Setup
-- =============================================================================

-- Check buckets were created
SELECT id, name, public FROM storage.buckets WHERE id IN ('photos', 'music');
