-- Add image_url column to categories and subcategories tables
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.subcategories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update comments
COMMENT ON COLUMN public.categories.image_url IS 'URL of the cover image for the profession (category)';
COMMENT ON COLUMN public.subcategories.image_url IS 'URL of the cover image for the block (subcategory)';
