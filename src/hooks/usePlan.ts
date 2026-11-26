import { useAuth } from '@/contexts/AuthContext';

export type PlanLevel = 'free' | 'completo';

const PLAN_HIERARCHY: Record<PlanLevel, number> = {
  free: 0,
  completo: 1,
};

const PLAN_LABELS: Record<PlanLevel, string> = {
  free: 'Gratuito',
  completo: 'Completo',
};

export function usePlan() {
  const { user, profile, isAdmin, isLoading } = useAuth();

  const currentPlan: PlanLevel = (() => {
    if (isAdmin) return 'completo'; // Admins get full access
    if (!profile) return 'free';
    const plan = profile.plan_type as PlanLevel;
    if (plan !== 'completo') return 'free';
    // Check expiry
    if (profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()) return 'free';
    return 'completo';
  })();

  const planLevel = PLAN_HIERARCHY[currentPlan];

  const hasAccess = (requiredPlan: PlanLevel) => {
    return planLevel >= PLAN_HIERARCHY[requiredPlan];
  };

  // ── Simulados ────────────────────────────────────────────────────────────────
  const canAccessSimulados = true;                        // Todos veem a lista
  const canAccessModoLivre = true;                        // Free: Modo Livre SEM IA / Completo: COM IA
  const canAccessModoBloco = hasAccess('completo');       // Completo
  const canAccessModoBanca = true;                        // Todos, mas free tem limite diário
  const isBancaLimited = currentPlan === 'free';          // Free: 1 banca/dia; Completo: ilimitado

  // Limite diário de simulados no Modo Banca para o plano free
  const bancaDailyLimit = currentPlan === 'free' ? 1 : Infinity;

  // ── Chat IA (Mike) ────────────────────────────────────────────────────────────
  // Free NÃO tem acesso ao chat IA — apenas Modo Livre sem IA
  const canAccessAIChat = hasAccess('completo');          // Completo
  const canAccessModoLivreAI = hasAccess('completo');     // IA no Modo Livre apenas para Completo

  // AI chat limit PER QUESTION
  const aiChatLimitPerQuestion = currentPlan === 'completo' ? 10 : 0;

  // Security cap (total per day)
  const aiChatDailySafetyLimit = currentPlan === 'completo' ? 80 : 0;

  const canAccessUnlimitedAI = hasAccess('completo');

  // ── Progresso & Diagnóstico ──────────────────────────────────────────────────
  // Free: acesso parcial (média geral + total questões apenas)
  // Completo: progresso completo e diagnóstico com Mike
  const canAccessProgress = true;                         // Todos veem, mas conteúdo varia
  const canAccessFullProgress = hasAccess('completo');    // Completo: progresso completo
  const canAccessDiagnostic = hasAccess('completo');      // Diagnóstico com Mike: Completo

  // ── Conquistas ───────────────────────────────────────────────────────────────
  const canAccessConquistas = true;                       // Todos têm conquistas
  // Bronze: free | Platina: completo
  const maxAchievementTier = currentPlan === 'completo' ? 'platina' : 'bronze';
  // Selo "Aprovado ANAC" (conquista especial): liberado no plano Completo
  const canAccessSealAnac = hasAccess('completo');

  // ── Guia de Carreiras ────────────────────────────────────────────────────────
  const canAccessGuideContent = true;                     // Todos veem o guia (checklist)

  // ── Currículo com IA ─────────────────────────────────────────────────────────
  const canAccessCurriculum = hasAccess('completo');      // Currículo com IA: Completo
  const canSaveCurriculum = hasAccess('completo');        // Salvar na galeria: Completo
  // Limite de currículos salvos na galeria
  const curriculumSaveLimit = currentPlan === 'completo' ? Infinity : 0;

  // ── Microcursos (futuro) ─────────────────────────────────────────────────────
  const canAccessMicrocursos = false; // Desativado — reservado para futuro da plataforma

  return {
    currentPlan,
    planLevel,
    planLabel: PLAN_LABELS[currentPlan],
    isLoggedIn: !!user,
    isLoading,
    hasAccess,
    // Simulados
    canAccessSimulados,
    canAccessModoLivre,
    canAccessModoBloco,
    canAccessModoBanca,
    isBancaLimited,
    bancaDailyLimit,
    // IA
    canAccessAIChat,
    canAccessModoLivreAI,
    aiChatLimitPerQuestion,
    aiChatDailySafetyLimit,
    canAccessUnlimitedAI,
    // Progresso
    canAccessProgress,
    canAccessFullProgress,
    canAccessDiagnostic,
    // Conquistas
    canAccessConquistas,
    maxAchievementTier,
    canAccessSealAnac,
    // Guia
    canAccessGuideContent,
    // Currículo
    canAccessCurriculum,
    canSaveCurriculum,
    curriculumSaveLimit,
    // Microcursos
    canAccessMicrocursos,
  };
}

export { PLAN_LABELS, PLAN_HIERARCHY };
