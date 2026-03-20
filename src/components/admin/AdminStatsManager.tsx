import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, TrendingUp, Target, Brain, Award, BarChart3,
  BookOpen, GraduationCap, Clock, DollarSign, Calendar, Percent,
  CheckCircle2, ShieldCheck, Star
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useAdminStats, TimeRange, PLAN_COLORS, PLAN_BADGE, PLAN_LABEL } from '@/hooks/useAdminStats';
import { StatsCard } from './stats/StatsCard';
import { FilterControls } from './stats/FilterControls';
import { UserStatsTable } from './stats/UserStatsTable';

export function AdminStatsManager() {
  const [timeRange, setTimeRange] = useState<TimeRange>('total');
  const [selectedMicrocourse, setSelectedMicrocourse] = useState<string | 'all'>('all');
  const [selectedInsignia, setSelectedInsignia] = useState<string | 'all'>('all');

  const {
    isLoading,
    userStatsList,
    totalUsers,
    activeUsers,
    totalExams,
    plansDistribution,
    totalRevenue,
    avgScore,
    aiQuestionsTotal,
    chartData,
    microcourses,
    insignias,
    microcourseProgress,
    userInsignias,
    questionsCount,
    badgeVerifications,
  } = useAdminStats(timeRange, selectedMicrocourse, selectedInsignia);

  // Filtered microcourse completions
  const courseCompletions = useMemo(() => {
    if (!microcourseProgress || !microcourses || !userStatsList) return [];
    
    return microcourseProgress
      .filter(p => p.completed && (selectedMicrocourse === 'all' || p.microcourse_id === selectedMicrocourse))
      .map(p => {
        const course = microcourses.find(c => c.id === p.microcourse_id);
        const user = userStatsList.find(u => u.user_id === p.user_id);
        return {
          id: p.id,
          userName: user?.full_name || 'Desconhecido',
          userEmail: user?.email,
          courseTitle: course?.title || 'Curso Removido',
          completedAt: new Date().toLocaleDateString(),
        };
      });
  }, [microcourseProgress, microcourses, selectedMicrocourse, userStatsList]);

  // Filtered insignia earners
  const insigniaEarners = useMemo(() => {
    if (!userInsignias || !insignias || !userStatsList) return [];
    
    return userInsignias
      .filter(ui => selectedInsignia === 'all' || ui.insignia_id === selectedInsignia)
      .map(ui => {
        const insignia = insignias.find(i => i.id === ui.insignia_id);
        const user = userStatsList.find(u => u.user_id === ui.user_id);
        return {
          id: ui.id,
          userName: user?.full_name || 'Desconhecido',
          userEmail: user?.email,
          insigniaName: insignia?.name || 'Insígnia Removida',
          earnedAt: new Date(ui.earned_at).toLocaleDateString(),
        };
      });
  }, [userInsignias, insignias, selectedInsignia, userStatsList]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Card key={i} className="h-32 bg-card/50 border-2" />)}
        </div>
        <Card className="h-[400px] bg-card/50 border-2" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            Dashboard do Administrador
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">Visão geral do desempenho da plataforma</p>
        </div>
      </div>

      <FilterControls
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        microcourses={microcourses || []}
        selectedMicrocourse={selectedMicrocourse}
        setSelectedMicrocourse={setSelectedMicrocourse}
        insignias={insignias || []}
        selectedInsignia={selectedInsignia}
        setSelectedInsignia={setSelectedInsignia}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Alunos Totais" 
          value={totalUsers || 0} 
          icon={Users} 
          description="Base total de usuários" 
        />
        <StatsCard 
          title="Faturamento Est." 
          value={`R$ ${(totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={DollarSign} 
          description="MRR baseado em planos ativos" 
        />
        <StatsCard 
          title="Simulados" 
          value={totalExams || 0} 
          icon={Target} 
          description="Atividade no período filtrado"
        />
        <StatsCard 
          title="Média Geral" 
          value={`${avgScore || 0}%`} 
          icon={Percent} 
          description="Desempenho acadêmico global" 
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card p-4 flex items-center gap-4 border-2 border-primary/5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Uso de IA</p>
            <p className="text-lg font-bold">{aiQuestionsTotal || 0}</p>
          </div>
        </Card>
        
        <Card className="bg-card p-4 flex items-center gap-4 border-2 border-primary/5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Banco de Dados</p>
            <p className="text-lg font-bold">{questionsCount || 0} Questões</p>
          </div>
        </Card>
        
        <Card className="bg-card p-4 flex items-center gap-4 border-2 border-primary/5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Verificações</p>
            <p className="text-lg font-bold">{(badgeVerifications || []).filter(v => v.status === 'pending').length} Pendentes</p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card border-2 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Atividade de Simulados
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData || []}>
                <defs>
                  <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="date" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorExams)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-2 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Percent className="w-5 h-5 text-accent" /> Mix de Assinantes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={plansDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(plansDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {(plansDistribution || []).map((p, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <UserStatsTable userStats={userStatsList || []} />

      {/* Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Microcourses */}
        <Card className="bg-card border-2 overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/30 pb-4 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" /> Conclusões de Microcursos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
              {courseCompletions.length > 0 ? (
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-3 text-left">Aluno</th>
                      <th className="px-4 py-3 text-left">Curso</th>
                      <th className="px-4 py-3 text-right">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {courseCompletions.map(c => (
                      <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3 font-bold">{c.userName}</td>
                        <td className="px-4 py-3 font-semibold text-primary">{c.courseTitle}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{c.completedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 text-center text-muted-foreground italic text-xs">
                   Nenhum resultado para os filtros atuais.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Insignias */}
        <Card className="bg-card border-2 overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/30 pb-4 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" /> Conquistas de Insígnias
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
              {insigniaEarners.length > 0 ? (
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-3 text-left">Ganhador</th>
                      <th className="px-4 py-3 text-left">Insígnia</th>
                      <th className="px-4 py-3 text-right">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {insigniaEarners.map(e => (
                      <tr key={e.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3 font-bold">{e.userName}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5">
                            {e.insigniaName}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{e.earnedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 text-center text-muted-foreground italic text-xs">
                  Nenhum resultado para os filtros atuais.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
