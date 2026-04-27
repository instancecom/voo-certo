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
    description: 'Seu ponto de partida nos estudos',
    features: [
      'Modo Livre e Bloco ilimitados',
      'Modo Banca limitado',
      'Chat IA (2 msgs por questão)',
      'Insígnias e Conquistas',
      'Histórico de Desempenho Básico',
    ],
    highlight: false,
    popular: false,
  },
  {
    id: 'tripulante',
    name: 'Tripulante ⭐',
    price: 'R$ 39,90',
    period: '/mês',
    icon: Zap,
    description: 'A escolha ideal para sua aprovação',
    features: [
      'Tudo do plano Solo',
      'Modo Banca ilimitado (Estilo ANAC)',
      'Chat IA (5 msgs por questão)',
      'Histórico de Desempenho Avançado',
      'Relatórios por matéria',
    ],
    highlight: true,
    popular: true,
  },
  {
    id: 'comandante',
    name: 'Comandante 👑',
    price: 'R$ 79,90',
    period: '/mês',
    icon: Crown,
    description: 'Experiência premium e IA avançada',
    features: [
      'Tudo do plano Tripulante',
      'Chat IA Turbo (15 msgs por questão)',
      'Limite diário de IA estendido',
      'Relatórios avançados de evolução',
      'Plano de estudo personalizado',
    ],
    highlight: false,
    popular: false,
  },
];

const STEPS = [
  { icon: GraduationCap, title: 'Treine com simulados realistas', desc: 'Pratique com questões inspiradas no formato dos exames oficiais, organizadas por matéria.' },
  { icon: BarChart3, title: 'Descubra seus pontos fracos', desc: 'Relatórios detalhados identificam exatamente onde você precisa focar sua energia.' },
  { icon: Brain, title: 'Evolua com IA especializada', desc: 'Entenda o porquê de cada resposta com explicações contextuais inteligentes.' },
  { icon: Award, title: 'Avance rumo à sua aprovação', desc: 'Ganhe confiança e chegue preparado para conquistar seu lugar no mercado.' },
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
  { q: 'O Voo Certo substitui o curso de comissário obrigatório?', a: 'Não. O Voo Certo é uma ferramenta de apoio e preparação complementar. Você ainda deve realizar o curso teórico e prático em uma escola homologada pela ANAC conforme as exigências legais.' },
  { q: 'Funciona para quem está começando do zero?', a: 'Com certeza! A plataforma foi desenhada para guiar você desde os primeiros passos, com explicações didáticas via IA e um roadmap completo de carreira.' },
  { q: 'A IA realmente responde dúvidas reais?', a: 'Sim. Nossa IA foi treinada especificamente no contexto aeronáutico para explicar a lógica por trás de cada questão, ajudando você a aprender com o erro em vez de apenas decorar.' },
  { q: 'Os simulados seguem os temas cobrados nos exames do setor?', a: 'Sim, nossos simulados são inspirados no formato e nos temas recorrentes das provas de certificação, garantindo um treino altamente realista e focado no que importa.' },
  { q: 'Posso estudar pelo celular?', a: 'Perfeitamente. A plataforma é 100% otimizada para dispositivos móveis, permitindo que você estude em qualquer lugar, aproveitando cada minuto do seu dia.' },
  { q: 'Posso cancelar minha assinatura?', a: 'Sim, o cancelamento é simples e pode ser feito a qualquer momento diretamente no seu painel, sem taxas escondidas ou fidelidade.' },
];

const DIFFERENTIALS = [
  { icon: Brain, title: 'IA Explicativa 24/7', desc: 'Nunca mais fique com dúvida. Nossa IA explica a lógica de cada alternativa, transformando erros em aprendizado imediato.' },
  { icon: Target, title: 'Treino Estilo Prova Real', desc: 'Simulados com o mesmo tempo, estrutura e pressão dos exames oficiais para você ganhar confiança.' },
  { icon: BarChart3, title: 'Evolução Mensurável', desc: 'Visualize seu progresso por matéria através de gráficos detalhados e saiba exatamente quando estiver pronto.' },
  { icon: Map, title: 'Roadmap de Carreira', desc: 'Um guia completo que mostra o passo a passo: do início dos estudos até o dia da sua contratação.' },
  { icon: FileText, title: 'Currículo Aeronáutico', desc: 'Construtor de currículos otimizado para os padrões exigidos pelas grandes companhias aéreas.' },
  { icon: Trophy, title: 'Gamificação e Conquistas', desc: 'Mantenha-se motivado com um sistema de insígnias que premia seu esforço e evolução constante.' },
  { icon: Headphones, title: 'Simulados Especializados', desc: 'Questões técnicas com suporte a áudio para preparação completa em todas as frentes.' },
  { icon: Monitor, title: 'Plataforma Premium', desc: 'Interface moderna, rápida e intuitiva, desenhada para focar no que importa: seu estudo.' },
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
                  Conquiste sua aprovação
                  <span className="block text-accent">na prova da ANAC.</span>
                </h1>

                <p className="text-lg md:text-xl text-primary-foreground/80 mb-4 max-w-xl font-medium">
                  Simulados realistas, IA que explica cada questão e roadmap profissional completo. Tudo o que você precisa para decolar sua carreira na aviação.
                </p>

                <p className="text-sm text-success/90 mb-8 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4" />
                  Treinamento inteligente focado em resultados reais e suporte de carreira.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="hero" size="xl" asChild className="rounded-[5px]">
                    <Link to={user ? '/simulados' : '/auth?mode=signup'}>
                      Começar Minha Preparação Agora <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="xl" asChild className="bg-white/5 text-white border-white/20 hover-yellow rounded-[5px]">
                    <Link to="/premium" className="flex items-center gap-2">
                      Explorar Funcionalidades
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
                    'Estudar sem saber se realmente está progredindo',
                    'Errar questões e não entender o motivo técnico',
                    'Insegurança e ansiedade para o dia da prova',
                    'Falta de direção sobre os próximos passos da carreira',
                    'Materiais de estudo desatualizados ou incompletos',
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
                    'Simulados inteligentes inspirados no formato oficial',
                    'IA explicativa 24h para tirar todas as suas dúvidas',
                    'Relatórios de desempenho e prontidão para a prova',
                    'Roadmap completo: do curso à contratação',
                    'Ambiente de treino que reduz a ansiedade real',
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
                        <Button variant={plan.highlight ? 'hero' : 'outline'} className="w-full h-11 rounded-[5px] font-bold hover-yellow" asChild>
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
        {/* ═══════ FINAL CTA ═══════ */}
        <section className="py-24 relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `url(${airplaneSunset})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto">
              <Badge className="mb-6 bg-accent text-accent-foreground border-0 rounded-[5px] font-bold uppercase text-[10px] tracking-widest px-4 py-1.5 h-auto">
                Sua Jornada Começa Aqui
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
                Pronto para conquistar sua <span className="text-accent">aprovação na ANAC?</span>
              </h2>
              <p className="text-xl text-primary-foreground/70 mb-10 font-medium">
                Tenha acesso aos simulados mais realistas do mercado, suporte de IA em tempo real e um guia completo de carreira.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="xl" asChild className="rounded-[5px]">
                  <Link to={user ? '/simulados' : '/auth?mode=signup'}>
                    Começar Minha Preparação Agora <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
              <p className="mt-8 text-sm text-primary-foreground/40 font-medium flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> Cancelamento simples e sem burocracia.
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
