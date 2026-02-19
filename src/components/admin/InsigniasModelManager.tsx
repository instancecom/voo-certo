import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Upload, ImageIcon, CheckCircle2, Award, ExternalLink } from 'lucide-react';

interface Insignia {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  condition_type: string;
  condition_value: number;
  model_url: string | null;
  is_active: boolean | null;
}

const RARITY_COLORS: Record<string, string> = {
  bronze: 'text-amber-600 bg-amber-50 border-amber-200',
  silver: 'text-slate-500 bg-slate-50 border-slate-200',
  gold: 'text-yellow-500 bg-yellow-50 border-yellow-200',
  platinum: 'text-cyan-500 bg-cyan-50 border-cyan-200',
};

export function InsigniasModelManager() {
  const queryClient = useQueryClient();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const { data: insignias, isLoading } = useQuery({
    queryKey: ['admin-insignias-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insignias')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Insignia[];
    },
  });

  const updateModelUrl = useMutation({
    mutationFn: async ({ id, model_url }: { id: string; model_url: string }) => {
      const { error } = await supabase
        .from('insignias')
        .update({ model_url })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-insignias-models'] });
      queryClient.invalidateQueries({ queryKey: ['insignias'] });
      toast.success('PNG do modelo salvo com sucesso!');
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const handleFileSelect = async (insigniaId: string, file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens PNG, JPG ou WebP são aceitas.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 5MB.');
      return;
    }

    // Local preview
    const localUrl = URL.createObjectURL(file);
    setPreviews(p => ({ ...p, [insigniaId]: localUrl }));

    setUploading(u => ({ ...u, [insigniaId]: true }));
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const path = `modelos/${insigniaId}/modelo.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('badge-proofs')
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from('badge-proofs')
        .getPublicUrl(path);

      // Since badge-proofs is private, store the path and generate signed urls on demand
      // We'll store a reference path
      await updateModelUrl.mutateAsync({ id: insigniaId, model_url: path });
    } catch (err: any) {
      toast.error(`Erro no upload: ${err.message}`);
      setPreviews(p => {
        const next = { ...p };
        delete next[insigniaId];
        return next;
      });
    } finally {
      setUploading(u => ({ ...u, [insigniaId]: false }));
    }
  };

  const getDisplayUrl = async (path: string): Promise<string> => {
    const { data } = await supabase.storage
      .from('badge-proofs')
      .createSignedUrl(path, 3600);
    return data?.signedUrl || '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Modelos PNG de Insígnias</h2>
        <p className="text-muted-foreground">
          Faça upload dos PNGs personalizados para cada insígnia. Esses modelos são usados na geração dos selos de conquista.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insignias?.map(insignia => {
          const rarityStyle = RARITY_COLORS[insignia.rarity] || RARITY_COLORS.bronze;
          const isUploadingThis = uploading[insignia.id];
          const localPreview = previews[insignia.id];

          return (
            <Card key={insignia.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{insignia.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{insignia.name}</CardTitle>
                      <Badge className={`text-xs capitalize border ${rarityStyle}`}>
                        {insignia.rarity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{insignia.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Preview area */}
                <div className="rounded-lg border-2 border-dashed border-border h-36 flex items-center justify-center overflow-hidden bg-muted/30">
                  {localPreview ? (
                    <img src={localPreview} alt="Preview" className="h-full w-full object-contain" />
                  ) : insignia.model_url ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-success" />
                      <span className="text-xs text-muted-foreground">Modelo salvo</span>
                      <span className="text-xs text-muted-foreground truncate max-w-40">{insignia.model_url.split('/').pop()}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs">Sem modelo PNG</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    ref={el => { fileInputRefs.current[insignia.id] = el; }}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(insignia.id, file);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    disabled={isUploadingThis}
                    onClick={() => fileInputRefs.current[insignia.id]?.click()}
                  >
                    {isUploadingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    {isUploadingThis ? 'Enviando...' : insignia.model_url ? 'Trocar PNG' : 'Upload PNG'}
                  </Button>
                  {insignia.model_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={async () => {
                        const url = await getDisplayUrl(insignia.model_url!);
                        if (url) window.open(url, '_blank');
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">PNG/JPG até 5MB. Recomendado: 800×800px, fundo transparente.</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!insignias || insignias.length === 0) && (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma insígnia cadastrada ainda.</p>
        </div>
      )}
    </div>
  );
}
