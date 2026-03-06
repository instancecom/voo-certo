
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
