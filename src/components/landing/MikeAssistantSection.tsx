import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function MikeAssistantSection() {
  return (
    <section 
      id="mike-assistente"
      className="py-16 sm:py-20 md:py-28 bg-white dark:bg-[#071328] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl">

        {/* ══════════════════════════════════════════════════════════════
            1. VERSÃO DESKTOP (EXIBIDA EM md:grid)
            Personagem à esquerda com faíscas amarelas e textos à direita
           ══════════════════════════════════════════════════════════════ */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Coluna Esquerda: Personagem Mike com faíscas/raios amarelos */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-5 relative flex items-center justify-center"
          >
            {/* Faíscas / Raios Amarelos na Esquerda da Cabeça */}
            <div className="absolute -left-2 top-16 w-12 h-16 pointer-events-none z-10">
              <svg viewBox="0 0 45 60" fill="none" className="w-full h-full text-amber-400">
                <path d="M 5,42 L 35,30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M 20,55 L 42,42" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>

            {/* Faíscas / Raios Amarelos na Direita da Cabeça */}
            <div className="absolute -right-2 top-12 w-14 h-20 pointer-events-none z-10">
              <svg viewBox="0 0 50 70" fill="none" className="w-full h-full text-amber-400">
                <path d="M 8,15 L 38,5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M 12,38 L 44,38" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M 10,60 L 38,68" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>

            {/* Imagem do Personagem Mike */}
            <div className="relative w-[300px] lg:w-[350px] max-w-full">
              <img
                src="/images/avatars/Mike_character.png"
                alt="Mike - Copiloto e Assistente IA da Voe Certo"
                className="w-full h-auto object-contain drop-shadow-md select-none pointer-events-none"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Coluna Direita: Textos e Botão */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-7 text-left"
          >
            {/* Título Principal */}
            <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-black tracking-tight leading-[1.08] mb-4">
              <span className="text-[#08234a] dark:text-white block">
                Como o Mike te ajuda
              </span>
              <span className="text-[#0066ff] block">
                a chegar mais longe?
              </span>
            </h2>

            {/* Subtítulo */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-8 max-w-lg">
              Ele é o seu assistente na jornada de estudos, oferecendo suporte, dicas e muito mais para você evoluir.
            </p>

            {/* Botão Conhecer Mike com strictly rounded-[5px] */}
            <Button
              asChild
              className="h-12 px-8 bg-[#0066ff] hover:bg-blue-600 text-white font-bold text-sm sm:text-base rounded-[5px] shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Link to="/curriculo">
                Conhecer Mike
              </Link>
            </Button>
          </motion.div>

        </div>

        {/* ══════════════════════════════════════════════════════════════
            2. VERSÃO MOBILE (EXIBIDA EM md:hidden)
            Empilhamento vertical com Mike no topo e textos centralizados
           ══════════════════════════════════════════════════════════════ */}
        <div className="block md:hidden text-center max-w-sm mx-auto">
          
          {/* Personagem Mike no topo com faíscas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative inline-block mb-6"
          >
            {/* Faíscas Esquerdas */}
            <div className="absolute -left-4 top-12 w-10 h-14 pointer-events-none z-10">
              <svg viewBox="0 0 45 60" fill="none" className="w-full h-full text-amber-400">
                <path d="M 5,42 L 35,30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M 20,55 L 42,42" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>

            {/* Faíscas Direitas */}
            <div className="absolute -right-4 top-8 w-11 h-16 pointer-events-none z-10">
              <svg viewBox="0 0 50 70" fill="none" className="w-full h-full text-amber-400">
                <path d="M 8,15 L 38,5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M 12,38 L 44,38" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M 10,60 L 38,68" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>

            <div className="w-[240px] max-w-full mx-auto">
              <img
                src="/images/avatars/Mike_character.png"
                alt="Mike - Assistente IA"
                className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-md"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Título Centralizado */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-3xl font-black tracking-tight leading-[1.08] mb-3">
              <span className="text-[#08234a] dark:text-white block">
                Como o Mike te ajuda
              </span>
              <span className="text-[#0066ff] block">
                a chegar mais longe?
              </span>
            </h2>

            {/* Subtítulo */}
            <p className="text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-6 max-w-xs mx-auto">
              Ele é o seu assistente na jornada de estudos, oferecendo suporte, dicas e muito mais para você evoluir.
            </p>

            {/* Botão Conhecer Mike */}
            <div className="flex justify-center">
              <Button
                asChild
                className="h-12 px-8 bg-[#0066ff] hover:bg-blue-600 text-white font-bold text-sm sm:text-base rounded-[5px] shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Link to="/curriculo">
                  Conhecer Mike
                </Link>
              </Button>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
