
-- Table: coupons (tracks Stripe coupons/promotion codes locally)
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percent' CHECK (type IN ('percent', 'fixed')),
  value NUMERIC NOT NULL,
  plan_id TEXT DEFAULT NULL,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  max_uses INTEGER DEFAULT NULL,
  max_uses_per_user INTEGER DEFAULT 1,
  uses_count INTEGER NOT NULL DEFAULT 0,
  min_amount NUMERIC DEFAULT NULL,
  stripe_coupon_id TEXT DEFAULT NULL,
  stripe_promotion_code_id TEXT DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Admins can manage coupons
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (public.is_admin(auth.uid()));

-- Anyone authenticated can read active coupons (for validation)
CREATE POLICY "Authenticated users can view active coupons" ON public.coupons
  FOR SELECT TO authenticated USING (is_active = true);

-- Table: coupon_uses (tracks per-user usage)
CREATE TABLE public.coupon_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);

ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupon uses" ON public.coupon_uses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coupon uses" ON public.coupon_uses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all coupon uses" ON public.coupon_uses
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Trigger for updated_at on coupons
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
