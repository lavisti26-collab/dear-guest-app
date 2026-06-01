-- Dear Guest — Add Contact Fields to Settings
-- Run this in Supabase SQL Editor after FULL-SETUP.sql
-- https://supabase.com/dashboard/project/jxtmjmsxziowyihktpoq/sql/new

-- =============================================================================
-- Add Contact Fields to Settings Table
-- =============================================================================

-- Add contact columns if they don't exist
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS contact_telegram text DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_phone text DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_facebook text DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_email text DEFAULT '';

-- =============================================================================
-- Verify Fields Were Added
-- =============================================================================

-- Check that all contact columns exist in settings table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'settings'
  AND column_name LIKE 'contact_%';
