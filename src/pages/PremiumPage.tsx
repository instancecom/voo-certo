import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Crown, Plane, Zap, Brain, Shield, Star, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'solo',
    name: 'Solo',
    price: 'R$ 19,90',
    priceId: 'price_1T2s0K5IdjxdYZGcfJIVoMGL',
    productId: 'prod_U0tnPUvclNJK3E',
    icon: Plane,
    description: 'Para quem está começando na aviação',
    features: [
      'Simulados básicos ilimitados',
      'Relatórios simplificados',
      'Guia de carreira',
      'Microcursos gratuitos',
    ],
    color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    buttonVariant: 'outline' as const,
  },
  {
    id: 'tripulante',
    name: 'Tripulante',
    price: 'R$ 39,90',
    priceId: 'price_1T2s125IdjxdYZGcbdnPSAWj',
    productId: 'prod_U0toDu9l9EMg60',
    icon: Zap,
    description: 'O mais escolhido pelos futuros comissários',
    popular: true,
    features: [
      'Tudo do plano Solo',
      'Simulados ANAC oficiais',
      'Chat IA contextual por questão',
      'Relatórios avançados com gráficos',
      'Microcursos exclusivos',
      'Insígnias especiais',
    ],
    color: 'bg-primary/5 border-primary/30',
    buttonVariant: 'default' as const,
  },
  {
    id: 'comandante',
    name: 'Comandante',
    price: 'R$ 79,90',
    priceId: 'price_1T2s1m5IdjxdYZGcxahBdOM0',
    productId: 'prod_U0tpKbroOySxsX',
    icon: Crown,
    description: 'Acesso total para quem quer voar alto',
    features: [
      'Tudo do plano Tripulante',
      'Chat IA ilimitado',
      'Certificados personalizados',
      'Gerador de currículo',
      'Suporte prioritário',
      'Acesso antecipado a novos conteúdos',
    ],
    color: 'bg-accent/5 border-accent/30',
    buttonVariant: 'hero' as const,
  },
];

export default function PremiumPage() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout cancelado. Você pode tentar novamente quando quiser.');
    }
  }, [searchParams]);

  // Check subscription on load
  useEffect(() => {
    if (!user) return;
    const checkSub = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        if (!error && data?.plan) {
          setCurrentPlan(data.plan);
        }
      } catch {
        // silently fail
      }
    };
    checkSub();
  }, [user]);

  const handleCheckout = async (priceId: string, planId: string) => {
    if (!user) {
      toast.error('Faça login para assinar um plano.');
      return;
    }
    setLoading(planId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(`Erro ao iniciar checkout: ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading('manage');
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent mb-4">
              <Star className="w-4 h-4" />
              <span className="text-sm font-semibold">7 dias grátis</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Escolha seu Plano
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Invista na sua carreira na aviação. Cancele quando quiser.
            </p>
          </motion.div>

          {/* Current Plan */}
          {user && currentPlan !== 'free' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <Card className="border-success/30 bg-success/5 max-w-md mx-auto">
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Plano atual</p>
                    <p className="text-lg font-bold text-success capitalize">{currentPlan}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageSubscription}
                    disabled={loading === 'manage'}
                    className="gap-2"
                  >
                    {loading === 'manage' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                    Gerenciar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, index) => {
              const Icon = plan.icon;
              const isCurrent = currentPlan === plan.id;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full flex flex-col relative overflow-hidden ${plan.color} ${
                    plan.popular ? 'ring-2 ring-primary shadow-lg' : ''
                  } ${isCurrent ? 'ring-2 ring-success' : ''}`}>
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
                        Mais Popular
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-0 left-0 bg-success text-success-foreground text-xs font-bold px-3 py-1 rounded-br-xl">
                        Seu Plano
                      </div>
                    )}
                    <CardHeader className="text-center pb-4 pt-6">
                      <div className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="mt-3">
                        <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                        <span className="text-muted-foreground text-sm">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-3 mb-6 flex-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                            <span className="text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {isCurrent ? (
                        <Button variant="outline" className="w-full" disabled>
                          Plano Atual
                        </Button>
                      ) : (
                        <Button
                          variant={plan.buttonVariant as any}
                          className="w-full"
                          onClick={() => handleCheckout(plan.priceId, plan.id)}
                          disabled={!!loading}
                        >
                          {loading === plan.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          {user ? 'Começar Trial Grátis' : 'Fazer Login para Assinar'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-16 max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-bold text-foreground mb-6">Dúvidas frequentes</h2>
            <div className="space-y-4 text-left">
              {[
                { q: 'Posso cancelar quando quiser?', a: 'Sim! Sem multa ou fidelidade. Cancele direto pelo painel de assinatura.' },
                { q: 'O trial de 7 dias é realmente grátis?', a: 'Sim! Você só é cobrado após os 7 dias. Se cancelar antes, não paga nada.' },
                { q: 'Posso trocar de plano?', a: 'Sim, você pode fazer upgrade ou downgrade a qualquer momento no painel de assinatura.' },
              ].map((faq, i) => (
                <Card key={i}>
                  <CardContent className="py-4">
                    <p className="font-semibold text-foreground text-sm">{faq.q}</p>
                    <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
