import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle,
  BookOpen, Loader2, LogOut, LayoutGrid,
} from 'lucide-react';
import { QuestionAIChat } from './QuestionAIChat';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { DbQuestion } from '@/hooks/useExams';
import { BLOCKS } from './ExamModeSelector';
import { ExamLoadingScreen } from './ExamLoadingScreen';
import { ShuffledQuestion, prepareExamQuestions } from '@/lib/examShuffle';

interface BlockResult {
  blockNumber: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  passed: boolean;
}

interface LivreExamProps {
  questions: DbQuestion[];
  selectedBlock?: number;
  questionLimit?: number;
  onFinish: (results: {
    blockResults: BlockResult[];
    totalCorrect: number;
    totalQuestions: number;
    overallPassed: boolean;
    answers: Record<string, number>;
  }) => void;
  onExit: () => void;
}

export function LivreExam({ questions, selectedBlock, questionLimit, onFinish, onExit }: LivreExamProps) {
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);

  const activeBubbleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeBubbleRef.current) {
      activeBubbleRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShuffledQuestions(prepareExamQuestions(questions, selectedBlock, questionLimit));
    }, 800);
    return () => clearTimeout(timer);
  }, [questions, selectedBlock, questionLimit]);

  if (!shuffledQuestions) return <ExamLoadingScreen />;

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = selectedAnswer === currentQuestion?.shuffledCorrectAnswer;
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
  const blockInfo = selectedBlock ? BLOCKS.find(b => b.id === selectedBlock) : null;
  const answeredCount = Object.keys(answers).length;
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  const submitAnswer = (questionId: string, answer: number) => {
    if (!showAnswer) {
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
      setShowAnswer(true);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowAnswer(answers[shuffledQuestions[index].id] !== undefined);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setShowAnswer(answers[shuffledQuestions[nextIndex].id] !== undefined);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setShowAnswer(answers[shuffledQuestions[prevIndex].id] !== undefined);
    }
  };

  const handleFinish = () => {
    const blockResults: BlockResult[] = [];
    const presentBlocks = Array.from(new Set(shuffledQuestions.map(q => q.block_number || 0))).sort((a, b) => (a || 0) - (b || 0));

    presentBlocks.forEach(blockNum => {
      const blockQs = shuffledQuestions.filter(q => (q.block_number || 0) === blockNum);
      if (blockQs.length === 0) return;
      let correctCount = 0;
      blockQs.forEach(q => { if (answers[q.id] === q.shuffledCorrectAnswer) correctCount++; });
      const percentage = (correctCount / blockQs.length) * 100;
      blockResults.push({ blockNumber: blockNum || 1, totalQuestions: blockQs.length, correctAnswers: correctCount, percentage, passed: percentage >= 70 });
    });

    const totalCorrect = blockResults.reduce((acc, r) => acc + r.correctAnswers, 0);
    const totalQuestions = blockResults.reduce((acc, r) => acc + r.totalQuestions, 0);
    const overallPassed = blockResults.length > 0 && blockResults.every(r => r.passed);

    const originalAnswers: Record<string, number> = {};
    Object.entries(answers).forEach(([qId, shuffledIdx]) => {
      const q = shuffledQuestions.find(sq => sq.id === qId);
      if (q) originalAnswers[qId] = q.optionMap[shuffledIdx];
    });

    onFinish({ blockResults, totalCorrect, totalQuestions, overallPassed, answers: originalAnswers });
  };

  if (!currentQuestion || shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">

            {/* Título & Modo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">MODO LIVRE</p>
                <h1 className="text-xs sm:text-base lg:text-lg font-black text-foreground truncate leading-tight mt-0.5">
                  {selectedBlock ? `Bloco ${selectedBlock}` : 'Todos os Blocos'}
                  <span className="text-primary font-bold hidden sm:inline">
                    {blockInfo ? ` — ${blockInfo.name}` : ''}
                  </span>
                </h1>
              </div>
            </div>

            {/* Ações Topo à Direita */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFinishDialog(true)}
                className="h-8 sm:h-9 px-3 sm:px-4 rounded-[6px] font-bold uppercase text-[10px] sm:text-xs tracking-wider border-border"
              >
                <Flag className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Finalizar</span>
              </Button>

              <button
                onClick={onExit}
                title="Sair"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-[6px] bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── MAIN 2-COLUMN CONTENT ─────────────────────────────────────── */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

          {/* COLUNA ESQUERDA: QUESTÃO (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Card da Questão */}
                <div className="bg-card rounded-[10px] border border-border/80 shadow-sm p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                  {/* Topo do Card: Progresso */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center text-[10px] sm:text-xs font-black tracking-wider">
                      <span className="text-muted-foreground uppercase">
                        QUESTÃO {currentQuestionIndex + 1} DE {shuffledQuestions.length}
                      </span>
                      <span className="text-accent font-mono">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Tag Categoria */}
                  <div>
                    <span className="text-[11px] sm:text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest">
                      {currentQuestion.block_number ? `BLOCO ${currentQuestion.block_number}` : 'MODO LIVRE'}
                    </span>
                  </div>

                  {/* Enunciado */}
                  <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground leading-relaxed">
                    {currentQuestion.text}
                  </h2>

                  {/* Alternativas */}
                  <div className="space-y-2.5 sm:space-y-3 pt-1">
                    {currentQuestion.shuffledOptions.map((option: string, index: number) => {
                      const isSelected = selectedAnswer === index;
                      const isCorrectOption = index === currentQuestion.shuffledCorrectAnswer;
                      const letter = optionLetters[index];

                      let containerClass = 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/40';
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
                          containerClass = 'border-border/40 bg-muted/20 opacity-50';
                          letterClass = 'bg-muted text-muted-foreground';
                          textClass = 'text-muted-foreground';
                        }
                      } else if (isSelected) {
                        containerClass = 'border-accent bg-accent/5 shadow-sm';
                        letterClass = 'bg-accent text-accent-foreground';
                        textClass = 'text-foreground font-semibold';
                      }

                      return (
                        <motion.button
                          key={index}
                          onClick={() => submitAnswer(currentQuestion.id, index)}
                          disabled={showAnswer}
                          className={`w-full text-left rounded-[8px] border-2 transition-all duration-200 group ${containerClass}`}
                          whileHover={!showAnswer ? { scale: 1.002 } : {}}
                          whileTap={!showAnswer ? { scale: 0.998 } : {}}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                            <span className={`w-7 h-7 sm:w-9 sm:h-9 rounded-[6px] flex items-center justify-center font-black text-xs sm:text-sm shrink-0 transition-colors ${letterClass}`}>
                              {showAnswer && isCorrectOption ? (
                                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                              ) : showAnswer && isSelected && !isCorrectOption ? (
                                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                              ) : letter}
                            </span>
                            <span className={`text-xs sm:text-sm md:text-base leading-snug font-medium transition-colors ${textClass}`}>
                              {option}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback Pós-Resposta & IA */}
                <AnimatePresence>
                  {showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="space-y-4"
                    >
                      <div className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-[8px] border-2 ${
                        isCorrect
                          ? 'bg-success/10 border-success/30 text-success'
                          : 'bg-destructive/10 border-destructive/30 text-destructive'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                        <span className="font-bold text-xs sm:text-sm">
                          {isCorrect ? 'Resposta correta! Excelente!' : 'Resposta incorreta. Confira a explicação:'}
                        </span>
                      </div>

                      <div className="bg-card rounded-[10px] border border-border/80 p-4 sm:p-6 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                          <BookOpen className="w-4 h-4" />
                          <span>Explicação Detalhada</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm md:text-base pt-1">
                          {currentQuestion.explanation || 'Questão oficial validada por nossos especialistas da aviação.'}
                        </p>
                      </div>

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

          {/* COLUNA DIREITA: SIDEBAR (4 cols - Visível em telas lg+) */}
          <div className="hidden lg:block lg:col-span-4 space-y-5">
            {/* Card Status Respondidas */}
            <div className="bg-[#0f172a] dark:bg-card text-white rounded-[10px] p-5 shadow-md border border-slate-800 dark:border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-400/40 bg-emerald-400/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PROGRESSO DO SIMULADO</p>
                  <p className="text-xl font-black text-white leading-tight">
                    {answeredCount} <span className="text-slate-400 text-sm font-normal">/ {shuffledQuestions.length} respondidas</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Card Navegador de Questões */}
            <div className="bg-card rounded-[10px] border border-border/80 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest">NAVEGADOR</h3>

              {/* Legenda */}
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-muted-foreground pb-2 border-b border-border/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 dark:bg-slate-200"></span>
                  Respondida
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Atual
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-muted border border-border"></span>
                  Não respondida
                </span>
              </div>

              {/* Grid 5 Colunas */}
              <div className="grid grid-cols-5 gap-2 pt-1 max-h-[300px] overflow-y-auto pr-1">
                {shuffledQuestions.map((q: ShuffledQuestion, index: number) => {
                  const isAns = answers[q.id] !== undefined;
                  const isCur = index === currentQuestionIndex;

                  let bubbleStyle = 'bg-muted/60 text-muted-foreground border-border hover:bg-muted';
                  if (isCur) {
                    bubbleStyle = 'bg-accent text-accent-foreground font-black ring-2 ring-accent/30 border-accent';
                  } else if (isAns) {
                    bubbleStyle = 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border-slate-800';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(index)}
                      className={`h-9 rounded-[6px] text-xs font-bold transition-all border flex items-center justify-center ${bubbleStyle}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER BAR FIXO NA PARTE INFERIOR ──────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg py-2.5 sm:py-3">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">

            {/* Esquerda: Botão Anterior */}
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="h-10 sm:h-11 px-3 sm:px-5 rounded-[6px] font-bold text-xs uppercase tracking-wider gap-1.5 border-border"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>

            {/* Centro Mobile: Botão para abrir Navegador Modal */}
            <Button
              variant="outline"
              onClick={() => setShowNavModal(true)}
              className="h-10 px-3 rounded-[6px] font-bold text-xs uppercase tracking-wider gap-1.5 border-border lg:hidden"
            >
              <LayoutGrid className="w-4 h-4 text-accent" />
              <span className="font-mono">{currentQuestionIndex + 1}/{shuffledQuestions.length}</span>
            </Button>

            {/* Centro Desktop: Marcar para revisão */}
            <Button
              variant="ghost"
              onClick={() => toast.info('Questão marcada para revisão!')}
              className="h-11 px-4 rounded-[6px] font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground gap-2 hidden lg:flex"
            >
              <Flag className="w-4 h-4" />
              <span>Marcar para Revisão</span>
            </Button>

            {/* Direita: Próxima / Finalizar */}
            {currentQuestionIndex === shuffledQuestions.length - 1 ? (
              <Button
                onClick={() => setShowFinishDialog(true)}
                className="h-10 sm:h-11 px-4 sm:px-6 rounded-[6px] font-bold text-xs uppercase tracking-wider gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
              >
                <span>Finalizar</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                disabled={!showAnswer && !isAnswered}
                className="h-10 sm:h-11 px-4 sm:px-6 rounded-[6px] font-bold text-xs uppercase tracking-wider gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md disabled:opacity-40"
              >
                <span>Próxima</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

          </div>
        </div>
      </footer>

      {/* ── MODAL NAVEGADOR (MOBILE) ─────────────────────────────────── */}
      <Dialog open={showNavModal} onOpenChange={setShowNavModal}>
        <DialogContent className="rounded-[10px] border-none shadow-2xl max-w-sm p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-accent" />
              Navegador de Questões
            </DialogTitle>
          </DialogHeader>

          {/* Legenda */}
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-muted-foreground py-2 border-y border-border/60 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 dark:bg-slate-200"></span>
              Respondida
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Atual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-muted border border-border"></span>
              Não respondida
            </span>
          </div>

          {/* Grid 5 Colunas */}
          <div className="grid grid-cols-5 gap-2 my-4 max-h-[300px] overflow-y-auto pr-1">
            {shuffledQuestions.map((q: ShuffledQuestion, index: number) => {
              const isAns = answers[q.id] !== undefined;
              const isCur = index === currentQuestionIndex;

              let bubbleStyle = 'bg-muted/60 text-muted-foreground border-border hover:bg-muted';
              if (isCur) {
                bubbleStyle = 'bg-accent text-accent-foreground font-black ring-2 ring-accent/30 border-accent';
              } else if (isAns) {
                bubbleStyle = 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border-slate-800';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    goToQuestion(index);
                    setShowNavModal(false);
                  }}
                  className={`h-10 rounded-[6px] text-xs font-bold transition-all border flex items-center justify-center ${bubbleStyle}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            className="w-full h-10 rounded-[6px] font-bold text-xs uppercase"
            onClick={() => setShowNavModal(false)}
          >
            Fechar Navegador
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG FINALIZAR ────────────────────────────────────────── */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="rounded-[5px] border-none shadow-2xl max-w-sm p-6 md:p-8">
          <DialogHeader>
            <div className="w-14 h-14 rounded-[5px] bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 mx-auto">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <DialogTitle className="text-xl font-black text-center text-foreground">Concluir Simulado?</DialogTitle>
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
          <div className="flex flex-col gap-2 mt-6">
            <Button className="w-full h-11 rounded-[5px] font-black bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleFinish}>
              Ver Meu Resultado
            </Button>
            <Button variant="outline" className="w-full h-11 rounded-[5px] font-bold" onClick={() => setShowFinishDialog(false)}>
              Continuar Respondendo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
