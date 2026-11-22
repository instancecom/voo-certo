import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, ChevronDown, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const HeroSection = () => {
  const { user } = useAuth();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section
      id="inicio"
      className="relative bg-white dark:bg-[#071328] pt-20 md:pt-24 pb-8 sm:pb-10 overflow-visible"
    >
      {/* ══════════════════════════════════════════════════════════════
          1. VERSÃO DESKTOP (EXIBIDA APENAS EM lg:block)
          Banner ultra-esticado (w-[96%] max-w-[1740px]) e fino (h-[440px]-h-[470px]).
          Pílula de rolagem posicionada exatamente METADE sobre o banner
          e METADE sobre a seção de baixo sem sofrer corte de overflow!
         ══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
        <div className="relative mx-auto w-full max-w-[1880px]">
          
          {/* Card do Banner com cantos arredondados e overflow-hidden para a imagem */}
          <div className="w-full rounded-[28px] xl:rounded-[36px] overflow-hidden relative shadow-2xl h-[510px] xl:h-[550px] 2xl:h-[580px] flex items-center">
            {/* Imagem de Fundo (Banner da Aviação) */}
            <img
              src="/images/landing/hero-bg.jpg"
              alt="Voe Certo - Preparação para Carreiras na Aviação"
              className="absolute inset-0 w-full h-full object-cover object-[center_36%] select-none"
              loading="eager"
              decoding="async"
            />

            {/* Gradiente sutil para garantir legibilidade dos textos brancos */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent pointer-events-none" />

            {/* Conteúdo à Esquerda */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="relative z-10 px-10 xl:px-16 py-8 max-w-xl text-left"
            >
              {/* Título Principal */}
              <h1 className="text-4xl xl:text-5xl 2xl:text-[54px] font-black text-white leading-[1.08] tracking-tight mb-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
                Seu próximo <br />
                destino é a <br />
                <span className="text-[#38bdf8]">aviação.</span>
              </h1>

              {/* Subtítulo */}
              <p className="text-sm xl:text-base text-white/95 font-medium leading-relaxed max-w-sm mb-6 drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
                Prepare-se com simulados e guias de carreira.
              </p>

              {/* Botões de Ação */}
              <div className="flex items-center gap-3.5">
                {/* Botão Principal: Começar agora */}
                <Link
                  to={user ? '/simulados' : '/auth?mode=signup'}
                  className="inline-flex items-center gap-2 px-7 py-3 bg-white hover:bg-slate-50 text-[#08234a] font-bold text-sm rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                  <span>Começar agora</span>
                  <ChevronRight className="w-4 h-4 text-[#08234a] transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Botão Play / Apresentação */}
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-11 h-11 rounded-full border border-white/70 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all group cursor-pointer"
                  aria-label="Assistir apresentação"
                >
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Pílula: Exatamente 50% sobre o banner e 50% na seção de baixo */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-30">
            <a
              href="#proximo-passo"
              className="w-8 h-12 rounded-full border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center text-[#0066ff] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              aria-label="Rolar para próxima seção"
            >
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-4 h-4 text-[#0066ff] stroke-[2.5]" />
              </motion.div>
            </a>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          2. VERSÃO MOBILE (EXIBIDA APENAS EM lg:hidden)
          Card mais esticado verticalmente conforme referência,
          com copy (título e subtítulo) ampliada e botões destacados.
         ══════════════════════════════════════════════════════════════ */}
      <div className="block lg:hidden px-2.5 sm:px-4">
        <div className="relative mx-auto w-full max-w-md">
          
          {/* Card Mobile - Esticado verticalmente */}
          <div className="rounded-[26px] sm:rounded-[32px] overflow-hidden relative shadow-xl h-[76vh] min-h-[580px] sm:min-h-[640px] max-h-[700px] flex flex-col justify-between pt-10 pb-14 px-5 sm:px-7">
            {/* Imagem de Fundo (Banner Mobile) */}
            <img
              src="/images/landing/hero-bg.jpg"
              alt="Voe Certo - Preparação para Carreiras na Aviação"
              className="absolute inset-0 w-full h-full object-cover object-[72%_center] select-none"
              loading="eager"
              decoding="async"
            />

            {/* Gradiente para contraste */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/55 pointer-events-none" />

            {/* Espaçador Superior para o avião aparecer com destaque */}
            <div className="h-6 sm:h-12" />

            {/* Bloco Central de Textos e CTAs (Copy ampliada) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="relative z-10 text-center max-w-sm mx-auto w-full my-auto"
            >
              {/* Título Principal Centralizado e Maior */}
              <h1 className="text-[36px] sm:text-[42px] font-black text-white leading-[1.05] tracking-tight mb-3.5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
                Seu próximo <br />
                destino é a <br />
                <span className="text-[#38bdf8]">aviação.</span>
              </h1>

              {/* Subtítulo Centralizado e Maior */}
              <p className="text-sm sm:text-base text-white/95 font-medium leading-relaxed max-w-[280px] sm:max-w-xs mx-auto mb-6 drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
                Prepare-se com simulados <br className="sm:hidden" /> e guias de carreira.
              </p>

              {/* Botões Centralizados */}
              <div className="flex items-center justify-center gap-3">
                {/* Botão Começar agora */}
                <Link
                  to={user ? '/simulados' : '/auth?mode=signup'}
                  className="inline-flex items-center gap-2 px-7 py-3 bg-white hover:bg-slate-50 text-[#08234a] font-bold text-sm sm:text-base rounded-full shadow-lg active:scale-95 transition-all"
                >
                  <span>Começar agora</span>
                  <ChevronRight className="w-4 h-4 text-[#08234a]" />
                </Link>

                {/* Botão Play */}
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-12 h-12 rounded-full border border-white/70 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
                  aria-label="Assistir apresentação"
                >
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </button>
              </div>
            </motion.div>

            {/* Espaçador Inferior para o piloto no mirante */}
            <div className="h-6" />
          </div>

          {/* Pílula Mobile: 50% no banner e 50% na seção abaixo */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-30">
            <a
              href="#proximo-passo"
              className="w-7 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-[#0066ff] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              aria-label="Rolar para próxima seção"
            >
              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-3.5 h-3.5 text-[#0066ff] stroke-[2.5]" />
              </motion.div>
            </a>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          3. MODAL DE VÍDEO / APRESENTAÇÃO DA PLATAFORMA
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-2xl rounded-[16px] overflow-hidden shadow-2xl border border-border relative"
            >
              <div className="p-4 flex items-center justify-between border-b border-border">
                <h3 className="font-bold text-base text-foreground">
                  Conheça o Voe Certo
                </h3>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 text-center space-y-4">
                <div className="aspect-video bg-slate-900 rounded-[12px] flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
                  <Play className="w-14 h-14 text-sky-400 mb-3 opacity-90" />
                  <p className="text-base font-semibold">Vídeo de Apresentação da Plataforma</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Simulados oficiais ANAC, guias interativos de carreira, mentoria com o Mike e selo oficial para o LinkedIn.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(false)}
                    className="px-5 py-2.5 rounded-[5px] bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
