import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  ArrowLeft, ArrowRight, BookOpen, GraduationCap, CheckCircle2, Lock, Crown, Plane, Map as MapIcon, Star, Target, Loader2
} from 'lucide-react';

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

  const completedStepIds = new Set((progress || []).filter(p => p.completed).map(p => p.step_id));
  const totalSteps = guide?.steps?.length || 0;
  const completedCount = totalSteps > 0 ? guide!.steps!.filter(s => completedStepIds.has(s.id)).length : 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const getSimuladoLabel = (id: string) => {
    const opt = simuladoOptions?.find(o => o.id === id);
    if (!opt) return 'Simulado';
    return opt.type === 'subcategory' && opt.parentName ? `${opt.parentName} - ${opt.name}` : opt.name;
  };

  const getSimuladoLink = (id: string) => {
    const opt = simuladoOptions?.find(o => o.id === id);
    if (!opt) return '/simulados';
    return opt.type === 'category' ? `/simulados?category=${id}` : `/simulados?block=${id}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Plane className="w-16 h-16 text-accent animate-bounce mb-8" />
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Modern Detail Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-[#0A192F] text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
        </div>
        
        <div className="container mx-auto px-4 z-10 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 max-w-6xl mx-auto">
            <div className="flex-1">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => navigate('/guia-carreira')}
                   className="text-white/60 hover:text-white hover:bg-white/10 -ml-2 mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar aos Guias
                </Button>
                <div className="flex items-center gap-3 mb-6">
                  <Badge variant="outline" className="px-4 py-1.5 rounded-full border-accent/30 bg-accent/10 text-accent text-[10px] font-black tracking-[0.2em] uppercase">
                    <MapIcon className="w-3 h-3 mr-2" /> Sua Rota de Voo
                  </Badge>
                  <Badge className="bg-primary/20 border-primary/40 text-primary-foreground font-black text-[10px] tracking-widest uppercase">
                    Aviation Roadmap
                  </Badge>
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-black tracking-tighter mb-4"
              >
                {isLoading ? <Skeleton className="h-16 w-3/4 bg-white/10" /> : guide?.title}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-white/60 text-lg md:text-xl font-medium max-w-2xl"
              >
                {isLoading ? <Skeleton className="h-6 w-full bg-white/10 mt-4" /> : guide?.description}
              </motion.p>
            </div>

            {/* Circular Progress Widget */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.3 }}
              className="relative p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-3xl flex flex-col items-center justify-center text-center min-w-[240px]"
            >
              <div className="relative w-32 h-32 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                  <motion.circle 
                    cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                    strokeDasharray={364} strokeDashoffset={364 - (364 * progressPercent) / 100}
                    initial={{ strokeDashoffset: 364 }}
                    animate={{ strokeDashoffset: 364 - (364 * progressPercent) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-accent" strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">{progressPercent}%</span>
                  <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Aprovado</span>
                </div>
              </div>
              <p className="text-sm font-black uppercase tracking-wider mb-1">Status da Rota</p>
              <p className="text-xs text-white/40 font-bold">{completedCount} de {totalSteps} etapas concluídas</p>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="py-24 bg-background relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-[20%] left-[5%] opacity-[0.03] pointer-events-none rotate-12 flex flex-col gap-24">
          <Plane className="w-96 h-96" />
          <Target className="w-64 h-64" />
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-[2.5rem]" />)}
            </div>
          ) : (
            <div className="relative">
              {/* Modern Timeline Path */}
              <div className="absolute left-[24px] md:left-[32px] top-12 bottom-12 w-[3px] bg-gradient-to-b from-accent/20 via-muted to-muted z-0" />

              <div className="space-y-12 relative z-10">
                {guide?.steps?.map((step, index) => {
                  const isCompleted = completedStepIds.has(step.id);
                  const isLastCompleted = index > 0 && completedStepIds.has(guide.steps[index - 1]?.id);
                  const isCurrent = !isCompleted && (index === 0 || isLastCompleted);
                  const isLocked = !isCompleted && !isCurrent;
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className={`group flex gap-6 md:gap-10 ${isLocked ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
                    >
                      {/* Interactive Step Marker */}
                      <div className="relative shrink-0 pt-2">
                        <motion.div 
                          whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                          onClick={() => toggleProgress.mutate({ stepId: step.id, guideId: guideId!, completed: !isCompleted })}
                          className={`
                            w-12 h-12 md:w-16 md:h-16 rounded-[2rem] flex items-center justify-center cursor-pointer transition-all duration-500 shadow-xl
                            ${isCompleted ? 'bg-success text-white rotate-[360deg] shadow-success/30' : 
                              isCurrent ? 'bg-accent text-white ring-8 ring-accent/10 border-4 border-white shadow-accent/30 scale-110' : 
                              'bg-card border-2 border-muted-foreground/10 text-muted-foreground hover:border-accent hover:text-accent shadow-sm'}
                          `}
                        >
                          <AnimatePresence mode="wait">
                            {isCompleted ? (
                              <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
                              </motion.div>
                            ) : (
                              <motion.span key="num" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg md:text-xl font-black">
                                {index + 1}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </div>

                      {/* Premium Content Card */}
                      <div className="flex-1 min-w-0">
                        <Card className={`
                          rounded-[2.5rem] border-2 transition-all duration-700 overflow-hidden
                          ${isCompleted ? 'bg-slate-50 border-muted opacity-80' : 
                            isCurrent ? 'bg-white border-accent shadow-2xl shadow-accent/10' : 
                            'bg-card border-muted'}
                        `}>
                          <CardHeader className="p-8 md:p-10 pb-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <h3 className={`text-xl md:text-2xl font-black tracking-tight transition-colors ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                  {step.title}
                                </h3>
                                {step.description && (
                                  <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed font-medium">
                                    {step.description}
                                  </p>
                                )}
                              </div>
                              {isCurrent && (
                                <Badge className="bg-accent text-white border-0 font-black text-[10px] tracking-widest px-3 h-6 flex items-center justify-center rounded-full animate-pulse shrink-0">
                                  OBJETIVO ATUAL
                                </Badge>
                              )}
                            </div>
                          </CardHeader>

                          {(step.simulado_ids?.length > 0 || step.microcourse_ids?.length > 0) && (
                            <CardContent className="p-8 md:p-10 pt-0">
                              {!canAccessGuideContent ? (
                                <div className="mt-6 flex flex-col md:flex-row md:items-center gap-6 p-8 rounded-[2rem] bg-slate-50 border border-muted group/lock overflow-hidden relative">
                                  <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover/lock:opacity-10 transition-opacity">
                                    <Crown className="w-24 h-24" />
                                  </div>
                                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                    <Lock className="w-8 h-8 text-primary/40" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-lg font-black text-foreground mb-1 tracking-tight">Recursos Premium Bloqueados</h4>
                                    <p className="text-muted-foreground font-medium text-sm">Assine o plano para desbloquear simulados oficiais e microcursos desta etapa.</p>
                                  </div>
                                  <Button variant="hero" className="shrink-0 h-12 px-8 rounded-2xl" asChild>
                                    <Link to="/premium"><Crown className="w-4 h-4 mr-2" /> Upgrade</Link>
                                  </Button>
                                </div>
                              ) : (
                                <div className="mt-8 space-y-6">
                                  <div className="h-px bg-muted w-full" />
                                  <div>
                                    <div className="flex items-center gap-2 mb-4">
                                      <Star className="w-4 h-4 text-accent fill-accent" />
                                      <span className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Materiais desta Etapa</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {step.simulado_ids?.map(id => (
                                        <Link key={id} to={getSimuladoLink(id)} className="group/link">
                                          <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-muted hover:border-accent bg-background hover:bg-slate-50 transition-all duration-300 shadow-sm">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover/link:bg-accent group-hover/link:text-white transition-colors shrink-0">
                                                <Plane className="w-5 h-5 text-accent group-hover/link:text-current" />
                                              </div>
                                              <span className="text-sm font-bold truncate group-hover/link:text-accent transition-colors">
                                                {getSimuladoLabel(id)}
                                              </span>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-muted-foreground opacity-20 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                                          </div>
                                        </Link>
                                      ))}
                                      {step.microcourse_ids?.map(id => (
                                        <Link key={id} to="/microcursos" className="group/link">
                                          <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-muted hover:border-primary bg-background hover:bg-slate-50 transition-all duration-300 shadow-sm">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover/link:bg-primary group-hover/link:text-white transition-colors shrink-0">
                                                <GraduationCap className="w-5 h-5 text-primary group-hover/link:text-current" />
                                              </div>
                                              <span className="text-sm font-bold truncate group-hover/link:text-primary transition-colors">
                                                {microcourseMap?.get(id) || 'Microcurso'}
                                              </span>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-muted-foreground opacity-20 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                                          </div>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Final Completion Message */}
              {progressPercent === 100 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-20 p-12 rounded-[3.5rem] bg-gradient-to-br from-primary to-slate-900 text-center text-white border-4 border-accent shadow-3xl">
                  <Trophy className="w-20 h-20 text-accent mx-auto mb-6" />
                  <h2 className="text-4xl font-black mb-4">Rota Concluída!</h2>
                  <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto font-medium">Você completou todas as etapas deste guia. Sua preparação está em um nível de excelência para a ANAC.</p>
                  <Button variant="hero" size="xl" onClick={() => navigate('/simulados')} className="h-16 px-10 rounded-2xl">
                    Praticar no Simulado <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Re-using Trophy icon locally
const Trophy = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);
