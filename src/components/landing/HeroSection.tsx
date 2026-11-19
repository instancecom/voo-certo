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
      className="relative bg-white dark:bg-[#071328] pt-20 md:pt-24 pb-8 sm:pb-12 overflow-visible"
    >
      {/* ══════════════════════════════════════════════════════════════
          1. VERSÃO DESKTOP (EXIBIDA APENAS EM lg:block)
          Card amplo com cantos arredondados, imagem de fundo da aviação,
          textos à esquerda e botões de ação (Começar agora + Play).
         ══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1360px] rounded-[32px] overflow-hidden relative shadow-2xl min-h-[520px] lg:min-h-[580px] xl:min-h-[620px] flex items-center">
          
          {/* Imagem de Fundo (Banner da Aviação) */}
          <img
            src="/images/landing/hero-bg.jpg"
            alt="Voe Certo - Preparação para Carreiras na Aviação"
            className="absolute inset-0 w-full h-full object-cover object-[center_35%] select-none"
            loading="eager"
            decoding="async"
          />

          {/* Gradiente sutil para garantir legibilidade perfeita dos textos brancos */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent pointer-events-none" />

          {/* Conteúdo à Esquerda */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="relative z-10 p-10 lg:p-14 xl:p-16 max-w-2xl text-left"
          >
            {/* Título Principal */}
            <h1 className="text-5xl lg:text-6xl xl:text-[68px] font-black text-white leading-[1.06] tracking-tight mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              Seu próximo <br />
              destino é a <br />
              <span className="text-[#38bdf8]">aviação.</span>
            </h1>

            {/* Subtítulo */}
            <p className="text-base lg:text-lg text-white/95 font-medium leading-relaxed max-w-md mb-8 drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
              Prepare-se com simulados e guias de carreira.
            </p>

            {/* Botões de Ação */}
            <div className="flex items-center gap-4">
              {/* Botão Principal: Começar agora */}
              <Link
                to={user ? '/simulados' : '/auth?mode=signup'}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-slate-50 text-[#08234a] font-bold text-sm lg:text-base rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
              >
                <span>Começar agora</span>
                <ChevronRight className="w-4 h-4 text-[#08234a] transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Botão Play / Apresentação */}
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="w-12 h-12 rounded-full border border-white/70 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all group cursor-pointer"
                aria-label="Assistir apresentação"
              >
                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              </button>
            </div>
          </motion.div>

          {/* Notch / Indicador de Rolagem na Borda Inferior */}
          <a
            href="#proximo-passo"
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-8 h-12 rounded-full border-2 border-white bg-white shadow-md flex items-center justify-center text-[#0066ff] hover:scale-105 transition-transform z-20"
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

      {/* ══════════════════════════════════════════════════════════════
          2. VERSÃO MOBILE (EXIBIDA APENAS EM lg:hidden)
          Card compacto com cantos arredondados, conteúdo centralizado,
          botões arredondados e notch inferior com seta.
         ══════════════════════════════════════════════════════════════ */}
      <div className="block lg:hidden px-3.5 sm:px-5">
        <div className="rounded-[26px] sm:rounded-[30px] overflow-hidden relative shadow-xl min-h-[560px] sm:min-h-[620px] flex flex-col justify-between py-10 px-5 sm:px-8">
          
          {/* Imagem de Fundo (Banner da Aviação Mobile) */}
          <img
            src="/images/landing/hero-bg.jpg"
            alt="Voe Certo - Preparação para Carreiras na Aviação"
            className="absolute inset-0 w-full h-full object-cover object-[70%_center] select-none"
            loading="eager"
            decoding="async"
          />

          {/* Gradiente para contraste do texto centralizado */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/50 pointer-events-none" />

          {/* Espaçador Superior */}
          <div className="h-6 sm:h-10" />

          {/* Bloco Central de Textos e CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center max-w-sm mx-auto w-full my-auto"
          >
            {/* Título Principal Centralizado */}
            <h1 className="text-[34px] sm:text-4xl font-black text-white leading-[1.08] tracking-tight mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              Seu próximo <br />
              destino é a <br />
              <span className="text-[#38bdf8]">aviação.</span>
            </h1>

            {/* Subtítulo Centralizado */}
            <p className="text-sm sm:text-base text-white/95 font-medium leading-relaxed max-w-[260px] sm:max-w-xs mx-auto mb-6 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">
              Prepare-se com simulados <br className="sm:hidden" /> e guias de carreira.
            </p>

            {/* Botões Centralizados */}
            <div className="flex items-center justify-center gap-3">
              {/* Botão Começar agora */}
              <Link
                to={user ? '/simulados' : '/auth?mode=signup'}
                className="inline-flex items-center gap-1.5 px-6 py-3 bg-white hover:bg-slate-50 text-[#08234a] font-bold text-sm rounded-full shadow-md active:scale-95 transition-all"
              >
                <span>Começar agora</span>
                <ChevronRight className="w-4 h-4 text-[#08234a]" />
              </Link>

              {/* Botão Play */}
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="w-11 h-11 rounded-full border border-white/70 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                aria-label="Assistir apresentação"
              >
                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
              </button>
            </div>
          </motion.div>

          {/* Espaçador Inferior */}
          <div className="h-4" />

          {/* Notch / Indicador de Rolagem na Borda Inferior Mobile */}
          <a
            href="#proximo-passo"
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-7 h-10 rounded-full border-2 border-white bg-white shadow-md flex items-center justify-center text-[#0066ff] hover:scale-105 transition-transform z-20"
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
