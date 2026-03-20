import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plane, BookOpen, Brain, Users, Clock, Award, ArrowRight, Crown,
  CheckCircle2, Loader2, Zap, Shield, GraduationCap, BarChart3,
  MessageCircle, Star, Sparkles, Trophy, Map, FileText, Target,
  Headphones, Globe, Rocket, Heart, TrendingUp, Play, ChevronRight,
  BadgeCheck, Lightbulb, Timer, Monitor,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCategories, useSubcategories } from '@/hooks/useExams';
import { useAuth } from '@/contexts/AuthContext';

import { PageTransition } from '@/components/PageTransition';

import heroAttendant from '@/assets/hero-attendant.jpg';
import studyDesk from '@/assets/study-desk.jpg';
import airplaneSunset from '@/assets/airplane-sunset.jpg';

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
      'Simulados padrão ANAC',
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
  { icon: GraduationCap, title: 'Estude com simulados', desc: 'Questões baseadas em padrões reais da ANAC, organizadas por matéria.' },
  { icon: BarChart3, title: 'Acompanhe seu progresso', desc: 'Relatórios detalhados mostram onde você precisa melhorar.' },
  { icon: Trophy, title: 'Conquiste insígnias', desc: 'Ganhe medalhas conforme avança e prove que está pronto.' },
  { icon: Award, title: 'Passe na prova', desc: 'Chegue preparado e conquiste sua aprovação na ANAC.' },
];

const TESTIMONIALS = [
  { name: 'Carla M.', role: 'Comissária aprovada – GOL', text: 'Os simulados do Voo Certo foram essenciais para minha aprovação. A IA me ajudou a entender cada erro!', stars: 5, avatar: '👩🏻‍✈️' },
  { name: 'Lucas R.', role: 'Estudante de aviação', text: 'Melhor plataforma de simulados. O cronômetro e os relatórios fazem toda a diferença.', stars: 5, avatar: '👨🏽‍✈️' },
  { name: 'Ana P.', role: 'Comissária aprovada – LATAM', text: 'Passei de primeira graças ao Voo Certo. O guia de carreira me deu o caminho completo.', stars: 5, avatar: '👩🏾‍✈️' },
  { name: 'Pedro S.', role: 'Comissário aprovado – Azul', text: 'A plataforma é incrível! Estudei pelo celular e passei com nota acima de 90%.', stars: 5, avatar: '👨🏻‍✈️' },
  { name: 'Juliana F.', role: 'Aprovada na ANAC', text: 'Os microcursos são excelentes, aprendi meteorologia de um jeito muito mais fácil.', stars: 5, avatar: '👩🏼‍✈️' },
  { name: 'Rafael T.', role: 'Comissário em treinamento', text: 'O chat com IA é genial. Cada dúvida era respondida na hora com explicação detalhada.', stars: 5, avatar: '👨🏾‍✈️' },
];

const FAQ = [
  { q: 'O Voo Certo substitui o curso de comissário?', a: 'Não. O Voo Certo é uma plataforma de preparação complementar focada nos simulados e no guia de carreira. Você ainda precisa fazer o curso em uma escola homologada.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim! Todos os planos podem ser cancelados quando quiser, sem multa ou burocracia. Você mantém o acesso até o fim do período pago.' },
  { q: 'As questões são iguais às da prova da ANAC?', a: 'Nossas questões são baseadas em provas anteriores e seguem os padrões de avaliação da ANAC. Cobrimos todas as matérias exigidas com o mesmo nível de dificuldade.' },
  { q: 'Funciona no celular?', a: 'Sim! A plataforma é 100% responsiva e otimizada para celular. Estude de qualquer lugar, a qualquer hora.' },
  { q: 'O que é o Chat IA?', a: 'É um assistente inteligente que explica cada questão em detalhe. Quando você erra ou tem dúvida, a IA analisa a questão e dá uma explicação personalizada.' },
  { q: 'Como funciona o período de teste grátis?', a: 'Você tem 7 dias gratuitos em qualquer plano pago. Se não gostar, cancele antes do fim do trial e não será cobrado.' },
];

