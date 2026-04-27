
import { supabase } from "@/integrations/supabase/client";

export const youtubeService = {
  async youtubeRequest(action: string, options?: { method?: string; body?: any; isFormData?: boolean }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    };

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/youtube-upload?action=${action}`,
      {
        method: options?.method || 'GET',
        headers,
        body: options?.body,
      }
    );

    return await response.json();
  },

  async getStatus() {
    return await this.youtubeRequest('status');
  },

  async uploadVideo(file: File, title: string, description: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');
    
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('privacy', 'unlisted');

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/youtube-upload?action=upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: formData,
      }
    );

    return await response.json();
  }
};
