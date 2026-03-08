CREATE OR REPLACE FUNCTION public.increment_ai_questions(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE profiles
  SET ai_questions_count = ai_questions_count + 1,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;