import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  useCareerGuideWithSteps,
  useGuideStepProgress,
  useToggleStepProgress,
} from '@/hooks/useCareerGuides';
import { useSimuladoOptions } from '@/hooks/useGuiaEtapas';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import {
  ArrowLeft, ArrowRight, BookOpen, GraduationCap, CheckCircle2, Lock, Crown, Plane, Sparkles,
  PlayCircle, MapPin, Navigation, ListFilter, Map as MapIcon, X, Check
} from 'lucide-react';
import { toast } from 'sonner';

function useMicrocourseMap() {
  return useQuery({
    queryKey: ['microcourse-map'],
    queryFn: async () => {
      const { data } = await supabase.from('microcourses').select('id, title').eq('is_active', true);
      return new Map((data || []).map(m => [m.id, m.title]));
    },
  });
}

export default function GuiaCarreiraDetailPage() {
  const { guideId } = useParams<{ guideId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { canAccessGuideContent } = usePlan();
  const { data: guide, isLoading } = useCareerGuideWithSteps(guideId);
  const { data: progress } = useGuideStepProgress(guideId);
  const toggleProgress = useToggleStepProgress();
  const { data: simuladoOptions } = useSimuladoOptions();
  const { data: microcourseMap } = useMicrocourseMap();

  // Visualização: 'map' (Rota de Voo com Pins) ou 'list' (Visão em Lista)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Modal para detalhar a etapa ao clicar no Pin
  const [selectedStepModal, setSelectedStepModal] = useState<{ step: any; index: number } | null>(null);

  const completedStepIds = new Set((progress || []).filter(p => p.completed).map(p => p.step_id));
  const totalSteps = guide?.steps?.length || 0;
  const completedCount = totalSteps > 0 ? guide!.steps!.filter(s => completedStepIds.has(s.id)).length : 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const getSimuladoLabel = (item: string) => {
    const [id, mode] = item.split(':');
    const opt = simuladoOptions?.find(o => o.id === id);
    if (!opt) return 'Simulado';
    const baseName = opt.type === 'subcategory' && opt.parentName ? `${opt.parentName} - ${opt.name}` : opt.name;
    if (mode === 'banca_anac') return `${baseName} (Modo Banca)`;
    if (mode === 'livre') return `${baseName} (Modo Livre)`;
    if (mode === 'bloco') return `${baseName} (Modo Bloco)`;
    return baseName;
  };

  const getSimuladoLink = (item: string) => {
    const [id, mode] = item.split(':');
    const opt = simuladoOptions?.find(o => o.id === id);
    if (!opt) return '/simulados';
    
    if (mode) {
      if (opt.type === 'category') {
        return `/simulado-profissao/${id}?modo=${mode}`;
      } else {
        return `/simulado-profissao/${opt.categoryId}?modo=${mode}&bloco_id=${id}&nome_bloco=${encodeURIComponent(opt.name)}`;
      }
    }
    
    if (opt.type === 'category') {
      return `/simulados`;
    } else {
      return `/simulado-profissao/${opt.categoryId}?modo=bloco&bloco_id=${id}&nome_bloco=${encodeURIComponent(opt.name)}`;
    }
  };

  const renderDescription = (text: string) => {
    if (!text) return null;
    
    const parseLinks = (line: string) => {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = linkRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <a 
            key={`link-${match.index}`} 
            href={match[2]} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline font-bold transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {match[1]}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
      return parts.length > 0 ? parts : line;
    };

    const lines = text.split('\n');
    return (
      <div className="space-y-3 mt-3">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;
          
          if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
            const content = trimmed.substring(1).trim();
            return (
              <div key={idx} className="flex items-start gap-2.5 my-2 pl-1">
                <span className="w-5 h-5 mt-0.5 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <span className="text-muted-foreground text-sm font-medium leading-relaxed">
                  {parseLinks(content)}
                </span>
              </div>
            );
          }
          
          return (
            <p key={idx} className="text-muted-foreground text-sm leading-relaxed">
              {parseLinks(line)}
            </p>
          );
        })}
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Plane className="w-10 h-10 text-primary animate-bounce" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden bg-primary text-primary-foreground min-h-[280px] flex items-end">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-accent blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[50%] rounded-full bg-sky-400 blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 z-10 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-3"
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/guia-carreira')}
                  className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 -ml-2 rounded-[5px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
                <Badge variant="outline" className="border-amber-400/40 text-amber-300 bg-amber-400/10 rounded-[5px]">
                  Plano de Voo & Carreira
                </Badge>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-black tracking-tight mb-2"
              >
                {isLoading ? <Skeleton className="h-10 w-64 bg-white/20" /> : guide?.title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-primary-foreground/80 text-base md:text-lg max-w-xl"
              >
                {isLoading ? <Skeleton className="h-4 w-full bg-white/20 mt-2" /> : guide?.description}
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[5px] p-5 flex flex-col items-center justify-center text-center min-w-[210px] shrink-0"
            >
              <div className="relative w-18 h-18 mb-2 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="36"
                    cy="36"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={201}
                    strokeDashoffset={201 - (201 * progressPercent) / 100}
                    className="text-amber-400 transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-lg font-black">{progressPercent}<span className="text-[10px]">%</span></span>
              </div>
              <p className="text-xs font-bold text-primary-foreground uppercase tracking-wider">Progresso de Voo</p>
              <p className="text-[11px] text-primary-foreground/70">{completedCount} de {totalSteps} etapas concluídas</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="py-10 bg-background relative">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Controls Bar: Switch View Mode */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-black text-foreground">Rota de Aprendizado & Carreira</h2>
            </div>

            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-[5px] border border-border">
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="gap-1.5 text-xs font-bold h-8 rounded-[5px]"
              >
                <MapIcon className="w-3.5 h-3.5" />
                Rota de Voo (Pins)
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-1.5 text-xs font-bold h-8 rounded-[5px]"
              >
                <ListFilter className="w-3.5 h-3.5" />
                Visão em Lista
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6 py-8">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-[5px]" />)}
            </div>
          ) : viewMode === 'map' ? (

            /* ================================================================= */
            /* VISUALIZAÇÃO 1: ROTA DE VOO COM PINS NUMERADOS (INTERATIVO)       */
            /* ================================================================= */
            <div className="relative py-8 px-2 sm:px-6 bg-muted/20 border border-border rounded-[5px] shadow-sm overflow-hidden">
              
              {/* Background flight chart grid lines pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="text-center mb-8 max-w-md mx-auto relative z-10">
                <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold">
                  Clique nos Pins para ver as orientações
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Navegue pela rota de voo abaixo. Clique no Pin numerado de cada etapa para abrir as instruções detalhadas e conteúdos.
                </p>
              </div>

              {/* Flight Path Container with Zig-zag Pins */}
              <div className="relative max-w-3xl mx-auto py-6">

                {/* Vertical Winding Flight Route Line */}
                <div className="absolute left-1/2 top-10 bottom-10 w-1 -translate-x-1/2 bg-dashed border-r-2 border-dashed border-primary/30 z-0" />

                <div className="space-y-16 sm:space-y-20 relative z-10">
                  {guide?.steps?.map((step, index) => {
                    const isCompleted = completedStepIds.has(step.id);
                    const isCurrent = !isCompleted && (index === 0 || completedStepIds.has(guide.steps[index - 1]?.id));
                    const isLeft = index % 2 === 0; // Alterna posições esquerda/direita dos Pins

                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-4 sm:gap-8 ${
                          isLeft ? 'flex-row' : 'flex-row-reverse'
                        }`}
                      >
                        {/* Card Preview ao lado do Pin */}
                        <div className={`flex-1 text-${isLeft ? 'right' : 'left'} hidden sm:block`}>
                          <div
                            onClick={() => setSelectedStepModal({ step, index })}
                            className={`inline-block text-left p-4 rounded-[5px] border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                              isCompleted 
                                ? 'bg-success/5 border-success/30 hover:border-success' 
                                : isCurrent 
                                  ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-500 ring-2 ring-amber-500/20' 
                                  : 'bg-card border-border hover:border-primary/40'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase text-muted-foreground">Etapa {index + 1}</span>
                              {isCompleted && (
                                <Badge variant="secondary" className="text-[9px] bg-success/20 text-success font-bold">
                                  Concluído
                                </Badge>
                              )}
                              {isCurrent && (
                                <Badge variant="secondary" className="text-[9px] bg-amber-500/20 text-amber-600 font-bold animate-pulse">
                                  Atual
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-foreground line-clamp-1">{step.title}</h4>
                            <p className="text-[11px] text-primary hover:underline font-bold mt-1.5 flex items-center gap-1">
                              <span>Abrir orientações</span>
                              <ArrowRight className="w-3 h-3" />
                            </p>
                          </div>
                        </div>

                        {/* PIN NUMERADO DA ROTA (ESTILO MARCADOR ANAC/AVIATION MAP PIN) */}
                        <div className="relative shrink-0 mx-auto sm:mx-0">
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedStepModal({ step, index })}
                            className="relative flex flex-col items-center group cursor-pointer focus:outline-none"
                          >
                            {/* Aviation Pin Drop Shape */}
                            <div
                              className={`
                                w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-2 relative z-10
                                ${
                                  isCompleted
                                    ? 'bg-success border-white text-white shadow-success/40'
                                    : isCurrent
                                      ? 'bg-amber-500 border-white text-white shadow-amber-500/50 ring-4 ring-amber-400/30 animate-pulse'
                                      : 'bg-primary border-white text-white shadow-primary/30 hover:bg-sky-600'
                                }
                              `}
                            >
                              {isCompleted ? (
                                <Check className="w-8 h-8 stroke-[3]" />
                              ) : (
                                <span className="text-xl sm:text-2xl font-black font-mono">{index + 1}</span>
                              )}

                              {/* Pointer Needle at bottom */}
                              <div
                                className={`
                                  absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 
                                  border-l-[8px] border-l-transparent 
                                  border-r-[8px] border-r-transparent 
                                  border-t-[10px]
                                  ${isCompleted ? 'border-t-success' : isCurrent ? 'border-t-amber-500' : 'border-t-primary'}
                                `}
                              />
                            </div>

                            {/* Label Mobile abaixo do Pin */}
                            <div className="sm:hidden mt-3 text-center max-w-[160px]">
                              <span className="text-[10px] font-black text-primary uppercase">Etapa {index + 1}</span>
                              <p className="text-xs font-bold text-foreground line-clamp-2">{step.title}</p>
                            </div>
                          </motion.button>
                        </div>

                        {/* Espaçador oposto no desktop para manter alinhamento */}
                        <div className="flex-1 hidden sm:block" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (

            /* ================================================================= */
            /* VISUALIZAÇÃO 2: VISÃO EM LISTA EXPANDIDA                         */
            /* ================================================================= */
            <div className="space-y-6">
              {guide?.steps?.map((step, index) => {
                const isCompleted = completedStepIds.has(step.id);
                const isCurrent = !isCompleted && (index === 0 || completedStepIds.has(guide.steps[index - 1]?.id));

                return (
                  <Card
                    key={step.id}
                    className={`rounded-[5px] border transition-all ${
                      isCompleted ? 'bg-card/50 opacity-80' : isCurrent ? 'bg-card ring-2 ring-amber-500/30 border-amber-500/40 shadow-md' : 'bg-card border-border'
                    }`}
                  >
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => toggleProgress.mutate({ stepId: step.id, guideId: guideId!, completed: !isCompleted })}
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition-transform hover:scale-105 shrink-0 ${
                              isCompleted ? 'bg-success text-white' : isCurrent ? 'bg-amber-500 text-white' : 'bg-primary text-white'
                            }`}
                          >
                            {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-foreground">{step.title}</h3>
                            <p className="text-xs text-muted-foreground">Etapa {index + 1} de {totalSteps}</p>
                          </div>
                        </div>

                        <Button
                          variant={isCompleted ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => toggleProgress.mutate({ stepId: step.id, guideId: guideId!, completed: !isCompleted })}
                          className="gap-1.5 text-xs font-bold rounded-[5px] shrink-0"
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Check className="w-4 h-4" />}
                          {isCompleted ? 'Concluída' : 'Marcar como Concluída'}
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 space-y-4">
                      {step.description && renderDescription(step.description)}

                      {(step.simulado_ids?.length > 0 || step.microcourse_ids?.length > 0) && (
                        <div className="pt-3 border-t border-border">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-primary" /> Recursos da Etapa:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {step.simulado_ids?.map(id => (
                              <Link key={id} to={getSimuladoLink(id)} className="block group">
                                <div className="p-3 rounded-[5px] border border-border bg-muted/30 hover:border-primary flex items-center justify-between transition-colors">
                                  <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary">{getSimuladoLabel(id)}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                                </div>
                              </Link>
                            ))}
                            {step.microcourse_ids?.map(id => (
                              <Link key={id} to="/microcursos" className="block group">
                                <div className="p-3 rounded-[5px] border border-border bg-muted/30 hover:border-primary flex items-center justify-between transition-colors">
                                  <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary">{microcourseMap?.get(id) || 'Microcurso'}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* =================================================================== */}
      {/* MODAL DETALHADO AO CLICAR NO PIN DO MAPA                           */}
      {/* =================================================================== */}
      <Dialog open={!!selectedStepModal} onOpenChange={(open) => !open && setSelectedStepModal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-[5px] border-border bg-card">
          {selectedStepModal && (
            <>
              {/* Header do Modal */}
              <div className="bg-primary text-primary-foreground p-6 relative border-b border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-900 font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                      {selectedStepModal.index + 1}
                    </div>
                    <div>
                      <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-300 bg-amber-400/10 rounded-[5px] mb-1">
                        Etapa {selectedStepModal.index + 1} de {totalSteps}
                      </Badge>
                      <DialogTitle className="text-xl font-black text-primary-foreground leading-tight">
                        {selectedStepModal.step.title}
                      </DialogTitle>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-primary" /> O que deve ser feito nesta etapa:
                  </h4>
                  {renderDescription(selectedStepModal.step.description)}
                </div>

                {/* Recursos da etapa */}
                {(selectedStepModal.step.simulado_ids?.length > 0 || selectedStepModal.step.microcourse_ids?.length > 0) && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-primary" /> Simulados e Cursos para esta etapa:
                    </h4>
                    
                    {!canAccessGuideContent ? (
                      <div className="p-4 rounded-[5px] bg-primary/5 border border-primary/10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Lock className="w-5 h-5 text-primary" />
                          <span className="text-xs text-muted-foreground font-medium">Assine o plano para liberar os exercícios desta etapa.</span>
                        </div>
                        <Button size="sm" asChild className="rounded-[5px] text-xs font-bold">
                          <Link to="/premium"><Crown className="w-3.5 h-3.5 mr-1" /> Upgrade</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedStepModal.step.simulado_ids?.map((id: string) => (
                          <Link key={id} to={getSimuladoLink(id)} onClick={() => setSelectedStepModal(null)} className="block group">
                            <div className="p-3.5 rounded-[5px] border border-border bg-muted/40 hover:bg-white hover:border-primary flex items-center justify-between transition-all shadow-sm">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <Plane className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-xs font-bold text-foreground truncate group-hover:text-primary">
                                  {getSimuladoLabel(id)}
                                </span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                            </div>
                          </Link>
                        ))}
                        {selectedStepModal.step.microcourse_ids?.map((id: string) => (
                          <Link key={id} to="/microcursos" onClick={() => setSelectedStepModal(null)} className="block group">
                            <div className="p-3.5 rounded-[5px] border border-border bg-muted/40 hover:bg-white hover:border-primary flex items-center justify-between transition-all shadow-sm">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-xs font-bold text-foreground truncate group-hover:text-primary">
                                  {microcourseMap?.get(id) || 'Microcurso'}
                                </span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Botão de Marcar como Concluído */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground font-medium">
                    {completedStepIds.has(selectedStepModal.step.id) ? 'Etapa concluída!' : 'Concluiu esta etapa?'}
                  </span>
                  <Button
                    variant={completedStepIds.has(selectedStepModal.step.id) ? 'outline' : 'default'}
                    onClick={() => {
                      const isComp = completedStepIds.has(selectedStepModal.step.id);
                      toggleProgress.mutate({ stepId: selectedStepModal.step.id, guideId: guideId!, completed: !isComp });
                      setSelectedStepModal(null);
                    }}
                    className="gap-2 font-bold text-xs rounded-[5px]"
                  >
                    <CheckCircle2 className={`w-4 h-4 ${completedStepIds.has(selectedStepModal.step.id) ? 'text-success' : ''}`} />
                    {completedStepIds.has(selectedStepModal.step.id) ? 'Desmarcar Etapa' : 'Marcar Etapa como Concluída'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
