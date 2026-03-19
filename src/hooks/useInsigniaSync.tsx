import { useUserResults, useExams } from './useExams';
import { useCheckAndGrantBadges } from './useInsignias';
import { toast } from 'sonner';
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/AuthContext';

export function useInsigniaSync() {
  const { user, isAdmin } = useAuth();
  const { data: results, isLoading: resultsLoading } = useUserResults();
  const { data: allExams } = useExams();
  const { checkBadges, isGranting } = useCheckAndGrantBadges();

  const syncBadges = async () => {
    if (!user || !results || results.length === 0) return [];

    // 1. Basic Stats
    const totalExams = results.length;
    const totalCorrect = results.reduce((acc, r) => acc + r.correct_answers, 0);
    const totalQuestions = results.reduce((acc, r) => acc + r.total_questions, 0);
    
    // 2. Training Days & Streak
    const uniqueDays = Array.from(new Set(results.map(r => new Date(r.completed_at).toISOString().split('T')[0]))).sort();
    const trainingDays = uniqueDays.length;
    
    let currentStreak = 0;
    if (uniqueDays.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const lastDay = uniqueDays[uniqueDays.length - 1];
      
      // Only count streak if they practiced today or yesterday
      const dayDiff = Math.floor((new Date(today).getTime() - new Date(lastDay).getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff <= 1) {
        currentStreak = 1;
        for (let i = uniqueDays.length - 2; i >= 0; i--) {
          const d1 = new Date(uniqueDays[i+1]);
          const d2 = new Date(uniqueDays[i]);
          const diff = Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // 3. Category Specific Stats
    // Map of exam_id to its subcategory (to filter results)
    const examMap = new Map(allExams?.map(e => [e.id, e]) || []);
    
    const englishCorrect = results.reduce((acc, r) => {
      const exam = examMap.get(r.exam_id);
      // We assume subcategory slugs for English
      if (exam?.title?.toLowerCase().includes('inglês') || exam?.description?.toLowerCase().includes('inglês')) {
        return acc + r.correct_answers;
      }
      return acc;
    }, 0);

    const securityCorrect = results.reduce((acc, r) => {
      const exam = examMap.get(r.exam_id);
      // We assume "Segurança" or "Conhecimentos Técnicos"
      if (exam?.title?.toLowerCase().includes('segurança') || exam?.title?.toLowerCase().includes('técnico')) {
        return acc + r.correct_answers;
      }
      return acc;
    }, 0);

    // 4. Consecutive Performance
    const sortedResults = [...results].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    let consecutiveScore70 = 0;
    for (const r of sortedResults) {
      if (r.score >= 70) consecutiveScore70++;
      else break;
    }

    const avgScore = totalExams ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / totalExams) : 0;

    const stats = {
      examsCompleted: totalExams,
      correctAnswers: totalCorrect,
      questionsAnswered: totalQuestions,
      trainingStreak: currentStreak,
      trainingDays: trainingDays,
      blocksCompleted: results.reduce((acc, r) => acc + (r.block_results?.length || 0), 0),
      anacApprovals: results.filter(r => r.score >= 70 && r.exam_mode === 'banca_anac').length,
      avgScore: avgScore,
      firstLogin: true,
      firstExam: totalExams >= 1,
      english_correct: englishCorrect,
      security_correct: securityCorrect,
      consecutive_score: consecutiveScore70,
    };

    const newBadges = await checkBadges(stats);
    
    if (newBadges.length > 0) {
      // Trigger Confetti!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#1A233A', '#FFFFFF']
      });

      newBadges.forEach(badge => {
        toast.success(`Conquista Desbloqueada: ${badge.name}!`, {
          description: badge.description,
          icon: <Trophy className="w-5 h-5 text-accent" />,
          duration: 6000,
        });
      });
    }

    return newBadges;
  };

  return { syncBadges, isLoading: resultsLoading || isGranting };
}
