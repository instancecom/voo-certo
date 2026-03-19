import { useMemo } from 'react';
import { useUserResults } from './useExams';
import { useCheckAndGrantBadges } from './useInsignias';
import { toast } from 'sonner';
import { Trophy } from 'lucide-react';

export function useInsigniaSync() {
  const { data: results, isLoading: resultsLoading } = useUserResults();
  const { checkBadges, isGranting } = useCheckAndGrantBadges();

  const syncBadges = async () => {
    if (!results || results.length === 0) return [];

    // Calculate Stats for Badge Conditions
    const sorted = [...results].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    
    // Streak logic (days with at least one exam)
    const uniqueDays = new Set(results.map(r => new Date(r.completed_at).toISOString().split('T')[0]));
    const trainingDays = uniqueDays.size;
    
    // Average score
    const totalScore = results.reduce((acc, r) => acc + r.score, 0);
    const avgScore = Math.round(totalScore / results.length);

    const stats = {
      examsCompleted: results.length,
      correctAnswers: results.reduce((acc, r) => acc + r.correct_answers, 0),
      questionsAnswered: results.reduce((acc, r) => acc + r.total_questions, 0),
      trainingDays: trainingDays,
      blocksCompleted: results.reduce((acc, r) => acc + (r.block_results?.length || 0), 0),
      anacApprovals: results.filter(r => r.score >= 70 && r.exam_mode === 'banca_anac').length,
      avgScore: avgScore,
      firstLogin: true,
      firstExam: results.length >= 1,
    };

    const newBadges = await checkBadges(stats);
    
    if (newBadges.length > 0) {
      newBadges.forEach(badge => {
        toast.success(`Conquista Desbloqueada: ${badge.name}!`, {
          description: badge.description,
          icon: <Trophy className="w-5 h-5 text-accent" />,
          duration: 5000,
        });
      });
    }

    return newBadges;
  };

  return { syncBadges, isLoading: resultsLoading || isGranting };
}
