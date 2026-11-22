import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Plane, UserCheck, Wrench } from 'lucide-react';

interface CareerGuideCard {
  id: string;
  title: string;
  subtitle: string;
  photo: string;
  link: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const CAREER_GUIDES: CareerGuideCard[] = [
  {
    id: 'comissario',
    title: 'Comissário de Bordo',
    subtitle: 'Cuidar de pessoas também é voar.',
    photo: '/images/landing/photo-comissario.png',
    link: '/guia-carreira',
    Icon: UserCheck,
  },
  {
    id: 'piloto',
    title: 'Piloto de Avião',
    subtitle: 'Mais do que um destino, é um propósito.',
    photo: '/images/landing/photo-piloto.png',
    link: '/guia-carreira',
    Icon: Plane,
  },
  {
    id: 'mecanico',
    title: 'Mecânico de Aeronaves',
    subtitle: 'Segurança no céu começa no solo.',
    photo: '/images/landing/photo-mecanico.png',
    link: '/guia-carreira',
    Icon: Wrench,
  },
];

export function CareerGuidesSection() {
  const [mobileIndex, setMobileIndex] = useState(0);

  const nextMobile = () => {
    setMobileIndex((prev) => (prev + 1) % CAREER_GUIDES.length);
  };

  const prevMobile = () => {
    setMobileIndex((prev) => (prev - 1 + CAREER_GUIDES.length) % CAREER_GUIDES.length);
  };

  return (
    <section 
      id="guias-carreira"
      className="py-14 sm:py-20 md:py-24 bg-white dark:bg-[#071328] relative overflow-hidden"
    >
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Trilha azul pontilhada com avião no canto superior direito */}
      <div className="hidden lg:flex items-center absolute top-10 right-10 xl:right-24 pointer-events-none opacity-85">
        <svg width="130" height="60" viewBox="0 0 130 60" fill="none">
          <path 
            d="M 5,50 C 45,50 70,12 115,16" 
            stroke="#0066ff" 
            strokeWidth="2" 
            strokeDasharray="4 4" 
            fill="none" 
          />
        </svg>
        <Plane className="w-5 h-5 text-[#0066ff] fill-[#0066ff] rotate-45 -ml-2 -mt-7" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── CABEÇALHO DA SEÇÃO ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#071328] dark:text-white tracking-tight leading-tight mb-3 sm:mb-4">
            Guias de Carreira <br />
            <span className="text-[#0066ff]">para o seu futuro na aviação.</span>
          </h2>

          <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-xl mx-auto">
            Explore cada profissão, entenda o que é preciso, veja as etapas e descubra qual caminho combina mais com você.
          </p>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            1. VERSÃO MOBILE (EXIBIDA APENAS EM md:hidden)
            Carrossel com destaque central, setas circulares e dots azuis
           ══════════════════════════════════════════════════════════════ */}
        <div className="block md:hidden max-w-xs sm:max-w-sm mx-auto relative">
          
          <div className="relative flex items-center justify-center min-h-[360px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileIndex}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <Link
                  to={CAREER_GUIDES[mobileIndex].link}
                  className="block relative rounded-[18px] overflow-hidden group shadow-lg border border-slate-200/80 dark:border-slate-800 bg-[#07152b] h-[350px] w-full"
                >
                  {/* Foto de Fundo */}
                  <img
                    src={CAREER_GUIDES[mobileIndex].photo}
                    alt={CAREER_GUIDES[mobileIndex].title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradiente Azul Escuro */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06142a] via-[#06142a]/80 via-50% to-transparent pointer-events-none" />

                  {/* Conteúdo Inferior */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-left pointer-events-none">
                    {/* Ícone Azul */}
                    <div className="mb-2.5 text-[#38bdf8]">
                      {(() => {
                        const IconComponent = CAREER_GUIDES[mobileIndex].Icon;
                        return <IconComponent className="w-6 h-6" />;
                      })()}
                    </div>

                    {/* Título */}
                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                      {CAREER_GUIDES[mobileIndex].title}
                    </h3>

                    {/* Subtítulo + Seta */}
                    <div className="flex items-end justify-between gap-3 mt-1.5">
                      <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-2">
                        {CAREER_GUIDES[mobileIndex].subtitle}
                      </p>
                      <div className="w-8 h-8 rounded-full bg-[#0066ff]/30 text-[#38bdf8] border border-white/20 flex items-center justify-center shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Seta Esquerda Mobile */}
            <button
              type="button"
              onClick={prevMobile}
              aria-label="Guia anterior"
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-card border border-slate-200/90 dark:border-border shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#0066ff] transition-all z-20 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Seta Direita Mobile */}
            <button
              type="button"
              onClick={nextMobile}
              aria-label="Próximo guia"
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-card border border-slate-200/90 dark:border-border shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#0066ff] transition-all z-20 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Dots Mobile Padronizados em Azul */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {CAREER_GUIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMobileIndex(idx)}
                aria-label={`Ir para guia ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  mobileIndex === idx
                    ? 'w-6 h-2 bg-[#0066ff]'
                    : 'w-2 h-2 bg-blue-200 dark:bg-slate-700 hover:bg-blue-300'
                }`}
              />
            ))}
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════
            2. VERSÃO DESKTOP (EXIBIDA EM md:grid)
            Grid com os 3 cards oficiais centralizados perfeitamente
           ══════════════════════════════════════════════════════════════ */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {CAREER_GUIDES.map((guide, idx) => {
            const IconComponent = guide.Icon;
            return (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Link
                  to={guide.link}
                  className="block relative rounded-[20px] overflow-hidden group shadow-lg hover:shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-[#07152b] h-[340px] lg:h-[370px] hover:-translate-y-2 transition-all duration-300"
                >
                  {/* Foto de Fundo */}
                  <img
                    src={guide.photo}
                    alt={guide.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradiente Azul Escuro */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06142a] via-[#06142a]/80 via-50% to-transparent pointer-events-none" />

                  {/* Conteúdo Inferior */}
                  <div className="absolute inset-0 p-5 lg:p-6 flex flex-col justify-end text-left pointer-events-none">
                    {/* Ícone Azul */}
                    <div className="mb-2 text-[#38bdf8]">
                      <IconComponent className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>

                    {/* Título */}
                    <h3 className="text-base lg:text-lg font-bold text-white tracking-tight leading-snug">
                      {guide.title}
                    </h3>

                    {/* Subtítulo + Seta */}
                    <div className="flex items-end justify-between gap-3 mt-1.5">
                      <p className="text-xs lg:text-sm text-slate-300 font-normal leading-relaxed line-clamp-2">
                        {guide.subtitle}
                      </p>
                      <div className="w-8 h-8 rounded-full bg-[#0066ff]/30 text-[#38bdf8] border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-[#0066ff] group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
