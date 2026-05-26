-- Create strategic_testers table
CREATE TABLE IF NOT EXISTS public.strategic_testers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  duration_days INTEGER DEFAULT 30, -- 15, 30, 60 or NULL (unlimited)
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'registered', 'expired')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add is_tester column to public.profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_tester BOOLEAN DEFAULT false NOT NULL;

-- Create strategic_tester_feedback table
CREATE TABLE IF NOT EXISTS public.strategic_tester_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  liked_most TEXT,
  confused_most TEXT,
  bugs_found TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.strategic_testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_tester_feedback ENABLE ROW LEVEL SECURITY;

-- Strategic testers policies
CREATE POLICY "Admins can manage strategic_testers"
  ON public.strategic_testers FOR ALL
  USING (public.is_admin(auth.uid()));

-- Strategic tester feedback policies
CREATE POLICY "Users can insert their own feedback"
  ON public.strategic_tester_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
  ON public.strategic_tester_feedback FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Allow admins to update profiles directly (essential for fallback operations)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Drop the trigger FIRST to prevent errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate handle_new_user function to handle testers auto-activation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_duration_days INTEGER;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_is_tester BOOLEAN := false;
  v_is_premium BOOLEAN := false;
  v_plan_type TEXT := 'solo'; -- default plan
BEGIN
  -- Check if user is in strategic_testers
  SELECT duration_days INTO v_duration_days
  FROM public.strategic_testers
  WHERE email = NEW.email;

  IF FOUND THEN
    v_is_tester := true;
    v_is_premium := true;
    v_plan_type := 'tripulante'; -- premium plan
    IF v_duration_days IS NOT NULL THEN
      v_expires_at := now() + (v_duration_days || ' days')::interval;
    ELSE
      v_expires_at := NULL;
    END IF;
  END IF;

  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name, is_premium, premium_expires_at, plan_type, is_tester)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    v_is_premium,
    v_expires_at,
    v_plan_type,
    v_is_tester
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

  -- If was tester, update strategic_testers table status
  IF v_is_tester THEN
    UPDATE public.strategic_testers
    SET status = 'registered',
        registered_at = now(),
        expires_at = v_expires_at
    WHERE email = NEW.email;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at for strategic_testers
CREATE TRIGGER update_strategic_testers_updated_at
  BEFORE UPDATE ON public.strategic_testers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
