-- CONSOLIDATED MIGRATION V2 WITH FIXES

-- FORCE COLUMNS FOR POLICIES
DO $$
BEGIN
  -- Fix questions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'questions' AND column_name = 'is_premium') THEN
    -- We can't alter a table that doesn't exist yet, so we will do this after the tables are created or use a robust script.
  END IF;
END $$;

-- FILE: 20260106104536_f90bb5bf-8082-4ac1-be87-5c5c17d9ce46.sql
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'premium', 'admin');

-- Create enum for difficulty levels
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create subcategories table
CREATE TABLE public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (category_id, slug)
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  audio_url TEXT,
  image_url TEXT,
  difficulty difficulty_level DEFAULT 'medium',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE CASCADE NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  question_count INTEGER NOT NULL DEFAULT 10,
  random_order BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  icon TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create exam_questions junction table
CREATE TABLE public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER,
  UNIQUE (exam_id, question_id)
);

-- Create exam_results table
CREATE TABLE public.exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_spent INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Security definer function to check admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- User roles policies (only admins can manage)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin(auth.uid()));

-- Subcategories policies (public read, admin write)
CREATE POLICY "Anyone can view subcategories"
  ON public.subcategories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage subcategories"
  ON public.subcategories FOR ALL
  USING (public.is_admin(auth.uid()));

-- Questions policies (public read, admin write)
CREATE POLICY "Anyone can view questions"
  ON public.questions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage questions"
  ON public.questions FOR ALL
  USING (public.is_admin(auth.uid()));

-- Exams policies (public read active, admin write)
CREATE POLICY "Anyone can view active exams"
  ON public.exams FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage exams"
  ON public.exams FOR ALL
  USING (public.is_admin(auth.uid()));

-- Exam questions policies
CREATE POLICY "Anyone can view exam questions"
  ON public.exam_questions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage exam questions"
  ON public.exam_questions FOR ALL
  USING (public.is_admin(auth.uid()));

-- Exam results policies (users own data only)
CREATE POLICY "Users can view their own results"
  ON public.exam_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results"
  ON public.exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all results"
  ON public.exam_results FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- If this is the admin email, also assign admin role
  IF NEW.email = 'instance.com@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial ANAC category and subcategories
INSERT INTO public.categories (name, slug, description, icon) VALUES
  ('ANAC', 'anac', 'Simulados para concurso de Comissário de Bordo', 'Plane');

INSERT INTO public.subcategories (category_id, name, slug, description, icon)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.description,
  sub.icon
FROM public.categories c
CROSS JOIN (
  VALUES 
    ('Inglês', 'ingles', 'Compreensão auditiva e vocabulário aeronáutico', 'Languages'),
    ('Espanhol', 'espanhol', 'Comunicação em espanhol para aviação', 'MessageCircle'),
    ('Conhecimentos Técnicos', 'tecnicos', 'RBAC, segurança de voo e procedimentos', 'BookOpen'),
    ('SHL Psicotécnico', 'shl', 'Raciocínio lógico, numérico e verbal', 'Brain'),
    ('Fit Cultural', 'fit-cultural', 'Situações hipotéticas e personalidade', 'Users')
) AS sub(name, slug, description, icon)
WHERE c.slug = 'anac';

-- FIX: Add missing columns required by later policies
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- FILE: 20260106104640_4afad7b2-1a85-4854-8cef-9725f2412773.sql
-- Fix security warning: Add search_path to update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- FILE: 20260108111909_813cc04d-d0f2-4c53-a36f-2da23712794c.sql
-- Add block_number to questions for ANAC exam blocks (1-4)
ALTER TABLE public.questions 
ADD COLUMN block_number integer DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.questions.block_number IS 'Block number for ANAC exam format (1-4): 1=Regulamentação, 2=Segurança, 3=Conhecimentos Técnicos, 4=CRM/Fatores Humanos';

-- Create index for block filtering
CREATE INDEX idx_questions_block_number ON public.questions(block_number);

