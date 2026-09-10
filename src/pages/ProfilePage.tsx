import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Plane, Crown, Zap, Shield, Calendar,
  CheckCircle2, Award, FileText, TrendingUp, ArrowRight,
  Loader2, Edit2, Save, X, Key, LogOut, ChevronRight,
  Target, BookOpen, Flame,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan, PLAN_LABELS } from '@/hooks/usePlan';
import { useUserInsignias } from '@/hooks/useInsignias';
import { useUserResults } from '@/hooks/useExams';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PROFESSIONS = [
  { value: 'piloto', label: 'Piloto Privado / Comercial' },
  { value: 'comissario', label: 'Comissário de Voo' },
  { value: 'mecanico', label: 'Mecânico de Manutenção' },
  { value: 'agente', label: 'Agente de Aeroporto' },
  { value: 'outro', label: 'Outro' },
];

const PLAN_ICONS: Record<string, React.ComponentType<any>> = {
  free: Shield,
  solo: Plane,
  tripulante: Zap,
  comandante: Crown,
};

const PLAN_COLORS: Record<string, string> = {
  free: 'text-muted-foreground border-border bg-muted/30',
  solo: 'text-sky-500 border-sky-500/30 bg-sky-500/5',
  tripulante: 'text-accent border-accent/30 bg-accent/5',
  comandante: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
};

const RARITY_LABELS: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
  platinum: 'Platina',
};

