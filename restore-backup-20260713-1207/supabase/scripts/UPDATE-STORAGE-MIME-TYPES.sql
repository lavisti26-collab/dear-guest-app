-- Dear Guest — Update Storage Bucket MIME Types
-- Run this to fix existing buckets that don't have MIME types set
-- This fixes: "mime type audio/x-m4a is not supported" errors

-- Update 'photos' bucket with allowed MIME types
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  file_size_limit = 52428800 -- 50MB
WHERE id = 'photos';

-- Update 'music' bucket with allowed MIME types (includes m4a, mp4, aac support)
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a', 'audio/aac'],
  file_size_limit = 104857600 -- 100MB
WHERE id = 'music';

-- Verify the updates
SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id IN ('photos', 'music');
