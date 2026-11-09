import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Plane } from 'lucide-react';

interface CareerGuideCard {
  id: string;
  title: string;
  subtitle: string;
  photo: string;
  link: string;
  icon: (props: { className?: string }) => JSX.Element;
}

const CAREER_GUIDES: CareerGuideCard[] = [
  {
    id: 'comissario',
    title: 'Comissário de Bordo',
    subtitle: 'Cuidar de pessoas também é voar.',
    photo: '/images/landing/photo-comissario.png',
    link: '/guia-carreira',
    icon: (props) => (
      <svg className={`stroke-current ${props.className || 'w-5 h-5'}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 'piloto',
    title: 'Piloto de Avião',
    subtitle: 'Mais do que um destino, é um propósito.',
    photo: '/images/landing/photo-piloto.png',
    link: '/guia-carreira',
    icon: (props) => (
      <svg className={`stroke-current ${props.className || 'w-5 h-5'}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4 L4 9 L6 13 C8 15 16 15 18 13 L20 9 Z" />
        <path d="M2 13 C6 18 18 18 22 13" />
        <circle cx="12" cy="9" r="1.5" />
      </svg>
    ),
  },
  {
    id: 'mecanico',
    title: 'Mecânico de Aeronaves',
    subtitle: 'Segurança no céu começa no solo.',
    photo: '/images/landing/photo-mecanico.png',
    link: '/guia-carreira',
    icon: (props) => (
      <svg className={`stroke-current ${props.className || 'w-5 h-5'}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    id: 'controlador',
    title: 'Controlador de Tráfego Aéreo',
    subtitle: 'Cada decisão mantém o céu em movimento.',
    photo: '/images/landing/photo-controlador.png',
    link: '/guia-carreira',
    icon: (props) => (
      <svg className={`stroke-current ${props.className || 'w-5 h-5'}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 22 L9 9 L15 9 L17 22" />
        <path d="M6 9 L18 9 L17 5 L7 5 Z" />
        <path d="M10 5 L10 2 L14 2 L14 5" />
        <line x1="12" y1="9" x2="12" y2="22" />
        <line x1="5" y1="22" x2="19" y2="22" />
      </svg>
    ),
  },
  {
    id: 'gestao',
    title: 'Gestão de Aviação',
    subtitle: 'Organização que torna tudo possível.',
    photo: '/images/landing/photo-gestao.png',
    link: '/guia-carreira',
    icon: (props) => (
      <svg className={`stroke-current ${props.className || 'w-5 h-5'}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: 'instrutor',
    title: 'Instrutor de Voo',
    subtitle: 'Compartilhar conhecimento é multiplicar sonhos.',
    photo: '/images/landing/photo-instrutor.png',
    link: '/guia-carreira',
    icon: (props) => (
      <svg className={`stroke-current ${props.className || 'w-5 h-5'}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
];

export function CareerGuidesSection() {
  const [mobileIndex, setMobileIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [desktopIndex, setDesktopIndex] = useState(0);

  const nextMobile = () => {
    setMobileIndex((prev) => (prev + 1) % CAREER_GUIDES.length);
  };

  const prevMobile = () => {
    setMobileIndex((prev) => (prev - 1 + CAREER_GUIDES.length) % CAREER_GUIDES.length);
  };

  // Scroll desktop track
  const scrollDesktop = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const scrollAmount = 300;
      trackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleTrackScroll = () => {
    if (trackRef.current) {
      const scrollLeft = trackRef.current.scrollLeft;
      const cardWidth = 190;
      const idx = Math.round(scrollLeft / cardWidth);
      setDesktopIndex(Math.min(idx, CAREER_GUIDES.length - 1));
    }
  };

  return (
    <section 
      id="guias-carreira"
      className="py-12 md:py-20 bg-white dark:bg-[#071328] relative overflow-hidden"
    >
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Trilha amarela pontilhada com avião no canto superior direito */}
      <div className="hidden lg:flex items-center absolute top-10 right-10 xl:right-24 pointer-events-none opacity-85">
        <svg width="130" height="60" viewBox="0 0 130 60" fill="none">
          <path 
            d="M 5,50 C 45,50 70,12 115,16" 
            stroke="#eab308" 
            strokeWidth="2" 
            strokeDasharray="4 4" 
            fill="none" 
          />
        </svg>
        <Plane className="w-5 h-5 text-amber-500 fill-amber-500 rotate-45 -ml-2 -mt-7" />
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
            <span className="text-amber-500 dark:text-amber-400">para o seu futuro na aviação.</span>
          </h2>

          <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-xl mx-auto">
            Explore cada profissão, entenda o que é preciso, veja as etapas e descubra qual caminho combina mais com você.
          </p>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            1. VERSÃO MOBILE (EXIBIDA APENAS EM lg:hidden)
            Carrossel com destaque central, setas circulares e dots
           ══════════════════════════════════════════════════════════════ */}
        <div className="block lg:hidden max-w-xs sm:max-w-sm mx-auto relative">
          
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
                    {/* Ícone Amarelo */}
                    <div className="mb-2.5 text-amber-400">
                      {CAREER_GUIDES[mobileIndex].icon({ className: 'w-6 h-6' })}
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
                      <div className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
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
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-card border border-slate-200/90 dark:border-border shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-all z-20 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Seta Direita Mobile */}
            <button
              type="button"
              onClick={nextMobile}
              aria-label="Próximo guia"
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-card border border-slate-200/90 dark:border-border shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-all z-20 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Dots Mobile */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {CAREER_GUIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMobileIndex(idx)}
                aria-label={`Ir para guia ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  mobileIndex === idx
                    ? 'w-5 h-2 bg-amber-400'
                    : 'w-2 h-2 bg-blue-200 dark:bg-slate-700 hover:bg-blue-300'
                }`}
              />
            ))}
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════
            2. VERSÃO DESKTOP (EXIBIDA APENAS EM hidden lg:block)
            Trilho Horizontal com os 6 cards alinhados + Navegação com Setas e Dots
           ══════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:block relative max-w-6xl mx-auto px-4">
          
          {/* Botão Seta Esquerda Desktop */}
          <button
            type="button"
            onClick={() => scrollDesktop('left')}
            aria-label="Rolar para esquerda"
            className="absolute -left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-card border border-slate-200/90 dark:border-border shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:scale-105 transition-all z-20 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Botão Seta Direita Desktop */}
          <button
            type="button"
            onClick={() => scrollDesktop('right')}
            aria-label="Rolar para direita"
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-card border border-slate-200/90 dark:border-border shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:scale-105 transition-all z-20 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Trilha de Cards com Scroll Suave */}
          <div
            ref={trackRef}
            onScroll={handleTrackScroll}
            className="flex items-center gap-4 xl:gap-5 overflow-x-auto scrollbar-none py-4 px-2 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {CAREER_GUIDES.map((guide, idx) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="shrink-0 w-[170px] xl:w-[178px]"
              >
                <Link
                  to={guide.link}
                  className="block relative rounded-[16px] overflow-hidden group shadow-md hover:shadow-xl border border-slate-200/80 dark:border-slate-800 bg-[#07152b] h-[245px] hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* Foto de Fundo */}
                  <img
                    src={guide.photo}
                    alt={guide.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Gradiente Azul Escuro */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06142a] via-[#06142a]/75 via-50% to-transparent pointer-events-none" />

                  {/* Conteúdo Inferior */}
                  <div className="absolute inset-0 p-3.5 flex flex-col justify-end text-left pointer-events-none">
                    {/* Ícone Amarelo */}
                    <div className="mb-1.5 text-amber-400">
                      {guide.icon({ className: 'w-4 h-4' })}
                    </div>

                    {/* Título */}
                    <h3 className="text-xs xl:text-sm font-bold text-white tracking-tight leading-snug">
                      {guide.title}
                    </h3>

                    {/* Subtítulo + Seta */}
                    <div className="flex items-end justify-between gap-1.5 mt-1">
                      <p className="text-[10px] text-slate-300 font-normal leading-tight line-clamp-2">
                        {guide.subtitle}
                      </p>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Dots Decorativos Desktop */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {CAREER_GUIDES.map((_, idx) => (
              <span
                key={idx}
                className={`transition-all duration-300 rounded-full ${
                  desktopIndex === idx
                    ? 'w-5 h-2 bg-amber-400'
                    : 'w-2 h-2 bg-blue-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
