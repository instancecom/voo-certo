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
    
    // 1. Basic Stats
    const totalExams = safeResults.length;
    const totalCorrect = safeResults.reduce((acc, r) => acc + (r.correct_answers || 0), 0);
    const totalQuestions = safeResults.reduce((acc, r) => acc + (r.total_questions || 0), 0);
    
    // 2. Training Days & Streak
    const uniqueDays = Array.from(new Set(safeResults.map(r => new Date(r.completed_at).toISOString().split('T')[0]))).sort();
    const trainingDays = uniqueDays.length;
    
    let currentStreak = 0;
    if (uniqueDays.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const lastDay = uniqueDays[uniqueDays.length - 1];
      
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
    const examMap = new Map(allExams?.map(e => [e.id, e]) || []);
    
    let englishCorrect = 0;
    let englishMaxScore = 0;
    let spanishMaxScore = 0;
    let securityCorrect = 0;
    let securityMaxScore = 0;
    let behavioralMaxScore = 0;
    let stressMaxScore = 0;
    let emergencyPerfectBlocks = 0;
    
    safeResults.forEach(r => {
      const exam = examMap.get(r.exam_id);
      const title = exam?.title?.toLowerCase() || '';
      
      if (title.includes('inglês')) {
        englishCorrect += r.correct_answers || 0;
        englishMaxScore = Math.max(englishMaxScore, r.score || 0);
      }
      
      if (title.includes('espanhol')) {
        spanishMaxScore = Math.max(spanishMaxScore, r.score || 0);
      }
      
      if (title.includes('segurança') || title.includes('técnico')) {
        securityCorrect += r.correct_answers || 0;
        securityMaxScore = Math.max(securityMaxScore, r.score || 0);
      }

      if (title.includes('comportamental') || title.includes('psicotécnico')) {
        behavioralMaxScore = Math.max(behavioralMaxScore, r.score || 0);
      }
      if (title.includes('estresse') || title.includes('pressão')) {
        stressMaxScore = Math.max(stressMaxScore, r.score || 0);
      }

      if (r.block_results) {
        const blocks = r.block_results as any[];
        blocks.forEach(b => {
          if ((b.blockName?.toLowerCase().includes('emergência') || b.blockName?.toLowerCase().includes('segurança')) && b.percentage === 100) {
            emergencyPerfectBlocks++;
          }
        });
      }
    });

    // 4. Consecutive Performance
    const sortedResults = [...safeResults].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    let consecutiveScore70 = 0;
    for (const r of sortedResults) {
      if ((r.score || 0) >= 70) consecutiveScore70++;
      else break;
    }

    const avgScore = totalExams ? Math.round(safeResults.reduce((acc, r) => acc + (r.score || 0), 0) / totalExams) : 0;

    const stats = {
      examsCompleted: totalExams,
      correctAnswers: totalCorrect,
      questionsAnswered: totalQuestions,
      trainingStreak: currentStreak,
      trainingDays: trainingDays,
      blocksCompleted: safeResults.reduce((acc, r) => acc + (r.block_results?.length || 0), 0),
      anacApprovals: safeResults.filter(r => (r.score || 0) >= 70 && r.exam_mode === 'banca_anac').length,
      avgScore: avgScore,
      firstLogin: true,
      firstExam: totalExams >= 1,
      english_correct: englishCorrect,
      english_score: englishMaxScore,
      spanish_score: spanishMaxScore,
      security_correct: securityCorrect,
      security_score: securityMaxScore,
      security_streak: securityMaxScore >= 90 ? 1 : 0,
      security_perfect: securityMaxScore === 100 ? 100 : 0,
      behavioral_score: behavioralMaxScore,
      stress_score: stressMaxScore,
      emergency_block_perfect: emergencyPerfectBlocks,
      multilingual_score: (englishMaxScore + spanishMaxScore) / (englishMaxScore > 0 && spanishMaxScore > 0 ? 2 : 1),
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
