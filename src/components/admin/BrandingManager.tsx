import { useState } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Palette, Globe, AlertCircle, Save, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function BrandingManager() {
  const { settings, updateSettings, isLoading } = useBranding();
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || '');
  const [siteName, setSiteName] = useState(settings.site_name || '');
  const [isSaving, setIsSaving] = useState(false);

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
            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL do Logotipo (Imagem)</Label>
              <Input 
                id="logoUrl" 
                value={logoUrl} 
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
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
                <img src={logoUrl} alt="Preview" className="h-12 w-auto object-contain" />
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
