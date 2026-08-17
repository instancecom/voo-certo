import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ChevronRight } from 'lucide-react';

export const FAQSection = () => {
  const faqs = [
    {
      q: 'Como funciona o acesso à plataforma?',
      a: 'Ao assinar qualquer um dos planos, seu acesso a todas as ferramentas e conteúdos contratados é liberado imediatamente. Você pode estudar no seu próprio ritmo pelo computador, tablet ou celular.',
    },
    {
      q: 'O Voe Certo é afiliado ou oficial da ANAC?',
      a: 'Não. O Voe Certo é uma plataforma educacional independente com foco em preparação técnica e aceleração de carreira. Nossas questões e simulados são rigorosamente elaborados com base nos editais públicos e bancas da ANAC.',
    },
    {
      q: 'Como funciona a mentoria dos professores de Inteligência Artificial?',
      a: 'Nossa plataforma conta com o Mike, assistente completo de IA do Voe Certo. Ele tira dúvidas técnicas sobre matérias e bancas, realiza diagnóstico de desempenho personalizado e auxilia na criação do seu currículo aeronáutico — tudo em um só lugar.',
    },
    {
      q: 'O que é o Selo de Aprovação do LinkedIn?',
      a: 'É uma certificação digital de Honra ao Mérito que você desbloqueia na plataforma ao conquistar a aprovação oficial no exame da ANAC. Ele pode ser adicionado à sua seção de licenças e certificados do LinkedIn com link de validação.',
    },
    {
      q: 'Posso acessar a plataforma pelo celular ou tablet?',
      a: 'Sim! Toda a plataforma é 100% responsiva e otimizada para smartphones, tablets e computadores, permitindo que você estude no trânsito, em viagens ou no conforto de casa.',
    },
    {
      q: 'Como funciona o cancelamento da assinatura?',
      a: 'O cancelamento pode ser feito a qualquer momento diretamente no seu painel de usuário, sem qualquer tipo de fidelidade, multa ou burocracia.',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-card/40 border-y border-border relative overflow-hidden" id="faq">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <Badge variant="outline" className="mb-4 text-accent border-accent/30 rounded-[5px] bg-accent/10 font-bold uppercase text-[11px] tracking-wider px-3.5 py-1">
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Dúvidas Frequentes
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-5 leading-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            Tudo o que você precisa saber antes de iniciar sua jornada.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group bg-card border border-border rounded-[5px] overflow-hidden transition-all duration-200"
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer text-foreground font-bold text-base hover:text-accent list-none transition-colors">
                <span>{faq.q}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-4" />
              </summary>
              <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed font-normal border-t border-border/40 pt-4">
                {faq.a}
              </div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
};
