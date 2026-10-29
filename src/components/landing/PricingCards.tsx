import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Send, Crown, Gem, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  icon: any;
  description: string;
  features: string[];
  highlight: boolean;
  popular: boolean;
  checkoutLink: string;
}

interface PricingCardsProps {
  plans: Plan[];
}

export function PricingCards({ plans }: PricingCardsProps) {
  return (
    <section 
      id="planos"
      className="py-20 md:py-32 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-[#071328] dark:via-[#091a36] dark:to-[#071328] relative overflow-hidden border-b border-border/60"
    >
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-400/5 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

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
          {/* Coroa dourada com linhas horizontais */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-0.5 bg-amber-400/70 rounded-full" />
            <Crown className="w-6 h-6 text-amber-500" />
            <div className="w-12 h-0.5 bg-amber-400/70 rounded-full" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#071328] dark:text-white tracking-tight leading-tight mb-4">
            Escolha o plano ideal <br className="hidden sm:inline" />
            <span className="text-amber-500 dark:text-amber-400">para a sua jornada.</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Tenha acesso a todos os conteúdos, guias e ferramentas que vão te ajudar a conquistar o seu sonho de voar.
          </p>
        </motion.div>

        {/* ── GRID DOS 3 CARDS DE PLANOS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, idx) => {
            const isCenter = plan.highlight || plan.popular;

            // Ícones customizados alinhados ao estilo visual da referência
            const PlanIcon = plan.id === 'solo' 
              ? Send 
              : plan.id === 'tripulante' 
                ? Crown 
                : Gem;

            // Cores do box do ícone
            const iconBg = plan.id === 'tripulante'
              ? 'bg-amber-100/70 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60'
              : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60';

            // Cores dos checkmarks
            const checkColor = isCenter
              ? 'text-amber-500 dark:text-amber-400'
              : 'text-blue-600 dark:text-blue-400';

            // Separação do valor numérico para tipografia no padrão do print (R$ menor, 39 maior, ,90 menor)
            const cleanPrice = plan.price.replace('R$', '').trim();
            const [reais, centavos] = cleanPrice.includes(',') 
              ? cleanPrice.split(',') 
              : [cleanPrice, '00'];

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                className="h-full flex"
              >
                <div
                  className={`w-full flex flex-col justify-between rounded-[20px] transition-all duration-300 relative bg-white dark:bg-[#0b1730] p-6 sm:p-8 ${
                    isCenter
                      ? 'border-2 border-amber-400 dark:border-amber-500 shadow-2xl shadow-amber-500/10 -translate-y-1 lg:-translate-y-2 ring-1 ring-amber-400/20'
                      : 'border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Badge de Destaque no topo do card central (☆ MAIS ESCOLHIDO) */}
                  {isCenter && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#071d44] text-amber-400 text-[10px] font-black px-4 py-1 uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5 border border-amber-400/30">
                      <span>★</span> MAIS ESCOLHIDO
                    </div>
                  )}

                  {/* Topo do Card: Ícone à esquerda + Nome e Descrição à direita */}
                  <div>
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0 ${iconBg}`}>
                        <PlanIcon className="w-6 h-6" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl font-black text-[#071328] dark:text-white tracking-tight leading-tight">
                          Plano {plan.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-snug mt-0.5">
                          {plan.description}
                        </p>
                      </div>
                    </div>

                    {/* Preço Formatado no Estilo da Referência */}
                    <div className="mb-7 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-baseline">
                        <span className="text-base sm:text-lg font-black text-[#071328] dark:text-white mr-1">
                          R$
                        </span>
                        <span className="text-4xl sm:text-5xl font-black text-[#071328] dark:text-white tracking-tight leading-none">
                          {reais}
                        </span>
                        <div className="flex flex-col ml-1">
                          <span className="text-lg font-black text-[#071328] dark:text-white leading-tight">
                            ,{centavos}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {plan.period}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Benefícios da Plataforma com Checkmarks */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${checkColor}`} />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Botão de Ação (Mantendo strict rounded-[5px]) */}
                  <div>
                    <Button
                      asChild
                      className={`w-full h-12 font-bold text-sm tracking-wide transition-all rounded-[5px] flex items-center justify-center gap-2 ${
                        isCenter
                          ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-md shadow-amber-400/20'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200/70 dark:border-blue-900'
                      }`}
                    >
                      <Link to={plan.checkoutLink}>
                        Assinar agora <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}