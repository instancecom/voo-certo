-- Create table for badge verification requests
CREATE TABLE public.badge_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insignia_id UUID REFERENCES public.insignias(id) ON DELETE CASCADE,
  proof_type TEXT NOT NULL CHECK (proof_type IN ('file', 'code')),
  proof_url TEXT,
  anac_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approval_id TEXT UNIQUE,
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS
ALTER TABLE public.badge_verifications ENABLE ROW LEVEL SECURITY;

-- Users can submit their own verifications
CREATE POLICY "Users can submit verifications"
ON public.badge_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own verifications
CREATE POLICY "Users can view own verifications"
ON public.badge_verifications
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all verifications
CREATE POLICY "Admins can view all verifications"
ON public.badge_verifications
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can update verifications
CREATE POLICY "Admins can update verifications"
ON public.badge_verifications
FOR UPDATE
USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_badge_verifications_user ON public.badge_verifications(user_id);
CREATE INDEX idx_badge_verifications_status ON public.badge_verifications(status);

-- Create storage bucket for proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('badge-proofs', 'badge-proofs', false);

-- Storage policies
CREATE POLICY "Users can upload proofs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'badge-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own proofs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'badge-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all proofs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'badge-proofs' AND is_admin(auth.uid()));

-- Insert special ANAC approval badge
INSERT INTO public.insignias (name, description, icon, rarity, condition_type, condition_value, display_order, is_active)
VALUES (
  'Aprovado ANAC',
  'Conquistou aprovação oficial na banca da ANAC. Certificado verificado pela equipe Voo Certo.',
  'Award',
  'platinum',
  'anac_approval',
  1,
  100,
  true
) ON CONFLICT DO NOTHING;