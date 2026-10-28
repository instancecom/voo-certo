import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section
      id="inicio"
      className="relative min-h-[92vh] md:min-h-screen flex items-center overflow-hidden bg-[#071328]"
    >
      {/* ── IMAGEM DE FUNDO COM O MIKE E A PISTA DE POUSO ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/landing/hero-bg.jpg"
          alt="Voe Certo - Seu próximo passo na aviação começa aqui"
          className="w-full h-full object-cover object-[center_right] sm:object-center lg:object-[80%_center]"
          loading="eager"
          decoding="async"
        />

        {/* Gradiente de leitura escuro do lado esquerdo para garantir legibilidade perfeita */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071328] via-[#071328]/85 to-transparent sm:via-[#071328]/70 lg:via-[#071328]/50 lg:w-[65%]" />
        
        {/* Vinheta sutil na base para transição com a próxima seção */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#071328] to-transparent pointer-events-none" />
      </div>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 md:py-36 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Coluna Esquerda: Textos e CTAs (7 colunas) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-7 text-left"
          >
            {/* Título Principal */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] xl:text-[76px] font-black text-white tracking-tight leading-[1.08] mb-6">
              Seu próximo passo<br />
              na aviação começa<br />
              <span className="text-amber-400">aqui.</span>
            </h1>

            {/* Sub-descrição */}
            <p className="text-base sm:text-lg md:text-xl text-slate-200/90 font-normal leading-relaxed max-w-xl mb-8 sm:mb-10">
              Prepare-se, evolua e conquiste seu espaço no setor aeronáutico com a Voe Certo.
            </p>

            {/* Botões de Ação (Ambos com rounded-[5px]) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8">
              {/* Botão 1: Começar agora */}
              <Button
                asChild
                className="h-12 sm:h-13 md:h-14 px-7 sm:px-8 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base rounded-[5px] shadow-lg shadow-amber-400/20 hover:shadow-amber-400/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Link to={user ? '/simulados' : '/auth?mode=signup'}>
                  <span>Começar agora</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              {/* Botão 2: Conheça a plataforma */}
              <Button
                variant="outline"
                asChild
                className="h-12 sm:h-13 md:h-14 px-6 sm:px-7 bg-white/5 hover:bg-white/10 text-white border-white/25 hover:border-white/50 font-semibold text-sm sm:text-base rounded-[5px] backdrop-blur-sm transition-all flex items-center justify-center cursor-pointer"
              >
                <a href="#plataforma">
                  Conheça a plataforma
                </a>
              </Button>
            </div>

            {/* Nota legal sutil */}
            <p className="text-[11px] text-slate-400/70 max-w-lg leading-relaxed">
              * Plataforma independente de simulados e preparação para certificações aeronáuticas.
            </p>
          </motion.div>

          {/* Coluna Direita: Espaço reservado para o Mike simulando asas de avião (5 colunas) */}
          <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative min-h-[420px] pointer-events-none">
            {/* Caso queira sobrepor o Mike como elemento PNG separado no futuro, ele fica ancorado aqui */}
          </div>

        </div>
      </div>
    </section>
  );
};
