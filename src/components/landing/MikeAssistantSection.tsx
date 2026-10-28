import { motion } from 'framer-motion';
import { FileSearch, MessageSquareQuote, FileBadge, ArrowRight } from 'lucide-react';

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
      className="py-16 md:py-24 bg-white dark:bg-[#071328] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── CARD AZUL COMPRIDO COM VISUAL DA REFERÊNCIA ── */}
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

            {/* ── COLUNA 1: TÍTULO E APRESENTAÇÃO DO MIKE (lg:col-span-4) ── */}
            <div className="lg:col-span-4 space-y-4">
              
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

            {/* ── COLUNA 2: OS 3 CARDS GLASSMORPHISM (lg:col-span-5) ── */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-3">
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

            {/* ── COLUNA 3: PERSONAGEM MIKE + ELEMENTOS COMIX (lg:col-span-3) ── */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center relative">
              
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
                    // Fallback para outra imagem de avatar existente
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
    </section>
  );
}