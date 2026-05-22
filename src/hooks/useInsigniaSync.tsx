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
    if (!user) return [];

    const safeResults = results || [];

    // Só contamos simulados realmente completados (com questões e tempo > 0)
    const completedResults = safeResults.filter(
      r => (r.total_questions || 0) > 0 && (r.time_spent || 0) > 0
    );

    // 1. Stats básicos — usando apenas simulados completados
    const totalExams = completedResults.length;
    const totalCorrect = completedResults.reduce((acc, r) => acc + (r.correct_answers || 0), 0);
    const totalQuestions = completedResults.reduce((acc, r) => acc + (r.total_questions || 0), 0);

    // 2. Dias de treino e streak — baseado nos simulados completados
    const uniqueDays = Array.from(
      new Set(completedResults.map(r => new Date(r.completed_at).toISOString().split('T')[0]))
    ).sort();
    const trainingDays = uniqueDays.length;

    let currentStreak = 0;
    if (uniqueDays.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const lastDay = uniqueDays[uniqueDays.length - 1];
      const dayDiff = Math.floor(
        (new Date(today).getTime() - new Date(lastDay).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff <= 1) {
        currentStreak = 1;
        for (let i = uniqueDays.length - 2; i >= 0; i--) {
          const d1 = new Date(uniqueDays[i + 1]);
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

    // 3. Stats por category/mode
    const examMap = new Map(allExams?.map(e => [e.id, e]) || []);

    let securityCorrect = 0;
    let securityMaxScore = 0;
    let emergencyPerfectBlocks = 0;
    let freeExamMaxScore = 0;

    completedResults.forEach(r => {
      const exam = examMap.get(r.exam_id);
      const title = exam?.title?.toLowerCase() || '';

      // Score máximo em modo livre
      if (r.exam_mode === 'livre') {
        freeExamMaxScore = Math.max(freeExamMaxScore, r.score || 0);
      }

      // Stats de segurança (questões/simulados com "segurança" ou "técnico" no título)
      if (title.includes('segurança') || title.includes('técnico') || title.includes('tecnicos')) {
        securityCorrect += r.correct_answers || 0;
        securityMaxScore = Math.max(securityMaxScore, r.score || 0);
      }

      // Blocos de emergência com 100%
      if (r.block_results) {
        const blocks = r.block_results as any[];
        blocks.forEach(b => {
          if (
            (b.blockName?.toLowerCase().includes('emergência') ||
              b.blockName?.toLowerCase().includes('segurança')) &&
            b.percentage === 100
          ) {
            emergencyPerfectBlocks++;
          }
        });
      }
    });

    // 4. Performance consecutiva (simulados com score >= 70, mais recentes primeiro)
    const sortedResults = [...completedResults].sort(
      (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );
    let consecutiveScore = 0;
    for (const r of sortedResults) {
      if ((r.score || 0) >= 70) consecutiveScore++;
      else break;
    }

    // 5. Média global
    const avgScore =
      totalExams > 0
        ? Math.round(completedResults.reduce((acc, r) => acc + (r.score || 0), 0) / totalExams)
        : 0;

    // 6. Médias condicionadas à quantidade mínima de simulados
    const avgScore10 =
      totalExams >= 10
        ? Math.round(
            completedResults
              .slice() // cópia
              .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
              .slice(0, 10)
              .reduce((acc, r) => acc + (r.score || 0), 0) / 10
          )
        : 0;

    const avgScore20 =
      totalExams >= 20
        ? Math.round(
            completedResults
              .slice()
              .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
              .slice(0, 20)
              .reduce((acc, r) => acc + (r.score || 0), 0) / 20
          )
        : 0;

    const avgScore30 =
      totalExams >= 30
        ? Math.round(
            completedResults
              .slice()
              .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
              .slice(0, 30)
              .reduce((acc, r) => acc + (r.score || 0), 0) / 30
          )
        : 0;

    // 7. Aprovações em banca ANAC
    const anacApprovals = completedResults.filter(
      r => (r.score || 0) >= 70 && r.exam_mode === 'banca_anac'
    ).length;

    // 8. Blocos completados (modo bloco)
    const blocksCompleted = completedResults.reduce(
      (acc, r) => acc + (r.block_results?.length || 0),
      0
    );

    const stats = {
      examsCompleted: totalExams,
      correctAnswers: totalCorrect,
      questionsAnswered: totalQuestions,
      trainingStreak: currentStreak,
      trainingDays: trainingDays,
      blocksCompleted: blocksCompleted,
      anacApprovals: anacApprovals,
      avgScore: avgScore,
      avgScore10: avgScore10,
      avgScore20: avgScore20,
      avgScore30: avgScore30,
      firstExam: totalExams >= 1,
      security_correct: securityCorrect,
      security_score: securityMaxScore,
      security_perfect: securityMaxScore === 100 ? 100 : 0,
      emergency_block_perfect: emergencyPerfectBlocks,
      consecutive_score: consecutiveScore,
      free_exam_max_score: freeExamMaxScore,
    };

    const newBadges = await checkBadges(stats);

    if (newBadges.length > 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#1A233A', '#FFFFFF'],
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