-- Add exam_mode type for tracking mode in results
ALTER TABLE public.exam_results 
ADD COLUMN exam_mode text DEFAULT 'standard',
ADD COLUMN block_results jsonb DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN public.exam_results.exam_mode IS 'Exam mode: standard, banca_anac, livre';
COMMENT ON COLUMN public.exam_results.block_results IS 'Results per block for ANAC mode';

-- FILE: 20260109122043_5541b2e4-1bdd-473f-9924-2240a1ea66b6.sql
-- Add active_modes column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS active_modes text[] DEFAULT ARRAY['livre']::text[];

-- Add comment for clarity
COMMENT ON COLUMN public.categories.active_modes IS 'Available exam modes for this category: banca_anac, livre';

-- Update existing categories to have both modes
UPDATE public.categories SET active_modes = ARRAY['banca_anac', 'livre']::text[] WHERE active_modes IS NULL OR active_modes = '{}';


-- FILE: 20260112114919_e92d34aa-9385-4cd2-ab27-9bd6952afcfb.sql
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

-- FILE: 20260113124109_fd368c9d-9f2b-4d99-ac3c-18457d07e919.sql
-- Create enum for badge rarity
CREATE TYPE badge_rarity AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- Create insignias table
CREATE TABLE public.insignias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Award',
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL DEFAULT 1,
  rarity badge_rarity NOT NULL DEFAULT 'bronze',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_insignias table
CREATE TABLE public.user_insignias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insignia_id UUID NOT NULL REFERENCES public.insignias(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, insignia_id)
);

-- Enable RLS
ALTER TABLE public.insignias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_insignias ENABLE ROW LEVEL SECURITY;

-- RLS policies for insignias
CREATE POLICY "Anyone can view active insignias" ON public.insignias
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage insignias" ON public.insignias
  FOR ALL USING (is_admin(auth.uid()));

-- RLS policies for user_insignias
CREATE POLICY "Users can view their own insignias" ON public.user_insignias
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can earn insignias" ON public.user_insignias
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all user insignias" ON public.user_insignias
  FOR SELECT USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_insignias_rarity ON public.insignias(rarity);
CREATE INDEX idx_insignias_condition ON public.insignias(condition_type);
CREATE INDEX idx_user_insignias_user ON public.user_insignias(user_id);
CREATE INDEX idx_user_insignias_insignia ON public.user_insignias(insignia_id);

-- Update trigger for insignias
CREATE TRIGGER update_insignias_updated_at
  BEFORE UPDATE ON public.insignias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert all 50 badges
INSERT INTO public.insignias (name, description, icon, condition_type, condition_value, rarity, display_order) VALUES
-- Bronze (10)
('Primeiro Voo', 'Primeiro simulado concluído', 'Plane', 'first_exam_completed', 1, 'bronze', 1),
('Decolagem', '10 questões acertadas', 'TrendingUp', 'correct_answers', 10, 'bronze', 2),
('Turbulência Superada', '5 questões de Segurança acertadas seguidas', 'Shield', 'security_streak', 5, 'bronze', 3),
('Cinto Afivelado', '3 dias seguidos treinando', 'CalendarCheck', 'training_streak', 3, 'bronze', 4),
('Asa Delta', '20% em um simulado Livre', 'Wind', 'free_exam_score', 20, 'bronze', 5),
('Navegante Básico', 'Completou 1 bloco inteiro', 'Compass', 'blocks_completed', 1, 'bronze', 6),
('Rádio Ligado', '5 questões de Inglês acertadas', 'Radio', 'english_correct', 5, 'bronze', 7),
('Emergência Controlada', '80% em um bloco de Segurança', 'AlertTriangle', 'security_block_score', 80, 'bronze', 8),
('Check-in Feito', 'Primeiro login após cadastro', 'LogIn', 'first_login', 1, 'bronze', 9),
('Tripulante Novato', '50 questões respondidas', 'HelpCircle', 'questions_answered', 50, 'bronze', 10),

