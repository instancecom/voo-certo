-- Add category column to career_guides table
ALTER TABLE public.career_guides ADD COLUMN IF NOT EXISTS category text DEFAULT 'geral' NOT NULL;
