import { motion } from 'framer-motion';
import { CheckCircle2, Clock, BarChart3, FileText, ShieldCheck, Linkedin } from 'lucide-react';
import type { ReactElement } from 'react';

const FEATURES = [
  {
    eyebrow: 'Simulados',
    title: 'Treine no padrão exato da banca ANAC.',
    description:
      'Mais de 2.000 questões organizadas por área de conhecimento — Piloto Privado, Comissário de Voo, Mecânico de Manutenção. Três modos de estudo: Banca (cronometrado, replica o exame real), Livre (sem pressão de tempo) e Bloco (foco em matérias específicas).',
    highlights: [
      'Questões rigorosamente baseadas nos editais públicos ANAC',
      'Simulações com tempo real de prova no Modo Banca',
      'Filtro por disciplina e área de conhecimento',
      'Histórico de desempenho por simulado realizado',
    ],
    icon: Clock,
    visual: 'simulado',
    reverse: false,
  },
  {
    eyebrow: 'Diagnóstico IA',
    title: 'Saiba exatamente onde você está errando.',
    description:
      'Após cada questão, o Mike explica alternativa por alternativa com fundamentação técnica nos Regulamentos Brasileiros de Aviação Civil (RBAC). No diagnóstico periódico, ele analisa seu histórico completo e aponta as matérias que mais impactam sua nota.',
    highlights: [
      'Explicação técnica imediata a cada questão respondida',
      'Diagnóstico de desempenho com recomendações estratégicas',
      'Curva de aprendizado em tempo real',
      'Previsão estatística de prontidão para a banca',
    ],
    icon: BarChart3,
    visual: 'diagnostico',
    reverse: true,
  },
  {
    eyebrow: 'Currículo & Carreira',
    title: 'Da aprovação à primeira vaga no mercado aéreo.',
    description:
      'O Mike conhece o padrão exigido pelas companhias aéreas e cria seu currículo profissional de forma guiada. Além disso, o Guia de Carreira orienta cada etapa da sua trajetória — de piloto a comissário, de mecânico a agente de aeroporto.',
    highlights: [
      'Gerador de currículo no padrão das companhias aéreas',
      'Guia de carreira completo por profissão aeronáutica',
      'Selo de aprovação verificável para o LinkedIn',
      'Orientação para entrevistas e processos seletivos',
    ],
    icon: FileText,
    visual: 'carreira',
    reverse: false,
  },
];

const SimuladoVisual = () => (
  <div className="bg-card border border-border/80 rounded-[5px] shadow-2xl overflow-hidden">
    <div className="bg-card/80 border-b border-border px-4 py-3 flex items-center gap-2">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-accent/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
      </div>
      <span className="text-xs text-muted-foreground font-mono ml-2">Modo Banca · Questão 7/20</span>
      <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
        <Clock className="w-3.5 h-3.5 text-accent" />
        <span>22:14</span>
      </div>
    </div>
    <div className="p-5">
      <p className="text-sm font-semibold text-foreground mb-4 leading-relaxed">
        De acordo com o RBAC 91, qual o teto mínimo legal para operações VFR em espaço aéreo classe G, abaixo de 1.200 ft AGL?
      </p>
      <div className="space-y-2">
        <div className="p-3 text-xs rounded-[5px] border border-border bg-card/50 text-muted-foreground">
          A) 500 ft de visibilidade de voo e teto de 1.000 ft
        </div>
        <div className="p-3 text-xs rounded-[5px] border-2 border-accent bg-accent/10 text-foreground font-bold flex items-center justify-between">
          <span>B) 1 SM de visibilidade e desobstruído de nuvens</span>
          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
        </div>
        <div className="p-3 text-xs rounded-[5px] border border-border bg-card/50 text-muted-foreground">
          C) 3 SM de visibilidade e teto de 500 ft
        </div>
      </div>
      <div className="mt-4 bg-accent/5 border border-accent/20 rounded-[5px] p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <img
            src="/images/avatars/Mike_character.png"
            alt="Mike"
            className="w-5 h-5 rounded-[5px] object-cover border border-accent/30"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
          <span className="text-xs font-bold text-accent">Mike:</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Exato! Em espaço G abaixo de 1.200 ft AGL, o RBAC 91 exige 1 SM de visibilidade e desobstruído de nuvens. Essa é uma pegadinha clássica da banca. ✅
        </p>
      </div>
    </div>
  </div>
);

