
-- Allow service role to delete expired cache entries
CREATE POLICY "Service can delete expired cache"
ON public.ai_question_cache
FOR DELETE
USING (expires_at < now());
