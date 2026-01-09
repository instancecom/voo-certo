import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExamModeSelector, ExamMode } from '@/components/exam/ExamModeSelector';
import { BancaANACExam } from '@/components/exam/BancaANACExam';
import { LivreExam } from '@/components/exam/LivreExam';
import { ExamResults } from '@/components/exam/ExamResults';
import { DbQuestion, useSubmitResult } from '@/hooks/useExams';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

type ExamPhase = 'select_mode' | 'in_progress' | 'results';

interface ExamResultData {
  blockResults: {
    blockNumber: number;
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
    passed: boolean;
    timeSpent?: number;
  }[];
  totalCorrect: number;
  totalQuestions: number;
  overallPassed: boolean;
  answers: Record<string, number>;
  totalTimeSpent?: number;
}

export default function ANACExamPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [phase, setPhase] = useState<ExamPhase>('select_mode');
  const [selectedMode, setSelectedMode] = useState<ExamMode | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<number | undefined>();
  const [examResult, setExamResult] = useState<ExamResultData | null>(null);
  const submitResult = useSubmitResult();

  // Fetch all ANAC questions with block_number
  const { data: questions, isLoading } = useQuery({
    queryKey: ['anac-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .not('block_number', 'is', null)
        .order('block_number');
      
      if (error) throw error;
      return (data || []).map(q => ({
        ...q,
        options: q.options as string[],
      })) as DbQuestion[];
    },
  });

  // Fetch a placeholder exam_id for ANAC results (or create one)
  const { data: anacExam } = useQuery({
    queryKey: ['anac-exam'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('id')
        .eq('title', 'Simulado ANAC Oficial')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const handleSelectMode = (mode: ExamMode, block?: number) => {
    setSelectedMode(mode);
    setSelectedBlock(block);
    setPhase('in_progress');
  };

  const handleFinish = async (result: ExamResultData) => {
    setExamResult(result);
    setPhase('results');

    // Save result to database if user is logged in and we have an exam_id
    if (user && anacExam?.id) {
      try {
        const answersArray = Object.entries(result.answers).map(([questionId, selectedAnswer]) => {
          const question = questions?.find(q => q.id === questionId);
          return {
            questionId,
            selectedAnswer,
            isCorrect: question ? selectedAnswer === question.correct_answer : false,
          };
        });

        await submitResult.mutateAsync({
          exam_id: anacExam.id,
          score: Math.round((result.totalCorrect / result.totalQuestions) * 100),
          total_questions: result.totalQuestions,
          correct_answers: result.totalCorrect,
          time_spent: result.totalTimeSpent || 0,
          answers: answersArray,
          exam_mode: selectedMode === 'banca_anac' ? 'banca_anac' : 'livre',
          block_results: result.blockResults,
        });
        toast.success('Resultado salvo com sucesso!');
      } catch (error) {
        console.error('Error saving result:', error);
        toast.error('Erro ao salvar resultado');
      }
    }
  };

  const handleRetry = () => {
    setPhase('select_mode');
    setSelectedMode(null);
    setSelectedBlock(undefined);
    setExamResult(null);
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md text-center p-8 rounded-2xl bg-card border border-border">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">
            Faça login para acessar o simulado ANAC e salvar seu progresso.
          </p>
          <Button asChild>
            <Link to="/auth">Fazer Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando questões...</p>
        </div>
      </div>
    );
  }

  if (phase === 'select_mode') {
    return (
      <ExamModeSelector
        onSelectMode={handleSelectMode}
        onBack={() => navigate('/simulados')}
      />
    );
  }

  if (phase === 'in_progress' && questions) {
    if (selectedMode === 'banca_anac') {
      return (
        <BancaANACExam
          questions={questions}
          onFinish={handleFinish}
          onExit={() => navigate('/simulados')}
        />
      );
    }

    return (
      <LivreExam
        questions={questions}
        selectedBlock={selectedBlock}
        onFinish={handleFinish}
        onExit={() => navigate('/simulados')}
      />
    );
  }

  if (phase === 'results' && examResult) {
    return (
      <ExamResults
        mode={selectedMode!}
        blockResults={examResult.blockResults}
        totalCorrect={examResult.totalCorrect}
        totalQuestions={examResult.totalQuestions}
        overallPassed={examResult.overallPassed}
        totalTimeSpent={examResult.totalTimeSpent}
        onRetry={handleRetry}
        onHome={() => navigate('/')}
      />
    );
  }

  return null;
}
