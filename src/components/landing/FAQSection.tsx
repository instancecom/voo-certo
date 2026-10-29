import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'O que é o Voe Certo?',
    a: 'O Voe Certo é uma plataforma completa de preparação e aceleração de carreira para aviação civil. Oferecemos simulados fiéis à banca oficial da ANAC, diagnóstico inteligente de desempenho, mentoria com o Mike e gerador de currículo aeronáutico.',
  },
  {
    q: 'Como funciona o plano de assinatura?',
    a: 'Você escolhe o plano que melhor atende o seu momento (Solo, Tripulante ou Comandante). O acesso a todas as ferramentas contratadas é liberado imediatamente, permitindo que você estude no seu próprio ritmo pelo computador, tablet ou celular.',
  },
  {
    q: 'Quais são os métodos de pagamento?',
    a: 'Aceitamos cartão de crédito (com liberação instantânea e parcelamento) e Pix. Todo o processamento é 100% seguro, criptografado e operado por gateways de pagamento homologados.',
  },
  {
    q: 'Posso cancelar minha assinatura?',
    a: 'Sim! Você pode cancelar sua assinatura a qualquer momento com apenas um clique diretamente no seu painel de usuário, sem qualquer tipo de multa, fidelidade ou burocracia.',
  },
  {
    q: 'O conteúdo é atualizado com frequência?',
    a: 'Sim! Nosso banco de questões e materiais teóricos são revisados periodicamente com base nas diretrizes oficiais, editais públicos e atualizações dos Regulamentos Brasileiros da Aviação Civil (RBAC da ANAC).',
  },
  {
    q: 'O que é o Selo de Aprovação ANAC para o LinkedIn?',
    a: 'Ao ser aprovado na banca oficial da ANAC, você desbloqueia a insígnia Platina de Honra ao Mérito Voe Certo. Você pode adicionar essa certificação digital verificável diretamente ao seu perfil do LinkedIn para se destacar perante companhias aéreas e recrutadores.',
  },
  {
    q: 'Como o Mike (Inteligência Artificial) me ajuda?',
    a: 'O Mike é o seu parceiro de estudos 24/7. Ele explica questões alternativa por alternativa, analisa seu histórico de erros para criar diagnósticos de desempenho e formata seu currículo profissional pronto para processos seletivos.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      id="faq"
      className="py-20 md:py-32 bg-white dark:bg-[#071328] relative overflow-hidden border-b border-border/60"
    >
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── CABEÇALHO DA SEÇÃO ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-18"
        >
          {/* Balão de interrogação com linhas douradas */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-0.5 bg-amber-400/70 rounded-full" />
            <div className="relative flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-amber-500 fill-amber-400/10 stroke-[2.2]" />
              <span className="absolute inset-0 flex items-center justify-center text-amber-500 font-black text-sm pb-1">
                ?
              </span>
            </div>
            <div className="w-12 h-0.5 bg-amber-400/70 rounded-full" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#071328] dark:text-white tracking-tight leading-tight mb-4">
            Perguntas{' '}
            <span className="text-amber-500 dark:text-amber-400">Frequentes</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Tire suas dúvidas sobre o Voe Certo e descubra como podemos te ajudar a voar mais longe.
          </p>
        </motion.div>

        {/* ── LISTA ACCORDION COM DESIGN EM CÁPSULAS DA REFERÊNCIA ── */}
        <div className="max-w-3xl mx-auto space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className={`overflow-hidden transition-all duration-300 border ${
                  isOpen
                    ? 'rounded-[20px] bg-slate-50/90 dark:bg-[#0b1730] border-blue-200 dark:border-blue-900 shadow-md'
                    : 'rounded-full bg-white dark:bg-[#09162e] border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full py-4 sm:py-4.5 px-6 sm:px-8 flex items-center justify-between gap-4 text-left cursor-pointer select-none group"
                >
                  <span className={`text-sm sm:text-base font-bold transition-colors ${
                    isOpen 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-[#071328] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}>
                    {faq.q}
                  </span>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 sm:px-8 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal border-t border-slate-200/60 dark:border-slate-800/80">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}