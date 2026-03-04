ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS duration text NOT NULL DEFAULT 'once',
ADD COLUMN IF NOT EXISTS duration_in_months integer;