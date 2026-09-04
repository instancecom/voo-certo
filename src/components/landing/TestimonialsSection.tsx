import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: 'O acompanhamento do Mike e as explicações por IA mudaram completamente meu rendimento. Fui aprovada de primeira na banca de Comissária e já estou com processo seletivo em andamento!',
    name: 'Ana Paula M.',
    role: 'Comissária de Voo · Aprovada ANAC',
    stars: 5,
    initial: 'A',
  },
  {
    quote: 'A plataforma vai muito além de questões. O diagnóstico do Mike me mostrou exatamente onde eu perdia pontos em Navegação e Regulamentos. Cheguei calmo e seguro no dia do exame.',
    name: 'Rafael S.',
    role: 'Piloto Privado (PP-A) · Aprovado ANAC',
    stars: 5,
    initial: 'R',
  },
  {
    quote: 'Estruturei meu currículo com o Mike e o LinkedIn chamou atenção imediata no mercado de aviação executiva. A Voe Certo me acompanhou em todas as etapas.',
    name: 'Camila R.',
    role: 'Mecânica de Manutenção (MMA) · Contratada',
    stars: 5,
    initial: 'C',
  },
];

export const TestimonialsSection = () => {
  const [featured, ...rest] = TESTIMONIALS;

  return (
    <section className="py-20 md:py-28 bg-card/50 border-y border-border relative overflow-hidden" id="depoimentos">
      <div className="container mx-auto px-4 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4 leading-tight">
            Quem transformou o sonho em{' '}
            <span className="text-accent">carreira</span>.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            Histórias de alunos que passaram na ANAC e entraram no mercado aéreo com o suporte da Voe Certo.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

          {/* Featured testimonial — spans 2 cols on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="h-full bg-background border border-border rounded-[5px] p-8 md:p-10 flex flex-col justify-between hover:border-accent/30 transition-colors duration-300 shadow-lg">
              <div>
                <Quote className="w-8 h-8 text-accent/30 mb-6" />
                <p className="text-base sm:text-lg text-foreground/90 leading-relaxed font-normal italic mb-8">
                  "{featured.quote}"
                </p>
              </div>
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <div className="w-12 h-12 rounded-[5px] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-black text-lg shrink-0">
                  {featured.initial}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{featured.name}</h4>
                  <p className="text-xs text-muted-foreground font-medium">{featured.role}</p>
                </div>
                <div className="ml-auto flex">
                  {[...Array(featured.stars)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-accent fill-accent" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Two smaller testimonials stacked */}
          <div className="flex flex-col gap-6">
            {rest.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i + 1) * 0.1, duration: 0.5 }}
                className="flex-1"
              >
                <div className="h-full bg-background border border-border rounded-[5px] p-6 flex flex-col justify-between hover:border-accent/30 transition-colors duration-300 shadow-lg">
                  <div>
                    <div className="flex mb-4">
                      {[...Array(t.stars)].map((_, s) => (
                        <Star key={s} className="w-3.5 h-3.5 text-accent fill-accent" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed font-normal italic">
                      "{t.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                    <div className="w-8 h-8 rounded-[5px] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-black text-sm shrink-0">
                      {t.initial}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{t.name}</h4>
                      <p className="text-[11px] text-muted-foreground font-medium">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
