import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Insignia {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  rarity: BadgeRarity;
  display_order: number;
  is_active: boolean;
  model_url: string | null;
  verso_texto: string | null;
  plano_minimo?: string;
  tag_positions?: Record<string, {
    x: number;
    y: number;
    enabled: boolean;
    fontSize?: number;
    color?: string;
  }> | null;
  created_at: string;
  updated_at: string;
}

export interface UserInsignia {
  id: string;
  user_id: string;
  insignia_id: string;
  earned_at: string;
  insignia?: Insignia;
}

export const useInsignias = () => {
  return useQuery({
    queryKey: ["insignias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insignias")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Insignia[];
    },
  });
};

export const useUserInsignias = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-insignias", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_insignias")
        .select(`
          *,
          insignia:insignias(*)
        `)
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data as (UserInsignia & { insignia: Insignia })[];
    },
    enabled: !!user?.id,
  });
};

export const useGrantInsignia = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (insigniaId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_insignias")
        .insert({
          user_id: user.id,
          insignia_id: insigniaId,
        })
        .select(`
          *,
          insignia:insignias(*)
        `)
        .single();

      if (error) {
        if (error.code === "23505") {
          // Duplicate — user already has this badge
          return null;
        }
        throw error;
      }
      return data as UserInsignia & { insignia: Insignia };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-insignias"] });
    },
  });
};

// Stats passados pelo useInsigniaSync
interface BadgeStats {
  examsCompleted?: number;
  correctAnswers?: number;
  questionsAnswered?: number;
  trainingStreak?: number;
  trainingDays?: number;
  blocksCompleted?: number;
  anacApprovals?: number;
  avgScore?: number;
  avgScore10?: number;    // média dos últimos 10 simulados (só válido se examsCompleted >= 10)
  avgScore20?: number;    // média dos últimos 20 simulados (só válido se examsCompleted >= 20)
  avgScore30?: number;    // média dos últimos 30 simulados (só válido se examsCompleted >= 30)
  firstExam?: boolean;
  security_correct?: number;
  security_score?: number;
  security_perfect?: number;
  emergency_block_perfect?: number;
  consecutive_score?: number;
  free_exam_max_score?: number;
}

export const useCheckAndGrantBadges = () => {
  const { user } = useAuth();
  const { data: insignias } = useInsignias();
  const { data: userInsignias } = useUserInsignias();
  const grantInsignia = useGrantInsignia();

  const checkBadges = async (stats: BadgeStats) => {
    if (!user?.id || !insignias || !userInsignias) return [];

    const earnedIds = new Set(userInsignias.map((ui) => ui.insignia_id));
    const newBadges: Insignia[] = [];

    for (const insignia of insignias) {
      // Pular já conquistadas ou inativas
      if (earnedIds.has(insignia.id)) continue;
      if (!insignia.is_active) continue;

      let shouldGrant = false;

      switch (insignia.condition_type) {
        // ─── Primeiro simulado completado ───────────────────────────────
        case "first_exam_completed":
          shouldGrant = (stats.examsCompleted || 0) >= 1;
          break;

        // ─── Acertos totais ─────────────────────────────────────────────
        case "correct_answers":
          shouldGrant = (stats.correctAnswers || 0) >= insignia.condition_value;
          break;

        // ─── Questões respondidas ────────────────────────────────────────
        case "questions_answered":
          shouldGrant = (stats.questionsAnswered || 0) >= insignia.condition_value;
          break;

        // ─── Dias seguidos (streak) ──────────────────────────────────────
        case "training_streak":
          shouldGrant = (stats.trainingStreak || 0) >= insignia.condition_value;
          break;

        // ─── Dias totais treinando ───────────────────────────────────────
        case "training_days":
          shouldGrant = (stats.trainingDays || 0) >= insignia.condition_value;
          break;

        // ─── Blocos completados ──────────────────────────────────────────
        case "blocks_completed":
        case "profession_complete":
          shouldGrant = (stats.blocksCompleted || 0) >= insignia.condition_value;
          break;

        // ─── Aprovações em Banca ANAC ────────────────────────────────────
        case "anac_approvals":
          shouldGrant = (stats.anacApprovals || 0) >= insignia.condition_value;
          break;

        // ─── Média geral (qualquer qtd de simulados) ─────────────────────
        case "all_modes_score":
        case "profession_mastery":
        case "profession_perfect":
          shouldGrant = (stats.avgScore || 0) >= insignia.condition_value;
          break;

        // ─── Média em 10 simulados (mín. 10 completados) ────────────────
        case "avg_score_exams":
        case "avg_score_exams_10":
          shouldGrant = (stats.avgScore10 || 0) >= insignia.condition_value;
          break;

        // ─── Média em 20 simulados (mín. 20 completados) ────────────────
        case "avg_score_exams_20":
          shouldGrant = (stats.avgScore20 || 0) >= insignia.condition_value;
          break;

        // ─── Média em 30 simulados (mín. 30 completados) ────────────────
        case "avg_score_exams_30":
          shouldGrant = (stats.avgScore30 || 0) >= insignia.condition_value;
          break;

        // ─── Score em simulado modo livre ────────────────────────────────
        case "free_exam_score":
          shouldGrant = (stats.free_exam_max_score || 0) >= insignia.condition_value;
          break;

        // ─── Questões de segurança acertadas ────────────────────────────
        case "security_correct":
          shouldGrant = (stats.security_correct || 0) >= insignia.condition_value;
          break;

        // ─── Score em simulados de segurança ─────────────────────────────
        case "security_score":
        case "security_block_score":
          shouldGrant = (stats.security_score || 0) >= insignia.condition_value;
          break;

        // ─── Nota 100% em segurança ──────────────────────────────────────
        case "security_perfect":
          shouldGrant = (stats.security_perfect || 0) >= insignia.condition_value;
          break;

        // ─── Bloco de emergência com 100% ────────────────────────────────
        case "emergency_block_perfect":
          shouldGrant = (stats.emergency_block_perfect || 0) >= insignia.condition_value;
          break;

        // ─── Simulados consecutivos com score >= 70% ─────────────────────
        case "consecutive_score":
          shouldGrant = (stats.consecutive_score || 0) >= insignia.condition_value;
          break;

        // ─── Quantidade de insígnias conquistadas ────────────────────────
        case "badges_earned":
          shouldGrant =
            (userInsignias.length + newBadges.length) >= insignia.condition_value;
          break;

        // ─── Tipos desativados / sem suporte ─────────────────────────────
        case "first_login":
        case "english_correct":
        case "english_score":
        case "spanish_score":
        case "security_streak":
        case "behavioral_score":
        case "behavioral_exams":
        case "stress_score":
        case "multilingual_score":
        case "multilingual_perfect":
        case "companies_completed":
          // Estas condições não têm simulados correspondentes na plataforma.
          // Tratadas via migration (is_active = false) ou gerenciadas separadamente.
          shouldGrant = false;
          break;

        default:
          // Tipo desconhecido — nunca conceder automaticamente
          shouldGrant = false;
          break;
      }

      if (shouldGrant) {
        try {
          const result = await grantInsignia.mutateAsync(insignia.id);
          if (result) {
            newBadges.push(insignia);
          }
        } catch (error) {
          console.error("Error granting badge:", error);
        }
      }
    }

    return newBadges;
  };

  return { checkBadges, isGranting: grantInsignia.isPending };
};
