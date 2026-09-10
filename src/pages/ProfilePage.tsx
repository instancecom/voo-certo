import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PROFESSIONS = [
  { value: 'piloto_privado', label: 'Piloto Privado (PP)' },
  { value: 'piloto_comercial', label: 'Piloto Comercial (PC)' },
  { value: 'comissario', label: 'Comissário de Voo (CMS)' },
  { value: 'mecanico', label: 'Mecânico de Manutenção Aeronáutica (MMA)' },
  { value: 'agente', label: 'Agente de Aeroporto' },
  { value: 'outro', label: 'Outra área da aviação' },
];

const PLAN_BADGES: Record<string, { label: string; style: string }> = {
  free: { label: 'Plano Gratuito', style: 'bg-muted text-muted-foreground border-border' },
  solo: { label: 'Plano Solo', style: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
  tripulante: { label: 'Plano Tripulante', style: 'bg-accent/10 text-accent border-accent/30 font-semibold' },
  comandante: { label: 'Plano Comandante', style: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-semibold' },
};

const PROFILE_STORAGE_KEY = 'voecerto_profile_data_v2';

interface CareerData {
  profession: string;
  canac: string;
  targetExamDate: string;
}

const getStoredCareerData = (): CareerData => {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { profession: '', canac: '', targetExamDate: '' };
};

export default function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { currentPlan, planLabel } = usePlan();

  // Form states
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [career, setCareer] = useState<CareerData>(getStoredCareerData);
  const [isSaving, setIsSaving] = useState(false);

  // Password reset state
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile?.full_name]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // 1. Atualiza nome no banco
      const trimmedName = fullName.trim();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: trimmedName,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // 2. Salva informações aeronáuticas localmente
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(career));

      await refreshProfile();
      toast.success('Perfil atualizado com sucesso.');
    } catch (err) {
      toast.error('Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success('Link de recuperação enviado para o seu e-mail.');
    } catch {
      toast.error('Erro ao enviar link de redefinição.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const getInitials = () => {
    const name = profile?.full_name || user?.email || '';
    const parts = name.trim().split(/[\s@]+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), "MMMM 'de' yyyy", { locale: ptBR })
    : null;

  const planExpiryFormatted = profile?.plan_expires_at
    ? format(new Date(profile.plan_expires_at), "dd/MM/yyyy", { locale: ptBR })
    : null;

  const planBadge = PLAN_BADGES[currentPlan] || PLAN_BADGES.free;

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20 px-4">
          <p className="text-muted-foreground text-sm">Acesse sua conta para visualizar seu perfil.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 sm:pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

          {/* Top User Header — Clean Executive Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-[5px] bg-primary text-primary-foreground font-semibold text-xl flex items-center justify-center shadow-sm shrink-0">
                {getInitials()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </h1>
                  <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-[4px] border font-medium ${planBadge.style}`}>
                    {planBadge.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">{user.email}</p>
                {memberSince && (
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Membro da tripulação desde {memberSince}
                  </p>
                )}
              </div>
            </div>

            {currentPlan !== 'comandante' && (
              <Button asChild size="sm" className="rounded-[5px] font-semibold hover-yellow self-start sm:self-center shrink-0">
                <Link to="/premium" className="flex items-center gap-1.5">
                  Fazer upgrade <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Navigation Tabs — Minimalist and Direct */}
          <Tabs defaultValue="perfil" className="space-y-6">
            <TabsList className="bg-transparent p-0 h-auto border-b border-border rounded-none w-full justify-start gap-8">
              <TabsTrigger
                value="perfil"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent rounded-none px-1 pb-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground shadow-none"
              >
                Dados & Carreira
              </TabsTrigger>
              <TabsTrigger
                value="plano"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent rounded-none px-1 pb-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground shadow-none"
              >
                Plano & Assinatura
              </TabsTrigger>
              <TabsTrigger
                value="seguranca"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent rounded-none px-1 pb-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground shadow-none"
              >
                Segurança & Acesso
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Dados Pessoais & Carreira */}
            <TabsContent value="perfil" className="space-y-6 pt-2 outline-none">
              <Card className="rounded-[5px] border-border bg-card shadow-none">
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div>
                      <h2 className="text-base font-bold text-foreground">Identificação</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Informações associadas aos seus relatórios e certificados.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Nome Completo
                        </Label>
                        <Input
                          id="name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Seu nome completo"
                          style={{ fontSize: '16px' }}
                          className="rounded-[5px] h-10 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          E-mail da Conta
                        </Label>
                        <Input
                          id="email"
                          value={user.email || ''}
                          disabled
                          style={{ fontSize: '16px' }}
                          className="rounded-[5px] h-10 text-sm bg-muted/40 text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/60">
                      <h2 className="text-base font-bold text-foreground">Perfil Aeronáutico</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Ajuda o Mike a calibrar o diagnóstico de simulados e as recomendações de estudo.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="space-y-1.5 sm:col-span-1">
                        <Label htmlFor="profession" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Foco de Habilitação
                        </Label>
                        <select
                          id="profession"
                          value={career.profession}
                          onChange={(e) => setCareer((prev) => ({ ...prev, profession: e.target.value }))}
                          style={{ fontSize: '16px' }}
                          className="w-full h-10 rounded-[5px] border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                          <option value="">Selecione sua habilitação</option>
                          {PROFESSIONS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5 sm:col-span-1">
                        <Label htmlFor="canac" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Código ANAC (CANAC)
                        </Label>
                        <Input
                          id="canac"
                          value={career.canac}
                          onChange={(e) => setCareer((prev) => ({ ...prev, canac: e.target.value }))}
                          placeholder="Ex: 123456 (opcional)"
                          style={{ fontSize: '16px' }}
                          className="rounded-[5px] h-10 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-1">
                        <Label htmlFor="targetDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Previsão da Banca ANAC
                        </Label>
                        <Input
                          id="targetDate"
                          type="date"
                          value={career.targetExamDate}
                          onChange={(e) => setCareer((prev) => ({ ...prev, targetExamDate: e.target.value }))}
                          style={{ fontSize: '16px' }}
                          className="rounded-[5px] h-10 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border/60">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-[5px] font-semibold hover-yellow px-6"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Salvando...
                          </>
                        ) : (
                          'Salvar alterações'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: Plano & Assinatura */}
            <TabsContent value="plano" className="space-y-6 pt-2 outline-none">
              <Card className="rounded-[5px] border-border bg-card shadow-none">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plano Atual</p>
                      <h2 className="text-xl font-bold text-foreground mt-0.5">{planLabel}</h2>
                      {planExpiryFormatted && currentPlan !== 'free' ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          Vigência ativa até {planExpiryFormatted}.
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          Acesso básico aos simulados teóricos da plataforma.
                        </p>
                      )}
                    </div>

                    <Button asChild className="rounded-[5px] font-semibold hover-yellow">
                      <Link to="/premium">
                        {currentPlan === 'comandante' ? 'Gerenciar Plano' : 'Mudar de Plano'}
                      </Link>
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-4">Recursos Ativos na sua Assinatura</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {[
                        { title: 'Simulados Padrão ANAC', active: true, desc: 'Modos Livre e Bloco' },
                        { title: 'Modo Banca com Cronômetro', active: true, desc: currentPlan === 'free' ? '1 simulado diário' : 'Ilimitado' },
                        { title: 'Explicações com Mike (IA)', active: currentPlan !== 'free', desc: currentPlan === 'comandante' ? 'Até 15 mensagens por questão' : currentPlan === 'tripulante' ? 'Até 5 mensagens por questão' : currentPlan === 'solo' ? 'Até 2 mensagens por questão' : 'Disponível nos planos pagos' },
                        { title: 'Diagnóstico de Desempenho', active: currentPlan === 'tripulante' || currentPlan === 'comandante', desc: 'Análise detalhada por matéria' },
                        { title: 'Criador de Currículo Aeronáutico', active: currentPlan !== 'free', desc: 'Padrão das companhias aéreas' },
                        { title: 'Selo Oficial de Aprovação ANAC', active: currentPlan !== 'free', desc: 'Credencial digital para o LinkedIn' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3.5 rounded-[5px] border border-border/60 bg-muted/20">
                          <CheckCircle2
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              item.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/40'
                            }`}
                          />
                          <div>
                            <p className={`text-xs font-semibold ${item.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {item.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: Segurança & Acesso */}
            <TabsContent value="seguranca" className="space-y-6 pt-2 outline-none">
              <Card className="rounded-[5px] border-border bg-card shadow-none">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-foreground">Credenciais de Acesso</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Gerencie sua autenticação e segurança da conta.
                    </p>
                  </div>

                  <div className="p-4 rounded-[5px] border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Senha de Acesso</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Um link seguro será enviado para <span className="text-foreground font-medium">{user.email}</span>.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handlePasswordReset}
                      disabled={isSendingReset || resetSent}
                      className="rounded-[5px] text-xs font-semibold shrink-0"
                    >
                      {isSendingReset ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          Enviando...
                        </>
                      ) : resetSent ? (
                        'E-mail enviado'
                      ) : (
                        'Redefinir senha'
                      )}
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Encerrar Sessão</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Desconectar sua conta deste dispositivo com segurança.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={signOut}
                      className="rounded-[5px] text-xs font-semibold text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
                    >
                      Sair da conta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </main>

      <Footer />
    </div>
  );
}
