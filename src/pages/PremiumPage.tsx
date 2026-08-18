import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Check, Crown, Plane, Zap, Star, Loader2, ExternalLink, Tag, X, ShieldCheck, CreditCard } from 'lucide-react';
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
    description: 'Ideal para quem está iniciando os estudos',
    features: [
      'Modo Livre e Bloco ilimitados',
      'Modo Banca ilimitado',
      'Chat IA com Mike (2 msgs/questão)',
      'Guia de Carreiras completo',
      'Progresso e histórico completos',
      'Conquistas: Bronze e Prata',
      '🎖️ Selo "Aprovado ANAC" (LinkedIn)',
      'Currículo com IA (1 currículo salvo)',
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
    description: 'O melhor custo-benefício para sua aprovação',
    popular: true,
    features: [
      'Tudo do plano Solo',
      'Chat IA com Mike (5 msgs/questão)',
      'Diagnóstico com Mike (IA de desempenho)',
      'Conquistas: Bronze, Prata e Ouro',
      '🎖️ Selo "Aprovado ANAC" (LinkedIn)',
      'Currículo com IA (até 3 currículos)',
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
    description: 'A preparação definitiva para garantir sua vaga',
    features: [
      'Tudo do plano Tripulante',
      'Chat IA Turbo com Mike (15 msgs/questão)',
      'Diagnóstico com Mike ilimitado',
      'Todas as Conquistas: Bronze, Prata, Ouro e Platina',
      '🎖️ Selo "Aprovado ANAC" (LinkedIn)',
      'Currículo com IA (galeria ilimitada)',
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
  const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout cancelado. Você pode tentar novamente quando quiser.');
    }
    // Pré-seleciona o plano vindo da landing page via ?plan=
    const planParam = searchParams.get('plan');
    if (planParam && ['solo', 'tripulante', 'comandante'].includes(planParam)) {
      setHighlightedPlan(planParam);
      // Scroll suave até o card do plano após renderização
      setTimeout(() => {
        const el = document.getElementById(`plan-card-${planParam}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [searchParams]);

  useEffect(() => {
    const handlePageShow = () => {
      setLoading(null);
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
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
      const body: any = { planId, priceId };
      if (appliedCoupon?.code) {
        body.couponCode = appliedCoupon.code;
      } else if (appliedCoupon?.stripe_promotion_code_id) {
        body.promotionCodeId = appliedCoupon.stripe_promotion_code_id;
      }
      
      console.log('Iniciando checkout para o plano:', planId, 'com cupom:', appliedCoupon?.code);
      const { data, error } = await supabase.functions.invoke('create-checkout', { body });
      
      if (error) {
        console.error('Erro na Edge Function:', error);
        let detailedMessage = error.message;
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

            <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">Decole sua Aprovação</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium leading-relaxed">
              Planos desenvolvidos com base nos padrões reais da banca ANAC.
              Aceitamos Cartão de Crédito e PIX. Cancele quando quiser.
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



          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {PLANS.map((plan, index) => {
              const Icon = plan.icon;
              const isCurrent = currentPlan === plan.id;
              const discountedPrice = getDiscountedPrice(plan.price);
              return (
                <motion.div
                  key={plan.id}
                  id={`plan-card-${plan.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full flex flex-col relative overflow-hidden rounded-[5px] border-2 shadow-none transition-all duration-300 ${plan.color} ${
                    plan.popular ? 'border-primary' : 'border-border'
                  } ${isCurrent ? 'opacity-70 grayscale-[0.5]' : 'hover:border-primary/40'} ${
                    highlightedPlan === plan.id ? 'ring-4 ring-accent ring-offset-2' : ''
                  }`}>
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
                          className="w-full h-12 rounded-[5px] font-bold text-sm hover-yellow transition-all flex items-center justify-center gap-2"
                          onClick={() => handleCheckout(plan.priceId, plan.id)}
                          disabled={!!loading}
                        >
                          {loading === plan.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <CreditCard className="w-4 h-4" />}
                          {user ? 'Assinar Agora' : 'Login para Assinar'}
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
                { q: 'Posso cancelar quando quiser?', a: 'Sim! A gestão do plano é 100% autônoma através da plataforma da Cakto no seu perfil. Sem multas e sem burocracia.' },
                { q: 'Quais formas de pagamento são aceitas?', a: 'Aceitamos Cartão de Crédito e PIX via Cakto. Ambos com aprovação rápida e acesso imediato à plataforma.' },
                { q: 'Meu acesso é imediato após o pagamento?', a: 'Sim! Assim que o pagamento é confirmado, seu acesso é liberado automaticamente. PIX é instantâneo.' },
                { q: 'As questões são atualizadas?', a: 'Nossa equipe revisa o banco de questões constantemente com base nos exames reais da ANAC.' },
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
                Transferindo você para o ambiente de faturamento seguro da Cakto.
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
