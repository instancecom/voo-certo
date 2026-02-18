
-- Tabela de microcursos
CREATE TABLE IF NOT EXISTS public.microcourses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'geral',
  tags TEXT[] DEFAULT '{}',
  duration_minutes INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.microcourses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active microcourses"
  ON public.microcourses FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage microcourses"
  ON public.microcourses FOR ALL
  USING (is_admin(auth.uid()));

-- Tabela de progresso em microcursos
CREATE TABLE IF NOT EXISTS public.microcourse_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  microcourse_id UUID NOT NULL REFERENCES public.microcourses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, microcourse_id)
);

ALTER TABLE public.microcourse_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their microcourse progress"
  ON public.microcourse_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their microcourse progress"
  ON public.microcourse_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their microcourse progress"
  ON public.microcourse_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Tabela de dados de currículo
CREATE TABLE IF NOT EXISTS public.curriculum_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  profession TEXT,
  summary TEXT,
  experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  certificates JSONB DEFAULT '[]',
  languages JSONB DEFAULT '[]',
  skills TEXT[] DEFAULT '{}',
  photo_url TEXT,
  template TEXT DEFAULT 'aviation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.curriculum_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their curriculum"
  ON public.curriculum_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their curriculum"
  ON public.curriculum_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their curriculum"
  ON public.curriculum_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Tabela de cache de respostas de IA
CREATE TABLE IF NOT EXISTS public.ai_question_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id TEXT NOT NULL,
  question_hash TEXT NOT NULL,
  user_question TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  UNIQUE(question_id, question_hash)
);

ALTER TABLE public.ai_question_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ai cache"
  ON public.ai_question_cache FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Service can insert ai cache"
  ON public.ai_question_cache FOR INSERT
  WITH CHECK (true);

-- Tabela de log de áudios
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS audio_storage_path TEXT;

-- Bucket de áudio (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-audio', 'question-audio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view question audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'question-audio');

CREATE POLICY "Admins can upload question audio"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'question-audio' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete question audio"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'question-audio' AND is_admin(auth.uid()));

-- Trigger updated_at para novas tabelas
CREATE TRIGGER update_microcourses_updated_at
  BEFORE UPDATE ON public.microcourses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_curriculum_updated_at
  BEFORE UPDATE ON public.curriculum_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
