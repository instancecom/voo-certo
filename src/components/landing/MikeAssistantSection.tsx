import { motion } from 'framer-motion';
import { FileSearch, MessageSquareQuote, FileBadge, ArrowRight, Rocket } from 'lucide-react';

interface MikeFeatureCard {
  id: number;
  icon: any;
  title: string;
  description: string;
}

const MIKE_FEATURES: MikeFeatureCard[] = [
  {
    id: 1,
    icon: FileSearch,
    title: 'Diagnóstico',
    description: 'Entende seu perfil, objetivos e nível atual para criar um plano feito sob medida para você.',
  },
  {
    id: 2,
    icon: MessageSquareQuote,
    title: 'Responde perguntas',
    description: 'Tira suas dúvidas sobre provas, carreiras, documentos e tudo o que você precisar saber.',
  },
  {
    id: 3,
    icon: FileBadge,
    title: 'Cria seu currículo',
    description: 'Organiza suas informações e gera um currículo profissional, pronto para as oportunidades da aviação.',
  },
];

export function MikeAssistantSection() {
  return (
    <section 
      id="mike-assistente"
      className="py-10 md:py-16 bg-white dark:bg-[#071328] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ══════════════════════════════════════════════════════════════
            1. VERSÃO MOBILE (EXIBIDA APENAS EM TELAS MENORES: lg:hidden)
            Design vertical idêntico à imagem de referência
           ══════════════════════════════════════════════════════════════ */}
        <div className="block lg:hidden max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-[28px] bg-gradient-to-b from-[#0047b3] via-[#00388d] to-[#001d52] p-6 text-white shadow-2xl shadow-blue-900/30 overflow-hidden"
          >
            {/* Efeito de luz ambiente suave */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-950/50 rounded-full blur-2xl pointer-events-none" />

            {/* Topo: Ícone Foguete + MIKE IA + Linha Dourada */}
            <div className="flex items-center gap-2 mb-3.5 relative z-10">
              <span className="text-amber-400 text-base">🚀</span>
              <span className="text-[11px] font-black tracking-wider text-blue-200 uppercase">
                MIKE IA
              </span>
              <div className="w-12 h-0.5 bg-amber-400 rounded-full" />
            </div>

            {/* Título com destaque em amarelo */}
            <h2 className="text-2xl font-black tracking-tight leading-tight mb-2 relative z-10">
              O Mike te ajuda <br />
              a chegar <span className="text-amber-400">mais longe</span>
            </h2>

            {/* Subtítulo breve */}
            <p className="text-xs text-blue-100/85 font-normal leading-relaxed mb-6 relative z-10">
              Tire dúvidas, entenda seu desempenho e prepare seu currículo.
            </p>

            {/* Lista Vertical dos 3 Recursos com divisores sutis */}
            <div className="space-y-4 relative z-10 mb-2">
              
              {/* 1. Diagnóstico */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-white/10">
                <div className="w-11 h-11 rounded-[12px] bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-white shadow-xs">
                  <FileSearch className="w-5 h-5 text-amber-300" />
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <h3 className="font-bold text-sm text-white leading-tight">
                    Diagnóstico
                  </h3>
                  <p className="text-xs text-blue-100/80 leading-snug">
                    Descubra seus pontos fortes e o que precisa melhorar.
                  </p>
                </div>
              </div>

              {/* 2. Responde perguntas */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-white/10">
                <div className="w-11 h-11 rounded-[12px] bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-white shadow-xs">
                  <MessageSquareQuote className="w-5 h-5 text-amber-300" />
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <h3 className="font-bold text-sm text-white leading-tight">
                    Responde perguntas
                  </h3>
                  <p className="text-xs text-blue-100/80 leading-snug">
                    Tire suas dúvidas sobre carreira, provas e muito mais.
                  </p>
                </div>
              </div>

              {/* 3. Cria seu currículo */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-[12px] bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-white shadow-xs">
                  <FileBadge className="w-5 h-5 text-amber-300" />
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <h3 className="font-bold text-sm text-white leading-tight">
                    Cria seu currículo
                  </h3>
                  <p className="text-xs text-blue-100/80 leading-snug">
                    Monte um currículo profissional e pronto para a aviação.
                  </p>
                </div>
              </div>

            </div>

            {/* Área Inferior com Personagem Mike + Trilha do Aviãozinho */}
            <div className="relative pt-4 flex flex-col items-center justify-end">
              
              {/* Trilha amarela pontilhada com aviãozinho subindo */}
              <div className="absolute top-8 left-10 flex items-center pointer-events-none opacity-90 z-0">
                <svg width="130" height="45" viewBox="0 0 130 45" fill="none">
                  <path 
                    d="M 5,38 C 45,38 75,15 118,20" 
                    stroke="#f59e0b" 
                    strokeWidth="2" 
                    strokeDasharray="4 4" 
                  />
                </svg>
                <span className="text-amber-400 text-base -ml-3 -mt-6 transform rotate-12 inline-block">✈️</span>
              </div>

              {/* Risquinhos estilo cartoon ao lado da cabeça do Mike */}
              <div className="absolute top-6 right-16 pointer-events-none text-amber-400 flex gap-1 font-black text-xs select-none">
                <span className="transform -rotate-12">|</span>
                <span className="transform rotate-20">\</span>
              </div>

              {/* Imagem do Mike com braços cruzados */}
              <div className="relative w-44 sm:w-48 max-h-[220px] flex items-end justify-center z-10 -mb-6">
                <img
                  src="/images/avatars/Mike_character.png"
                  alt="Mike Assistente Voe Certo"
                  className="w-full h-full object-contain drop-shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.src = '/images/avatars/mike_character_prof.png';
                  }}
                />
              </div>

            </div>

          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            2. VERSÃO DESKTOP (EXIBIDA APENAS EM TELAS GRANDES: hidden lg:block)
            Mantida exatamente como está na Web
           ══════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-[24px] sm:rounded-[32px] bg-gradient-to-r from-[#0047b3] via-[#005cd8] to-[#0072f5] p-6 sm:p-10 lg:p-12 shadow-2xl shadow-blue-600/20 overflow-hidden text-white"
          >
            {/* Efeito de luz ambiente / reflexo sutil no fundo */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 left-0 w-80 h-80 bg-blue-900/30 rounded-full blur-2xl pointer-events-none" />

            {/* GRID: TEXTO À ESQUERDA + 3 CARDS GLASSMORPHISM NO CENTRO + MIKE À DIREITA */}
            <div className="grid grid-cols-12 gap-8 items-center relative z-10">

              {/* ── COLUNA 1: TÍTULO E APRESENTAÇÃO DO MIKE (4 cols) ── */}
              <div className="col-span-4 space-y-4">
                
                {/* Aviãozinho dourado com traço horizontal */}
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-lg">✈️</span>
                  <div className="w-16 h-0.5 bg-amber-400 rounded-full" />
                </div>

                {/* Título com destaque amarelo */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                  Como o Mike te ajuda <br />
                  <span className="text-amber-400">a chegar mais longe?</span>
                </h2>

                {/* Descrição breve e descontraída */}
                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal max-w-sm">
                  Ele é o seu assistente na jornada da aviação, sempre pronto para te orientar, tirar dúvidas e te ajudar a evoluir.
                </p>
              </div>

              {/* ── COLUNA 2: OS 3 CARDS GLASSMORPHISM (5 cols) ── */}
              <div className="col-span-5 grid grid-cols-3 gap-3">
                {MIKE_FEATURES.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <motion.div
                      key={feat.id}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="relative backdrop-blur-md bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 shadow-lg shadow-black/10 rounded-[14px] p-4 flex flex-col justify-between transition-all group select-none min-h-[170px]"
                    >
                      {/* Linha superior: Ícone + Badge numérico amarelo */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-[8px] bg-white/10 border border-white/20 flex items-center justify-center text-white">
                          <Icon className="w-4 h-4 text-white" />
                        </div>

                        {/* Badge numérica amarela */}
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-[#003d99] font-black text-[11px] flex items-center justify-center shadow-xs">
                          {feat.id}
                        </span>
                      </div>

                      {/* Conteúdo */}
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-white tracking-tight mb-1">
                          {feat.title}
                        </h3>
                        <p className="text-[11px] text-blue-100/85 leading-snug font-normal">
                          {feat.description}
                        </p>
                      </div>

                      {/* Seta indicativa no rodapé */}
                      <div className="pt-2 mt-auto">
                        <ArrowRight className="w-3.5 h-3.5 text-white/70 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* ── COLUNA 3: PERSONAGEM MIKE + ELEMENTOS COMIX (3 cols) ── */}
              <div className="col-span-3 flex flex-col items-center justify-center relative">
                
                {/* Raios de desenho ao redor da cabeça do Mike */}
                <div className="absolute -top-3 right-6 lg:right-10 pointer-events-none text-amber-400 flex gap-1 font-black text-xs select-none">
                  <span className="transform -rotate-45">/</span>
                  <span className="transform -rotate-12">|</span>
                  <span className="transform rotate-20">\</span>
                </div>
                <div className="absolute top-4 left-6 lg:left-8 pointer-events-none text-amber-400 flex gap-1 font-black text-xs select-none">
                  <span className="transform -rotate-30">\</span>
                  <span className="transform rotate-15">/</span>
                </div>

                {/* Imagem do Mike com fallback */}
                <div className="relative w-48 sm:w-56 lg:w-64 max-h-[280px] flex items-end justify-center">
                  <img
                    src="/images/avatars/Mike_character.png"
                    alt="Mike Assistente Voe Certo"
                    className="w-full h-full object-contain drop-shadow-2xl z-10"
                    onError={(e) => {
                      e.currentTarget.src = '/images/avatars/mike_character_prof.png';
                    }}
                  />
                </div>

                {/* Trilha de aviãozinho no rodapé à direita */}
                <div className="absolute -bottom-2 -right-2 sm:right-2 flex items-center pointer-events-none opacity-90">
                  <svg width="100" height="30" viewBox="0 0 100 30" fill="none">
                    <path 
                      d="M 10,25 C 40,25 60,10 85,12" 
                      stroke="#f59e0b" 
                      strokeWidth="2" 
                      strokeDasharray="4 4" 
                    />
                  </svg>
                  <span className="text-amber-400 text-sm -ml-1">✈️</span>
                </div>

              </div>

            </div>

          </motion.div>
        </div>

      </div>
    </section>
  );
}
