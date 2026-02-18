
-- Fix: Restrict AI cache insert to authenticated users only
DROP POLICY IF EXISTS "Service can insert ai cache" ON public.ai_question_cache;

CREATE POLICY "Authenticated users can insert ai cache"
  ON public.ai_question_cache FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
