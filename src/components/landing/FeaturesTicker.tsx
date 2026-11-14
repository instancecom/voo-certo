import { motion } from 'framer-motion';
import { BookOpen, Cpu, TrendingUp, ClipboardCheck } from 'lucide-react';

interface TickerItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TICKER_ITEMS: TickerItem[] = [
  {
    label: 'Guias de carreira',
    icon: BookOpen,
  },
  {
    label: 'Inteligência artificial',
    icon: Cpu,
  },
  {
    label: 'Seu progresso',
    icon: TrendingUp,
  },
  {
    label: 'Simulados',
    icon: ClipboardCheck,
  },
];

export function FeaturesTicker() {
  // Duplicamos os itens várias vezes para garantir loop contínuo infinito e sem emendas
  const marqueeItems = [
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
  ];

  return (
    <div className="relative w-full overflow-hidden bg-[#dff0fc] dark:bg-[#082247] border-y border-sky-200/90 dark:border-sky-900/80 py-3 sm:py-3.5 z-20 select-none">
      
      {/* Sombras suaves nas extremidades para entrada/saída elegante */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#dff0fc] dark:from-[#082247] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#dff0fc] dark:from-[#082247] to-transparent z-10 pointer-events-none" />

      {/* Faixa animada contínua com framer-motion */}
      <motion.div
        className="flex items-center whitespace-nowrap will-change-transform"
        animate={{
          x: ['0%', '-50%'],
        }}
        transition={{
          ease: 'linear',
          duration: 22,
          repeat: Infinity,
        }}
      >
        {marqueeItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4">
                <Icon className="w-5 h-5 text-[#0066ff] dark:text-sky-400 stroke-[2.2] shrink-0" />
                <span className="text-xs sm:text-sm font-bold tracking-tight text-[#08234a] dark:text-white">
                  {item.label}
                </span>
              </div>

              {/* Divisor vertical sutil entre os itens */}
              <div className="h-4 sm:h-5 w-[1px] bg-sky-300/80 dark:bg-sky-800/80 mx-3 sm:mx-4 shrink-0" />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