-- Silver (15)
('Asa Prateada', '50% médio em 10 simulados', 'Star', 'avg_score_exams', 50, 'silver', 11),
('Mestre do Rádio', '50 questões de Inglês acertadas', 'Headphones', 'english_correct', 50, 'silver', 12),
('Turbulência Mestre', '90% em Segurança', 'ShieldCheck', 'security_score', 90, 'silver', 13),
('7 Dias no Ar', '7 dias seguidos treinando', 'Calendar', 'training_streak', 7, 'silver', 14),
('Aprovado na Banca', '1 aprovação em Banca ANAC', 'CheckCircle', 'anac_approvals', 1, 'silver', 15),
('Colecionador de Blocos', 'Completou todos os blocos de 1 profissão', 'Layers', 'profession_complete', 1, 'silver', 16),
('Piloto de Cabine', '100 questões respondidas', 'Users', 'questions_answered', 100, 'silver', 17),
('Estrela em Ascensão', 'Média 70% em 5 simulados seguidos', 'Sparkles', 'consecutive_score', 70, 'silver', 18),
('Sobrevivente de Emergência', '100% em um bloco de emergência', 'Flame', 'emergency_block_perfect', 1, 'silver', 19),
('Comunicador Nato', '90% em Inglês', 'MessageCircle', 'english_score', 90, 'silver', 20),
('30 Dias no Céu', '30 dias com treino', 'CloudSun', 'training_days', 30, 'silver', 21),
('Conquistador de Blocos', '10 blocos completados', 'Package', 'blocks_completed', 10, 'silver', 22),
('Aprovado 3x', '3 aprovações em Banca ANAC', 'Award', 'anac_approvals', 3, 'silver', 23),
('Mestre da Calma', '80% em questões comportamentais', 'Heart', 'behavioral_score', 80, 'silver', 24),
('Tripulante Prata', '500 questões respondidas', 'User', 'questions_answered', 500, 'silver', 25),

-- Gold (15)
('Asa de Ouro', 'Média 85% em 20 simulados', 'Crown', 'avg_score_exams_20', 85, 'gold', 26),
('Comandante de Cabine', '5 aprovações em Banca ANAC', 'BadgeCheck', 'anac_approvals', 5, 'gold', 27),
('100 Dias no Ar', '100 dias com treino', 'Sunrise', 'training_days', 100, 'gold', 28),
('Mestre Geral', '90% em todos os blocos de 1 profissão', 'GraduationCap', 'profession_mastery', 90, 'gold', 29),
('Poliglota Aeronáutico', '90% em Inglês + Espanhol', 'Globe', 'multilingual_score', 90, 'gold', 30),
('Sobrevivente Supremo', '100% em Segurança', 'ShieldAlert', 'security_perfect', 100, 'gold', 31),
('1000 Questões', '1000 questões respondidas', 'Database', 'questions_answered', 1000, 'gold', 32),
('Aprovado 10x', '10 aprovações em Banca ANAC', 'Medal', 'anac_approvals', 10, 'gold', 33),
('Lenda da Entrevista', 'Completou 10 simulados comportamentais', 'Mic', 'behavioral_exams', 10, 'gold', 34),
('Treinador Épico', '30 dias seguidos treinando', 'Zap', 'training_streak', 30, 'gold', 35),
('Colecionador Supremo', 'Completou 50 blocos', 'FolderCheck', 'blocks_completed', 50, 'gold', 36),
('Estrela do Céu', 'Média 90% em 10 simulados', 'Sparkle', 'avg_score_exams_10', 90, 'gold', 37),
('Mestre da Pressão', '90% em questões de estresse', 'Gauge', 'stress_score', 90, 'gold', 38),
('Piloto de Elite', '90% em todos os modos', 'PlaneTakeoff', 'all_modes_score', 90, 'gold', 39),
('Capitão de Conquistas', '40 insígnias conquistadas', 'Trophy', 'badges_earned', 40, 'gold', 40),

