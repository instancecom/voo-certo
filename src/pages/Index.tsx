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
  { name: 'Carla M.', role: 'Comissária aprovada – GOL', text: 'Os simulados do Voo Certo foram essenciais para minha aprovação. A IA me ajudou a entender cada erro!', stars: 5, avatar: '👩🏻‍✈️' },
  { name: 'Lucas R.', role: 'Estudante de aviação', text: 'Melhor plataforma de simulados ANAC. O cronômetro e os relatórios fazem toda a diferença.', stars: 5, avatar: '👨🏽‍✈️' },
  { name: 'Ana P.', role: 'Comissária aprovada – LATAM', text: 'Passei de primeira graças ao Voo Certo. O guia de carreira me deu o caminho completo.', stars: 5, avatar: '👩🏾‍✈️' },
  { name: 'Pedro S.', role: 'Comissário aprovado – Azul', text: 'A plataforma é incrível! Estudei pelo celular e passei com nota acima de 90%.', stars: 5, avatar: '👨🏻‍✈️' },
  { name: 'Juliana F.', role: 'Aprovada na ANAC', text: 'Os microcursos são excelentes, aprendi meteorologia de um jeito muito mais fácil.', stars: 5, avatar: '👩🏼‍✈️' },
  { name: 'Rafael T.', role: 'Comissário em treinamento', text: 'O chat com IA é genial. Cada dúvida era respondida na hora com explicação detalhada.', stars: 5, avatar: '👨🏾‍✈️' },
];

const FAQ = [
  { q: 'O Voo Certo substitui o curso de comissário?', a: 'Não. O Voo Certo é uma plataforma de preparação complementar focada nos simulados ANAC e no guia de carreira. Você ainda precisa fazer o curso em uma escola homologada.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim! Todos os planos podem ser cancelados quando quiser, sem multa ou burocracia. Você mantém o acesso até o fim do período pago.' },
  { q: 'As questões são iguais às da prova da ANAC?', a: 'Nossas questões são baseadas em provas anteriores e seguem o padrão ANAC. Cobrimos todas as matérias exigidas com o mesmo nível de dificuldade.' },
  { q: 'Funciona no celular?', a: 'Sim! A plataforma é 100% responsiva e otimizada para celular. Estude de qualquer lugar, a qualquer hora.' },
  { q: 'O que é o Chat IA?', a: 'É um assistente inteligente que explica cada questão em detalhe. Quando você erra ou tem dúvida, a IA analisa a questão e dá uma explicação personalizada.' },
  { q: 'Como funciona o período de teste grátis?', a: 'Você tem 7 dias gratuitos em qualquer plano pago. Se não gostar, cancele antes do fim do trial e não será cobrado.' },
];

