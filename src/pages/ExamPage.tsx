import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Flag, Volume2, VolumeX, Pause, Play, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useExamWithQuestions, useSubmitResult, DbQuestion } from '@/hooks/useExams';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ExamState {
  currentQuestionIndex: number;
  answers: Record<string, number>;
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
}

export default function ExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, error } = useExamWithQuestions(examId || '');
  const submitResult = useSubmitResult();

  const [examState, setExamState] = useState<ExamState>({
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: 0,
    isActive: false,
    isPaused: false,
  });
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Initialize exam when data loads
  useEffect(() => {
    if (data?.exam && !examState.isActive) {
      setExamState({
        currentQuestionIndex: 0,
        answers: {},
        timeRemaining: data.exam.duration * 60,
        isActive: true,
        isPaused: false,
      });
    }
  }, [data?.exam]);

  // Timer
  useEffect(() => {
    if (!examState.isActive || examState.isPaused) return;

    const interval = setInterval(() => {
      setExamState(prev => {
        const newTime = prev.timeRemaining - 1;
        
        if (newTime === 300) {
          setShowTimeWarning(true);
        }
        
        if (newTime <= 0) {
          handleFinishExam();
          return prev;
        }
        
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examState.isActive, examState.isPaused]);

  const handleFinishExam = useCallback(async () => {
    if (!data?.exam || !data?.questions) return;

    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    const questions = data.questions;
    let correctCount = 0;
    const answerDetails = questions.map((question) => {
      const selectedAnswer = examState.answers[question.id] ?? -1;
      const isCorrect = selectedAnswer === question.correct_answer;
      if (isCorrect) correctCount++;
      return {
        questionId: question.id,
        selectedAnswer,
        isCorrect,
      };
    });

    const resultData = {
      exam_id: data.exam.id,
      score: Math.round((correctCount / questions.length) * 100),
      total_questions: questions.length,
      correct_answers: correctCount,
      time_spent: data.exam.duration * 60 - examState.timeRemaining,
      answers: answerDetails,
    };

    try {
      const result = await submitResult.mutateAsync(resultData);
      navigate(`/resultado/${result.id}`);
    } catch (err) {
      toast.error('Erro ao salvar resultado');
      console.error(err);
    }
  }, [data, examState.answers, examState.timeRemaining, user, submitResult, navigate]);

  const submitAnswer = (questionId: string, answer: number) => {
    setExamState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
    }));
  };

  const nextQuestion = () => {
    if (!data?.questions) return;
    setExamState(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, data.questions.length - 1),
    }));
  };

  const prevQuestion = () => {
    setExamState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0),
    }));
  };

  const goToQuestion = (index: number) => {
    setExamState(prev => ({ ...prev, currentQuestionIndex: index }));
  };

  const pauseExam = () => {
    setExamState(prev => ({ ...prev, isPaused: true }));
  };

  const resumeExam = () => {
    setExamState(prev => ({ ...prev, isPaused: false }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando simulado...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.exam || !data?.questions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar simulado</p>
          <Button onClick={() => navigate('/simulados')}>Voltar</Button>
        </div>
      </div>
    );
  }

  const { exam, questions } = data;
  const currentQuestion = questions[examState.currentQuestionIndex];
  const selectedAnswer = examState.answers[currentQuestion?.id];
  const progress = ((examState.currentQuestionIndex + 1) / questions.length) * 100;
  const isTimeWarning = examState.timeRemaining <= 300;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-foreground truncate max-w-[200px] md:max-w-none">
                {exam.title}
              </h1>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isTimeWarning ? 'bg-destructive/10 text-destructive' : 'bg-muted'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold">
                {formatTime(examState.timeRemaining)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={examState.isPaused ? resumeExam : pauseExam}
              >
                {examState.isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowFinishDialog(true)}
              >
                <Flag className="w-4 h-4 mr-2" />
                Finalizar
              </Button>
            </div>
          </div>

          <div className="pb-2">
            <Progress value={progress} className="h-1" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Questão {examState.currentQuestionIndex + 1} de {questions.length}</span>
              <span>{Math.round(progress)}% completo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          {examState.isPaused ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Pause className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Simulado Pausado</h2>
              <p className="text-muted-foreground mb-6">
                O cronômetro está parado. Clique em continuar quando estiver pronto.
              </p>
              <Button variant="default" size="lg" onClick={resumeExam}>
                <Play className="w-4 h-4 mr-2" />
                Continuar
              </Button>
            </motion.div>
          ) : currentQuestion ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentQuestion.audio_url && (
                  <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ouça o áudio para responder:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                      >
                        {isAudioPlaying ? (
                          <>
                            <VolumeX className="w-4 h-4 mr-2" />
                            Parar
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 mr-2" />
                            Ouvir
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="mt-3 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <div className="flex gap-1">
                        {[...Array(20)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-primary rounded-full"
                            animate={{
                              height: isAudioPlaying ? [8, 24, 8] : 8,
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: isAudioPlaying ? Infinity : 0,
                              delay: i * 0.05,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentQuestion.image_url && (
                  <div className="mb-6">
                    <img
                      src={currentQuestion.image_url}
                      alt="Imagem da questão"
                      className="rounded-xl max-h-64 object-contain mx-auto"
                    />
                  </div>
                )}

                <div className="mb-8">
                  <span className="text-sm text-accent font-medium mb-2 block">
                    Questão {examState.currentQuestionIndex + 1}
                  </span>
                  <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const optionLetter = String.fromCharCode(65 + index);

                    return (
                      <motion.button
                        key={index}
                        onClick={() => submitAnswer(currentQuestion.id, index)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-accent bg-accent/10'
                            : 'border-border bg-card hover:border-accent/50 hover:bg-accent/5'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-start gap-4">
                          <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold ${
                            isSelected
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {optionLetter}
                          </span>
                          <span className={`${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {option}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Questão não encontrada.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={examState.currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            <div className="hidden md:flex gap-1 overflow-x-auto max-w-md">
              {questions.map((q, index) => {
                const isAnswered = examState.answers[q.id] !== undefined;
                const isCurrent = index === examState.currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : isAnswered
                        ? 'bg-success/20 text-success'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {examState.currentQuestionIndex === questions.length - 1 ? (
              <Button variant="hero" onClick={() => setShowFinishDialog(true)}>
                Finalizar
                <Flag className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button variant="default" onClick={nextQuestion}>
                Próxima
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* Finish Confirmation Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Simulado?</DialogTitle>
            <DialogDescription>
              {Object.keys(examState.answers).length < questions.length ? (
                <>
                  Você ainda tem{' '}
                  <span className="font-semibold text-destructive">
                    {questions.length - Object.keys(examState.answers).length}
                  </span>{' '}
                  questões não respondidas. Deseja finalizar mesmo assim?
                </>
              ) : (
                'Todas as questões foram respondidas. Deseja finalizar o simulado?'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
              Continuar Respondendo
            </Button>
            <Button variant="destructive" onClick={handleFinishExam} disabled={submitResult.isPending}>
              {submitResult.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Finalizar Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auth Required Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Faça login para salvar seu resultado</DialogTitle>
            <DialogDescription>
              Para salvar seu progresso e ver seu histórico de simulados, você precisa estar logado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => navigate('/auth')}>
              Fazer Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Warning Dialog */}
      <Dialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Atenção: 5 minutos restantes!
            </DialogTitle>
            <DialogDescription>
              O tempo está acabando. Revise suas respostas ou finalize o simulado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="default" onClick={() => setShowTimeWarning(false)}>
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
