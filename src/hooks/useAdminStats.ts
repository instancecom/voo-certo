import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export type TimeRange = 'total' | '30days' | '7days' | 'today';

export interface UserStat {
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

export const PLAN_COLORS: Record<string, string> = {
  Gratuito: 'hsl(var(--muted-foreground))',
  Solo: 'hsl(210, 80%, 55%)',
  Tripulante: 'hsl(var(--primary))',
  Comandante: 'hsl(var(--accent))',
};

export const PLAN_BADGE: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  solo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  tripulante: 'bg-primary/10 text-primary',
  comandante: 'bg-accent/10 text-accent',
};

export const PLAN_LABEL: Record<string, string> = {
  free: 'Gratuito',
  solo: 'Solo',
  tripulante: 'Tripulante',
  comandante: 'Comandante',
};

export const PLAN_PRICE: Record<string, number> = {
  free: 0,
  solo: 19.90,
  tripulante: 39.90,
  comandante: 79.90,
};

const DEFAULT_STATS = {
  userStatsList: [] as UserStat[],
  totalUsers: 0,
  activeUsers: 0,
  totalExams: 0,
  plansDistribution: [] as any[],
  totalRevenue: 0,
  avgScore: 0,
  aiQuestionsTotal: 0,
  chartData: [] as any[],
  microcourses: [] as any[],
  insignias: [] as any[],
  microcourseProgress: [] as any[],
  userInsignias: [] as any[],
  questionsCount: 0,
  badgeVerifications: [] as any[],
};

export function useAdminStats(
  timeRange: TimeRange, 
  selectedMicrocourse: string | 'all' = 'all', 
  selectedInsignia: string | 'all' = 'all',
  selectedPlan: string | 'all' = 'all',
  searchQuery: string = ''
) {
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-stats-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, plan_type, ai_questions_count, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);
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
        .limit(2000);
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

  const isWithinRange = useMemo(() => (dateStr: string | null) => {
    if (!dateStr) return false;
    if (timeRange === 'total') return true;
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (timeRange === '30days') return diffDays <= 30;
    if (timeRange === '7days') return diffDays <= 7;
    if (timeRange === 'today') return date.toDateString() === now.toDateString();
    return true;
  }, [timeRange]);

  const stats = useMemo(() => {
    if (!profiles || !examResults) return DEFAULT_STATS;

    const userStatsList: UserStat[] = profiles
      .filter(p => {
        const matchesPlan = selectedPlan === 'all' || p.plan_type === selectedPlan;
        const matchesSearch = !searchQuery || 
          p.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesPlan && matchesSearch;
      })
      .map(profile => {
        const results = (examResults || []).filter(r => r.user_id === profile.user_id && isWithinRange(r.completed_at));
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
          plan_type: profile.plan_type || 'free',
          ai_questions_count: profile.ai_questions_count || 0,
          exam_count,
          avg_score,
          total_time,
          approved_count,
          created_at: profile.created_at,
        };
      });

    const totalUsers = userStatsList.filter(u => u.email !== 'instance.com@gmail.com').length;
    const activeUsers = userStatsList.filter(u => u.exam_count > 0 && u.email !== 'instance.com@gmail.com').length;
    const totalExams = (examResults || []).filter(r => isWithinRange(r.completed_at)).length;
    
    const nonAdminProfiles = profiles.filter(p => p.email !== 'instance.com@gmail.com');
    
    const plansDistribution = [
      { name: 'Gratuito', value: nonAdminProfiles.filter(p => !p.plan_type || p.plan_type === 'free').length, color: PLAN_COLORS['Gratuito'] },
      { name: 'Solo', value: nonAdminProfiles.filter(p => p.plan_type === 'solo').length, color: PLAN_COLORS['Solo'] },
      { name: 'Tripulante', value: nonAdminProfiles.filter(p => p.plan_type === 'tripulante').length, color: PLAN_COLORS['Tripulante'] },
      { name: 'Comandante', value: nonAdminProfiles.filter(p => p.plan_type === 'comandante').length, color: PLAN_COLORS['Comandante'] },
    ];

    const totalRevenue = nonAdminProfiles.reduce((acc, p) => acc + (PLAN_PRICE[p.plan_type || 'free'] || 0), 0);
    const avgScoreTotal = totalExams ? Math.round((examResults || []).filter(r => isWithinRange(r.completed_at)).reduce((a, r) => a + r.score, 0) / totalExams) : 0;
    const aiQuestionsTotal = nonAdminProfiles.reduce((acc, p) => acc + (p.ai_questions_count || 0), 0);

    // Chart data for exams over time
    const examsTimeline = (examResults || [])
      .filter(r => isWithinRange(r.completed_at))
      .reduce((acc: any, r) => {
        const date = new Date(r.completed_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

    const chartData = Object.entries(examsTimeline)
      .map(([date, count]) => ({ date, count: count as number }))
      .sort((a, b) => {
        // Correct date sorting
        const [da, ma, ya] = a.date.split('/').map(Number);
        const [db, mb, yb] = b.date.split('/').map(Number);
        return new Date(ya, ma-1, da).getTime() - new Date(yb, mb-1, db).getTime();
      })
      .slice(-15);

    return {
      userStatsList,
      totalUsers,
      activeUsers,
      totalExams,
      plansDistribution,
      totalRevenue,
      avgScore: avgScoreTotal,
      aiQuestionsTotal,
      chartData,
      microcourses: microcourses || [],
      insignias: insignias || [],
      microcourseProgress: microcourseProgress || [],
      userInsignias: userInsignias || [],
      questionsCount: questionsCount || 0,
      badgeVerifications: badgeVerifications || [],
    };
  }, [profiles, examResults, isWithinRange, microcourses, microcourseProgress, insignias, userInsignias, questionsCount, badgeVerifications]);

  return {
    isLoading,
    ...stats,
  };
}
