import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
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
  ArrowLeft, ArrowRight, BookOpen, GraduationCap, CheckCircle2, Lock, Crown, Plane,
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
      <section className="relative pt-24 pb-12 overflow-hidden bg-primary text-primary-foreground min-h-[300px] flex items-end">
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
                className="flex items-center gap-2 mb-4"
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/guia-carreira')}
                  className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 -ml-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
                <Badge variant="outline" className="border-accent/40 text-accent bg-accent/10">Guia de Carreira</Badge>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2"
              >
                {isLoading ? <Skeleton className="h-10 w-64 bg-white/20" /> : guide?.title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-primary-foreground/80 text-lg max-w-xl"
              >
                {isLoading ? <Skeleton className="h-4 w-full bg-white/20 mt-2" /> : guide?.description}
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[5px] p-6 flex flex-col items-center justify-center text-center min-w-[200px]"
            >
              <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={226}
                    strokeDashoffset={226 - (226 * progressPercent) / 100}
                    className="text-accent transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xl font-bold">{progressPercent}<span className="text-[10px]">%</span></span>
              </div>
              <p className="text-sm font-medium text-primary-foreground">Progresso Geral</p>
              <p className="text-xs text-primary-foreground/60">{completedCount} de {totalSteps} etapas concluídas</p>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="py-12 bg-background relative">
        {/* Subtle background icons for aviation theme */}
        <div className="absolute top-40 right-[10%] opacity-[0.03] pointer-events-none">
          <Plane className="w-64 h-64 -rotate-45" />
        </div>

        <div className="container mx-auto px-4 max-w-4xl">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-[5px]" />)}
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Connector Line */}
              <div className="absolute left-[20px] md:left-[24px] top-6 bottom-6 w-[2px] bg-muted-foreground/10 z-0" />

              <div className="space-y-8 relative z-10">
                {guide?.steps?.map((step, index) => {
                  const isCompleted = completedStepIds.has(step.id);
                  const isCurrent = !isCompleted && (index === 0 || completedStepIds.has(guide.steps[index - 1]?.id));
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group flex gap-4 md:gap-6"
                    >
                      {/* Timeline Icon */}
                      <div className="relative shrink-0 mt-1">
                        <div 
                          onClick={() => toggleProgress.mutate({ stepId: step.id, guideId: guideId!, completed: !isCompleted })}
                          className={`
                            w-10 h-10 md:w-12 md:h-12 rounded-[5px] flex items-center justify-center cursor-pointer transition-all duration-300 ring-offset-background
                            ${isCompleted ? 'bg-success text-white scale-100 shadow-lg shadow-success/20' : 
                              isCurrent ? 'bg-accent text-accent-foreground ring-4 ring-accent/20 scale-110' : 
                              'bg-card border-2 border-muted-foreground/20 text-muted-foreground hover:border-primary/40'}
                          `}
                        >
                          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <span className="text-sm font-bold">{index + 1}</span>}
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 min-w-0">
                        <Card className={`
                          overflow-hidden transition-all duration-500 border-none shadow-sm hover:shadow-md
                          ${isCompleted ? 'bg-card/50 opacity-80' : isCurrent ? 'glass-card border-none scale-[1.01]' : 'bg-card'}
                        `}>
                          <CardHeader className="p-4 md:p-6 pb-2">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h3 className={`text-lg md:text-xl font-bold transition-colors ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                  {step.title}
                                </h3>
                                {step.description && (
                                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap italic opacity-80">
                                    {step.description}
                                  </p>
                                )}
                              </div>
                              {isCurrent && <Badge className="bg-accent/10 text-accent border-accent/20">Em progresso</Badge>}
                            </div>
                          </CardHeader>

                          {(step.simulado_ids?.length > 0 || step.microcourse_ids?.length > 0) && (
                            <CardContent className="p-4 md:p-6 pt-0">
                              {!canAccessGuideContent ? (
                                <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-[5px] bg-primary/5 border border-primary/10">
                                  <div className="bg-primary/10 p-2 rounded-[5px] shrink-0">
                                    <Lock className="w-5 h-5 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Acesso Bloqueado</h4>
                                    <p className="text-[11px] text-muted-foreground">Assine o plano para desbloquear simulados e microcursos deste passo.</p>
                                  </div>
                                  <Button variant="default" size="sm" asChild className="shrink-0 bg-primary hover:bg-primary/90 text-[10px] h-8">
                                    <Link to="/premium"><Crown className="w-3 h-3 mr-1" />Upgrade</Link>
                                  </Button>
                                </div>
                              ) : (
                                <div className="mt-4">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-3 flex items-center gap-2">
                                    <BookOpen className="w-3 h-3" /> Recursos Vinculados
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {step.simulado_ids?.map(id => (
                                      <Link key={id} to={getSimuladoLink(id)} className="block group/link">
                                        <div className="flex items-center justify-between p-3 rounded-[5px] border border-border/50 bg-background/50 hover:bg-white hover:border-accent shadow-sm transition-all">
                                          <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-accent/10 p-2 rounded-[5px] group-hover/link:bg-accent group-hover/link:text-accent-foreground transition-colors shrink-0">
                                              <Plane className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium truncate group-hover/link:text-accent transition-colors">
                                              {getSimuladoLabel(id)}
                                            </span>
                                          </div>
                                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-30 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all shrink-0" />
                                        </div>
                                      </Link>
                                    ))}
                                    {step.microcourse_ids?.map(id => (
                                      <Link key={id} to="/microcursos" className="block group/link">
                                        <div className="flex items-center justify-between p-3 rounded-[5px] border border-border/50 bg-background/50 hover:bg-white hover:border-primary shadow-sm transition-all">
                                          <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-primary/10 p-2 rounded-[5px] group-hover/link:bg-primary group-hover/link:text-primary-foreground transition-colors shrink-0">
                                              <GraduationCap className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium truncate group-hover/link:text-primary transition-colors">
                                              {microcourseMap?.get(id) || 'Microcurso'}
                                            </span>
                                          </div>
                                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-30 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all shrink-0" />
                                        </div>
                                      </Link>
                                    ))}
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
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
