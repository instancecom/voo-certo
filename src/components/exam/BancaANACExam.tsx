import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, Flag, AlertTriangle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { DbQuestion } from '@/hooks/useExams';
import { BLOCKS } from './ExamModeSelector';
import { ExamLoadingScreen } from './ExamLoadingScreen';
import { ShuffledQuestion, prepareBancaQuestions } from '@/lib/examShuffle';

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

const BLOCK_TIME = 30 * 60;
const QUESTIONS_PER_BLOCK = 20;
const PASS_THRESHOLD = 0.7;

export function BancaANACExam({ questions, onFinish, onExit }: BancaANACExamProps) {
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[] | null>(null);
  const [currentBlock, setCurrentBlock] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(BLOCK_TIME);
  const [blockResults, setBlockResults] = useState<BlockResult[]>([]);
  const [showBlockEndDialog, setShowBlockEndDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [lastBlockResult, setLastBlockResult] = useState<BlockResult | null>(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  // Shuffle questions on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShuffledQuestions(prepareBancaQuestions(questions));
    }, 800);
    return () => clearTimeout(timer);
  }, [questions]);

  if (!shuffledQuestions) {
    return <ExamLoadingScreen />;
  }

  const getBlockQuestions = (block: number) => {
    return shuffledQuestions.filter(q => q.block_number === block);
  };

  const blockQuestions = getBlockQuestions(currentBlock);
  const currentQuestion = blockQuestions[currentQuestionIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  // Timer component extracted to avoid hook issues
  return (
    <BancaExamInner
      shuffledQuestions={shuffledQuestions}
      currentBlock={currentBlock}
      setCurrentBlock={setCurrentBlock}
      currentQuestionIndex={currentQuestionIndex}
      setCurrentQuestionIndex={setCurrentQuestionIndex}
      answers={answers}
      setAnswers={setAnswers}
      timeRemaining={timeRemaining}
      setTimeRemaining={setTimeRemaining}
      blockResults={blockResults}
      setBlockResults={setBlockResults}
      showBlockEndDialog={showBlockEndDialog}
      setShowBlockEndDialog={setShowBlockEndDialog}
      showTimeWarning={showTimeWarning}
      setShowTimeWarning={setShowTimeWarning}
      showExitDialog={showExitDialog}
      setShowExitDialog={setShowExitDialog}
      lastBlockResult={lastBlockResult}
      setLastBlockResult={setLastBlockResult}
      totalTimeSpent={totalTimeSpent}
      setTotalTimeSpent={setTotalTimeSpent}
      onFinish={onFinish}
      onExit={onExit}
    />
  );
}

