import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, AlertTriangle, Home, RotateCcw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEffect } from 'react';
import { useInsigniaSync } from '@/hooks/useInsigniaSync';
import { BLOCKS } from './ExamModeSelector';

interface BlockResult {
  blockNumber: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  passed: boolean;
  timeSpent?: number;
}

interface ExamResultsProps {
  mode: 'banca_anac' | 'livre' | 'bloco';
  blockName?: string;
  blockResults: BlockResult[];
  totalCorrect: number;
  totalQuestions: number;
  overallPassed: boolean;
  totalTimeSpent?: number;
  onRetry: () => void;
  onHome: () => void;
}

export function ExamResults({
  mode,
  blockName,
  blockResults,
  totalCorrect,
  totalQuestions,
  overallPassed,
  totalTimeSpent,
  onRetry,
  onHome,
}: ExamResultsProps) {
  const { syncBadges } = useInsigniaSync();
  const overallPercentage = (totalCorrect / totalQuestions) * 100;

  // Sync badges on result show
  useEffect(() => {
    syncBadges();
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            overallPassed ? 'bg-success/20' : 'bg-destructive/20'
          }`}>
            {overallPassed ? (
              <Trophy className="w-10 h-10 text-success" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-destructive" />
            )}
          </div>
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
            overallPassed ? 'text-success' : 'text-destructive'
          }`}>
            {overallPassed ? 'Parabéns! Você foi Aprovado!' : 'Não foi dessa vez...'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {mode === 'banca_anac' ? 'Simulado Modo Banca ANAC' : mode === 'bloco' ? `Simulado Modo Bloco - ${blockName || ''}` : 'Simulado Modo Livre'}
          </p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`mb-6 border-2 ${overallPassed ? 'border-success' : 'border-destructive'}`}>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-muted-foreground mb-1">Resultado Geral</p>
                  <div className={`text-5xl md:text-6xl font-bold ${
                    overallPassed ? 'text-success' : 'text-destructive'
                  }`}>
                    {overallPercentage.toFixed(0)}%
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {totalCorrect} de {totalQuestions} acertos
                  </p>
                </div>
                
                <div className="flex-1 w-full max-w-xs space-y-2">
                  <Progress 
                    value={overallPercentage} 
                    className={`h-4 ${overallPassed ? '[&>div]:bg-success' : '[&>div]:bg-destructive'}`}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0%</span>
                    <span className="text-foreground font-medium">Mínimo: 70%</span>
                    <span>100%</span>
                  </div>
                </div>

                {totalTimeSpent && (
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Tempo Total</p>
                    <p className="text-xl font-semibold text-foreground">
                      {formatTime(totalTimeSpent)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Block Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">Resultado por Bloco</h2>
          <div className="grid gap-4">
            {blockResults.map((result, index) => {
              const blockInfo = BLOCKS.find(b => b.id === result.blockNumber);
              
              return (
                <motion.div
                  key={result.blockNumber}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className={`border ${result.passed ? 'border-success/50' : 'border-destructive/50'}`}>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 text-2xl">
                          {mode === 'bloco' ? '📚' : blockInfo?.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-foreground">
                                {mode === 'bloco' ? blockName : `Bloco ${result.blockNumber}: ${blockInfo?.name}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {result.correctAnswers} de {result.totalQuestions} acertos
                                {result.timeSpent && ` • ${formatTime(result.timeSpent)}`}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`text-2xl font-bold ${
                                result.passed ? 'text-success' : 'text-destructive'
                              }`}>
                                {result.percentage.toFixed(0)}%
                              </span>
                              {result.passed ? (
                                <CheckCircle2 className="w-6 h-6 text-success" />
                              ) : (
                                <XCircle className="w-6 h-6 text-destructive" />
                              )}
                            </div>
                          </div>
                          
                          <Progress 
                            value={result.percentage} 
                            className={`h-2 ${result.passed ? '[&>div]:bg-success' : '[&>div]:bg-destructive'}`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Pass/Fail Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className={`${overallPassed ? 'bg-success/5 border-success' : 'bg-destructive/5 border-destructive'}`}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                {overallPassed ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-success" />
                    <div>
                      <p className="font-semibold text-success">Aprovado em todos os blocos!</p>
                      <p className="text-sm text-muted-foreground">
                        Você atingiu o mínimo de 70% em cada bloco. Parabéns pelo esforço!
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-destructive" />
                    <div>
                      <p className="font-semibold text-destructive">
                        Reprovado{mode === 'bloco' ? '' : ` em ${blockResults.filter(r => !r.passed).length} bloco(s)`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        É necessário atingir 70%{mode === 'bloco' ? '' : ' em todos os blocos'} para aprovação. Continue estudando!
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="outline" size="lg" onClick={onHome}>
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
          <Button variant="default" size="lg" onClick={onRetry}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
