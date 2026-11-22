import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface ExamMode {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

const EXAM_MODES: ExamMode[] = [
  {
    id: 'anac',
    title: 'Modo ANAC',
    description: 'Simulados no formato da prova oficial.',
    image: '/images/landing/modo-anac-clock.png',
    link: '/simulados/anac',
  },
  {
    id: 'livre',
    title: 'Modo Livre',
    description: 'Crie simulados personalizados e estude no seu ritmo.',
    image: '/images/landing/modo-livre-hourglass.png',
    link: '/simulados/livre',
  },
  {
    id: 'bloco',
    title: 'Modo Bloco',
    description: 'Foque em um assunto de cada vez.',
    image: '/images/landing/modo-bloco-bricks.png',
    link: '/simulados/bloco',
  },
];

export function ExamModesSection() {
  const { user } = useAuth();

  return (
    <section
      id="modos"
      className="py-16 sm:py-20 md:py-28 bg-white dark:bg-[#071328] relative overflow-hidden"
    >
      {/* ── NUVEM AZUL 1 (CANTO SUPERIOR DIREITO - ANIMAÇÃO DE ENTRADA NO SCROLL) ── */}
      <motion.div
        initial={{ opacity: 0, x: 110, y: -15 }}
        whileInView={{ opacity: 0.9, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -top-6 -right-12 sm:-right-8 w-48 sm:w-64 md:w-80 lg:w-96 pointer-events-none select-none z-0"
      >
        <motion.img
          src="/images/landing/nuvem_azul.png"
          alt="Nuvem decorativa azul"
          className="w-full h-auto object-contain"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* ── NUVEM AZUL 2 (CANTO INFERIOR ESQUERDO - ANIMAÇÃO DE ENTRADA NO SCROLL) ── */}
      <motion.div
        initial={{ opacity: 0, x: -110, y: 15 }}
        whileInView={{ opacity: 0.9, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-10 -left-12 sm:-left-8 w-48 sm:w-64 md:w-80 lg:w-96 pointer-events-none select-none z-0"
      >
        <motion.img
          src="/images/landing/nuvem_azul.png"
          alt="Nuvem decorativa azul"
          className="w-full h-auto object-contain"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.5 }}
        />
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── CABEÇALHO DA SEÇÃO ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.08] mb-3">
            <span className="text-[#0066ff] block">3 modos</span>
            <span className="text-[#08234a] dark:text-white block">treine como quiser</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
            Escolha o modo ideal para o seu momento e evolua mais rápido.
          </p>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            1. VERSÃO DESKTOP (EXIBIDA APENAS EM md:grid)
            3 cards lado a lado com ilustrações 3D
           ══════════════════════════════════════════════════════════════ */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch mb-10 sm:mb-12">
          {EXAM_MODES.map((mode, idx) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="h-full"
            >
              <Link
                to={mode.link}
                className="block h-full bg-white dark:bg-[#081e3d] rounded-[20px] p-6 lg:p-7 border border-blue-100/90 dark:border-blue-900/40 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-center flex flex-col items-center justify-between group"
              >
                {/* Ilustração 3D */}
                <div className="w-36 h-36 flex items-center justify-center relative my-2">
                  <img
                    src={mode.image}
                    alt={mode.title}
                    className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Textos */}
                <div className="mt-2">
                  <h3 className="font-black text-lg sm:text-xl text-[#08234a] dark:text-white mb-1.5 group-hover:text-[#0066ff] transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-[210px] mx-auto">
                    {mode.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            2. VERSÃO MOBILE (EXIBIDA APENAS EM md:hidden)
            Grade 2x2 com 2 cards em cima e 1 card embaixo (conforme print)
           ══════════════════════════════════════════════════════════════ */}
        <div className="grid md:hidden grid-cols-2 gap-3.5 max-w-sm mx-auto mb-8">
          {EXAM_MODES.map((mode, idx) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="h-full"
            >
              <Link
                to={mode.link}
                className="block h-full bg-white dark:bg-[#081e3d] rounded-[18px] p-4 border border-blue-100/90 dark:border-blue-900/40 shadow-xs active:scale-98 transition-all text-center flex flex-col items-center justify-between"
              >
                {/* Ilustração 3D */}
                <div className="w-24 h-24 flex items-center justify-center relative my-1">
                  <img
                    src={mode.image}
                    alt={mode.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Textos */}
                <div>
                  <h3 className="font-black text-sm text-[#08234a] dark:text-white mb-1">
                    {mode.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-snug">
                    {mode.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── BOTÃO COMEÇAR AGORA (CENTRALIZADO COM strictly rounded-[5px]) ── */}
        <div className="flex justify-center">
          <Button
            asChild
            className="h-11 sm:h-12 px-8 sm:px-10 bg-[#0066ff] hover:bg-blue-600 text-white font-bold text-sm sm:text-base rounded-[5px] shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Link to={user ? '/simulados' : '/auth?mode=signup'}>
              Começar agora
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
