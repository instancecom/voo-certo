import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BancaANACExam } from '@/components/exam/BancaANACExam';
import { LivreExam } from '@/components/exam/LivreExam';
import { ExamResults } from '@/components/exam/ExamResults';
import { DbQuestion, useSubmitResult } from '@/hooks/useExams';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { PlanGate } from '@/components/PlanGate';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ExamMode } from '@/components/exam/ExamModeSelector';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type ExamPhase = 'in_progress' | 'results';

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

export default function ProfessionExamPage() {
  const navigate = useNavigate();
  const { professionId } = useParams<{ professionId: string }>();
  const [searchParams] = useSearchParams();
  const modo = searchParams.get('modo') as ExamMode | null;
  const { user, isLoading: authLoading } = useAuth();
  const { canAccessSimulados } = usePlan();
  const [phase, setPhase] = useState<ExamPhase>('in_progress');
  const [examResult, setExamResult] = useState<ExamResultData | null>(null);
  const submitResult = useSubmitResult();

  const { data: questions, isLoading } = useQuery({
    queryKey: ['profession-questions', professionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category_id', professionId!)
        .order('block_number');

      if (error) throw error;
      return (data || []).map(q => ({
        ...q,
        options: q.options as string[],
      })) as DbQuestion[];
    },
    enabled: !!professionId,
  });

  const { data: exam } = useQuery({
    queryKey: ['profession-exam', professionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('id')
        .eq('category_id', professionId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!professionId,
  });

  const handleFinish = async (result: ExamResultData) => {
    setExamResult(result);
    setPhase('results');

    if (user && exam?.id) {
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
          exam_id: exam.id,
          score: Math.round((result.totalCorrect / result.totalQuestions) * 100),
          total_questions: result.totalQuestions,
          correct_answers: result.totalCorrect,
          time_spent: result.totalTimeSpent || 0,
          answers: answersArray,
          exam_mode: modo || 'livre',
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
    setPhase('in_progress');
    setExamResult(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md text-center p-8 rounded-2xl bg-card border border-border">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">
            Faça login para acessar o simulado e salvar seu progresso.
          </p>
          <Button asChild>
            <Link to="/auth">Fazer Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!canAccessSimulados) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-lg">
            <PlanGate requiredPlan="solo" feature="Simulados">
              <div />
            </PlanGate>
          </div>
        </main>
        <Footer />
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

  if (phase === 'in_progress' && questions) {
    if (modo === 'banca_anac') {
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
        onFinish={handleFinish}
        onExit={() => navigate('/simulados')}
      />
    );
  }

  if (phase === 'results' && examResult) {
    return (
      <ExamResults
        mode={modo || 'livre'}
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
