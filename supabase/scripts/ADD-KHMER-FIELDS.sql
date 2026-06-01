-- ADD-KHMER-FIELDS.sql
-- Run this in the Supabase SQL Editor to add missing Khmer-language columns to the settings table.
-- Project: jxtmjmsxziowyihktpoq
-- SQL Editor: https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq/sql/new

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS wedding_date_km   text,
  ADD COLUMN IF NOT EXISTS wedding_time      text,
  ADD COLUMN IF NOT EXISTS wedding_time_km   text,
  ADD COLUMN IF NOT EXISTS venue_km          text,
  ADD COLUMN IF NOT EXISTS wedding_description    text,
  ADD COLUMN IF NOT EXISTS wedding_description_km text;

NOTIFY pgrst, 'reload schema';
