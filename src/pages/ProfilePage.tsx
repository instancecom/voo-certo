import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2, ArrowRight, ExternalLink, Plus,
  FileText, Award, AlertCircle
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeCard } from '@/components/badges/BadgeCard';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { useUserInsignias } from '@/hooks/useInsignias';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AVIATION_ROLES = [
  { value: 'piloto_privado', label: 'Piloto Privado (PP)' },
  { value: 'piloto_comercial', label: 'Piloto Comercial (PC)' },
  { value: 'comissario_voo', label: 'Comissário de Voo (CMS)' },
  { value: 'mecanico_manutencao', label: 'Mecânico de Manutenção Aeronáutica (MMA)' },
  { value: 'agente_aeroporto', label: 'Agente de Aeroporto' },
  { value: 'controlador_voo', label: 'Controlador de Tráfego Aéreo' },
  { value: 'outro', label: 'Outra área na aviação' },
];

const PLAN_BADGES: Record<string, { label: string; style: string }> = {
  free: { label: 'Plano Gratuito', style: 'bg-muted text-muted-foreground border-border' },
  solo: { label: 'Plano Solo', style: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
  tripulante: { label: 'Plano Tripulante', style: 'bg-accent/10 text-accent border-accent/30 font-semibold' },
  comandante: { label: 'Plano Comandante', style: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-semibold' },
};

interface UserPreferences {
  bio: string;
  targetRole: string;
  targetExamDate: string;
}

export default function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { currentPlan, planLabel } = usePlan();
  const navigate = useNavigate();

  // ── Preferências do Usuário ──
  const storageKey = user?.id ? `voecerto_user_prefs_${user.id}` : 'voecerto_user_prefs_guest';

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetExamDate, setTargetExamDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Carrega preferências locais salvas
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: UserPreferences = JSON.parse(stored);
        if (parsed.bio !== undefined) setBio(parsed.bio);
        if (parsed.targetRole !== undefined) setTargetRole(parsed.targetRole);
        if (parsed.targetExamDate !== undefined) setTargetExamDate(parsed.targetExamDate);
      }
    } catch {}
  }, [profile?.full_name, storageKey]);

  // ── Insígnias Conquistadas ──
  const { data: userInsignias = [], isLoading: loadingInsignias } = useUserInsignias();
  const earnedInsignias = userInsignias.filter(ui => ui.insignia);

  // ── Currículos Criados ──
  const { data: savedCurriculums = [], isLoading: loadingCurriculums } = useQuery({
    queryKey: ['curriculums-profile', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // 1. Supabase
      const { data: list } = await supabase
        .from('curriculum_data')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      // 2. Armazenamento local
      const localKey = `voo_certo_curriculums_${user.id}`;
      let localList: any[] = [];
      try {
        const stored = localStorage.getItem(localKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) localList = parsed;
        }
      } catch {}

      const merged = new Map<string, { id: string; title: string; updatedAt: string; summary?: string }>();

      (list || []).forEach(c => {
        merged.set(c.id, {
          id: c.id,
          title: c.profession || 'Currículo Profissional',
          updatedAt: c.updated_at || c.created_at,
          summary: c.summary,
        });
      });

      localList.forEach(c => {
        const key = c.id || c.profession;
        if (!merged.has(key)) {
          merged.set(key, {
            id: c.id || key,
            title: c.profession || 'Currículo Profissional',
            updatedAt: c.updated_at || new Date().toISOString(),
            summary: c.summary,
          });
        }
      });

      return Array.from(merged.values());
    },
    enabled: !!user?.id,
  });

  // ── Salvar Perfil ──
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // 1. Atualiza nome no Supabase
      const trimmedName = fullName.trim();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: trimmedName,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // 2. Salva preferências locais
      const prefs: UserPreferences = {
        bio: bio.trim().slice(0, 200),
        targetRole,
        targetExamDate,
      };
      localStorage.setItem(storageKey, JSON.stringify(prefs));

      await refreshProfile();
      toast.success('Perfil atualizado com sucesso.');
    } catch {
      toast.error('Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Gerenciar / Cancelar Assinatura via Customer Portal ──
  const handleManageOrCancelSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('URL não encontrada.');
    } catch (err: any) {
      toast.error('Para cancelar ou gerenciar sua assinatura, entre em contato com o suporte ou tente novamente mais tarde.');
    } finally {
      setPortalLoading(false);
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

          {/* ── Top Executive Header ── */}
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
                    Membro desde {memberSince}
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="rounded-[5px] text-xs font-semibold text-muted-foreground hover:text-foreground self-start sm:self-center shrink-0"
            >
              Sair da conta
            </Button>
          </div>

          {/* ── Navigation Tabs ── */}
          <Tabs defaultValue="dados" className="space-y-6">
            <TabsList className="bg-transparent p-0 h-auto border-b border-border rounded-none w-full justify-start gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
              <TabsTrigger
                value="dados"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent rounded-none px-1 pb-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground shadow-none shrink-0"
              >
                Dados Pessoais
              </TabsTrigger>
              <TabsTrigger
                value="plano"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent rounded-none px-1 pb-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground shadow-none shrink-0"
              >
                Plano & Assinatura
              </TabsTrigger>
              <TabsTrigger
                value="conquistas"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent rounded-none px-1 pb-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground shadow-none shrink-0"
              >
                Insígnias Conquistadas ({earnedInsignias.length})
              </TabsTrigger>
              <TabsTrigger
                value="curriculos"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent rounded-none px-1 pb-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground shadow-none shrink-0"
              >
                Meus Currículos ({savedCurriculums.length})
              </TabsTrigger>
            </TabsList>

            {/* ══════════════════════════════════════════════════════
                ABA 1: DADOS PESSOAIS & CARREIRA
               ══════════════════════════════════════════════════════ */}
            <TabsContent value="dados" className="space-y-6 pt-2 outline-none">
              <Card className="rounded-[5px] border-border bg-card shadow-none">
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSaveProfile} className="space-y-6">

                    <div>
                      <h2 className="text-base font-bold text-foreground">Identificação & Sobre Você</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Defina como você aparece na plataforma e seu resumo na aviação.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Nome de Usuário
                        </Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Seu nome ou apelido de voo"
                          style={{ fontSize: '16px' }}
                          className="rounded-[5px] h-10 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="accountEmail" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          E-mail de Cadastro
                        </Label>
                        <Input
                          id="accountEmail"
                          value={user.email || ''}
                          disabled
                          style={{ fontSize: '16px' }}
                          className="rounded-[5px] h-10 text-sm bg-muted/40 text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Sobre Você / Bio (Até 200 caracteres) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="bio" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Sobre Você
                        </Label>
                        <span className={`text-[11px] ${bio.length >= 200 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                          {bio.length}/200 caracteres
                        </span>
                      </div>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value.slice(0, 200))}
                        placeholder="Escreva um breve resumo sobre seus objetivos, horas de voo ou trajetória na aviação..."
                        style={{ fontSize: '16px' }}
                        className="rounded-[5px] min-h-[90px] text-sm resize-none"
                      />
                    </div>

                    <div className="pt-4 border-t border-border/60">
                      <h2 className="text-base font-bold text-foreground">Objetivo Aeronáutico</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Indique o que você quer se tornar e o prazo estimado para sua prova.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* O que quer se tornar */}
                      <div className="space-y-1.5">
                        <Label htmlFor="targetRole" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          O que você quer se tornar?
                        </Label>
                        <select
                          id="targetRole"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          style={{ fontSize: '16px' }}
                          className="w-full h-10 rounded-[5px] border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                          <option value="">Selecione sua meta profissional</option>
                          {AVIATION_ROLES.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Data prevista para realizar o exame ANAC */}
                      <div className="space-y-1.5">
                        <Label htmlFor="examDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Data prevista para o exame ANAC
                        </Label>
                        <Input
                          id="examDate"
                          type="date"
                          value={targetExamDate}
                          onChange={(e) => setTargetExamDate(e.target.value)}
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

            {/* ══════════════════════════════════════════════════════
                ABA 2: PLANO & ASSINATURA (UPGRADE / CANCELAMENTO)
               ══════════════════════════════════════════════════════ */}
            <TabsContent value="plano" className="space-y-6 pt-2 outline-none">
              <Card className="rounded-[5px] border-border bg-card shadow-none">
                <CardContent className="p-6 sm:p-8 space-y-6">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plano Atual</span>
                      <h2 className="text-2xl font-bold text-foreground mt-0.5">{planLabel}</h2>
                      {planExpiryFormatted && currentPlan !== 'free' ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          Assinatura ativa. Próxima renovação prevista para {planExpiryFormatted}.
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          Conta com acesso básico gratuito aos simulados teóricos.
                        </p>
                      )}
                    </div>

                    {/* Ações de Upgrade */}
                    <div className="flex flex-wrap items-center gap-3">
                      {currentPlan !== 'comandante' && (
                        <Button asChild className="rounded-[5px] font-semibold hover-yellow">
                          <Link to="/premium" className="flex items-center gap-1.5">
                            Fazer Upgrade <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Gerenciamento e Cancelamento */}
                  <div className="p-4 rounded-[5px] border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Gerenciamento de Assinatura</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {currentPlan === 'free'
                          ? 'Faça o upgrade para desbloquear mentoria com Mike, diagnósticos e currículos ilimitados.'
                          : 'Altere sua forma de pagamento, baixe notas fiscais ou cancele sua assinatura sem burocracia.'}
                      </p>
                    </div>

                    {currentPlan !== 'free' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleManageOrCancelSubscription}
                        disabled={portalLoading}
                        className="rounded-[5px] text-xs font-semibold text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
                      >
                        {portalLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            Carregando...
                          </>
                        ) : (
                          'Cancelar ou gerenciar assinatura'
                        )}
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="rounded-[5px] text-xs font-semibold shrink-0">
                        <Link to="/premium">Conhecer planos</Link>
                      </Button>
                    )}
                  </div>

                  {/* Recursos do Plano */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Recursos Disponíveis na sua Conta
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-[5px] border border-border/60 bg-background flex items-center justify-between">
                        <span className="font-medium text-foreground">Simulados teóricos ANAC</span>
                        <span className="text-accent font-semibold">Liberado</span>
                      </div>
                      <div className="p-3 rounded-[5px] border border-border/60 bg-background flex items-center justify-between">
                        <span className="font-medium text-foreground">Chat IA com Mike por questão</span>
                        <span className={currentPlan === 'free' ? 'text-muted-foreground' : 'text-accent font-semibold'}>
                          {currentPlan === 'comandante' ? '15 msgs' : currentPlan === 'tripulante' ? '5 msgs' : currentPlan === 'solo' ? '2 msgs' : 'Bloqueado'}
                        </span>
                      </div>
                      <div className="p-3 rounded-[5px] border border-border/60 bg-background flex items-center justify-between">
                        <span className="font-medium text-foreground">Diagnóstico de Desempenho</span>
                        <span className={currentPlan === 'tripulante' || currentPlan === 'comandante' ? 'text-accent font-semibold' : 'text-muted-foreground'}>
                          {currentPlan === 'tripulante' || currentPlan === 'comandante' ? 'Liberado' : 'A partir de Tripulante'}
                        </span>
                      </div>
                      <div className="p-3 rounded-[5px] border border-border/60 bg-background flex items-center justify-between">
                        <span className="font-medium text-foreground">Gerador de Currículo com IA</span>
                        <span className={currentPlan !== 'free' ? 'text-accent font-semibold' : 'text-muted-foreground'}>
                          {currentPlan === 'comandante' ? 'Galeria Ilimitada' : currentPlan === 'tripulante' ? 'Até 3 salvos' : currentPlan === 'solo' ? '1 salvo' : 'A partir de Solo'}
                        </span>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            {/* ══════════════════════════════════════════════════════
                ABA 3: INSÍGNIAS CONQUISTADAS
               ══════════════════════════════════════════════════════ */}
            <TabsContent value="conquistas" className="space-y-6 pt-2 outline-none">
              <Card className="rounded-[5px] border-border bg-card shadow-none">
                <CardContent className="p-6 sm:p-8">

                  <div className="flex items-center justify-between pb-6 mb-6 border-b border-border/60">
                    <div>
                      <h2 className="text-base font-bold text-foreground">Insígnias Desbloqueadas</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Conquistas oficiais ganhas através do seu progresso em simulados.
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-accent hover:text-accent">
                      <Link to="/conquistas" className="flex items-center gap-1">
                        Ver todas as insígnias <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>

                  {loadingInsignias ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : earnedInsignias.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-[5px]">
                      <Award className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground">Nenhuma insígnia conquistada ainda</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        Complete seus primeiros simulados para desbloquear suas medalhas de honra.
                      </p>
                      <Button asChild size="sm" className="mt-4 rounded-[5px] font-semibold hover-yellow">
                        <Link to="/simulados">Iniciar um Simulado</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      {earnedInsignias.map((ui) => (
                        <div key={ui.id} className="h-full">
                          <BadgeCard
                            insignia={ui.insignia!}
                            earned={true}
                            earnedAt={ui.earned_at}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                </CardContent>
              </Card>
            </TabsContent>

            {/* ══════════════════════════════════════════════════════
                ABA 4: MEUS CURRÍCULOS CRIADOS
               ══════════════════════════════════════════════════════ */}
            <TabsContent value="curriculos" className="space-y-6 pt-2 outline-none">
              <Card className="rounded-[5px] border-border bg-card shadow-none">
                <CardContent className="p-6 sm:p-8">

                  <div className="flex items-center justify-between pb-6 mb-6 border-b border-border/60">
                    <div>
                      <h2 className="text-base font-bold text-foreground">Currículos Profissionais</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Currículos estruturados no padrão das companhias aéreas com apoio do Mike.
                      </p>
                    </div>
                    <Button asChild size="sm" className="rounded-[5px] font-semibold hover-yellow text-xs">
                      <Link to="/curriculo" className="flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        Criar Novo Currículo
                      </Link>
                    </Button>
                  </div>

                  {loadingCurriculums ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : savedCurriculums.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-[5px]">
                      <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground">Nenhum currículo cadastrado ainda</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        Crie seu currículo com o Mike (IA) no padrão exigido pelo RH da aviação.
                      </p>
                      <Button asChild size="sm" className="mt-4 rounded-[5px] font-semibold hover-yellow">
                        <Link to="/curriculo">Criar meu currículo agora</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedCurriculums.map((curr) => {
                        const dateFormatted = curr.updatedAt
                          ? format(new Date(curr.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : 'Recentemente';

                        return (
                          <div
                            key={curr.id}
                            className="p-4 rounded-[5px] border border-border/60 bg-muted/10 hover:border-accent/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <p className="text-sm font-bold text-foreground">{curr.title}</p>
                              {curr.summary && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-lg">
                                  {curr.summary}
                                </p>
                              )}
                              <p className="text-[11px] text-muted-foreground/80 mt-1">
                                Atualizado em {dateFormatted}
                              </p>
                            </div>

                            <Button asChild size="sm" variant="outline" className="rounded-[5px] text-xs font-semibold shrink-0">
                              <Link to="/curriculo" className="flex items-center gap-1.5">
                                Acessar no Criador <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

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
