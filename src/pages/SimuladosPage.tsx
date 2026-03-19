import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plane, Clock, Brain, BookOpen, Crown, ArrowRight, Loader2, Play, FileQuestion, Timer, Zap, Layers, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { usePlan } from '@/hooks/usePlan';
import { PlanGate } from '@/components/PlanGate';
import { toast } from 'sonner';
import { PageTransition } from '@/components/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';

interface BlockInfo {
  id: string;
  name: string;
}

interface ProfessionWithBlocks {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean | null;
  active_modes: string[] | null;
  total_time: number | null;
  block_count: number;
  question_count: number;
  blocks: BlockInfo[];
}

export default function SimuladosPage() {
  const navigate = useNavigate();
  const { canAccessSimulados, isLoggedIn } = usePlan();
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedProfession, setSelectedProfession] = useState<ProfessionWithBlocks | null>(null);

  const { data: professions, isLoading } = useQuery({
    queryKey: ['professions-with-blocks'],
    queryFn: async () => {
      const { data: cats, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const { data: blocks } = await supabase.from('subcategories').select('id, name, category_id').order('name');
      const { data: questions } = await supabase.from('questions').select('category_id');

      const blockCountMap = (blocks || []).reduce((acc, b) => {
        acc[b.category_id] = (acc[b.category_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const blocksMap = (blocks || []).reduce((acc, b) => {
        if (!acc[b.category_id]) acc[b.category_id] = [];
        acc[b.category_id].push({ id: b.id, name: b.name });
        return acc;
      }, {} as Record<string, BlockInfo[]>);

      const questionCountMap = (questions || []).reduce((acc, q) => {
        acc[q.category_id] = (acc[q.category_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return (cats || [])
        .map(cat => ({
          ...cat,
          block_count: blockCountMap[cat.id] || 0,
          question_count: questionCountMap[cat.id] || 0,
          blocks: blocksMap[cat.id] || [],
        }))
        .filter(cat => cat.question_count > 0) as ProfessionWithBlocks[];
    },
  });

  const handleStartSimulado = (professionId: string, mode: string) => {
    if (!canAccessSimulados) {
      toast.error('Assine o plano Solo ou superior para acessar simulados', {
        action: { label: 'Ver Planos', onClick: () => navigate('/premium') },
      });
      return;
    }
    navigate(`/simulado-profissao/${professionId}?modo=${mode}`);
  };

  const handleOpenBlockSelection = (profession: ProfessionWithBlocks) => {
    if (!canAccessSimulados) {
      toast.error('Assine o plano para acessar simulados', {
        action: { label: 'Ver Planos', onClick: () => navigate('/premium') },
      });
      return;
    }
    setSelectedProfession(profession);
    setBlockDialogOpen(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        <section className="pt-24 pb-12 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-4">
                <Plane className="w-4 h-4" />
                <span className="text-sm font-medium">Simulados Voo Certo</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Escolha sua Profissão</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Pratique com simulados específicos para cada profissão. Escolha entre o modo cronometrado ou livre.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8">Profissões Disponíveis</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-6 rounded-2xl border border-border bg-card h-[280px] space-y-4">
                    <div className="flex justify-between">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <Skeleton className="w-20 h-6 rounded-full" />
                    </div>
                    <Skeleton className="w-3/4 h-6" />
                    <Skeleton className="w-full h-16" />
                    <div className="space-y-2 pt-2">
                      <Skeleton className="w-full h-9 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : professions?.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma profissão disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professions?.map((profession, index) => (
                  <motion.div key={profession.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-card-hover hover:border-primary/50 transition-all h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{profession.icon || '✈️'}</div>
                        <div className="flex gap-2">
                          <Badge variant="outline"><Layers className="w-3 h-3 mr-1" />{profession.block_count} blocos</Badge>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-foreground mb-2">{profession.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2 flex-1">{profession.description || 'Simulados para esta profissão.'}</p>
                      <p className="text-xs text-muted-foreground mb-4">{profession.question_count} questões • {profession.total_time || 120} min</p>

                      <div className="space-y-2">
                        {profession.active_modes?.includes('banca_anac') && (
                          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleStartSimulado(profession.id, 'banca_anac')}>
                            <Timer className="w-4 h-4 mr-2 text-primary" />Modo Banca<ArrowRight className="w-4 h-4 ml-auto" />
                          </Button>
                        )}
                        {profession.active_modes?.includes('livre') && (
                          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleStartSimulado(profession.id, 'livre')}>
                            <Zap className="w-4 h-4 mr-2 text-accent" />Modo Livre<ArrowRight className="w-4 h-4 ml-auto" />
                          </Button>
                        )}
                        {profession.block_count > 0 && (
                          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleOpenBlockSelection(profession)}>
                            <Layers className="w-4 h-4 mr-2 text-warning" />Modo Bloco<ArrowRight className="w-4 h-4 ml-auto" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="p-8 rounded-2xl bg-primary text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2"><Crown className="w-6 h-6 text-accent" /><span className="font-semibold">Voo Certo Premium</span></div>
                <h3 className="text-2xl font-bold mb-2">Acesso ilimitado a todos os simulados</h3>
                <p className="text-primary-foreground/70">Desbloqueie questões exclusivas e relatórios avançados.</p>
              </div>
              <Button variant="hero" size="lg" asChild><Link to="/premium">Ver Planos</Link></Button>
            </div>
          </div>
        </section>

        <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Escolha o Bloco</DialogTitle>
              <DialogDescription className="hidden">Selecione um bloco para o simulado.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4 max-h-[60vh] overflow-y-auto">
              {selectedProfession?.blocks?.length === 0 && (
                <p className="text-muted-foreground text-sm">Nenhum bloco cadastrado para esta profissão.</p>
              )}
              {selectedProfession?.blocks?.map(block => (
                <Button
                  key={block.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 border-accent/20 hover:border-accent hover:bg-accent/5"
                  onClick={() => {
                    setBlockDialogOpen(false);
                    navigate(`/simulado-profissao/${selectedProfession.id}?modo=bloco&bloco_id=${block.id}&nome_bloco=${encodeURIComponent(block.name)}`);
                  }}
                >
                  <div className="flex items-center">
                    <span className="mr-3 text-2xl">📚</span>
                    <span className="font-medium">{block.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </PageTransition>
  );
}
