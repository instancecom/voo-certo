import { motion } from 'framer-motion';
import { 
  BookOpen, Sparkles, TrendingUp, ClipboardCheck, 
  FileText, Award, Bot
} from 'lucide-react';

interface FeatureItem {
  label: string;
  icon: React.ReactNode;
}

const FEATURES: FeatureItem[] = [
  {
    label: 'Simulados',
    icon: (
      <div className="relative flex items-center justify-center">
        <ClipboardCheck className="w-5 h-5 text-[#1e40af]" />
      </div>
    ),
  },
  {
    label: 'Guias de carreira',
    icon: (
      <div className="relative flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-[#1e40af]" />
      </div>
    ),
  },
  {
    label: 'Inteligência artificial',
    icon: (
      <div className="relative flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[#1e40af] flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#1e40af] leading-none">:)</span>
        </div>
        <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500 absolute -top-1 -right-1" />
      </div>
    ),
  },
  {
    label: 'Seu progresso',
    icon: (
      <div className="relative flex items-center justify-center">
        <TrendingUp className="w-5 h-5 text-amber-500" />
      </div>
    ),
  },
  {
    label: 'Currículo IA',
    icon: (
      <div className="relative flex items-center justify-center">
        <FileText className="w-5 h-5 text-[#1e40af]" />
        <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500 absolute -top-1 -right-1" />
      </div>
    ),
  },
  {
    label: 'Selo ANAC LinkedIn',
    icon: (
      <div className="relative flex items-center justify-center">
        <Award className="w-5 h-5 text-amber-500" />
      </div>
    ),
  },
];

export function FeaturesTicker() {
  // Duplicamos os itens para garantir o loop contínuo infinito sem cortes
  const marqueeItems = [...FEATURES, ...FEATURES, ...FEATURES, ...FEATURES];

  return (
    <div className="relative w-full overflow-hidden bg-slate-50/95 dark:bg-[#071328] border-y border-slate-200/80 dark:border-slate-800 py-3.5 sm:py-4 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      
      {/* Sombras suaves nas bordas laterais para efeito de entrada/saída gradual */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-slate-50 dark:from-[#071328] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-slate-50 dark:from-[#071328] to-transparent z-10 pointer-events-none" />

      {/* Faixa animada que corre infinitamente */}
      <motion.div
        className="flex items-center whitespace-nowrap will-change-transform"
        animate={{
          x: ['0%', '-50%'],
        }}
        transition={{
          ease: 'linear',
          duration: 35,
          repeat: Infinity,
        }}
      >
        {marqueeItems.map((item, idx) => (
          <div key={idx} className="flex items-center shrink-0">
            <div className="flex items-center gap-2.5 px-4 sm:px-6">
              <span className="shrink-0">{item.icon}</span>
              <span className="text-xs sm:text-sm font-semibold tracking-tight text-[#1e3a8a] dark:text-slate-200">
                {item.label}
              </span>
            </div>
            
            {/* Divisor vertical */}
            <span className="text-slate-300 dark:text-slate-700/80 font-light select-none text-sm">
              |
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
