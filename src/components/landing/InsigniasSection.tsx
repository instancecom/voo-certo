import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';

interface InsigniaItem {
  id: string;
  name: string;
  image: string;
  pillColor: string;
  glowColor: string;
  description: string;
  isSpecialLinkedIn?: boolean;
}

const INSIGNIAS: InsigniaItem[] = [
  {
    id: 'bronze',
    name: 'BRONZE',
    image: '/images/landing/insignia-bronze.png',
    pillColor: 'bg-[#93522b] text-white',
    glowColor: 'hover:shadow-amber-900/15',
    description: 'Você começou bem! Essa insígnia é o primeiro passo da sua jornada.',
  },
  {
    id: 'prata',
    name: 'PRATA',
    image: '/images/landing/insignia-prata.png',
    pillColor: 'bg-[#6b7c96] text-white',
    glowColor: 'hover:shadow-slate-500/15',
    description: 'Você já está evoluindo! Continua assim, o seu esforço está dando resultado.',
  },
  {
    id: 'ouro',
    name: 'OURO',
    image: '/images/landing/insignia-ouro.png',
    pillColor: 'bg-[#d99400] text-white',
    glowColor: 'hover:shadow-yellow-500/20',
    description: 'Você está entre os melhores! Sua dedicação te coloca em outro nível.',
  },
  {
    id: 'platina',
    name: 'PLATINA',
    image: '/images/landing/insignia-platina.png',
    pillColor: 'bg-[#0088ff] text-white',
    glowColor: 'hover:shadow-cyan-500/25',
    description: 'Você chegou longe! Essa é a prova de que todo seu esforço vale a pena.',
    isSpecialLinkedIn: true,
  },
];

export function InsigniasSection() {
  return (
    <section 
      id="insignias"
      className="py-20 md:py-32 bg-white dark:bg-[#071328] relative overflow-hidden border-b border-border/60"
    >
      {/* Elementos sutis de fundo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-400/5 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Aviãozinho decorativo no canto superior direito com rota pontilhada amarela */}
      <div className="hidden lg:flex items-center absolute top-12 right-12 xl:right-24 pointer-events-none opacity-90">
        <svg width="140" height="70" viewBox="0 0 140 70" fill="none">
          <path 
            d="M 10,55 Q 60,45 115,18" 
            stroke="#eab308" 
            strokeWidth="2" 
            strokeDasharray="4 4" 
            fill="none" 
          />
        </svg>
        <span className="text-[#071328] dark:text-amber-400 text-2xl -ml-2 -mt-10 transform rotate-12 inline-block">✈️</span>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── CABEÇALHO DA SEÇÃO ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          {/* Troféu dourado com linhas horizontais */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-0.5 bg-amber-400/70 rounded-full" />
            <span className="text-amber-500 text-2xl">🏆</span>
            <div className="w-12 h-0.5 bg-amber-400/70 rounded-full" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#071328] dark:text-white tracking-tight leading-tight mb-4">
            Conquiste suas{' '}
            <span className="text-amber-500 dark:text-amber-400">insígnias de progresso.</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Quanto mais você estuda e evolui, mais perto fica dos seus sonhos.
            <br className="hidden sm:inline" /> As insígnias são o seu reconhecimento por cada conquista.
          </p>
        </motion.div>

        {/* ── GRID DAS 4 INSÍGNIAS (BRONZE, PRATA, OURO, PLATINA/ANAC) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 max-w-6xl mx-auto items-stretch">
          {INSIGNIAS.map((badge, idx) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className={`flex flex-col items-center text-center p-6 rounded-[16px] bg-slate-50/60 dark:bg-card/40 border border-slate-100 dark:border-border/60 transition-all ${badge.glowColor} group`}
            >
              {/* Medalha 3D */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center mb-5 relative">
                <motion.img
                  src={badge.image}
                  alt={`Insígnia ${badge.name}`}
                  className="w-full h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300 select-none"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3.5 + idx * 0.4, 
                    ease: "easeInOut" 
                  }}
                  onError={(e) => {
                    // Fallback para imagem de selo da ANAC caso platina
                    if (badge.id === 'platina') {
                      e.currentTarget.src = '/images/isg_aprovado_anac.png';
                    }
                  }}
                />
              </div>

              {/* Tag / Pill do Nível */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 px-6 py-1.5 rounded-full text-xs font-black tracking-widest shadow-xs ${badge.pillColor}`}>
                  {badge.name}
                  {badge.isSpecialLinkedIn && (
                    <Linkedin className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </span>
              </div>

              {/* Descrição breve */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-[220px]">
                {badge.description}
              </p>

              {/* Destaque especial para Platina/LinkedIn */}
              {badge.isSpecialLinkedIn && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-border/60 w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-cyan-400">
                  <span>🎖️ Selo Oficial ANAC LinkedIn</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}