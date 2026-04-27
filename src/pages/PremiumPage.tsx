import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Check, Crown, Plane, Zap, Star, Loader2, ExternalLink, Tag, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePlan } from '@/hooks/usePlan';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'solo',
    name: 'Solo',
    price: 19.90,
    priceLabel: 'R$ 19,90',
    priceId: 'price_1T2s0K5IdjxdYZGcfJIVoMGL',
    icon: Plane,
    description: 'Para quem está começando na aviação',
    features: [
      'Simulados básicos ilimitados',
      'Relatórios simplificados',
      'Guia de carreira',
      'Microcursos gratuitos',
    ],
    color: 'bg-card border-border',
    buttonVariant: 'outline' as const,
  },
  {
    id: 'tripulante',
    name: 'Tripulante',
    price: 39.90,
    priceLabel: 'R$ 39,90',
    priceId: 'price_1T2s125IdjxdYZGcbdnPSAWj',
    icon: Zap,
    description: 'O mais escolhido pelos futuros comissários',
    popular: true,
    features: [
      'Tudo do plano Solo',
      'Simulados padrão ANAC',
      'Chat IA contextual por questão',
      'Relatórios avançados com gráficos',
      'Microcursos exclusivos',
      'Insígnias especiais',
    ],
    color: 'bg-primary/5 border-primary/20',
    buttonVariant: 'default' as const,
  },
  {
    id: 'comandante',
    name: 'Comandante',
    price: 79.90,
    priceLabel: 'R$ 79,90',
    priceId: 'price_1T2s1m5IdjxdYZGcxahBdOM0',
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
    color: 'bg-accent/5 border-accent/20',
    buttonVariant: 'hero' as const,
  },
];

interface AppliedCoupon {
  id: string;
  code: string;
  type: string;
  value: number;
  stripe_promotion_code_id: string;
}