const DiagnosticoVisual = () => (
  <div className="bg-card border border-border/80 rounded-[5px] shadow-2xl overflow-hidden">
    <div className="bg-card/80 border-b border-border px-4 py-3 flex items-center gap-2">
      <img
        src="/images/avatars/mike_character_analytic.png"
        alt="Mike Analítico"
        className="w-6 h-6 rounded-[5px] object-cover border border-accent/30"
        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
      />
      <span className="text-xs font-bold text-foreground">Diagnóstico com Mike</span>
      <div className="ml-auto text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-[5px]">Prontidão: 82%</div>
    </div>
    <div className="p-5 space-y-4">
      <div>
        <div className="flex justify-between text-xs font-medium mb-1.5">
          <span className="text-foreground">Regulamentação (RBAC)</span>
          <span className="text-accent font-bold">91%</span>
        </div>
        <div className="w-full bg-muted/40 h-1.5 rounded-[2px] overflow-hidden">
          <div className="bg-accent h-full w-[91%]" />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs font-medium mb-1.5">
          <span className="text-foreground">Meteorologia</span>
          <span className="text-accent font-bold">78%</span>
        </div>
        <div className="w-full bg-muted/40 h-1.5 rounded-[2px] overflow-hidden">
          <div className="bg-accent h-full w-[78%]" />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs font-medium mb-1.5">
          <span className="text-foreground">Navegação Aérea</span>
          <span className="text-destructive/80 font-bold">54%</span>
        </div>
        <div className="w-full bg-muted/40 h-1.5 rounded-[2px] overflow-hidden">
          <div className="bg-destructive/60 h-full w-[54%]" />
        </div>
      </div>
      <div className="bg-accent/5 border border-accent/20 rounded-[5px] p-3 mt-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-bold text-accent">Recomendação do Mike:</span> Concentre os próximos 3 dias em Navegação Aérea — especialmente cálculo de combustível e alcance. Você está a 18% do corte mínimo nessa matéria.
        </p>
      </div>
    </div>
  </div>
);

const CarreiraVisual = () => (
  <div className="bg-card border border-border/80 rounded-[5px] shadow-2xl overflow-hidden">
    <div className="bg-card/80 border-b border-border px-4 py-3 flex items-center gap-2">
      <img
        src="/images/avatars/mike_character_curiculum.png"
        alt="Mike Currículo"
        className="w-6 h-6 rounded-[5px] object-cover border border-accent/30"
        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
      />
      <span className="text-xs font-bold text-foreground">Currículo com Mike</span>
      <div className="ml-auto text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-[5px]">Gerado ✓</div>
    </div>
    <div className="p-5 space-y-3">
      <div className="border border-border/60 rounded-[5px] p-3 bg-background">
        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Candidato</p>
        <p className="text-sm font-bold text-foreground">Rafael S. — Piloto Privado (PP-A)</p>
      </div>
      <div className="border border-border/60 rounded-[5px] p-3 bg-background">
        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Habilitações</p>
        <p className="text-xs text-foreground">PP-A · Aprovado ANAC 2026 · 120h de voo</p>
      </div>
      <div className="border border-accent/30 rounded-[5px] p-3 bg-accent/5 flex items-center gap-3">
        <Linkedin className="w-5 h-5 text-[#0A66C2]" />
        <div>
          <p className="text-xs font-bold text-foreground">Selo Aprovado ANAC</p>
          <p className="text-[10px] text-muted-foreground">Credencial verificável · Publicado no LinkedIn</p>
        </div>
        <ShieldCheck className="w-4 h-4 text-success ml-auto" />
      </div>
    </div>
  </div>
);

const VISUALS: Record<string, ReactElement> = {
  simulado: <SimuladoVisual />,
  diagnostico: <DiagnosticoVisual />,
  carreira: <CarreiraVisual />,
};

export const FeaturesSection = () => {
  return (
    <section className="py-4 relative overflow-hidden" id="funcionalidades">
      {FEATURES.map((feature, i) => {
        const Icon = feature.icon;
        const isReverse = feature.reverse;

        return (
          <div
            key={i}
            className={`py-20 md:py-28 ${i % 2 === 0 ? 'bg-card/40 border-y border-border' : 'bg-background'}`}
          >
            <div className="container mx-auto px-4">
              <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto ${isReverse ? 'lg:flex-row-reverse' : ''}`}>

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, x: isReverse ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={isReverse ? 'lg:order-2' : ''}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-[5px] bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-accent">
                      {feature.eyebrow}
                    </p>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight mb-5 leading-tight">
                    {feature.title}
                  </h2>

                  <p className="text-base text-muted-foreground font-normal leading-relaxed mb-7">
                    {feature.description}
                  </p>

                  <ul className="space-y-3">
                    {feature.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-foreground/85 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Visual */}
                <motion.div
                  initial={{ opacity: 0, x: isReverse ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className={isReverse ? 'lg:order-1' : ''}
                >
                  {VISUALS[feature.visual]}
                </motion.div>

              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};
