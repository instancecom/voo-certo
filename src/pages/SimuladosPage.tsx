import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plane, BookOpen, Crown, ArrowRight, Timer, Zap, Layers, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { usePlan } from '@/hooks/usePlan';
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
  const { canAccessSimulados } = usePlan();
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

      const resultsMap: Record<string, { blocks: BlockInfo[], questionCount: number }> = {};
      
      await Promise.all((cats || []).map(async (cat) => {
        const [blocksRes, questionsRes] = await Promise.all([
          supabase.from('subcategories').select('id, name').eq('category_id', cat.id).order('name').limit(100),
          supabase.from('questions').select('*', { count: 'exact', head: true }).eq('category_id', cat.id)
        ]);
        
        resultsMap[cat.id] = {
          blocks: (blocksRes.data || []).map(b => ({ id: b.id, name: b.name })),
          questionCount: questionsRes.count || 0
        };
      }));

      return (cats || [])
        .map(cat => ({
          ...cat,
          block_count: resultsMap[cat.id]?.blocks.length || 0,
          question_count: resultsMap[cat.id]?.questionCount || 0,
          blocks: resultsMap[cat.id]?.blocks || [],
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

        <section className="pt-32 pb-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-[5px] text-primary mb-6">
                <Plane className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Plataforma de Treinamento</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tight">Centro de Simulados</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                Nossos simulados são desenvolvidos com base nos padrões reais da ANAC, 
                visando a máxima preparação técnica para sua aprovação.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
               <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Áreas de Conhecimento</h2>
               <div className="h-px flex-1 bg-border/50 mx-6 hidden md:block" />
               <BadgeCheck className="text-success w-5 h-5 hidden md:block mr-2" />
               <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground hidden md:block">Metodologia Padrão ANAC</span>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6 rounded-[5px] border border-border bg-card h-[280px] space-y-4">
                    <div className="flex justify-between">
                      <Skeleton className="w-12 h-12 rounded-[5px]" />
                      <Skeleton className="w-20 h-6 rounded-[5px]" />
                    </div>
                    <Skeleton className="w-3/4 h-6" />
                    <Skeleton className="w-full h-16" />
                  </div>
                ))}
              </div>
            ) : professions?.length === 0 ? (
              <div className="text-center py-20 bg-muted/5 rounded-[5px] border border-dashed">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium italic">Nenhum simulado disponível para esta categoria no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {professions?.map((profession, index) => (
                  <motion.div key={profession.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <div className="p-8 rounded-[5px] bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all h-full flex flex-col group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                         <Plane className="w-32 h-32 rotate-12" />
                      </div>

                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-[5px] bg-primary/5 flex items-center justify-center text-3xl">
                          {profession.icon || '✈️'}
                        </div>
                        <Badge variant="outline" className="rounded-[5px] border-primary/20 bg-primary/5 font-bold uppercase text-[9px] tracking-widest">{profession.block_count} blocos</Badge>
                      </div>

                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{profession.name}</h3>
                      <p className="text-sm text-muted-foreground mb-6 flex-1 font-medium">{profession.description || 'Simulados profissionais de alta performance.'}</p>
                      
                      <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-8">
                         <span className="flex items-center gap-1.5"><Layers className="w-3 h-3" />{profession.question_count} Qs</span>
                         <span className="w-1 h-1 rounded-full bg-border" />
                         <span className="flex items-center gap-1.5"><Timer className="w-3 h-3" />{profession.total_time || 120} min</span>
                      </div>

                      <div className="space-y-2">
                        {profession.active_modes?.includes('banca_anac') && (
                          <Button variant="outline" size="sm" className="w-full h-11 justify-start rounded-[5px] hover-yellow border-border/50" onClick={() => handleStartSimulado(profession.id, 'banca_anac')}>
                            <Timer className="w-4 h-4 mr-3 text-[#F7CE87]" />Modo Banca<ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        )}
                        {profession.active_modes?.includes('livre') && (
                          <Button variant="outline" size="sm" className="w-full h-11 justify-start rounded-[5px] hover-yellow border-border/50" onClick={() => handleStartSimulado(profession.id, 'livre')}>
                            <Zap className="w-4 h-4 mr-3 text-accent" />Modo Livre<ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        )}
                        {profession.block_count > 0 && (
                          <Button variant="outline" size="sm" className="w-full h-11 justify-start rounded-[5px] hover-yellow border-border/50" onClick={() => handleOpenBlockSelection(profession)}>
                            <Layers className="w-4 h-4 mr-3 text-warning" />Modo Bloco<ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
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

        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
             <div className="p-12 rounded-[5px] bg-primary text-primary-foreground relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-[5px] blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10 max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <Crown className="w-8 h-8 text-accent fill-accent/20" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Voo Certo Premium</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black mb-4">Acesso total à elite dos simulados</h3>
                    <p className="text-primary-foreground/70 font-medium">Relatórios de performance avançados, Chat IA ilimitado e muito mais.</p>
                  </div>
                  <Button variant="hero" size="xl" asChild className="rounded-[5px] h-14 px-10 font-bold whitespace-nowrap"><Link to="/premium">Ver Planos de Acesso</Link></Button>
                </div>
             </div>
          </div>
        </section>

        <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
          <DialogContent className="rounded-[5px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Seleção de Bloco</DialogTitle>
              <DialogDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Escolha o conteúdo específico para treinar</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-6 max-h-[60vh] overflow-y-auto pr-2">
              {selectedProfession?.blocks?.length === 0 && (
                <p className="text-muted-foreground text-sm italic py-8 text-center bg-muted/20 rounded-[5px]">Nenhum bloco disponível para esta profissão.</p>
              )}
              {selectedProfession?.blocks?.map(block => (
                <Button
                  key={block.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4 px-5 rounded-[5px] border-border/50 hover-yellow group transition-all"
                  onClick={() => {
                    setBlockDialogOpen(false);
                    navigate(`/simulado-profissao/${selectedProfession.id}?modo=bloco&bloco_id=${block.id}&nome_bloco=${encodeURIComponent(block.name)}`);
                  }}
                >
                  <div className="flex items-center w-full">
                    <div className="w-10 h-10 rounded-[5px] bg-muted flex items-center justify-center mr-4 group-hover:bg-primary/10 transition-colors">
                      <Layers className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <span className="font-bold text-foreground text-sm flex-1">{block.name}</span>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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

import { BadgeCheck } from 'lucide-react';
