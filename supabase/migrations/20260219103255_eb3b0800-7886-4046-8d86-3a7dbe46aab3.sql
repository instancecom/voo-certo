
-- Add model_url column to insignias for PNG badge templates
ALTER TABLE public.insignias ADD COLUMN IF NOT EXISTS model_url text DEFAULT NULL;

-- Create a table for badge proof cleanup scheduling
CREATE TABLE IF NOT EXISTS public.badge_proof_cleanup_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id uuid NOT NULL,
  file_path text NOT NULL,
  file_deleted_at timestamp with time zone,
  doc_accepted boolean DEFAULT false,
  acceptance_date timestamp with time zone,
  user_name text,
  codigo_id text,
  historico_resumido text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.badge_proof_cleanup_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage cleanup log"
ON public.badge_proof_cleanup_log
FOR ALL
USING (is_admin(auth.uid()));

-- Add ai_question_count to track IA usage per user
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_questions_count integer NOT NULL DEFAULT 0;

-- Create plan_type column on profiles for subscription tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_expires_at timestamp with time zone DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id text DEFAULT NULL;
