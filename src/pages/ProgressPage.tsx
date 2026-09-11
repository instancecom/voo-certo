import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, BarChart3, Clock, Target, Award, AlertTriangle,
  CheckCircle2, ArrowRight, Loader2, Calendar, Flame, Zap,
  BookOpen, Hash, Trophy, ArrowUpRight, Sparkles, Search,
  ChevronDown, ChevronUp, History, Activity, ShieldCheck, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, PieChart, Pie, Cell,
} from 'recharts';
import { useUserResults, useExams, useSubcategories } from '@/hooks/useExams';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { AIDiagnosticModal } from '@/components/performance/AIDiagnosticModal';
import { PlanGate } from '@/components/PlanGate';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AVIATION_ROLES } from './ProfilePage';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function formatDateSafe(val: any, fmt: string, fallback = '--'): string {
  if (!val) return fallback;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return fallback;
    return format(d, fmt, { locale: ptBR });
  } catch {
    return fallback;
  }
}

export default function ProgressPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { canAccessProgress, planLabel } = usePlan();
  const { data: examResults, isLoading: resultsLoading } = useUserResults();
  const { data: exams, isLoading: examsLoading } = useExams();
  const { data: subcategories } = useSubcategories();

  const [showAllHistory, setShowAllHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'bloco' | 'livre' | 'banca'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [chartRange, setChartRange] = useState<'10' | '20' | 'all'>('10');
  const [targetRole, setTargetRole] = useState<string>('');

  useEffect(() => {
    if (!user?.id) return;
    try {
      const stored = localStorage.getItem(`voecerto_user_prefs_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.targetRole) {
          setTargetRole(parsed.targetRole);
        }
      }
    } catch {}
  }, [user?.id]);

  const targetRoleLabel = useMemo(() => {
    if (!targetRole) return 'Aeronauta';
    const found = AVIATION_ROLES.find(r => r.value === targetRole || r.label === targetRole);
    return found ? found.label : targetRole;
  }, [targetRole]);

  // Process data with enhanced safety
  const stats = useMemo(() => {
    try {
      if (!examResults || !exams || !subcategories) return null;

      const userResults = [...examResults]
        .filter(r => r && r.completed_at)
        .sort((a, b) => {
          const dateA = new Date(a.completed_at).getTime();
          const dateB = new Date(b.completed_at).getTime();
          return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        });

      const totalExams = userResults.length;
      if (totalExams === 0) return { totalExams: 0 };

      const averageScore = Math.round(userResults.reduce((acc, r) => acc + (Number(r.score) || 0), 0) / totalExams);
      const totalQuestions = userResults.reduce((acc, r) => acc + (Number(r.total_questions) || 0), 0);
      const totalCorrect = userResults.reduce((acc, r) => acc + (Number(r.correct_answers) || 0), 0);
      const totalTime = userResults.reduce((acc, r) => acc + (Number(r.time_spent) || 0), 0);
      const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      // Streak calculation
      let currentStreak = 0;
      const sortedDates = [...new Set(userResults.map(r => {
        const d = new Date(r.completed_at);
        return isNaN(d.getTime()) ? null : d.toDateString();
      }))]
        .filter((d): d is string => d !== null)
        .map(d => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime());

      if (sortedDates.length > 0) {
        let checkDate = new Date();
        const lastExamDate = sortedDates[0];

        if (lastExamDate && !isNaN(lastExamDate.getTime()) && differenceInDays(checkDate, lastExamDate) <= 1) {
          currentStreak = 1;
          for (let i = 1; i < sortedDates.length; i++) {
            if (differenceInDays(sortedDates[i - 1], sortedDates[i]) === 1) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }

      // Subcategory stats
      const subStats = (subcategories || []).map((sub, index) => {
        if (!sub) return null;
        const relevantScores: number[] = [];
        userResults.forEach(result => {
          if (!result) return;
          const exam = exams?.find(e => e.id === result.exam_id);
          if (exam?.subcategory_id === sub.id) {
            relevantScores.push(Number(result.score) || 0);
          } else if (result.block_results && Array.isArray(result.block_results)) {
            const block = result.block_results.find((b: any) =>
              b && (b.blockNumber === index + 1 || b.blockName?.toLowerCase().includes(sub.name?.toLowerCase() || ''))
            );
            if (block) relevantScores.push(Number(block.percentage) || 0);
          }
        });

        const count = relevantScores.length;
        const avg = count ? Math.round(relevantScores.reduce((a, b) => a + b, 0) / count) : 0;
        return { ...sub, avg, count, best: count ? Math.max(...relevantScores) : 0 };
      }).filter((s): s is any => s !== null && s.count > 0);

      const weakPoints = subStats.filter(s => (s.avg || 0) < 70).sort((a, b) => (a.avg || 0) - (b.avg || 0)).slice(0, 3);
      const strengths = subStats.filter(s => (s.avg || 0) >= 70).sort((a, b) => (b.avg || 0) - (a.avg || 0)).slice(0, 3);

      // Prontidão ANAC: percentual de matérias estudadas que atingiram a nota de corte (>= 70%)
      const masteredSubjectsCount = subStats.filter(s => (s.avg || 0) >= 70).length;
      const anacReadiness = subStats.length > 0
        ? Math.round((masteredSubjectsCount / subStats.length) * 100)
        : 0;

      // Evolução temporal invertida para ordem cronológica
      const allEvolution = [...userResults].reverse().map((r) => {
        return {
          date: formatDateSafe(r?.completed_at, 'dd/MM', '--'),
          score: Number(r?.score) || 0
        };
      });

      const pieData = [
        { name: 'Corretas', value: totalCorrect, color: '#10b981' },
        { name: 'Incorretas', value: Math.max(0, totalQuestions - totalCorrect), color: '#ef4444' }
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
        anacReadiness,
        masteredSubjectsCount,
        allEvolution,
        pieData
      };
    } catch (error) {
      console.error("Error processing progress stats:", error);
      return {
        totalExams: 0,
        error: true,
        userResults: [],
        allEvolution: [],
        pieData: [],
        weakPoints: [],
        strengths: [],
        subStats: [],
        anacReadiness: 0,
        masteredSubjectsCount: 0,
        averageScore: 0,
        accuracy: 0,
        currentStreak: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalTime: 0
      };
    }
  }, [examResults, exams, subcategories]);

  // Gráfico filtrado por range (10, 20 ou all)
  const displayedEvolutionData = useMemo(() => {
    if (!stats?.allEvolution) return [];
    if (chartRange === '10') return stats.allEvolution.slice(-10);
    if (chartRange === '20') return stats.allEvolution.slice(-20);
    return stats.allEvolution;
  }, [stats, chartRange]);

  const filteredHistory = useMemo(() => {
    if (!stats || !stats.userResults) return [];
    return stats.userResults.filter(r => {
      if (!r) return false;
      const exam = exams?.find(e => e.id === r.exam_id);
      const matchesSearch = !searchQuery || (exam?.title?.toLowerCase()?.includes(searchQuery.toLowerCase()) ?? false);
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-20 sm:pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <ErrorBoundary fallbackTitle="Painel de Progresso">

            {/* Top Bar com Título e Acionamento do Mike */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-border">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-accent" />
                Painel de Progresso
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Métricas oficiais de evolução baseadas nos padrões exigidos pela ANAC.
              </p>
            </div>

            <Button
              onClick={() => setIsDiagnosticOpen(true)}
              className="gap-2 font-bold text-xs sm:text-sm h-10 px-5 bg-accent text-accent-foreground hover:bg-accent/90 rounded-[5px] shrink-0 shadow-xs"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              Diagnóstico com Mike
            </Button>
          </div>

          <AIDiagnosticModal
            isOpen={isDiagnosticOpen}
            onClose={() => setIsDiagnosticOpen(false)}
            examResults={examResults || []}
            subcategories={subcategories || []}
            exams={exams || []}
            userCreatedAt={user?.created_at}
            userEmail={user?.email}
          />

          {!stats || stats.totalExams === 0 ? (
            <Card className="p-12 text-center border-dashed rounded-[5px]">
              <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-lg font-bold mb-2">Nenhum simulado concluído ainda</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Realize seu primeiro simulado teórico para desbloquear o diagnóstico de assertividade e a curva de aprendizado.
              </p>
              <Button asChild className="rounded-[5px] font-semibold hover-yellow">
                <Link to="/simulados">Encontrar Simulados</Link>
              </Button>
            </Card>
          ) : (
            /* ════════════════════════════════════════════════════════════
               LAYOUT INSPIRADO NO DASHBOARD EXECUTIVO DA REFERÊNCIA
               Coluna Esquerda (Painel Operacional) + Coluna Direita (Analítico)
               ════════════════════════════════════════════════════════════ */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* ──────────────────────────────────────────────────────────
                  COLUNA ESQUERDA (7 Colunas no Desktop)
                  ────────────────────────────────────────────────────────── */}
              <div className="lg:col-span-7 min-w-0 space-y-6">

                {/* Top Row: Card Executivo de Voo + 2 Mini Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  
                  {/* Card Preto de Voo (Igual ao card Mastercard escuro da referência) */}
                  <div className="sm:col-span-7 rounded-[5px] bg-gradient-to-br from-[#0b1329] via-[#0f172a] to-[#1e293b] text-white p-5 shadow-sm border border-border/40 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_70%)] pointer-events-none" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-bold tracking-widest uppercase text-accent">Estudante Voe Certo</span>
                      </div>
                      <Link
                        to="/perfil"
                        title="Defina ou altere sua meta no perfil"
                        className="text-[10px] font-medium px-2 py-0.5 rounded-[4px] bg-white/10 text-white/90 hover:bg-white/20 transition-colors max-w-[170px] truncate"
                      >
                        {targetRoleLabel}
                      </Link>
                    </div>

                    <div className="my-3 relative z-10">
                      <p className="text-[11px] text-white/60 uppercase tracking-wider">Aeronauta</p>
                      <p className="text-base font-black truncate text-white">
                        {profile?.full_name || user?.email?.split('@')[0] || 'Aeronauta'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs relative z-10">
                      <span className="text-white/70 text-[11px]">Meta da Banca</span>
                      <span className="font-bold text-accent">Mínimo 70% por Bloco</span>
                    </div>
                  </div>

                  {/* 2 Mini Cards (Como os cartões "Salary" e "Paypal" da imagem de referência) */}
                  <div className="sm:col-span-5 grid grid-cols-2 sm:grid-cols-1 gap-3">
                    
                    {/* Sequência de Dias */}
                    <div className="p-4 rounded-[5px] bg-card border border-border shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Sequência
                        </span>
                        <p className="text-xl font-black text-foreground mt-0.5">
                          {stats.currentStreak} {stats.currentStreak === 1 ? 'dia' : 'dias'}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-[5px] bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                        <Flame className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Total de Questões */}
                    <div className="p-4 rounded-[5px] bg-card border border-border shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Questões
                        </span>
                        <p className="text-xl font-black text-foreground mt-0.5">
                          {stats.totalQuestions}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-[5px] bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                        <Hash className="w-4 h-4" />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Pontos de Atenção & Melhores Matérias */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Pontos de Atenção (Fracos) */}
                  <div className="rounded-[5px] border border-border bg-card p-4 shadow-xs">
                    <div className="flex items-center gap-1.5 mb-3 text-destructive font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Pontos de Atenção (&lt;70%)</span>
                    </div>
                    <div className="space-y-3">
                      {stats.weakPoints && stats.weakPoints.length > 0 ? stats.weakPoints.map(wp => (
                        <div key={wp?.id || Math.random()} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-foreground truncate max-w-[170px]">{wp?.name || 'Bloco'}</span>
                            <span className="font-bold text-destructive">{wp?.avg || 0}%</span>
                          </div>
                          <Progress value={wp?.avg || 0} className="h-1.5 bg-destructive/15 [&>div]:bg-destructive rounded-[2px]" />
                          <div className="flex justify-end pt-0.5">
                            <Link
                              to={`/simulado-profissao/${wp?.category_id || ''}?modo=bloco&bloco_id=${wp?.id || ''}&nome_bloco=${encodeURIComponent(wp?.name || '')}`}
                              className="text-[10px] font-bold text-accent hover:underline flex items-center gap-0.5"
                            >
                              <Zap className="w-2.5 h-2.5 fill-current" /> Treinar Bloco
                            </Link>
                          </div>
                        </div>
                      )) : (
                        <p className="text-xs text-muted-foreground italic py-2">
                          Nenhum bloco crítico detectado no momento.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Melhores Matérias (Fortes) */}
                  <div className="rounded-[5px] border border-border bg-card p-4 shadow-xs">
                    <div className="flex items-center gap-1.5 mb-3 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Melhores Matérias (&ge;70%)</span>
                    </div>
                    <div className="space-y-3">
                      {stats.strengths && stats.strengths.length > 0 ? stats.strengths.map(s => (
                        <div key={s?.id || Math.random()} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-foreground truncate max-w-[170px]">{s?.name || 'Matéria'}</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{s?.avg || 0}%</span>
                          </div>
                          <Progress value={s?.avg || 0} className="h-1.5 bg-emerald-500/15 [&>div]:bg-emerald-500 rounded-[2px]" />
                          <p className="text-[10px] text-muted-foreground text-right pt-0.5 font-medium">
                            {s?.count || 0} simulados realizados
                          </p>
                        </div>
                      )) : (
                        <p className="text-xs text-muted-foreground italic py-2">
                          Realize mais simulados para consolidar suas matérias fortes.
                        </p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Histórico Recente de Simulados (Estilo lista "Recent Transaction" da imagem) */}
                <div className="rounded-[5px] border border-border bg-card p-5 shadow-xs space-y-4">
                  
                  {/* Cabeçalho do Histórico com Busca e Filtros */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <h2 className="text-sm sm:text-base font-bold text-foreground">
                      Histórico de Simulados
                    </h2>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                        <Input
                          placeholder="Buscar prova..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="h-8 pl-8 text-xs rounded-[5px] w-36 sm:w-44"
                        />
                      </div>

                      <Select value={historyFilter} onValueChange={v => setHistoryFilter(v as any)}>
                        <SelectTrigger className="h-8 text-xs rounded-[5px] w-28 sm:w-32">
                          <SelectValue placeholder="Modo" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[5px]">
                          <SelectItem value="all">Todos Modos</SelectItem>
                          <SelectItem value="bloco">Bloco</SelectItem>
                          <SelectItem value="livre">Livre</SelectItem>
                          <SelectItem value="banca">Banca ANAC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Linhas do Histórico */}
                  <div className="divide-y divide-border/60">
                    {(showAllHistory ? filteredHistory : filteredHistory.slice(0, 5)).map((result) => {
                      const exam = exams?.find(e => e.id === result.exam_id);
                      const passed = (Number(result.score) || 0) >= 70;

                      return (
                        <div
                          key={result.id}
                          className="py-3 flex items-center justify-between gap-3 hover:bg-muted/30 px-1 rounded-[5px] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Score Tag */}
                            <div className={`w-10 h-10 rounded-[5px] flex items-center justify-center font-black text-xs shrink-0 border ${
                              passed
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-destructive/10 text-destructive border-destructive/30'
                            }`}>
                              {Number(result.score) || 0}%
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                                {exam?.title || 'Simulado Geral'}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                                <span className="uppercase font-semibold text-accent">
                                  {result.exam_mode || 'Livre'}
                                </span>
                                <span>•</span>
                                <span>
                                  {formatDateSafe(result.completed_at, "dd 'de' MMM, HH:mm", 'Data indisponível')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="hidden sm:block text-right">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Tempo</span>
                              <span className="text-xs font-semibold text-foreground">{Math.round((Number(result.time_spent) || 0) / 60)} min</span>
                            </div>

                            <Button asChild size="sm" variant="outline" className="rounded-[5px] text-xs h-7 px-2.5">
                              <Link to={`/resultado/${result.id}`}>Ver Detalhes</Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {filteredHistory.length === 0 && (
                      <div className="py-8 text-center text-muted-foreground text-xs italic">
                        Nenhum simulado encontrado para os filtros selecionados.
                      </div>
                    )}
                  </div>

                  {filteredHistory.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground font-semibold h-8 rounded-[5px]"
                      onClick={() => setShowAllHistory(!showAllHistory)}
                    >
                      {showAllHistory ? 'Recolher Histórico' : `Exibir mais ${filteredHistory.length - 5} simulados`}
                    </Button>
                  )}

                </div>

              </div>

              {/* ──────────────────────────────────────────────────────────
                  COLUNA DIREITA (5 Colunas no Desktop — Painel Analítico)
                  Inspirado na coluna direita da imagem de referência
                  ────────────────────────────────────────────────────────── */}
              <div className="lg:col-span-5 min-w-0 rounded-[5px] border border-border bg-card p-5 sm:p-6 shadow-sm space-y-6">

                {/* Topo do Painel Analítico: Média Geral com Filtro de Tempo */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Média Geral de Acertos
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] border ${
                      stats.averageScore >= 70
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        : 'bg-destructive/10 text-destructive border-destructive/30'
                    }`}>
                      {stats.averageScore >= 70 ? 'Apto ANAC' : 'Abaixo da Meta'}
                    </span>
                  </div>

                  <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                    {stats.averageScore}%
                  </p>

                  {/* Seletor de Período (Últimos 10, Últimos 20, Todos) */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/60">
                    <button
                      onClick={() => setChartRange('10')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-[4px] transition-colors ${
                        chartRange === '10'
                          ? 'bg-accent text-accent-foreground font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Últimos 10
                    </button>
                    <button
                      onClick={() => setChartRange('20')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-[4px] transition-colors ${
                        chartRange === '20'
                          ? 'bg-accent text-accent-foreground font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Últimos 20
                    </button>
                    <button
                      onClick={() => setChartRange('all')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-[4px] transition-colors ${
                        chartRange === 'all'
                          ? 'bg-accent text-accent-foreground font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Todos
                    </button>
                  </div>
                </div>

                {/* Gráfico de Curva de Evolução Suave (AreaChart) */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-muted-foreground">Curva de Desempenho</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Meta ANAC: 70%</span>
                  </div>

                  <div className="h-[210px] w-full pt-2 min-h-[210px]">
                    {displayedEvolutionData && displayedEvolutionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={210}>
                        <AreaChart data={displayedEvolutionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            domain={[0, 100]}
                            stroke="#888888"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            ticks={[0, 50, 70, 100]}
                          />
                          <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-popover text-popover-foreground text-xs p-2 rounded-[5px] shadow-md border border-border">
                                    <p className="font-bold text-foreground">{data.score}% de acertos</p>
                                    <p className="text-[10px] text-muted-foreground">{data.date}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#F59E0B"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#scoreGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                        Dados insuficientes para gerar a curva
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Inferior Escuro de Prontidão da Banca (Como o card "Plan Completed 75%" da imagem) */}
                <div className="rounded-[5px] bg-[#0b1329] text-white p-4 sm:p-5 shadow-sm border border-border/40 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">
                      Prontidão da Banca
                    </span>
                    <p className="text-sm sm:text-base font-black text-white mt-0.5">
                      {stats.anacReadiness}% Concluído
                    </p>
                    <p className="text-[11px] text-white/70 mt-1 leading-snug max-w-[180px]">
                      {stats.masteredSubjectsCount} de {stats.subStats?.length || 0} matérias acima de 70%
                    </p>
                  </div>

                  {/* Gráfico Donut / Radial Compacto */}
                  <div className="w-20 h-20 shrink-0 relative flex items-center justify-center">
                    <PieChart width={80} height={80}>
                      <Pie
                        data={[
                          { name: 'Pronto', value: Number(stats.anacReadiness) || 0 },
                          { name: 'Restante', value: Math.max(0, 100 - (Number(stats.anacReadiness) || 0)) }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={26}
                        outerRadius={36}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="#F59E0B" />
                        <Cell fill="#1e293b" />
                      </Pie>
                    </PieChart>
                    <span className="absolute text-xs font-black text-white">
                      {stats.anacReadiness}%
                    </span>
                  </div>
                </div>

                {/* Assertividade Corretas vs Incorretas (Compacto) */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-muted-foreground">Corretas:</span>
                    <span className="font-bold text-foreground">{stats.totalCorrect}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive shrink-0" />
                    <span className="text-muted-foreground">Incorretas:</span>
                    <span className="font-bold text-foreground">{Math.max(0, stats.totalQuestions - stats.totalCorrect)}</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          </ErrorBoundary>
        </div>
      </main>

      <Footer />
    </div>
  );
}