-- Platinum (10)
('Lenda da ANAC', 'Aprovado 20 vezes em Banca ANAC', 'Building', 'anac_approvals', 20, 'platinum', 41),
('Asa Imortal', 'Média 95% em 30 simulados', 'Feather', 'avg_score_exams_30', 95, 'platinum', 42),
('365 Dias no Ar', '1 ano treinando', 'CalendarDays', 'training_days', 365, 'platinum', 43),
('Mestre Absoluto', '100% em todos os blocos de 1 profissão', 'Gem', 'profession_perfect', 100, 'platinum', 44),
('Poliglota Supremo', '100% em Inglês + Espanhol', 'Languages', 'multilingual_perfect', 100, 'platinum', 45),
('5000 Questões', '5000 questões respondidas', 'Infinity', 'questions_answered', 5000, 'platinum', 46),
('Conquistador de Companhias', 'Completou simulados de 5 companhias', 'Building2', 'companies_completed', 5, 'platinum', 47),
('Lenda Viva', 'Todas as insígnias anteriores + extras', 'Rocket', 'badges_earned', 49, 'platinum', 48),
('Comandante Lendário', '50 aprovações em Banca ANAC', 'CircleDot', 'anac_approvals', 50, 'platinum', 49),
('Voo Eterno', '1000 dias com treino', 'Sun', 'training_days', 1000, 'platinum', 50);

-- FILE: 20260114124928_4b35e7d5-013e-4342-a70f-0c7c58bb302f.sql
-- Create table for career guide steps with associated simulados
CREATE TABLE public.guia_etapas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_number INTEGER NOT NULL UNIQUE,
  emoji TEXT NOT NULL DEFAULT '📌',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '[]'::jsonb,
  tips JSONB NOT NULL DEFAULT '[]'::jsonb,
  simulado_ids JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guia_etapas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active guide steps"
ON public.guia_etapas
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage guide steps"
ON public.guia_etapas
FOR ALL
USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_guia_etapas_updated_at
BEFORE UPDATE ON public.guia_etapas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default 8 steps
INSERT INTO public.guia_etapas (step_number, emoji, title, description, details, tips, display_order) VALUES
(1, '📚', 'Curso Teórico Homologado pela ANAC', 
 'O primeiro passo é realizar um curso de formação de comissário de voo em uma escola homologada pela ANAC.',
 '["Carga horária mínima: 150 horas teóricas", "Disciplinas: Regulamentação, Segurança de Voo, Primeiros Socorros, Sobrevivência, CRM", "Ao final, você receberá o Certificado de Conclusão do Curso (CCC)", "O curso prepara para a prova da ANAC e para a rotina a bordo"]'::jsonb,
 '["Escolha uma escola reconhecida e com boas avaliações", "Aproveite o curso para fazer networking com futuros colegas", "Comece a estudar inglês desde já - será essencial!"]'::jsonb,
 1),
(2, '🩺', 'Exame Médico CMA (Certificado Médico Aeronáutico)',
 'Você precisará passar por uma avaliação médica rigorosa para obter o CMA Classe 2 ou 3.',
 '["Exame realizado por médicos credenciados pela ANAC", "Avalia: visão, audição, sistema cardiovascular, neurológico e psicológico", "Validade: 1 a 5 anos dependendo da idade", "Sem o CMA, não é possível exercer a função a bordo"]'::jsonb,
 '["Cuide da sua saúde antes do exame: alimentação, sono e exercícios", "Leve todos os documentos e exames anteriores", "Informe ao médico sobre qualquer condição pré-existente"]'::jsonb,
 2),
(3, '📝', 'Cadastro Online nas Companhias Aéreas',
 'Com o curso concluído, é hora de se candidatar às vagas nas companhias aéreas.',
 '["Acesse o site de carreiras das companhias (LATAM, GOL, Azul, etc.)", "Preencha o cadastro com dados atualizados", "Prepare um currículo objetivo e profissional", "Algumas empresas pedem vídeo de apresentação ou carta de motivação"]'::jsonb,
 '["Personalize seu currículo para cada companhia", "No vídeo, seja natural, sorria e demonstre paixão pela aviação", "Mantenha seu cadastro sempre atualizado"]'::jsonb,
 3),
