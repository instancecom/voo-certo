import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plane, BookOpen, Brain, Users, ArrowRight, Crown,
  CheckCircle2, Zap, Shield, GraduationCap, BarChart3,
  MessageCircle, Star, Sparkles, Trophy, Map, FileText, Target,
  Headphones, Globe, TrendingUp, Play, ChevronRight,
  BadgeCheck, AlertTriangle,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransition } from '@/components/PageTransition';

import heroAttendant from '@/assets/hero-attendant.jpg';
import studyDesk from '@/assets/study-desk.jpg';
import airplaneSunset from '@/assets/airplane-sunset.jpg';

// ─── Data ───────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'solo',
    name: 'Solo',
    price: 'R$ 19,90',
    period: '/mês',
    icon: Plane,
    description: 'Ideal para quem está iniciando os estudos',
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
    name: 'Tripulante',
    price: 'R$ 39,90',
    period: '/mês',
    icon: Zap,
    description: 'O melhor custo-benefício para sua aprovação',
    features: [
      'Tudo do plano Solo',
      'Modo Banca ilimitado (Estilo prova real)',
      'Chat IA (5 msgs por questão)',
      'Histórico de Desempenho Avançado',
      'Relatórios por matéria',
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
    description: 'A preparação definitiva para garantir sua vaga',
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

const PAIN_POINTS = [
  {
    icon: BookOpen,
    title: 'Conteúdo Disperso',
    desc: 'Cansado de buscar apostilas desatualizadas e simulados aleatórios na internet?',
  },
  {
    icon: Brain,
    title: 'Dúvidas Sem Resposta',
    desc: 'Errou uma questão e não entende o porquê? O Google não te ajuda a memorizar a norma.',
  },
  {
    icon: BarChart3,
    title: 'Falta de Foco',
    desc: 'Não sabe quais matérias você domina e onde está perdendo pontos preciosos?',
  },
  {
    icon: Target,
    title: "Medo do 'Branco'",
    desc: 'A pressão do tempo no dia da prova te assusta? Treinar sem pressão real não prepara.',
  },
];

const EXTRAS = [
  {
    icon: Trophy,
    title: 'Gamificação & Conquistas',
    desc: 'Mantenha a motivação alta desbloqueando insígnias e medalhas ao longo da jornada.',
  },
  {
    icon: Map,
    title: 'Guia de Carreira',
    desc: 'Roteiros estruturados para Comissários, Pilotos e Mecânicos, do início ao fim.',
  },
  {
    icon: FileText,
    title: 'Gerador de Currículo',
    desc: 'Crie um currículo otimizado para o padrão exigido pelas grandes companhias aéreas.',
  },
  {
    icon: Headphones,
    title: 'Suporte a Áudio',
    desc: 'Treine com áudios reais para as provas de inglês e espanhol da aviação civil.',
  },
  {
    icon: BadgeCheck,
    title: 'Selo Digital de Aprovação',
    desc: 'Comprove seu desempenho no LinkedIn com um selo exclusivo após aprovação na ANAC.',
  },
];

const STEPS = [
  {
    icon: GraduationCap,
    title: 'Crie sua Conta',
    desc: 'Inscreva-se em segundos e garanta seus 7 dias gratuitos sem precisar de cartão de crédito.',
  },
  {
    icon: Plane,
    title: 'Escolha sua Área',
    desc: 'Acesse simulados específicos para sua certificação: Piloto, Comissário ou Mecânico.',
  },
  {
    icon: BarChart3,
    title: 'Treine e Identifique Falhas',
    desc: 'Use os relatórios inteligentes para ver exatamente onde focar sua energia de estudo.',
  },
  {
    icon: Brain,
    title: 'Aprenda com a IA',
    desc: 'Entenda cada erro em tempo real e chegue preparado para passar de primeira.',
  },
];

const FAQ = [
  {
    q: 'Como funcionam os 7 dias gratuitos?',
    a: 'Ao criar sua conta, você tem acesso completo à plataforma por 7 dias sem precisar cadastrar cartão de crédito. Ao final do período, você escolhe o plano ideal para continuar sua preparação.',
  },
  {
    q: 'O Voo Certo é afiliado à ANAC?',
    a: 'Não. O Voo Certo é uma plataforma independente de simulados e preparação para certificações aeronáuticas. Não possuímos afiliação oficial com a ANAC ou qualquer órgão regulador da aviação civil.',
  },
  {
    q: 'Quantas questões a plataforma possui?',
    a: 'A plataforma conta com mais de 2.000 questões organizadas por disciplina, desenvolvidas com base nos padrões e temas recorrentes das provas de certificação aeronáutica da ANAC.',
  },
  {
    q: 'Como funciona o suporte da IA nos diferentes planos?',
    a: 'O Chat IA está disponível a partir do plano Tripulante. No Tripulante, você tem 5 mensagens por questão e até 30 consultas diárias. No plano Comandante, são 15 mensagens por questão e até 100 consultas por dia.',
  },
  {
    q: 'Posso acessar pelo celular?',
    a: 'Sim! A plataforma é 100% responsiva e otimizada para dispositivos móveis. Estude pelo PC, tablet ou celular — em qualquer lugar, aproveitando cada minuto do seu dia.',
  },
  {
    q: 'Posso cancelar minha assinatura?',
    a: 'Sim, o cancelamento é simples e pode ser feito a qualquer momento diretamente no seu painel, sem taxas ou fidelidade obrigatória.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'O Chat IA mudou completamente meu jeito de estudar. Toda vez que errava uma questão, entendia o motivo na hora. Passei de primeira como Comissária!',
    name: 'Ana Paula M.',
    role: 'Comissária de Bordo — ANAC',
    stars: 5,
  },
  {
    quote: 'O Modo Banca me preparou para a pressão real da prova. Cheguei no dia com calma total porque já sabia o que esperar. Aprovado no primeiro exame!',
    name: 'Rafael S.',
    role: 'Piloto Privado — ANAC',
    stars: 5,
  },
  {
    quote: 'Os relatórios de desempenho foram essenciais. Via exatamente onde estava errando e focava ali. Plataforma completa e muito bem feita.',
    name: 'Camila R.',
    role: 'Mecânica de Aeronaves — ANAC',
    stars: 5,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Index() {
  const { user } = useAuth();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background overflow-x-hidden">

        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Voo Certo',
            description: 'Plataforma de simulados ANAC com inteligência artificial para preparação de candidatos a certificações aeronáuticas — Comissário, Piloto e Mecânico.',
            operatingSystem: 'Web, Android, iOS',
            applicationCategory: 'EducationalApplication',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              ratingCount: '1250',
            },
            offers: {
              '@type': 'Offer',
              price: '19.90',
              priceCurrency: 'BRL',
            },
          })}
        </script>

        {/* 1. HEADER */}
        <Header />

        {/* ═══════ 2. HERO ═══════ */}
        <section
          id="inicio"
          className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden"
          style={{ background: 'var(--gradient-hero)' }}
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={heroAttendant}
              alt="Comissária de bordo sorrindo com farda — prepare-se para a ANAC"
              className="w-full h-full object-cover opacity-15"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215,55%,15%)] via-[hsl(215,55%,15%/0.9)] to-transparent" />
          </div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-[5px] blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-foreground/5 rounded-[5px] blur-3xl" />
          </div>
          <motion.div
            className="absolute top-10 md:top-20 right-4 md:right-20 opacity-20 md:opacity-100"
            animate={{ y: [-10, 10, -10], rotate: [0, 2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Plane className="w-12 h-12 md:w-24 md:h-24 text-accent/30" />
          </motion.div>

          <div className="container mx-auto py-20 md:py-32 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center text-center lg:text-left">

              {/* Left */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-[5px] text-accent mb-6 mx-auto lg:mx-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Simulados para ANAC com IA</span>
                </motion.div>

                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
                  Passe na ANAC de Primeira.{' '}
                  <span className="text-accent">Sua Carreira na Aviação Começa Aqui.</span>
                </h1>

                <p className="text-lg md:text-xl text-primary-foreground/80 mb-6 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                  Centralize sua preparação com simulados realistas, inteligência artificial 24h e relatórios de desempenho detalhados. Pare de perder tempo e estude com o método que aprova 95% dos alunos.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                  <Button variant="hero" size="xl" asChild className="rounded-[5px] w-full sm:w-fit whitespace-normal h-auto py-4 sm:h-14 sm:py-0 hover-yellow">
                    <Link to={user ? '/simulados' : '/auth?mode=signup'} className="flex items-center justify-center gap-2">
                      COMEÇAR MEU TESTE GRÁTIS DE 7 DIAS <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="xl" asChild className="bg-white/5 text-white border-white/20 hover-yellow rounded-[5px] w-full sm:w-fit">
                    <a href="#planos" className="flex items-center justify-center gap-2">
                      Ver Planos e Recursos
                    </a>
                  </Button>
                </div>

                {/* Social proof */}
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-8">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                    ))}
                  </div>
                  <span className="text-primary-foreground/70 text-sm font-medium">
                    <strong className="text-accent">4.9/5</strong> · Avaliação dos alunos
                  </span>
                </div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center lg:justify-start gap-6 md:gap-8"
                >
                  {[
                    { value: '3', label: 'Certificações' },
                    { value: '2.000+', label: 'Questões' },
                    { value: '95%', label: 'Aprovação' },
                    { value: '24/7', label: 'IA Disponível' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl md:text-4xl font-bold text-accent">{stat.value}</div>
                      <div className="text-[10px] md:text-sm text-primary-foreground/60 font-bold uppercase tracking-tighter">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>

                <p className="text-[10px] text-primary-foreground/45 mt-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium text-center lg:text-left">
                  * O Voo Certo é uma plataforma independente de simulados e preparação para certificações aeronáuticas. Não possuímos afiliação oficial com nenhum órgão regulador da aviação civil.
                </p>
              </motion.div>

              {/* Right — floating cards */}
              <motion.div
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                className="hidden lg:block relative"
              >
                <div className="relative">
                  <img
                    src={studyDesk}
                    alt="Candidato estudando para prova ANAC com simulados online e inteligência artificial"
                    className="rounded-[5px] shadow-2xl"
                    loading="eager"
                    decoding="async"
                  />
                  <motion.div
                    className="absolute -bottom-6 -left-6 bg-card rounded-[5px] p-4 shadow-xl border border-border"
                    animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[5px] bg-accent/10 flex items-center justify-center">
                        <BadgeCheck className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Alta Fidelidade</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Questões padrão ANAC</p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="absolute -top-4 -right-4 bg-card rounded-[5px] p-4 shadow-xl border border-border"
                    animate={{ y: [5, -5, 5] }} transition={{ duration: 5, repeat: Infinity }}
                  >
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

        {/* ═══════ 3. DORES & DESEJOS ═══════ */}
        <section className="py-16 md:py-24 bg-card border-y border-border">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge variant="outline" className="mb-4 text-destructive border-destructive/20 rounded-[5px] bg-destructive/5 font-bold uppercase h-6 px-3">
                <AlertTriangle className="w-3 h-3 mr-2" /> O Problema
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-4">
                Estudar para a ANAC Não Precisa<br className="hidden md:block" /> Ser uma Turbulência.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Se você se identifica com algum desses problemas, o Voo Certo foi feito exatamente para você.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
              {PAIN_POINTS.map((pain, i) => {
                const Icon = pain.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-background border-destructive/10 h-full rounded-[5px] relative overflow-hidden group hover:border-destructive/30 transition-all duration-300">
                      <div className="absolute top-0 left-0 w-1 h-full bg-destructive/30 group-hover:bg-destructive/60 transition-colors" />
                      <CardContent className="pt-6 pl-6">
                        <div className="w-10 h-10 rounded-[5px] bg-destructive/10 flex items-center justify-center mb-4">
                          <Icon className="w-5 h-5 text-destructive" />
                        </div>
                        <h3 className="font-bold text-foreground mb-2">{pain.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{pain.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Bridge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-success/10 border border-success/20 rounded-[5px]">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                <p className="text-sm font-bold text-foreground">
                  O Voo Certo foi criado para resolver{' '}
                  <span className="text-success">cada um desses problemas.</span>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════ 4A. SIMULADOS ═══════ */}
        <section id="funcionalidades" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-accent border-accent/20 rounded-[5px] bg-accent/5 font-bold uppercase h-6 px-3">
                <Play className="w-3 h-3 mr-2" /> Centro de Simulados
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-4">
                Simulados para Comissário e Piloto<br className="hidden md:block" /> com Padrão ANAC.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Três modos de estudo — cada um criado para uma fase diferente da sua preparação para a ANAC.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: 'Modo Banca',
                  icon: Shield,
                  desc: 'Sinta a pressão real. 20 questões aleatórias com tempo cronometrado padrão ANAC — para você saber exatamente se está pronto.',
                  benefit: 'Máxima Fidelidade',
                },
                {
                  title: 'Modo Livre (com IA)',
                  icon: Zap,
                  desc: 'Estude no seu ritmo, veja a resposta na hora e use o Chat IA para entender cada erro instantaneamente. Aprendizado sem barreiras.',
                  benefit: 'Aprendizado Acelerado',
                },
                {
                  title: 'Modo Bloco',
                  icon: Target,
                  desc: 'Domine uma disciplina por vez. Treine até ter confiança total em uma matéria antes de avançar para a próxima.',
                  benefit: 'Domínio por Disciplina',
                },
              ].map((mode, i) => (
                <Card
                  key={i}
                  className="bg-card border-border hover:border-accent/50 transition-all group rounded-[5px] hover:-translate-y-2 duration-300"
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-[5px] bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <mode.icon className="w-6 h-6 text-accent" />
                    </div>
                    <CardTitle className="text-xl font-bold">{mode.title}</CardTitle>
                    <Badge variant="secondary" className="w-fit text-[10px] font-bold uppercase tracking-tight bg-accent/10 text-accent border-0">
                      {mode.benefit}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{mode.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ 4B. CHAT IA ═══════ */}
        <section className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 skew-x-12 translate-x-20" />
          <div className="container mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} className="text-center lg:text-left"
              >
                <Badge className="mb-4 bg-success text-success-foreground border-0 rounded-[5px] font-bold uppercase text-[10px] tracking-widest px-4 py-1.5 h-auto mx-auto lg:mx-0">
                  Exclusivo Voo Certo
                </Badge>
                <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Seu Professor Particular<br className="hidden md:block" /> de Aviação,{' '}
                  <span className="text-accent">24/7.</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Errou uma questão? Nossa IA lê o enunciado, analisa cada alternativa e entrega uma explicação técnica imediata. Você entende o raciocínio certo — e não comete o mesmo erro duas vezes.
                </p>
                <ul className="space-y-4 mb-10 text-left inline-block lg:block">
                  {[
                    '🤖 Explicação lógica e técnica da resposta correta',
                    '📄 Indicação do fundamento normativo',
                    '💡 Dicas de memorização por matéria',
                    '✅ Respostas instantâneas — sem esperar, 24h por dia',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground font-bold">
                      <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="hero" size="lg" className="rounded-[5px]" asChild>
                  <Link to={user ? '/simulados' : '/auth?mode=signup'} className="flex items-center gap-2">
                    Começar Agora — 7 Dias Grátis <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>

              {/* Chat Mockup */}
              <div className="relative">
                <div className="bg-card border border-border p-6 rounded-[5px] shadow-2xl relative z-10 hover:shadow-accent/5 transition-all duration-500 group/chat">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center group-hover/chat:rotate-12 transition-transform">
                      <Brain className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Capitão Neto — IA Aeronáutica</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <p className="text-[10px] text-success font-bold uppercase tracking-tighter">Pronto para ajudar</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                      className="bg-muted p-3 rounded-[10px] rounded-tl-none text-xs max-w-[85%] shadow-sm"
                    >
                      "Por que a alternativa A está errada nessa questão de meteorologia?"
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                      className="bg-accent/10 border border-accent/20 p-4 rounded-[10px] rounded-tr-none text-[11px] ml-auto max-w-[90%] shadow-sm"
                    >
                      <p className="font-bold text-accent mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Capitão Neto
                      </p>
                      <p className="leading-relaxed text-foreground/80">
                        A alternativa A confunde camadas de instabilidade com presença de turbulência. O que define o risco de turbulência severa ali é a variação de cisalhamento — conceito diferente que a ANAC adora cobrar nessa matéria...
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1 }}
                      className="flex gap-1 items-center pt-2"
                    >
                      <div className="w-1 h-1 bg-accent rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[9px] text-muted-foreground ml-1 font-bold italic">IA analisando próxima dúvida...</span>
                    </motion.div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ 4C. CENTRAL DE PERFORMANCE ═══════ */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} className="text-center lg:text-left"
              >
                <Badge variant="outline" className="mb-4 text-accent border-accent/20 rounded-[5px] bg-accent/5 font-bold uppercase h-6 px-3 mx-auto lg:mx-0">
                  <BarChart3 className="w-3 h-3 mr-2" /> Dados que Aprovam
                </Badge>
                <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Tome o Controle da Sua<br className="hidden md:block" />{' '}
                  <span className="text-accent underline decoration-accent/20">Aprovação com Dados.</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Saiba onde você está falhando antes que a ANAC te mostre. Relatórios detalhados que transformam seu estudo em estratégia real de aprovação.
                </p>
                <ul className="space-y-4 text-left inline-block lg:block">
                  {[
                    'Média geral e curva de aprendizado por simulado',
                    'Identificação visual de Pontos de Atenção e Pontos Fortes',
                    'Histórico detalhado filtrado por modo de estudo',
                    'Sequência de estudos e indicador de consistência',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Performance Mockup */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="bg-card border border-border rounded-[5px] p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-foreground">Central de Performance</h3>
                      <p className="text-xs text-muted-foreground">Evolução baseada em padrões ANAC</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: 'Média Geral', value: '82%', color: 'text-accent', bg: 'bg-accent/10' },
                      { label: 'Sequência', value: '7 dias 🔥', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                      { label: 'Precisão', value: '78%', color: 'text-success', bg: 'bg-success/10' },
                      { label: 'Questões', value: '340', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    ].map((stat, i) => (
                      <div key={i} className={`${stat.bg} rounded-[5px] p-3`}>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">{stat.label}</p>
                        <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Animated bar chart */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Curva de Aprendizado — Últimos Simulados</p>
                    <div className="flex items-end gap-1.5 h-20 bg-muted/30 rounded-[5px] p-2">
                      {[55, 62, 58, 70, 68, 75, 72, 80, 78, 82].map((h, i) => (
                        <div key={i} className="flex-1 rounded-sm bg-accent/10 relative overflow-hidden h-full">
                          <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06, duration: 0.5 }}
                            className="absolute bottom-0 left-0 right-0 bg-accent/70 rounded-sm"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-muted-foreground">Início</span>
                      <span className="text-[9px] text-success font-bold">↑ Evolução constante</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════ 5. RECURSOS ADICIONAIS ═══════ */}
        <section className="py-16 md:py-24 bg-card border-y border-border">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-accent border-accent/20 rounded-[5px] bg-accent/5 font-bold uppercase h-6 px-3">
                <Sparkles className="w-3 h-3 mr-2" /> Plataforma Completa
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-4">
                Muito Além dos Simulados.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Do primeiro estudo até a contratação — o Voo Certo centraliza tudo que você precisa para decolar na aviação civil.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
              {EXTRAS.map((extra, i) => {
                const Icon = extra.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-background border-border h-full flex flex-col rounded-[5px] hover:shadow-xl transition-all group border-transparent hover:border-accent/20">
                      <CardContent className="pt-8 flex-1 text-center px-4">
                        <div className="w-12 h-12 rounded-[5px] bg-accent/10 flex items-center justify-center mb-5 mx-auto group-hover:scale-110 transition-transform duration-500">
                          <Icon className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-sm font-bold mb-2 group-hover:text-accent transition-colors leading-snug">{extra.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{extra.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════ 6. COMO FUNCIONA ═══════ */}
        <section id="como-funciona" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} className="text-center mb-16"
            >
              <Badge variant="outline" className="mb-4 text-accent border-accent/20 rounded-[5px] bg-accent/5 font-bold uppercase h-6 px-3">
                <Map className="w-3 h-3 mr-2" /> Risco Zero — Simples assim
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-4">
                Sua Jornada para o Cockpit<br className="hidden md:block" /> em 4 Passos Simples.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="relative group text-center"
                >
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+32px)] right-[-50%] h-px bg-border z-0" />
                  )}
                  <div className="w-16 h-16 rounded-[5px] bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors relative z-10">
                    <step.icon className="w-8 h-8 text-accent" />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-[60px] w-8 h-8 rounded-[5px] bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center z-10">
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-14">
              <Button variant="hero" size="lg" asChild className="rounded-[5px] hover-yellow">
                <Link to={user ? '/simulados' : '/auth?mode=signup'} className="flex items-center gap-2">
                  Começar Meu Teste Grátis <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-3">Sem cartão de crédito · Cancele quando quiser</p>
            </div>
          </div>
        </section>

        {/* ═══════ 7. DEPOIMENTOS ═══════ */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-accent border-accent/20 rounded-[5px] bg-accent/5 font-bold uppercase h-6 px-3">
                <Star className="w-3 h-3 mr-2 fill-current" /> Prova Social
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-4">
                Quem Voou Mais Alto com o Voo Certo.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Mais de 1.200 candidatos usam nossos simulados, a IA explicativa e os guias de trajetória para chegar preparados no dia da prova.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-card border-border h-full rounded-[5px] hover:shadow-xl transition-all">
                    <CardContent className="pt-8">
                      <div className="flex mb-4">
                        {[...Array(t.stars)].map((_, s) => (
                          <Star key={s} className="w-4 h-4 text-accent fill-accent" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">"{t.quote}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{t.name}</p>
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

        {/* ═══════ 8. PREÇOS ═══════ */}
        <section id="planos" className="py-16 md:py-24" style={{ background: 'var(--gradient-hero)' }}>
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} className="text-center mb-16"
            >
              <Badge className="mb-4 bg-accent text-accent-foreground border-0 rounded-[5px] font-bold uppercase text-[10px] tracking-widest px-4 py-1.5 h-auto">
                Período de Experiência Grátis por 7 Dias
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold text-primary-foreground mb-4">
                Escolha o Plano Ideal para Sua Aprovação.
              </h2>
              <p className="text-primary-foreground/60 max-w-xl mx-auto font-medium">
                Todos os planos incluem 7 dias gratuitos. Cancele quando quiser.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PLANS.map((plan, i) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  >
                    <Card className={`h-full flex flex-col relative overflow-hidden rounded-[5px] border-0 shadow-xl ${plan.highlight ? 'bg-card ring-2 ring-accent' : 'bg-card'}`}>
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-[5px]">
                          Mais Popular
                        </div>
                      )}
                      <CardHeader className="text-center pb-6 pt-10">
                        <div className={`w-14 h-14 rounded-[5px] flex items-center justify-center mx-auto mb-4 ${plan.highlight ? 'bg-accent/10' : 'bg-primary/5'}`}>
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
                          <Link to="/premium">Começar Teste Grátis</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-16 bg-white/5 border border-white/10 rounded-[5px] p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                {[
                  { icon: Shield, text: 'Cancelamento sem burocracia' },
                  { icon: Sparkles, text: '7 dias grátis em todos os planos' },
                  { icon: Globe, text: 'PC, Tablet e Celular' },
                  { icon: Zap, text: 'Dúvidas resolvidas na hora por IA' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <item.icon className="w-6 h-6 text-accent" />
                    <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-wider leading-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ 9. FAQ ═══════ */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-accent border-accent/20 rounded-[5px] bg-accent/5 font-bold uppercase h-6 px-3">
                <MessageCircle className="w-3 h-3 mr-2" /> Dúvidas Frequentes
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-4">Perguntas Frequentes</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Tudo o que você precisa saber antes de começar.</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-3">
              {FAQ.map((faq, i) => (
                <motion.details
                  key={i}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="group bg-card border border-border rounded-[5px] overflow-hidden shadow-none"
                >
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

        {/* ═══════ 10. CTA FINAL ═══════ */}
        <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{ backgroundImage: `url(${airplaneSunset})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
          </div>
          <div className="container mx-auto relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} className="max-w-3xl mx-auto"
            >
              <Badge className="mb-6 bg-accent text-accent-foreground border-0 rounded-[5px] font-bold uppercase text-[10px] tracking-widest px-4 py-1.5 h-auto">
                7 Dias Grátis — Sem Cartão de Crédito
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
                Pronto para decolar<br className="hidden md:block" />{' '}
                <span className="text-accent">sua carreira na aviação?</span>
              </h2>
              <p className="text-xl text-primary-foreground/70 mb-10 font-medium">
                Simulados no formato da prova, IA que explica cada erro e relatórios que mostram exatamente quando você estará pronto. É assim que você passa de primeira na ANAC.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="xl" asChild className="rounded-[5px] w-full sm:w-fit whitespace-normal h-auto py-4 sm:h-14 sm:py-0 hover-yellow">
                  <Link to={user ? '/simulados' : '/auth?mode=signup'} className="flex items-center justify-center gap-2">
                    COMEÇAR MEU TESTE GRÁTIS DE 7 DIAS <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild className="bg-white/5 text-white border-white/20 hover-yellow rounded-[5px] w-full sm:w-fit">
                  <a href="#planos" className="flex items-center justify-center gap-2">
                    Ver Planos
                  </a>
                </Button>
              </div>
              <p className="mt-8 text-sm text-primary-foreground/40 font-medium flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> Sem compromisso. Cancele quando quiser.
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
