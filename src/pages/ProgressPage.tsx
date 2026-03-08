import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, BarChart3, Clock, Target, Award, AlertTriangle,
  CheckCircle2, ArrowRight, Loader2, Lock, Calendar, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useUserResults, useExams, useSubcategories } from '@/hooks/useExams';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { PlanGate } from '@/components/PlanGate';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProgressPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: examResults, isLoading: resultsLoading } = useUserResults();
  const { data: exams, isLoading: examsLoading } = useExams();
  const { data: subcategories } = useSubcategories();

  const isLoading = authLoading || resultsLoading || examsLoading;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center p-8 rounded-2xl bg-card border border-border">
              <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground mb-6">Faça login para ver seu progresso e histórico de simulados.</p>
              <Button asChild><Link to="/auth">Fazer Login</Link></Button>
            </div>
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

  // Evolution chart data (last 15 results)
  const evolutionData = [...userResults]
    .reverse()
    .slice(0, 15)
    .map((r, i) => {
      const exam = exams?.find(e => e.id === r.exam_id);
      return {
        name: `#${i + 1}`,
        score: r.score,
        date: format(new Date(r.completed_at), 'dd/MM', { locale: ptBR }),
        examTitle: exam?.title || 'Simulado',
      };
    });

  // Group results by subcategory
  const resultsByCategory = userResults.reduce((acc, result) => {
    const exam = exams?.find((e) => e.id === result.exam_id);
    if (!exam) return acc;
    if (!acc[exam.subcategory_id]) acc[exam.subcategory_id] = [];
    acc[exam.subcategory_id].push(result);
    return acc;
  }, {} as Record<string, typeof userResults>);

  // Weak points: subcategories with avg < 70%
  const subcategoryStats = (subcategories || []).map(sub => {
    const results = resultsByCategory[sub.id] || [];
    const avg = results.length
      ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)
      : null;
    return { ...sub, avg, count: results.length, isWeak: avg !== null && avg < 70 };
  }).filter(s => s.count > 0);

  const weakPoints = subcategoryStats.filter(s => s.isWeak);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-sm">
          <p className="text-muted-foreground">{payload[0]?.payload?.examTitle}</p>
          <p className="font-bold text-foreground">{payload[0]?.value}%</p>
          <p className="text-xs text-muted-foreground">{payload[0]?.payload?.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Meu Progresso</h1>
            <p className="text-muted-foreground">Acompanhe sua evolução e identifique áreas de melhoria.</p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-primary/10"><Target className="w-4 h-4 text-primary" /></div>
                      <span className="text-xs text-muted-foreground">Média Geral</span>
                    </div>
                    <div className={`text-3xl font-bold ${averageScore >= 70 ? 'text-success' : averageScore >= 50 ? 'text-warning' : 'text-destructive'}`}>
                      {averageScore}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">mínimo: 70%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-accent/10"><Award className="w-4 h-4 text-accent" /></div>
                      <span className="text-xs text-muted-foreground">Simulados</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground">{totalExams}</div>
                    <p className="text-xs text-success mt-1">{approvedCount} aprovações</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-success/10"><Clock className="w-4 h-4 text-success" /></div>
                      <span className="text-xs text-muted-foreground">Tempo Total</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground">{formatTime(totalTime)}</div>
                    <p className="text-xs text-muted-foreground mt-1">de estudo</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-warning/10"><TrendingUp className="w-4 h-4 text-warning" /></div>
                      <span className="text-xs text-muted-foreground">Taxa Aprovação</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {totalExams ? Math.round((approvedCount / totalExams) * 100) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{approvedCount}/{totalExams}</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Evolution Chart */}
              {evolutionData.length > 1 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Evolução de Desempenho
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={evolutionData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine y={70} stroke="hsl(var(--success))" strokeDasharray="4 4" label={{ value: '70%', position: 'right', fontSize: 11, fill: 'hsl(var(--success))' }} />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2.5}
                            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        A linha verde indica o mínimo de 70% para aprovação
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Weak Points Alert */}
              {weakPoints.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-8">
                  <Card className="border-warning/40 bg-warning/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base text-warning">
                        <AlertTriangle className="w-5 h-5" />
                        Pontos a Melhorar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {weakPoints.map(sub => (
                          <div key={sub.id} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-foreground">{sub.name}</span>
                                <span className="text-sm font-bold text-warning">{sub.avg}%</span>
                              </div>
                              <Progress value={sub.avg || 0} className="h-2 [&>div]:bg-warning" />
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link to="/simulados"><ArrowRight className="w-4 h-4" /></Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Category Progress */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
                <h2 className="text-lg font-bold text-foreground mb-4">Progresso por Bloco</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subcategoryStats.map(sub => (
                    <Card key={sub.id} className={sub.isWeak ? 'border-warning/30' : sub.avg && sub.avg >= 70 ? 'border-success/30' : ''}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-sm text-foreground">{sub.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{sub.count} simulados</span>
                            {sub.avg !== null && (
                              <Badge className={`text-xs ${sub.avg >= 70 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                {sub.avg}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Progress
                          value={sub.avg || 0}
                          className={`h-2 ${sub.avg && sub.avg >= 70 ? '[&>div]:bg-success' : '[&>div]:bg-warning'}`}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0%</span>
                          <span>70% mín.</span>
                          <span>100%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>

              {/* Recent Results */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h2 className="text-lg font-bold text-foreground mb-4">Histórico de Simulados</h2>
                {userResults.length === 0 ? (
                  <div className="p-12 rounded-2xl bg-muted text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Você ainda não fez nenhum simulado.</p>
                    <Button asChild>
                      <Link to="/simulados">Começar Agora <ArrowRight className="w-4 h-4 ml-2" /></Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userResults.map(result => {
                      const exam = exams?.find(e => e.id === result.exam_id);
                      if (!exam) return null;
                      const passed = result.score >= 70;
                      return (
                        <Card key={result.id} className={`hover:border-primary/30 transition-colors ${passed ? 'border-success/20' : 'border-destructive/20'}`}>
                          <CardContent className="py-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${passed ? 'bg-success/10' : 'bg-destructive/10'}`}>
                                {passed
                                  ? <CheckCircle2 className="w-4 h-4 text-success" />
                                  : <AlertTriangle className="w-4 h-4 text-destructive" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm text-foreground truncate">{exam.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(result.completed_at), 'dd/MM/yyyy', { locale: ptBR })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(result.time_spent)}
                                  </span>
                                  <span>{result.correct_answers}/{result.total_questions} acertos</span>
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <span className={`text-xl font-bold ${passed ? 'text-success' : 'text-destructive'}`}>
                                  {result.score}%
                                </span>
                                <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                  <Link to={`/resultado/${result.id}`}><ArrowRight className="w-4 h-4" /></Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
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
