
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
