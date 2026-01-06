import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { BarChart3, Clock, Target, TrendingUp, Award, Calendar, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useExam } from '@/contexts/ExamContext';
import { useAuth } from '@/contexts/AuthContext';
import { categories } from '@/data/mockData';

export default function ProgressPage() {
  const { examResults, exams } = useExam();
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center p-8 rounded-2xl bg-card border border-border">
              <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground mb-6">
                Faça login para ver seu progresso e histórico de simulados.
              </p>
              <Button asChild>
                <Link to="/auth">Fazer Login</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const userResults = examResults;

  // Calculate stats
  const totalExams = userResults.length;
  const averageScore = totalExams
    ? Math.round(userResults.reduce((acc, r) => acc + r.score, 0) / totalExams)
    : 0;
  const totalTime = userResults.reduce((acc, r) => acc + r.timeSpent, 0);

  // Group results by subcategory
  const resultsByCategory = userResults.reduce((acc, result) => {
    const exam = exams.find((e) => e.id === result.examId);
    if (!exam) return acc;

    if (!acc[exam.subcategory]) {
      acc[exam.subcategory] = [];
    }
    acc[exam.subcategory].push(result);
    return acc;
  }, {} as Record<string, typeof userResults>);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const anacCategory = categories.find((c) => c.id === 'anac');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meu Progresso
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Acompanhe sua evolução e identifique áreas que precisam de mais estudo.
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Média Geral</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{averageScore}%</div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Award className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">Simulados</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{totalExams}</div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Clock className="w-5 h-5 text-success" />
                </div>
                <span className="text-sm text-muted-foreground">Tempo Total</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{formatTime(totalTime)}</div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <span className="text-sm text-muted-foreground">Evolução</span>
              </div>
              <div className="text-3xl font-bold text-success">+12%</div>
            </div>
          </motion.div>

          {/* Category Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-xl font-bold text-foreground mb-6">Progresso por Categoria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anacCategory?.subcategories.map((sub) => {
                const categoryResults = resultsByCategory[sub.id] || [];
                const categoryAvg = categoryResults.length
                  ? Math.round(
                      categoryResults.reduce((acc, r) => acc + r.score, 0) / categoryResults.length
                    )
                  : 0;

                return (
                  <div
                    key={sub.id}
                    className="p-6 rounded-2xl bg-card border border-border"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">{sub.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {categoryResults.length} simulados
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Média de acertos</span>
                        <span className="font-medium text-foreground">{categoryAvg}%</span>
                      </div>
                      <Progress value={categoryAvg} className="h-2" />
                    </div>
                    <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
                      <Link to={`/simulados/anac/${sub.slug}`}>
                        Praticar mais
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-foreground mb-6">Histórico de Simulados</h2>
            {userResults.length === 0 ? (
              <div className="p-12 rounded-2xl bg-muted text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Você ainda não fez nenhum simulado.
                </p>
                <Button asChild>
                  <Link to="/simulados">
                    Começar Agora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userResults.map((result) => {
                  const exam = exams.find((e) => e.id === result.examId);
                  if (!exam) return null;

                  return (
                    <div
                      key={result.id}
                      className="p-4 rounded-xl bg-card border border-border hover:border-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{exam.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(result.completedAt).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(result.timeSpent)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${
                              result.score >= 80
                                ? 'text-success'
                                : result.score >= 60
                                ? 'text-warning'
                                : 'text-destructive'
                            }`}
                          >
                            {result.score}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {result.correctAnswers}/{result.totalQuestions} acertos
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-4" asChild>
                          <Link to={`/resultado/${result.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
