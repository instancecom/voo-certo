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
import { BrandingManager } from '@/components/admin/BrandingManager';
import { FeaturesManager } from '@/components/admin/FeaturesManager';
import { StrategicTestersManager } from '@/components/admin/StrategicTestersManager';
import { Palette, Activity } from 'lucide-react';

type AdminView = 'professions' | 'blocks' | 'questions';
type AdminTab = 'content' | 'microcourses' | 'guia' | 'insignias-models' | 'verifications' | 'stats' | 'plans' | 'connections' | 'branding' | 'recursos' | 'testers';

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [view, setView] = useState<AdminView>('professions');
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const [selectedProfessionId, setSelectedProfessionId] = useState<string>('');
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
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button variant="ghost" size="icon" asChild className="shrink-0">
                <Link to="/"><ArrowLeft className="w-4 h-4" /></Link>
              </Button>
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <h1 className="text-sm sm:text-lg font-semibold truncate">Painel Admin</h1>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0 text-xs sm:text-sm">
              <Link to="/simulados">Ver Simulados</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Cards - horizontal scroll on mobile */}
            <div className="flex gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-5 sm:overflow-visible scrollbar-none">
              {[
                { icon: Briefcase, label: 'Profissões', value: stats?.professions || 0 },
                { icon: Layers, label: 'Blocos', value: stats?.blocks || 0 },
                { icon: FileQuestion, label: 'Questões', value: stats?.questions || 0 },
                { icon: TrendingUp, label: 'Simulados', value: stats?.results || 0 },
                { icon: Users, label: 'Usuários', value: stats?.users || 0 },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="min-w-[120px] sm:min-w-0 shrink-0 sm:shrink">
                    <CardHeader className="pb-1 sm:pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
                      <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{stat.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                      <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {(() => {
              const tabs = [
                { value: 'content', label: 'Profissões & Blocos', icon: Briefcase },
                { value: 'recursos', label: 'Recursos', icon: Activity },
                { value: 'microcourses', label: 'Microcursos', icon: BookOpen },
                { value: 'guia', label: 'Guia de Carreira', icon: Map },
                { value: 'insignias-models', label: 'Modelos PNG', icon: ImageIcon },
                { value: 'verifications', label: 'Verificações', icon: Award },
                { value: 'stats', label: 'Estatísticas', icon: BarChart3 },
                { value: 'plans', label: 'Planos & Cupons', icon: Tag },
                { value: 'connections', label: 'Conexões', icon: Plug },
                { value: 'branding', label: 'Branding', icon: Palette },
                { value: 'testers', label: 'Testers Estratégicos', icon: Users },
              ];

              const currentTab = tabs.find(t => t.value === activeTab);

              const renderTabButtons = (onSelect?: () => void) => (
                <div className="flex flex-col gap-1">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.value;
                    return (
                      <button
                        key={tab.value}
                        onClick={() => { setActiveTab(tab.value as AdminTab); onSelect?.(); }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              );

              const contentJsx = (
                <div className="relative">
                  <div className={activeTab === 'content' ? 'block' : 'hidden'}>
                    <div className="space-y-6">
                      <div className={view === 'professions' ? 'block' : 'hidden'}>
                        <ProfessionsManager onSelectProfession={handleSelectProfession} />
                      </div>
                      <div className={view === 'blocks' ? 'block' : 'hidden'}>
                        {selectedProfessionId && (
                          <BlocksManager
                            professionId={selectedProfessionId}
                            professionName={selectedProfessionName}
                            onBack={handleBackToProfessions}
                            onSelectBlock={handleSelectBlock}
                          />
                        )}
                      </div>
                      <div className={view === 'questions' ? 'block' : 'hidden'}>
                        {selectedBlockId && (
                          <BlockQuestionsManager
                            professionId={selectedProfessionId}
                            professionName={selectedProfessionName}
                            blockId={selectedBlockId}
                            blockName={selectedBlockName}
                            onBack={handleBackToBlocks}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={activeTab === 'microcourses' ? 'block' : 'hidden'}><MicrocoursesManager /></div>
                  <div className={activeTab === 'guia' ? 'block' : 'hidden'}><CareerGuidesManager /></div>
                  <div className={activeTab === 'insignias-models' ? 'block' : 'hidden'}><InsigniasModelManager /></div>
                  <div className={activeTab === 'verifications' ? 'block' : 'hidden'}><VerificationsManager /></div>
                  <div className={activeTab === 'stats' ? 'block' : 'hidden'}><AdminStatsManager /></div>
                  <div className={activeTab === 'plans' ? 'block' : 'hidden'}><PlansAndCouponsManager /></div>
                  <div className={activeTab === 'connections' ? 'block' : 'hidden'}><ConnectionsManager /></div>
                  <div className={activeTab === 'branding' ? 'block' : 'hidden'}><BrandingManager /></div>
                  <div className={activeTab === 'recursos' ? 'block' : 'hidden'}><FeaturesManager /></div>
                  <div className={activeTab === 'testers' ? 'block' : 'hidden'}><StrategicTestersManager /></div>
                </div>
              );

              return (
                <>
                  {/* Mobile: Sheet menu + floating button */}
                  {isMobile ? (
                    <div className="space-y-4">
                      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                          <Button variant="outline" className="w-full justify-between gap-2">
                            <span className="flex items-center gap-2">
                              {currentTab && <currentTab.icon className="w-4 h-4" />}
                              {currentTab?.label || 'Menu'}
                            </span>
                            <Menu className="w-4 h-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="pb-8 max-h-[70vh]">
                          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Navegação</h3>
                          {renderTabButtons(() => setMobileMenuOpen(false))}
                        </SheetContent>
                      </Sheet>
                      {contentJsx}
                    </div>
                  ) : (
                    /* Desktop: side nav */
                    <div className="flex gap-6">
                      <aside className="w-56 shrink-0 h-fit sticky top-24">
                        <div className="bg-card border border-border rounded-xl p-3 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-none">
                          {renderTabButtons()}
                        </div>
                      </aside>
                      <div className="flex-1 min-w-0">
                        {contentJsx}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}
      </main>
    </div>
  );
}
