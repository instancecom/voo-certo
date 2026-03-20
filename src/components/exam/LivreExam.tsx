import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle, BookOpen, Loader2 } from 'lucide-react';
import { QuestionAIChat } from './QuestionAIChat';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
 
  // Shuffle on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShuffledQuestions(prepareExamQuestions(questions, selectedBlock, questionLimit));
    }, 800);
    return () => clearTimeout(timer);
  }, [questions, selectedBlock, questionLimit]);

  if (!shuffledQuestions) {
    return <ExamLoadingScreen />;
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = selectedAnswer === currentQuestion?.shuffledCorrectAnswer;
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
  const blockInfo = selectedBlock ? BLOCKS.find(b => b.id === selectedBlock) : null;

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
    }
  };

  const prevQuestion = () => {
    setShowAnswer(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    const blockResults: BlockResult[] = [];
    const blocksToCalculate = selectedBlock ? [selectedBlock] : [1, 2, 3, 4];

    blocksToCalculate.forEach(blockNum => {
      const blockQs = shuffledQuestions.filter(q => q.block_number === blockNum);
      if (blockQs.length === 0) return;

      let correctCount = 0;
      blockQs.forEach(q => {
        if (answers[q.id] === q.shuffledCorrectAnswer) {
          correctCount++;
        }
      });

      const percentage = (correctCount / blockQs.length) * 100;
      blockResults.push({
        blockNumber: blockNum,
        totalQuestions: blockQs.length,
        correctAnswers: correctCount,
        percentage,
        passed: percentage >= 70,
      });
    });

    const totalCorrect = blockResults.reduce((acc, r) => acc + r.correctAnswers, 0);
    const totalQuestions = blockResults.reduce((acc, r) => acc + r.totalQuestions, 0);
    const overallPassed = blockResults.every(r => r.passed);

    // Convert answers back to original indices for storage
    const originalAnswers: Record<string, number> = {};
    Object.entries(answers).forEach(([qId, shuffledIdx]) => {
      const q = shuffledQuestions.find(sq => sq.id === qId);
      if (q) {
        originalAnswers[qId] = q.optionMap[shuffledIdx];
      }
    });

    onFinish({
      blockResults,
      totalCorrect,
      totalQuestions,
      overallPassed,
      answers: originalAnswers,
    });
  };

  if (!currentQuestion || shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando questões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-accent shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-[10px] md:text-sm font-bold text-foreground leading-tight truncate">
                    {selectedBlock ? `BLOCO ${selectedBlock}` : 'MODO LIVRE'}
                  </h1>
                  <p className="text-[11px] md:text-xs text-muted-foreground truncate max-w-[150px] md:max-w-none">
                    {selectedBlock ? blockInfo?.name : 'Todos os Blocos'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="flex items-center gap-1.5 px-2 md:px-4 py-1.5 rounded-full bg-accent/10 text-accent">
                <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="text-[10px] md:text-sm font-bold whitespace-nowrap hidden xs:inline">
                  ILIMITADO
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFinishDialog(true)}
                className="h-8 md:h-9 px-2 md:px-4 rounded-full text-[10px] md:text-sm border-border hover:bg-muted"
              >
                <Flag className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Finalizar
              </Button>
            </div>
          </div>

          <div className="pb-3 px-1">
            <Progress value={progress} className="h-1 bg-muted" />
            <div className="flex justify-between text-[10px] md:text-xs font-medium text-muted-foreground mt-1.5">
              <span className="flex items-center gap-1">
                QUESTÃO <span className="text-foreground">{currentQuestionIndex + 1}</span> / {shuffledQuestions.length}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-foreground">{Object.keys(answers).length}</span> RESPONDIDAS
              </span>
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
              {currentQuestion.block_number && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-lg">{BLOCKS[currentQuestion.block_number - 1]?.icon}</span>
                  <span className="text-xs text-muted-foreground">
                    Bloco {currentQuestion.block_number}: {BLOCKS[currentQuestion.block_number - 1]?.name}
                  </span>
                </div>
              )}

              <div className="mb-8">
                <span className="text-sm text-accent font-medium mb-2 block">
                  Questão {currentQuestionIndex + 1}
                </span>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
                  {currentQuestion.text}
                </h2>
              </div>

              <div className="space-y-3">
                {currentQuestion.shuffledOptions.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectOption = index === currentQuestion.shuffledCorrectAnswer;
                  const optionLetter = String.fromCharCode(65 + index);

                  let optionStyle = 'border-border bg-card hover:border-accent/50 hover:bg-accent/5';
                  if (showAnswer) {
                    if (isCorrectOption) {
                      optionStyle = 'border-success bg-success/10';
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle = 'border-destructive bg-destructive/10';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-accent bg-accent/10';
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => submitAnswer(currentQuestion.id, index)}
                      disabled={showAnswer}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${optionStyle} ${showAnswer ? 'cursor-default' : ''}`}
                      whileHover={!showAnswer ? { scale: 1.01 } : {}}
                      whileTap={!showAnswer ? { scale: 0.99 } : {}}
                    >
                      <div className="flex items-start gap-4">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold ${
                          showAnswer
                            ? isCorrectOption
                              ? 'bg-success text-success-foreground'
                              : isSelected
                              ? 'bg-destructive text-destructive-foreground'
                              : 'bg-muted text-muted-foreground'
                            : isSelected
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {showAnswer && isCorrectOption ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : showAnswer && isSelected && !isCorrectOption ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            optionLetter
                          )}
                        </span>
                        <span className="text-foreground">
                          {option}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showAnswer && currentQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-muted border border-border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="font-semibold text-foreground">Explicação</span>
                  </div>
                  <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                </motion.div>
              )}

              {/* Feedback */}
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-success/10 border border-success' : 'bg-destructive/10 border border-destructive'}`}
                >
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <span className="font-semibold text-success">Resposta Correta!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-destructive" />
                        <span className="font-semibold text-destructive">
                          Resposta Incorreta. A correta é: {String.fromCharCode(65 + currentQuestion.shuffledCorrectAnswer)}
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* AI Chat */}
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6"
                >
                  <QuestionAIChat
                    questionId={currentQuestion.id}
                    questionText={currentQuestion.text}
                    options={currentQuestion.options as string[]}
                    correctAnswer={currentQuestion.correct_answer}
                    explanation={currentQuestion.explanation}
                  />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="h-9 md:h-10 px-2 md:px-4 rounded-xl text-xs md:text-sm"
            >
              <ChevronLeft className="w-4 h-4 md:mr-2" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>

            <div className="text-center bg-muted/50 px-3 py-1 rounded-full border border-border/50">
              <span className="text-[11px] md:text-sm font-bold text-muted-foreground whitespace-nowrap">
                {currentQuestionIndex + 1} <span className="opacity-40 font-normal">/ {shuffledQuestions.length}</span>
              </span>
            </div>

            {currentQuestionIndex === shuffledQuestions.length - 1 ? (
              <Button 
                variant="hero" 
                size="sm" 
                onClick={() => setShowFinishDialog(true)}
                className="h-9 md:h-10 px-4 md:px-6 rounded-xl text-xs md:text-sm shadow-md"
              >
                <span className="hidden sm:inline mr-2">Ver Resultado</span>
                <span className="sm:hidden mr-1">Finalizar</span>
                <Flag className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={nextQuestion} 
                disabled={!showAnswer && !isAnswered}
                className="h-9 md:h-10 px-4 md:px-6 rounded-xl text-xs md:text-sm shadow-md"
              >
                <span className="hidden sm:inline mr-2">Próxima</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* Finish Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Simulado?</DialogTitle>
            <DialogDescription>
              {Object.keys(answers).length < shuffledQuestions.length ? (
                <>
                  Você ainda tem{' '}
                  <span className="font-semibold text-warning">
                    {shuffledQuestions.length - Object.keys(answers).length}
                  </span>{' '}
                  questões não respondidas.
                </>
              ) : (
                'Todas as questões foram respondidas!'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
              Continuar
            </Button>
            <Button onClick={handleFinish}>
              Ver Resultado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
