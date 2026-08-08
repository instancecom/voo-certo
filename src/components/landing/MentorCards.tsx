import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, BarChart3, FileText, Sparkles, MessageSquare, Bot } from 'lucide-react';

export const MentorCards = () => {
  const mentors = [
    {
      name: 'Prof. Hugo',
      role: 'Mentor Teórico & Resolução ANAC',
      avatar: '/images/avatars/prof_hugo.jpg',
      badge: 'Especialista em Bancas',
      desc: 'Disponível 24/7 para dissecar qualquer questão de simulado. Ele explica a lógica técnica, cita os Regulamentos Brasileiros da Aviação Civil (RBAC) e ensina macetes de memorização.',
      featureTitle: 'O que ele faz por você:',
      features: [
        'Explicação detalhada alternativa por alternativa',
        'Citação e fundamentação técnica de normas ANAC',
        'Tira-dúvidas interativo e imediato no simulado',
      ],
      tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: MessageSquare,
    },
    {
      name: 'Sofia',
      role: 'Mentora de Desempenho & Estratégia',
      avatar: '/images/avatars/sofia.jpg',
      badge: 'Diagnóstico Inteligente',
      desc: 'Analisa seu histórico de acertos e erros em profundidade. Sofia calcula sua probabilidade de aprovação e aponta com precisão cirúrgica em quais matérias você deve focar.',
      featureTitle: 'O que ela faz por você:',
      features: [
        'Diagnóstico personalizado de pontos fracos',
        'Recomendações estratégicas de estudo diário',
        'Previsão estatística de prontidão para a banca',
      ],
      tagColor: 'bg-accent/10 text-accent border-accent/20',
      icon: BarChart3,
    },
    {
      name: 'Lucas',
      role: 'Mentor de Carreira & Currículo Aero',
      avatar: '/images/avatars/lucas.jpg',
      badge: 'Inserção no Mercado',
      desc: 'Especialista em recrutamento e seleção de companhias aéreas. Lucas orienta como estruturar suas horas de voo, qualificações e formata seu currículo no padrão exigido pelo setor.',
      featureTitle: 'O que ele faz por você:',
      features: [
        'Formatação profissional no padrão de companhias',
        'Destaque estratégico para horas e certificados',
        'Dicas práticas para entrevistas e dinâmicas',
      ],
      tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: FileText,
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden" id="mentores">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
        >
          <Badge variant="outline" className="mb-4 text-accent border-accent/30 rounded-[5px] bg-accent/10 font-bold uppercase text-[11px] tracking-wider px-3.5 py-1">
            <Bot className="w-3.5 h-3.5 mr-1.5" /> Mentores Inteligentes
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-5 leading-tight">
            Especialistas dedicados a <span className="text-accent">cada fase da sua jornada</span>.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            Tenha ao seu lado uma equipe de mentores com inteligência artificial para te guiar desde a teoria até a contratação.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {mentors.map((mentor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="h-full"
            >
              <Card className="bg-card border-border rounded-[5px] h-full flex flex-col justify-between p-8 hover:border-accent/40 transition-all duration-300 shadow-xl hover:-translate-y-1.5 group">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-16 h-16 rounded-[5px] object-cover border-2 border-accent/30 shadow-md"
                        onError={(e) => {
                          // Fallback gracefully if needed
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card" title="Online" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                        {mentor.name}
                      </h3>
                      <Badge variant="outline" className={`mt-1 rounded-[5px] font-bold text-[10px] uppercase tracking-tight px-2 py-0.5 ${mentor.tagColor}`}>
                        {mentor.badge}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-accent/90 mb-3 uppercase tracking-wide">
                    {mentor.role}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-normal">
                    {mentor.desc}
                  </p>
                </div>

                <div className="pt-5 border-t border-border/60">
                  <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" /> {mentor.featureTitle}
                  </p>
                  <ul className="space-y-2">
                    {mentor.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground font-medium">
                        <span className="text-accent font-bold mt-0.5">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