const RARITY_COLORS: Record<string, string> = {
  bronze: 'text-amber-700 bg-amber-700/10 border-amber-700/20',
  silver: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  gold: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  platinum: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

const PROFILE_PREFS_KEY = 'voecerto_profile_prefs_v1';

interface ProfilePrefs {
  profession: string;
  targetExamDate: string;
}

const getProfilePrefs = (): ProfilePrefs => {
  try {
    const raw = localStorage.getItem(PROFILE_PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { profession: '', targetExamDate: '' };
};

const saveProfilePrefs = (prefs: ProfilePrefs) => {
  try {
    localStorage.setItem(PROFILE_PREFS_KEY, JSON.stringify(prefs));
  } catch {}
};

export default function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { currentPlan, planLabel } = usePlan();
  const { data: userInsignias, isLoading: insigniasLoading } = useUserInsignias();
  const { data: examResults, isLoading: resultsLoading } = useUserResults();
  const { toast } = useToast();

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.full_name || '');
  const [isSavingName, setIsSavingName] = useState(false);

  const [isEditingPrefs, setIsEditingPrefs] = useState(false);
  const [prefs, setPrefs] = useState<ProfilePrefs>(getProfilePrefs);
  const [prefsInput, setPrefsInput] = useState<ProfilePrefs>(getProfilePrefs);

  // Password reset
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setNameInput(profile.full_name);
  }, [profile?.full_name]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = (() => {
    if (!examResults || examResults.length === 0) return null;
    const total = examResults.length;
    const avg = Math.round(examResults.reduce((a, r) => a + (Number(r.score) || 0), 0) / total);
    const totalQ = examResults.reduce((a, r) => a + (Number(r.total_questions) || 0), 0);
    return { total, avg, totalQ };
  })();

  // ── Streak ────────────────────────────────────────────────────────────────────
  const streak = (() => {
    if (!examResults || examResults.length === 0) return 0;
    const dates = [...new Set(
      examResults
        .map(r => new Date(r.completed_at).toDateString())
        .filter(Boolean)
    )].map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    if (!dates.length) return 0;
    const diff = Math.floor((Date.now() - dates[0].getTime()) / 86400000);
    if (diff > 1) return 0;
    let s = 1;
    for (let i = 1; i < dates.length; i++) {
      const dayDiff = Math.floor((dates[i - 1].getTime() - dates[i].getTime()) / 86400000);
      if (dayDiff === 1) s++;
      else break;
    }
    return s;
  })();

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSaveName = async () => {
    if (!user || !nameInput.trim()) return;
    setIsSavingName(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: nameInput.trim(), updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      setIsEditingName(false);
      toast({ title: 'Nome atualizado!', description: 'Seu perfil foi salvo com sucesso.' });
    } catch {
      toast({ title: 'Erro ao salvar', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSavePrefs = () => {
    saveProfilePrefs(prefsInput);
    setPrefs(prefsInput);
    setIsEditingPrefs(false);
    toast({ title: 'Preferências salvas!', description: 'Seu perfil foi atualizado.' });
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
      toast({ title: 'E-mail enviado!', description: 'Verifique sua caixa de entrada para redefinir sua senha.' });
    } catch {
      toast({ title: 'Erro ao enviar e-mail', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsSendingReset(false);
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────────
  const getInitials = () => {
    const name = profile?.full_name || user?.email || '';
    const parts = name.split(/[\s@]/);
    if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const PlanIcon = PLAN_ICONS[currentPlan] || Shield;
  const recentBadges = (userInsignias || []).slice(0, 4);
  const selectedProfessionLabel = PROFESSIONS.find(p => p.value === prefs.profession)?.label;
  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), "MMMM 'de' yyyy", { locale: ptBR })
    : null;
  const planExpiry = profile?.plan_expires_at
    ? format(new Date(profile.plan_expires_at), "dd/MM/yyyy", { locale: ptBR })
    : null;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 sm:pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Page header */}
          <div className="border-b border-border pb-6 mb-8">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <User className="w-6 h-6 text-accent" />
              Meu Perfil
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie seus dados, preferências e conta.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Left column ── */}
            <div className="lg:col-span-1 space-y-5">

              {/* Avatar + name card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card className="rounded-[5px] shadow-none border">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-black text-white mb-4 shadow-md">
                      {getInitials()}
                    </div>

                    {/* Name */}
                    {isEditingName ? (
                      <div className="w-full space-y-2">
                        <Input
                          value={nameInput}
                          onChange={e => setNameInput(e.target.value)}
                          placeholder="Seu nome completo"
                          className="text-center rounded-[5px] text-sm"
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditingName(false); }}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveName} disabled={isSavingName} className="flex-1 rounded-[5px] h-8 text-xs hover-yellow">
                            {isSavingName ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3 mr-1" />Salvar</>}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setIsEditingName(false); setNameInput(profile?.full_name || ''); }} className="rounded-[5px] h-8 text-xs px-2">
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="flex items-center justify-center gap-1.5 mb-0.5">
                          <h2 className="text-base font-bold text-foreground truncate max-w-[160px]">
                            {profile?.full_name || user.email?.split('@')[0]}
                          </h2>
                          <button onClick={() => setIsEditingName(true)} className="text-muted-foreground hover:text-accent transition-colors p-0.5">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    )}

                    {/* Plan badge */}
                    <div className={`mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border text-xs font-bold ${PLAN_COLORS[currentPlan]}`}>
                      <PlanIcon className="w-3.5 h-3.5" />
                      Plano {planLabel}
                    </div>

                    {memberSince && (
                      <p className="text-[11px] text-muted-foreground mt-3">
                        Membro desde {memberSince}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick stats */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
                <Card className="rounded-[5px] shadow-none border">
                  <CardHeader className="pb-3 pt-4 px-4">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resumo</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    {resultsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <BookOpen className="w-4 h-4" />
                            <span>Simulados feitos</span>
                          </div>
                          <span className="font-bold text-foreground">{stats?.total ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="w-4 h-4" />
                            <span>Média geral</span>
                          </div>
                          <span className="font-bold text-foreground">{stats?.avg ?? 0}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span>Sequência atual</span>
                          </div>
                          <span className="font-bold text-foreground">{streak} {streak === 1 ? 'dia' : 'dias'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Award className="w-4 h-4 text-accent" />
                            <span>Conquistas</span>
                          </div>
                          <span className="font-bold text-foreground">{userInsignias?.length ?? 0}</span>
                        </div>
                      </>
                    )}
                    <Link to="/meu-progresso" className="flex items-center justify-between pt-2 border-t border-border text-xs text-accent font-semibold hover:underline">
                      Ver progresso completo
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Security */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
                <Card className="rounded-[5px] shadow-none border">
                  <CardHeader className="pb-3 pt-4 px-4">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Segurança</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-[5px] justify-start gap-2 text-sm font-medium h-9"
                      onClick={handlePasswordReset}
                      disabled={isSendingReset || resetSent}
                    >
                      {isSendingReset ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : resetSent ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Key className="w-3.5 h-3.5" />
                      )}
                      {resetSent ? 'E-mail enviado!' : 'Redefinir senha'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-[5px] justify-start gap-2 text-sm font-medium h-9 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5"
                      onClick={signOut}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sair da conta
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ── Right column ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Profession & target date */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.04 }}>
                <Card className="rounded-[5px] shadow-none border">
                  <CardHeader className="pb-3 pt-4 px-5 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold text-foreground">Informações de Carreira</CardTitle>
                    {!isEditingPrefs ? (
                      <button onClick={() => { setPrefsInput(prefs); setIsEditingPrefs(true); }} className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline">
                        <Edit2 className="w-3 h-3" /> Editar
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={handleSavePrefs} className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline">
                          <Save className="w-3 h-3" /> Salvar
                        </button>
                        <button onClick={() => setIsEditingPrefs(false)} className="text-xs text-muted-foreground flex items-center gap-1 hover:underline">
                          <X className="w-3 h-3" /> Cancelar
                        </button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-4">
                    {isEditingPrefs ? (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Área de atuação</Label>
                          <select
                            value={prefsInput.profession}
                            onChange={e => setPrefsInput(p => ({ ...p, profession: e.target.value }))}
                            className="w-full h-9 rounded-[5px] border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                          >
                            <option value="">Selecione sua área</option>
                            {PROFESSIONS.map(p => (
                              <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data alvo da prova ANAC</Label>
                          <Input
                            type="date"
                            value={prefsInput.targetExamDate}
                            onChange={e => setPrefsInput(p => ({ ...p, targetExamDate: e.target.value }))}
                            className="rounded-[5px] text-sm h-9"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-[5px] bg-accent/10 flex items-center justify-center shrink-0">
                            <Plane className="w-4 h-4 text-accent" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Área de atuação</p>
                            <p className="text-sm font-semibold text-foreground">
                              {selectedProfessionLabel || <span className="text-muted-foreground font-normal italic">Não definida</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-[5px] bg-accent/10 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-accent" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Data alvo da prova</p>
                            <p className="text-sm font-semibold text-foreground">
                              {prefs.targetExamDate
                                ? format(new Date(prefs.targetExamDate + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                : <span className="text-muted-foreground font-normal italic">Não definida</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isEditingPrefs && !prefs.profession && !prefs.targetExamDate && (
                      <p className="text-xs text-muted-foreground bg-muted/40 rounded-[5px] p-3 border border-border/60">
                        💡 Preencher sua área de atuação e data alvo ajuda o Mike a personalizar melhor o seu diagnóstico de desempenho.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Plan details */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
                <Card className="rounded-[5px] shadow-none border">
                  <CardHeader className="pb-3 pt-4 px-5">
                    <CardTitle className="text-sm font-bold text-foreground">Plano Atual</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className={`flex items-center justify-between p-4 rounded-[5px] border ${PLAN_COLORS[currentPlan]}`}>
                      <div className="flex items-center gap-3">
                        <PlanIcon className="w-5 h-5" />
                        <div>
                          <p className="text-sm font-bold">Plano {planLabel}</p>
                          {planExpiry && currentPlan !== 'free' && (
                            <p className="text-[11px] opacity-70">Renova em {planExpiry}</p>
                          )}
                          {currentPlan === 'free' && (
                            <p className="text-[11px] opacity-70">Acesso gratuito limitado</p>
                          )}
                        </div>
                      </div>
                      {currentPlan !== 'comandante' && (
                        <Button size="sm" asChild className="rounded-[5px] hover-yellow text-xs h-8 font-bold shrink-0">
                          <Link to="/premium">
                            Fazer upgrade <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>

                    {/* What's included quick list */}
                    <div className="mt-4 space-y-2">
                      {[
                        { ok: true, text: 'Simulados no padrão ANAC' },
                        { ok: currentPlan !== 'free', text: 'Chat IA com Mike por questão' },
                        { ok: currentPlan === 'tripulante' || currentPlan === 'comandante', text: 'Diagnóstico de Desempenho com Mike' },
                        { ok: currentPlan !== 'free', text: 'Gerador de Currículo com IA' },
                        { ok: currentPlan === 'comandante', text: 'IA Turbo (15 msgs/questão)' },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs ${item.ok ? 'text-foreground/80' : 'text-muted-foreground/50'}`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${item.ok ? 'text-success' : 'text-muted-foreground/30'}`} />
                          {item.text}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent achievements */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
                <Card className="rounded-[5px] shadow-none border">
                  <CardHeader className="pb-3 pt-4 px-5 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold text-foreground">Conquistas Recentes</CardTitle>
                    <Link to="/conquistas" className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline">
                      Ver todas <ChevronRight className="w-3 h-3" />
                    </Link>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    {insigniasLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : recentBadges.length === 0 ? (
                      <div className="text-center py-6">
                        <Award className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Nenhuma conquista ainda.</p>
                        <p className="text-xs text-muted-foreground mt-1">Complete simulados para desbloquear insígnias.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {recentBadges.map((ui, i) => (
                          <motion.div
                            key={ui.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex flex-col items-center gap-2 p-3 bg-muted/30 border border-border/60 rounded-[5px] text-center"
                          >
                            <div className="w-12 h-12 flex items-center justify-center">
                              {ui.insignia?.model_url ? (
                                <img
                                  src={ui.insignia.model_url}
                                  alt={ui.insignia.name}
                                  className="w-full h-full object-contain"
                                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className="text-2xl">{ui.insignia?.icon || '🏅'}</div>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-foreground leading-tight line-clamp-2">{ui.insignia?.name}</p>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-[3px] border ${RARITY_COLORS[ui.insignia?.rarity || 'bronze']}`}>
                              {RARITY_LABELS[ui.insignia?.rarity || 'bronze']}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick links */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}>
                <Card className="rounded-[5px] shadow-none border">
                  <CardHeader className="pb-3 pt-4 px-5">
                    <CardTitle className="text-sm font-bold text-foreground">Acesso Rápido</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 grid sm:grid-cols-3 gap-3">
                    {[
                      { to: '/simulados', icon: BookOpen, label: 'Simulados', color: 'text-sky-500 bg-sky-500/10' },
                      { to: '/meu-progresso', icon: TrendingUp, label: 'Progresso', color: 'text-accent bg-accent/10' },
                      { to: '/curriculo', icon: FileText, label: 'Currículo', color: 'text-emerald-500 bg-emerald-500/10' },
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="flex items-center gap-3 p-3 rounded-[5px] border border-border/60 hover:border-accent/30 bg-card hover:bg-accent/5 transition-all duration-200 group"
                        >
                          <div className={`w-8 h-8 rounded-[5px] flex items-center justify-center ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{item.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto group-hover:text-accent transition-colors" />
                        </Link>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
