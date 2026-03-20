import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
      <div className="space-y-6 animate-pulse p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Acompanhamento de métricas e usuários.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total de Alunos" 
          value={totalUsers || 0} 
          icon={Users} 
          description="Alunos cadastrados" 
        />
        <StatsCard 
          title="Faturamento Est." 
          value={`R$ ${(totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={DollarSign} 
          description="Estimativa mensal" 
        />
        <StatsCard 
          title="Simulados Realizados" 
          value={totalExams || 0} 
          icon={Target} 
          description="Atividade no período"
        />
        <StatsCard 
          title="Nota Média Geral" 
          value={`${avgScore || 0}%`} 
          icon={Percent} 
          description="Média entre todos alunos" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-none border">
          <CardHeader>
             <CardTitle className="text-sm font-medium">Cronograma de Atividade</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardHeader>
             <CardTitle className="text-sm font-medium">Assinantes por Plano</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={plansDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
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
            <div className="flex flex-col gap-2 min-w-[120px]">
              {(plansDistribution || []).map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <UserStatsTable userStats={userStatsList || []} />
    </div>
  );
}
