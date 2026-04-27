
import { supabase } from "@/integrations/supabase/client";

interface DriveRequestOptions {
  method?: string;
  body?: any;
  isFormData?: boolean;
}

export const googleDriveService = {
  async driveRequest(action: string, options?: DriveRequestOptions) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    };

    if (!options?.isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/google-drive?action=${action}`,
      {
        method: options?.method || 'GET',
        headers,
        body: options?.body ? (options.isFormData ? options.body : JSON.stringify(options.body)) : undefined,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro na API do Google Drive: ${response.statusText}`);
    }

    return await response.json();
  },

  async listFolders() {
    const data = await this.driveRequest('list_folders');
    return data.folders || [];
  },

  async createFolder(name: string) {
    return await this.driveRequest('create_folder', {
      method: 'POST',
      body: { name: name.trim() },
    });
  },

  async uploadFile(file: File, fileName: string, folderId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    return await this.driveRequest('upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  async getStatus() {
    return await this.driveRequest('status');
  }
};