const DIFFERENTIALS = [
  { icon: Brain, title: 'IA Contextual', desc: 'Cada questão tem um chat com IA que explica a resposta, mostra a lógica e tira suas dúvidas em tempo real.' },
  { icon: Headphones, title: 'Simulados Especializados', desc: 'Questões de proficiência linguística com áudio, simulando o que você vai encontrar na prova.' },
  { icon: Timer, title: 'Cronômetro Real', desc: 'Simule as condições reais da prova com temporizador por bloco e por prova completa.' },
  { icon: BarChart3, title: 'Relatórios Inteligentes', desc: 'Veja seu desempenho por matéria, identifique pontos fracos e acompanhe sua evolução.' },
  { icon: Trophy, title: 'Gamificação', desc: 'Insígnias, conquistas e certificados que motivam e comprovam seu progresso.' },
  { icon: FileText, title: 'Currículo Aviação', desc: 'Gerador de CV específico para companhias aéreas, com template profissional.' },
  { icon: Map, title: 'Guia de Carreira', desc: 'Roadmap completo: do curso à contratação, passo a passo com dicas práticas.' },
  { icon: Monitor, title: '100% Online', desc: 'Estude do celular, tablet ou computador. Acesso 24/7 de qualquer lugar.' },
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
    <PageTransition>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header />

        {/* ═══════ HERO ═══════ */}
        <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
          {/* Background image overlay */}
          <div className="absolute inset-0">
            <img src={heroAttendant} alt="Comissária de bordo" className="w-full h-full object-cover opacity-15" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215,55%,15%)] via-[hsl(215,55%,15%/0.9)] to-transparent" />
          </div>

          <div className="absolute inset-0 overflow-hidden">
             <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-[5px] blur-3xl" />
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-foreground/5 rounded-[5px] blur-3xl" />
          </div>

          <motion.div className="absolute top-20 right-10 md:right-20"
            animate={{ y: [-10, 10, -10], rotate: [0, 2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <Plane className="w-16 h-16 md:w-24 md:h-24 text-accent/30" />
          </motion.div>

          <div className="container mx-auto px-4 py-32 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-[5px] text-accent mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Metodologia Padrão ANAC</span>
                </motion.div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
                  Sua decolagem profissional
                  <span className="block text-accent">começa aqui.</span>
                </h1>

                <p className="text-lg md:text-xl text-primary-foreground/80 mb-4 max-w-xl font-medium">
                  Simulados realistas baseados em provas reais, IA explicativa e um roadmap completo para sua carreira na aviação.
                </p>

                <p className="text-sm text-accent/80 mb-8 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4" />
                  Conteúdo desenvolvido por especialistas com base em exames reais.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="hero" size="xl" asChild className="rounded-[5px]">
                    <Link to={user ? '/simulados' : '/auth'}>
                      Começar Grátis por 7 Dias <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="xl" asChild className="bg-white/5 text-white border-white/20 hover-yellow hover:text-foreground rounded-[5px]">
                    <Link to="/premium" className="flex items-center gap-2">
                      <Crown className="w-5 h-5" /> Ver Planos
                    </Link>
                  </Button>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-8 mt-12">
                  {[
                    { value: '500+', label: 'Questões' },
                    { value: '10+', label: 'Simulados' },
                    { value: '95%', label: 'Aprovação' },
                    { value: '24/7', label: 'Acesso' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-accent">{stat.value}</div>
                      <div className="text-sm text-primary-foreground/60 font-bold uppercase tracking-tighter">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right side - floating cards preview */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                className="hidden lg:block relative">
                <div className="relative">
                  <img src={studyDesk} alt="Estudando para ANAC" className="rounded-[5px] shadow-2xl" loading="lazy" decoding="async" />
                  {/* Floating card overlay */}
                  <motion.div className="absolute -bottom-6 -left-6 bg-card rounded-[5px] p-4 shadow-xl border border-border"
                    animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[5px] bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Aprovada!</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Nota: 94% no simulado</p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div className="absolute -top-4 -right-4 bg-card rounded-[5px] p-4 shadow-xl border border-border"
                    animate={{ y: [5, -5, 5] }} transition={{ duration: 5, repeat: Infinity }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[5px] bg-accent/10 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Chat IA</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Dúvida resolvida!</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════ TRUST BAR ═══════ */}
        <section className="py-6 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {[
                { icon: Shield, text: 'Privacidade de Dados' },
                { icon: BadgeCheck, text: 'Simulados Atualizados' },
                { icon: Heart, text: 'Desenvolvimento Constante' },
                { icon: Globe, text: 'Acesso Multiplataforma' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-accent" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ PROBLEM / SOLUTION ═══════ */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Badge variant="outline" className="mb-4 text-destructive border-destructive/20 rounded-[5px] bg-destructive/5 font-bold uppercase h-6 px-3">
                  <Target className="w-3 h-3 mr-2" /> O Desafio do Aluno
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Estudar para simulados técnicos não deve ser confuso.
                </h2>
                <div className="space-y-3">
                  {[
                    'Informação fragmentada e desatualizada',
                    'Dificuldade em mensurar a evolução real',
                    'Falta de suporte especializado imediato',
                    'Ausência de um método de estudo estruturado',
                    'Insegurança sobre o ambiente real de prova',
                  ].map((problem, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-[5px] bg-destructive/5 border border-destructive/10">
                      <div className="w-6 h-6 rounded-[5px] bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-destructive text-xs font-bold">✕</span>
                      </div>
                      <p className="text-foreground text-sm font-medium">{problem}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Badge variant="outline" className="mb-4 text-success border-success/20 rounded-[5px] bg-success/5 font-bold uppercase h-6 px-3">
                  <Lightbulb className="w-3 h-3 mr-2" /> A Solução Inteligente
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  O Voo Certo centraliza sua <span className="text-accent underline decoration-accent/20">preparação completa.</span>
                </h2>
                <div className="space-y-3">
                  {[
                    'Simulados focados nos padrões exigidos pelo mercado',
                    'Estatísticas precisas por matéria e subcategoria',
                    'IA treinada para explicar cada alternativa da questão',
                    'Roadmap profissional do curso à contratação',
                    'Ambiente de prova que simula as restrições reais',
                  ].map((solution, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-[5px] bg-success/5 border border-success/10">
                      <div className="w-6 h-6 rounded-[5px] bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      </div>
                      <p className="text-foreground text-sm font-bold">{solution}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-accent border-accent/20 rounded-[5px] bg-accent/5 font-bold uppercase h-6 px-3">
                <Map className="w-3 h-3 mr-2" /> Metodologia
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Seu plano de voo em 4 passos
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {STEPS.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="relative group">
                  <div className="w-16 h-16 rounded-[5px] bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                    <step.icon className="w-8 h-8 text-accent" />
                  </div>
                  <div className="absolute top-0 right-1/2 translate-x-12 w-8 h-8 rounded-[5px] bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-foreground mb-3 text-center">{step.title}</h3>
                  <p className="text-xs text-muted-foreground text-center leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ PRICING ═══════ */}
        <section className="py-24" style={{ background: 'var(--gradient-hero)' }}>
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <Badge className="mb-4 bg-accent text-accent-foreground border-0 rounded-[5px] font-bold uppercase text-[10px] tracking-widest px-4 py-1.5 h-auto">
                 Período de Experiência Grátis por 7 Dias
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Planos de Preparação</h2>
              <p className="text-primary-foreground/60 max-w-xl mx-auto font-medium">
                Escolha o nível de suporte que sua carreira exige.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PLANS.map((plan, i) => {
                const Icon = plan.icon;
                return (
                  <motion.div key={plan.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className={`h-full flex flex-col relative overflow-hidden rounded-[5px] border-0 shadow-xl ${
                      plan.highlight
                        ? 'bg-card ring-2 ring-accent'
                        : 'bg-card'
                    }`}>
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-[5px]">
                          Recomendado
                        </div>
                      )}
                      <CardHeader className="text-center pb-6 pt-10">
                        <div className={`w-14 h-14 rounded-[5px] flex items-center justify-center mx-auto mb-4 ${
                          plan.highlight ? 'bg-accent/10' : 'bg-primary/5'
                        }`}>
                          <Icon className={`w-7 h-7 ${plan.highlight ? 'text-accent' : 'text-primary'}`} />
                        </div>
                        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-tight">{plan.description}</p>
                        <div className="mt-6">
                          <span className="text-4xl font-bold text-foreground tracking-tighter">{plan.price}</span>
                          <span className="text-muted-foreground text-xs font-medium">{plan.period}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col px-8">
                        <ul className="space-y-4 mb-8 flex-1">
                          {plan.features.map((f, j) => (
                            <li key={j} className="flex items-start gap-2.5 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                              <span className="text-foreground font-medium leading-normal">{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Button variant={plan.highlight ? 'hero' : 'outline'} className="w-full h-11 rounded-[5px] font-bold hover-yellow hover:text-foreground" asChild>
                          <Link to="/premium">
                            Experimentar Trial
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

        {/* ═══════ FAQ ═══════ */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground">Dúvidas Frequentes</h2>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-3">
              {FAQ.map((faq, i) => (
                <motion.details key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="group bg-card border border-border rounded-[5px] overflow-hidden shadow-none">
                  <summary className="flex items-center justify-between p-5 cursor-pointer text-foreground font-bold text-sm hover-yellow list-none transition-all">
                    {faq.q}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-2" />
                  </summary>
                  <div className="px-5 pb-6 text-sm text-muted-foreground leading-relaxed font-medium">
                    {faq.a}
                  </div>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
