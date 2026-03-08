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