import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plane, BookOpen, Crown, ArrowRight, Timer, Zap, Layers, ShieldCheck, Lock, BadgeCheck, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { usePlan } from '@/hooks/usePlan';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
  const { canAccessModoLivre, canAccessModoBloco, canAccessModoBanca } = usePlan();
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedProfession, setSelectedProfession] = useState<ProfessionWithBlocks | null>(null);
  
  // Modais de conversão
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'banca' | 'bloco'>('banca');

  const { data: professions, isLoading } = useQuery({
    queryKey: ['professions-with-blocks'],
    queryFn: async () => {
      try {
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
      } catch (err) {
        console.error('Error in queryFn:', err);
        return [];
      }
    },
  });

  const handleStartSimulado = (professionId: string, mode: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (mode === 'banca_anac' && !canAccessModoBanca) {
      setUpgradeReason('banca');
      setShowUpgradeModal(true);
      return;
    }
    
    navigate(`/simulado-profissao/${professionId}?modo=${mode}`);
  };

  const handleOpenBlockSelection = (profession: ProfessionWithBlocks) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!canAccessModoBloco) {
      setUpgradeReason('bloco');
      setShowUpgradeModal(true);
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`w-full h-11 justify-start rounded-[5px] border-border/50 transition-all ${!canAccessModoBanca ? 'bg-muted/30 opacity-80' : 'hover-yellow'}`} 
                            onClick={() => handleStartSimulado(profession.id, 'banca_anac')}
                          >
                            <Timer className={`w-4 h-4 mr-3 ${!canAccessModoBanca ? 'text-muted-foreground' : 'text-[#F7CE87]'}`} />
                            <span className={!canAccessModoBanca ? 'text-muted-foreground' : ''}>Modo Banca</span>
                            {!canAccessModoBanca ? <Lock className="w-3 h-3 ml-auto text-muted-foreground/50" /> : <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
                          </Button>
                        )}
                        {profession.active_modes?.includes('livre') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full h-11 justify-start rounded-[5px] hover-yellow border-border/50" 
                            onClick={() => handleStartSimulado(profession.id, 'livre')}
                          >
                            <Zap className="w-4 h-4 mr-3 text-accent" />Modo Livre<ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        )}
                        {profession.block_count > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`w-full h-11 justify-start rounded-[5px] border-border/50 transition-all ${!canAccessModoBloco ? 'bg-muted/30 opacity-80' : 'hover-yellow'}`} 
                            onClick={() => handleOpenBlockSelection(profession)}
                          >
                            <Layers className={`w-4 h-4 mr-3 ${!canAccessModoBloco ? 'text-muted-foreground' : 'text-warning'}`} />
                            <span className={!canAccessModoBloco ? 'text-muted-foreground' : ''}>Modo Bloco</span>
                            {!canAccessModoBloco ? <Lock className="w-3 h-3 ml-auto text-muted-foreground/50" /> : <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
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

        {/* Modal de Autenticação */}
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="max-w-md rounded-[5px] p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-gradient-to-br from-primary via-primary to-primary/90 p-8 text-white relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Plane className="w-24 h-24 rotate-12" />
              </div>
              <div className="w-16 h-16 rounded-[5px] bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/20">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight uppercase">Sua jornada começa aqui</h3>
              <p className="text-white/70 text-sm font-medium leading-relaxed">Crie sua conta gratuita em segundos para salvar seu progresso e acessar o Modo Livre.</p>
            </div>
            <div className="p-8 space-y-4 bg-white">
              <div className="space-y-3">
                <Button variant="hero" className="w-full h-12 rounded-[5px] font-bold text-base shadow-lg shadow-primary/20" onClick={() => navigate('/auth')}>
                  Criar minha conta agora <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" className="w-full h-12 rounded-[5px] font-bold border-border/60 hover:bg-muted" onClick={() => setShowAuthModal(false)}>
                  Talvez mais tarde
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest pt-2">Já tem conta? <span className="text-primary cursor-pointer hover:underline" onClick={() => navigate('/auth')}>Entrar</span></p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Upgrade */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="max-w-md rounded-[5px] p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-gradient-to-br from-accent via-accent to-accent/90 p-8 text-accent-foreground relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Crown className="w-24 h-24 rotate-12" />
              </div>
              <div className="w-16 h-16 rounded-[5px] bg-black/5 backdrop-blur-sm flex items-center justify-center mb-6 border border-black/10">
                <Sparkles className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight uppercase">
                {upgradeReason === 'banca' ? 'Desbloqueie o Modo Banca' : 'Desbloqueie o Modo Bloco'}
              </h3>
              <p className="text-accent-foreground/70 text-sm font-bold leading-relaxed">
                Este recurso é exclusivo para assinantes. Estude com questões oficiais e tenha acesso à IA explicativa.
              </p>
            </div>
            <div className="p-8 bg-white">
              <div className="space-y-4 mb-6">
                {[
                  'Simulados padrão ANAC Ilimitados',
                  'Chat de IA para tirar todas as suas dúvidas',
                  'Relatórios de desempenho por matéria',
                  'Insígnias e medalhas exclusivas'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-sm font-bold text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <Button variant="hero" className="w-full h-12 rounded-[5px] font-bold text-base bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 border-none" onClick={() => navigate('/premium')}>
                   Ver Planos e Assinar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="ghost" className="w-full h-12 rounded-[5px] font-bold text-muted-foreground" onClick={() => setShowUpgradeModal(false)}>
                  Agora não, quero continuar grátis
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
