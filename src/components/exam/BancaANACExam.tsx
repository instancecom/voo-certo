import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, ChevronLeft, Flag, AlertTriangle, Loader2, CheckCircle2, XCircle, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
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

const EXAM_TIME = 120 * 60; // 120 minutes total for Banca ANAC
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
      showTimeWarning={showTimeWarning}
      setShowTimeWarning={setShowTimeWarning}
      showExitDialog={showExitDialog}
      setShowExitDialog={setShowExitDialog}
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
  showTimeWarning, setShowTimeWarning,
  showExitDialog, setShowExitDialog,
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
    // Current total elapsed time since the beginning of the exam
    const currentTotalSpent = EXAM_TIME - timeRemaining;
    // Time spent on THIS block = current total - what was already spent on previous blocks
    const timeSpentOnThisBlock = currentTotalSpent - totalTimeSpent;
    
    setTotalTimeSpent(currentTotalSpent);

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
      timeSpent: timeSpentOnThisBlock,
    };

    
    // Auto-advance or finish
    if (currentBlock >= 4) {
      const allResults = [...blockResults, result];
      const totalCorrect = allResults.reduce((acc: number, r: BlockResult) => acc + r.correctAnswers, 0);
      const overallPassed = allResults.length > 0 && allResults.every((r: BlockResult) => r.passed);

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
        totalTimeSpent: currentTotalSpent,
      });
    } else {
      setBlockResults((prev: BlockResult[]) => [...prev, result]);
      setCurrentBlock((prev: number) => prev + 1);
      setCurrentQuestionIndex(0);
      // No pause, no dialog
      toast.info(`Bloco ${currentBlock} finalizado. Iniciando Bloco ${currentBlock + 1}...`);
    }
  }, [currentBlock, blockQuestions, answers, timeRemaining, blockResults, totalTimeSpent, shuffledQuestions, onFinish]);


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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center p-8 bg-white border border-slate-200 rounded-[5px] shadow-sm max-w-md mx-auto">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-slate-700 font-bold mb-4">Não há questões disponíveis para o Bloco {currentBlock}.</p>
          <Button onClick={onExit} className="rounded-[5px] h-11 px-6 font-bold uppercase text-xs tracking-wider">Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-[5px] bg-accent/10 flex items-center justify-center shadow-inner">
                 <Clipboard className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                  BANCA ANAC
                </h1>
                <p className="text-sm md:text-xl font-black text-slate-900 truncate max-w-[150px] md:max-w-none tracking-tight">
                  Bloco {currentBlock} — {blockInfo?.name}
                </p>
              </div>
            </div>

            {/* Cronômetro Centralizado Premium */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-[5px] border transition-all ${
              isTimeWarning 
                ? 'bg-red-50 border-red-200 text-red-500 animate-pulse' 
                : 'bg-slate-50 border-slate-200 text-slate-700 shadow-inner'
            }`}>
              <Clock className={`w-4 h-4 ${isTimeWarning ? 'text-red-500' : 'text-slate-400'}`} />
              <span className="font-mono font-black text-sm md:text-xl leading-none">
                {formatTime(timeRemaining)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExitDialog(true)}
                className="h-10 md:h-12 px-4 md:px-6 rounded-[5px] font-bold uppercase text-[10px] md:text-xs tracking-widest bg-white hover-red text-slate-600 border-slate-200 transition-all shadow-sm hover:border-red-200 hover:text-red-500"
              >
                <Flag className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          <div className="pb-4 px-1">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
               <span>Progresso do Bloco</span>
               <span className="text-accent">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-slate-100" />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
              <span className="flex items-center gap-1 uppercase tracking-wider">
                QUESTÃO <span className="text-slate-900">{currentQuestionIndex + 1}</span> / {blockQuestions.length}
              </span>
              <span className="flex items-center gap-2 uppercase tracking-wider text-right">
                Bloco <span className="text-slate-900">{currentBlock}</span> de 4
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 md:pt-44 pb-32">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-[5px] bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest border border-accent/10">
                  Questão {currentQuestionIndex + 1}
                </span>
                <h2 className="text-[20px] font-black text-slate-900 leading-tight tracking-tight">
                  {currentQuestion.text}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.shuffledOptions.map((option: string, index: number) => {
                  const isSelected = selectedAnswer === index;
                  const optionLetter = String.fromCharCode(65 + index);

                  let optionStyle = 'border-slate-200 bg-white hover-yellow shadow-sm';
                  if (isSelected) {
                    optionStyle = 'border-accent bg-accent/5 shadow-sm';
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => submitAnswer(currentQuestion.id, index)}
                      className={`w-full p-3 md:p-4 rounded-[5px] border-2 text-left transition-all duration-300 relative group overflow-hidden ${optionStyle}`}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <div className="flex items-center gap-5 relative z-10">
                        <span className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-[5px] flex items-center justify-center font-bold text-sm md:text-lg transition-colors ${
                          isSelected
                            ? 'bg-accent text-white'
                            : 'bg-slate-50 text-slate-400 group-hover:bg-accent/10 group-hover:text-accent'
                        }`}>
                          {optionLetter}
                        </span>
                        <span className={`text-sm md:text-lg font-bold leading-snug ${
                           isSelected ? 'text-slate-900' : 'text-slate-700'
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

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-50">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentQuestionIndex((prev: number) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="h-10 md:h-12 px-6 md:px-10 rounded-[5px] border-slate-300 text-slate-400 font-bold uppercase text-[10px] md:text-xs tracking-widest hover:bg-slate-50 transition-all shrink-0 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>Anterior</span>
            </Button>

            {/* 1-20 Question indicator bubbles (Desktop) */}
            <div className="hidden md:flex flex-1 justify-center gap-1.5 overflow-x-auto px-4 max-w-lg scrollbar-thin">
              {blockQuestions.map((q: ShuffledQuestion, index: number) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = index === currentQuestionIndex;

                let btnClass = 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100 hover:text-slate-600';
                if (isCurrent) {
                  btnClass = 'bg-[#0F172A] text-white border-2 border-[#0F172A] shadow-md';
                } else if (isAnswered) {
                  btnClass = 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    className={`w-8 h-8 rounded-[5px] text-xs font-black flex items-center justify-center transition-all shrink-0 ${btnClass}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Mobile Question indicator */}
            <div className="md:hidden flex-1 flex justify-center">
              <div className="px-6 py-2.5 rounded-[5px] bg-[#0F172A] text-white font-bold text-xs md:text-sm shadow-xl shadow-slate-200 ring-4 ring-white">
                {currentQuestionIndex + 1} <span className="opacity-40 font-normal mx-1">/</span> {blockQuestions.length}
              </div>
            </div>

            {currentQuestionIndex === blockQuestions.length - 1 ? (
              <Button 
                size="lg" 
                onClick={finishCurrentBlock}
                className="h-10 md:h-12 px-6 md:px-10 rounded-[5px] font-bold uppercase text-[10px] md:text-xs tracking-widest transition-all shrink-0 shadow-lg bg-accent hover:bg-accent/90 text-slate-900"
              >
                <span>
                  {currentBlock === 4 ? 'Finalizar Simulado' : 'Finalizar Bloco'}
                </span>
                <Flag className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                size="lg" 
                onClick={nextQuestion}
                className="h-10 md:h-12 px-6 md:px-10 rounded-[5px] font-bold uppercase text-[10px] md:text-xs tracking-widest transition-all shrink-0 shadow-lg bg-[#8E9AAF] hover:bg-[#7F8C9F] text-white"
              >
                <span>Próxima</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="rounded-[5px] border-none shadow-2xl p-8">
          <DialogHeader>
            <div className="w-16 h-16 rounded-[5px] bg-red-50 flex items-center justify-center mb-6 mx-auto">
               <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-red-600">Sair do Simulado?</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Se você sair agora, todo o seu progresso será perdido e você terá que começar novamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowExitDialog(false)} className="rounded-[5px] h-12 flex-1 font-bold">
              Continuar Simulado
            </Button>
            <Button onClick={onExit} className="rounded-[5px] h-12 flex-1 font-black bg-red-600 text-white hover:bg-red-700">
              Sair e Perder Progresso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Warning Dialog */}
      <Dialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <DialogContent className="rounded-[5px] border-none shadow-2xl p-8">
          <DialogHeader>
            <div className="w-16 h-16 rounded-[5px] bg-amber-50 flex items-center justify-center mb-6 mx-auto">
               <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-amber-600">Atenção: 5 minutos restantes!</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Você tem apenas 5 minutos para finalizar este bloco. Responda as questões restantes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-center">
            <Button onClick={() => setShowTimeWarning(false)} className="rounded-[5px] h-12 w-full font-black bg-amber-500 hover:bg-amber-600 text-slate-900">
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
