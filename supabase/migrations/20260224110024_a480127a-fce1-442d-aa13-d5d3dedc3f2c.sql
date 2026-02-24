
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
