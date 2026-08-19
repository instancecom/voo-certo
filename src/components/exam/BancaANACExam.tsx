import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, ChevronRight, ChevronLeft, Flag, AlertTriangle,
  Clipboard, LogOut, CheckCircle2, LayoutGrid,
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
  const [showNavModal, setShowNavModal] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">

            {/* Título & Modo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">BANCA ANAC</p>
                <h1 className="text-xs sm:text-base lg:text-lg font-black text-foreground truncate leading-tight mt-0.5">
                  Bloco {currentBlock} <span className="text-primary hidden sm:inline">— {blockInfo?.name}</span>
                </h1>
              </div>
            </div>

            {/* Timer topo à direita */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <motion.div
                animate={isTimeWarning ? { scale: [1, 1.04, 1] } : {}}
                transition={{ repeat: isTimeWarning ? Infinity : 0, duration: 1.2 }}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[6px] border font-mono font-black text-xs sm:text-sm transition-all ${
                  isTimeWarning
                    ? 'bg-destructive/10 border-destructive/30 text-destructive'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {formatTime(timeRemaining)}
              </motion.div>

              <button
                onClick={() => setShowExitDialog(true)}
                title="Sair do simulado"
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

          {/* COLUNA ESQUERDA: QUESTÃO (8 cols em desktop, 12 cols em mobile) */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentBlock}-${currentQuestion.id}`}
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
                        QUESTÃO {currentQuestionIndex + 1} DE {blockQuestions.length}
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
                      {blockInfo?.name || 'REGULAMENTAÇÃO'}
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
                      const letter = optionLetters[index];

                      return (
                        <motion.button
                          key={index}
                          onClick={() => submitAnswer(currentQuestion.id, index)}
                          className={`w-full text-left rounded-[8px] border-2 transition-all duration-200 group ${
                            isSelected
                              ? 'border-accent bg-accent/5 shadow-sm'
                              : 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/40'
                          }`}
                          whileHover={{ scale: 1.002 }}
                          whileTap={{ scale: 0.998 }}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                            {/* Caixa com Letra */}
                            <span className={`w-7 h-7 sm:w-9 sm:h-9 rounded-[6px] flex items-center justify-center font-black text-xs sm:text-sm shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-accent text-accent-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                            }`}>
                              {isSelected ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : letter}
                            </span>
                            {/* Texto da Alternativa */}
                            <span className={`text-xs sm:text-sm md:text-base leading-snug font-medium transition-colors ${
                              isSelected ? 'text-foreground font-semibold' : 'text-muted-foreground group-hover:text-foreground'
                            }`}>
                              {option}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* COLUNA DIREITA: SIDEBAR (4 cols - Visível em telas lg+) */}
          <div className="hidden lg:block lg:col-span-4 space-y-5">
            {/* Card Tempo Restante */}
            <div className="bg-[#0f172a] dark:bg-card text-white rounded-[10px] p-5 shadow-md border border-slate-800 dark:border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-amber-400/40 bg-amber-400/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TEMPO RESTANTE</p>
                  <p className="text-2xl font-black font-mono text-amber-400 leading-tight">
                    {formatTime(timeRemaining)}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 dark:border-border/50">
                <p className="text-xs text-slate-400 font-medium">Foque e mantenha o ritmo!</p>
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
              <div className="grid grid-cols-5 gap-2 pt-1">
                {blockQuestions.map((q: ShuffledQuestion, index: number) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = index === currentQuestionIndex;

                  let bubbleStyle = 'bg-muted/60 text-muted-foreground border-border hover:bg-muted';
                  if (isCurrent) {
                    bubbleStyle = 'bg-accent text-accent-foreground font-black ring-2 ring-accent/30 border-accent';
                  } else if (isAnswered) {
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
              onClick={() => setCurrentQuestionIndex((prev: number) => Math.max(0, prev - 1))}
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
              <span className="font-mono">{currentQuestionIndex + 1}/{blockQuestions.length}</span>
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
            {currentQuestionIndex === blockQuestions.length - 1 ? (
              <Button
                onClick={finishCurrentBlock}
                disabled={selectedAnswer === undefined}
                className="h-10 sm:h-11 px-4 sm:px-6 rounded-[6px] font-bold text-xs uppercase tracking-wider gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md disabled:opacity-40"
              >
                <span>{currentBlock === 4 ? 'Finalizar' : 'Próx. Bloco'}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                disabled={selectedAnswer === undefined}
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
            {blockQuestions.map((q: ShuffledQuestion, index: number) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = index === currentQuestionIndex;

              let bubbleStyle = 'bg-muted/60 text-muted-foreground border-border hover:bg-muted';
              if (isCurrent) {
                bubbleStyle = 'bg-accent text-accent-foreground font-black ring-2 ring-accent/30 border-accent';
              } else if (isAnswered) {
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
