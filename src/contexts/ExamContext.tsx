import React, { createContext, useContext, useState, useCallback } from 'react';
import { Question, Exam, ExamResult } from '@/types/exam';
import { questions as mockQuestions, exams as mockExams, mockExamResults } from '@/data/mockData';

interface ExamState {
  currentExam: Exam | null;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
}

interface ExamContextType {
  // Data
  questions: Question[];
  exams: Exam[];
  examResults: ExamResult[];
  
  // Exam State
  examState: ExamState;
  
  // Actions
  startExam: (examId: string) => void;
  submitAnswer: (questionId: string, answer: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  finishExam: () => ExamResult | null;
  updateTimeRemaining: (time: number) => void;
  pauseExam: () => void;
  resumeExam: () => void;
  resetExam: () => void;
  
  // Admin Actions
  addQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => void;
  updateQuestion: (id: string, question: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  addExam: (exam: Omit<Exam, 'id'>) => void;
  
  // Helpers
  getExamQuestions: (examId: string) => Question[];
  getQuestionsByCategory: (category: string, subcategory?: string) => Question[];
  getExamsByCategory: (category: string) => Exam[];
  getUserResults: (userId: string) => ExamResult[];
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const initialExamState: ExamState = {
  currentExam: null,
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 0,
  isActive: false,
  isPaused: false,
};

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [exams, setExams] = useState<Exam[]>(mockExams);
  const [examResults, setExamResults] = useState<ExamResult[]>(mockExamResults);
  const [examState, setExamState] = useState<ExamState>(initialExamState);

  const startExam = useCallback((examId: string) => {
    const exam = exams.find((e) => e.id === examId);
    if (!exam) return;

    setExamState({
      currentExam: exam,
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: exam.duration * 60,
      isActive: true,
      isPaused: false,
    });
  }, [exams]);

  const submitAnswer = useCallback((questionId: string, answer: number) => {
    setExamState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setExamState((prev) => {
      if (!prev.currentExam) return prev;
      const maxIndex = prev.currentExam.questions.length - 1;
      return {
        ...prev,
        currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, maxIndex),
      };
    });
  }, []);

  const prevQuestion = useCallback(() => {
    setExamState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0),
    }));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setExamState((prev) => ({
      ...prev,
      currentQuestionIndex: index,
    }));
  }, []);

  const finishExam = useCallback((): ExamResult | null => {
    if (!examState.currentExam) return null;

    const examQuestions = examState.currentExam.questions
      .map((qId) => questions.find((q) => q.id === qId))
      .filter((q): q is Question => q !== undefined);

    let correctCount = 0;
    const answerDetails = examQuestions.map((question) => {
      const selectedAnswer = examState.answers[question.id] ?? -1;
      const isCorrect = selectedAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: question.id,
        selectedAnswer,
        isCorrect,
      };
    });

    const result: ExamResult = {
      id: `result-${Date.now()}`,
      examId: examState.currentExam.id,
      userId: 'user-1',
      score: Math.round((correctCount / examQuestions.length) * 100),
      totalQuestions: examQuestions.length,
      correctAnswers: correctCount,
      timeSpent: examState.currentExam.duration * 60 - examState.timeRemaining,
      answers: answerDetails,
      completedAt: new Date(),
    };

    setExamResults((prev) => [result, ...prev]);
    setExamState(initialExamState);

    return result;
  }, [examState, questions]);

  const updateTimeRemaining = useCallback((time: number) => {
    setExamState((prev) => ({ ...prev, timeRemaining: time }));
  }, []);

  const pauseExam = useCallback(() => {
    setExamState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeExam = useCallback(() => {
    setExamState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const resetExam = useCallback(() => {
    setExamState(initialExamState);
  }, []);

  const addQuestion = useCallback((question: Omit<Question, 'id' | 'createdAt'>) => {
    const newQuestion: Question = {
      ...question,
      id: `q-${Date.now()}`,
      createdAt: new Date(),
    };
    setQuestions((prev) => [...prev, newQuestion]);
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const addExam = useCallback((exam: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...exam,
      id: `exam-${Date.now()}`,
    };
    setExams((prev) => [...prev, newExam]);
  }, []);

  const getExamQuestions = useCallback(
    (examId: string) => {
      const exam = exams.find((e) => e.id === examId);
      if (!exam) return [];
      return exam.questions
        .map((qId) => questions.find((q) => q.id === qId))
        .filter((q): q is Question => q !== undefined);
    },
    [exams, questions]
  );

  const getQuestionsByCategory = useCallback(
    (category: string, subcategory?: string) => {
      return questions.filter(
        (q) =>
          q.category === category &&
          (!subcategory || q.subcategory === subcategory)
      );
    },
    [questions]
  );

  const getExamsByCategory = useCallback(
    (category: string) => {
      return exams.filter((e) => e.category === category);
    },
    [exams]
  );

  const getUserResults = useCallback(
    (userId: string) => {
      return examResults.filter((r) => r.userId === userId);
    },
    [examResults]
  );

  return (
    <ExamContext.Provider
      value={{
        questions,
        exams,
        examResults,
        examState,
        startExam,
        submitAnswer,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        finishExam,
        updateTimeRemaining,
        pauseExam,
        resumeExam,
        resetExam,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addExam,
        getExamQuestions,
        getQuestionsByCategory,
        getExamsByCategory,
        getUserResults,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
}
