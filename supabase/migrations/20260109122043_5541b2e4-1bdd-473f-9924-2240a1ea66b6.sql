-- Add active_modes column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS active_modes text[] DEFAULT ARRAY['livre']::text[];

-- Add comment for clarity
COMMENT ON COLUMN public.categories.active_modes IS 'Available exam modes for this category: banca_anac, livre';

-- Update existing categories to have both modes
UPDATE public.categories SET active_modes = ARRAY['banca_anac', 'livre']::text[] WHERE active_modes IS NULL OR active_modes = '{}';
