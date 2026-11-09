import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  avatar: string;
  isFeatured?: boolean;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote: 'O acompanhamento do Mike e as explicações por IA mudaram completamente meu rendimento.',
    name: 'Rafael S.',
    role: 'Piloto Privado',
    avatar: '/images/landing/avatar-rafael.png',
  },
  {
    id: 2,
    quote: 'A plataforma me ajudou a entender onde precisava melhorar.',
    name: 'Ana Paula M.',
    role: 'Comissária de Voo',
    avatar: '/images/landing/avatar-anapaula.png',
    isFeatured: true,
  },
  {
    id: 3,
    quote: 'Estruturei meu currículo com o Mike e o selo no LinkedIn chamou atenção imediata.',
    name: 'Camila R.',
    role: 'Mecânica de Manutenção',
    avatar: '/images/landing/avatar-camila.png',
  },
];

// Componente do Card Hexagonal com bordas arredondadas e glow
function HexagonCard({ 
  item, 
  isFeatured = false, 
  className = '' 
}: { 
  item: Testimonial; 
  isFeatured?: boolean; 
  className?: string; 
}) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      
      {/* SVG de Fundo com Formato Hexagonal de Cantos Arredondados */}
      <svg
        viewBox="0 0 320 340"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="
            M 160,12
            C 170,12 178,16 295,84
            C 305,90 310,98 310,110
            L 310,230
            C 310,242 305,250 295,256
            L 170,328
            C 160,334 150,334 140,328
            L 25,256
            C 15,250 10,242 10,230
            L 10,110
            C 10,98 15,90 25,84
            L 142,16
            C 150,12 155,12 160,12
            Z
          "
          className={
            isFeatured
              ? 'fill-white dark:fill-[#0c1f44] stroke-amber-400 dark:stroke-amber-400 stroke-[3]'
              : 'fill-white dark:fill-[#0b1730] stroke-slate-200/90 dark:stroke-slate-800 stroke-[1.5]'
          }
        />
      </svg>

      {/* Conteúdo Interno Centralizado */}
      <div className="absolute inset-0 px-8 py-8 flex flex-col justify-between items-center text-center">
        
        {/* 5 Estrelas Douradas */}
        <div className="flex items-center justify-center gap-1 pt-3">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-amber-400 text-sm sm:text-base leading-none">
              ★
            </span>
          ))}
        </div>

        {/* Depoimento Entre Aspas */}
        <p className="text-xs sm:text-sm font-semibold text-[#071328] dark:text-white leading-relaxed px-1">
          "{item.quote}"
        </p>

        {/* Autor: Avatar Redondo + Nome + Cargo */}
        <div className="flex items-center gap-3 pb-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 shadow-xs">
            <img
              src={item.avatar}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback com inicial caso a imagem falhe
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-xs sm:text-sm text-[#071328] dark:text-white leading-tight">
              {item.name}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
              {item.role}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

export function TestimonialsSection() {
  const [mobileIndex, setMobileIndex] = useState(1); // Inicia com o depoimento central em destaque

  const nextTestimonial = () => {
    setMobileIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setMobileIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section 
      id="provas-reais"
      className="py-12 md:py-20 bg-gradient-to-b from-white via-slate-50/40 to-white dark:from-[#071328] dark:via-[#091a36] dark:to-[#071328] relative overflow-hidden"
    >
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Trilha amarela pontilhada com aviãozinho no canto superior direito */}
      <div className="hidden lg:flex items-center absolute top-10 right-10 xl:right-20 pointer-events-none opacity-80">
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
          <path 
            d="M 5,50 C 45,50 65,15 110,18" 
            stroke="#eab308" 
            strokeWidth="2" 
            strokeDasharray="4 4" 
            fill="none" 
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── CABEÇALHO DA SEÇÃO ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-8 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#071328] dark:text-white tracking-tight leading-tight mb-3 sm:mb-4">
            Cada conquista <br />
            começa com <span className="text-amber-500 dark:text-amber-400">um passo.</span>
          </h2>

          <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-lg mx-auto">
            Conheça quem está se preparando, evoluindo e conquistando seu espaço na aviação com a Voe Certo.
          </p>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            1. VERSÃO MOBILE (EXIBIDA APENAS EM TELAS MENORES: lg:hidden)
            Carrossel com setas circulares e navegação por dots
           ══════════════════════════════════════════════════════════════ */}
        <div className="block lg:hidden max-w-xs sm:max-w-sm mx-auto relative">
          
          {/* Card Ativo em Destaque */}
          <div className="relative flex items-center justify-center min-h-[350px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileIndex}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <HexagonCard
                  item={TESTIMONIALS[mobileIndex]}
                  isFeatured={true}
                  className="w-full max-w-[310px] mx-auto h-[330px]"
                />
              </motion.div>
            </AnimatePresence>

            {/* Seta Esquerda */}
            <button
              type="button"
              onClick={prevTestimonial}
              aria-label="Depoimento anterior"
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-card border border-slate-200/90 dark:border-border shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-all z-20 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Seta Direita */}
            <button
              type="button"
              onClick={nextTestimonial}
              aria-label="Próximo depoimento"
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-card border border-slate-200/90 dark:border-border shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-all z-20 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Dots de Paginação Mobile */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMobileIndex(idx)}
                aria-label={`Ir para depoimento ${idx + 1}`}
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
            2. VERSÃO DESKTOP (EXIBIDA APENAS EM TELAS GRANDES: hidden lg:block)
            Disposição dos 3 Cards Hexagonais lado a lado com Destaque Central
           ══════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:block max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-6 xl:gap-8 items-center">
            
            {/* Card 1: Rafael S. */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <HexagonCard
                item={TESTIMONIALS[0]}
                isFeatured={false}
                className="w-[290px] xl:w-[310px] h-[330px] hover:-translate-y-1 transition-transform"
              />
            </motion.div>

            {/* Card 2: Ana Paula M. (Destaque Central) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="w-full flex justify-center"
            >
              <HexagonCard
                item={TESTIMONIALS[1]}
                isFeatured={true}
                className="w-[305px] xl:w-[325px] h-[345px] -translate-y-2 hover:-translate-y-3 transition-transform"
              />
            </motion.div>

            {/* Card 3: Camila R. */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="w-full flex justify-center"
            >
              <HexagonCard
                item={TESTIMONIALS[2]}
                isFeatured={false}
                className="w-[290px] xl:w-[310px] h-[330px] hover:-translate-y-1 transition-transform"
              />
            </motion.div>

          </div>

          {/* Dots decorativos de paginação */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-200 dark:bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-200 dark:bg-slate-700" />
          </div>
        </div>

      </div>
    </section>
  );
}