(4, '💻', 'Testes Online (Idiomas e Psicométricos)',
 'A maioria das companhias aplica testes online para avaliar idiomas e raciocínio.',
 '["Testes de inglês: gramática, interpretação, listening", "Testes de espanhol (algumas companhias)", "Testes SHL: raciocínio lógico, verbal e numérico", "Testes psicométricos: personalidade e comportamento"]'::jsonb,
 '["Pratique testes SHL antes do dia - existem simuladores online", "Treine listening com podcasts e filmes em inglês", "Faça os testes em ambiente silencioso e com boa internet"]'::jsonb,
 4),
(5, '🧠', 'Avaliação Comportamental e Psicométrica',
 'Esta etapa avalia se você tem o perfil adequado para trabalhar como comissário(a).',
 '["Avaliação de competências: trabalho em equipe, resiliência, comunicação", "Fit cultural: alinhamento com os valores da empresa", "Pode incluir inventários de personalidade", "Algumas companhias fazem essa avaliação online, outras presencialmente"]'::jsonb,
 '["Seja autêntico nas respostas - não tente ''acertar''", "Pesquise sobre a cultura e valores da companhia", "Demonstre equilíbrio emocional e maturidade"]'::jsonb,
 5),
(6, '👥', 'Dinâmica de Grupo',
 'Algumas companhias realizam dinâmicas para observar como você interage com outras pessoas.',
 '["Atividades em grupo que simulam situações do dia a dia", "Avaliadores observam: liderança, cooperação, comunicação", "Pode incluir debates, resolução de problemas em equipe", "Duração média: 2 a 4 horas"]'::jsonb,
 '["Participe ativamente, mas saiba ouvir os outros", "Não tente se sobressair demais - trabalho em equipe é essencial", "Vista-se de forma profissional e chegue com antecedência"]'::jsonb,
 6),
(7, '🗣️', 'Entrevista Individual Comportamental',
 'A entrevista final avalia suas experiências, motivações e comportamentos passados.',
 '["Perguntas baseadas em competências (método STAR)", "Exemplos: ''Conte uma situação em que você lidou com um cliente difícil''", "Avalia: comunicação, resolução de conflitos, atendimento ao cliente", "Pode ser em português, inglês ou ambos"]'::jsonb,
 '["Use o método STAR: Situação, Tarefa, Ação, Resultado", "Prepare 5-10 histórias de experiências anteriores", "Pratique respostas em inglês sobre você e sua motivação", "Faça perguntas inteligentes sobre a empresa e a função"]'::jsonb,
 7),
(8, '✈️', 'Exame Médico Final e Treinamento Inicial',
 'Após aprovação, você fará exames médicos complementares e o treinamento da companhia.',
 '["Exames admissionais completos", "Treinamento inicial (ground school): 4 a 6 semanas", "Inclui: procedimentos da companhia, aeronave específica, emergências", "Voos de experiência supervisionados antes de voar solo"]'::jsonb,
 '["Absorva todo o conhecimento - será sua base para a carreira", "Faça anotações e revise diariamente", "Construa bons relacionamentos com instrutores e colegas"]'::jsonb,
 8);

-- Create index for better performance
CREATE INDEX idx_guia_etapas_step_number ON public.guia_etapas(step_number);
CREATE INDEX idx_guia_etapas_active ON public.guia_etapas(is_active);

-- FILE: 20260115131502_70d23a1a-185b-48b7-806f-208884e9c686.sql
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
  'Conquistou aprovação oficial na banca da ANAC. Certificado verificado pela equipe Voe Certo.',
  'Award',
  'platinum',
  'anac_approval',
  1,
  100,
  true
) ON CONFLICT DO NOTHING;

-- FILE: 20260218161339_bf7de56f-6c04-4c21-b52b-113db9da97ae.sql

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


-- FIX: Add missing columns required by later policies
ALTER TABLE public.microcourses ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- FILE: 20260218161430_07961ead-4c9c-4c52-980e-a77ae1ce00ab.sql

-- Fix: Restrict AI cache insert to authenticated users only
DROP POLICY IF EXISTS "Service can insert ai cache" ON public.ai_question_cache;

CREATE POLICY "Authenticated users can insert ai cache"
  ON public.ai_question_cache FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);


