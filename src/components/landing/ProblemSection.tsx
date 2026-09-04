import { motion } from 'framer-motion';
import { XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const PAIN_POINTS = [
  {
    title: 'Estudar muito, mas errar na banca',
    desc: 'Questões da ANAC têm pegadinhas técnicas específicas. Quem não treina no formato real da prova chega no dia sem saber o que esperar.',
  },
  {
    title: 'Não saber onde concentrar o esforço',
    desc: 'Sem um diagnóstico real de desempenho, você estuda as matérias que já domina e deixa de lado exatamente os pontos que derrubam na banca.',
  },
  {
    title: 'Passar na prova e travar no mercado',
    desc: 'Aprovação na ANAC é apenas a primeira etapa. Sem um currículo no padrão da aviação e orientação de carreira, a porta fica fechada mesmo com a licença em mãos.',
  },
];

export const ProblemSection = () => {
  const { user } = useAuth();

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">

          {/* Left — Headline and CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">
              O problema é real
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-6 leading-tight">
              A maioria falha na ANAC{' '}
              <span className="text-accent">não por falta de esforço</span>,
              mas por falta de método.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed mb-8">
              Estudar com materiais genéricos, sem feedback em tempo real e sem saber
              onde você realmente está errando é a receita para reprovar — mesmo sendo
              dedicado.
            </p>

            <Button
              variant="hero"
              size="lg"
              asChild
              className="rounded-[5px] hover-yellow font-bold"
            >
              <Link to={user ? '/simulados' : '/auth?mode=signup'} className="flex items-center gap-2">
                Quero estudar do jeito certo <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Right — Pain points list */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-5"
          >
            {PAIN_POINTS.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                className="flex gap-4 bg-card border border-border/60 rounded-[5px] p-5 hover:border-accent/30 transition-colors duration-300"
              >
                <div className="shrink-0 mt-0.5">
                  <XCircle className="w-5 h-5 text-destructive/70" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{point.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-normal">{point.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};