// Inner component to avoid conditional hooks
function BancaExamInner({
  shuffledQuestions,
  currentBlock, setCurrentBlock,
  currentQuestionIndex, setCurrentQuestionIndex,
  answers, setAnswers,
  timeRemaining, setTimeRemaining,
  blockResults, setBlockResults,
  showBlockEndDialog, setShowBlockEndDialog,
  showTimeWarning, setShowTimeWarning,
  showExitDialog, setShowExitDialog,
  lastBlockResult, setLastBlockResult,
  totalTimeSpent, setTotalTimeSpent,
  onFinish, onExit,
}: any) {
  const getBlockQuestions = (block: number): ShuffledQuestion[] => {
    return shuffledQuestions.filter((q: ShuffledQuestion) => q.block_number === block);
  };

  const blockQuestions = getBlockQuestions(currentBlock);
  const currentQuestion = blockQuestions[currentQuestionIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  useEffect(() => {
    if (currentBlock > 4) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev: number) => {
        if (prev === 300 && !showTimeWarning) {
          setShowTimeWarning(true);
        }
        if (prev <= 1) {
          finishCurrentBlock();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentBlock, showTimeWarning]);

  const finishCurrentBlock = useCallback(() => {
    const timeSpent = BLOCK_TIME - timeRemaining;
    setTotalTimeSpent((prev: number) => prev + timeSpent);

    let correctCount = 0;
    blockQuestions.forEach((q: ShuffledQuestion) => {
      // Compare against shuffledCorrectAnswer since user selects from shuffled options
      if (answers[q.id] === q.shuffledCorrectAnswer) {
        correctCount++;
      }
    });

    const percentage = (correctCount / QUESTIONS_PER_BLOCK) * 100;
    const passed = percentage >= PASS_THRESHOLD * 100;

    const result: BlockResult = {
      blockNumber: currentBlock,
      totalQuestions: QUESTIONS_PER_BLOCK,
      correctAnswers: correctCount,
      percentage,
      passed,
      timeSpent,
    };

    setLastBlockResult(result);
    setBlockResults((prev: BlockResult[]) => [...prev, result]);
    setShowBlockEndDialog(true);
  }, [currentBlock, blockQuestions, answers, timeRemaining]);

  const proceedToNextBlock = () => {
    setShowBlockEndDialog(false);
    setShowTimeWarning(false);

    if (currentBlock >= 4) {
      const allResults = [...blockResults, lastBlockResult!];
      const totalCorrect = allResults.reduce((acc: number, r: BlockResult) => acc + r.correctAnswers, 0);
      const overallPassed = allResults.every((r: BlockResult) => r.passed);

      // Convert answers back to original indices for storage
      const originalAnswers: Record<string, number> = {};
      Object.entries(answers).forEach(([qId, shuffledIdx]) => {
        const q = shuffledQuestions.find((sq: ShuffledQuestion) => sq.id === qId);
        if (q) {
          originalAnswers[qId] = q.optionMap[shuffledIdx as number];
        }
      });

      onFinish({
        blockResults: allResults,
        totalCorrect,
        totalQuestions: 80,
        overallPassed,
        answers: originalAnswers,
        totalTimeSpent: totalTimeSpent + (BLOCK_TIME - timeRemaining),
      });
    } else {
      setCurrentBlock((prev: number) => prev + 1);
      setCurrentQuestionIndex(0);
      setTimeRemaining(BLOCK_TIME);
    }
  };

  const submitAnswer = (questionId: string, answer: number) => {
    setAnswers((prev: Record<string, number>) => ({ ...prev, [questionId]: answer }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < blockQuestions.length - 1) {
      setCurrentQuestionIndex((prev: number) => prev + 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeWarning = timeRemaining <= 300;
  const progress = ((currentQuestionIndex + 1) / blockQuestions.length) * 100;
  const blockInfo = BLOCKS.find(b => b.id === currentBlock);

  if (!currentQuestion || blockQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <p className="text-foreground mb-4">Não há questões disponíveis para o Bloco {currentBlock}.</p>
          <Button onClick={onExit}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{blockInfo?.icon}</span>
                <div>
                  <h1 className="text-sm font-semibold text-foreground">
                    Bloco {currentBlock}: {blockInfo?.name}
                  </h1>
                  <p className="text-xs text-muted-foreground">Modo Banca ANAC</p>
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isTimeWarning ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-muted'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold text-lg">
                {formatTime(timeRemaining)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                {[1, 2, 3, 4].map(block => (
                  <div
                    key={block}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium ${
                      block === currentBlock
                        ? 'bg-primary text-primary-foreground'
                        : block < currentBlock
                        ? 'bg-success/20 text-success'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {block}
                  </div>
                ))}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowExitDialog(true)}
              >
                <Flag className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          <div className="pb-2">
            <Progress value={progress} className="h-1" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Questão {currentQuestionIndex + 1} de {blockQuestions.length}</span>
              <span>Bloco {currentBlock} de 4</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <span className="text-sm text-accent font-medium mb-2 block">
                  Questão {currentQuestionIndex + 1}
                </span>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
                  {currentQuestion.text}
                </h2>
              </div>

              <div className="space-y-3">
                {currentQuestion.shuffledOptions.map((option: string, index: number) => {
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
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="hidden md:flex gap-1 overflow-x-auto max-w-md">
              {blockQuestions.map((q: ShuffledQuestion, index: number) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = index === currentQuestionIndex;

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

            <div className="flex-1 md:flex-none" />

            {currentQuestionIndex === blockQuestions.length - 1 ? (
              <Button variant="hero" onClick={finishCurrentBlock}>
                {currentBlock === 4 ? 'Finalizar Simulado' : 'Finalizar Bloco'}
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

      {/* Block End Dialog */}
      <Dialog open={showBlockEndDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {lastBlockResult?.passed ? (
                <CheckCircle2 className="w-6 h-6 text-success" />
              ) : (
                <XCircle className="w-6 h-6 text-destructive" />
              )}
              Bloco {currentBlock} Finalizado
            </DialogTitle>
            <DialogDescription>
              Veja seu desempenho neste bloco
            </DialogDescription>
          </DialogHeader>
          
          {lastBlockResult && (
            <div className="space-y-4 py-4">
              <Card className={lastBlockResult.passed ? 'border-success' : 'border-destructive'}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${lastBlockResult.passed ? 'text-success' : 'text-destructive'}`}>
                      {lastBlockResult.percentage.toFixed(0)}%
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {lastBlockResult.correctAnswers} de {lastBlockResult.totalQuestions} acertos
                    </p>
                    <p className={`font-semibold mt-2 ${lastBlockResult.passed ? 'text-success' : 'text-destructive'}`}>
                      {lastBlockResult.passed ? '✓ APROVADO neste bloco' : '✗ REPROVADO neste bloco'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {!lastBlockResult.passed && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Para ser aprovado no simulado, é necessário 70% em todos os blocos.</span>
                </div>
              )}

              {currentBlock < 4 && (
                <p className="text-center text-muted-foreground text-sm">
                  Próximo: <strong>Bloco {currentBlock + 1}</strong> - {BLOCKS[currentBlock]?.name}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={proceedToNextBlock} className="w-full">
              {currentBlock === 4 ? 'Ver Resultado Final' : `Iniciar Bloco ${currentBlock + 1}`}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Sair do Simulado?
            </DialogTitle>
            <DialogDescription>
              Se você sair agora, todo o seu progresso será perdido e você terá que começar novamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Continuar Simulado
            </Button>
            <Button variant="destructive" onClick={onExit}>
              Sair e Perder Progresso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Warning Dialog */}
      <Dialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <Clock className="w-5 h-5" />
              Atenção: 5 minutos restantes!
            </DialogTitle>
            <DialogDescription>
              Você tem apenas 5 minutos para finalizar este bloco. Responda as questões restantes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowTimeWarning(false)}>
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
