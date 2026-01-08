import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExamModeSelector, ExamMode } from '@/components/exam/ExamModeSelector';
import { BancaANACExam } from '@/components/exam/BancaANACExam';
import { LivreExam } from '@/components/exam/LivreExam';
import { ExamResults } from '@/components/exam/ExamResults';
import { DbQuestion } from '@/hooks/useExams';
import { Loader2 } from 'lucide-react';

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
  const [phase, setPhase] = useState<ExamPhase>('select_mode');
  const [selectedMode, setSelectedMode] = useState<ExamMode | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<number | undefined>();
  const [examResult, setExamResult] = useState<ExamResultData | null>(null);

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

  const handleSelectMode = (mode: ExamMode, block?: number) => {
    setSelectedMode(mode);
    setSelectedBlock(block);
    setPhase('in_progress');
  };

  const handleFinish = (result: ExamResultData) => {
    setExamResult(result);
    setPhase('results');
  };

  const handleRetry = () => {
    setPhase('select_mode');
    setSelectedMode(null);
    setSelectedBlock(undefined);
    setExamResult(null);
  };

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
