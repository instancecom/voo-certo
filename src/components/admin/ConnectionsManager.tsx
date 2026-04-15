import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Youtube, HardDrive, CheckCircle2, XCircle, Loader2, Unplug, Plug } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ConnectionCardProps {
  provider: 'youtube' | 'drive';
  title: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  connectedInfo?: string;
  isLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  isActing: boolean;
}

function ConnectionCard({
  title, description, icon, isConnected, connectedInfo, isLoading, onConnect, onDisconnect, isActing,
}: ConnectionCardProps) {
  return (
    <Card className={`border-2 transition-colors ${isConnected ? 'border-success/30' : 'border-border'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${isConnected ? 'bg-success/10' : 'bg-muted'}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : isConnected ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-success" />
              <Badge variant="outline" className="border-success/30 text-success bg-success/5">
                Conectado
              </Badge>
              {connectedInfo && (
                <span className="text-xs text-muted-foreground truncate">{connectedInfo}</span>
              )}
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-muted-foreground" />
              <Badge variant="outline" className="text-muted-foreground">Não conectado</Badge>
            </>
          )}
        </div>

        {/* Action */}
        {isConnected ? (
          <Button
            variant="destructive"
            className="w-full"
            onClick={onDisconnect}
            disabled={isActing}
          >
            {isActing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Unplug className="w-4 h-4 mr-2" />}
            Desconectar
          </Button>
        ) : (
          <Button
            variant="hero"
            className="w-full"
            onClick={onConnect}
            disabled={isActing}
          >
            {isActing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plug className="w-4 h-4 mr-2" />}
            Conectar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function ConnectionsManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [actingProvider, setActingProvider] = useState<string | null>(null);

  const { data: youtubeToken, isLoading: ytLoading } = useQuery({
    queryKey: ['admin-youtube-token', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_youtube_tokens')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: driveToken, isLoading: driveLoading } = useQuery({
    queryKey: ['admin-drive-token', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_drive_tokens')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const handleConnect = async (provider: 'youtube' | 'drive') => {
    setActingProvider(provider);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) { toast.error('Sessão expirada. Faça login novamente.'); return; }

      const funcName = provider === 'youtube' ? 'youtube-upload' : 'google-drive';
      const { data, error } = await supabase.functions.invoke(`${funcName}?action=auth_url`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank', 'width=600,height=700');
        // We'll listen for the message from the popup instead of asking for manual refresh
      } else {
        throw new Error('URL de autorização não recebida');
      }
    } catch (err: any) {
      console.error('Connect error:', err);
      toast.error('Falha na conexão – tente novamente');
    } finally {
      setActingProvider(null);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'youtube_connected') {
        queryClient.invalidateQueries({ queryKey: ['admin-youtube-token'] });
        toast.success('YouTube conectado com sucesso!');
      }
      if (event.data?.type === 'drive_connected') {
        queryClient.invalidateQueries({ queryKey: ['admin-drive-token'] });
        toast.success('Google Drive conectado com sucesso!');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient]);

  const handleDisconnect = async (provider: 'youtube' | 'drive') => {
    setActingProvider(provider);
    try {
      const table = provider === 'youtube' ? 'admin_youtube_tokens' : 'admin_drive_tokens';
      const { error } = await supabase.from(table).delete().eq('user_id', user!.id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: [`admin-${provider}-token`] });
      toast.success('Desconectado com sucesso!');
    } catch (err: any) {
      console.error('Disconnect error:', err);
      toast.error('Erro ao desconectar');
    } finally {
      setActingProvider(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Conexões Externas</h2>
        <p className="text-muted-foreground mt-1">Gerencie as integrações de upload do painel administrativo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConnectionCard
          provider="youtube"
          title="YouTube"
          description="Permite upload privado de vídeos para microcursos."
          icon={<Youtube className="w-6 h-6 text-destructive" />}
          isConnected={!!youtubeToken}
          connectedInfo={youtubeToken?.channel_title || undefined}
          isLoading={ytLoading}
          onConnect={() => handleConnect('youtube')}
          onDisconnect={() => handleDisconnect('youtube')}
          isActing={actingProvider === 'youtube'}
        />

        <ConnectionCard
          provider="drive"
          title="Google Drive"
          description="Permite upload de imagens e PDFs para pastas escolhidas."
          icon={<HardDrive className="w-6 h-6 text-accent" />}
          isConnected={!!driveToken}
          connectedInfo={driveToken?.folder_id ? `Pasta: ${driveToken.folder_id.slice(0, 12)}...` : undefined}
          isLoading={driveLoading}
          onConnect={() => handleConnect('drive')}
          onDisconnect={() => handleDisconnect('drive')}
          isActing={actingProvider === 'drive'}
        />
      </div>
    </div>
  );
}
