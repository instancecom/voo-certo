import { motion } from 'framer-motion';
import { Clock, BookOpen, CheckCircle2, Timer, Shuffle, Target, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export type ExamMode = 'banca_anac' | 'livre';

interface ExamModeSelectorProps {
  onSelectMode: (mode: ExamMode, selectedBlock?: number) => void;
  onBack: () => void;
}

const BLOCKS = [
  { id: 1, name: 'Regulamentação', icon: '📋', description: '20 questões sobre normas e legislação aeronáutica' },
  { id: 2, name: 'Segurança', icon: '🛡️', description: '20 questões sobre procedimentos de segurança' },
  { id: 3, name: 'Conhecimentos Técnicos', icon: '⚙️', description: '20 questões sobre aspectos técnicos da aviação' },
  { id: 4, name: 'CRM/Fatores Humanos', icon: '👥', description: '20 questões sobre gestão de recursos e fatores humanos' },
];

export function ExamModeSelector({ onSelectMode, onBack }: ExamModeSelectorProps) {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Escolha seu Modo de Treino
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Simulados projetados com base nos padrões reais da banca ANAC.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Modo Banca ANAC */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-2 border-primary/10 hover-yellow transition-colors cursor-pointer group rounded-[5px] overflow-hidden shadow-none"
                  onClick={() => onSelectMode('banca_anac')}>
              <CardHeader className="pb-4 bg-muted/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-[5px] bg-primary/10 text-primary">
                    <Timer className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Modo Banca ANAC</CardTitle>
                </div>
                <CardDescription className="text-sm font-medium">
                  Modelo baseado na estrutura de avaliação da ANAC.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground"><strong>80 questões</strong> em 4 blocos de 20</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground"><strong>30 minutos</strong> por bloco</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="text-muted-foreground italic">Restrição de retorno entre blocos</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-muted-foreground">Nota de corte: <strong>70% por bloco</strong></span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-2">
                    {BLOCKS.map((block) => (
                      <div key={block.id} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-primary/5 rounded-[5px] px-2 py-2">
                        <span>{block.icon}</span>
                        <span className="truncate">{block.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full mt-4 rounded-[5px] font-bold group-hover:bg-primary transition-all" variant="default">
                  Iniciar Simulado Completo
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Modo Livre */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-2 border-accent/10 hover-yellow transition-colors rounded-[5px] overflow-hidden shadow-none">
              <CardHeader className="pb-4 bg-muted/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-[5px] bg-accent/10 text-accent">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Modo de Estudo</CardTitle>
                </div>
                <CardDescription className="text-sm font-medium">
                  Foco em aprendizado e revisão imediata.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Shuffle className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">Escolha blocos isolados ou treine tudo</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground opacity-50" />
                    <span className="text-muted-foreground italic">Sem pressão de tempo</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">Gabarito comentado na hora</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Selecione o Bloco:</p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left rounded-[5px] h-10 font-bold border-accent/20 hover:bg-accent/10"
                      onClick={() => onSelectMode('livre')}
                    >
                      <span className="mr-2">🚀</span>
                      Todos os Blocos (80 Qs)
                    </Button>
                    {BLOCKS.map((block) => (
                      <Button 
                        key={block.id}
                        variant="ghost" 
                        className="w-full justify-start text-left text-xs rounded-[5px] h-9 hover:bg-accent/5"
                        onClick={() => onSelectMode('livre', block.id)}
                      >
                        <span className="mr-2">{block.icon}</span>
                        Bloco {block.id}: {block.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="mt-8 text-center p-6 bg-muted/30 rounded-[5px] border border-dashed"
        >
           <p className="text-xs text-muted-foreground font-medium max-w-2xl mx-auto italic leading-relaxed">
             Aviso Legal: Os simulados e conteúdos disponíveis nesta plataforma são desenvolvidos com base nos padrões e histórico de provas da Agência Nacional de Aviação Civil (ANAC), visando oferecer a experiência mais próxima possível do ambiente de avaliação real. Não possuímos vínculo oficial com a ANAC.
           </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button variant="ghost" onClick={onBack} className="rounded-[5px] text-muted-foreground hover:text-primary">
            ← Voltar para Painel
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export { BLOCKS };