const DIFFERENTIALS = [
  { icon: Brain, title: 'IA Contextual', desc: 'Cada questão tem um chat com IA que explica a resposta, mostra a lógica e tira suas dúvidas em tempo real.' },
  { icon: Headphones, title: 'Simulados com Áudio', desc: 'Questões de proficiência linguística com áudio real, simulando o que você vai encontrar na prova.' },
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
    <div className="min-h-screen bg-background">
      <Header />

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img src={heroAttendant} alt="Comissária de bordo" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215,55%,15%)] via-[hsl(215,55%,15%/0.9)] to-transparent" />
        </div>

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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Plataforma #1 de Simulados ANAC</span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
                Sua aprovação na ANAC
                <span className="block text-accent">começa aqui.</span>
              </h1>

              <p className="text-lg md:text-xl text-primary-foreground/80 mb-4 max-w-xl">
                Simulados realistas com cronômetro, inteligência artificial que explica cada questão e um guia de carreira completo para te levar do zero até a contratação.
              </p>

              <p className="text-sm text-accent/80 mb-8 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4" />
                Mais de 500 questões baseadas em provas reais da ANAC
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to={user ? '/simulados' : '/auth'}>
                    Começar Grátis por 7 Dias <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="glass" size="xl" asChild>
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
                    <div className="text-sm text-primary-foreground/60">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right side - floating cards preview */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block relative">
              <div className="relative">
                <img src={studyDesk} alt="Estudando para ANAC" className="rounded-2xl shadow-2xl border border-border/20" />
                {/* Floating card overlay */}
                <motion.div className="absolute -bottom-6 -left-6 bg-card/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-border"
                  animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Aprovada!</p>
                      <p className="text-xs text-muted-foreground">Nota: 94% na ANAC</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div className="absolute -top-4 -right-4 bg-card/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-border"
                  animate={{ y: [5, -5, 5] }} transition={{ duration: 5, repeat: Infinity }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Chat IA</p>
                      <p className="text-xs text-muted-foreground">Dúvida resolvida!</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2">
            <motion.div className="w-1.5 h-1.5 bg-accent rounded-full"
              animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* ═══════ TRUST BAR ═══════ */}
      <section className="py-6 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            {[
              { icon: Shield, text: 'Dados protegidos' },
              { icon: BadgeCheck, text: 'Questões verificadas' },
              { icon: Heart, text: 'Satisfação garantida' },
              { icon: Globe, text: '100% online' },
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Badge variant="outline" className="mb-4 text-destructive border-destructive/30">
                <Target className="w-3 h-3 mr-1" /> O problema
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Estudar para a ANAC não deveria ser tão difícil.
              </h2>
              <div className="space-y-4">
                {[
                  'Material desatualizado e espalhado pela internet',
                  'Sem saber se está realmente preparado para a prova',
                  'Estudar sozinho sem feedback ou direcionamento',
                  'Não saber o que estudar primeiro (ou por onde começar)',
                  'Medo de reprovar e perder tempo e dinheiro',
                ].map((problem, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-destructive text-xs font-bold">✕</span>
                    </div>
                    <p className="text-foreground text-sm">{problem}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Badge variant="outline" className="mb-4 text-success border-success/30">
                <Lightbulb className="w-3 h-3 mr-1" /> A solução
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                O Voo Certo resolve tudo isso <span className="text-accent">em um só lugar.</span>
              </h2>
              <div className="space-y-4">
                {[
                  'Simulados atualizados baseados em provas reais da ANAC',
                  'Relatórios mostram exatamente onde você precisa melhorar',
                  'IA que explica cada questão como um professor particular',
                  'Guia de carreira com o passo a passo completo',
                  'Cronômetro real para simular as condições da prova',
                ].map((solution, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/10">
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <p className="text-foreground text-sm">{solution}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-20 bg-muted/50">
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

          {/* CTA mid-section */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mt-12">
            <Button variant="hero" size="lg" asChild>
              <Link to={user ? '/simulados' : '/auth'}>
                Quero Começar Agora <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════ DIFFERENTIALS (8 features) ═══════ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-accent border-accent/30">
              <Rocket className="w-3 h-3 mr-1" /> Diferenciais
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Por que o Voo Certo é diferente?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Recursos exclusivos que nenhuma outra plataforma oferece</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {DIFFERENTIALS.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-accent/30 transition-all duration-300 group">
                <div className="p-3 rounded-xl bg-accent/10 w-fit mb-4 group-hover:bg-accent/20 transition-colors">
                  <f.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ IMAGE + TEXT SECTION ═══════ */}
      <section className="py-20 bg-muted/50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="order-2 lg:order-1">
              <Badge variant="outline" className="mb-4 text-accent border-accent/30">
                <Brain className="w-3 h-3 mr-1" /> Inteligência Artificial
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Um professor particular com IA em cada questão
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Errou uma questão? Sem problema. Nosso chat com IA analisa a questão, 
                explica por que a alternativa correta é a certa, detalha os conceitos 
                envolvidos e ainda sugere o que mais você deve estudar.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Explicações detalhadas e contextualizadas',
                  'Funciona para todas as matérias ANAC',
                  'Respostas instantâneas, 24 horas por dia',
                  'Linguagem simples e direta',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="hero" asChild>
                <Link to={user ? '/simulados' : '/auth'}>
                  Experimentar Grátis <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="order-1 lg:order-2">
              <div className="relative">
                <img src={studyDesk} alt="Estudando com IA" className="rounded-2xl shadow-xl" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[hsl(215,55%,15%/0.4)] to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-card/90 backdrop-blur-md rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-accent" />
                    <span className="text-sm font-semibold text-foreground">Chat IA</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    "A resposta correta é a alternativa C porque segundo a RBAC 121.397, o procedimento de evacuação deve..."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ CATEGORIES ═══════ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-accent border-accent/30">
              <BookOpen className="w-3 h-3 mr-1" /> Simulados
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Categorias de Simulados</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Prepare-se para cada matéria do processo seletivo ANAC</p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {categoriesWithSubs.map((category, index) => {
                const Icon = iconMap[category.icon || 'Plane'] || Plane;
                const isComingSoon = category.subcategories.length === 0;
                return (
                  <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                    <Link to={isComingSoon ? '#' : `/simulados`}
                      className={`block p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 ${isComingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:border-accent/50'}`}>
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

      {/* ═══════ SOCIAL PROOF BANNER ═══════ */}
      <section className="relative py-24 overflow-hidden">
        <img src={airplaneSunset} alt="Avião decolando ao pôr do sol" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[hsl(215,55%,10%/0.85)]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
              Milhares de candidatos já estão <br className="hidden md:block" />
              <span className="text-accent">se preparando com o Voo Certo.</span>
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
              Não fique para trás. Comece hoje e tenha a preparação mais completa do mercado.
            </p>
            <div className="flex flex-wrap justify-center gap-12 mb-10">
              {[
                { value: '500+', label: 'Questões disponíveis' },
                { value: '10+', label: 'Simulados completos' },
                { value: '95%', label: 'Taxa de aprovação' },
                { value: '4.9★', label: 'Avaliação dos alunos' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="text-4xl md:text-5xl font-bold text-accent">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
            <Button variant="hero" size="xl" asChild>
              <Link to={user ? '/simulados' : '/auth'}>
                Quero Passar na ANAC <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section className="py-20" style={{ background: 'var(--gradient-hero)' }}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge className="mb-4 bg-accent/20 text-accent border-0">
              <Star className="w-3 h-3 mr-1" /> 7 dias grátis em todos os planos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Invista na sua carreira</h2>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto">
              Menos que um café por dia para ter a preparação mais completa para a prova ANAC. Cancele quando quiser.
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

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-primary-foreground/50 text-sm mt-8">
            Pagamento seguro via Stripe. Cancele a qualquer momento sem multa.
          </motion.p>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-accent border-accent/30">
              <Heart className="w-3 h-3 mr-1" /> Depoimentos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">O que dizem nossos alunos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Histórias reais de quem conquistou a aprovação com o Voo Certo</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                      ))}
                    </div>
                    <p className="text-foreground text-sm mb-4 italic leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{t.avatar}</span>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-accent border-accent/30">
              <MessageCircle className="w-3 h-3 mr-1" /> FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Perguntas Frequentes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Tire suas dúvidas antes de começar</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ.map((faq, i) => (
              <motion.details key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group bg-card border border-border rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-foreground font-semibold text-sm hover:text-accent transition-colors list-none">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="relative py-24 overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <motion.div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 8, repeat: Infinity }} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <Plane className="w-16 h-16 text-accent/50 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
              Sua carreira na aviação <span className="text-accent">começa agora.</span>
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-4 text-lg">
              Não deixe para amanhã o que pode mudar sua vida hoje. 
              Comece grátis e descubra por que o Voo Certo é a escolha certa.
            </p>
            <p className="text-accent/80 text-sm mb-8 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              7 dias grátis · Sem cartão de crédito · Cancele quando quiser
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to={user ? '/simulados' : '/auth'}>
                  Começar Gratuitamente <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/premium">
                  <Crown className="w-5 h-5 mr-2" /> Ver Planos Premium
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
