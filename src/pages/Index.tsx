import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plane, BookOpen, Brain, Users, Clock, Award, ArrowRight, Crown,
  CheckCircle2, Loader2, Zap, Shield, GraduationCap, BarChart3,
  MessageCircle, Star, Sparkles, Trophy, Map, FileText,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCategories, useSubcategories } from '@/hooks/useExams';
import { useAuth } from '@/contexts/AuthContext';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Plane, BookOpen, Brain, Users,
};

const PLANS = [
  {
    id: 'solo',
    name: 'Solo',
    price: 'R$ 19,90',
    period: '/mês',
    icon: Plane,
    description: 'Para quem está começando na aviação',
    features: [
      'Simulados básicos ilimitados',
      'Relatórios simplificados',
      'Guia de carreira',
      'Microcursos gratuitos',
    ],
    highlight: false,
    popular: false,
  },
  {
    id: 'tripulante',
    name: 'Tripulante',
    price: 'R$ 39,90',
    period: '/mês',
    icon: Zap,
    description: 'O mais escolhido pelos futuros comissários',
    features: [
      'Tudo do plano Solo',
      'Simulados ANAC oficiais',
      'Chat IA por questão',
      'Relatórios avançados',
      'Microcursos exclusivos',
      'Insígnias especiais',
    ],
    highlight: true,
    popular: true,
  },
  {
    id: 'comandante',
    name: 'Comandante',
    price: 'R$ 79,90',
    period: '/mês',
    icon: Crown,
    description: 'Acesso total para quem quer voar alto',
    features: [
      'Tudo do Tripulante',
      'Chat IA ilimitado',
      'Certificados personalizados',
      'Gerador de currículo',
      'Suporte prioritário',
      'Acesso antecipado',
    ],
    highlight: false,
    popular: false,
  },
];

const STEPS = [
  { icon: GraduationCap, title: 'Estude com simulados', desc: 'Questões baseadas em provas reais da ANAC, organizadas por matéria.' },
  { icon: BarChart3, title: 'Acompanhe seu progresso', desc: 'Relatórios detalhados mostram onde você precisa melhorar.' },
  { icon: Trophy, title: 'Conquiste insígnias', desc: 'Ganhe medalhas conforme avança e prove que está pronto.' },
  { icon: Award, title: 'Passe na prova', desc: 'Chegue preparado e conquiste sua aprovação na ANAC.' },
];

const TESTIMONIALS = [
  { name: 'Carla M.', role: 'Comissária aprovada', text: 'Os simulados do Voo Certo foram essenciais para minha aprovação. A IA me ajudou a entender cada erro!', stars: 5 },
  { name: 'Lucas R.', role: 'Estudante de aviação', text: 'Melhor plataforma de simulados ANAC. O cronômetro e os relatórios fazem toda a diferença.', stars: 5 },
  { name: 'Ana P.', role: 'Comissária aprovada', text: 'Passei de primeira graças ao Voo Certo. O guia de carreira me deu o caminho completo.', stars: 5 },
];

