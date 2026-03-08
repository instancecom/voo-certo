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
  const { user, isPremium, isLoading: authLoading } = useAuth();
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
    return <div className="min-h-screen bg-background flex items-center justify-center"><Skeleton className="w-8 h-8" /></div>;
  }

  // Guide detail is visible to all - linked content is gated in the step cards

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back + title */}
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/guia-carreira')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              {isLoading ? (
                <Skeleton className="h-8 w-3/4" />
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{guide?.title}</h1>
                  {guide?.description && <p className="text-muted-foreground mt-1">{guide.description}</p>}
                </>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {!isLoading && totalSteps > 0 && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Progresso</span>
                  <span className="text-sm font-bold text-accent">{completedCount}/{totalSteps} etapas</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">{progressPercent}% concluído</p>
              </CardContent>
            </Card>
          )}

          {/* Steps */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Card key={i}><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>)}
            </div>
          ) : (
            <div className="space-y-4">
              {guide?.steps?.map((step, index) => {
                const isCompleted = completedStepIds.has(step.id);
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`border-l-4 transition-colors ${isCompleted ? 'border-l-success bg-success/5' : 'border-l-accent'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-3 shrink-0 mt-1">
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={(checked) => {
                                toggleProgress.mutate({ stepId: step.id, guideId: guideId!, completed: !!checked });
                              }}
                              className="w-6 h-6"
                            />
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isCompleted ? 'bg-success/20 text-success' : 'bg-accent/10 text-accent'}`}>
                              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className={`text-base md:text-lg ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {step.title}
                            </CardTitle>
                            {step.description && (
                              <CardDescription className="mt-2 whitespace-pre-wrap">{step.description}</CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      {(step.simulado_ids?.length > 0 || step.microcourse_ids?.length > 0) && (
                        <CardContent className="pt-0">
                          {!canAccessGuideContent ? (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
                              <Lock className="w-4 h-4 shrink-0" />
                              <span className="flex-1">Assine o plano Tripulante para acessar simulados e microcursos vinculados.</span>
                              <Button variant="outline" size="sm" asChild>
                                <Link to="/premium"><Crown className="w-3 h-3 mr-1" />Upgrade</Link>
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {step.simulado_ids?.map(id => (
                                <Button key={id} variant="outline" size="sm" asChild className="border-accent/30 hover:bg-accent hover:text-accent-foreground text-xs">
                                  <Link to={getSimuladoLink(id)}>
                                    <BookOpen className="w-3 h-3 mr-1" />{getSimuladoLabel(id)}
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                  </Link>
                                </Button>
                              ))}
                              {step.microcourse_ids?.map(id => (
                                <Button key={id} variant="outline" size="sm" asChild className="border-primary/30 hover:bg-primary hover:text-primary-foreground text-xs">
                                  <Link to="/microcursos">
                                    <GraduationCap className="w-3 h-3 mr-1" />{microcourseMap?.get(id) || 'Microcurso'}
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                  </Link>
                                </Button>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
