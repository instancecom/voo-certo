
-- AI USAGE TRACKING PER QUESTION
-- Rastreador de quantas vezes um usuário interagiu com a IA em uma questão específica.

CREATE TABLE IF NOT EXISTS public.ai_question_usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  usage_count integer NOT NULL DEFAULT 0,
  last_usage_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Habilitar RLS
ALTER TABLE public.ai_question_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can only view their own AI usage"
  ON public.ai_question_usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Função (RPC) para obter o uso atual de uma questão para um usuário
CREATE OR REPLACE FUNCTION public.get_ai_usage_for_question(p_user_id uuid, p_question_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT usage_count INTO v_count
  FROM ai_question_usage_tracking
  WHERE user_id = p_user_id AND question_id = p_question_id;
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- Função (RPC) para incrementar o uso de uma questão para um usuário
CREATE OR REPLACE FUNCTION public.increment_ai_usage_for_question(p_user_id uuid, p_question_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_count integer;
BEGIN
  INSERT INTO ai_question_usage_tracking (user_id, question_id, usage_count, last_usage_at)
  VALUES (p_user_id, p_question_id, 1, now())
  ON CONFLICT (user_id, question_id)
  DO UPDATE SET 
    usage_count = ai_question_usage_tracking.usage_count + 1,
    last_usage_at = now()
  RETURNING usage_count INTO v_new_count;
  
  RETURN v_new_count;
END;
$$;

-- Nota: Como o sistema é por questão, não precisamos de um reset diário específico para esta tabela.
-- No entanto, vamos manter a ai_questions_count no perfil global (limite diário de teto de segurança).
