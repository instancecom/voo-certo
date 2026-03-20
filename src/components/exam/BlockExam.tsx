import React, { useState } from 'react';
import { DbQuestion, useSubmitResult } from '@/hooks/useExams';
import { useExamSession } from '@/hooks/useExamSession';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle2, TrendingUp, Clock, Target, ArrowRight, ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { QuestionView } from './QuestionView';
import { NavigationControls } from './NavigationControls';

interface BlockExamProps {
  questions: DbQuestion[];
  examId: string;
  examTitle: string;
  onExit: () => void;
}

export function BlockExam({ questions, examId, examTitle, onExit }: BlockExamProps) {
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const submitResult = useSubmitResult();

  const session = useExamSession(questions, {
    mode: 'block',
    onFinish: async (examResults) => {
      setResults(examResults);
      setShowResults(true);
      
      try {
        await submitResult.mutateAsync({
          exam_id: examId,
          score: examResults.score,
          total_questions: examResults.totalQuestions,
          correct_answers: examResults.correctAnswers,
          time_spent: examResults.timeSpent,
          answers: examResults.answers,
          exam_mode: 'block'
        });
      } catch (error) {
        console.error('Error submitting results:', error);
        toast.error('Erro ao salvar resultado. Tente novamente.');
      }
    }
  });

  const {
    currentIndex,
    currentQuestion,
    shuffledQuestions,
    answers,
    isFinished,
    progress,
    totalQuestions,
    selectAnswer,
    goToNext,
    goToPrev,
    finishExam,
  } = session;

  if (shuffledQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Target className="w-8 h-8 text-muted-foreground opacity-20" />
        </div>
        <h3 className="text-xl font-bold mb-2">Nenhuma questão encontrada</h3>
        <p className="text-muted-foreground mb-6">Este bloco ainda não possui questões cadastradas.</p>
        <Button onClick={onExit} variant="outline" className="rounded-xl border-2 font-bold h-12 px-8">
          <LogOut className="w-4 h-4 mr-2" /> Voltar ao Painel
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 animate-fade-in relative px-4 sm:px-0">
      {/* Header section with progress monitor */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight line-clamp-1">{examTitle}</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-1 rounded-lg w-fit">
              <Target className="w-3 h-3" /> Modo Simulado Localizado
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onExit} 
            className="rounded-xl h-10 px-4 font-bold text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all border-2 border-transparent hover:border-red-100"
          >
            Sair
          </Button>
        </div>
        
        <div className="space-y-3 bg-muted/30 p-4 rounded-2xl border-2 border-white/50 backdrop-blur-sm shadow-inner">
          <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            <span>Progresso da Aula</span>
            <span className="text-primary">{Math.round(progress)}% Concluído</span>
          </div>
          <div className="relative h-2.5 w-full bg-white rounded-full overflow-hidden border border-white shadow-sm">
            <div 
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Question rendering */}
      <Card className="bg-card/40 backdrop-blur-xl border-4 border-white/40 shadow-2xl rounded-[2.5rem] overflow-hidden relative group transition-all duration-500 hover:shadow-primary/5">
        <CardContent className="p-6 md:p-12">
          {currentQuestion && (
            <QuestionView
              question={currentQuestion}
              selectedAnswer={answers[currentQuestion.id]}
              onSelectAnswer={(index) => selectAnswer(currentQuestion.id, index)}
              showFeedback={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Reusable Navigation */}
      <NavigationControls
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        onPrev={goToPrev}
        onNext={goToNext}
        onFinish={finishExam}
        isFinished={isFinished}
      />

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={(open) => !open && onExit()}>
        <DialogContent className="max-w-[440px] p-0 rounded-[2.5rem] overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-10 text-center relative overflow-hidden group">
            <div className="w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black text-white mb-2">Simulado Concluído!</DialogTitle>
          </div>
          
          <div className="p-10 space-y-8 bg-card">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 p-5 rounded-3xl text-center">
                <p className="text-[10px] font-extrabold text-muted-foreground uppercase mb-1">Nota</p>
                <p className="text-2xl font-black text-primary">{Math.round(results?.score || 0)}%</p>
              </div>
              <div className="bg-muted/30 p-5 rounded-3xl text-center">
                <p className="text-[10px] font-extrabold text-muted-foreground uppercase mb-1">Acertos</p>
                <p className="text-2xl font-black">{results?.correctAnswers} / {results?.totalQuestions}</p>
              </div>
            </div>

            <div className="bg-muted/30 p-5 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Tempo Total</p>
                  <p className="font-bold">
                    {Math.floor((results?.timeSpent || 0) / 60)}m {(results?.timeSpent || 0) % 60}s
                  </p>
                </div>
              </div>
              <Badge className={results?.score >= 70 ? 'bg-green-500' : 'bg-red-500'}>
                {results?.score >= 70 ? 'APROVADO' : 'REPROVADO'}
              </Badge>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={onExit} className="h-14 rounded-2xl bg-primary text-white font-black">
                Retornar ao Painel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Percent({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}
