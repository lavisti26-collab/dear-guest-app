-- Editable hero event title (wedding, engagement, etc.)
-- Run once in Supabase SQL Editor

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS event_title_en text DEFAULT '✦  The Wedding of  ✦';

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS event_title_km text DEFAULT 'ពិធីមង្គលការ';
