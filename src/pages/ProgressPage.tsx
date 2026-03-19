import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, BarChart3, Clock, Target, Award, AlertTriangle,
  CheckCircle2, ArrowRight, Loader2, Calendar, Flame, Zap,
  BookOpen, Hash, Trophy, ArrowUpRight, ArrowDownRight, Minus,
  Brain, Timer, Star, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { useUserResults, useExams, useSubcategories } from '@/hooks/useExams';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { PlanGate } from '@/components/PlanGate';
import { format, subDays, differenceInDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

export default function ProgressPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { canAccessProgress } = usePlan();
  const { data: examResults, isLoading: resultsLoading } = useUserResults();
  const { data: exams, isLoading: examsLoading } = useExams();
  const { data: subcategories } = useSubcategories();
  const [showAllHistory, setShowAllHistory] = useState(false);

  const isLoading = authLoading || resultsLoading || examsLoading;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !canAccessProgress) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-lg">
            <PlanGate requiredPlan="tripulante" feature="Dashboard de Progresso">
              <div />
            </PlanGate>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const userResults = examResults || [];
  const totalExams = userResults.length;
  const averageScore = totalExams
    ? Math.round(userResults.reduce((acc, r) => acc + r.score, 0) / totalExams)
    : 0;
  const totalTime = userResults.reduce((acc, r) => acc + r.time_spent, 0);
  const approvedCount = userResults.filter(r => r.score >= 70).length;
  const totalQuestions = userResults.reduce((acc, r) => acc + r.total_questions, 0);
  const totalCorrect = userResults.reduce((acc, r) => acc + r.correct_answers, 0);
  const bestScore = totalExams ? Math.max(...userResults.map(r => r.score)) : 0;
  const worstScore = totalExams ? Math.min(...userResults.map(r => r.score)) : 0;
  const avgTimePerExam = totalExams ? Math.round(totalTime / totalExams) : 0;

  // Trend: compare last 5 vs previous 5
  const last5 = userResults.slice(0, 5);
  const prev5 = userResults.slice(5, 10);
  const last5Avg = last5.length ? Math.round(last5.reduce((a, r) => a + r.score, 0) / last5.length) : 0;
  const prev5Avg = prev5.length ? Math.round(prev5.reduce((a, r) => a + r.score, 0) / prev5.length) : null;
  const trend = prev5Avg !== null ? last5Avg - prev5Avg : null;

  // Streak calculation
  const sortedByDate = [...userResults].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  let currentStreak = 0;
  for (const r of sortedByDate) {
    if (r.score >= 70) currentStreak++;
    else break;
  }

  // Results by mode
  const bancaResults = userResults.filter(r => r.exam_mode === 'banca_anac');
  const livreResults = userResults.filter(r => r.exam_mode !== 'banca_anac');
  const bancaAvg = bancaResults.length ? Math.round(bancaResults.reduce((a, r) => a + r.score, 0) / bancaResults.length) : null;
  const livreAvg = livreResults.length ? Math.round(livreResults.reduce((a, r) => a + r.score, 0) / livreResults.length) : null;

  // Evolution chart data (last 20 results)
  const evolutionData = [...userResults]
    .reverse()
    .slice(-20)
    .map((r, i) => {
      const exam = exams?.find(e => e.id === r.exam_id);
      return {
        name: `#${i + 1}`,
        score: r.score,
        date: format(new Date(r.completed_at), 'dd/MM', { locale: ptBR }),
        examTitle: exam?.title || 'Simulado',
        mode: r.exam_mode === 'banca_anac' ? 'Banca' : 'Livre',
      };
    });

  // Activity last 30 days
  const activityData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayResults = userResults.filter(r => r.completed_at?.slice(0, 10) === dateStr);
    return {
      date: format(date, 'dd/MM', { locale: ptBR }),
      exams: dayResults.length,
      avgScore: dayResults.length ? Math.round(dayResults.reduce((a, r) => a + r.score, 0) / dayResults.length) : null,
    };
  });

  // Score distribution
  const scoreRanges = [
    { range: '0-30%', min: 0, max: 30 },
    { range: '31-50%', min: 31, max: 50 },
    { range: '51-69%', min: 51, max: 69 },
    { range: '70-85%', min: 70, max: 85 },
    { range: '86-100%', min: 86, max: 100 },
  ];
  const scoreDistribution = scoreRanges.map(({ range, min, max }) => ({
    range,
    count: userResults.filter(r => r.score >= min && r.score <= max).length,
    color: min >= 70 ? 'hsl(var(--success))' : min >= 51 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))',
  }));

  // Detailed results calculation mapping through every result
  const subcategoryStats = useMemo(() => {
    if (!subcategories || !userResults) return [];
    
    return subcategories.map(sub => {
      // Collect all scores for this subcategory
      const relevantResults: number[] = [];
      
      userResults.forEach(result => {
        const exam = exams?.find(e => e.id === result.exam_id);
        
        // Match by exact subcategory ID in the parent exam
        if (exam?.subcategory_id === sub.id) {
          relevantResults.push(result.score);
        } 
        // Match by block number in ANAC mode or generic exams with block details
        else if (result.block_results && Array.isArray(result.block_results)) {
          const block = result.block_results.find((b: any) => 
            b.blockNumber === sub.display_order
          );
          if (block) {
            relevantResults.push(block.percentage);
          }
        }
      });
      
      const count = relevantResults.length;
      const avg = count ? Math.round(relevantResults.reduce((a, b) => a + b, 0) / count) : null;
      const best = count ? Math.max(...relevantResults) : null;
      const last = count ? relevantResults[0] : null; // userResults is already sorted by date descending

      return {
        ...sub,
        avg,
        best,
        last,
        count,
        isWeak: avg !== null && avg < 70
      };
    }).filter(s => s.count > 0)
      .sort((a, b) => (a.avg || 0) - (b.avg || 0));
  }, [subcategories, userResults, exams]);

  const weakPoints = subcategoryStats.filter(s => s.isWeak);
  const strongPoints = subcategoryStats.filter(s => !s.isWeak);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-sm">
          <p className="font-medium text-foreground">{payload[0]?.payload?.examTitle}</p>
          <p className="text-lg font-bold text-primary">{payload[0]?.value}%</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{payload[0]?.payload?.date}</span>
            <Badge variant="outline" className="text-[10px]">{payload[0]?.payload?.mode}</Badge>
          </div>
        </div>
      );
    }
    return null;
  };

  const displayedHistory = showAllHistory ? userResults : userResults.slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-3 sm:px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">Meu Progresso</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Acompanhe sua evolução e identifique áreas de melhoria.</p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
          ) : (
            <>
              {/* Primary KPIs */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4"
              >
                <Card>
                  <CardContent className="pt-3 pb-3 px-3 sm:px-6">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="p-1 rounded-md bg-primary/10"><Target className="w-3.5 h-3.5 text-primary" /></div>
                      <span className="text-[11px] sm:text-xs text-muted-foreground">Média Geral</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className={`text-2xl sm:text-3xl font-bold ${averageScore >= 70 ? 'text-success' : averageScore >= 50 ? 'text-warning' : 'text-destructive'}`}>
                        {averageScore}%
                      </span>
                      {trend !== null && (
                        <span className={`flex items-center text-[11px] font-medium mb-1 ${trend > 0 ? 'text-success' : trend < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {Math.abs(trend)}%
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">mínimo: 70%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-3 pb-3 px-3 sm:px-6">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="p-1 rounded-md bg-accent/10"><Award className="w-3.5 h-3.5 text-accent" /></div>
                      <span className="text-[11px] sm:text-xs text-muted-foreground">Simulados</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalExams}</div>
                    <p className="text-[10px] sm:text-xs text-success">{approvedCount} aprovações ({totalExams ? Math.round((approvedCount / totalExams) * 100) : 0}%)</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-3 pb-3 px-3 sm:px-6">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="p-1 rounded-md bg-success/10"><Clock className="w-3.5 h-3.5 text-success" /></div>
                      <span className="text-[11px] sm:text-xs text-muted-foreground">Tempo Total</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">{formatTime(totalTime)}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">~{formatTime(avgTimePerExam)}/simulado</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-3 pb-3 px-3 sm:px-6">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="p-1 rounded-md bg-warning/10"><Brain className="w-3.5 h-3.5 text-warning" /></div>
                      <span className="text-[11px] sm:text-xs text-muted-foreground">Questões</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalQuestions}</div>
                    <p className="text-[10px] sm:text-xs text-success">{totalCorrect} acertos ({totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0}%)</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Secondary KPIs */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 sm:mb-8"
              >
                <Card className="bg-muted/30">
                  <CardContent className="pt-3 pb-3 px-3 sm:px-6">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Trophy className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[11px] text-muted-foreground">Melhor Nota</span>
                    </div>
                    <div className="text-xl font-bold text-primary">{bestScore}%</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-3 pb-3 px-3 sm:px-6">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Flame className="w-3.5 h-3.5 text-destructive" />
                      <span className="text-[11px] text-muted-foreground">Sequência Aprovações</span>
                    </div>
                    <div className="text-xl font-bold text-foreground">{currentStreak}x</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-3 pb-3 px-3 sm:px-6">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[11px] text-muted-foreground">Média Banca</span>
                    </div>
                    <div className="text-xl font-bold text-foreground">{bancaAvg !== null ? `${bancaAvg}%` : '—'}</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-3 pb-3 px-3 sm:px-6">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-success" />
                      <span className="text-[11px] text-muted-foreground">Média Livre</span>
                    </div>
                    <div className="text-xl font-bold text-foreground">{livreAvg !== null ? `${livreAvg}%` : '—'}</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Charts Section */}
              <Tabs defaultValue="evolution" className="mb-6 sm:mb-8">
                <TabsList className="mb-4 h-auto flex-wrap gap-1">
                  <TabsTrigger value="evolution" className="text-xs sm:text-sm gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Evolução
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs sm:text-sm gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Atividade
                  </TabsTrigger>
                  <TabsTrigger value="distribution" className="text-xs sm:text-sm gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" /> Distribuição
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="evolution">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Evolução de Desempenho
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {evolutionData.length > 1 ? (
                        <>
                          <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={evolutionData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                              <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                              <Tooltip content={<CustomTooltip />} />
                              <ReferenceLine y={70} stroke="hsl(var(--success))" strokeDasharray="4 4" label={{ value: '70%', position: 'right', fontSize: 10, fill: 'hsl(var(--success))' }} />
                              <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                          </ResponsiveContainer>
                          <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2">
                            Linha verde = mínimo 70% para aprovação · Últimos {evolutionData.length} simulados
                          </p>
                        </>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground text-sm">
                          Complete mais simulados para ver o gráfico de evolução.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Atividade dos Últimos 30 Dias
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={4} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                          <Tooltip
                            content={({ active, payload }: any) => {
                              if (active && payload?.length) {
                                return (
                                  <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
                                    <p className="text-muted-foreground">{payload[0]?.payload?.date}</p>
                                    <p className="font-bold">{payload[0]?.value} simulado(s)</p>
                                    {payload[0]?.payload?.avgScore && (
                                      <p className="text-primary">Média: {payload[0].payload.avgScore}%</p>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area type="monotone" dataKey="exams" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 mt-2 text-[10px] sm:text-xs text-muted-foreground">
                        <span>Total: <strong className="text-foreground">{activityData.reduce((a, d) => a + d.exams, 0)} simulados</strong></span>
                        <span>Dias ativos: <strong className="text-foreground">{activityData.filter(d => d.exams > 0).length}/30</strong></span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="distribution">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Distribuição de Notas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {totalExams > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={scoreDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip
                              content={({ active, payload }: any) => {
                                if (active && payload?.length) {
                                  return (
                                    <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
                                      <p className="font-bold">{payload[0]?.payload?.range}</p>
                                      <p>{payload[0]?.value} simulado(s)</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {scoreDistribution.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground text-sm">Sem dados suficientes.</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Weak Points Alert */}
              {weakPoints.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6 sm:mb-8">
                  <Card className="border-warning/40 bg-warning/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-warning">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                        Pontos a Melhorar ({weakPoints.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {weakPoints.map(sub => (
                          <div key={sub.id} className="flex items-center gap-2 sm:gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs sm:text-sm font-medium text-foreground truncate">{sub.name}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-xs text-muted-foreground">{sub.count}x</span>
                                  <span className="text-xs sm:text-sm font-bold text-warning">{sub.avg}%</span>
                                </div>
                              </div>
                              <Progress value={sub.avg || 0} className="h-1.5 sm:h-2 [&>div]:bg-warning" />
                            </div>
                            <Button variant="outline" size="sm" asChild className="h-7 sm:h-8 shrink-0">
                              <Link to="/simulados"><ArrowRight className="w-3.5 h-3.5" /></Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Category Progress - Detailed */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-6 sm:mb-8">
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Desempenho por Bloco
                </h2>
                {subcategoryStats.length === 0 ? (
                  <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Nenhum bloco praticado ainda.</CardContent></Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subcategoryStats.map(sub => (
                      <Card key={sub.id} className={`${sub.isWeak ? 'border-warning/30' : sub.avg && sub.avg >= 70 ? 'border-success/20' : ''}`}>
                        <CardContent className="py-3 px-3 sm:px-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-xs sm:text-sm text-foreground truncate">{sub.name}</h3>
                            <Badge className={`text-[10px] sm:text-xs shrink-0 ${sub.avg && sub.avg >= 70 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                              {sub.avg}%
                            </Badge>
                          </div>
                          <Progress
                            value={sub.avg || 0}
                            className={`h-2 mb-2 ${sub.avg && sub.avg >= 70 ? '[&>div]:bg-success' : '[&>div]:bg-warning'}`}
                          />
                          <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Hash className="w-3 h-3" />{sub.count} simulado(s)
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Trophy className="w-3 h-3" />Melhor: {sub.best}%
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3" />Último: {sub.last}%
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Recent Results */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Histórico de Simulados
                  {totalExams > 0 && <Badge variant="outline" className="text-[10px]">{totalExams}</Badge>}
                </h2>
                {userResults.length === 0 ? (
                  <div className="p-8 sm:p-12 rounded-2xl bg-muted text-center">
                    <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm mb-4">Você ainda não fez nenhum simulado.</p>
                    <Button asChild>
                      <Link to="/simulados">Começar Agora <ArrowRight className="w-4 h-4 ml-2" /></Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 sm:space-y-3">
                      {displayedHistory.map(result => {
                        const exam = exams?.find(e => e.id === result.exam_id);
                        if (!exam) return null;
                        const passed = result.score >= 70;
                        return (
                          <Card key={result.id} className={`hover:border-primary/30 transition-colors ${passed ? 'border-success/20' : 'border-destructive/20'}`}>
                            <CardContent className="py-2.5 sm:py-3 px-3 sm:px-6">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`p-1.5 sm:p-2 rounded-full shrink-0 ${passed ? 'bg-success/10' : 'bg-destructive/10'}`}>
                                  {passed
                                    ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                                    : <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-xs sm:text-sm text-foreground truncate">{exam.title}</h3>
                                  <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground mt-0.5 flex-wrap">
                                    <span className="flex items-center gap-0.5">
                                      <Calendar className="w-3 h-3" />
                                      {format(new Date(result.completed_at), 'dd/MM/yy', { locale: ptBR })}
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                      <Clock className="w-3 h-3" />
                                      {formatTime(result.time_spent)}
                                    </span>
                                    <span>{result.correct_answers}/{result.total_questions}</span>
                                    {result.exam_mode && (
                                      <Badge variant="outline" className="text-[9px] h-4 px-1">{result.exam_mode === 'banca_anac' ? 'Banca' : 'Livre'}</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                  <span className={`text-lg sm:text-xl font-bold ${passed ? 'text-success' : 'text-destructive'}`}>
                                    {result.score}%
                                  </span>
                                  <Button variant="ghost" size="sm" asChild className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                                    <Link to={`/resultado/${result.id}`}><ArrowRight className="w-3.5 h-3.5" /></Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    {userResults.length > 8 && (
                      <Button
                        variant="ghost"
                        className="w-full mt-3 text-xs text-muted-foreground"
                        onClick={() => setShowAllHistory(!showAllHistory)}
                      >
                        {showAllHistory ? (
                          <><ChevronUp className="w-4 h-4 mr-1" /> Mostrar menos</>
                        ) : (
                          <><ChevronDown className="w-4 h-4 mr-1" /> Ver todos ({userResults.length})</>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
