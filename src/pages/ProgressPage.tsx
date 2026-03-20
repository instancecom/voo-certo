import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, BarChart3, Clock, Target, Award, AlertTriangle,
  CheckCircle2, ArrowRight, Loader2, Calendar, Flame, Zap,
  BookOpen, Hash, Trophy, ArrowUpRight, ArrowDownRight, Minus,
  Brain, Timer, Star, ChevronDown, ChevronUp, History,
  Activity, PieChart as PieChartIcon
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

  const isLoading = authLoading || resultsLoading || examsLoading;

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

    // Streak
    let consecutiveApprovals = 0;
    for (const r of userResults) {
      if (r.score >= 70) consecutiveApprovals++;
      else break;
    }

    // Subcategory (Block) stats
    const subStats = subcategories.map((sub, index) => {
      const relevantScores: number[] = [];
      
      userResults.forEach(result => {
        // Direct matching
        const exam = exams.find(e => e.id === result.exam_id);
        if (exam?.subcategory_id === sub.id) {
          relevantScores.push(result.score);
        }
        // Block matching for Banca ANAC
        else if (result.block_results && Array.isArray(result.block_results)) {
          // Find block by number (1-4) or name
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

    // Evolution chart data
    const evolutionData = [...userResults].reverse().slice(-15).map((r, i) => ({
      name: format(new Date(r.completed_at), 'dd/MM'),
      score: r.score,
      fullDate: format(new Date(r.completed_at), "dd 'de' MMMM", { locale: ptBR }),
      title: exams.find(e => e.id === r.exam_id)?.title || 'Simulado'
    }));

    // Activity Data (last 30 days)
    const activityData = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dayResults = userResults.filter(r => isSameDay(new Date(r.completed_at), date));
      return {
        name: format(date, 'dd/MM'),
        count: dayResults.length,
        avg: dayResults.length ? Math.round(dayResults.reduce((a, r) => a + r.score, 0) / dayResults.length) : 0
      };
    });

    // Score distribution
    const distribution = [
      { name: '0-50%', value: userResults.filter(r => r.score <= 50).length, color: 'hsl(var(--destructive))' },
      { name: '51-69%', value: userResults.filter(r => r.score > 50 && r.score < 70).length, color: 'hsl(var(--warning))' },
      { name: '70-85%', value: userResults.filter(r => r.score >= 70 && r.score <= 85).length, color: 'hsl(var(--success))' },
      { name: '86-100%', value: userResults.filter(r => r.score > 85).length, color: 'hsl(var(--primary))' },
    ].filter(d => d.value > 0);

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
      consecutiveApprovals,
      subStats,
      evolutionData,
      activityData,
      distribution
    };
  }, [examResults, exams, subcategories]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !canAccessProgress) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <PlanGate requiredPlan="tripulante" feature="Dashboard de Progresso">
            <div className="max-w-md text-center p-8 rounded-3xl bg-card border-2">
               <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
               <h2 className="text-2xl font-bold mb-2">Desbloqueie seu Progresso</h2>
               <p className="text-muted-foreground mb-6">Membros Premium têm acesso a estatísticas detalhadas, gráficos de evolução e análise de pontos fracos.</p>
               <Button asChild className="rounded-full h-12 px-8"><Link to="/premium">Ver Planos Premium</Link></Button>
            </div>
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
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors uppercase font-black text-[10px] tracking-widest px-3 py-1">Performance Hub</Badge>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Seu Painel de <span className="text-primary italic underline decoration-accent/30 underline-offset-8">Evolução</span>
              </h1>
              <p className="text-muted-foreground mt-4 text-lg max-w-xl">
                Análise completa do seu desempenho rumo à aprovação na ANAC.
              </p>
            </motion.div>
          </div>

          {!stats || stats.totalExams === 0 ? (
            <div className="text-center py-20 bg-card rounded-[40px] border-2 border-dashed">
               <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-12 h-12 text-primary opacity-20" />
               </div>
               <h2 className="text-2xl font-bold">Inicie sua jornada hoje</h2>
               <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-8">
                 Seus dados de progresso aparecerão aqui assim que você completar seu primeiro simulado.
               </p>
               <Button size="lg" className="rounded-full shadow-lg h-12 px-8" asChild>
                 <Link to="/simulados">Realizar Primeiro Simulado <ArrowRight className="ml-2 w-5 h-5" /></Link>
               </Button>
            </div>
          ) : (
            <>
              {/* Primary KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { 
                    label: 'Nota Média', 
                    value: `${stats.averageScore}%`, 
                    icon: Target, 
                    color: stats.averageScore >= 70 ? 'text-green-500' : 'text-orange-500',
                    desc: stats.trendValue !== null 
                      ? `${stats.trendValue > 0 ? '+' : ''}${stats.trendValue}% vs período anterior` 
                      : 'Mínimo 70% para aprovação',
                    trend: stats.trendValue
                  },
                  { 
                    label: 'Simulados', 
                    value: stats.totalExams, 
                    icon: History, 
                    color: 'text-primary',
                    desc: `${stats.approvedCount} aprovações conquistadas`
                  },
                  { 
                    label: 'Tempo de Estudo', 
                    value: formatDuration(stats.totalTime), 
                    icon: Clock, 
                    color: 'text-accent',
                    desc: 'Foco total em questões'
                  },
                  { 
                    label: 'Checkins Seguidos', 
                    value: `${stats.consecutiveApprovals}x`, 
                    icon: Flame, 
                    color: 'text-red-500',
                    desc: 'Aprovações consecutivas'
                  }
                ].map((kpi, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full border-2 hover:border-primary/20 transition-all duration-300 group overflow-hidden relative">
                      <div className="absolute -right-4 -top-4 p-4 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                        <kpi.icon className="w-24 h-24 rotate-12" />
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-2 rounded-lg ${kpi.color.replace('text-', 'bg-')}/10`}>
                            <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                          </div>
                          <CardDescription className="font-bold uppercase tracking-widest text-[10px]">{kpi.label}</CardDescription>
                        </div>
                        <CardTitle className={`text-4xl font-black ${kpi.color}`}>{kpi.value.toString()}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                          {kpi.trend !== undefined && kpi.trend !== null && (
                            <span className={kpi.trend > 0 ? 'text-green-500' : 'text-red-500'}>
                              {kpi.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            </span>
                          )}
                          {kpi.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Main Analytics Tabs */}
              <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-auto flex flex-wrap gap-2">
                  <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-card data-[state=active]:shadow-lg gap-2">
                    <TrendingUp className="w-4 h-4" /> Evolução
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-card data-[state=active]:shadow-lg gap-2">
                    <BarChart3 className="w-4 h-4" /> Matérias
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-card data-[state=active]:shadow-lg gap-2">
                    <Activity className="w-4 h-4" /> Atividade
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Evolution Chart */}
                    <Card className="lg:col-span-2 border-2 rounded-[32px] overflow-hidden">
                      <CardHeader className="border-b bg-muted/20 px-8 py-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-primary" /> Curva de Aprendizado
                            </CardTitle>
                            <CardDescription>Desempenho nos últimos 15 simulados</CardDescription>
                          </div>
                          <Badge variant="outline" className="border-primary/20 bg-primary/5 py-1 px-3">
                            Maior nota: {stats.bestScore}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-10 px-4 sm:px-8">
                        <div className="h-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.evolutionData}>
                              <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} dy={10} />
                              <YAxis axisLine={false} tickLine={false} fontSize={12} domain={[0, 100]} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                                itemStyle={{ fontWeight: 'bold' }}
                                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                                content={({ active, payload }) => {
                                  if (active && payload?.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-card p-4 rounded-2xl shadow-xl border-2">
                                        <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">{data.fullDate}</p>
                                        <p className="font-black text-sm mb-2">{data.title}</p>
                                        <div className="flex items-center gap-2">
                                          <div className="text-3xl font-black text-primary">{data.score}%</div>
                                          <Badge className={`h-5 px-1.5 text-[9px] font-black uppercase text-white ${data.score >= 70 ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {data.score >= 70 ? 'Aprovado' : 'Abaixo'}
                                          </Badge>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <ReferenceLine y={70} stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="3 3" opacity={0.3} />
                              <Area 
                                type="monotone" 
                                dataKey="score" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={4} 
                                fillOpacity={1} 
                                fill="url(#colorScore)" 
                                animationDuration={1500}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Distribution and Points */}
                    <div className="space-y-6">
                      <Card className="border-2 rounded-[32px] overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-accent" /> Mix de Notas
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px] flex items-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats.distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={8}
                                dataKey="value"
                              >
                                {stats.distribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex flex-col gap-2 pr-4">
                            {stats.distribution.map((d, i) => (
                              <div key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                {d.name} ({d.value})
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 rounded-[32px] overflow-hidden bg-primary shadow-lg shadow-primary/20">
                        <CardHeader className="bg-white/10 pb-4">
                          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                            <Star className="w-4 h-4 text-accent fill-accent" /> Insights de IA
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                           <p className="text-white/80 text-sm leading-relaxed">
                             {stats.averageScore >= 70 
                               ? "Você mantém uma constância excelente! Seu foco deve ser manter o controle de tempo no Modo Banca para garantir a aprovação real."
                               : "Detectamos oscilações nas matérias de Bloco. Tente realizar simulados focados especificamente nos seus pontos fracos listados abaixo."}
                           </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="categories">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.subStats.map((sub, i) => (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className={`border-2 hover:shadow-xl transition-all h-full ${
                          sub.isWeak ? 'border-red-500/20 bg-red-500/5' : sub.avg! >= 85 ? 'border-green-500/20 bg-green-500/5' : ''
                        }`}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                sub.isWeak ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                              }`}>
                                {sub.icon ? <span className="text-xl">{sub.icon}</span> : <BookOpen className="w-5 h-5" />}
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-0.5">Nota Média</p>
                                <p className={`text-2xl font-black ${sub.avg! >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                                  {sub.avg}%
                                </p>
                              </div>
                            </div>
                            <h3 className="font-bold text-base mb-4 truncate">{sub.name}</h3>
                            <div className="space-y-3">
                              <Progress 
                                value={sub.avg || 0} 
                                className={`h-2.5 rounded-full ${sub.avg! >= 70 ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'}`} 
                              />
                              <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase opacity-80">
                                <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {sub.count} Vezes</span>
                                <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-accent" /> Best: {sub.best}%</span>
                              </div>
                            </div>
                            <Button variant="ghost" className="w-full mt-4 h-9 rounded-xl text-xs gap-2 group" asChild>
                               <Link to={`/simulado-profissao/${sub.category_id}?modo=bloco&bloco_id=${sub.id}&nome_bloco=${encodeURIComponent(sub.name)}`}>
                                 Estudar esta matéria <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                               </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="calendar">
                   <Card className="border-2 rounded-[40px] overflow-hidden">
                      <CardHeader className="bg-muted/20 border-b px-8 py-6">
                        <CardTitle className="flex items-center gap-2">
                           <Activity className="w-5 h-5 text-primary" /> Frequência de Estudos
                        </CardTitle>
                        <CardDescription>Simulados realizados por dia nos últimos 30 dias</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-10">
                         <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={stats.activityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} allowDecimals={false} />
                                <Tooltip 
                                   cursor={{fill: 'hsl(var(--primary)/0.05)', radius: 8}}
                                   content={({ active, payload }) => {
                                      if (active && payload?.length) {
                                         return (
                                            <div className="bg-card p-3 rounded-xl shadow-lg border-2">
                                               <p className="text-[10px] font-black uppercase text-muted-foreground">{payload[0].payload.name}</p>
                                               <p className="font-black text-primary">{payload[0].value} simulado(s)</p>
                                            </div>
                                         )
                                      }
                                      return null;
                                   }}
                                />
                                <Bar 
                                   dataKey="count" 
                                   fill="hsl(var(--primary))" 
                                   radius={[6, 6, 0, 0]} 
                                   maxBarSize={40}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                         </div>
                         <div className="mt-8 flex flex-wrap justify-center gap-6">
                            <div className="flex flex-col items-center">
                               <p className="text-3xl font-black text-primary">{stats.activityData.reduce((a,d) => a + d.count, 0)}</p>
                               <p className="text-[10px] font-bold text-muted-foreground uppercase">Total no Mês</p>
                            </div>
                            <div className="flex flex-col items-center">
                               <p className="text-3xl font-black text-green-500">{stats.activityData.filter(d => d.count > 0).length}</p>
                               <p className="text-[10px] font-bold text-muted-foreground uppercase">Dias Ativos</p>
                            </div>
                            <div className="flex flex-col items-center">
                               <p className="text-3xl font-black text-accent">{Math.round((stats.activityData.reduce((a,d) => a+d.count, 0) / 30) * 10) / 10}</p>
                               <p className="text-[10px] font-bold text-muted-foreground uppercase">Média Diária</p>
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                </TabsContent>
              </Tabs>

              {/* Points Analysis Alert */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
                {stats.subStats.filter(s => s.isWeak).length > 0 && (
                   <div className="bg-red-500/5 rounded-[32px] p-8 border-2 border-red-500/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform">
                         <AlertTriangle className="w-32 h-32" />
                      </div>
                      <h3 className="text-xl font-black text-red-500 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" /> Pontos de Atenção
                      </h3>
                      <p className="text-sm text-red-500/80 mb-6 font-medium">Você está rendendo abaixo de 70% nas seguintes matérias:</p>
                      <div className="space-y-4 relative z-10">
                        {stats.subStats.filter(s => s.isWeak).slice(0, 3).map(sub => (
                          <div key={sub.id} className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl flex items-center justify-between">
                            <span className="font-bold text-sm truncate pr-4">{sub.name}</span>
                            <Badge className="font-black bg-red-500 text-white border-0">{sub.avg}%</Badge>
                          </div>
                        ))}
                      </div>
                      <Button className="mt-6 w-full rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black h-12 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all" asChild>
                        <Link to="/simulados">REVISAR MATÉRIAS</Link>
                      </Button>
                   </div>
                )}

                <div className="bg-green-500/5 rounded-[32px] p-8 border-2 border-green-500/20 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform">
                      <Trophy className="w-32 h-32 text-green-500" />
                   </div>
                   <h3 className="text-xl font-black text-green-500 mb-2 flex items-center gap-2">
                     <CheckCircle2 className="w-6 h-6" /> Suas Fortalezas
                   </h3>
                   <p className="text-sm text-green-500/80 mb-6 font-medium">Excelentes resultados detectados aqui (acima de 85%):</p>
                   <div className="space-y-4 relative z-10 flex-1 flex flex-col">
                     <div className="space-y-4 flex-1">
                       {stats.subStats.filter(s => s.avg! >= 85).slice(0, 3).map(sub => (
                         <div key={sub.id} className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl flex items-center justify-between">
                           <span className="font-bold text-sm truncate pr-4">{sub.name}</span>
                           <Badge className="bg-green-500 text-white font-black border-0">{sub.avg}%</Badge>
                         </div>
                       ))}
                       {stats.subStats.filter(s => s.avg! >= 85).length === 0 && (
                          <p className="italic text-muted-foreground text-center py-4">Continue praticando para atingir a maestria!</p>
                       )}
                     </div>
                     <Button className="mt-6 w-full rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black h-12 shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all" asChild>
                        <Link to="/simulados">CONTINUAR PRATICANDO</Link>
                     </Button>
                   </div>
                </div>
              </div>

              {/* History Section */}
              <div className="mt-16">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black flex items-center gap-3">
                       <History className="w-6 h-6 text-primary" /> Histórico Detalhado
                    </h2>
                    <Button variant="ghost" onClick={() => setShowAllHistory(!showAllHistory)} className="text-xs font-bold uppercase tracking-widest gap-2">
                       {showAllHistory ? <><ChevronUp className="w-4 h-4" /> Ver Menos</> : <><ChevronDown className="w-4 h-4" /> Ver Todos</>}
                    </Button>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence initial={false}>
                      {(showAllHistory ? stats.userResults : stats.userResults.slice(0, 6)).map((result, i) => {
                        const exam = exams.find(e => e.id === result.exam_id);
                        const passed = result.score >= 70;
                        return (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 border-2 ${passed ? 'border-green-500/10' : 'border-red-500/10'}`}>
                               <CardContent className="p-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center p-5 gap-4 sm:gap-6">
                                     <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-inner ${passed ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        <span className="text-xl font-black">{result.score}%</span>
                                        <span className="text-[7px] font-black uppercase tracking-tighter">{passed ? 'Aprovado' : 'Abaixo'}</span>
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-sm text-foreground mb-1 flex items-center gap-2">
                                           {exam?.title || 'Simulado Avulso'}
                                           {result.exam_mode === 'banca_anac' && <Badge className="bg-primary/10 text-primary text-[8px] h-4 border-0">MODO BANCA</Badge>}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] font-bold text-muted-foreground uppercase opacity-70">
                                           <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(result.completed_at), 'dd MMM yyyy', { locale: ptBR })}</span>
                                           <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(result.time_spent)}</span>
                                           <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {result.correct_answers}/{result.total_questions} corretas</span>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <Button variant="outline" className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest gap-2 bg-background hover:bg-primary hover:text-white transition-all border-2" asChild>
                                           <Link to={`/resultado/${result.id}`}>Ver revisão <ArrowUpRight className="w-4 h-4" /></Link>
                                        </Button>
                                     </div>
                                  </div>
                               </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                 </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