-- FILE: 20260219103255_eb3b0800-7886-4046-8d86-3a7dbe46aab3.sql

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


-- FILE: 20260223105737_34c0269d-e785-4b28-bc2f-714560398518.sql

-- Table to store admin YouTube OAuth tokens
CREATE TABLE public.admin_youtube_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expires_at timestamp with time zone NOT NULL,
  channel_id text,
  channel_title text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.admin_youtube_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage youtube tokens"
  ON public.admin_youtube_tokens
  FOR ALL
  USING (is_admin(auth.uid()));

-- Add youtube_video_id column to microcourses for cleaner data
ALTER TABLE public.microcourses ADD COLUMN IF NOT EXISTS youtube_video_id text;

-- Trigger for updated_at
CREATE TRIGGER update_admin_youtube_tokens_updated_at
  BEFORE UPDATE ON public.admin_youtube_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- FILE: 20260224110024_a480127a-fce1-442d-aa13-d5d3dedc3f2c.sql

-- Create table for storing Google Drive OAuth tokens (separate from YouTube)
CREATE TABLE public.admin_drive_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  folder_id TEXT, -- specific Drive folder for badge models
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.admin_drive_tokens ENABLE ROW LEVEL SECURITY;

-- Only admins can manage their tokens
CREATE POLICY "Admins can manage own drive tokens"
  ON public.admin_drive_tokens
  FOR ALL
  USING (public.is_admin(auth.uid()));


-- FILE: 20260302112036_4e20addc-982e-44c5-ac99-eae515f2c79c.sql

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


-- FILE: 20260303105739_8be924ad-80fe-423e-8546-eebb507e3857.sql

-- Create modules table (level 2 - child of microcourse)
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  microcourse_id UUID NOT NULL REFERENCES public.microcourses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table (level 3 - child of module)
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  video_url TEXT,
  youtube_video_id TEXT,
  thumbnail_url TEXT,
  material_url TEXT,
  material_name TEXT,
  material_drive_folder TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- RLS for modules
CREATE POLICY "Admins can manage modules" ON public.modules FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view active modules" ON public.modules FOR SELECT USING (is_active = true);

-- RLS for lessons
CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view active lessons" ON public.lessons FOR SELECT USING (is_active = true);

-- Triggers for updated_at
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- FILE: 20260304120603_e78ed5e1-51ae-4ba3-8fca-cee0e1e61c67.sql

-- Allow service role to delete expired cache entries
CREATE POLICY "Service can delete expired cache"
ON public.ai_question_cache
FOR DELETE
USING (expires_at < now());


-- FILE: 20260304120628_37d9d5ca-36c3-4e7d-a45a-fb32640c76b6.sql

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


-- FILE: 20260304123309_faf93fb1-ff9f-4b06-bebc-6ea7b7d0e7a9.sql
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS duration text NOT NULL DEFAULT 'once',
ADD COLUMN IF NOT EXISTS duration_in_months integer;

-- FILE: 20260306120015_3770dd31-fab7-4d35-af93-e8018b7cf9a8.sql

-- Career guides table
CREATE TABLE public.career_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Career guide steps table
CREATE TABLE public.career_guide_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid REFERENCES public.career_guides(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  step_order integer DEFAULT 0,
  simulado_ids uuid[] DEFAULT '{}',
  microcourse_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User guide step progress
CREATE TABLE public.guide_step_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  step_id uuid REFERENCES public.career_guide_steps(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, step_id)
);

-- Enable RLS
ALTER TABLE public.career_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_guide_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_step_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for career_guides
CREATE POLICY "Admins can manage career guides" ON public.career_guides FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view active career guides" ON public.career_guides FOR SELECT USING (is_active = true);

-- RLS policies for career_guide_steps
CREATE POLICY "Admins can manage guide steps" ON public.career_guide_steps FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view guide steps" ON public.career_guide_steps FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.career_guides WHERE id = guide_id AND is_active = true)
);

-- RLS policies for guide_step_progress
CREATE POLICY "Users can manage own progress" ON public.guide_step_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress" ON public.guide_step_progress FOR SELECT USING (is_admin(auth.uid()));

