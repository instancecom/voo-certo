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
          // Duplicate - user already has this badge
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

export const useCheckAndGrantBadges = () => {
  const { user } = useAuth();
  const { data: insignias } = useInsignias();
  const { data: userInsignias } = useUserInsignias();
  const grantInsignia = useGrantInsignia();

  const checkBadges = async (stats: {
    examsCompleted?: number;
    correctAnswers?: number;
    questionsAnswered?: number;
    trainingStreak?: number;
    trainingDays?: number;
    blocksCompleted?: number;
    anacApprovals?: number;
    avgScore?: number;
    firstLogin?: boolean;
    firstExam?: boolean;
    english_correct?: number;
    security_correct?: number;
    consecutive_score?: number;
  }) => {
    if (!user?.id || !insignias || !userInsignias) return [];

    const earnedIds = new Set(userInsignias.map((ui) => ui.insignia_id));
    const newBadges: Insignia[] = [];

    for (const insignia of insignias) {
      if (earnedIds.has(insignia.id)) continue;

      let shouldGrant = false;

      switch (insignia.condition_type) {
        case "first_login":
          shouldGrant = stats.firstLogin === true;
          break;
        case "first_exam_completed":
          shouldGrant = stats.firstExam === true || (stats.examsCompleted || 0) >= 1;
          break;
        case "correct_answers":
          shouldGrant = (stats.correctAnswers || 0) >= insignia.condition_value;
          break;
        case "questions_answered":
          shouldGrant = (stats.questionsAnswered || 0) >= insignia.condition_value;
          break;
        case "training_streak":
          shouldGrant = (stats.trainingStreak || 0) >= insignia.condition_value;
          break;
        case "training_days":
          shouldGrant = (stats.trainingDays || 0) >= insignia.condition_value;
          break;
        case "blocks_completed":
          shouldGrant = (stats.blocksCompleted || 0) >= insignia.condition_value;
          break;
        case "anac_approvals":
          shouldGrant = (stats.anacApprovals || 0) >= insignia.condition_value;
          break;
        case "badges_earned":
          shouldGrant = (userInsignias.length + newBadges.length) >= insignia.condition_value;
          break;
        case "english_correct":
          shouldGrant = (stats.english_correct || 0) >= insignia.condition_value;
          break;
        case "security_score":
        case "security_correct":
          shouldGrant = (stats.security_correct || 0) >= insignia.condition_value;
          break;
        case "consecutive_score":
          shouldGrant = (stats.consecutive_score || 0) >= insignia.condition_value;
          break;
        case "avg_score_exams":
        case "avg_score_exams_10":
        case "avg_score_exams_20":
        case "avg_score_exams_30":
          shouldGrant = (stats.avgScore || 0) >= insignia.condition_value;
          break;
        case "free_exam_score":
          shouldGrant = (stats.avgScore || 0) >= insignia.condition_value; // Simplification
          break;
        // Add more condition types as needed
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
