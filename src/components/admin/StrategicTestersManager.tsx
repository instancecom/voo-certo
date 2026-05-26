import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Trash2, Loader2, Users, Mail, Clock, Calendar, 
  Tag, MessageSquareCode, Award, ShieldAlert, BadgeHelp, 
  Smile, Sparkles, CheckCircle2, AlertTriangle, FileText, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Default airline profiles/tags recommended in request
const PRESET_TAGS = [
  'Piloto Comercial',
  'Comissário(a)',
  'Instrutor(a)',
  'Creator',
  'Parceiro Estratégico',
  'Escola de Aviação',
  'Aluno Iniciante',
];

interface Tester {
  id: string;
  email: string;
  name: string;
  tags: string[];
  notes: string | null;
  duration_days: number | null;
  status: 'invited' | 'registered' | 'expired';
  invited_at: string;
  registered_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface TesterFeedback {
  id: string;
  user_id: string;
  email: string;
  rating: number;
  liked_most: string | null;
  confused_most: string | null;
  bugs_found: string | null;
  created_at: string;
}

// Emoji mappings for feedback rating
const RATING_EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😍',
};

const RATING_LABELS: Record<number, string> = {
  1: 'Péssima',
  2: 'Ruim',
  3: 'Regular',
  4: 'Muito Boa',
  5: 'Excelente',
};

