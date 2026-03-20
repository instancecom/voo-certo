import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle, BookOpen, Loader2, Target } from 'lucide-react';
import { QuestionAIChat } from './QuestionAIChat';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
 
  // Shuffle on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // For block mode, we usually use all questions if no limit is provided
      setShuffledQuestions(prepareExamQuestions(questions, undefined, questionLimit));
    }, 800);
    return () => clearTimeout(timer);
  }, [questions, questionLimit]);

  if (!shuffledQuestions) {
    return <ExamLoadingScreen />;
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = selectedAnswer === currentQuestion?.shuffledCorrectAnswer;
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;

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
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Calculate results
    let correctCount = 0;
    shuffledQuestions.forEach(q => {
      if (answers[q.id] === q.shuffledCorrectAnswer) {
        correctCount++;
      }
    });

    const percentage = (correctCount / shuffledQuestions.length) * 100;
    const blockResults: BlockResult[] = [{
      blockNumber: 1, // Generic for single block
      totalQuestions: shuffledQuestions.length,
      correctAnswers: correctCount,
      percentage,
      passed: percentage >= 70,
    }];

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
      totalCorrect: correctCount,
      totalQuestions: shuffledQuestions.length,
      overallPassed: percentage >= 70,
      answers: originalAnswers,
      totalTimeSpent,
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-accent/10 flex items-center justify-center shadow-inner">
                 <Target className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                  MODO BLOCO
                </h1>
                <p className="text-sm md:text-xl font-black text-slate-900 truncate max-w-[200px] md:max-w-none tracking-tight">
                  {blockName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500">
                <Target className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Simulado Localizado</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFinishDialog(true)}
                className="h-10 md:h-12 px-4 md:px-6 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest bg-white hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
              >
                <Flag className="w-4 h-4 mr-2" />
                Finalizar
              </Button>
            </div>
          </div>

          <div className="pb-4 px-1">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
               <span>Progresso da Aula</span>
               <span className="text-accent">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-slate-100" />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
              <span className="flex items-center gap-1 uppercase tracking-wider">
                QUESTÃO <span className="text-slate-900">{currentQuestionIndex + 1}</span> / {shuffledQuestions.length}
              </span>
              <span className="flex items-center gap-1 uppercase tracking-wider">
                <span className="text-slate-900">{Object.keys(answers).length}</span> RESPONDIDAS
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
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest border border-accent/10">
                  Questão {currentQuestionIndex + 1}
                </span>
                <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                  {currentQuestion.text}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.shuffledOptions.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectOption = index === currentQuestion.shuffledCorrectAnswer;
                  const optionLetter = String.fromCharCode(65 + index);

                  let optionStyle = 'border-slate-200 bg-white hover:border-accent hover:shadow-lg hover:shadow-accent/5';
                  if (showAnswer) {
                    if (isCorrectOption) {
                      optionStyle = 'border-green-500 bg-green-50 shadow-md shadow-green-500/10';
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle = 'border-red-500 bg-red-50 shadow-md shadow-red-500/10';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-accent bg-accent/5 shadow-lg shadow-accent/10';
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => submitAnswer(currentQuestion.id, index)}
                      disabled={showAnswer}
                      className={`w-full p-5 md:p-6 rounded-2xl border-2 text-left transition-all duration-300 relative group overflow-hidden ${optionStyle} ${showAnswer ? 'cursor-default' : ''}`}
                      whileHover={!showAnswer ? { scale: 1.01 } : {}}
                      whileTap={!showAnswer ? { scale: 0.99 } : {}}
                    >
                      <div className="flex items-center gap-5 relative z-10">
                        <span className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-sm md:text-lg transition-colors ${
                          showAnswer
                            ? isCorrectOption
                              ? 'bg-green-500 text-white'
                              : isSelected
                              ? 'bg-red-500 text-white'
                              : 'bg-slate-100 text-slate-400'
                            : isSelected
                            ? 'bg-accent text-white'
                            : 'bg-slate-50 text-slate-400 group-hover:bg-accent/10 group-hover:text-accent'
                        }`}>
                          {showAnswer && isCorrectOption ? (
                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                          ) : showAnswer && isSelected && !isCorrectOption ? (
                            <XCircle className="w-5 h-5 md:w-6 md:h-6" />
                          ) : (
                            optionLetter
                          )}
                        </span>
                        <span className={`text-sm md:text-lg font-bold leading-snug ${
                           showAnswer && isCorrectOption ? 'text-green-700' : 
                           showAnswer && isSelected && !isCorrectOption ? 'text-red-700' :
                           'text-slate-700'
                        }`}>
                          {option}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation & AI Chat */}
              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 pt-6"
                  >
                    <div className="p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-accent" />
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest text-slate-900">Explicação do Especialista</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium">
                        {currentQuestion.explanation || "Esta questão faz parte do banco de dados oficial. A resposta correta foi validada por nossos especialistas."}
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
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] z-50">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="h-12 md:h-14 px-4 md:px-8 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest border-2 hover:bg-slate-50 transition-all shrink-0"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Questão Anterior</span>
              <span className="xs:hidden">Anterior</span>
            </Button>

            <div className="flex-1 flex justify-center">
              <div className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs md:text-sm shadow-xl shadow-slate-200">
                {currentQuestionIndex + 1} <span className="opacity-40 font-normal mx-1">/</span> {shuffledQuestions.length}
              </div>
            </div>

            <Button 
              variant={currentQuestionIndex === shuffledQuestions.length - 1 ? "hero" : "default"}
              size="lg" 
              onClick={nextQuestion} 
              disabled={!showAnswer && !isAnswered}
              className="h-12 md:h-14 px-4 md:px-10 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl shadow-primary/20 transition-all shrink-0"
            >
              <span className="hidden xs:inline mr-2">
                {currentQuestionIndex === shuffledQuestions.length - 1 ? 'Finalizar' : 'Próxima Questão'}
              </span>
              <span className="xs:hidden mr-1">
                {currentQuestionIndex === shuffledQuestions.length - 1 ? 'Finalizar' : 'Próxima'}
              </span>
              {currentQuestionIndex === shuffledQuestions.length - 1 ? <Flag className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </footer>

      {/* Finish Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
               <Target className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black text-center">Concluir Simulado?</DialogTitle>
            <DialogDescription className="text-center pt-2">
              {Object.keys(answers).length < shuffledQuestions.length ? (
                <>
                  Você ainda tem{' '}
                  <span className="font-black text-primary">
                    {shuffledQuestions.length - Object.keys(answers).length}
                  </span>{' '}
                  questões sem resposta. Deseja finalizar mesmo assim?
                </>
              ) : (
                'Parabéns! Você respondeu todas as questões deste bloco.'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowFinishDialog(false)} className="rounded-xl h-12 flex-1 font-bold">
              Continuar
            </Button>
            <Button onClick={handleFinish} className="rounded-xl h-12 flex-1 font-black bg-primary">
              Ver Meu Resultado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