export default function PremiumPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout cancelado. Você pode tentar novamente quando quiser.');
    }
  }, [searchParams]);

  useEffect(() => {
    // Garante que o loading seja resetado se o usuário voltar do checkout
    setLoading(null);
  }, []);

  useEffect(() => {
    if (!user) return;
    const checkSub = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        if (!error && data?.plan) setCurrentPlan(data.plan);
      } catch { /* silently fail */ }
    };
    checkSub();
  }, [user]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-coupon', {
        body: { code: couponCode },
      });
      if (error) throw error;
      if (data?.valid) {
        setAppliedCoupon(data.coupon);
        toast.success(`Cupom ${data.coupon.code} aplicado!`);
      } else {
        toast.error(data?.message || 'Cupom inválido');
      }
    } catch (err: any) {
      toast.error(`Erro ao validar cupom: ${err.message}`);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const getDiscountedPrice = (price: number) => {
    if (!appliedCoupon) return null;
    if (appliedCoupon.type === 'percent') {
      return price - (price * appliedCoupon.value / 100);
    }
    return Math.max(0, price - appliedCoupon.value);
  };

  const handleCheckout = async (priceId: string, planId: string) => {
    if (!user) {
      toast.error('Faça login para assinar um plano.');
      return;
    }
    setLoading(planId);
    try {
      const body: any = { priceId };
      if (appliedCoupon?.stripe_promotion_code_id) {
        body.promotionCodeId = appliedCoupon.stripe_promotion_code_id;
      }
      
      console.log('Iniciando checkout para:', priceId);
      const { data, error } = await supabase.functions.invoke('create-checkout', { body });
      
      if (error) {
        console.error('Erro na Edge Function:', error);
        // Tenta extrair mensagem detalhada se disponível no erro
        let detailedMessage = error.message;
        
        // Em algumas versões do SDK, o corpo do erro 400 pode estar acessível
        // Se não, ao menos mostramos que foi um erro de função
        toast.error(`Erro ao iniciar checkout: ${detailedMessage}`);
        setLoading(null);
        return;
      }
      
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      
      throw new Error('URL de checkout não recebida');
    } catch (err: any) {
      console.error('Erro catch checkout:', err);
      toast.error(`Erro ao iniciar checkout: ${err.message || 'Erro inesperado'}`);
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading('manage');
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err: any) {
      toast.error(`Erro ao acessar portal: ${err.message}`);
      setLoading(null);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-[5px] text-accent mb-6">
              <Star className="w-4 h-4 fill-accent/20" />
              <span className="text-sm font-bold uppercase tracking-wider">Investimento Profissional</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">Decole sua Aprovação</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium leading-relaxed">
              Planos desenvolvidos com base nos padrões reais da banca ANAC.
              7 dias gratuitos para você testar a elite da preparação.
            </p>
          </motion.div>

          {/* Current Plan */}
          {user && currentPlan !== 'free' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
              <Card className="border-success/30 bg-success/5 max-w-md mx-auto rounded-[5px] shadow-none">
                <CardContent className="py-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Status da Assinatura</p>
                      <p className="text-xl font-bold text-success capitalize">{currentPlan}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManageSubscription}
                      disabled={loading === 'manage'}
                      className="gap-2 rounded-[5px] border-success/20 hover:bg-success/10"
                    >
                      {loading === 'manage' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                      Portal Financeiro
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Coupon Input */}
          {user && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12 max-w-md mx-auto">
              {appliedCoupon ? (
                <div className="flex items-center gap-3 p-4 rounded-[5px] border border-success/30 bg-success/5">
                  <Tag className="w-5 h-5 text-success shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">
                      Cupom <span className="font-mono text-success">{appliedCoupon.code}</span>
                    </p>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                      {appliedCoupon.type === 'percent' ? `${appliedCoupon.value}% OFF` : `R$ ${appliedCoupon.value} OFF`}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={removeCoupon} className="hover:bg-destructive/10 hover:text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Código Promocional"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    className="flex-1 rounded-[5px] h-11 font-bold tracking-widest"
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="gap-2 shrink-0 rounded-[5px] h-11 px-6 font-bold hover-yellow"
                  >
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                    Aplicar
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {PLANS.map((plan, index) => {
              const Icon = plan.icon;
              const isCurrent = currentPlan === plan.id;
              const discountedPrice = getDiscountedPrice(plan.price);
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full flex flex-col relative overflow-hidden rounded-[5px] border-2 shadow-none transition-all duration-300 ${plan.color} ${
                    plan.popular ? 'border-primary' : 'border-border'
                  } ${isCurrent ? 'opacity-70 grayscale-[0.5]' : 'hover:border-primary/40'}`}>
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest rounded-bl-[5px]">
                        Mais Escolhido
                      </div>
                    )}
                    <CardHeader className="text-center pb-6 pt-10">
                      <div className="w-16 h-16 rounded-[5px] bg-white border shadow-sm flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-black">{plan.name}</CardTitle>
                      <p className="text-xs font-bold text-muted-foreground uppercase mt-1 tracking-tight">{plan.description}</p>
                      <div className="mt-8">
                        {discountedPrice !== null ? (
                          <div className="flex flex-col items-center">
                            <span className="text-sm line-through text-muted-foreground font-bold">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-black text-success">
                                R$ {discountedPrice.toFixed(2).replace('.', ',')}
                              </span>
                              <span className="text-muted-foreground text-xs font-bold uppercase">/mês</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-black text-foreground tracking-tighter">{plan.priceLabel}</span>
                            <span className="text-muted-foreground text-xs font-bold uppercase">/mês</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col px-8">
                      <div className="h-px bg-border/50 w-full mb-8" />
                      <ul className="space-y-4 mb-10 flex-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-medium">
                            <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                            <span className="text-foreground leading-snug">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {isCurrent ? (
                        <div className="w-full h-12 rounded-[5px] bg-success/10 text-success text-sm font-bold flex items-center justify-center gap-2 border border-success/20">
                          <ShieldCheck className="w-5 h-5" /> Plano Ativo
                        </div>
                      ) : (
                        <Button
                          variant={plan.buttonVariant as any}
                          className="w-full h-12 rounded-[5px] font-bold text-sm hover-yellow transition-all"
                          onClick={() => handleCheckout(plan.priceId, plan.id)}
                          disabled={!!loading}
                        >
                          {loading === plan.id ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                          {user ? 'Iniciar Período Grátis' : 'Login para Assinar'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-foreground mb-12 text-center uppercase tracking-tighter">Perguntas Frequentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { q: 'Posso cancelar quando quiser?', a: 'Sim! A gestão é 100% autônoma através do portal Stripe no seu perfil. Sem multas.' },
                { q: 'O trial de 7 dias é realmente grátis?', a: 'Completamente. O primeiro pagamento ocorre apenas no 8º dia caso não cancele antes.' },
                { q: 'Quais os métodos de pagamento?', a: 'Aceitamos cartões de crédito e PIX via Stripe, garantindo total segurança.' },
                { q: 'As questões são atualizadas?', a: 'Nossa equipe revisa o banco de questões constantemente com base nos exames da ANAC.' },
              ].map((faq, i) => (
                <Card key={i} className="rounded-[5px] bg-muted/20 border-border/50 shadow-none">
                  <CardContent className="py-5">
                    <p className="font-bold text-foreground text-sm mb-2">{faq.q}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Checkout Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-background/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative mb-12"
            >
              <div className="w-24 h-24 rounded-2xl bg-card border border-primary/20 flex items-center justify-center shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-4 max-w-sm"
            >
              <h3 className="text-3xl font-black text-foreground tracking-tight">
                {loading === 'manage' ? 'Acessando Portal Seguro' : 'Processando sua Escolha'}
              </h3>
              <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] px-8 leading-loose opacity-80">
                Transferindo você para o ambiente de faturamento seguro da Stripe.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        <Footer />
      </div>
    </PageTransition>
  );
}
