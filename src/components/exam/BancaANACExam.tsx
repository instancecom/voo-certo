import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, ChevronRight, ChevronLeft, Flag, AlertTriangle,
  Clipboard, LogOut, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { DbQuestion } from '@/hooks/useExams';
import { BLOCKS } from './ExamModeSelector';
import { ExamLoadingScreen } from './ExamLoadingScreen';
import { ShuffledQuestion, prepareBancaQuestions } from '@/lib/examShuffle';
import { toast } from 'sonner';

interface BlockResult {
  blockNumber: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
}

interface BancaANACExamProps {
  questions: DbQuestion[];
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

const EXAM_TIME = 120 * 60;
const QUESTIONS_PER_BLOCK = 20;
const PASS_THRESHOLD = 0.7;

export function BancaANACExam({ questions, onFinish, onExit }: BancaANACExamProps) {
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[] | null>(null);
  const [currentBlock, setCurrentBlock] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(EXAM_TIME);
  const [blockResults, setBlockResults] = useState<BlockResult[]>([]);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShuffledQuestions(prepareBancaQuestions(questions));
    }, 800);
    return () => clearTimeout(timer);
  }, [questions]);

  if (!shuffledQuestions) return <ExamLoadingScreen />;

  return (
    <BancaExamInner
      shuffledQuestions={shuffledQuestions}
      currentBlock={currentBlock} setCurrentBlock={setCurrentBlock}
      currentQuestionIndex={currentQuestionIndex} setCurrentQuestionIndex={setCurrentQuestionIndex}
      answers={answers} setAnswers={setAnswers}
      timeRemaining={timeRemaining} setTimeRemaining={setTimeRemaining}
      blockResults={blockResults} setBlockResults={setBlockResults}
      showTimeWarning={showTimeWarning} setShowTimeWarning={setShowTimeWarning}
      showExitDialog={showExitDialog} setShowExitDialog={setShowExitDialog}
      totalTimeSpent={totalTimeSpent} setTotalTimeSpent={setTotalTimeSpent}
      onFinish={onFinish} onExit={onExit}
    />
  );
}

