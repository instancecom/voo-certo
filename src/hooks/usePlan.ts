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

  const canAccessSimulados = hasAccess('solo');
  const canAccessMicrocursos = hasAccess('tripulante');
  const canAccessAIChat = hasAccess('tripulante');
  const canAccessProgress = hasAccess('tripulante');
  const canSaveCurriculum = hasAccess('tripulante');
  const canAccessGuideContent = hasAccess('tripulante');
  const canAccessConquistas = hasAccess('solo');
  const canAccessUnlimitedAI = hasAccess('comandante');

  // AI chat limit per question
  const aiChatLimit = (() => {
    if (currentPlan === 'comandante') return 15;
    if (currentPlan === 'tripulante') return 5;
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
    canAccessMicrocursos,
    canAccessAIChat,
    canAccessProgress,
    canSaveCurriculum,
    canAccessGuideContent,
    canAccessConquistas,
    canAccessUnlimitedAI,
    aiChatLimit,
  };
}

export { PLAN_LABELS, PLAN_HIERARCHY };
