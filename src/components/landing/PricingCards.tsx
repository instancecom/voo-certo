import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plane, Zap, Crown, CheckCircle2, Shield, Sparkles, Globe, ArrowRight } from 'lucide-react';

interface Plan {
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

export const PricingCards = ({ plans }: PricingCardsProps) => {
  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden" id="planos">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <Badge variant="outline" className="mb-4 text-accent border-accent/30 rounded-[5px] bg-accent/10 font-bold uppercase text-[11px] tracking-wider px-3.5 py-1">
            <Crown className="w-3.5 h-3.5 mr-1.5" /> Planos Transparentes
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-5 leading-tight">
            Escolha o plano ideal para a sua <span className="text-accent">transformação</span>.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            Comece hoje com 7 dias grátis. Cancele a qualquer momento com um único clique.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="h-full"
              >
                <Card
                  className={`h-full flex flex-col justify-between relative rounded-[5px] transition-all duration-300 shadow-xl hover:-translate-y-1.5 ${
                    plan.highlight
                      ? 'bg-card border-2 border-accent shadow-accent/10'
                      : 'bg-card border-border hover:border-accent/40'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-black px-3.5 py-1 uppercase tracking-wider rounded-bl-[5px]">
                      Mais Escolhido
                    </div>
                  )}

                  <CardHeader className="text-center pt-8 pb-6 px-6">
                    <div
                      className={`w-14 h-14 rounded-[5px] flex items-center justify-center mx-auto mb-4 ${
                        plan.highlight ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-primary/5 text-primary border border-border'
                      }`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>

                    <CardTitle className="text-2xl font-bold text-foreground mb-1">{plan.name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-medium">{plan.description}</p>

                    <div className="mt-6 flex items-baseline justify-center gap-1">
                      <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">{plan.price}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-between px-6 pb-8">
                    <ul className="space-y-3.5 mb-8 flex-1">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-xs text-foreground/90 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.highlight ? 'hero' : 'outline'}
                      size="lg"
                      className="w-full rounded-[5px] font-bold text-sm h-12 hover-yellow shadow-md"
                      asChild
                    >
                      <Link to={plan.checkoutLink} className="flex items-center justify-center gap-2">
                        Assinar Agora <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Guarantees & Trust Banner */}
        <div className="bg-card border border-border rounded-[5px] p-6 sm:p-8 max-w-4xl mx-auto shadow-lg">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, text: 'Cancelamento sem burocracia' },
              { icon: Sparkles, text: 'Cartão ou PIX · Acesso imediato' },
              { icon: Globe, text: 'PC, Tablet e Celular' },
              { icon: Zap, text: 'Dúvidas resolvidas 24/7 por IA' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2.5">
                <div className="w-10 h-10 rounded-[5px] bg-accent/10 text-accent flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground leading-tight">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
