
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
