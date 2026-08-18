import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Award, ArrowRight, CheckCircle2, Sparkles, Brain, FileCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const JourneySection = () => {
  const steps = [
    {
      step: '01',
      title: 'Estude com Precisão',
      tag: 'Fase 1 · Domínio Teórico',
      subtitle: 'Simulados fiéis à banca oficial ANAC',
      desc: 'Treine nos modos Banca (cronometrado), Livre e Bloco. Questões atualizadas para Piloto Privado, Comissário de Voo e Mecânico de Manutenção Aeronáutica.',
      icon: BookOpen,
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      highlights: [
        'Mais de 2.000 questões padrão ANAC',
        'Simulações com tempo real de prova',
        'Filtro por matéria e disciplina',
      ],
    },
    {
      step: '02',
      title: 'Evolua com Inteligência',
      tag: 'Fase 2 · Mentoria & Diagnóstico',
      subtitle: 'IA que aprende com o seu desempenho',
      desc: 'Receba diagnósticos personalizados com Mike para identificar pontos cegos e tire dúvidas conceituais 24/7 com o Mike a cada questão resolvida.',
      icon: Brain,
      badgeColor: 'bg-accent/10 text-accent border-accent/20',
      highlights: [
        'Explicação técnica de cada alternativa',
        'Diagnóstico de pontos fracos e fortes',
        'Curva de aprendizado em tempo real',
      ],
    },
    {
      step: '03',
      title: 'Conquiste sua Vaga',
      tag: 'Fase 3 · Mercado & Carreira',
      subtitle: 'Do exame até a contratação profissional',
      desc: 'Crie seu currículo com Mike no padrão exigido pelas grandes companhias aéreas e publique seu Selo de Aprovação verificado diretamente no LinkedIn.',
      icon: Award,
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      highlights: [
        'Gerador de Currículo especializado',
        'Selo oficial de aprovação para LinkedIn',
        'Guia completo de carreira na aviação',
      ],
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-card/60 border-y border-border relative overflow-hidden" id="jornada">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
        >

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-5 leading-tight">
            Não é apenas um simulado.<br className="hidden sm:inline" /> É a sua <span className="text-accent">carreira na aviação</span>.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            Acompanhamos você desde o primeiro dia de estudo até a conquista da sua vaga no mercado aéreo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="h-full"
              >
                <Card className="bg-background border-border/80 rounded-[5px] h-full flex flex-col justify-between p-8 hover:border-accent/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1.5 group">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-[5px] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform duration-300">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-3xl font-black text-muted-foreground/30 group-hover:text-accent/40 transition-colors">
                        {item.step}
                      </span>
                    </div>

                    <Badge variant="outline" className={`mb-3 rounded-[5px] font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 ${item.badgeColor}`}>
                      {item.tag}
                    </Badge>

                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-accent/90 mb-4 uppercase tracking-tight">
                      {item.subtitle}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-normal">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/60">
                    <ul className="space-y-2.5">
                      {item.highlights.map((h, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-xs text-foreground/85 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
