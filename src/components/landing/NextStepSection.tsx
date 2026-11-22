import { motion } from 'framer-motion';
import { Plane, Sparkle } from 'lucide-react';

export function NextStepSection() {
  return (
    <section 
      id="proximo-passo"
      className="min-h-[70vh] lg:min-h-screen flex items-center justify-center py-16 sm:py-24 lg:py-36 bg-white dark:bg-[#071328] text-[#003882] dark:text-white relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Bloco Centralizado com Título e Elemento Gráfico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Título Principal 100% Centralizado */}
          <h2 className="text-[32px] sm:text-4xl md:text-5xl lg:text-[62px] font-black leading-[1.08] tracking-tight text-[#003882] dark:text-white mb-5 sm:mb-6 text-center">
            Tudo para dar seu <br />
            próximo passo <br />
            <span className="relative inline-block text-center">
              <span>na aviação.</span>

              {/* Trilha do avião: nasce embaixo de 'aviação' e sobe curvando à direita */}
              <span className="absolute left-[36%] -bottom-2 sm:-bottom-2.5 w-[110px] sm:w-[140px] md:w-[170px] h-[38px] sm:h-[48px] md:h-[54px] pointer-events-none select-none">
                <svg
                  className="w-full h-full overflow-visible text-[#003882] dark:text-blue-400"
                  viewBox="0 0 120 45"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 2,38 C 36,38 78,34 106,10"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Ícone do Avião da biblioteca Lucide */}
                <Plane
                  className="absolute right-1 top-1 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#003882] dark:text-blue-400 fill-[#003882] dark:fill-blue-400 rotate-45 transform -translate-y-1/2 translate-x-1"
                />

                {/* Ícone de Brilho / Estrela da biblioteca Lucide */}
                <Sparkle
                  className="absolute -right-3.5 sm:-right-4.5 top-0 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-[#003882] dark:text-blue-400 fill-[#003882] dark:fill-blue-400"
                />
              </span>
            </span>
          </h2>

          {/* Subtítulo perfeitamente calibrado com quebra conforme o print mobile */}
          <p className="text-sm sm:text-base md:text-xl font-normal leading-relaxed text-[#003882] dark:text-slate-300 max-w-[275px] sm:max-w-xl mx-auto text-center">
            Treine com simulados, entenda sua evolução e encontre orientação para seguir em frente — tudo em um só lugar.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
