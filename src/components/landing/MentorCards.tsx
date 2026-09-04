import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, BarChart3, FileText, Sparkles, MessageSquare, Bot, Zap } from 'lucide-react';

export const MentorCards = () => {
  const roles = [
    {
      area: 'Tira-Dúvidas & Simulados',
      badge: 'Especialista em Bancas',
      desc: 'Disponível 24/7 para dissecar qualquer questão do simulado. Mike explica a lógica técnica, cita os Regulamentos Brasileiros da Aviação Civil (RBAC) e ensina macetes de memorização — com uma pitada de bom humor pra não deixar o estudo pesar.',
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
      area: 'Diagnóstico de Desempenho',
      badge: 'Diagnóstico Inteligente',
      desc: 'Mike analisa seu histórico de acertos e erros em profundidade. Ele calcula sua probabilidade de aprovação e aponta com precisão cirúrgica em quais matérias você deve focar — porque estudar muito não é o mesmo que estudar certo.',
      featureTitle: 'O que ele faz por você:',
      features: [
        'Diagnóstico personalizado de pontos fracos',
        'Recomendações estratégicas de estudo diário',
        'Previsão estatística de prontidão para a banca',
      ],
      tagColor: 'bg-accent/10 text-accent border-accent/20',
      icon: BarChart3,
    },
    {
      area: 'Currículo & Carreira Aero',
      badge: 'Inserção no Mercado',
      desc: 'Mike conhece o mercado de perto e formata seu currículo no padrão exigido pelas grandes companhias aéreas. Ele orienta como destacar suas horas de voo, certificações e preparar você para processos seletivos com confiança.',
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

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-5 leading-tight">
            Conheça o <span className="text-accent">Mike</span>, seu parceiro em tudo.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            Um só assistente — bem-humorado, sempre disponível e especialista em cada etapa da sua jornada na aviação.
          </p>
        </motion.div>

        {/* Mike hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-14"
        >
          <Card className="bg-card border-accent/30 rounded-[5px] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="relative mb-5">
              <img
                src="/images/avatars/Mike_character.png"
                alt="Mike - Assistente Voe Certo"
                className="w-28 h-28 rounded-[5px] object-cover border-2 border-accent/40 shadow-lg"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
              />
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-success rounded-full border-2 border-card" title="Online" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-1">Mike</h3>
            <p className="text-xs font-semibold text-accent/90 uppercase tracking-wide mb-3">Assistente Completo • Voe Certo</p>
            <p className="text-sm text-muted-foreground leading-relaxed font-normal">
              "Sou o Mike — tiro suas dúvidas nas questões, analiso seu desempenho e monto o seu currículo. Tudo isso com um jeito descomplicado de explicar e uma energia boa pra não deixar o estudo pesar. Bora decolar? ✈️"
            </p>
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              <Badge className="rounded-[5px] bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-bold uppercase">Tira-Dúvidas</Badge>
              <Badge className="rounded-[5px] bg-accent/10 text-accent border-accent/20 text-[10px] font-bold uppercase">Diagnóstico</Badge>
              <Badge className="rounded-[5px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase">Currículo</Badge>
            </div>
          </Card>
        </motion.div>

        {/* 3 capability cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role, i) => (
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
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-[5px] bg-accent/10 flex items-center justify-center border border-accent/20">
                      <role.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-accent/90 uppercase tracking-wide">{role.area}</p>
                      <Badge variant="outline" className={`mt-0.5 rounded-[5px] font-bold text-[10px] uppercase tracking-tight px-2 py-0.5 ${role.tagColor}`}>
                        {role.badge}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-normal">
                    {role.desc}
                  </p>
                </div>

                <div className="pt-5 border-t border-border/60">
                  <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" /> {role.featureTitle}
                  </p>
                  <ul className="space-y-2">
                    {role.features.map((f, idx) => (
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

