-- Add theme_typography column to profiles table to store custom typography preferences
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS theme_typography TEXT DEFAULT NULL;
