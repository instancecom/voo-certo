import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Image as ImageIcon, X, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DriveFolder {
  id: string;
  name: string;
}

interface DriveImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function DriveImageUpload({ value, onChange, label }: DriveImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    setIsLoadingFolders(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/google-drive?action=list_folders`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const data = await resp.json();
      if (data.folders) {
        setFolders(data.folders);
        // Tenta encontrar a pasta "Capas" ou seleciona a primeira
        const capasFolder = data.folders.find((f: any) => f.name.toLowerCase().includes('capa'));
        setSelectedFolderId(capasFolder?.id || data.folders[0]?.id || '');
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      if (selectedFolderId) {
        formData.append('folderId', selectedFolderId);
      }

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
    if (url.includes('drive.google.com/file/d/')) {
      const id = url.match(/\/d\/([^/]+)/)?.[1];
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
    return url;
  };

  return (
    <div className="space-y-3">
      {label && <label className="text-xs font-bold text-muted-foreground uppercase opacity-70">{label}</label>}
      
      <div className="flex items-start gap-4 p-3 rounded-lg border bg-muted/20 border-border/50">
        {value ? (
          <div className="relative group shrink-0">
            <img 
              src={getPreviewUrl(value)} 
              alt="Preview" 
              className="w-24 h-16 object-cover rounded-md border border-border bg-muted shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/128x80?text=Erro+de+Link';
              }}
            />
            <button
              onClick={() => onChange('')}
              className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5 hover:scale-110 transition-transform shadow-md"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-24 h-16 rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
            <ImageIcon className="w-5 h-5 mb-0.5 opacity-20" />
            <span className="text-[9px] font-bold uppercase tracking-tighter opacity-40">Sem capa</span>
          </div>
        )}

        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-[140px]">
              {isLoadingFolders ? (
                <div className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-[11px]">Buscando pastas...</span>
                </div>
              ) : (
                <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                  <SelectTrigger className="h-9 text-[11px] bg-background">
                    <SelectValue placeholder="Selecione a pasta" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id} className="text-xs">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-3 h-3 text-accent" />
                          {folder.name}
                        </div>
                      </SelectItem>
                    ))}
                    {folders.length === 0 && (
                      <div className="p-2 text-[10px] text-muted-foreground italic text-center">Nenhuma pasta encontrada</div>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button
              type="button"
              variant="hero"
              size="sm"
              className="gap-2 h-9 px-4 text-xs font-bold whitespace-nowrap"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !selectedFolderId}
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {isUploading ? 'Subindo...' : 'Fazer Upload'}
            </Button>
          </div>
          
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-accent" />
            <p className="text-[10px] text-muted-foreground font-medium italic">
              A imagem será salva na pasta selecionada no seu Google Drive.
            </p>
          </div>
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
