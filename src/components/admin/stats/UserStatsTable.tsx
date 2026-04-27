import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserStat, PLAN_BADGE, PLAN_LABEL } from '@/hooks/useAdminStats';
import { Users, Star, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserStatsTableProps {
  userStats: UserStat[];
}

export function UserStatsTable({ userStats }: UserStatsTableProps) {
  return (
    <Card className="bg-card border rounded-[5px] overflow-hidden shadow-none">
      <CardHeader className="bg-muted/10 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[5px] bg-primary/5 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Listagem de Alunos</CardTitle>
            <p className="text-xs text-muted-foreground font-medium">Análise granular por perfil de usuário.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/20 text-muted-foreground text-[9px] font-extrabold uppercase tracking-widest">
                <th className="px-6 py-4">Usuário / Email</th>
                <th className="px-6 py-4 text-center">Plano</th>
                <th className="px-6 py-4 text-center">Cadastro</th>
                <th className="px-6 py-4 text-center">Simulados</th>
                <th className="px-6 py-4 text-center">IA Q's</th>
                <th className="px-6 py-4 text-center">Média</th>
                <th className="px-6 py-4 text-center">Aprovações</th>
                <th className="px-6 py-4 text-center">Minutos</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {userStats.length > 0 ? (
                userStats.map((u) => (
                  <tr 
                    key={u.user_id} 
                    className={`hover:bg-muted/10 transition-colors group ${u.email === 'instance.com@gmail.com' ? 'bg-accent/5' : ''}`}
                  >
                    <td className={`px-6 py-4 ${u.email === 'instance.com@gmail.com' ? 'border-l-4 border-l-accent' : ''}`}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors">{u.full_name || 'Aluno Sem Nome'}</span>
                          {u.email === 'instance.com@gmail.com' && (
                            <Badge className="bg-accent/20 text-accent border-accent/30 text-[9px] font-black h-4 px-1 rounded-sm uppercase tracking-tighter">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className={`${PLAN_BADGE[u.plan_type as keyof typeof PLAN_BADGE]} border-transparent font-bold h-5 rounded-[5px]`}>
                        {PLAN_LABEL[u.plan_type as keyof typeof PLAN_LABEL] || 'Gratuito'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                         {format(new Date(u.created_at), "dd/MM/yyyy", { locale: ptBR })}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-[5px] bg-blue-500/5 text-blue-600 font-bold text-[11px] border border-blue-500/10">
                        {u.exam_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-[5px] bg-accent/5 text-accent font-bold text-[11px] border border-accent/10">
                        {u.ai_questions_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold text-[11px] px-2 py-0.5 rounded-[5px] ${u.avg_score >= 70 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
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
                      <span className="text-[11px] text-muted-foreground font-bold">
                        {Math.round(u.total_time / 60)}m
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <Search className="w-12 h-12 opacity-10" />
                      <p className="text-sm font-medium italic opacity-60">Nenhum aluno encontrado para estes filtros.</p>
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
