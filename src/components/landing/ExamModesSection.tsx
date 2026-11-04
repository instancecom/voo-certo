import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCheck2, Compass, Layers, ArrowRight, 
  Clock, CheckCircle2, Check
} from 'lucide-react';

type ExamModeId = 'anac' | 'livre' | 'bloco';

interface ExamModeData {
  id: ExamModeId;
  label: string;
  badge: string;
  tagColor: string;
  icon: any;
  title: string;
  description: string;
  highlights: string[];
  mobileTitle: string;
  mobileDescription: string;
  mobileHighlights: string[];
  mockupTag: string;
  mockupQuestion: string;
  mockupOptions: string[];
}

const MODES: Record<ExamModeId, ExamModeData> = {
  anac: {
    id: 'anac',
    label: 'Modo ANAC',
    badge: 'MODO ANAC',
    tagColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    icon: FileCheck2,
    title: 'Modo ANAC',
    description: 'Um simulado no estilo da prova da ANAC, pra você treinar com foco e chegar mais preparado.',
    highlights: [
      '4 blocos seguidos cronometrados',
      'Mesma regra e tempo oficial do exame',
      'Gabarito e nota de corte no final',
    ],
    mobileTitle: 'Treine no estilo da prova',
    mobileDescription: 'Simulados realizados no formato da ANAC, com questões no mesmo padrão e nível de dificuldade da prova oficial.',
    mobileHighlights: [
      'Questões no formato da ANAC',
      'Tempo e número de questões reais',
      'Feedback com desempenho por assunto',
    ],
    mockupTag: 'SIMULADO OFICIAL ANAC',
    mockupQuestion: 'Qual é o principal objetivo do RBAC 135?',
    mockupOptions: [
      'Regular operações de aeronaves de grande porte',
      'Estabelecer regras para aviação geral',
      'Definir os requisitos de formação de pilotos',
      'Regular o transporte aéreo internacional',
    ],
  },
  livre: {
    id: 'livre',
    label: 'Modo Livre',
    badge: 'MODO LIVRE',
    tagColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    icon: Compass,
    title: 'Modo Livre',
    description: 'Treine sem pressão de relógio. Responda no seu ritmo e tire dúvidas imediatas com o Mike.',
    highlights: [
      'Gabarito comentado na hora a cada questão',
      'Sem limite de tempo: estude com calma',
      'Tira-dúvidas inteligente 24/7 com o Mike',
    ],
    mobileTitle: 'Treine sem pressão de tempo',
    mobileDescription: 'Estude no seu ritmo, resolva questões avulsas e tire dúvidas imediatas com o Mike a cada resposta.',
    mobileHighlights: [
      'Gabarito comentado na hora a cada questão',
      'Sem cronômetro: estude no seu ritmo',
      'Tira-dúvidas inteligente 24/7 com o Mike',
    ],
    mockupTag: 'TREINO LIVRE INDIVIDUAL',
    mockupQuestion: 'Em meteorologia aeronáutica, o que caracteriza a formação de nevoeiro de radiação?',
    mockupOptions: [
      'Resfriamento noturno da superfície sob céu claro e vento calmo',
      'Advecção de massa de ar quente sobre superfície gelada',
      'Elevação orográfica de ar úmido em encostas de montanhas',
      'Convecção térmica violenta no período da tarde',
    ],
  },
  bloco: {
    id: 'bloco',
    label: 'Modo Bloco',
    badge: 'MODO BLOCO',
    tagColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    icon: Layers,
    title: 'Modo Bloco',
    description: 'Foque em uma matéria de cada vez para destravar onde você tem mais dificuldade.',
    highlights: [
      'Escolha a disciplina exata que quer treinar',
      'Blocos focados de 20 questões por rodada',
      'Identifique seus pontos cegos rapidamente',
    ],
    mobileTitle: 'Foco total por matéria',
    mobileDescription: 'Treine matérias específicas para destravar seus pontos fracos e dominar os blocos com maior dificuldade.',
    mobileHighlights: [
      'Escolha a matéria exata para treinar',
      'Blocos focados de 20 questões por rodada',
      'Estatísticas detalhadas por disciplina',
    ],
    mockupTag: 'BLOCO ESPECÍFICO DE MATÉRIA',
    mockupQuestion: 'Para o cálculo de autonomia em voo visual VFR diurno, qual a reserva regulamentar mínima?',
    mockupOptions: [
      '30 minutos de voo em regime de cruzeiro',
      '45 minutos de voo em regime de espera',
      '60 minutos para alternativa homologada',
      '20 minutos além do destino previsto',
    ],
  },
};

