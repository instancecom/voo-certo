import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BancaANACExam } from '@/components/exam/BancaANACExam';
import { LivreExam } from '@/components/exam/LivreExam';
import { BlockExam } from '@/components/exam/BlockExam';
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
  const modo = searchParams.get('modo') as ExamMode | 'bloco' | null;
  const blocoId = searchParams.get('bloco_id');
  const nomeBloco = searchParams.get('nome_bloco') || 'Bloco Específico';
  const { user, isLoading: authLoading } = useAuth();
  const { canAccessSimulados } = usePlan();
  const [phase, setPhase] = useState<ExamPhase>('in_progress');
  const [examResult, setExamResult] = useState<ExamResultData | null>(null);
  const submitResult = useSubmitResult();

  const { data: questions, isLoading } = useQuery({
    queryKey: ['profession-questions', professionId, modo, blocoId],
    queryFn: async () => {
      let query = supabase
        .from('questions')
        .select('*')
        .eq('category_id', professionId!)
        .order('block_number');

      if (modo === 'bloco' && blocoId) {
        query = query.eq('subcategory_id', blocoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(q => ({
        ...q,
        options: q.options as string[],
      })) as DbQuestion[];
    },
    enabled: !!professionId,
  });

  const { data: subcategory } = useQuery({
    queryKey: ['admin-subcategory', blocoId],
    queryFn: async () => {
      if (!blocoId) return null;
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('id', blocoId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!blocoId && modo === 'bloco',
  });

  const { data: exam } = useQuery({
    queryKey: ['profession-exam', professionId, modo, blocoId],
    queryFn: async () => {
      let query = supabase.from('exams').select('id, subcategory_id').eq('category_id', professionId!);
      
      if (modo === 'bloco' && blocoId) {
        query = query.eq('subcategory_id', blocoId);
      } else {
        query = query.is('subcategory_id', null);
      }
      
      const { data, error } = await query.limit(1).maybeSingle();
      if (data) return data;

      // Fallback: if exact match not found, get ANY exam for this profession
      const { data: fallbackData } = await supabase
        .from('exams')
        .select('id, subcategory_id')
        .eq('category_id', professionId!)
        .limit(1)
        .maybeSingle();
        
      if (fallbackData) return fallbackData;

      // If absolutely no exam exists for this profession, attempt to create a generic one
      // This solves the database missing initial seeds for new professions
      if (user) {
        try {
          const examData: any = {
            title: modo === 'bloco' ? `Simulado: ${nomeBloco} (Auto)` : `Simulado (Auto-gerado)`,
            category_id: professionId,
            duration: 120,
            question_count: 50,
            is_active: true,
          };

          // If in block mode, try to link the auto-generated exam to the subcategory
          if (modo === 'bloco' && blocoId) {
            examData.subcategory_id = blocoId;
          }

          const { data: newExam, error: insertError } = await supabase
            .from('exams')
            .insert(examData)
            .select('id, subcategory_id')
            .single();
            
          if (!insertError && newExam) {
            return newExam;
          }
        } catch (e) {
          console.error("Auto-create exam failed:", e);
        }
      }

      return null;
    },
    enabled: !!professionId && !!user,
  });

  const handleFinish = async (result: ExamResultData) => {
    setExamResult(result);
    setPhase('results');

    if (!user) return;
    
    if (!exam?.id) {
      console.error('Nenhum exame correspondente encontrado para a profissão:', professionId);
      toast.error('Erro ao salvar progresso: Configuração de prova (exam) não encontrada.');
      return;
    }

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
    } catch (error: any) {
      console.error('Error saving result:', error);
      toast.error(error.message || 'Erro ao salvar resultado');
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
    const defaultLimit = 20;
    const currentLimit = modo === 'bloco' ? (subcategory?.num_questions_expected || defaultLimit) : defaultLimit;

    if (modo === 'banca_anac') {
      return (
        <BancaANACExam
          questions={questions}
          onFinish={handleFinish}
          onExit={() => navigate('/simulados')}
        />
      );
    }

    if (modo === 'bloco') {
      return (
        <BlockExam
          questions={questions}
          blockName={nomeBloco}
          questionLimit={currentLimit}
          onFinish={handleFinish}
          onExit={() => navigate('/simulados')}
        />
      );
    }

    return (
      <LivreExam
        questions={questions}
        questionLimit={currentLimit}
        onFinish={handleFinish}
        onExit={() => navigate('/simulados')}
      />
    );
  }

  if (phase === 'results' && examResult) {
    return (
      <ExamResults
        mode={(modo as any) || 'livre'}
        blockName={modo === 'bloco' ? nomeBloco : undefined}
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
