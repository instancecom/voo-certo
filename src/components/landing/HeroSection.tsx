import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUpRight, ClipboardCheck, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section
      id="inicio"
      className="relative min-h-[92vh] md:min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-[#bfe0f8] via-[#cce6fa] to-[#e4f1fc] dark:from-[#071328] dark:via-[#091a36] dark:to-[#071328]"
    >
      {/* ── IMAGEM DE FUNDO (CÉU E AVIÃO) ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/landing/hero-bg.jpg"
          alt="Voe Certo - Preparação para Carreiras na Aviação"
          className="w-full h-full object-cover object-[center_28%] lg:object-[center_35%]"
          loading="eager"
          decoding="async"
        />

        {/* Gradiente sutil para harmonizar leitura */}
        <div className="absolute inset-0 bg-gradient-to-t from-sky-100/40 via-transparent to-sky-900/10 dark:from-[#071328] dark:via-[#071328]/50 dark:to-transparent pointer-events-none" />
      </div>

      {/* ── LETREIRO D'ÁGUA "AVIAÇÃO" AO FUNDO ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-[1]">
        <span className="text-[14vw] lg:text-[18vw] font-serif font-black tracking-[0.14em] text-white/35 dark:text-white/10 uppercase -translate-y-16 lg:-translate-y-24 whitespace-nowrap">
          AVIAÇÃO
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          1. VERSÃO DESKTOP (EXIBIDA APENAS EM lg:flex)
          Layout amplo com texto à esquerda e 3 cards flutuantes à direita
         ══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block container mx-auto px-6 xl:px-10 py-28 relative z-10 w-full">
        <div className="grid grid-cols-12 gap-6 items-end min-h-[520px]">
          
          {/* Coluna Esquerda: Kicker, Título, Subtítulo e Botões */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="col-span-7 xl:col-span-6 text-left pb-4"
          >
            {/* Tag / Kicker */}
            <p className="text-xs xl:text-sm font-bold uppercase tracking-[0.22em] text-[#143360] dark:text-sky-300 mb-3 drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]">
              PREPARAÇÃO PARA CARREIRAS NA AVIAÇÃO
            </p>

            {/* Título Principal */}
            <h1 className="text-5xl xl:text-6xl 2xl:text-[68px] font-black text-white leading-[1.08] tracking-tight mb-5 drop-shadow-[0_2px_12px_rgba(8,35,74,0.45)]">
              Seu próximo <br />
              destino é a aviação.
            </h1>

            {/* Subtítulo */}
            <p className="text-base xl:text-lg text-white/95 font-medium leading-relaxed max-w-lg mb-8 drop-shadow-[0_1px_6px_rgba(8,35,74,0.35)]">
              Prepare-se com simulados, guias de carreira e ferramentas para acompanhar sua evolução.
            </p>

            {/* Botões de Ação com strictly rounded-[5px] */}
            <div className="flex items-center gap-3.5">
              {/* Botão 1: Começar agora */}
              <Button
                asChild
                className="h-12 px-7 bg-[#0066ff] hover:bg-blue-600 text-white font-bold text-sm rounded-[5px] shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Link to={user ? '/simulados' : '/auth?mode=signup'}>
                  <span>Começar agora</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              {/* Botão 2: Conhecer a plataforma */}
              <Button
                variant="outline"
                asChild
                className="h-12 px-6 bg-white hover:bg-slate-50 text-[#08234a] border-white/80 hover:border-white font-bold text-sm rounded-[5px] shadow-md transition-all flex items-center justify-center cursor-pointer"
              >
                <a href="#plataforma">
                  Conhecer a plataforma
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Coluna Direita: 3 Cards Flutuantes de Vidro (Bottom-Right) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="col-span-5 xl:col-span-6 flex items-end justify-end gap-3.5 xl:gap-4 pb-4"
          >
            {/* Card 1: Simulados */}
            <Link
              to="/simulados"
              className="w-[155px] xl:w-[172px] p-4 rounded-[14px] bg-white/80 dark:bg-[#071938]/80 backdrop-blur-md border border-white/90 dark:border-white/10 shadow-xl hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between min-h-[145px]"
            >
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-blue-600">
                  <ClipboardCheck className="w-7 h-7 stroke-[2.2]" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <h4 className="text-sm xl:text-base font-bold text-[#08234a] dark:text-white leading-tight mb-1">
                  Simulados
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight">
                  Pratique para sua preparação.
                </p>
              </div>
            </Link>

            {/* Card 2: IA de carreira (com esfera 3D) */}
            <Link
              to="/curriculo"
              className="w-[155px] xl:w-[172px] p-4 rounded-[14px] bg-white/80 dark:bg-[#071938]/80 backdrop-blur-md border border-white/90 dark:border-white/10 shadow-xl hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between min-h-[145px]"
            >
              <div className="flex items-start justify-between">
                {/* Esfera 3D Azul */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0240b8] via-[#0575e6] to-[#00d2ff] shadow-md shadow-blue-500/30 relative overflow-hidden flex items-center justify-center shrink-0">
                  <div className="absolute top-1 left-1.5 w-2 h-2 bg-white/85 rounded-full blur-[0.3px]" />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-950/40 rounded-full blur-[1px]" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <h4 className="text-sm xl:text-base font-bold text-[#08234a] dark:text-white leading-tight mb-1">
                  IA de carreira
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight">
                  Ferramentas para evoluir.
                </p>
              </div>
            </Link>

            {/* Card 3: Seu progresso */}
            <Link
              to="/meu-progresso"
              className="w-[155px] xl:w-[172px] p-4 rounded-[14px] bg-white/80 dark:bg-[#071938]/80 backdrop-blur-md border border-white/90 dark:border-white/10 shadow-xl hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between min-h-[145px]"
            >
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-blue-600">
                  <BarChart3 className="w-7 h-7 stroke-[2.2]" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <h4 className="text-sm xl:text-base font-bold text-[#08234a] dark:text-white leading-tight mb-1">
                  Seu progresso
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight">
                  Acompanhe sua evolução.
                </p>
              </div>
            </Link>

          </motion.div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          2. VERSÃO MOBILE (EXIBIDA APENAS EM lg:hidden)
          Estrutura vertical com avião no topo e textos escuros centralizados
         ══════════════════════════════════════════════════════════════ */}
      <div className="block lg:hidden container mx-auto px-5 pt-28 pb-8 relative z-10 w-full flex flex-col justify-between min-h-[92vh]">
        
        {/* Espaçador para o Avião aparecer no topo */}
        <div className="min-h-[160px] sm:min-h-[220px]" />

        {/* Bloco Central de Textos e CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-sm mx-auto w-full"
        >
          {/* Kicker */}
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#143360] dark:text-sky-300 mb-2">
            PREPARAÇÃO PARA CARREIRAS NA AVIAÇÃO
          </p>

          {/* Título Principal */}
          <h1 className="text-4xl sm:text-[44px] font-black text-[#08234a] dark:text-white leading-[1.08] tracking-tight mb-3">
            Seu próximo <br />
            destino é a <br />
            aviação.
          </h1>

          {/* Subtítulo */}
          <p className="text-sm sm:text-base text-[#244675] dark:text-slate-300 font-medium leading-relaxed mb-6 max-w-[280px] sm:max-w-xs mx-auto">
            Prepare-se com simulados e guias de carreira.
          </p>

          {/* Botões Verticais (strictly rounded-[5px]) */}
          <div className="flex flex-col gap-3 w-full">
            {/* Botão 1: Começar agora */}
            <Button
              asChild
              className="w-full h-12 bg-[#0066ff] hover:bg-blue-600 text-white font-bold text-sm rounded-[5px] shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Link to={user ? '/simulados' : '/auth?mode=signup'}>
                <span>Começar agora</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            {/* Botão 2: Conhecer a plataforma */}
            <Button
              variant="outline"
              asChild
              className="w-full h-12 bg-white/70 dark:bg-white/10 hover:bg-white/90 text-[#08234a] dark:text-white border-[#08234a]/30 dark:border-white/20 font-bold text-sm rounded-[5px] flex items-center justify-center cursor-pointer"
            >
              <a href="#plataforma">
                Conhecer a plataforma
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Ticker Inferior Mobile */}
        <div className="pt-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#244675]/80 dark:text-slate-400">
            SIMULADOS &nbsp;&bull;&nbsp; GUIAS &nbsp;&bull;&nbsp; PROGRESSO
          </p>
        </div>

      </div>
    </section>
  );
};
