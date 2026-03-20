import { useState, useEffect, useCallback, useMemo } from 'react';
import { DbQuestion } from '@/hooks/useExams';
import { prepareExamQuestions, ShuffledQuestion } from '@/lib/examShuffle';

export type ExamMode = 'block' | 'livre' | 'banca';

export interface ExamSessionConfig {
  mode: ExamMode;
  duration?: number; // in seconds
  questionsPerBlock?: number;
  selectedBlock?: number;
  onFinish?: (results: any) => void;
}

export interface ExamAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export function useExamSession(questions: DbQuestion[], config: ExamSessionConfig) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(config.duration || 0);
  const [startTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  
  // Prepare shuffled questions once
  const shuffledQuestions = useMemo(() => {
    return prepareExamQuestions(
      questions, 
      config.selectedBlock, 
      config.questionsPerBlock || 20
    );
  }, [questions, config.selectedBlock, config.questionsPerBlock]);

  // Timer logic
  useEffect(() => {
    if (isFinished || !config.duration || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-finish on timeout? (Implemented in the component level usually, but here for safety)
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, config.duration, timeLeft]);

  const selectAnswer = useCallback((questionId: string, answerIndex: number) => {
    if (isFinished) return;
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  }, [isFinished]);

  const goToNext = useCallback(() => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, shuffledQuestions.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const calculateResults = useCallback(() => {
    const totalQuestions = shuffledQuestions.length;
    const correctAnswers = shuffledQuestions.filter(q => 
      answers[q.id] === q.shuffledCorrectAnswer
    ).length;
    
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const timeSpent = config.duration ? config.duration - timeLeft : Math.floor((Date.now() - startTime) / 1000);

    const detailedAnswers = shuffledQuestions.map(q => ({
      questionId: q.id,
      selectedAnswer: answers[q.id],
      isCorrect: answers[q.id] === q.shuffledCorrectAnswer,
    }));

    // For Banca mode, we'd need block-specific results (Omitted here for simplicity in the general hook, can be extended)
    
    return {
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      answers: detailedAnswers,
      completedAt: new Date().toISOString(),
    };
  }, [shuffledQuestions, answers, timeLeft, startTime, config.duration]);

  const finishExam = useCallback(() => {
    setIsFinished(true);
    const results = calculateResults();
    if (config.onFinish) {
      config.onFinish(results);
    }
    return results;
  }, [calculateResults, config.onFinish]);

  const progress = shuffledQuestions.length > 0 
    ? ((currentIndex + 1) / shuffledQuestions.length) * 100 
    : 0;

  const currentQuestion = shuffledQuestions[currentIndex];

  return {
    currentIndex,
    currentQuestion,
    shuffledQuestions,
    answers,
    timeLeft,
    isFinished,
    progress,
    totalQuestions: shuffledQuestions.length,
    selectAnswer,
    goToNext,
    goToPrev,
    finishExam,
    calculateResults,
  };
}