export default function Index() {
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: subcategories, isLoading: loadingSubcategories } = useSubcategories();
  const { user } = useAuth();

  const isLoading = loadingCategories || loadingSubcategories;

  const categoriesWithSubs = categories?.map(cat => ({
    ...cat,
    subcategories: subcategories?.filter(s => s.category_id === cat.id) || [],
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <motion.div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }} />
          <motion.div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity }} />
        </div>

        <motion.div className="absolute top-20 right-10 md:right-20"
          animate={{ y: [-10, 10, -10], rotate: [0, 2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <Plane className="w-16 h-16 md:w-24 md:h-24 text-accent/30" />
        </motion.div>

        <div className="container mx-auto px-4 py-32 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Plataforma #1 de Simulados ANAC</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              Decole na sua
              <span className="block text-accent">preparação</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Simulados realistas, IA que explica cada questão e guia de carreira completo.
              Tudo que você precisa para passar na prova da ANAC.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/simulados">
                  Começar Agora <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/premium" className="flex items-center gap-2">
                  <Crown className="w-5 h-5" /> Ver Planos
                </Link>
              </Button>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-8 mt-16">
              {[
                { value: '500+', label: 'Questões' },
                { value: '10+', label: 'Simulados' },
                { value: '95%', label: 'Aprovação' },
                { value: '24/7', label: 'Acesso' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2">
            <motion.div className="w-1.5 h-1.5 bg-accent rounded-full"
              animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-accent border-accent/30">
              <Map className="w-3 h-3 mr-1" /> Como funciona
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Do zero à aprovação em 4 passos
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Um caminho claro e estruturado para sua carreira na aviação
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-accent" />
                </div>
                <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center md:left-auto md:-top-2 md:right-auto">
                  {i + 1}
                </div>
                <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CATEGORIES ═══════ */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Categorias de Simulados</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Prepare-se para cada etapa do processo seletivo</p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoriesWithSubs.map((category, index) => {
                const Icon = iconMap[category.icon || 'Plane'] || Plane;
                const isComingSoon = category.subcategories.length === 0;
                return (
                  <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                    <Link to={isComingSoon ? '#' : `/simulados`}
                      className={`block p-6 rounded-2xl border border-border bg-card hover:shadow-card-hover transition-all duration-300 ${isComingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:border-accent/50'}`}>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10"><Icon className="w-8 h-8 text-primary" /></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-foreground">{category.name}</h3>
                            {isComingSoon && <span className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">Em breve</span>}
                          </div>
                          <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                          {category.subcategories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {category.subcategories.map(sub => (
                                <span key={sub.id} className="px-3 py-1 text-xs bg-secondary rounded-full text-secondary-foreground">{sub.name}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        {!isComingSoon && <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Por que escolher o Voo Certo?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Recursos exclusivos para maximizar sua preparação</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: 'Simulados Cronometrados', desc: 'Pratique com tempo real, igual ao dia da prova.' },
              { icon: Brain, title: 'Questões Realistas', desc: 'Baseadas em provas anteriores da ANAC com áudio real.' },
              { icon: MessageCircle, title: 'IA que Explica', desc: 'Chat contextual em cada questão para tirar dúvidas na hora.' },
              { icon: Award, title: 'Insígnias e Conquistas', desc: 'Ganhe medalhas, gere certificados e comprove sua evolução.' },
              { icon: FileText, title: 'Gerador de Currículo', desc: 'Crie seu CV profissional para companhias aéreas.' },
              { icon: Shield, title: 'Guia de Carreira', desc: 'Passo a passo completo do curso até a contratação.' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-card-hover hover:border-accent/30 transition-all duration-300">
                <div className="p-3 rounded-xl bg-accent/10 w-fit mb-4"><f.icon className="w-7 h-7 text-accent" /></div>
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section className="py-20" style={{ background: 'var(--gradient-hero)' }}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge className="mb-4 bg-accent/20 text-accent border-0">
              <Star className="w-3 h-3 mr-1" /> 7 dias grátis em todos os planos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Escolha seu plano</h2>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto">
              Invista na sua carreira na aviação. Cancele quando quiser.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className={`h-full flex flex-col relative overflow-hidden ${
                    plan.highlight
                      ? 'ring-2 ring-accent shadow-glow bg-card'
                      : 'bg-card/95 backdrop-blur-sm'
                  }`}>
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                        Mais Popular
                      </div>
                    )}
                    <CardHeader className="text-center pb-4 pt-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                        plan.highlight ? 'bg-accent/15' : 'bg-primary/10'
                      }`}>
                        <Icon className={`w-7 h-7 ${plan.highlight ? 'text-accent' : 'text-primary'}`} />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                        <span className="text-muted-foreground text-sm">{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-3 mb-6 flex-1">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                            <span className="text-foreground">{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button variant={plan.highlight ? 'hero' : 'outline'} className="w-full" asChild>
                        <Link to="/premium">
                          {user ? 'Começar Trial Grátis' : 'Assinar Agora'}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">O que dizem nossos alunos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Histórias reais de quem conquistou a aprovação</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                      ))}
                    </div>
                    <p className="text-foreground text-sm mb-4 italic">"{t.text}"</p>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-20" style={{ background: 'var(--gradient-primary)' }}>
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Pronto para decolar?</h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Junte-se a milhares de candidatos que já estão se preparando com o Voo Certo.
              Comece grátis ou experimente qualquer plano por 7 dias sem custo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/simulados">
                  Começar Gratuitamente <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/premium">
                  <Crown className="w-5 h-5 mr-2" /> Ver Planos
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
