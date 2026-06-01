-- Add visual_style column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS visual_style text NOT NULL DEFAULT 'classic';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_visual_style;
ALTER TABLE public.profiles ADD CONSTRAINT valid_visual_style CHECK (
  visual_style IN (
    'classic',
    'minimalist',
    'cyberpunk',
    'glassmorphism',
    'neo-brutalism',
    'romantic',
    'elegant'
  )
);

UPDATE public.profiles SET visual_style = 'minimalist' WHERE visual_style = 'minimal';
