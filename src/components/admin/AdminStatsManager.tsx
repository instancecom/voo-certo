import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, TrendingUp, Target, Brain, Award, BarChart3, AlertTriangle,
  BookOpen, GraduationCap, Clock, DollarSign, Calendar, Percent, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface UserStat {
  user_id: string;
  email: string;
  full_name: string | null;
  plan_type: string;
  ai_questions_count: number;
  exam_count: number;
  avg_score: number;
  total_time: number;
  approved_count: number;
  created_at: string;
}

const PLAN_COLORS: Record<string, string> = {
  Gratuito: 'hsl(var(--muted-foreground))',
  Solo: 'hsl(210, 80%, 55%)',
  Tripulante: 'hsl(var(--primary))',
  Comandante: 'hsl(var(--accent))',
};

const PLAN_BADGE: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  solo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  tripulante: 'bg-primary/10 text-primary',
  comandante: 'bg-accent/10 text-accent',
};

const PLAN_LABEL: Record<string, string> = {
  free: 'Gratuito',
  solo: 'Solo',
  tripulante: 'Tripulante',
  comandante: 'Comandante',
};

const PLAN_PRICE: Record<string, number> = {
  free: 0,
  solo: 19.90,
  tripulante: 39.90,
  comandante: 79.90,
};

type TimeRange = 'total' | '30days' | '7days' | 'today';

