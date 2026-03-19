
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
