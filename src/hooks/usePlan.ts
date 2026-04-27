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

  const canAccessSimulados = true; // Everyone sees the list
  const canAccessModoLivre = true; // Basic access for all
  const canAccessModoBloco = hasAccess('solo');
  const canAccessModoBanca = hasAccess('solo');
  const isBancaLimited = currentPlan === 'solo'; // Solo has limitations in Banca mode
  
  const canAccessMicrocursos = hasAccess('tripulante');
  const canAccessAIChat = hasAccess('solo');
  const canAccessProgress = hasAccess('tripulante');
  const canSaveCurriculum = true; // Now free for all
  const canAccessGuideContent = true; // Now free for all
  const canAccessConquistas = true; // Now free for all
  const canAccessUnlimitedAI = hasAccess('comandante');

  // AI chat limit PER QUESTION
  const aiChatLimitPerQuestion = (() => {
    if (currentPlan === 'comandante') return 15;
    if (currentPlan === 'tripulante') return 5;
    if (currentPlan === 'solo') return 2;
    return 0;
  })();

  // Security cap (total per day) to prevent scraping
  const aiChatDailySafetyLimit = (() => {
    if (currentPlan === 'comandante') return 100;
    if (currentPlan === 'tripulante') return 30;
    if (currentPlan === 'solo') return 8;
    return 0;
  })();

  return {
    currentPlan,
    planLevel,
    planLabel: PLAN_LABELS[currentPlan],
    isLoggedIn: !!user,
    isLoading,
    hasAccess,
    canAccessSimulados,
    canAccessModoLivre,
    canAccessModoBloco,
    canAccessModoBanca,
    isBancaLimited,
    canAccessMicrocursos,
    canAccessAIChat,
    canAccessProgress,
    canSaveCurriculum,
    canAccessGuideContent,
    canAccessConquistas,
    canAccessUnlimitedAI,
    aiChatLimitPerQuestion,
    aiChatDailySafetyLimit,
  };
}

export { PLAN_LABELS, PLAN_HIERARCHY };