export function StrategicTestersManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedTester, setSelectedTester] = useState<Tester | null>(null);
  
  // Expiration renew access selection
  const [renewDuration, setRenewDuration] = useState('30');
  
  // Note visualizer state
  const [selectedNotes, setSelectedNotes] = useState<string | null>(null);

  // Invite Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    duration: '30',
    notes: '',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');

  const resetForm = () => {
    setForm({ name: '', email: '', duration: '30', notes: '' });
    setSelectedTags([]);
    setCustomTagInput('');
  };

  // Queries
  const { data: testers, isLoading: loadingTesters } = useQuery({
    queryKey: ['admin-testers'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('invite-tester', {
        body: { action: 'list' },
      });
      if (error) throw error;
      return (data?.testers || []) as Tester[];
    },
  });

  const { data: feedbacks, isLoading: loadingFeedbacks } = useQuery({
    queryKey: ['admin-testers-feedbacks'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('invite-tester', {
        body: { action: 'feedback_list' },
      });
      if (error) throw error;
      return (data?.feedbacks || []) as TesterFeedback[];
    },
  });

  // Mutations
  const inviteMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('invite-tester', {
        body: {
          action: 'invite',
          name: form.name,
          email: form.email,
          duration_days: form.duration === 'unlimited' ? 'unlimited' : parseInt(form.duration),
          tags: selectedTags,
          notes: form.notes || null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      if (data?.warning) {
        toast.warning(data.warning);
      } else {
        toast.success('Tester estratégico convidado com sucesso! E-mail enviado.');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-testers'] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(`Erro ao enviar convite: ${err.message}`),
  });

  const renewMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTester) return;
      const { data, error } = await supabase.functions.invoke('invite-tester', {
        body: {
          action: 'renew',
          tester_id: selectedTester.id,
          duration_days: renewDuration === 'unlimited' ? 'unlimited' : parseInt(renewDuration),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast.success('Acesso de tester estendido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin-testers'] });
      setRenewDialogOpen(false);
      setSelectedTester(null);
    },
    onError: (err: any) => toast.error(`Erro ao renovar: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('invite-tester', {
        body: { action: 'delete', tester_id: id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast.success('Cadastro de tester excluído e acessos revogados.');
      queryClient.invalidateQueries({ queryKey: ['admin-testers'] });
    },
    onError: (err: any) => toast.error(`Erro ao excluir: ${err.message}`),
  });

  // Tag Helpers
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setCustomTagInput('');
    }
  };

  const isFormValid = form.name.trim() !== '' && form.email.trim() !== '';

  return (
    <div className="space-y-6">
      <Tabs defaultValue="testers" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger value="testers" className="gap-2">
              <Users className="w-4 h-4" /> Testers Convidados
            </TabsTrigger>
            <TabsTrigger value="feedbacks" className="gap-2">
              <MessageSquareCode className="w-4 h-4" /> Feedbacks Recebidos
              {feedbacks && feedbacks.length > 0 && (
                <Badge variant="accent" className="ml-1 text-[10px] h-4 px-1">{feedbacks.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['admin-testers'] });
                queryClient.invalidateQueries({ queryKey: ['admin-testers-feedbacks'] });
                toast.success('Dados atualizados!');
              }}
              className="h-9 shrink-0 gap-2 border-border"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Atualizar
            </Button>

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="h-9 shrink-0 gap-2 font-semibold">
                  <Plus className="w-4 h-4" /> Convidar Tester
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                    <Sparkles className="w-5 h-5 text-accent" /> Convidar Tester Estratégico
                  </DialogTitle>
                  <CardDescription>
                    Envie um convite automático por e-mail com acesso Premium gratuito pré-configurado.
                  </CardDescription>
                </DialogHeader>

                <div className="space-y-4 py-3">
                  <div className="space-y-1">
                    <Label htmlFor="name">Nome do Tester</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Roberto Dias"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ex: roberto@gmail.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Duração do Acesso Premium</Label>
                    <Select value={form.duration} onValueChange={(val) => setForm({ ...form, duration: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 dias</SelectItem>
                        <SelectItem value="30">30 dias (Recomendado/Padrão)</SelectItem>
                        <SelectItem value="60">60 dias</SelectItem>
                        <SelectItem value="unlimited">Ilimitado / Vitalício</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Perfis & Tags (Identificação interna)</Label>
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-border bg-muted/20">
                      {PRESET_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <Badge
                            key={tag}
                            variant={isSelected ? 'default' : 'outline'}
                            className="cursor-pointer transition-all hover:scale-105 active:scale-95 text-xs py-1"
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Badge>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Outro perfil..."
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                        className="h-9"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addCustomTag} className="h-9">
                        Adicionar
                      </Button>
                    </div>

                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs text-muted-foreground self-center mr-1">Selecionados:</span>
                        {selectedTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1 pr-1 font-semibold text-[10px]">
                            {tag}
                            <span 
                              className="text-muted-foreground hover:text-foreground cursor-pointer font-bold pl-1"
                              onClick={() => toggleTag(tag)}
                            >
                              ×
                            </span>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="notes">Observações Internas (Opcional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Ex: Criador de conteúdo no YouTube, Instrutor de escola de voo parceira..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="min-h-[70px] resize-none"
                    />
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => { setDialogOpen(false); resetForm(); }}
                    disabled={inviteMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => inviteMutation.mutate()}
                    disabled={!isFormValid || inviteMutation.isPending}
                    className="gap-2"
                  >
                    {inviteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enviar Convite por E-mail
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* TAB 1: LIST OF STRATEGIC TESTERS */}
        <TabsContent value="testers">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Testers Estratégicos Ativos</CardTitle>
              <CardDescription>
                Lista de profissionais que receberam ou estão testando a plataforma com acesso Premium liberado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTesters ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !testers?.length ? (
                <div className="text-center py-12 border border-dashed border-border rounded-xl">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-25" />
                  <p className="text-muted-foreground italic">Nenhum tester estratégico convidado ainda.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                        <th className="pb-3 pr-4 font-bold">Tester</th>
                        <th className="pb-3 px-4 font-bold">Perfil / Tags</th>
                        <th className="pb-3 px-4 font-bold">Validade / Expiração</th>
                        <th className="pb-3 px-4 font-bold">Status</th>
                        <th className="pb-3 px-4 text-center font-bold">Obs</th>
                        <th className="pb-3 pl-4 text-right font-bold">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {testers.map((tester) => {
                        const statusColors = {
                          invited: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                          registered: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                          expired: 'bg-red-500/10 text-red-500 border-red-500/20',
                        };

                        const isExpired = tester.expires_at && new Date(tester.expires_at) < new Date();
                        const currentStatus = isExpired ? 'expired' : tester.status;

                        return (
                          <tr key={tester.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-3.5 pr-4 align-middle">
                              <div className="font-bold text-foreground">{tester.name}</div>
                              <div className="text-xs text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-muted-foreground/60" /> {tester.email}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 align-middle">
                              <div className="flex flex-wrap gap-1 max-w-[220px]">
                                {tester.tags && tester.tags.length > 0 ? (
                                  tester.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-[10px] py-0 px-1.5 border-border bg-card font-semibold shrink-0">
                                      {tag}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">-</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 align-middle font-medium text-xs">
                              {tester.expires_at ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-foreground font-semibold">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                    {new Date(tester.expires_at).toLocaleDateString('pt-BR')}
                                  </div>
                                  {!isExpired && (
                                    <div className="text-[10px] text-muted-foreground font-medium pl-5">
                                      ({Math.max(0, Math.ceil((new Date(tester.expires_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} dias restantes)
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-success font-bold">
                                  <Clock className="w-3.5 h-3.5 text-success/60" /> Ilimitado
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 align-middle">
                              <Badge className={`border uppercase text-[9px] font-bold tracking-wider ${statusColors[currentStatus]}`}>
                                {currentStatus === 'invited' && 'Convidado'}
                                {currentStatus === 'registered' && 'Ativo'}
                                {currentStatus === 'expired' && 'Expirado'}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 align-middle text-center">
                              {tester.notes ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => { setSelectedNotes(tester.notes); setNotesDialogOpen(true); }}
                                  className="h-8 w-8 hover:bg-muted text-primary"
                                  title="Ver observações"
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="py-3.5 pl-4 align-middle text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => { setSelectedTester(tester); setRenewDuration(tester.duration_days?.toString() || '30'); setRenewDialogOpen(true); }}
                                  className="h-8 text-xs font-semibold border-border hover:bg-muted text-foreground gap-1"
                                >
                                  <RefreshCw className="w-3 h-3" /> Renovar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => { if (confirm(`Revogar acessos e excluir o tester estratégico "${tester.name}"?`)) deleteMutation.mutate(tester.id); }}
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: RECEIVED FEEDBACK FEED */}
        <TabsContent value="feedbacks">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Feedbacks de Testadores</CardTitle>
              <CardDescription>
                Avaliações de experiência, erros detectados e percepções enviadas espontaneamente pelos testers logados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFeedbacks ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !feedbacks?.length ? (
                <div className="text-center py-16 border border-dashed border-border rounded-xl bg-muted/5">
                  <Smile className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground italic font-medium">Nenhum feedback foi enviado pelos testadores ainda.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Conforme os testers começarem a usar a plataforma e responderem ao card, os resultados aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <Card key={feedback.id} className="bg-muted/10 border-border/80 hover:border-border transition-all">
                      <CardContent className="p-5 md:p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-border/50 pb-4 mb-4">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Testador</span>
                            <h4 className="font-bold text-foreground flex items-center gap-2">{feedback.email}</h4>
                          </div>

                          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                            <div className="bg-card border border-border/80 rounded-lg py-1.5 px-3 flex items-center gap-2 shrink-0">
                              <span className="text-2xl" role="img" aria-label="rating">
                                {RATING_EMOJIS[feedback.rating] || '😐'}
                              </span>
                              <div className="text-left leading-none">
                                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Experiência</div>
                                <div className="text-xs font-extrabold text-foreground">{RATING_LABELS[feedback.rating]}</div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs text-muted-foreground uppercase font-bold block mb-0.5">Enviado em</span>
                              <span className="text-xs font-mono font-bold text-foreground/80">
                                {new Date(feedback.created_at).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Questions list */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="p-4 rounded-xl border border-success/15 bg-success-[5]/5 space-y-2">
                            <div className="flex items-center gap-1.5 text-success font-bold text-xs uppercase tracking-wider">
                              <CheckCircle2 className="w-4 h-4" /> O que mais gostou?
                            </div>
                            <p className="text-sm font-medium text-foreground/90 leading-relaxed whitespace-pre-wrap">
                              {feedback.liked_most || <span className="text-muted-foreground/50 italic">Sem observações</span>}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500-[5]/5 space-y-2">
                            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs uppercase tracking-wider">
                              <BadgeHelp className="w-4 h-4" /> O que confundiu?
                            </div>
                            <p className="text-sm font-medium text-foreground/90 leading-relaxed whitespace-pre-wrap">
                              {feedback.confused_most || <span className="text-muted-foreground/50 italic">Sem observações</span>}
                            </p>
                          </div>

                          {/* Bugs Found: Highlighted in red/yellow card if bugs were reported */}
                          <div 
                            className={`p-4 rounded-xl border space-y-2 transition-colors ${
                              feedback.bugs_found && feedback.bugs_found.trim().toLowerCase() !== 'não' && feedback.bugs_found.trim().toLowerCase() !== 'nada'
                                ? 'border-red-500/20 bg-red-500/5' 
                                : 'border-border/60 bg-muted/10'
                            }`}
                          >
                            <div className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider ${
                              feedback.bugs_found && feedback.bugs_found.trim().toLowerCase() !== 'não' && feedback.bugs_found.trim().toLowerCase() !== 'nada'
                                ? 'text-red-500' 
                                : 'text-muted-foreground'
                            }`}>
                              <ShieldAlert className="w-4 h-4" /> Bugs encontrados?
                            </div>
                            <p className="text-sm font-medium text-foreground/90 leading-relaxed whitespace-pre-wrap">
                              {feedback.bugs_found || <span className="text-muted-foreground/50 italic">Nenhum bug reportado</span>}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* RENEW ACCESS DIALOG */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <RefreshCw className="w-5 h-5 text-primary" /> Estender / Renovar Acesso
            </DialogTitle>
            <CardDescription>
              Selecione o novo prazo de validade do Premium para o testador **{selectedTester?.name}**.
            </CardDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <Label>Novo Prazo de Validade</Label>
            <Select value={renewDuration} onValueChange={setRenewDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">Estender por +15 dias</SelectItem>
                <SelectItem value="30">Estender por +30 dias (Padrão)</SelectItem>
                <SelectItem value="60">Estender por +60 dias</SelectItem>
                <SelectItem value="unlimited">Conceder Acesso Ilimitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => { setRenewDialogOpen(false); setSelectedTester(null); }}>
              Cancelar
            </Button>
            <Button onClick={() => renewMutation.mutate()} disabled={renewMutation.isPending}>
              {renewMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NOTES DIALOG */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <FileText className="w-4 h-4 text-primary" /> Observações do Tester
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted/50 p-4 rounded-xl border border-border/80 text-sm whitespace-pre-wrap leading-relaxed">
            {selectedNotes}
          </div>
          <DialogFooter>
            <Button onClick={() => { setNotesDialogOpen(false); setSelectedNotes(null); }}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
