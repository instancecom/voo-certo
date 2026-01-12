-- Add new columns to categories (will act as professions)
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS total_time integer DEFAULT 240,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Add new columns to subcategories (will act as blocks)
ALTER TABLE public.subcategories 
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_limit integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS num_questions_expected integer DEFAULT 20;

-- Update existing categories with default values
UPDATE public.categories SET total_time = 240 WHERE total_time IS NULL;
UPDATE public.subcategories SET display_order = 0 WHERE display_order IS NULL;
UPDATE public.subcategories SET time_limit = 30 WHERE time_limit IS NULL;

-- Create an index for ordering
CREATE INDEX IF NOT EXISTS idx_subcategories_order ON public.subcategories(category_id, display_order);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(display_order);