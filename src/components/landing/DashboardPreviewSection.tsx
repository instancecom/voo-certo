import { motion } from 'framer-motion';

export function DashboardPreviewSection() {
  return (
    <section 
      id="dashboard"
      className="pt-16 sm:pt-20 md:pt-28 pb-0 bg-white dark:bg-[#071328] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── CABEÇALHO DA SEÇÃO ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          {/* Título Principal */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.08] text-[#08234a] dark:text-white mb-3 sm:mb-4">
            Acompanhe seu progresso <br />
            com o Painel de Desempenho.
          </h2>

          {/* Subtítulo com traço sutil de voo */}
          <div className="relative inline-block max-w-xl mx-auto">
            <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              Entenda onde você está, o que já evoluiu e o que ainda precisa melhorar. <br className="hidden sm:inline" />
              Tudo de forma simples e visual.
            </p>

            {/* Linha curva suave decorativa na direita */}
            <svg
              className="hidden sm:block absolute -right-8 top-4 w-12 h-6 text-sky-400/80 pointer-events-none"
              viewBox="0 0 50 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 2,18 C 20,22 38,12 48,2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </motion.div>

        {/* ── MOCKUP DO DASHBOARD (tela_dashboard.png) ── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-5xl mx-auto"
        >
          {/* Moldura elegante com topo arredondado */}
          <div className="rounded-t-[20px] sm:rounded-t-[32px] md:rounded-t-[40px] bg-white dark:bg-[#071938] border-t border-x border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-blue-900/10 p-2 sm:p-4 md:p-5 pb-0 overflow-hidden ring-1 ring-black/5">
            <img
              src="/images/landing/tela_dashboard.png"
              alt="Painel de Progresso e Desempenho - Voe Certo"
              className="w-full h-auto object-cover object-top rounded-t-[14px] sm:rounded-t-[22px] md:rounded-t-[28px] select-none pointer-events-none"
              loading="lazy"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
