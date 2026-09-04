import { motion } from 'framer-motion';
import { MessageSquare, BarChart3, FileText } from 'lucide-react';

const CAPABILITIES = [
  {
    icon: MessageSquare,
    title: 'Tira-Dúvidas no Simulado',
    desc: 'Explica cada alternativa com fundamentação nos RBACs. Disponível 24/7 a cada questão resolvida.',
  },
  {
    icon: BarChart3,
    title: 'Diagnóstico de Desempenho',
    desc: 'Analisa seu histórico completo, identifica pontos cegos e aponta exatamente onde focar.',
  },
  {
    icon: FileText,
    title: 'Currículo Aeronáutico',
    desc: 'Cria seu currículo no padrão das companhias aéreas de forma guiada e personalizada.',
  },
];

export const MentorCards = () => {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden" id="mentores">
      <div className="container mx-auto px-4 relative z-10">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-5 leading-tight">
            Conheça o <span className="text-accent">Mike</span>,
            <br className="hidden sm:inline" /> seu assistente de IA.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            Um só assistente com três funções essenciais — do primeiro simulado até a sua vaga no mercado aéreo.
          </p>
        </motion.div>

        {/* Main layout: image + capabilities */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-5xl mx-auto">

          {/* Left — Mike character image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full scale-75" />
              <img
                src="/images/avatars/Mike_character.png"
                alt="Mike — Assistente de IA Voe Certo"
                className="relative w-64 sm:w-72 lg:w-80 object-contain drop-shadow-2xl"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
              />
              {/* Online indicator */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-card border border-border rounded-[5px] px-3 py-1.5 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-bold text-foreground">Mike · Online 24/7</span>
              </div>
            </div>
          </motion.div>

          {/* Right — 3 capabilities stacked */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-6"
          >
            {CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-4 p-5 bg-card border border-border/60 rounded-[5px] hover:border-accent/30 transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-[5px] bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">{cap.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-normal">{cap.desc}</p>
                  </div>
                </motion.div>
              );
            })}

            <p className="text-xs text-muted-foreground pl-1 font-normal leading-relaxed">
              "Sou o Mike — tiro suas dúvidas, analiso seu desempenho e monto seu currículo. Com um jeito descomplicado de explicar e energia boa pra não deixar o estudo pesar. Bora decolar? ✈️"
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
