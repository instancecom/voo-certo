import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface DriveImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function DriveImageUpload({ value, onChange, label }: DriveImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida.');
      return;
    }

    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `capa_${Date.now()}_${file.name}`);

      // Chamar a Edge Function
      const { data: { publicUrl } } = await supabase.functions.invoke('google-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
        queryParams: { action: 'upload' }
      });

      // Nota: o supabase.functions.invoke pode lidar com FormData de forma diferente dependendo da versão
      // Vamos usar o fetch direto se o invoke falhar ou se preferir a lógica do MicrocoursesManager
      
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/google-drive?action=upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: formData,
        }
      );

      const result = await resp.json();
      if (result.error) throw new Error(result.error);

      onChange(result.directUrl);
      toast.success('Imagem enviada para o Google Drive!');
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getPreviewUrl = (url: string) => {
    if (!url) return '';
    // Converte links do drive para links de visualização direta se necessário
    if (url.includes('drive.google.com/file/d/')) {
      const id = url.match(/\/d\/([^/]+)/)?.[1];
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
    return url;
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      
      <div className="flex items-start gap-4">
        {value ? (
          <div className="relative group shrink-0">
            <img 
              src={getPreviewUrl(value)} 
              alt="Preview" 
              className="w-32 h-20 object-cover rounded-lg border border-border bg-muted"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/128x80?text=Erro+de+Link';
              }}
            />
            <button
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-32 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
            <ImageIcon className="w-6 h-6 mb-1 opacity-20" />
            <span className="text-[10px]">Sem capa</span>
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 h-9"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading ? 'Enviando...' : 'Fazer Upload'}
            </Button>
            <Input 
              placeholder="Ou cole a URL direta aqui..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            A imagem será salva automaticamente na sua pasta do Google Drive.
          </p>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
