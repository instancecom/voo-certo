import { motion } from 'framer-motion';
import { Plane, Sparkle } from 'lucide-react';

export function NextStepSection() {
  return (
    <section 
      id="proximo-passo"
      className="min-h-[80vh] lg:min-h-screen flex items-center justify-center py-20 sm:py-28 lg:py-36 bg-white dark:bg-[#071328] text-[#003882] dark:text-white relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Bloco Centralizado com Título e Elemento Gráfico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Título Principal 100% Centralizado matematicamente */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black leading-[1.12] tracking-tight text-[#003882] dark:text-white mb-6 text-center">
            Tudo para dar seu <br />
            próximo passo <br />
            <span className="relative inline-block text-center">
              <span>na aviação.</span>

              {/* Trilha de Voo + Aviãozinho e Brilho como adereço absoluto (sem empurrar ou entortar o texto) */}
              <span className="absolute left-full bottom-1 ml-1.5 sm:ml-2.5 w-14 sm:w-20 md:w-24 h-8 sm:h-10 pointer-events-none select-none">
                {/* Arco suave da trilha de voo */}
                <svg
                  className="w-full h-full overflow-visible text-[#003882] dark:text-blue-400"
                  viewBox="0 0 100 45"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 2,42 C 30,42 65,32 90,12"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Ícone do Avião da biblioteca Lucide */}
                <Plane
                  className="absolute right-0 top-0 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#003882] dark:text-blue-400 fill-[#003882] dark:fill-blue-400 rotate-45 transform -translate-y-1/2 translate-x-1"
                />

                {/* Ícone de Brilho / Estrela da biblioteca Lucide */}
                <Sparkle
                  className="absolute -right-4 sm:-right-5 -top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#003882] dark:text-blue-400 fill-[#003882] dark:fill-blue-400"
                />
              </span>
            </span>
          </h2>

          {/* Subtítulo 100% Centralizado */}
          <p className="text-sm sm:text-base md:text-xl font-normal leading-relaxed text-[#003882]/90 dark:text-slate-300 max-w-2xl mx-auto text-center">
            Treine com simulados, entenda sua evolução e encontre orientação para seguir em frente — tudo em um só lugar.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
