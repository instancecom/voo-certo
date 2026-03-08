import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import {
  Settings,
  BarChart3,
  ArrowLeft,
  Shield,
  Loader2,
  Users,
  FileQuestion,
  Briefcase,
  Layers,
  TrendingUp,
  Map,
  Award,
  BookOpen,
  ImageIcon,
  Tag,
  Plug,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProfessionsManager } from '@/components/admin/ProfessionsManager';
import { BlocksManager } from '@/components/admin/BlocksManager';
import { BlockQuestionsManager } from '@/components/admin/BlockQuestionsManager';
import { CareerGuidesManager } from '@/components/admin/CareerGuidesManager';
import { VerificationsManager } from '@/components/admin/VerificationsManager';
import { MicrocoursesManager } from '@/components/admin/MicrocoursesManager';
import { InsigniasModelManager } from '@/components/admin/InsigniasModelManager';
import { AdminStatsManager } from '@/components/admin/AdminStatsManager';
import { PlansAndCouponsManager } from '@/components/admin/PlansAndCouponsManager';
import { ConnectionsManager } from '@/components/admin/ConnectionsManager';

type AdminView = 'professions' | 'blocks' | 'questions';

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [view, setView] = useState<AdminView>('professions');
  const [activeTab, setActiveTab] = useState('content');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const [selectedProfessionName, setSelectedProfessionName] = useState<string>('');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [selectedBlockName, setSelectedBlockName] = useState<string>('');

  // Fetch stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [professionsRes, blocksRes, questionsRes, resultsRes, usersRes] = await Promise.all([
        supabase.from('categories').select('id', { count: 'exact' }),
        supabase.from('subcategories').select('id', { count: 'exact' }),
        supabase.from('questions').select('id', { count: 'exact' }),
        supabase.from('exam_results').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
      ]);

      return {
        professions: professionsRes.count || 0,
        blocks: blocksRes.count || 0,
        questions: questionsRes.count || 0,
        results: resultsRes.count || 0,
        users: usersRes.count || 0,
      };
    },
  });

  const isLoading = authLoading || loadingStats;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-card border border-border max-w-md">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Você precisa fazer login para acessar esta página.</p>
          <Button asChild><Link to="/auth">Fazer Login</Link></Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-card border border-border max-w-md">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground mb-6">Esta área é restrita a administradores.</p>
          <Button asChild><Link to="/">Voltar ao Início</Link></Button>
        </div>
      </div>
    );
  }

  const handleSelectProfession = (id: string, name: string) => {
    setSelectedProfessionId(id);
    setSelectedProfessionName(name);
    setView('blocks');
  };

  const handleSelectBlock = (id: string, name: string) => {
    setSelectedBlockId(id);
    setSelectedBlockName(name);
    setView('questions');
  };

  const handleBackToProfessions = () => {
    setView('professions');
    setSelectedProfessionId('');
    setSelectedProfessionName('');
  };

  const handleBackToBlocks = () => {
    setView('blocks');
    setSelectedBlockId('');
    setSelectedBlockName('');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/"><ArrowLeft className="w-4 h-4" /></Link>
              </Button>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-semibold">Painel Administrativo</h1>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/simulados">Ver Simulados</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />Profissões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats?.professions || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4" />Blocos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats?.blocks || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileQuestion className="w-4 h-4" />Questões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats?.questions || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />Simulados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats?.results || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats?.users || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="content" className="space-y-6">
              <TabsList className="bg-muted flex-wrap h-auto gap-1">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />Profissões & Blocos
                </TabsTrigger>
                <TabsTrigger value="microcourses" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />Microcursos
                </TabsTrigger>
                <TabsTrigger value="guia" className="flex items-center gap-2">
                  <Map className="w-4 h-4" />Guia de Carreira
                </TabsTrigger>
                <TabsTrigger value="insignias-models" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />Modelos PNG
                </TabsTrigger>
                <TabsTrigger value="verifications" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />Verificações
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />Estatísticas
                </TabsTrigger>
                <TabsTrigger value="plans" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />Planos & Cupons
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center gap-2">
                  <Plug className="w-4 h-4" />Conexões
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                {view === 'professions' && (
                  <ProfessionsManager onSelectProfession={handleSelectProfession} />
                )}
                {view === 'blocks' && (
                  <BlocksManager
                    professionId={selectedProfessionId}
                    professionName={selectedProfessionName}
                    onBack={handleBackToProfessions}
                    onSelectBlock={handleSelectBlock}
                  />
                )}
                {view === 'questions' && (
                  <BlockQuestionsManager
                    professionId={selectedProfessionId}
                    professionName={selectedProfessionName}
                    blockId={selectedBlockId}
                    blockName={selectedBlockName}
                    onBack={handleBackToBlocks}
                  />
                )}
              </TabsContent>

              <TabsContent value="microcourses" className="space-y-6">
                <MicrocoursesManager />
              </TabsContent>

              <TabsContent value="guia" className="space-y-6">
                <CareerGuidesManager />
              </TabsContent>

              <TabsContent value="insignias-models" className="space-y-6">
                <InsigniasModelManager />
              </TabsContent>

              <TabsContent value="verifications" className="space-y-6">
                <VerificationsManager />
              </TabsContent>

              <TabsContent value="stats" className="space-y-6">
                <AdminStatsManager />
              </TabsContent>

              <TabsContent value="plans" className="space-y-6">
                <PlansAndCouponsManager />
              </TabsContent>

              <TabsContent value="connections" className="space-y-6">
                <ConnectionsManager />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