export function AdminStatsManager() {
  const [timeRange, setTimeRange] = useState<TimeRange>('total');
  const [selectedMicrocourse, setSelectedMicrocourse] = useState<string | 'all'>('all');
  const [selectedInsignia, setSelectedInsignia] = useState<string | 'all'>('all');
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-stats-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, plan_type, ai_questions_count, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: examResults, isLoading: resultsLoading } = useQuery({
    queryKey: ['admin-stats-results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_results')
        .select('user_id, score, time_spent, completed_at, exam_mode')
        .order('completed_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: microcourses } = useQuery({
    queryKey: ['admin-stats-microcourses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('microcourses').select('id, title, is_active');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: microcourseProgress } = useQuery({
    queryKey: ['admin-stats-microcourse-progress'],
    queryFn: async () => {
      const { data, error } = await supabase.from('microcourse_progress').select('id, microcourse_id, user_id, completed');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: insignias } = useQuery({
    queryKey: ['admin-stats-insignias'],
    queryFn: async () => {
      const { data, error } = await supabase.from('insignias').select('id, name, is_active');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: userInsignias } = useQuery({
    queryKey: ['admin-stats-user-insignias'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_insignias').select('id, user_id, insignia_id, earned_at');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: questions } = useQuery({
    queryKey: ['admin-stats-questions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('questions').select('id', { count: 'exact', head: true });
      if (error) throw error;
      return { count: (error as any) ? 0 : data };
    },
  });

  const { data: questionsCount } = useQuery({
    queryKey: ['admin-stats-questions-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('questions').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: badgeVerifications } = useQuery({
    queryKey: ['admin-stats-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase.from('badge_verifications').select('id, status, submitted_at');
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = profilesLoading || resultsLoading;

  // Filter utility
  const isWithinRange = (dateStr: string | null) => {
    if (!dateStr) return false;
    if (timeRange === 'total') return true;
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    
    if (timeRange === '30days') return diffDays <= 30;
    if (timeRange === '7days') return diffDays <= 7;
    if (timeRange === 'today') return date.toDateString() === now.toDateString();
    return true;
  };

  // Per-user stats
  const userStats: UserStat[] = (profiles || []).map(profile => {
    const results = (examResults || []).filter(r => r.user_id === profile.user_id && isWithinRange(r.completed_at));
    const exam_count = results.length;
    const avg_score = exam_count
      ? Math.round(results.reduce((a, r) => a + r.score, 0) / exam_count)
      : 0;
    const total_time = results.reduce((a, r) => a + r.time_spent, 0);
    const approved_count = results.filter(r => r.score >= 70).length;

    // AI questions usage within range is tricky because profile has a total counter.
    // For now we use the total but in a real app we'd need a usage history table.
    // However, for the user's immediate needs, showing the totals based on the overall count is fine,
    // or we can simulate it for now if we don't have a history table.
    
    return {
      user_id: profile.user_id,
      email: profile.email,
      full_name: profile.full_name,
      plan_type: profile.plan_type || 'free',
      ai_questions_count: profile.ai_questions_count || 0,
      exam_count,
      avg_score,
      total_time,
      approved_count,
      created_at: profile.created_at,
    };
  });

  // Global stats
  const totalUsers = userStats.length;
  const activeUsers = userStats.filter(u => u.exam_count > 0).length;
  const totalExams = userStats.reduce((a, u) => a + u.exam_count, 0);
  const globalAvg = totalExams
    ? Math.round(userStats.reduce((a, u) => a + u.avg_score * u.exam_count, 0) / totalExams)
    : 0;
  const totalAIQuestions = userStats.reduce((a, u) => a + u.ai_questions_count, 0);
  const totalTimeSpent = userStats.reduce((a, u) => a + u.total_time, 0);
  const approvalRate = totalExams
    ? Math.round((userStats.reduce((a, u) => a + u.approved_count, 0) / totalExams) * 100)
    : 0;

  // Revenue estimate (MRR)
  const payingUsers = userStats.filter(u => u.plan_type !== 'free');
  const mrr = payingUsers.reduce((a, u) => a + (PLAN_PRICE[u.plan_type] || 0), 0);

  // Plan distribution
  const planCounts = userStats.reduce((acc, u) => {
    const label = PLAN_LABEL[u.plan_type] || u.plan_type;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const planPieData = Object.entries(planCounts).map(([name, value]) => ({ name, value }));

  // Score distribution
  const scoreRanges = [
    { range: '0-30%', min: 0, max: 30 },
    { range: '31-50%', min: 31, max: 50 },
    { range: '51-70%', min: 51, max: 70 },
    { range: '71-85%', min: 71, max: 85 },
    { range: '86-100%', min: 86, max: 100 },
  ];

  const scoreDistribution = scoreRanges.map(r => ({
    range: r.range,
    count: userStats.filter(u => u.avg_score >= r.min && u.avg_score <= r.max && u.exam_count > 0).length,
  }));

  // Last 30 days activity
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const count = (examResults || []).filter(r => r.completed_at?.slice(0, 10) === dateStr).length;
    const newUsers = (profiles || []).filter(p => p.created_at?.slice(0, 10) === dateStr).length;
    return {
      date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      simulados: count,
      novosUsuarios: newUsers,
    };
  });

  // Last 7 days for quick view
  const last7Days = last30Days.slice(-7).map((d, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return { ...d, date: date.toLocaleDateString('pt-BR', { weekday: 'short' }) };
  });

  // New users this week vs last week
  const now = new Date();
  const oneWeekAgo = new Date(now); oneWeekAgo.setDate(now.getDate() - 7);
  const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14);
  const newUsersThisWeek = (profiles || []).filter(p => new Date(p.created_at) >= oneWeekAgo).length;
  const newUsersLastWeek = (profiles || []).filter(p => new Date(p.created_at) >= twoWeeksAgo && new Date(p.created_at) < oneWeekAgo).length;
  const userGrowth = newUsersLastWeek > 0 ? Math.round(((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek) * 100) : newUsersThisWeek > 0 ? 100 : 0;

  // Microcourse stats
  const totalMicrocourses = (microcourses || []).filter(m => m.is_active).length;
  const completedMicrocourses = (microcourseProgress || []).filter(p => p.completed).length;
  const enrolledMicrocourses = (microcourseProgress || []).length;

  // Badge stats
  const totalInsignias = (insignias || []).filter(i => i.is_active).length;
  const totalEarnedInsignias = (userInsignias || []).length;
  const pendingVerifications = (badgeVerifications || []).filter(v => v.status === 'pending').length;

  // Exam mode distribution
  const examModes = (examResults || []).reduce((acc, r) => {
    const mode = r.exam_mode || 'standard';
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const examModeData = Object.entries(examModes).map(([mode, count]) => ({
    name: mode === 'standard' ? 'Padrão' : mode === 'livre' ? 'Livre' : mode === 'anac' ? 'ANAC' : mode,
    value: count,
  }));

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 8,
    color: 'hsl(var(--foreground))',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Estatísticas da Plataforma</h2>
          <p className="text-muted-foreground">Visão geral completa do desempenho, engajamento e receita.</p>
        </div>
        
        <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
          {(['total', '30days', '7days', 'today'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range === 'total' ? 'Total' : range === '30days' ? '30 Dias' : range === '7days' ? '7 Dias' : 'Hoje'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* KPI Cards - Row 1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users} iconColor="text-primary" iconBg="bg-primary/10"
              label="Usuários" value={totalUsers}
              sub={<span className="flex items-center gap-1">
                {activeUsers} ativos
                {userGrowth !== 0 && (
                  <span className={`flex items-center text-xs ${userGrowth > 0 ? 'text-success' : 'text-destructive'}`}>
                    {userGrowth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(userGrowth)}%
                  </span>
                )}
              </span>}
            />
            <StatCard
              icon={TrendingUp} iconColor="text-accent" iconBg="bg-accent/10"
              label="Simulados" value={totalExams}
              sub={`${last7Days.reduce((a, d) => a + d.simulados, 0)} esta semana`}
            />
            <StatCard
              icon={Target} iconColor="text-success" iconBg="bg-success/10"
              label="Média Global" value={`${globalAvg}%`}
              valueColor={globalAvg >= 70 ? 'text-success' : 'text-warning'}
              sub={`${approvalRate}% aprovação (≥70%)`}
            />
            <StatCard
              icon={Brain} iconColor="text-warning" iconBg="bg-warning/10"
              label="Perguntas IA" value={totalAIQuestions}
              sub="total ao chat IA"
            />
          </div>

          {/* KPI Cards - Row 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={DollarSign} iconColor="text-success" iconBg="bg-success/10"
              label="MRR Estimado" value={`R$ ${mrr.toFixed(2).replace('.', ',')}`}
              sub={`${payingUsers.length} assinantes`}
            />
            <StatCard
              icon={Clock} iconColor="text-primary" iconBg="bg-primary/10"
              label="Tempo Total" value={formatTime(totalTimeSpent)}
              sub="em simulados"
            />
            <StatCard
              icon={BookOpen} iconColor="text-accent" iconBg="bg-accent/10"
              label="Microcursos" value={totalMicrocourses}
              sub={`${completedMicrocourses} conclusões`}
            />
            <StatCard
              icon={Award} iconColor="text-warning" iconBg="bg-warning/10"
              label="Insígnias" value={totalInsignias}
              sub={<span>{totalEarnedInsignias} conquistadas {pendingVerifications > 0 && <Badge variant="destructive" className="text-[10px] ml-1">{pendingVerifications} pendentes</Badge>}</span>}
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity last 30 days */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Atividade nos Últimos 30 Dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={last30Days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={4} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="simulados" stroke="hsl(var(--primary))" fill="url(#simGrad)" name="Simulados" />
                    <Area type="monotone" dataKey="novosUsuarios" stroke="hsl(var(--accent))" fill="url(#userGrad)" name="Novos Usuários" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent" />
                  Distribuição de Notas (Média por Usuário)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={scoreDistribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Usuários" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plan distribution pie */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Distribuição por Plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={planPieData}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {planPieData.map((entry) => (
                        <Cell key={entry.name} fill={PLAN_COLORS[entry.name] || 'hsl(var(--muted-foreground))'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Exam mode distribution */}
            {examModeData.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-accent" />
                    Simulados por Modo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={examModeData}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="hsl(var(--accent))" />
                        <Cell fill="hsl(var(--success))" />
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Quick numbers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Percent className="w-4 h-4 text-success" />
                  Métricas de Engajamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricRow label="Taxa de ativação" value={totalUsers > 0 ? `${Math.round((activeUsers / totalUsers) * 100)}%` : '0%'} desc="Usuários que fizeram ≥1 simulado" />
                <MetricRow label="Média simulados/user" value={activeUsers > 0 ? (totalExams / activeUsers).toFixed(1) : '0'} desc="Entre usuários ativos" />
                <MetricRow label="Tempo médio/simulado" value={totalExams > 0 ? formatTime(Math.round(totalTimeSpent / totalExams)) : '0m'} desc="Duração média" />
                <MetricRow label="Novos esta semana" value={String(newUsersThisWeek)} desc={`Semana anterior: ${newUsersLastWeek}`} />
                <MetricRow label="Questões cadastradas" value={String(questionsCount || 0)} desc="No banco de questões" />
              </CardContent>
            </Card>
          </div>

          {/* All Users Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Todos os Usuários ({totalUsers})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 p-2 text-xs font-semibold text-muted-foreground border-b border-border mb-2">
                <span>Usuário</span>
                <span className="w-24 text-center">Plano</span>
                <span className="w-16 text-center">Testes</span>
                <span className="w-16 text-center">Média</span>
                <span className="w-16 text-center">Chat IA</span>
                <span className="w-24 text-center">Cadastro</span>
              </div>
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {userStats
                  .filter(u => timeRange === 'total' || u.exam_count > 0 || isWithinRange(u.created_at))
                  .sort((a, b) => b.exam_count - a.exam_count)
                  .map(u => (
                    <div key={u.user_id} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 md:gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors items-center">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{u.full_name || u.email.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="w-24 flex justify-center">
                        <Badge className={`text-xs ${PLAN_BADGE[u.plan_type] || PLAN_BADGE.free}`}>
                          {PLAN_LABEL[u.plan_type] || u.plan_type}
                        </Badge>
                      </div>
                      <span className="w-16 text-center text-sm text-foreground">{u.exam_count}</span>
                      <span className={`w-16 text-center text-sm font-bold ${u.exam_count === 0 ? 'text-muted-foreground' : u.avg_score >= 70 ? 'text-success' : 'text-warning'}`}>
                        {u.exam_count > 0 ? `${u.avg_score}%` : '—'}
                      </span>
                      <span className="w-16 text-center text-sm text-muted-foreground">
                        {u.ai_questions_count > 0 ? u.ai_questions_count : '—'}
                      </span>
                      <span className="w-24 text-center text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                {userStats.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Microcourses Detailed Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3 border-b mb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent" />
                    Microcursos Concluídos
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {(microcourseProgress || []).filter(p => p.completed).map(progress => {
                    const course = (microcourses || []).find(m => m.id === progress.microcourse_id);
                    const userData = (profiles || []).find(p => p.user_id === progress.user_id);
                    return (
                      <div key={progress.id} className="flex items-start justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{course?.title || 'Curso Removido'}</p>
                          <p className="text-xs text-muted-foreground truncate">{userData?.full_name || userData?.email || 'Usuário Desconhecido'}</p>
                        </div>
                        <Badge variant="secondary" className="bg-success/10 text-success border-none text-[10px] h-5">CONCLUÍDO</Badge>
                      </div>
                    );
                  })}
                  {!(microcourseProgress || []).some(p => p.completed) && (
                    <div className="text-center py-10 text-muted-foreground">
                      Nenhuma conclusão registrada ainda.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b mb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="w-5 h-5 text-warning" />
                    Histórico de Insígnias
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {(userInsignias || []).sort((a,b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()).map(earned => {
                    const insignia = (insignias || []).find(i => i.id === earned.insignia_id);
                    const userData = (profiles || []).find(p => p.user_id === earned.user_id);
                    return (
                      <div key={earned.id} className="flex items-start justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{insignia?.name || 'Insígnia Removida'}</p>
                          <p className="text-xs text-muted-foreground truncate">{userData?.full_name || userData?.email || 'Usuário Desconhecido'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(earned.earned_at).toLocaleDateString('pt-BR')}</p>
                          <p className="text-[10px] text-muted-foreground opacity-60">{new Date(earned.earned_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    );
                  })}
                  {(userInsignias || []).length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      Nenhuma insígnia conquistada ainda.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, iconColor, iconBg, label, value, valueColor, sub }: {
  icon: any; iconColor: string; iconBg: string;
  label: string; value: string | number; valueColor?: string;
  sub: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg ${iconBg}`}><Icon className={`w-4 h-4 ${iconColor}`} /></div>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className={`text-2xl font-bold ${valueColor || 'text-foreground'}`}>{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value, desc }: { label: string; value: string; desc: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span className="text-lg font-bold text-foreground">{value}</span>
    </div>
  );
}