-- Updated_at triggers
CREATE TRIGGER update_career_guides_updated_at BEFORE UPDATE ON public.career_guides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_guide_steps_updated_at BEFORE UPDATE ON public.career_guide_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- FILE: 20260308205000_5308088a-52ca-48a4-bc43-ec864cc86757.sql
ALTER TABLE public.insignias ADD COLUMN IF NOT EXISTS verso_texto text DEFAULT NULL;

-- FILE: 20260308205443_0caba643-ab62-4f80-8d0c-4454ae29f460.sql

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


-- FILE: 20260308205956_e6e9bc22-2ad7-4984-acb0-c18ebaff1103.sql
-- Add permissive policies for admin token tables so admin can read/delete from client
CREATE POLICY "Admins can read own drive tokens"
ON public.admin_drive_tokens
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Admins can delete own drive tokens"
ON public.admin_drive_tokens
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Admins can read own youtube tokens"
ON public.admin_youtube_tokens
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Admins can delete own youtube tokens"
ON public.admin_youtube_tokens
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()) AND auth.uid() = user_id);

-- FILE: 20260308215034_3f143763-ecb5-482a-8621-c67228ac8db7.sql
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

-- FILE: 20260308215938_87e31b88-3691-404d-808f-19e9ba4de3d4.sql

INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view course thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Admins can upload course thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'course-thumbnails' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update course thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'course-thumbnails' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete course thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'course-thumbnails' AND public.is_admin(auth.uid()));


-- FILE: 20260319134000_security_audit_fixes.sql

-- BLINDAGEM DE CONTEÚDO PREMIUM (RLS)
-- Restringe a visualização de questões, exames e aulas premium apenas para assinantes ou admins.

-- 1. Melhoria nas políticas de QUESTION
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;
CREATE POLICY "Anyone can view basic questions, premium only for subscribers"
  ON public.questions FOR SELECT
  USING (
    is_premium = false 
    OR is_admin(auth.uid()) 
    OR (SELECT is_premium FROM public.profiles WHERE user_id = auth.uid()) = true
  );

-- 2. Melhoria nas políticas de EXAMS
DROP POLICY IF EXISTS "Anyone can view active exams" ON public.exams;
CREATE POLICY "Anyone can view basic exams, premium only for subscribers"
  ON public.exams FOR SELECT
  USING (
    is_active = true AND (
      is_premium = false 
      OR is_admin(auth.uid()) 
      OR (SELECT is_premium FROM public.profiles WHERE user_id = auth.uid()) = true
    )
  );

-- 3. Melhoria nas políticas de LESSONS (Microcursos)
DROP POLICY IF EXISTS "Anyone can view active lessons" ON public.lessons;
CREATE POLICY "Anyone can view basic lessons, premium only for subscribers"
  ON public.lessons FOR SELECT
  USING (
    is_active = true AND (
      is_premium = false 
      OR is_admin(auth.uid()) 
      OR (SELECT is_premium FROM public.profiles WHERE user_id = auth.uid()) = true
    )
  );

-- 4. Melhoria nas políticas de MICROCOURSES
DROP POLICY IF EXISTS "Anyone can view active microcourses" ON public.microcourses;
CREATE POLICY "Anyone can view basic microcourses, premium only for subscribers"
  ON public.microcourses FOR SELECT
  USING (
    is_active = true AND (
      is_premium = false 
      OR is_admin(auth.uid()) 
      OR (SELECT is_premium FROM public.profiles WHERE user_id = auth.uid()) = true
    )
  );

-- NOTA: O campo is_premium nas tabelas permite que o sistema continue mostrando o esqueleto do item 
-- caso is_premium seja falso na aula mas o curso todo seja premium? 
-- Na verdade, se o curso é premium, as aulas devem ser premium.

-- PROTEÇÃO DE PERFIS (Não permitir que usuários listem outros perfis via API)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Only admins and owners can access specific profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid())
  );


-- FILE: 20260319142000_ai_usage_per_question.sql

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