export function ExamModesSection() {
  const [activeMode, setActiveMode] = useState<ExamModeId>('anac');
  const current = MODES[activeMode];

  return (
    <section 
      id="modos-simulado"
      className="py-12 md:py-20 bg-white dark:bg-[#071328] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── CABEÇALHO DA SEÇÃO ── */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-8 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#071328] dark:text-white tracking-tight leading-tight mb-3 sm:mb-4">
            Escolha seu jeito de treinar.
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-lg mx-auto">
            Cada simulado tem um ritmo diferente. Encontre o seu e bora estudar.
          </p>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            1. VERSÃO MOBILE (EXIBIDA APENAS EM TELAS MENORES: lg:hidden)
            Inspirada com fidelidade total na imagem de referência
           ══════════════════════════════════════════════════════════════ */}
        <div className="block lg:hidden max-w-md mx-auto space-y-4">
          
          {/* Barra de Tabs Arredondada (3 Modos lado a lado) */}
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-[18px] p-1.5 shadow-sm grid grid-cols-3 gap-1">
            {(['anac', 'livre', 'bloco'] as ExamModeId[]).map((modeId) => {
              const item = MODES[modeId];
              const Icon = item.icon;
              const isActive = activeMode === modeId;

              return (
                <button
                  key={modeId}
                  type="button"
                  onClick={() => setActiveMode(modeId)}
                  className={`py-2.5 px-2 rounded-[12px] flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none text-xs font-bold ${
                    isActive
                      ? 'bg-[#0a234e] text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-muted/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Card Branco com o Conteúdo do Modo Ativo */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-card rounded-[24px] border border-slate-200/80 dark:border-border p-5 sm:p-6 shadow-md space-y-5"
            >
              {/* Topo: Ícone + Badge + Título + Descrição */}
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-[14px] bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <current.icon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-black tracking-wider text-amber-500 uppercase block">
                    {current.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#071328] dark:text-white tracking-tight leading-tight">
                    {current.mobileTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed pt-0.5">
                    {current.mobileDescription}
                  </p>
                </div>
              </div>

              {/* Lista de Highlights (Checkmarks redondos azuis) */}
              <div className="space-y-2 pt-1">
                {current.mobileHighlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Mockup do Simulado no Mobile */}
              <div className="pt-2">
                <div className="bg-[#f0f6ff] dark:bg-slate-900/60 border border-blue-100 dark:border-border rounded-[18px] p-3 sm:p-4">
                  
                  {/* Janela do simulado */}
                  <div className="rounded-[12px] overflow-hidden border border-slate-200 dark:border-border shadow-xs">
                    
                    {/* Topbar azul escura */}
                    <div className="bg-[#0a234e] text-white px-3.5 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-[4px] bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                          <svg className="w-3 h-3 fill-amber-400" viewBox="0 0 24 24">
                            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"/>
                          </svg>
                        </div>
                        <span className="text-xs font-black tracking-tight text-white">Voe Certo</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-300 block leading-none mb-1">12 de 40</span>
                          <div className="w-16 bg-slate-700 h-1 rounded-full overflow-hidden">
                            <div className="w-[30%] bg-blue-500 h-full rounded-full" />
                          </div>
                        </div>
                        <div className="w-px h-5 bg-slate-700" />
                      </div>
                    </div>

                    {/* Corpo da questão */}
                    <div className="bg-white dark:bg-card p-3.5 space-y-3">
                      <p className="text-xs font-bold text-[#071328] dark:text-white leading-snug">
                        {current.mockupQuestion}
                      </p>

                      {/* Alternativas estilo Radio do print */}
                      <div className="space-y-1.5">
                        {current.mockupOptions.map((opt, oIdx) => {
                          const isSelected = oIdx === 0;

                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-[8px] flex items-center gap-2.5 text-xs transition-colors border ${
                                isSelected
                                  ? 'bg-[#ebf3ff] dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-100 font-semibold'
                                  : 'bg-white dark:bg-card border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {/* Círculo de rádio */}
                              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border ${
                                isSelected 
                                  ? 'border-blue-600 bg-white' 
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}>
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                                )}
                              </div>

                              <span className="leading-tight truncate">{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </motion.div>
          </AnimatePresence>

        </div>

        {/* ══════════════════════════════════════════════════════════════
            2. VERSÃO DESKTOP (EXIBIDA APENAS EM TELAS GRANDES: hidden lg:grid)
            Permanece exatamente como estava originalmente
           ══════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          
          {/* COLUNA ESQUERDA: 3 BOTÕES SELETORES (4 colunas) */}
          <div className="lg:col-span-4 flex flex-col gap-3.5">
            {(['anac', 'livre', 'bloco'] as ExamModeId[]).map((modeId) => {
              const item = MODES[modeId];
              const Icon = item.icon;
              const isActive = activeMode === modeId;

              return (
                <button
                  key={modeId}
                  type="button"
                  onClick={() => setActiveMode(modeId)}
                  className={`w-full text-left p-4 sm:p-5 rounded-[5px] transition-all flex items-center justify-between gap-4 border cursor-pointer select-none group relative overflow-hidden ${
                    isActive
                      ? 'bg-[#0a234e] text-white border-[#0a234e] shadow-xl shadow-[#0a234e]/15'
                      : 'bg-white dark:bg-card text-slate-800 dark:text-slate-200 border-slate-200/90 dark:border-border hover:border-blue-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-muted/50 shadow-xs'
                  }`}
                >
                  {/* Faixa amarela decorativa à esquerda quando ativo */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-l-[5px]" />
                  )}

                  <div className="flex items-center gap-3.5 min-w-0 pl-1">
                    <div className={`w-10 h-10 rounded-[5px] flex items-center justify-center shrink-0 transition-colors ${
                      isActive 
                        ? 'bg-white/10 text-amber-400 border border-white/10' 
                        : 'bg-blue-50 dark:bg-slate-800 text-[#1e40af] dark:text-blue-400 border border-blue-100 dark:border-slate-700'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="font-bold text-sm sm:text-base tracking-tight truncate">
                      {item.label}
                    </span>
                  </div>

                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive 
                      ? 'text-white translate-x-1' 
                      : 'text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* COLUNA DIREITA: EXPLICAÇÃO + MOCKUP VISUAL INTERATIVO (8 colunas) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Texto Explicativo Direto */}
                <div className="space-y-2 text-left">
                  <span className="text-[11px] font-black tracking-widest text-amber-500 uppercase">
                    {current.badge}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#071328] dark:text-white tracking-tight">
                    {current.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-xl">
                    {current.description}
                  </p>
                </div>

                {/* Mockup Interativo Estilo Notebook e Aeronave */}
                <div className="relative rounded-[8px] bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white dark:from-slate-900/60 dark:via-slate-900/40 dark:to-card border border-blue-100 dark:border-border p-4 sm:p-7 shadow-lg overflow-hidden">
                  
                  {/* Elemento de fundo com nuvem sutil */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Tela do Simulado no Notebook */}
                  <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-[6px] shadow-md p-4 sm:p-5 relative z-10 max-w-lg">
                    
                    {/* Topbar da tela */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Voe Certo</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                        {current.mockupTag}
                      </span>
                    </div>

                    {/* Questão */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span>Questão 12 de 40</span>
                        {activeMode === 'anac' && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Clock className="w-3 h-3" /> 01:45:20
                          </span>
                        )}
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="w-[30%] bg-blue-500 h-full rounded-full" />
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-[#071328] dark:text-white leading-snug pt-1">
                        {current.mockupQuestion}
                      </p>

                      {/* Alternativas */}
                      <div className="space-y-1.5 pt-1">
                        {current.mockupOptions.map((opt, idx) => (
                          <div 
                            key={idx}
                            className={`flex items-center gap-2.5 p-2 rounded-[5px] text-xs transition-colors border ${
                              idx === 0 
                                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 font-semibold text-blue-900 dark:text-blue-200' 
                                : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                              idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="truncate leading-tight">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Highlights rápidos em bullets limpos */}
                  <div className="mt-4 pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {current.highlights.map((h, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{h}</span>
                      </span>
                    ))}
                  </div>

                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}