function BancaExamInner({
  shuffledQuestions,
  currentBlock, setCurrentBlock,
  currentQuestionIndex, setCurrentQuestionIndex,
  answers, setAnswers,
  timeRemaining, setTimeRemaining,
  blockResults, setBlockResults,
  showTimeWarning, setShowTimeWarning,
  showExitDialog, setShowExitDialog,
  totalTimeSpent, setTotalTimeSpent,
  onFinish, onExit,
}: any) {
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

  const getBlockQuestions = (block: number): ShuffledQuestion[] =>
    shuffledQuestions.filter((q: ShuffledQuestion) => q.block_number === block);

  const blockQuestions = getBlockQuestions(currentBlock);
  const currentQuestion = blockQuestions[currentQuestionIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  useEffect(() => {
    if (currentBlock > 4) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev: number) => {
        if (prev === 300 && !showTimeWarning) setShowTimeWarning(true);
        if (prev <= 1) { finishCurrentBlock(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentBlock, showTimeWarning]);

  const finishCurrentBlock = useCallback(() => {
    const currentTotalSpent = EXAM_TIME - timeRemaining;
    const timeSpentOnThisBlock = currentTotalSpent - totalTimeSpent;
    setTotalTimeSpent(currentTotalSpent);

    let correctCount = 0;
    blockQuestions.forEach((q: ShuffledQuestion) => {
      if (answers[q.id] === q.shuffledCorrectAnswer) correctCount++;
    });

    const percentage = (correctCount / QUESTIONS_PER_BLOCK) * 100;
    const passed = percentage >= PASS_THRESHOLD * 100;
    const result: BlockResult = {
      blockNumber: currentBlock, totalQuestions: QUESTIONS_PER_BLOCK,
      correctAnswers: correctCount, percentage, passed, timeSpent: timeSpentOnThisBlock,
    };

    if (currentBlock >= 4) {
      const allResults = [...blockResults, result];
      const totalCorrect = allResults.reduce((acc: number, r: BlockResult) => acc + r.correctAnswers, 0);
      const overallPassed = allResults.length > 0 && allResults.every((r: BlockResult) => r.passed);
      const originalAnswers: Record<string, number> = {};
      Object.entries(answers).forEach(([qId, shuffledIdx]) => {
        const q = shuffledQuestions.find((sq: ShuffledQuestion) => sq.id === qId);
        if (q) originalAnswers[qId] = q.optionMap[shuffledIdx as number];
      });
      onFinish({ blockResults: allResults, totalCorrect, totalQuestions: 80, overallPassed, answers: originalAnswers, totalTimeSpent: currentTotalSpent });
    } else {
      setBlockResults((prev: BlockResult[]) => [...prev, result]);
      setCurrentBlock((prev: number) => prev + 1);
      setCurrentQuestionIndex(0);
      toast.success(`Bloco ${currentBlock} concluído! Iniciando Bloco ${currentBlock + 1}...`);
    }
  }, [currentBlock, blockQuestions, answers, timeRemaining, blockResults, totalTimeSpent, shuffledQuestions, onFinish]);

  const submitAnswer = (questionId: string, answer: number) => {
    setAnswers((prev: Record<string, number>) => ({ ...prev, [questionId]: answer }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < blockQuestions.length - 1)
      setCurrentQuestionIndex((prev: number) => prev + 1);
  };

  const goToQuestion = (index: number) => setCurrentQuestionIndex(index);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeWarning = timeRemaining <= 300;
  const progress = ((currentQuestionIndex + 1) / blockQuestions.length) * 100;
  const blockInfo = BLOCKS.find(b => b.id === currentBlock);
  const answeredCount = blockQuestions.filter((q: ShuffledQuestion) => answers[q.id] !== undefined).length;
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  if (!currentQuestion || blockQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center p-8 bg-card border border-border rounded-[5px] shadow-sm max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <p className="text-foreground font-bold mb-4">Não há questões disponíveis para o Bloco {currentBlock}.</p>
          <Button onClick={onExit} className="rounded-[5px] h-11 px-6 font-bold">Voltar</Button>
        </div>
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
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-[5px] bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                <Clipboard className="w-4 h-4 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.18em] leading-none">BANCA ANAC</p>
                <p className="text-xs md:text-sm font-black text-foreground truncate leading-tight mt-0.5">
                  Bloco {currentBlock}
                  <span className="text-muted-foreground font-medium hidden sm:inline"> — {blockInfo?.name}</span>
                </p>
              </div>
            </div>

            {/* Indicadores de bloco — desktop */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              {[1, 2, 3, 4].map(b => (
                <div key={b} className={`h-1.5 rounded-full transition-all duration-300 ${
                  b < currentBlock ? 'bg-success w-6' :
                  b === currentBlock ? 'bg-accent w-8' :
                  'bg-border w-6'
                }`} />
              ))}
            </div>

            {/* Timer */}
            <motion.div
              animate={isTimeWarning ? { scale: [1, 1.04, 1] } : {}}
              transition={{ repeat: isTimeWarning ? Infinity : 0, duration: 1.2 }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[5px] border font-mono font-black text-sm transition-all shrink-0 ${
                isTimeWarning
                  ? 'bg-destructive/10 border-destructive/30 text-destructive'
                  : 'bg-muted border-border text-foreground'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isTimeWarning ? 'text-destructive' : 'text-muted-foreground'}`} />
              {formatTime(timeRemaining)}
            </motion.div>

            {/* Botão sair */}
            <button
              onClick={() => setShowExitDialog(true)}
              title="Sair do simulado"
              className="w-8 h-8 md:w-9 md:h-9 rounded-[5px] bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Barra de progresso segmentada */}
          <div className="pb-2.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Bloco {currentBlock}/4 · {answeredCount}/{blockQuestions.length} respondidas
              </span>
              <span className="text-[9px] font-black text-accent uppercase tracking-widest">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="flex gap-0.5">
              {blockQuestions.map((_: any, i: number) => {
                const q = blockQuestions[i] as ShuffledQuestion;
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = i === currentQuestionIndex;
                return (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      isAnswered ? 'bg-success' :
                      isCurrent ? 'bg-accent' :
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
              key={`${currentBlock}-${currentQuestion.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {/* Card da questão */}
              <div className="bg-card rounded-[5px] border border-border shadow-sm p-4 md:p-8 mb-3 md:mb-4">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
                    Questão {currentQuestionIndex + 1}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider hidden sm:block">
                    {blockInfo?.name}
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
                  const letter = optionLetters[index];

                  return (
                    <motion.button
                      key={index}
                      onClick={() => submitAnswer(currentQuestion.id, index)}
                      className={`w-full text-left rounded-[5px] border-2 transition-all duration-200 group ${
                        isSelected
                          ? 'border-accent bg-accent/5 shadow-sm shadow-accent/10'
                          : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5'
                      }`}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
                        {/* Letra */}
                        <span className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-[5px] flex items-center justify-center font-black text-sm md:text-base transition-all duration-200 ${
                          isSelected
                            ? 'bg-accent text-accent-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }`}>
                          {isSelected ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : letter}
                        </span>
                        {/* Texto */}
                        <span className={`text-sm md:text-base leading-snug font-medium transition-colors duration-200 ${
                          isSelected ? 'text-foreground font-semibold' : 'text-muted-foreground group-hover:text-foreground'
                        }`}>
                          {option}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
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
              onClick={() => setCurrentQuestionIndex((prev: number) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="h-10 md:h-12 px-3 md:px-6 rounded-[5px] font-bold text-xs uppercase tracking-wider shrink-0 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Anterior</span>
            </Button>

            {/* Bubbles — desktop */}
            <div className="hidden md:flex flex-1 min-w-0 justify-start gap-1.5 overflow-x-auto scrollbar-none py-1 px-2">
              {blockQuestions.map((q: ShuffledQuestion, index: number) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = index === currentQuestionIndex;
                const isNavigable =
                  index <= currentQuestionIndex ||
                  answers[blockQuestions[index].id] !== undefined ||
                  (index === currentQuestionIndex + 1 && selectedAnswer !== undefined);

                return (
                  <button
                    key={q.id}
                    ref={isCurrent ? activeBubbleRef : null}
                    onClick={() => isNavigable && goToQuestion(index)}
                    disabled={!isNavigable}
                    className={`w-9 h-9 rounded-[6px] text-xs font-black flex items-center justify-center shrink-0 transition-all duration-200 border ${
                      isCurrent ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-110 ring-2 ring-primary/20' :
                      isAnswered ? 'bg-success/15 text-success border-success/45 hover:bg-success/25 hover:border-success/60' :
                      !isNavigable ? 'bg-slate-100/50 text-slate-400/60 border-slate-200/80 cursor-not-allowed' :
                      'bg-background border-border text-slate-600 hover:bg-primary/5 hover:border-primary/40 hover:text-primary hover:scale-105 shadow-sm'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Contador — mobile */}
            <div className="md:hidden flex-1 flex justify-center">
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 rounded-[5px] bg-primary text-primary-foreground font-black text-sm shadow-lg">
                  {currentQuestionIndex + 1}
                  <span className="opacity-40 mx-1 font-normal">/</span>
                  {blockQuestions.length}
                </div>
                <AnimatePresence>
                  {selectedAnswer !== undefined && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="w-7 h-7 rounded-[5px] bg-success/20 border border-success/30 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Próxima / Finalizar */}
            {currentQuestionIndex === blockQuestions.length - 1 ? (
              <Button
                onClick={finishCurrentBlock}
                disabled={selectedAnswer === undefined}
                className="h-10 md:h-12 px-4 md:px-8 rounded-[5px] font-bold text-xs uppercase tracking-wider shrink-0 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Flag className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">
                  {currentBlock === 4 ? 'Finalizar Simulado' : 'Finalizar Bloco'}
                </span>
                <span className="sm:hidden">
                  {currentBlock === 4 ? 'Finalizar' : 'Próx. Bloco'}
                </span>
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                disabled={selectedAnswer === undefined}
                className="h-10 md:h-12 px-4 md:px-8 rounded-[5px] font-bold text-xs uppercase tracking-wider shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Próxima</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* ── DIALOG SAIR ─────────────────────────────────────────────── */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="rounded-[5px] border-none shadow-2xl max-w-sm p-6 md:p-8">
          <DialogHeader>
            <div className="w-14 h-14 rounded-[5px] bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <DialogTitle className="text-xl font-black text-center text-foreground">Sair do Simulado?</DialogTitle>
            <DialogDescription className="text-center text-sm pt-1">
              Todo o seu progresso será perdido e você terá que recomeçar do início.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-6">
            <Button className="w-full h-11 rounded-[5px] font-bold" onClick={() => setShowExitDialog(false)}>
              Continuar Simulado
            </Button>
            <Button variant="outline" className="w-full h-11 rounded-[5px] font-bold text-destructive border-destructive/30 hover:bg-destructive/10" onClick={onExit}>
              Sair mesmo assim
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG TEMPO ────────────────────────────────────────────── */}
      <Dialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <DialogContent className="rounded-[5px] border-none shadow-2xl max-w-sm p-6 md:p-8">
          <DialogHeader>
            <div className="w-14 h-14 rounded-[5px] bg-warning/10 border border-warning/20 flex items-center justify-center mb-4 mx-auto">
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                <Clock className="w-7 h-7 text-warning" />
              </motion.div>
            </div>
            <DialogTitle className="text-xl font-black text-center text-warning">5 minutos restantes!</DialogTitle>
            <DialogDescription className="text-center text-sm pt-1">
              Responda as questões restantes antes que o tempo acabe.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-6">
            <Button className="w-full h-11 rounded-[5px] font-black bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setShowTimeWarning(false)}>
              Entendi, vou continuar!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
