import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, BarChart3, Clock, Target, Award, AlertTriangle,
  CheckCircle2, ArrowRight, Loader2, Calendar, Flame, Zap,
  BookOpen, Hash, Trophy, ArrowUpRight, ArrowDownRight, Minus,
  Brain, Timer, Star, ChevronDown, ChevronUp, History,
  Activity, PieChart as PieChartIcon, User, Search, Filter,
  CheckCircle, XCircle, MousePointer2, GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { useUserResults, useExams, useSubcategories } from '@/hooks/useExams';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { PlanGate } from '@/components/PlanGate';
import { format, subDays, isSameDay, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProgressPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { canAccessProgress } = usePlan();
  const { data: examResults, isLoading: resultsLoading } = useUserResults();
  const { data: exams, isLoading: examsLoading } = useExams();
  const { data: subcategories } = useSubcategories();
  
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'bloco' | 'livre' | 'banca'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Process data
  const stats = useMemo(() => {
    if (!examResults || !exams || !subcategories) return null;

    const userResults = [...examResults].sort((a, b) => 
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );
    
    const totalExams = userResults.length;
    if (totalExams === 0) return { totalExams: 0 };

    const averageScore = Math.round(userResults.reduce((acc, r) => acc + r.score, 0) / totalExams);
    const totalQuestions = userResults.reduce((acc, r) => acc + r.total_questions, 0);
    const totalCorrect = userResults.reduce((acc, r) => acc + r.correct_answers, 0);
    const totalTime = userResults.reduce((acc, r) => acc + r.time_spent, 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    // Streak calculation
    let currentStreak = 0;
    const sortedDates = [...new Set(userResults.map(r => new Date(r.completed_at).toDateString()))]
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

      if (sortedDates.length > 0) {
        let checkDate = new Date();
        const lastExamDate = sortedDates[0];
        
        // Safety check for valid dates
        if (!isNaN(lastExamDate.getTime()) && differenceInDays(checkDate, lastExamDate) > 1) {
          currentStreak = 0;
        } else {
          for (let i = 0; i < sortedDates.length; i++) {
            if (isNaN(sortedDates[i].getTime())) continue;
            if (i === 0) {
              currentStreak = 1;
              continue;
            }
            if (isNaN(sortedDates[i-1].getTime())) break;
            if (differenceInDays(sortedDates[i-1], sortedDates[i]) === 1) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }

    // Subcategory stats - With safety checks
    const subStats = (subcategories || []).map((sub, index) => {
      const relevantScores: number[] = [];
      userResults.forEach(result => {
        if (!result) return;
        const exam = exams?.find(e => e.id === result.exam_id);
        if (exam?.subcategory_id === sub.id) {
          relevantScores.push(result.score || 0);
        } else if (result.block_results && Array.isArray(result.block_results)) {
          const block = result.block_results.find((b: any) => 
            b && (b.blockNumber === index + 1 || b.blockName?.toLowerCase().includes(sub.name?.toLowerCase() || ''))
          );
          if (block) relevantScores.push(block.percentage || 0);
        }
      });

      const count = relevantScores.length;
      const avg = count ? Math.round(relevantScores.reduce((a, b) => a + b, 0) / count) : 0;
      return { ...sub, avg, count, best: count ? Math.max(...relevantScores) : 0 };
    }).filter(s => s.count > 0);

    const weakPoints = subStats.filter(s => s.avg! < 70).sort((a, b) => (a.avg || 0) - (b.avg || 0)).slice(0, 3);
    const strengths = subStats.filter(s => s.avg! >= 70).sort((a, b) => (b.avg || 0) - (a.avg || 0)).slice(0, 3);

    const evolutionData = [...userResults].reverse().slice(-15).map((r) => ({
      date: format(new Date(r.completed_at), 'dd/MM'),
      score: r.score
    }));

    const pieData = [
      { name: 'Corretas', value: totalCorrect, color: 'hsl(var(--success))' },
      { name: 'Incorretas', value: totalQuestions - totalCorrect, color: 'hsl(var(--destructive))' }
    ];

    return {
      userResults,
      totalExams,
      averageScore,
      totalTime,
      totalQuestions,
      totalCorrect,
      accuracy,
      currentStreak,
      weakPoints,
      strengths,
      subStats,
      evolutionData,
      pieData
    };
  }, [examResults, exams, subcategories]);

  const filteredHistory = useMemo(() => {
    if (!stats) return [];
    return stats.userResults.filter(r => {
      const exam = exams?.find(e => e.id === r.exam_id);
      const matchesSearch = !searchQuery || exam?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = historyFilter === 'all' || r.exam_mode === historyFilter;
      return matchesSearch && matchesFilter;
    });
  }, [stats, historyFilter, searchQuery, exams]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-foreground mb-1">Central de Performance</h1>
            <p className="text-muted-foreground text-sm">
              Sua evolução baseada em padrões reais da ANAC.
            </p>
          </div>

          {!stats || stats.totalExams === 0 ? (
            <Card className="p-12 text-center border-dashed">
               <BarChart3 className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
               <h2 className="text-xl font-bold mb-2">Sua jornada começa aqui</h2>
               <p className="text-muted-foreground mb-8">Realize seu primeiro simulado para desbloquear as análises de desempenho.</p>
               <Button asChild>
                 <Link to="/simulados">Encontrar Simulados</Link>
               </Button>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Primary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-none border rounded-[5px]">
                   <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Média Geral</p>
                        <p className="text-2xl font-bold">{stats.averageScore}%</p>
                      </div>
                   </CardContent>
                </Card>

                <Card className="shadow-none border">
                   <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Flame className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Sequência</p>
                        <p className="text-2xl font-bold">{stats.currentStreak} dias</p>
                      </div>
                   </CardContent>
                </Card>

                <Card className="shadow-none border">
                   <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Precisão</p>
                        <p className="text-2xl font-bold">{stats.accuracy}%</p>
                      </div>
                   </CardContent>
                </Card>

                <Card className="shadow-none border">
                   <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Hash className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Total Questões</p>
                        <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                      </div>
                   </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 rounded-[5px] shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" /> Curva de Aprendizado
                    </CardTitle>
                    <CardDescription>Desempenho nos últimos 15 simulados</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={10} />
                        <YAxis axisLine={false} tickLine={false} fontSize={10} domain={[0, 100]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.05)" strokeWidth={2} />
                        <ReferenceLine y={70} stroke="hsl(var(--success))" strokeDasharray="3 3" opacity={0.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-none border">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-accent" /> Assertividade
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={stats.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-4">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
                          <div className="w-2 h-2 rounded-full bg-success" /> Corretas
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
                          <div className="w-2 h-2 rounded-full bg-destructive" /> Incorretas
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="shadow-none border border-red-100 bg-red-50/10">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-xs font-bold text-red-600 uppercase flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5" /> Pontos de Atenção
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {stats.weakPoints.length > 0 ? stats.weakPoints.map(wp => (
                          <div key={wp.id} className="group flex items-center gap-4 p-2.5 rounded-[5px] hover:bg-red-50 transition-all duration-300 border border-transparent hover:border-red-100">
                             <div className="flex-1 space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                   <span className="truncate">{wp.name}</span>
                                   <span className="text-red-500">{wp.avg}%</span>
                                </div>
                                <Progress value={wp.avg || 0} className="h-1.5 [&>div]:bg-red-500 bg-red-100" />
                             </div>
                             <Button 
                               size="sm" 
                               variant="outline" 
                               className="h-8 px-2.5 text-[10px] font-bold uppercase border-red-200 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 shrink-0 gap-1.5 shadow-sm"
                               asChild
                             >
                               <Link to={`/simulado-profissao/${wp.category_id}?modo=bloco&bloco_id=${wp.id}&nome_bloco=${encodeURIComponent(wp.name)}`}>
                                 <Zap className="w-3 h-3 fill-current" /> Treinar
                               </Link>
                             </Button>
                          </div>
                        )) : <p className="text-xs text-muted-foreground italic p-4 text-center">Nenhum ponto fraco detectado ainda.</p>}
                    </CardContent>
                 </Card>

                 <Card className="shadow-none border border-green-100 bg-green-50/10">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-xs font-bold text-green-600 uppercase flex items-center gap-2">
                          <Trophy className="w-3.5 h-3.5" /> Suas Melhores Matérias
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {stats.strengths.length > 0 ? stats.strengths.map(s => (
                         <div key={s.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                               <span className="truncate">{s.name}</span>
                               <span className="text-green-600 font-bold">{s.avg}%</span>
                            </div>
                            <Progress value={s.avg || 0} className="h-1 [&>div]:bg-green-600" />
                         </div>
                       )) : <p className="text-xs text-muted-foreground italic">Continue estudando para identificar seus pontos fortes!</p>}
                    </CardContent>
                 </Card>
              </div>

              {/* History with filters */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <h2 className="text-lg font-bold">Histórico Detalhado</h2>
                   <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                        <Input 
                          placeholder="Buscar por nome..." 
                          className="h-9 pl-9 w-full sm:w-[200px]" 
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select value={historyFilter} onValueChange={v => setHistoryFilter(v as any)}>
                         <SelectTrigger className="h-9 w-full sm:w-[150px]">
                           <SelectValue placeholder="Modo" />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="all">Todos os Modos</SelectItem>
                            <SelectItem value="bloco">Simulado Bloco</SelectItem>
                            <SelectItem value="livre">Modo Livre</SelectItem>
                            <SelectItem value="banca">Banca ANAC</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="space-y-3">
                  {(showAllHistory ? filteredHistory : filteredHistory.slice(0, 5)).map((result) => {
                    const exam = exams?.find(e => e.id === result.exam_id);
                    const passed = result.score >= 70;
                    return (
                      <Card key={result.id} className="shadow-none border hover:border-primary/50 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold ${passed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {result.score}%
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">{exam?.title || 'Simulado Generativo'}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <Badge variant="outline" className="text-[9px] uppercase font-bold h-4 py-0">
                                   {result.exam_mode || 'Livre'}
                                 </Badge>
                                 <span className="text-[10px] text-muted-foreground">
                                   {format(new Date(result.completed_at), "dd 'de' MMM", { locale: ptBR })}
                                 </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                             <div className="hidden sm:flex flex-col items-end mr-4">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Tempo</span>
                                <span className="text-xs font-medium text-foreground">{Math.round(result.time_spent / 60)} min</span>
                             </div>
                             <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                               <Link to={`/resultado/${result.id}`}>Ver Detalhes</Link>
                             </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {filteredHistory.length > 5 && (
                    <Button 
                      variant="ghost" 
                      className="w-full text-xs text-muted-foreground" 
                      onClick={() => setShowAllHistory(!showAllHistory)}
                    >
                      {showAllHistory ? 'Recolher Histórico' : `Ver mais ${filteredHistory.length - 5} resultados`}
                    </Button>
                  )}
                  
                  {filteredHistory.length === 0 && (
                    <div className="py-10 text-center text-muted-foreground text-xs italic">
                      Nenhum resultado corresponde aos filtros aplicados.
                    </div>
                  )}
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
