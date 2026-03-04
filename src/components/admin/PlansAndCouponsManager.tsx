import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Tag, Percent, DollarSign, Calendar, Hash, Repeat, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PLANS = [
  { id: 'solo', name: 'Solo', price: 'R$ 19,90/mês', priceId: 'price_1T2s0K5IdjxdYZGcfJIVoMGL' },
  { id: 'tripulante', name: 'Tripulante', price: 'R$ 39,90/mês', priceId: 'price_1T2s125IdjxdYZGcbdnPSAWj' },
  { id: 'comandante', name: 'Comandante', price: 'R$ 79,90/mês', priceId: 'price_1T2s1m5IdjxdYZGcxahBdOM0' },
];

const DURATION_LABELS: Record<string, string> = {
  once: 'Primeira cobrança',
  repeating: 'Repetido',
  forever: 'Para sempre',
};

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

export function PlansAndCouponsManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: '',
    plan_id: 'all',
    ends_at: '',
    max_uses: '',
    max_uses_per_user: '1',
    duration: 'once' as 'once' | 'repeating' | 'forever',
    duration_in_months: '',
  });

  const resetForm = () => setForm({
    code: '', type: 'percent', value: '', plan_id: 'all', ends_at: '', max_uses: '', max_uses_per_user: '1', duration: 'once', duration_in_months: '',
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-coupons', {
        body: { action: 'list' },
      });
      if (error) throw error;
      return (data?.coupons || []) as Coupon[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-coupons', {
        body: {
          action: 'create',
          code: form.code,
          type: form.type,
          value: parseFloat(form.value),
          plan_id: form.plan_id === 'all' ? null : form.plan_id,
          ends_at: form.ends_at || null,
          max_uses: form.max_uses ? parseInt(form.max_uses) : null,
          max_uses_per_user: parseInt(form.max_uses_per_user) || 1,
          duration: form.duration,
          duration_in_months: form.duration === 'repeating' ? parseInt(form.duration_in_months) : null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success('Cupom criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(`Erro ao criar cupom: ${err.message}`),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ coupon_id, is_active }: { coupon_id: string; is_active: boolean }) => {
      const { data, error } = await supabase.functions.invoke('manage-coupons', {
        body: { action: 'toggle', coupon_id, is_active },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast.success('Cupom atualizado!');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

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

  const isFormValid = form.code && form.value && (form.duration !== 'repeating' || (form.duration_in_months && parseInt(form.duration_in_months) > 0));

  return (
    <div className="space-y-6">
      {/* Plans Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="w-5 h-5 text-primary" />
            Planos Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <Card key={plan.id} className="bg-muted/50">
                <CardContent className="py-4">
                  <p className="font-semibold text-foreground">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">{plan.price}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono break-all">{plan.priceId}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Para alterar preços, crie novos preços no Stripe Dashboard e atualize os Price IDs no código.
          </p>
        </CardContent>
      </Card>

      {/* Coupons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Percent className="w-5 h-5 text-accent" />
            Cupons de Desconto
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Criar Cupom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Cupom</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Código</Label>
                  <Input
                    placeholder="BEMVINDO20"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={form.type} onValueChange={(v: 'percent' | 'fixed') => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percentual (%)</SelectItem>
                        <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      placeholder={form.type === 'percent' ? '20' : '10.00'}
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                    />
                  </div>
                </div>

                {/* Duration field */}
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5" />
                    Duração do desconto
                  </Label>
                  <Select value={form.duration} onValueChange={(v: 'once' | 'repeating' | 'forever') => setForm({ ...form, duration: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once – Apenas na primeira cobrança</SelectItem>
                      <SelectItem value="repeating">Repeating – Por X meses</SelectItem>
                      <SelectItem value="forever">Forever – Todas as cobranças</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.duration === 'repeating' && (
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Duração em meses
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Ex: 3, 6, 12"
                      value={form.duration_in_months}
                      onChange={(e) => setForm({ ...form, duration_in_months: e.target.value })}
                    />
                  </div>
                )}

                <div>
                  <Label>Aplicável a</Label>
                  <Select value={form.plan_id} onValueChange={(v) => setForm({ ...form, plan_id: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os planos</SelectItem>
                      {PLANS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Validade (opcional)</Label>
                    <Input
                      type="date"
                      value={form.ends_at}
                      onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Limite de usos</Label>
                    <Input
                      type="number"
                      placeholder="Ilimitado"
                      value={form.max_uses}
                      onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Usos por usuário</Label>
                  <Input
                    type="number"
                    value={form.max_uses_per_user}
                    onChange={(e) => setForm({ ...form, max_uses_per_user: e.target.value })}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !isFormValid}
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Criar Cupom no Stripe
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !coupons?.length ? (
            <p className="text-center text-muted-foreground py-8">Nenhum cupom criado ainda.</p>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-foreground">{coupon.code}</span>
                      <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                        {coupon.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {coupon.plan_id && (
                        <Badge variant="outline" className="text-xs">{coupon.plan_id}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        {coupon.type === 'percent' ? <Percent className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                        {coupon.type === 'percent' ? `${coupon.value}%` : `R$ ${coupon.value}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        {DURATION_LABELS[coupon.duration] || coupon.duration}
                        {coupon.duration === 'repeating' && coupon.duration_in_months && ` (${coupon.duration_in_months}m)`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {coupon.uses_count}{coupon.max_uses ? `/${coupon.max_uses}` : ''} usos
                      </span>
                      {coupon.ends_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          até {new Date(coupon.ends_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleMutation.mutate({ coupon_id: coupon.id, is_active: !coupon.is_active })}
                      disabled={toggleMutation.isPending}
                    >
                      {coupon.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { if (confirm('Excluir este cupom?')) deleteMutation.mutate(coupon.id); }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
