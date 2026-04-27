import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, TrendingUp, Target, Brain, Award, BarChart3,
  BookOpen, GraduationCap, Clock, DollarSign, Calendar, Percent,
  CheckCircle2, ShieldCheck, Star, Search, Filter, History, MousePointer2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useAdminStats, TimeRange, PLAN_COLORS, PLAN_BADGE, PLAN_LABEL } from '@/hooks/useAdminStats';
import { StatsCard } from './stats/StatsCard';
import { FilterControls } from './stats/FilterControls';
import { UserStatsTable } from './stats/UserStatsTable';
import { Button } from '@/components/ui/button';

export function AdminStatsManager() {
  const [timeRange, setTimeRange] = useState<TimeRange>('total');
  const [selectedMicrocourse, setSelectedMicrocourse] = useState<string | 'all'>('all');
  const [selectedInsignia, setSelectedInsignia] = useState<string | 'all'>('all');
  const [selectedPlan, setSelectedPlan] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
  } = useAdminStats(timeRange, selectedMicrocourse, selectedInsignia, selectedPlan, searchQuery);

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
      })
      .slice(0, 10);
  }, [microcourseProgress, microcourses, selectedMicrocourse, userStatsList]);

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
    <div className="space-y-6 max-w-7xl mx-auto py-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard do Administrador</h1>
          <p className="text-muted-foreground text-sm">Controle total de alunos, vendas e performance global.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1">
             <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
             Acesso Admin Confirmado
           </Badge>
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
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Faturamento MRR" 
          value={`R$ ${(totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={DollarSign} 
          description="Faturamento recorrente atual" 
          className="rounded-[5px] border shadow-sm"
        />
        <StatsCard 
          title="Alunos Filtradros" 
          value={userStatsList?.length || 0} 
          icon={Users} 
          description={`De ${totalUsers} cadastrados`} 
        />
        <StatsCard 
          title="Simulados" 
          value={totalExams || 0} 
          icon={Target} 
          description="Executados no período"
        />
        <StatsCard 
          title="Uso de IA" 
          value={aiQuestionsTotal || 0} 
          icon={Brain} 
          description="Perguntas feitas ao chat" 
        />
      </div>

      {/* Meta Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-[5px] border flex items-center justify-between">
           <div>
             <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Taxa de Conversão</p>
             <p className="text-xl font-bold">{totalUsers > 0 ? Math.round(((totalUsers - (plansDistribution.find(p => p.name === 'Gratuito')?.value || 0)) / totalUsers) * 100) : 0}%</p>
           </div>
           <MousePointer2 className="w-5 h-5 text-accent opacity-20" />
        </div>
        <div className="bg-card p-4 rounded-xl border flex items-center justify-between">
           <div>
             <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Nota Média Global</p>
             <p className="text-xl font-bold">{avgScore || 0}%</p>
           </div>
           <TrendingUp className="w-5 h-5 text-green-500 opacity-20" />
        </div>
        <div className="bg-card p-4 rounded-xl border flex items-center justify-between">
           <div>
             <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Banco de Dados</p>
             <p className="text-xl font-bold">{questionsCount || 0} Questões</p>
           </div>
           <History className="w-5 h-5 text-primary opacity-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-none border lg:col-span-2 rounded-[5px]">
          <CardHeader className="pb-0">
             <CardTitle className="text-sm font-bold flex items-center gap-2">
               <History className="w-4 h-4 text-primary" /> Atividade dos Alunos
             </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData || []}>
                <defs>
                   <linearGradient id="colorAdminExams" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#colorAdminExams)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardHeader className="pb-0">
             <CardTitle className="text-sm font-bold flex items-center gap-2">
               <Percent className="w-4 h-4 text-accent" /> Composição por Plano
             </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
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
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
              {(plansDistribution || []).map((p, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  {p.name} ({p.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <UserStatsTable userStats={userStatsList || []} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Completions */}
         <Card className="border shadow-none overflow-hidden">
            <CardHeader className="bg-muted/30 border-b py-3">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" /> Últimas Conclusões de Microcursos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {courseCompletions.length > 0 ? (
                 <div className="divide-y">
                   {courseCompletions.map(c => (
                     <div key={c.id} className="p-3 flex items-center justify-between hover:bg-muted/20">
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{c.userName}</p>
                          <p className="text-[10px] text-primary font-medium">{c.courseTitle}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">{c.completedAt}</span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-8 text-center text-xs text-muted-foreground italic">
                   Nenhuma conclusão registrada.
                 </div>
               )}
            </CardContent>
         </Card>

         {/* Verifications */}
         <Card className="border shadow-none overflow-hidden">
            <CardHeader className="bg-muted/30 border-b py-3">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Verificações de Licença Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {(badgeVerifications || []).filter(v => v.status === 'pending').length > 0 ? (
                 <div className="divide-y">
                   {(badgeVerifications || []).filter(v => v.status === 'pending').map(v => (
                     <div key={v.id} className="p-3 flex items-center justify-between hover:bg-muted/20">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                          <p className="text-xs font-bold">Solicitação #{v.id.slice(0, 6)}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] text-primary">Ver Documentos</Button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-8 text-center text-xs text-muted-foreground italic">
                    Tudo em dia! Nenhuma verificação pendente.
                 </div>
               )}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
