import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, BarChart3, ArrowRight, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExam } from '@/contexts/ExamContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState } from 'react';

export default function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const { examResults, exams, questions } = useExam();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const result = examResults.find((r) => r.id === resultId);
  const exam = result ? exams.find((e) => e.id === result.examId) : null;

  if (!result || !exam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Resultado não encontrado</h2>
          <Button asChild>
            <Link to="/simulados">Voltar aos Simulados</Link>
          </Button>
        </div>
      </div>
    );
  }

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excelente! Você está pronto!';
    if (score >= 80) return 'Muito bem! Continue praticando!';
    if (score >= 60) return 'Bom progresso. Revise os erros.';
    return 'Precisa estudar mais. Não desista!';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Result Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-card border border-border mb-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Resultado do Simulado
              </h1>
              <p className="text-muted-foreground">{exam.title}</p>
            </div>

            {/* Score Circle */}
            <div className="flex justify-center mb-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className={getScoreColor(result.score)}
                    initial={{ strokeDasharray: '0 440' }}
                    animate={{ strokeDasharray: `${(result.score / 100) * 440} 440` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className={`text-center text-lg font-medium ${getScoreColor(result.score)} mb-8`}>
              {getScoreMessage(result.score)}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-success/10 text-center">
                <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-success">{result.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Acertos</div>
              </div>
              <div className="p-4 rounded-xl bg-destructive/10 text-center">
                <XCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
                <div className="text-2xl font-bold text-destructive">
                  {result.totalQuestions - result.correctAnswers}
                </div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </div>
              <div className="p-4 rounded-xl bg-primary/10 text-center">
                <BarChart3 className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{result.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Questões</div>
              </div>
              <div className="p-4 rounded-xl bg-accent/10 text-center">
                <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-accent">{formatTime(result.timeSpent)}</div>
                <div className="text-sm text-muted-foreground">Tempo</div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button variant="default" className="flex-1" asChild>
              <Link to={`/simulado/${exam.id}`}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Refazer Simulado
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/simulados">
                <ArrowRight className="w-4 h-4 mr-2" />
                Outros Simulados
              </Link>
            </Button>
            <Button variant="ghost" className="flex-1" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Início
              </Link>
            </Button>
          </div>

          {/* Detailed Answers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-foreground mb-4">Gabarito Comentado</h2>
            <div className="space-y-4">
              {result.answers.map((answer, index) => {
                const question = questions.find((q) => q.id === answer.questionId);
                if (!question) return null;

                const isExpanded = expandedQuestions.has(answer.questionId);

                return (
                  <div
                    key={answer.questionId}
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      answer.isCorrect
                        ? 'border-success/30 bg-success/5'
                        : 'border-destructive/30 bg-destructive/5'
                    }`}
                  >
                    <div
                      className="flex items-start gap-4 cursor-pointer"
                      onClick={() => toggleQuestion(answer.questionId)}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          answer.isCorrect ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
                        }`}
                      >
                        {answer.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Questão {index + 1}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-foreground font-medium mt-1">{question.text}</p>
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 ml-12 space-y-3"
                      >
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => {
                            const isCorrect = optIndex === question.correctAnswer;
                            const isSelected = optIndex === answer.selectedAnswer;
                            const optionLetter = String.fromCharCode(65 + optIndex);

                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg text-sm ${
                                  isCorrect
                                    ? 'bg-success/20 text-success border border-success/30'
                                    : isSelected && !isCorrect
                                    ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                <span className="font-semibold mr-2">{optionLetter})</span>
                                {option}
                                {isCorrect && <span className="ml-2 text-xs">(Correta)</span>}
                                {isSelected && !isCorrect && <span className="ml-2 text-xs">(Sua resposta)</span>}
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-sm font-medium text-primary mb-1">Explicação:</p>
                          <p className="text-sm text-muted-foreground">{question.explanation}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
