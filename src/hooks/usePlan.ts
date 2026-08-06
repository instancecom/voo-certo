import { useAuth } from '@/contexts/AuthContext';

export type PlanLevel = 'free' | 'solo' | 'tripulante' | 'comandante';

const PLAN_HIERARCHY: Record<PlanLevel, number> = {
  free: 0,
  solo: 1,
  tripulante: 2,
  comandante: 3,
};

const PLAN_LABELS: Record<PlanLevel, string> = {
  free: 'Gratuito',
  solo: 'Solo',
  tripulante: 'Tripulante',
  comandante: 'Comandante',
};

export function usePlan() {
  const { user, profile, isAdmin, isLoading } = useAuth();

  const currentPlan: PlanLevel = (() => {
    if (isAdmin) return 'comandante'; // Admins get full access
    if (!profile) return 'free';
    const plan = profile.plan_type as PlanLevel;
    if (!['solo', 'tripulante', 'comandante'].includes(plan)) return 'free';
    // Check expiry
    if (profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()) return 'free';
    return plan;
  })();

  const planLevel = PLAN_HIERARCHY[currentPlan];

  const hasAccess = (requiredPlan: PlanLevel) => {
    return planLevel >= PLAN_HIERARCHY[requiredPlan];
  };

  // ── Simulados ────────────────────────────────────────────────────────────────
  const canAccessSimulados = true;                        // Todos veem a lista
  const canAccessModoLivre = true;                        // Free: Modo Livre SEM IA / Pagos: COM IA
  const canAccessModoBloco = hasAccess('solo');           // Solo+
  const canAccessModoBanca = true;                        // Todos, mas free tem limite diário
  const isBancaLimited = currentPlan === 'free';         // Free: 1 banca/dia; pagos: ilimitado

  // Limite diário de simulados no Modo Banca para o plano free
  const bancaDailyLimit = currentPlan === 'free' ? 1 : Infinity;

  // ── Chat IA (Prof. Hugo) ─────────────────────────────────────────────────────
  // Free NÃO tem acesso ao chat IA — apenas Modo Livre sem IA
  const canAccessAIChat = hasAccess('solo');             // Solo+
  const canAccessModoLivreAI = hasAccess('solo');        // IA no Modo Livre apenas para Solo+

  // AI chat limit PER QUESTION
  const aiChatLimitPerQuestion = (() => {
    if (currentPlan === 'comandante') return 15;
    if (currentPlan === 'tripulante') return 5;
    if (currentPlan === 'solo') return 2;
    return 0; // free = sem acesso ao chat IA
  })();

  // Security cap (total per day)
  const aiChatDailySafetyLimit = (() => {
    if (currentPlan === 'comandante') return 100;
    if (currentPlan === 'tripulante') return 60;
    if (currentPlan === 'solo') return 30;
    return 0; // free = sem acesso
  })();

  const canAccessUnlimitedAI = hasAccess('comandante'); // IA Turbo apenas Comandante

  // ── Progresso & Diagnóstico ──────────────────────────────────────────────────
  // Free: acesso parcial (média geral + total questões apenas)
  // Solo+: progresso completo (curva, assertividade, pontos de atenção, melhores matérias, histórico)
  const canAccessProgress = true;                         // Todos veem, mas conteúdo varia
  const canAccessFullProgress = hasAccess('solo');       // Solo+: progresso completo
  const canAccessDiagnostic = hasAccess('tripulante');   // Diagnóstico com Sofia: Tripulante+

  // ── Conquistas ───────────────────────────────────────────────────────────────
  const canAccessConquistas = true;                       // Todos têm conquistas
  // Bronze: todos | Prata: Solo+ | Ouro: Tripulante+ | Platina: Comandante+
  const maxAchievementTier = (() => {
    if (currentPlan === 'comandante') return 'platina';
    if (currentPlan === 'tripulante') return 'ouro';
    if (currentPlan === 'solo') return 'prata';
    return 'bronze'; // free: apenas bronze
  })();
  // Selo "Aprovado ANAC" (conquista especial): liberado nos 3 planos pagos
  const canAccessSealAnac = hasAccess('solo');

  // ── Guia de Carreiras ────────────────────────────────────────────────────────
  const canAccessGuideContent = true;                     // Todos veem o guia (checklist)

  // ── Currículo com IA ─────────────────────────────────────────────────────────
  const canAccessCurriculum = hasAccess('solo');          // Currículo com IA: Solo+
  const canSaveCurriculum = hasAccess('solo');            // Salvar na galeria: Solo+
  // Limite de currículos salvos na galeria
  const curriculumSaveLimit = (() => {
    if (currentPlan === 'comandante') return Infinity;
    if (currentPlan === 'tripulante') return 3;
    if (currentPlan === 'solo') return 1;
    return 0; // free: sem acesso
  })();

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
