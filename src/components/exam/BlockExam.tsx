import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle,
  BookOpen, Loader2, Target, LogOut,
} from 'lucide-react';
import { QuestionAIChat } from './QuestionAIChat';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { DbQuestion } from '@/hooks/useExams';
import { ExamLoadingScreen } from './ExamLoadingScreen';
import { ShuffledQuestion, prepareExamQuestions } from '@/lib/examShuffle';

interface BlockResult {
  blockNumber: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  passed: boolean;
}

interface BlockExamProps {
  questions: DbQuestion[];
  blockName: string;
  questionLimit?: number;
  onFinish: (results: {
    blockResults: BlockResult[];
    totalCorrect: number;
    totalQuestions: number;
    overallPassed: boolean;
    answers: Record<string, number>;
    totalTimeSpent: number;
  }) => void;
  onExit: () => void;
}

export function BlockExam({ questions, blockName, questionLimit, onFinish, onExit }: BlockExamProps) {
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const timer = setTimeout(() => {
      setShuffledQuestions(prepareExamQuestions(questions, undefined, questionLimit));
    }, 800);
    return () => clearTimeout(timer);
  }, [questions, questionLimit]);

  if (!shuffledQuestions) return <ExamLoadingScreen />;

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = selectedAnswer === currentQuestion?.shuffledCorrectAnswer;
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  const submitAnswer = (questionId: string, answer: number) => {
    if (!showAnswer) {
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
      setShowAnswer(true);
    }
  };

  const nextQuestion = () => {
    setShowAnswer(false);
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowFinishDialog(true);
    }
  };

  const prevQuestion = () => {
    setShowAnswer(false);
    if (currentQuestionIndex > 0)
      setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleFinish = () => {
    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    let correctCount = 0;
    shuffledQuestions.forEach(q => {
      if (answers[q.id] === q.shuffledCorrectAnswer) correctCount++;
    });
    const percentage = (correctCount / shuffledQuestions.length) * 100;
    const blockResults: BlockResult[] = [{
      blockNumber: 1,
      totalQuestions: shuffledQuestions.length,
      correctAnswers: correctCount,
      percentage,
      passed: percentage >= 70,
    }];

    const originalAnswers: Record<string, number> = {};
    Object.entries(answers).forEach(([qId, shuffledIdx]) => {
      const q = shuffledQuestions.find(sq => sq.id === qId);
      if (q) originalAnswers[qId] = q.optionMap[shuffledIdx];
    });

    onFinish({
      blockResults,
      totalCorrect: correctCount,
      totalQuestions: shuffledQuestions.length,
      overallPassed: shuffledQuestions.length > 0 && percentage >= 70,
      answers: originalAnswers,
      totalTimeSpent,
    });
  };

  if (!currentQuestion || shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="mx-auto max-w-4xl px-3 md:px-6">

          {/* Linha principal */}
          <div className="flex items-center h-14 md:h-16 gap-2">

            {/* Ícone + título */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-[5px] bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.18em] leading-none">MODO BLOCO</p>
                <p className="text-xs md:text-sm font-black text-foreground truncate leading-tight mt-0.5 max-w-[160px] sm:max-w-xs md:max-w-none">
                  {blockName}
                </p>
              </div>
            </div>

            {/* Info respondidas — desktop */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-muted border border-border shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span className="text-xs font-bold text-muted-foreground">
                {answeredCount}/{shuffledQuestions.length} respondidas
              </span>
            </div>

            {/* Finalizar */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFinishDialog(true)}
              className="h-8 md:h-9 px-3 md:px-4 rounded-[5px] font-bold uppercase text-[9px] md:text-xs tracking-widest hover-yellow border-border shrink-0"
            >
              <Flag className="w-3.5 h-3.5 md:mr-1.5" />
              <span className="hidden sm:inline">Finalizar</span>
            </Button>

            {/* Sair */}
            <button
              onClick={onExit}
              title="Sair"
              className="w-8 h-8 md:w-9 md:h-9 rounded-[5px] bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Barra de progresso segmentada */}
          <div className="pb-2.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Questão {currentQuestionIndex + 1} de {shuffledQuestions.length}
              </span>
              <span className="text-[9px] font-black text-accent uppercase tracking-widest">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="flex gap-px">
              {shuffledQuestions.map((_: any, i: number) => {
                const q = shuffledQuestions[i] as ShuffledQuestion;
                const isAns = answers[q.id] !== undefined;
                const isCur = i === currentQuestionIndex;
                return (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      isAns ? 'bg-success' :
                      isCur ? 'bg-accent' :
                      'bg-border'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────────────────── */}
      <main className="pt-[108px] md:pt-[112px] pb-28 md:pb-32">
        <div className="mx-auto max-w-4xl px-3 md:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-3 md:space-y-4"
            >
              {/* Card da questão */}
              <div className="bg-card rounded-[5px] border border-border shadow-sm p-4 md:p-8">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
                    Questão {currentQuestionIndex + 1}
                  </span>
                </div>
                <h2 className="text-base md:text-xl font-bold text-foreground leading-snug">
                  {currentQuestion.text}
                </h2>
              </div>

              {/* Alternativas */}
              <div className="space-y-2 md:space-y-3">
                {currentQuestion.shuffledOptions.map((option: string, index: number) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectOption = index === currentQuestion.shuffledCorrectAnswer;
                  const letter = optionLetters[index];

                  let containerClass = 'border-border bg-card hover:border-primary/40 hover:bg-primary/5';
                  let letterClass = 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary';
                  let textClass = 'text-muted-foreground group-hover:text-foreground';

                  if (showAnswer) {
                    if (isCorrectOption) {
                      containerClass = 'border-success bg-success/5';
                      letterClass = 'bg-success text-success-foreground';
                      textClass = 'text-success font-semibold';
                    } else if (isSelected && !isCorrectOption) {
                      containerClass = 'border-destructive bg-destructive/5';
                      letterClass = 'bg-destructive text-destructive-foreground';
                      textClass = 'text-destructive';
                    } else {
                      containerClass = 'border-border/50 bg-muted/30 opacity-60';
                      letterClass = 'bg-muted text-muted-foreground';
                      textClass = 'text-muted-foreground';
                    }
                  } else if (isSelected) {
                    containerClass = 'border-accent bg-accent/5 shadow-sm shadow-accent/10';
                    letterClass = 'bg-accent text-accent-foreground';
                    textClass = 'text-foreground font-semibold';
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => submitAnswer(currentQuestion.id, index)}
                      disabled={showAnswer}
                      className={`w-full text-left rounded-[5px] border-2 transition-all duration-200 group ${containerClass} ${showAnswer ? 'cursor-default' : ''}`}
                      whileHover={!showAnswer ? { scale: 1.005 } : {}}
                      whileTap={!showAnswer ? { scale: 0.995 } : {}}
                    >
                      <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
                        <span className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-[5px] flex items-center justify-center font-black text-sm md:text-base transition-all duration-200 ${letterClass}`}>
                          {showAnswer && isCorrectOption ? (
                            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                          ) : showAnswer && isSelected && !isCorrectOption ? (
                            <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                          ) : letter}
                        </span>
                        <span className={`text-sm md:text-base leading-snug font-medium transition-colors duration-200 ${textClass}`}>
                          {option}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback pós-resposta */}
              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3"
                  >
                    {/* Banner certo/errado */}
                    <div className={`flex items-center gap-3 p-3 md:p-4 rounded-[5px] border-2 ${
                      isCorrect
                        ? 'bg-success/10 border-success/30 text-success'
                        : 'bg-destructive/10 border-destructive/30 text-destructive'
                    }`}>
                      {isCorrect
                        ? <CheckCircle2 className="w-5 h-5 shrink-0" />
                        : <XCircle className="w-5 h-5 shrink-0" />}
                      <span className="font-bold text-sm">
                        {isCorrect ? 'Resposta correta! Muito bem!' : 'Resposta incorreta. Veja a explicação abaixo.'}
                      </span>
                    </div>

                    {/* Explicação */}
                    <div className="bg-card rounded-[5px] border border-border shadow-sm p-4 md:p-6">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-7 h-7 rounded-[5px] bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest text-foreground">Explicação</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                        {currentQuestion.explanation || 'Esta questão faz parte do banco de dados oficial. A resposta correta foi validada por nossos especialistas.'}
                      </p>
                    </div>

                    {/* AI Chat */}
                    <QuestionAIChat
                      questionId={currentQuestion.id}
                      questionText={currentQuestion.text}
                      options={currentQuestion.options as string[]}
                      correctAnswer={currentQuestion.correct_answer}
                      explanation={currentQuestion.explanation}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── FOOTER NAV ──────────────────────────────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="mx-auto max-w-4xl px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">

            {/* Anterior */}
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="h-10 md:h-12 px-3 md:px-6 rounded-[5px] font-bold text-xs uppercase tracking-wider shrink-0 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Anterior</span>
            </Button>

            {/* Centro — contador */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 rounded-[5px] bg-primary text-primary-foreground font-black text-sm shadow-lg">
                  {currentQuestionIndex + 1}
                  <span className="opacity-40 mx-1 font-normal">/</span>
                  {shuffledQuestions.length}
                </div>
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`w-7 h-7 rounded-[5px] border flex items-center justify-center ${
                        isCorrect
                          ? 'bg-success/20 border-success/30'
                          : 'bg-destructive/20 border-destructive/30'
                      }`}
                    >
                      {isCorrect
                        ? <CheckCircle2 className="w-4 h-4 text-success" />
                        : <XCircle className="w-4 h-4 text-destructive" />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Próxima / Finalizar */}
            <Button
              onClick={nextQuestion}
              disabled={!showAnswer && !isAnswered}
              className={`h-10 md:h-12 px-4 md:px-8 rounded-[5px] font-bold text-xs uppercase tracking-wider shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                currentQuestionIndex === shuffledQuestions.length - 1
                  ? 'bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20'
                  : ''
              }`}
            >
              {currentQuestionIndex === shuffledQuestions.length - 1 ? (
                <>
                  <Flag className="w-3.5 h-3.5 mr-1.5" />
                  <span>Finalizar</span>
                </>
              ) : (
                <>
                  <span>Próxima</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>

      {/* ── DIALOG FINALIZAR ────────────────────────────────────────── */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="rounded-[5px] border-none shadow-2xl max-w-sm p-6 md:p-8">
          <DialogHeader>
            <div className="w-14 h-14 rounded-[5px] bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 mx-auto">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <DialogTitle className="text-xl font-black text-center text-foreground">Concluir Bloco?</DialogTitle>
            <DialogDescription className="text-center text-sm pt-1">
              {answeredCount < shuffledQuestions.length ? (
                <>
                  Você ainda tem{' '}
                  <span className="font-black text-primary">
                    {shuffledQuestions.length - answeredCount}
                  </span>{' '}
                  questões sem resposta. Deseja finalizar mesmo assim?
                </>
              ) : (
                'Parabéns! Você respondeu todas as questões. Veja seu resultado!'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 mt-4">
            <Button className="w-full h-11 rounded-[5px] font-black bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleFinish}>
              Ver Meu Resultado
            </Button>
            <Button variant="outline" className="w-full h-11 rounded-[5px] font-bold" onClick={() => setShowFinishDialog(false)}>
              Continuar Respondendo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
