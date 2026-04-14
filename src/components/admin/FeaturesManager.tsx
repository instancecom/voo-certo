import { useBranding } from '@/contexts/BrandingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Map, 
  Award, 
  TrendingUp, 
  FileText, 
  Activity,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function FeaturesManager() {
  const { settings, updateFeatureFlag, isLoading } = useBranding();

  const handleToggle = async (feature: keyof typeof settings.features, active: boolean) => {
    try {
      await updateFeatureFlag(feature, active);
      toast.success(`${getFeatureLabel(feature)} ${active ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao atualizar recurso.');
    }
  };

  const getFeatureLabel = (feature: string) => {
    switch (feature) {
      case 'microcourses': return 'Microcursos';
      case 'career_guide': return 'Guia de Carreira';
      case 'achievements': return 'Conquistas';
      case 'progress': return 'Meu Progresso';
      case 'curriculum': return 'Currículo';
      default: return feature;
    }
  };

  const featureConfigs = [
    { 
      id: 'microcourses' as const, 
      label: 'Microcursos', 
      description: 'Aulas curtas e objetivas em vídeo e texto.',
      icon: Sparkles,
      color: 'text-yellow-500'
    },
    { 
      id: 'career_guide' as const, 
      label: 'Guia de Carreira', 
      description: 'Passo a passo para evolução profissional.',
      icon: Map,
      color: 'text-blue-500'
    },
    { 
      id: 'achievements' as const, 
      label: 'Conquistas', 
      description: 'Sistema de insígnias e troféus dos usuários.',
      icon: Award,
      color: 'text-purple-500'
    },
    { 
      id: 'progress' as const, 
      label: 'Meu Progresso', 
      description: 'Gráficos e estatísticas de desempenho individual.',
      icon: TrendingUp,
      color: 'text-green-500'
    },
    { 
      id: 'curriculum' as const, 
      label: 'Currículo', 
      description: 'Gerador de PDF de currículo profissional.',
      icon: FileText,
      color: 'text-orange-500'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Activity className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Recursos</h2>
          <p className="text-muted-foreground">Escolha quais telas e funcionalidades estarão visíveis para os usuários.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featureConfigs.map((feature) => {
          const Icon = feature.icon;
          const isActive = settings.features[feature.id];
          
          return (
            <Card key={feature.id} className={`transition-all duration-200 ${!isActive ? 'opacity-70 bg-muted/30' : 'bg-card'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-background shadow-sm' : 'bg-muted'}`}>
                      <Icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{feature.label}</CardTitle>
                      <CardDescription className="text-xs">{feature.description}</CardDescription>
                    </div>
                  </div>
                  <Switch 
                    checked={isActive}
                    onCheckedChange={(checked) => handleToggle(feature.id, checked)}
                    disabled={isLoading}
                  />
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Informação</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>
            Desativar um recurso irá escondê-lo do menu de navegação e impedirá o acesso à página correspondente.
            Isso é útil para realizar manutenções ou ocultar funcionalidades em desenvolvimento.
          </p>
          <p className="text-xs text-muted-foreground">
            Nota: Para que essas alterações persistam, o banco de dados Supabase precisa da tabela <code>site_settings</code>. 
            Se as alterações não "ficarem" após recarregar a página, peça para o administrador validar a tabela no Supabase.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
