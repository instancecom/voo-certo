import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, ToggleLeft, ToggleRight, Loader2, Tag, Percent, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: string;
  checkoutUrl: string;
}

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  plan_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  max_uses_per_user: number | null;
  uses_count: number;
  is_active: boolean;
  created_at: string;
  duration: string;
  duration_in_months: number | null;
}

const DEFAULT_PLANS: Plan[] = [
  { id: 'solo', name: 'Solo', price: 'R$ 19,90/mês', checkoutUrl: 'https://pay.cakto.com.br/659x89z_1012189' },
  { id: 'tripulante', name: 'Tripulante', price: 'R$ 39,90/mês', checkoutUrl: 'https://pay.cakto.com.br/o2twp3f_1012195' },
  { id: 'comandante', name: 'Comandante', price: 'R$ 79,90/mês', checkoutUrl: 'https://pay.cakto.com.br/4wat335_1012197' },
];

export function PlansAndCouponsManager() {
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Buscar valores dos planos atualizados diretamente da Cakto
  const { data: plans = DEFAULT_PLANS, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['admin-cakto-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-coupons', {
        body: { action: 'get_plans' },
      });
      if (error) return DEFAULT_PLANS;
      return (data?.plans || DEFAULT_PLANS) as Plan[];
    },
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });

  // Listar Cupons cadastrados
  const { data: coupons = [], isLoading: isLoadingCoupons } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-coupons', {
        body: { action: 'list' },
      });
      if (error) throw error;
      return (data?.coupons || []) as Coupon[];
    },
  });

  // Ativar / Desativar Cupom
  const toggleMutation = useMutation({
    mutationFn: async ({ coupon_id, is_active }: { coupon_id: string; is_active: boolean }) => {
      const { data, error } = await supabase.functions.invoke('manage-coupons', {
        body: { action: 'toggle', coupon_id, is_active },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast.success('Status do cupom atualizado!');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  // Excluir Cupom
  const deleteMutation = useMutation({
    mutationFn: async (coupon_id: string) => {
      const { data, error } = await supabase.functions.invoke('manage-coupons', {
        body: { action: 'delete', coupon_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast.success('Cupom excluído!');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  // Copiar código do cupom
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Código "${code}" copiado!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Seção Superior: Planos Ativos (Puxados diretamente da Cakto) */}
      <Card className="rounded-[5px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Planos Ativos (Cakto)
            </span>
            <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
              Sincronizado da Cakto
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPlans ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card key={plan.id} className="bg-muted/40 border-border rounded-[5px]">
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground">{plan.name}</p>
                      <Badge variant="secondary" className="text-xs font-bold bg-primary/10 text-primary">
                        Ativo
                      </Badge>
                    </div>
                    <p className="text-lg font-black text-primary">{plan.price}</p>
                    <a
                      href={plan.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 font-mono truncate pt-1 border-t border-border"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      Link de Checkout Cakto
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Os valores dos planos são sincronizados em tempo real do painel de checkout da Cakto. Qualquer alteração feita na Cakto será refletida automaticamente neste painel.
          </p>
        </CardContent>
      </Card>

      {/* Seção Inferior: Cupons de Desconto (Criados diretamente na Cakto) */}
      <Card className="rounded-[5px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-accent" />
              Cupons de Desconto (Cakto)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCoupons ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !coupons?.length ? (
            <div className="text-center text-muted-foreground py-8 space-y-2">
              <p className="text-sm font-semibold">Nenhum cupom ativo registrado.</p>
              <p className="text-xs">Crie os cupons diretamente no painel da Cakto. Eles aparecerão listados aqui automaticamente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => {
                const discountLabel = coupon.type === 'percent' 
                  ? `${coupon.value}% de desconto` 
                  : `R$ ${coupon.value.toFixed(2).replace('.', ',')} de desconto`;

                return (
                  <div
                    key={coupon.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[5px] border border-border bg-card hover:bg-muted/20 transition-colors shadow-sm"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-base text-foreground tracking-wider bg-muted/60 px-2.5 py-0.5 rounded-[5px] border border-border">
                          {coupon.code}
                        </span>

                        <Badge variant={coupon.is_active ? 'default' : 'secondary'} className="text-[10px] rounded-[5px]">
                          {coupon.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>

                        <Badge variant="outline" className="text-[10px] font-bold border-accent/40 text-accent bg-accent/5 rounded-[5px]">
                          {discountLabel}
                        </Badge>

                        {coupon.plan_id && (
                          <Badge variant="outline" className="text-[10px] capitalize rounded-[5px]">
                            Plano: {coupon.plan_id}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground pt-0.5">
                        {coupon.uses_count > 0 ? `${coupon.uses_count} uso(s) efetuado(s)` : 'Nenhum uso registrado até o momento'}
                      </p>
                    </div>

                    {/* Botões de Ação do Cupom */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Botão Copiar Código */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyCode(coupon.code)}
                        className="gap-1.5 text-xs font-bold rounded-[5px] border-primary/30 hover:bg-primary/10 hover:text-primary"
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-success" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiar código
                          </>
                        )}
                      </Button>

                      {/* Botão Ativar/Desativar */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleMutation.mutate({ coupon_id: coupon.id, is_active: !coupon.is_active })}
                        disabled={toggleMutation.isPending}
                        title={coupon.is_active ? 'Desativar cupom' : 'Ativar cupom'}
                        className="rounded-[5px]"
                      >
                        {coupon.is_active ? (
                          <ToggleRight className="w-6 h-6 text-success" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                        )}
                      </Button>

                      {/* Botão Excluir */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Excluir o cupom "${coupon.code}"?`)) {
                            deleteMutation.mutate(coupon.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        title="Excluir cupom"
                        className="rounded-[5px] text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
