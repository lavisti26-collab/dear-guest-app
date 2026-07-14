ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS sticker_overlays jsonb DEFAULT NULL;
