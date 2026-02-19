import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, TrendingUp, Target, Clock, Brain, Award, BarChart3, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
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
}

export function AdminStatsManager() {
  // Fetch profiles with plan info
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-stats-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, plan_type, ai_questions_count')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch exam results to compute per-user stats
  const { data: examResults, isLoading: resultsLoading } = useQuery({
    queryKey: ['admin-stats-results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_results')
        .select('user_id, score, time_spent, completed_at')
        .order('completed_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = profilesLoading || resultsLoading;

  // Compute per-user stats
  const userStats: UserStat[] = (profiles || []).map(profile => {
    const results = (examResults || []).filter(r => r.user_id === profile.user_id);
    const exam_count = results.length;
    const avg_score = exam_count
      ? Math.round(results.reduce((a, r) => a + r.score, 0) / exam_count)
      : 0;
    const total_time = results.reduce((a, r) => a + r.time_spent, 0);
    const approved_count = results.filter(r => r.score >= 70).length;

    return {
      user_id: profile.user_id,
      email: profile.email,
      full_name: profile.full_name,
      plan_type: (profile as any).plan_type || 'free',
      ai_questions_count: (profile as any).ai_questions_count || 0,
      exam_count,
      avg_score,
      total_time,
      approved_count,
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

  // Plan distribution
  const planCounts = userStats.reduce((acc, u) => {
    acc[u.plan_type] = (acc[u.plan_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const planChartData = Object.entries(planCounts).map(([plan, count]) => ({
    name: plan === 'free' ? 'Gratuito' : plan === 'solo' ? 'Solo' : plan === 'tripulante' ? 'Tripulante' : plan === 'comandante' ? 'Comandante' : plan,
    count,
  }));

  // Score distribution chart
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

  // Recent activity (last 30 days per day)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const count = (examResults || []).filter(r => r.completed_at.slice(0, 10) === dateStr).length;
    return {
      date: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      simulados: count,
    };
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const PLAN_BADGE: Record<string, string> = {
    free: 'bg-muted text-muted-foreground',
    solo: 'bg-blue-100 text-blue-700',
    tripulante: 'bg-primary/10 text-primary',
    comandante: 'bg-accent/10 text-accent',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Estatísticas da Plataforma</h2>
        <p className="text-muted-foreground">Visão geral do desempenho e engajamento dos usuários.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-primary/10"><Users className="w-4 h-4 text-primary" /></div>
                  <span className="text-xs text-muted-foreground">Usuários</span>
                </div>
                <div className="text-3xl font-bold text-foreground">{totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">{activeUsers} ativos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-accent/10"><TrendingUp className="w-4 h-4 text-accent" /></div>
                  <span className="text-xs text-muted-foreground">Simulados</span>
                </div>
                <div className="text-3xl font-bold text-foreground">{totalExams}</div>
                <p className="text-xs text-muted-foreground mt-1">total realizados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-success/10"><Target className="w-4 h-4 text-success" /></div>
                  <span className="text-xs text-muted-foreground">Média Global</span>
                </div>
                <div className={`text-3xl font-bold ${globalAvg >= 70 ? 'text-success' : 'text-warning'}`}>{globalAvg}%</div>
                <p className="text-xs text-muted-foreground mt-1">mín: 70%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-warning/10"><Brain className="w-4 h-4 text-warning" /></div>
                  <span className="text-xs text-muted-foreground">Perguntas IA</span>
                </div>
                <div className="text-3xl font-bold text-foreground">{totalAIQuestions}</div>
                <p className="text-xs text-muted-foreground mt-1">total ao chat IA</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity last 7 days */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Simulados nos Últimos 7 Dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={last7Days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="simulados" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Simulados" />
                  </BarChart>
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
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={scoreDistribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Usuários" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Plan distribution */}
          {planChartData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Distribuição por Plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {planChartData.map(p => (
                    <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 flex-1 min-w-32">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{p.count}</p>
                        <p className="text-xs text-muted-foreground">{p.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Usuários com Maior Atividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {userStats
                  .filter(u => u.exam_count > 0)
                  .sort((a, b) => b.exam_count - a.exam_count)
                  .slice(0, 20)
                  .map(u => (
                    <div key={u.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{u.full_name || u.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <Badge className={`text-xs ${PLAN_BADGE[u.plan_type] || PLAN_BADGE.free}`}>
                          {u.plan_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{u.exam_count} testes</span>
                        <span className={`text-xs font-bold ${u.avg_score >= 70 ? 'text-success' : 'text-warning'}`}>
                          {u.avg_score}%
                        </span>
                        {u.ai_questions_count > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Brain className="w-3 h-3" />{u.ai_questions_count}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                {userStats.filter(u => u.exam_count > 0).length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum usuário com testes realizados.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
