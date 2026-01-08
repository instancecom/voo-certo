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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Escolha o Modo do Simulado
          </h1>
          <p className="text-muted-foreground text-lg">
            Selecione como deseja realizar o simulado ANAC
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Modo Banca ANAC */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectMode('banca_anac')}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Timer className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">Modo Banca ANAC</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Simula o formato oficial do exame ANAC
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Target className="w-4 h-4 text-primary" />
                    <span><strong>80 questões</strong> divididas em 4 blocos de 20</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span><strong>30 minutos</strong> cronometrados por bloco</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span>Não é possível <strong>voltar</strong> para blocos anteriores</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Aprovação: <strong>mínimo 70%</strong> em cada bloco</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">Blocos do simulado:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {BLOCKS.map((block) => (
                      <div key={block.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-2 py-1.5">
                        <span>{block.icon}</span>
                        <span className="truncate">{block.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full mt-4 group-hover:bg-primary" variant="default">
                  Iniciar Modo Banca
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
            <Card className="h-full border-2 border-accent/20 hover:border-accent/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-accent/10 text-accent">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">Modo Livre</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Estude no seu próprio ritmo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Shuffle className="w-4 h-4 text-accent" />
                    <span>Escolha <strong>todos os blocos</strong> ou um específico</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span><strong>Sem cronômetro</strong> - estude no seu tempo</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span>Veja a <strong>resposta correta</strong> imediatamente</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span><strong>Explicação</strong> detalhada após cada questão</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">Escolha um bloco ou todos:</p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left"
                      onClick={() => onSelectMode('livre')}
                    >
                      <span className="mr-2">📚</span>
                      Todos os Blocos (80 questões)
                    </Button>
                    {BLOCKS.map((block) => (
                      <Button 
                        key={block.id}
                        variant="ghost" 
                        className="w-full justify-start text-left text-sm"
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
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Button variant="ghost" onClick={onBack}>
            ← Voltar para Simulados
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export { BLOCKS };
