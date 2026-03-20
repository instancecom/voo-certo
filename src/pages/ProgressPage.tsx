import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, BarChart3, Clock, Target, Award, AlertTriangle,
  CheckCircle2, ArrowRight, Loader2, Calendar, Flame, Zap,
  BookOpen, Hash, Trophy, ArrowUpRight, ArrowDownRight, Minus,
  Brain, Timer, Star, ChevronDown, ChevronUp, History,
  Activity, PieChart as PieChartIcon, User, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { format, subDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProgressPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { canAccessProgress } = usePlan();
  const { data: examResults, isLoading: resultsLoading } = useUserResults();
  const { data: exams, isLoading: examsLoading } = useExams();
  const { data: subcategories } = useSubcategories();
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Process data if available
  const stats = useMemo(() => {
    if (!examResults || !exams || !subcategories) return null;

    const userResults = [...examResults].sort((a, b) => 
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );
    
    const totalExams = userResults.length;
    if (totalExams === 0) return { totalExams: 0 };

    const averageScore = Math.round(userResults.reduce((acc, r) => acc + r.score, 0) / totalExams);
    const totalTime = userResults.reduce((acc, r) => acc + r.time_spent, 0);
    const approvedCount = userResults.filter(r => r.score >= 70).length;
    const totalQuestions = userResults.reduce((acc, r) => acc + r.total_questions, 0);
    const totalCorrect = userResults.reduce((acc, r) => acc + r.correct_answers, 0);
    const bestScore = Math.max(...userResults.map(r => r.score));
    
    // Trend calculation
    const currentResults = userResults.slice(0, 8);
    const pastResults = userResults.slice(8, 16);
    const currentAvg = currentResults.length ? currentResults.reduce((a, r) => a + r.score, 0) / currentResults.length : 0;
    const pastAvg = pastResults.length ? pastResults.reduce((a, r) => a + r.score, 0) / pastResults.length : null;
    const trendValue = pastAvg !== null ? Math.round(currentAvg - pastAvg) : null;

    // Subcategory (Block) stats using the fixed counting logic
    const subStats = subcategories.map((sub, index) => {
      const relevantScores: number[] = [];
      
      userResults.forEach(result => {
        const exam = exams.find(e => e.id === result.exam_id);
        if (exam?.subcategory_id === sub.id) {
          relevantScores.push(result.score);
        }
        else if (result.block_results && Array.isArray(result.block_results)) {
          const block = result.block_results.find((b: any) => 
            b.blockNumber === index + 1 || 
            b.blockName?.toLowerCase().includes(sub.name.toLowerCase())
          );
          if (block) {
            relevantScores.push(block.percentage);
          }
        }
      });

      const count = relevantScores.length;
      const avg = count ? Math.round(relevantScores.reduce((a, b) => a + b, 0) / count) : null;
      
      return {
        ...sub,
        avg,
        count,
        best: count ? Math.max(...relevantScores) : 0,
        isWeak: avg !== null && avg < 70
      };
    }).filter(s => s.count > 0).sort((a, b) => (a.avg || 0) - (b.avg || 0));

    const evolutionData = [...userResults].reverse().slice(-12).map((r) => ({
      date: format(new Date(r.completed_at), 'dd/MM'),
      score: r.score
    }));

    return {
      userResults,
      totalExams,
      averageScore,
      totalTime,
      approvedCount,
      totalQuestions,
      totalCorrect,
      bestScore,
      trendValue,
      subStats,
      evolutionData
    };
  }, [examResults, exams, subcategories]);

  if (authLoading || resultsLoading || examsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !canAccessProgress) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20 container mx-auto px-4 max-w-lg">
           <PlanGate requiredPlan="tripulante" feature="Ver Progresso Detalhado">
              <div />
           </PlanGate>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}min`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Meu Progresso</h1>
              <p className="text-muted-foreground">Analise seu desempenho e evolução nos simulados.</p>
            </div>
          </div>

          {!stats || stats.totalExams === 0 ? (
            <Card className="p-12 text-center border-dashed">
               <BarChart3 className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
               <h2 className="text-xl font-bold mb-2">Nenhum simulado realizado</h2>
               <p className="text-muted-foreground mb-8">Comece a praticar para ver suas estatísticas de desempenho aqui.</p>
               <Button asChild>
                 <Link to="/simulados">Ver Simulados</Link>
               </Button>
            </Card>
          ) : (
            <div className="space-y-10">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-medium uppercase tracking-wider">Média Geral</CardDescription>
                    <CardTitle className="text-3xl font-bold text-primary">{stats.averageScore}%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {stats.trendValue !== null ? (
                        <span className={stats.trendValue >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {stats.trendValue > 0 ? '+' : ''}{stats.trendValue}% desde o mês passado
                        </span>
                      ) : 'Mínimo para aprovação: 70%'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-medium uppercase tracking-wider">Simulados</CardDescription>
                    <CardTitle className="text-3xl font-bold">{stats.totalExams}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{stats.approvedCount} aprovações conquistadas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-medium uppercase tracking-wider">Tempo Total</CardDescription>
                    <CardTitle className="text-3xl font-bold">{formatDuration(stats.totalTime)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Foco total em questões</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-medium uppercase tracking-wider">Maior Nota</CardDescription>
                    <CardTitle className="text-3xl font-bold text-accent">{stats.bestScore}%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Sua melhor performance</p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart and Sub Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" /> Evolução Recente
                    </CardTitle>
                    <CardDescription>Desempenho nos últimos 12 simulados</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                        <ReferenceLine y={70} stroke="hsl(var(--success))" strokeDasharray="3 3" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">Análise por Matéria</CardTitle>
                      <CardDescription>Desempenho médio por bloco</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {stats.subStats.slice(0, 5).map((sub) => (
                        <div key={sub.id} className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium truncate pr-4">{sub.name}</span>
                            <span className={`font-bold ${sub.avg! >= 70 ? 'text-green-500' : 'text-red-500'}`}>{sub.avg}%</span>
                          </div>
                          <Progress value={sub.avg || 0} className={`h-1.5 ${sub.avg! >= 70 ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'}`} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Warnings and strengths */}
              {stats.subStats.filter(s => s.isWeak).length > 0 && (
                <Card className="border-red-100 bg-red-50/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-bold text-red-700">Pontos de Atenção</h3>
                        <p className="text-sm text-red-600 mb-4">Você está com média abaixo de 70% nestas matérias:</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {stats.subStats.filter(s => s.isWeak).map(sub => (
                             <Badge key={sub.id} variant="outline" className="bg-white border-red-200 text-red-700">
                               {sub.name}: {sub.avg}%
                             </Badge>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50" asChild>
                           <Link to="/simulados">Revisar Matérias</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* History */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Histórico Recente</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowAllHistory(!showAllHistory)}>
                    {showAllHistory ? 'Ver Menos' : 'Ver Todos'}
                  </Button>
                </div>
                <div className="space-y-3">
                  {(showAllHistory ? stats.userResults : stats.userResults.slice(0, 5)).map((result) => {
                    const exam = exams.find(e => e.id === result.exam_id);
                    const passed = result.score >= 70;
                    return (
                      <Card key={result.id} className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {result.score}%
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold truncate">{exam?.title || 'Simulado'}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(result.completed_at), "dd 'de' MMM", { locale: ptBR })} • {result.correct_answers}/{result.total_questions} corretas
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/resultado/${result.id}`}>Ver Detalhes</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
