-- Enhance RLS policies to check for premium expiration

-- 1. Update public.questions policy
DROP POLICY IF EXISTS "Anyone can view basic questions, premium only for subscribers" ON public.questions;
CREATE POLICY "Anyone can view basic questions, premium only for subscribers"
  ON public.questions FOR SELECT
  USING (
    is_premium = false 
    OR is_admin(auth.uid()) 
    OR (
      SELECT is_premium AND (premium_expires_at IS NULL OR premium_expires_at > now()) 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    ) = true
  );

-- 2. Update public.exams policy
DROP POLICY IF EXISTS "Anyone can view basic exams, premium only for subscribers" ON public.exams;
CREATE POLICY "Anyone can view basic exams, premium only for subscribers"
  ON public.exams FOR SELECT
  USING (
    is_active = true AND (
      is_premium = false 
      OR is_admin(auth.uid()) 
      OR (
        SELECT is_premium AND (premium_expires_at IS NULL OR premium_expires_at > now()) 
        FROM public.profiles 
        WHERE user_id = auth.uid()
      ) = true
    )
  );

-- 3. Update public.lessons policy
DROP POLICY IF EXISTS "Anyone can view basic lessons, premium only for subscribers" ON public.lessons;
CREATE POLICY "Anyone can view basic lessons, premium only for subscribers"
  ON public.lessons FOR SELECT
  USING (
    is_active = true AND (
      is_premium = false 
      OR is_admin(auth.uid()) 
      OR (
        SELECT is_premium AND (premium_expires_at IS NULL OR premium_expires_at > now()) 
        FROM public.profiles 
        WHERE user_id = auth.uid()
      ) = true
    )
  );

-- 4. Update public.microcourses policy
DROP POLICY IF EXISTS "Anyone can view basic microcourses, premium only for subscribers" ON public.microcourses;
CREATE POLICY "Anyone can view basic microcourses, premium only for subscribers"
  ON public.microcourses FOR SELECT
  USING (
    is_active = true AND (
      is_premium = false 
      OR is_admin(auth.uid()) 
      OR (
        SELECT is_premium AND (premium_expires_at IS NULL OR premium_expires_at > now()) 
        FROM public.profiles 
        WHERE user_id = auth.uid()
      ) = true
    )
  );
