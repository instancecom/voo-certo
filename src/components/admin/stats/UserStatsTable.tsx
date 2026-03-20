import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserStat, PLAN_BADGE, PLAN_LABEL } from '@/hooks/useAdminStats';
import { Users, Target, Clock, Award, Star, TrendingUp } from 'lucide-react';

interface UserStatsTableProps {
  userStats: UserStat[];
}

export function UserStatsTable({ userStats }: UserStatsTableProps) {
  return (
    <Card className="bg-card/50 border-2 overflow-hidden shadow-sm">
      <CardHeader className="bg-muted/30 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Resumo por Usuário</CardTitle>
            <p className="text-xs text-muted-foreground">Desempenho detalhado dos seus alunos.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/20 text-muted-foreground transition-colors hover:bg-muted/10 tracking-widest text-[9px] font-extrabold uppercase">
                <th className="px-6 py-4 font-bold">Usuário</th>
                <th className="px-6 py-4 font-bold text-center">Plano</th>
                <th className="px-6 py-4 font-bold text-center">Simulados</th>
                <th className="px-6 py-4 font-bold text-center">IA Q's</th>
                <th className="px-6 py-4 font-bold text-center">Média</th>
                <th className="px-6 py-4 font-bold text-center">Aprovações</th>
                <th className="px-6 py-4 font-bold text-center">Tempo Estudo</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {userStats.length > 0 ? (
                userStats.map((u, i) => (
                  <tr key={u.user_id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">{u.full_name || 'Usuário Sem Nome'}</span>
                        <span className="text-[10px] text-muted-foreground font-medium underline decoration-primary/10">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={PLAN_BADGE[u.plan_type as keyof typeof PLAN_BADGE] || 'bg-muted text-muted-foreground'}>
                        {PLAN_LABEL[u.plan_type as keyof typeof PLAN_LABEL] || 'Gratuito'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-extrabold text-[11px] border border-blue-500/20">
                        {u.exam_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-extrabold text-[11px] border border-accent/20">
                        {u.ai_questions_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-extrabold flex items-center justify-center gap-1 ${u.avg_score >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                        <TrendingUp className="w-3 h-3 opacity-50" />
                        {u.avg_score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-foreground/80 flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 text-accent fill-accent" />
                        {u.approved_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 opacity-50 font-bold" />
                        {Math.round(u.total_time / 60)} min
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <Users className="w-12 h-12 opacity-10" />
                      <p className="text-sm font-medium italic opacity-60">Nenhum resultado encontrado para este período.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
