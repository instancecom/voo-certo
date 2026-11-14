import { motion } from 'framer-motion';
import { Plane, Sparkle } from 'lucide-react';

export function NextStepSection() {
  return (
    <section 
      id="proximo-passo"
      className="py-16 sm:py-20 md:py-28 bg-white dark:bg-[#071328] text-[#003882] dark:text-white relative overflow-hidden"
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
          {/* Título Principal */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black leading-[1.12] tracking-tight text-[#003882] dark:text-white mb-6">
            Tudo para dar seu <br />
            próximo passo <br />
            <span className="inline-flex items-center justify-center relative">
              <span>na aviação.</span>

              {/* Trilha de Voo + Aviãozinho e Brilho (Lucide Icons) */}
              <span className="relative inline-flex items-center ml-2 sm:ml-3 w-14 sm:w-20 md:w-24 h-8 sm:h-10 md:h-12 align-middle">
                {/* Arco suave da trilha de voo */}
                <svg
                  className="absolute inset-0 w-full h-full overflow-visible pointer-events-none text-[#003882] dark:text-blue-400"
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
                  className="absolute right-0 top-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#003882] dark:text-blue-400 fill-[#003882] dark:fill-blue-400 rotate-45 transform -translate-y-1/2 translate-x-1"
                />

                {/* Ícone de Brilho / Estrela da biblioteca Lucide */}
                <Sparkle
                  className="absolute -right-5 sm:-right-6 -top-1 sm:-top-2 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#003882] dark:text-blue-400 fill-[#003882] dark:fill-blue-400"
                />
              </span>
            </span>
          </h2>

          {/* Subtítulo */}
          <p className="text-sm sm:text-base md:text-xl font-normal leading-relaxed text-[#003882]/90 dark:text-slate-300 max-w-2xl mx-auto">
            Treine com simulados, entenda sua evolução e encontre orientação para seguir em frente — tudo em um só lugar.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
