import { useState } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Palette, Globe, AlertCircle, Save, RotateCcw, Upload, Loader2, CheckCircle2, Cloud } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';
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

export function BrandingManager() {
  const { settings, updateSettings, isLoading } = useBranding();
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || '');
  const [siteName, setSiteName] = useState(settings.site_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [isLoadingDrive, setIsLoadingDrive] = useState(true);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [isFetchingFolders, setIsFetchingFolders] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDriveImageUrl = (url: string | null): string | null => {
    if (!url) return null;
    if (url.includes('lh3.googleusercontent.com')) return url;
    const ucMatch = url.match(/drive\.google\.com\/uc\?export=view&id=([^&]+)/);
    if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
    return url;
  };

  useEffect(() => {
    checkDriveStatus();
  }, []);

  useEffect(() => {
    if (driveConnected) {
      fetchFolders();
    }
  }, [driveConnected]);

  const fetchFolders = async () => {
    setIsFetchingFolders(true);
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
        // If there's a folder, select the first one by default if none selected
        if (data.folders.length > 0 && !selectedFolderId) {
          setSelectedFolderId(data.folders[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setIsFetchingFolders(false);
    }
  };

  const checkDriveStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/google-drive?action=status`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const data = await resp.json();
      setDriveConnected(data.connected);
    } catch (error) {
      console.error('Error checking drive status:', error);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!driveConnected) {
      toast.error('Conecte o Google Drive primeiro.');
      return;
    }

    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `logo-${Date.now()}-${file.name}`);
      if (selectedFolderId) {
        formData.append('folderId', selectedFolderId);
      }

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

      if (result.directUrl) {
        setLogoUrl(result.directUrl);
        toast.success('Logo enviada para o Drive com sucesso!');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Erro ao enviar arquivo para o Drive');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConnectDrive = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/google-drive?action=auth_url`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const data = await resp.json();
      if (data.url) {
        window.open(data.url, 'drive_oauth', 'width=600,height=700');
      }
    } catch (error) {
      toast.error('Erro ao conectar ao Google Drive');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        logo_url: logoUrl || null,
        site_name: siteName || 'Voo Certo',
      });
      toast.success('Branding atualizado com sucesso!');
    } catch (error: any) {
      console.error('Save error:', error);
      if (error.code === 'PGRST116' || error.message?.includes('relation "site_settings" does not exist')) {
        toast.error('Tabela de configurações não encontrada. Veja o aviso abaixo.');
      } else {
        toast.error('Erro ao salvar configurações.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const sqlCode = `
CREATE TABLE IF NOT EXISTS public.site_settings (
    key text PRIMARY KEY,
    value text,
    updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
CREATE POLICY "Leitura pública" ON public.site_settings
    FOR SELECT USING (true);

-- Política de escrita apenas para admins
CREATE POLICY "Escrita para admins" ON public.site_settings
    FOR ALL USING (has_role('admin', auth.uid()));
  `.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Palette className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Identidade & Branding</h2>
          <p className="text-muted-foreground">Personalize o logotipo e o nome da plataforma.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-accent" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Essas informações aparecem no cabeçalho e rodapé do site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nome do Site</Label>
              <Input 
                id="siteName" 
                value={siteName} 
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Ex: Voo Certo"
              />
            </div>
            <div className="space-y-4">
              <Label>Logotipo da Plataforma</Label>
              
              {!driveConnected ? (
                <div className="p-4 border border-dashed border-border rounded-lg bg-muted/30 flex flex-col items-center gap-3 text-center">
                  <Cloud className="w-8 h-8 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Google Drive não conectado</p>
                    <p className="text-xs text-muted-foreground">Conecte o Drive para fazer upload da logo diretamente.</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleConnectDrive}
                    disabled={isLoadingDrive}
                  >
                    {isLoadingDrive ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Cloud className="w-4 h-4 mr-2 text-accent" />}
                    Conectar Google Drive
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-xs font-medium text-success">Google Drive Conectado</span>
                  </div>
                                   <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Pasta no Google Drive</Label>
                      {isFetchingFolders ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 border rounded-md bg-muted/20">
                          <Loader2 className="w-3 h-3 animate-spin" /> Carregando pastas...
                        </div>
                      ) : (
                        <Select 
                          value={selectedFolderId} 
                          onValueChange={setSelectedFolderId}
                          disabled={isUploading || folders.length === 0}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={folders.length === 0 ? "Nenhuma pasta encontrada" : "Selecionar pasta"} />
                          </SelectTrigger>
                          <SelectContent>
                            {folders.map(folder => (
                              <SelectItem key={folder.id} value={folder.id}>
                                {folder.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="hero"
                        size="sm"
                        className="flex-1"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || !selectedFolderId}
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {isUploading ? 'Enviando...' : 'Selecionar e Enviar Logo'}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="logoUrl" className="text-[10px] text-muted-foreground">URL da Imagem (Preenchida automaticamente)</Label>
                      <Input 
                        id="logoUrl" 
                        value={logoUrl} 
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="A URL aparecerá aqui após o upload"
                        className="h-8 text-[11px] font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-[10px] text-muted-foreground">
                Se deixado vazio, o sistema usará o ícone de avião padrão e o nome do site.
              </p>
            </div>

            <div className="pt-4 flex gap-3">
              <Button 
                variant="hero" 
                className="flex-1" 
                onClick={handleSave}
                disabled={isSaving || isLoading}
              >
                {isSaving ? 'Salvando...' : <><Save className="w-4 h-4 mr-2" /> Salvar Alterações</>}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setLogoUrl(settings.logo_url || '');
                  setSiteName(settings.site_name || '');
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Visualização Prévia
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-12 bg-white/5 rounded-xl border border-dashed border-border">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <img src={getDriveImageUrl(logoUrl) || ''} alt="Preview" className="h-12 w-auto object-contain" />
              ) : (
                <>
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-accent" />
                  </div>
                  <span className="text-2xl font-bold">{siteName || 'Voo Certo'}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Importante: Persistência de Dados</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>
            Para que o logotipo e nome persistam, o banco de dados Supabase precisa da tabela <code>site_settings</code>. 
            Se as alterações não "ficarem" após recarregar a página, execute o SQL abaixo no editor do seu painel Supabase:
          </p>
          <pre className="p-3 bg-black/50 rounded-lg text-[10px] font-mono overflow-x-auto text-white">
            {sqlCode}
          </pre>
        </AlertDescription>
      </Alert>
    </div>
  );
}
