import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquareQuote, CheckCircle2 } from 'lucide-react';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: 'O acompanhamento do Mike e as explicações por IA mudaram completamente meu rendimento. Fui aprovada de primeira na banca de Comissária e já estou com processo seletivo em andamento!',
      name: 'Ana Paula M.',
      role: 'Comissária de Voo · Aprovada ANAC',
      stars: 5,
      highlight: 'Aprovada de primeira',
    },
    {
      quote: 'A plataforma vai muito além de questões. O diagnóstico do Mike me mostrou exatamente onde eu perdia pontos em Navegação e Regulamentos. Cheguei calmo e seguro no dia do exame.',
      name: 'Rafael S.',
      role: 'Piloto Privado (PP-A) · Aprovado ANAC',
      stars: 5,
      highlight: 'Evolução consistente',
    },
    {
      quote: 'Estruturei meu currículo com o Mike e o selo no LinkedIn chamou atenção imediata no mercado de aviação executiva. A Voe Certo me acompanhou em todas as etapas.',
      name: 'Camila R.',
      role: 'Mecânica de Manutenção (MMA) · Contratada',
      stars: 5,
      highlight: 'Contratada no setor',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-card/50 border-y border-border relative overflow-hidden" id="depoimentos">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <Badge variant="outline" className="mb-4 text-accent border-accent/30 rounded-[5px] bg-accent/10 font-bold uppercase text-[11px] tracking-wider px-3.5 py-1">
            <Star className="w-3.5 h-3.5 mr-1.5 fill-accent" /> Histórias de Sucesso
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-5 leading-tight">
            Quem transformou o sonho em <span className="text-accent">carreira</span>.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            Veja como nossos alunos conquistaram a aprovação oficial e aceleraram a entrada no mercado aéreo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="h-full"
            >
              <Card className="bg-background border-border rounded-[5px] h-full flex flex-col justify-between p-8 hover:border-accent/40 transition-all duration-300 shadow-lg hover:-translate-y-1.5 group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex">
                      {[...Array(t.stars)].map((_, s) => (
                        <Star key={s} className="w-4 h-4 text-accent fill-accent" />
                      ))}
                    </div>
                    <Badge variant="secondary" className="rounded-[5px] text-[10px] font-bold uppercase bg-accent/10 text-accent border-0">
                      {t.highlight}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground/90 leading-relaxed mb-6 font-normal italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[5px] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{t.name}</h4>
                    <p className="text-xs text-muted-foreground font-medium">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
