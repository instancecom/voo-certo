import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Edit2, Loader2, ArrowRight, ExternalLink, Plus,
  Award, FileText, ChevronRight, CheckCircle2, Shield
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BadgePreviewModal } from '@/components/badges/BadgePreviewModal';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { getInsigniaFallback } from '@/hooks/useInsigniasFallback';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { useUserInsignias, type Insignia } from '@/hooks/useInsignias';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AVIATION_ROLES = [
  { value: 'piloto_privado', label: 'Piloto Privado (PP)' },
  { value: 'piloto_comercial', label: 'Piloto Comercial (PC)' },
  { value: 'comissario_voo', label: 'Comissário de Voo (CMS)' },
  { value: 'mecanico_manutencao', label: 'Mecânico de Manutenção (MMA)' },
  { value: 'agente_aeroporto', label: 'Agente de Aeroporto' },
  { value: 'controlador_voo', label: 'Controlador de Tráfego Aéreo' },
  { value: 'outro', label: 'Outra área na aviação' },
];

const getDriveImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.includes('lh3.googleusercontent.com')) return url;
  const ucMatch = url.match(/drive\.google\.com\/uc\?export=view&id=([^&]+)/);
  if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  return url;
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

  // ── Preferências e Edição ──
  const storageKey = user?.id ? `voecerto_user_prefs_${user.id}` : 'voecerto_user_prefs_guest';

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetExamDate, setTargetExamDate] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Modal de preview da insígnia
  const [selectedBadge, setSelectedBadge] = useState<Insignia | null>(null);
  const [selectedEarnedAt, setSelectedEarnedAt] = useState<string | undefined>(undefined);

  // Carrega preferências salvas
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
          title: c.profession || 'Currículo de Aviação',
          updatedAt: c.updated_at || c.created_at,
          summary: c.summary,
        });
      });

      localList.forEach(c => {
        const key = c.id || c.profession;
        if (!merged.has(key)) {
          merged.set(key, {
            id: c.id || key,
            title: c.profession || 'Currículo de Aviação',
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
      // 1. Atualiza no Supabase
      const trimmedName = fullName.trim();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: trimmedName,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // 2. Salva preferências
      const prefs: UserPreferences = {
        bio: bio.trim().slice(0, 200),
        targetRole,
        targetExamDate,
      };
      localStorage.setItem(storageKey, JSON.stringify(prefs));

      await refreshProfile();
      setIsEditModalOpen(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch {
      toast.error('Não foi possível salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Gerenciar / Cancelar Assinatura via Portal Stripe ──
  const handleManageOrCancelSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('URL não retornada');
    } catch {
      toast.error('Para gerenciar ou cancelar sua assinatura, entre em contato com nosso suporte.');
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

  const selectedRoleLabel = AVIATION_ROLES.find(r => r.value === targetRole)?.label;

  const examDateFormatted = targetExamDate
    ? format(new Date(targetExamDate + 'T12:00:00'), "MMMM 'de' yyyy", { locale: ptBR })
    : null;

  const planExpiryFormatted = profile?.plan_expires_at
    ? format(new Date(profile.plan_expires_at), "dd/MM/yyyy", { locale: ptBR })
    : null;

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20 px-4">
          <p className="text-muted-foreground text-sm">Faça login para acessar seu perfil.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-20 sm:pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">

          {/* ═════════════════════════════════════════════════════════
              CARD PRINCIPAL DO PERFIL (Responsivo Mobile & Web)
             ═════════════════════════════════════════════════════════ */}
          <div className="bg-card border border-border rounded-[5px] shadow-sm overflow-hidden mb-6 sm:mb-8">
            
            {/* Banner Superior Panorâmico */}
            <div className="h-28 sm:h-36 md:h-44 bg-gradient-to-r from-[#091326] via-[#0f172a] to-[#1e293b] relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_70%)]" />
            </div>

            {/* Conteúdo do Card */}
            <div className="px-5 sm:px-8 pb-6 sm:pb-8 relative">
              
              {/* Top Row: Avatar + Info + Botão Editar */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                
                <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
                  {/* Avatar Circular Mantido */}
                  <div className="-mt-14 sm:-mt-16 md:-mt-20 shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-card bg-primary text-white flex items-center justify-center text-3xl md:text-4xl font-black shadow-md">
                      {getInitials()}
                    </div>
                  </div>

                  {/* Informações de Identificação */}
                  <div className="min-w-0 pb-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight truncate">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </h1>
                    <p className="text-xs sm:text-sm font-semibold text-accent mt-0.5">
                      {selectedRoleLabel || 'Aeronauta em formação'}
                      {examDateFormatted && (
                        <span className="text-muted-foreground font-normal"> • Exame ANAC: {examDateFormatted}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Botão de Edição com rounded-[5px] */}
                <div className="flex justify-center md:justify-end pb-1 shrink-0">
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    className="rounded-[5px] px-6 sm:px-8 h-10 font-bold text-xs sm:text-sm bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm transition-all hover:scale-[1.02]"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-2" />
                    Editar Perfil
                  </Button>
                </div>

              </div>

              {/* Bio / Sobre Você */}
              <div className="mt-4 text-center md:text-left max-w-2xl">
                {bio ? (
                  <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-normal italic">
                    "{bio}"
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Nenhum resumo adicionado ainda. Clique em Editar Perfil para contar um pouco sobre sua trajetória na aviação.
                  </p>
                )}
              </div>

              {/* Linha com as 3 Métricas Rápidas */}
              <div className="mt-6 pt-5 border-t border-border grid grid-cols-3 divide-x divide-border text-center">
                <div className="px-2">
                  <span className="block text-lg sm:text-2xl font-black text-foreground">
                    {earnedInsignias.length}
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                    Conquistas
                  </span>
                </div>

                <div className="px-2">
                  <span className="block text-lg sm:text-2xl font-black text-foreground capitalize truncate">
                    {planLabel}
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                    Plano Ativo
                  </span>
                </div>

                <div className="px-2">
                  <span className="block text-lg sm:text-2xl font-black text-foreground">
                    {savedCurriculums.length}
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                    Currículos
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              SEÇÃO 1: INSÍGNIAS CONQUISTADAS (Largura Total)
             ═════════════════════════════════════════════════════════ */}
          <div className="bg-card border border-border rounded-[5px] shadow-sm p-5 sm:p-7 mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  Insígnias Conquistadas
                  <span className="text-xs font-normal text-muted-foreground">({earnedInsignias.length})</span>
                </h2>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Conquistas desbloqueadas durante o seu treinamento em simulados.
                </p>
              </div>
              <Link to="/conquistas" className="text-xs font-bold text-accent hover:underline flex items-center gap-0.5">
                Ver todas <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingInsignias ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : earnedInsignias.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-[5px]">
                <Award className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-foreground">Você ainda não conquistou insígnias</p>
                <p className="text-xs text-muted-foreground mt-0.5">Complete simulados para desbloquear suas medalhas de honra.</p>
                <Button asChild size="sm" variant="outline" className="mt-3 rounded-[5px] text-xs font-semibold h-8">
                  <Link to="/simulados">Iniciar Simulado</Link>
                </Button>
              </div>
            ) : (
              /* Mobile: Carrossel touch horizontal | Desktop: Grade fluida de até 8 itens */
              <div className="flex md:grid md:grid-cols-6 lg:grid-cols-8 gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-none snap-x touch-pan-x -mx-1 px-1">
                {earnedInsignias.map((ui) => {
                  const insignia = ui.insignia!;
                  const fallback = getInsigniaFallback(insignia.name);
                  const imageUrl = getDriveImageUrl(insignia.model_url) || fallback?.model_url || null;

                  return (
                    <div
                      key={ui.id}
                      onClick={() => {
                        setSelectedBadge(insignia);
                        setSelectedEarnedAt(ui.earned_at);
                      }}
                      className="shrink-0 w-20 md:w-auto flex flex-col items-center text-center cursor-pointer group snap-start"
                    >
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-2 bg-muted/40 border border-border group-hover:border-accent/50 transition-all flex items-center justify-center shadow-xs group-hover:scale-105">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={insignia.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <DynamicIcon
                          name={insignia.icon}
                          size={26}
                          className={imageUrl ? 'hidden text-accent' : 'text-accent'}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-foreground mt-1.5 line-clamp-1 w-full group-hover:text-accent transition-colors">
                        {insignia.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ═════════════════════════════════════════════════════════
              SEÇÃO 2 & 3: GRID RESPONSIVO (Currículos + Assinatura)
             ═════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">

            {/* Meus Currículos (Desktop: 7 colunas) com rounded-[5px] */}
            <div className="md:col-span-7 bg-card border border-border rounded-[5px] shadow-sm p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    Meus Currículos
                    <span className="text-xs font-normal text-muted-foreground">({savedCurriculums.length})</span>
                  </h2>
                  <Button asChild size="sm" variant="ghost" className="text-xs font-bold text-accent hover:text-accent p-0 h-auto">
                    <Link to="/curriculo" className="flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Criar Novo
                    </Link>
                  </Button>
                </div>

                {loadingCurriculums ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : savedCurriculums.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-[5px]">
                    <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-1.5" />
                    <p className="text-xs sm:text-sm font-semibold text-foreground">Nenhum currículo cadastrado</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Crie seu currículo com IA no padrão das companhias aéreas.</p>
                    <Button asChild size="sm" className="mt-3 rounded-[5px] text-xs font-bold h-8 hover-yellow">
                      <Link to="/curriculo">Criar Currículo</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {savedCurriculums.map((curr) => {
                      const dateFormatted = curr.updatedAt
                        ? format(new Date(curr.updatedAt), "dd/MM/yyyy", { locale: ptBR })
                        : 'Recente';

                      return (
                        <div
                          key={curr.id}
                          className="p-3 sm:p-3.5 rounded-[5px] border border-border bg-muted/20 hover:border-accent/30 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-foreground truncate">{curr.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Atualizado em {dateFormatted}</p>
                          </div>

                          <Button asChild size="sm" variant="outline" className="rounded-[5px] text-xs font-bold shrink-0 h-8 px-3">
                            <Link to="/curriculo" className="flex items-center gap-1">
                              Abrir <ExternalLink className="w-3 h-3 ml-0.5" />
                            </Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Plano de Assinatura (Desktop: 5 colunas) com rounded-[5px] */}
            <div className="md:col-span-5 bg-card border border-border rounded-[5px] shadow-sm p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground mb-3">
                  Plano de Assinatura
                </h2>

                <div className="p-4 rounded-[5px] border border-border bg-muted/20 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assinatura Atual</span>
                  <p className="text-lg font-black text-foreground mt-0.5">Plano {planLabel}</p>
                  {planExpiryFormatted && currentPlan !== 'free' ? (
                    <p className="text-xs text-muted-foreground mt-1">Próxima renovação: {planExpiryFormatted}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Acesso gratuito com simulados limitados</p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {currentPlan === 'comandante'
                    ? 'Você possui o plano mais avançado da plataforma, com IA Turbo e diagnósticos ilimitados.'
                    : 'Acesse simulações completas, explicações técnicas do Mike e gerador de currículos.'}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {currentPlan !== 'comandante' && (
                  <Button asChild size="sm" className="rounded-[5px] text-xs font-bold hover-yellow h-9 w-full">
                    <Link to="/premium" className="flex items-center justify-center gap-1.5">
                      Fazer Upgrade do Plano <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                )}

                {currentPlan !== 'free' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageOrCancelSubscription}
                    disabled={portalLoading}
                    className="rounded-[5px] text-xs font-semibold text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 h-9 w-full"
                  >
                    {portalLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Cancelar ou gerenciar assinatura'
                    )}
                  </Button>
                )}
              </div>
            </div>

          </div>

          {/* Footer com link de desconectar */}
          <div className="text-center pt-2">
            <button
              onClick={signOut}
              className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
            >
              Desconectar da conta
            </button>
          </div>

        </div>
      </main>

      {/* ═════════════════════════════════════════════════════════
          MODAL DE EDIÇÃO DE PERFIL com rounded-[5px]
         ═════════════════════════════════════════════════════════ */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[5px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Editar Perfil</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Atualize seu nome, resumo e objetivos na aviação.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            {/* Nome de Usuário */}
            <div className="space-y-1">
              <Label htmlFor="modalName" className="text-xs font-bold text-foreground">
                Nome de Usuário
              </Label>
              <Input
                id="modalName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                style={{ fontSize: '16px' }}
                className="rounded-[5px] h-10 text-sm"
              />
            </div>

            {/* Sobre Você (Bio até 200 caracteres) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="modalBio" className="text-xs font-bold text-foreground">
                  Sobre Você (Bio)
                </Label>
                <span className={`text-[10px] ${bio.length >= 200 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                  {bio.length}/200
                </span>
              </div>
              <Textarea
                id="modalBio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 200))}
                placeholder="Ex: Estudante dedicado de aviação civil com foco na prova de piloto comercial..."
                style={{ fontSize: '16px' }}
                className="rounded-[5px] min-h-[85px] text-sm resize-none"
              />
            </div>

            {/* O que quer se tornar */}
            <div className="space-y-1">
              <Label htmlFor="modalRole" className="text-xs font-bold text-foreground">
                O que você quer se tornar?
              </Label>
              <select
                id="modalRole"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{ fontSize: '16px' }}
                className="w-full h-10 rounded-[5px] border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Selecione sua meta</option>
                {AVIATION_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Data prevista para exame ANAC */}
            <div className="space-y-1">
              <Label htmlFor="modalExamDate" className="text-xs font-bold text-foreground">
                Data que pretende realizar o exame ANAC
              </Label>
              <Input
                id="modalExamDate"
                type="date"
                value={targetExamDate}
                onChange={(e) => setTargetExamDate(e.target.value)}
                style={{ fontSize: '16px' }}
                className="rounded-[5px] h-10 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-[5px] text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-[5px] text-xs font-bold px-5 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Preview 3D da Insígnia */}
      {selectedBadge && (
        <BadgePreviewModal
          open={!!selectedBadge}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedBadge(null);
              setSelectedEarnedAt(undefined);
            }
          }}
          insignia={selectedBadge}
          earnedAt={selectedEarnedAt}
        />
      )}

      <Footer />
    </div>
  );
}
