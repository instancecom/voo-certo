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