import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface InsigniaItem {
  id: string;
  name: string;
  image: string;
  fallbackImage?: string;
  pillColor: string;
  descriptionWeb: string;
  descriptionMobile: string;
}

const INSIGNIAS: InsigniaItem[] = [
  {
    id: 'bronze',
    name: 'BRONZE',
    image: '/images/landing/insignia-bronze.png',
    pillColor: 'bg-[#a3521e] text-white',
    descriptionWeb: 'Você começou bem! Essa insígnia é o primeiro passo da sua jornada.',
    descriptionMobile: 'Você começou bem! Essa insígnia é o primeiro passo.',
  },
  {
    id: 'prata',
    name: 'PRATA',
    image: '/images/landing/insignia-prata.png',
    pillColor: 'bg-[#627385] text-white',
    descriptionWeb: 'Você já está evoluindo! Continue assim, o seu esforço está dando resultado.',
    descriptionMobile: 'Você já está evoluindo!',
  },
  {
    id: 'ouro',
    name: 'OURO',
    image: '/images/landing/insignia-ouro.png',
    pillColor: 'bg-[#f59e0b] text-white',
    descriptionWeb: 'Você está entre os melhores! Sua dedicação te colocou em outro nível.',
    descriptionMobile: 'Você está entre os melhores!',
  },
  {
    id: 'diamante',
    name: 'DIAMANTE',
    image: '/images/landing/insignia-diamante.png',
    fallbackImage: '/images/landing/insignia-platina.png',
    pillColor: 'bg-[#0080ff] text-white',
    descriptionWeb: 'Você chegou longe! Reconhecimento oficial da sua aprovação.',
    descriptionMobile: 'Você chegou longe!',
  },
];

export function InsigniasSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 300;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="insignias"
      className="py-16 md:py-24 bg-white dark:bg-[#071328] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* ══════════════════════════════════════════════════════════════
            1. VERSÃO DESKTOP (lg:grid)
            Coluna da esquerda com títulos + CTA; Coluna da direita com
            carrossel horizontal e efeito de corte (peek) na borda
           ══════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-14 items-center">
          {/* Coluna Esquerda: Textos e Botão */}
          <div className="lg:col-span-5 pr-2">
            <h2 className="text-3xl xl:text-4xl 2xl:text-[42px] font-black tracking-tight leading-[1.15] text-[#08234a] dark:text-white">
              Conquiste suas <br />
              <span className="text-[#0066ff]">insígnias</span> de progresso.
            </h2>

            <p className="mt-5 text-base xl:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Quanto mais você estuda e evolui, mais perto fica dos seus sonhos. As Insígnias são o seu reconhecimento por cada conquista.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <Link
                to="/conquistas"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#0066ff] hover:bg-[#0055d4] text-white font-medium text-sm rounded-[5px] shadow-sm hover:shadow transition-all group"
              >
                <span>Ver todas as insígnias</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Botões sutis de navegação do carrossel */}
              <div className="flex items-center gap-2 ml-1">
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-colors shadow-xs"
                  aria-label="Rolar insígnias para esquerda"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-colors shadow-xs"
                  aria-label="Rolar insígnias para direita"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Carrossel de Cards com overflow e peek effect */}
          <div className="lg:col-span-7 min-w-0 relative">
            <div
              ref={scrollContainerRef}
              className="flex gap-5 xl:gap-6 overflow-x-auto scrollbar-none py-4 px-1 -mr-4 sm:-mr-8 lg:-mr-12 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {INSIGNIAS.map((badge, idx) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="w-[250px] xl:w-[265px] shrink-0 bg-white dark:bg-[#0a1b33] border border-slate-100 dark:border-slate-800/80 rounded-[20px] p-6 flex flex-col items-center text-center shadow-[0_4px_24px_rgba(8,35,74,0.05)] hover:shadow-[0_8px_30px_rgba(8,35,74,0.09)] transition-all duration-300"
                >
                  {/* Ilustração da Insígnia */}
                  <div className="w-32 h-32 xl:w-36 xl:h-36 flex items-center justify-center mb-4 relative">
                    <img
                      src={badge.image}
                      alt={`Insígnia ${badge.name}`}
                      className="w-full h-full object-contain drop-shadow-md select-none"
                      onError={(e) => {
                        if (badge.fallbackImage) {
                          e.currentTarget.src = badge.fallbackImage;
                        }
                      }}
                    />
                  </div>

                  {/* Tag / Pill de Nível */}
                  <span className={`inline-block px-5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-3.5 shadow-xs ${badge.pillColor}`}>
                    {badge.name}
                  </span>

                  {/* Descrição */}
                  <p className="text-xs xl:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                    {badge.descriptionWeb}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            2. VERSÃO MOBILE (block lg:hidden)
            Título centralizado, carrossel horizontal de cards compactos
            e botão CTA abaixo centralizado
           ══════════════════════════════════════════════════════════════ */}
        <div className="block lg:hidden">
          {/* Cabeçalho Mobile */}
          <div className="text-center mb-7 px-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-[#08234a] dark:text-white">
              Conquiste suas <br />
              <span className="text-[#0066ff]">insígnias</span> de progresso.
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xs mx-auto">
              Quanto mais você estuda e evolui, mais perto fica dos seus sonhos.
            </p>
          </div>

          {/* Carrossel Horizontal Mobile */}
          <div
            className="flex gap-3 overflow-x-auto scrollbar-none px-4 pb-3 -mx-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {INSIGNIAS.map((badge, idx) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="w-[155px] sm:w-[170px] shrink-0 snap-center bg-white dark:bg-[#0a1b33] border border-slate-100 dark:border-slate-800 rounded-[18px] p-4 flex flex-col items-center text-center shadow-[0_2px_14px_rgba(8,35,74,0.04)]"
              >
                {/* Imagem da Insígnia */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-2.5 relative">
                  <img
                    src={badge.image}
                    alt={`Insígnia ${badge.name}`}
                    className="w-full h-full object-contain drop-shadow-sm select-none"
                    onError={(e) => {
                      if (badge.fallbackImage) {
                        e.currentTarget.src = badge.fallbackImage;
                      }
                    }}
                  />
                </div>

                {/* Tag / Pill do Nível */}
                <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs ${badge.pillColor}`}>
                  {badge.name}
                </span>

                {/* Descrição Curta */}
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-snug">
                  {badge.descriptionMobile}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Botão CTA Centralizado */}
          <div className="mt-7 flex justify-center px-4">
            <Link
              to="/conquistas"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.98] text-white font-medium text-sm rounded-[5px] shadow-sm transition-all"
            >
              <span>Ver todas as insígnias</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
