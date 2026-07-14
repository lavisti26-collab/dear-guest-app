-- Remove legacy Lovable tables NOT used by the Dear Guest app.
-- Safe to run on project: jxtmjmsxziowyihktpoq
-- https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq/sql/new
--
-- The app only uses:
--   profiles, guests, wishes, program_schedule, settings, photos
--
-- These four tables duplicate that data and are dropped here:
--   couples          → use profiles + settings instead
--   gallery_images   → use photos instead
--   rsvps            → use guests (attendance_status) instead
--   timeline_events  → use program_schedule instead

DROP TABLE IF EXISTS public.gallery_images CASCADE;
DROP TABLE IF EXISTS public.timeline_events CASCADE;
DROP TABLE IF EXISTS public.rsvps CASCADE;
DROP TABLE IF EXISTS public.couples CASCADE;

NOTIFY pgrst, 'reload schema';
