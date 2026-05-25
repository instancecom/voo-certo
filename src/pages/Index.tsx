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

const STEPS = [
  { icon: GraduationCap, title: 'Treine com simulados realistas', desc: 'Pratique com questões inspiradas no formato dos exames oficiais, organizadas por matéria.' },
  { icon: BarChart3, title: 'Descubra seus pontos fracos', desc: 'Relatórios detalhados identificam exatamente onde você precisa focar sua energia.' },
  { icon: Brain, title: 'Evolua com IA especializada', desc: 'Entenda o porquê de cada resposta com explicações contextuais inteligentes.' },
  { icon: Award, title: 'Avance rumo à sua aprovação', desc: 'Ganhe confiança e chegue preparado para conquistar seu lugar no mercado.' },
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

        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Voo Certo",
            "operatingSystem": "Web, Android, iOS",
            "applicationCategory": "EducationalApplication",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "1250"
            },
            "offers": {
              "@type": "Offer",
              "price": "19.90",
              "priceCurrency": "BRL"
            }
          })}
        </script>

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

          <motion.div className="absolute top-10 md:top-20 right-4 md:right-20 opacity-20 md:opacity-100"
            animate={{ y: [-10, 10, -10], rotate: [0, 2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <Plane className="w-12 h-12 md:w-24 md:h-24 text-accent/30" />
          </motion.div>

          <div className="container mx-auto py-20 md:py-32 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-[5px] text-accent mb-6 mx-auto lg:mx-0">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Simulador Teórico de Preparação</span>
                </motion.div>

                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
                  Sua Preparação Completa para a <br className="hidden md:block" />
                  <span className="text-accent">Banca ANAC de Comissário.</span>
                </h1>

                <p className="text-lg md:text-xl text-primary-foreground/80 mb-4 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                  Estude de forma inteligente com simulados de alta fidelidade que preparam você de verdade para o dia da banca. Esclareça dúvidas na hora com nosso Chat IA explicativo, acompanhe seu progresso real por matéria e crie seu currículo padrão de aviação.
                </p>

                <p className="text-sm text-success/90 mb-8 flex items-center justify-center lg:justify-start gap-2 font-semibold">
                  <BadgeCheck className="w-4 h-4" />
                  Acelere seus estudos com simulados, guias de carreira e suporte de IA 24/7.
                </p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <Button variant="hero" size="xl" asChild className="rounded-[5px] w-full sm:w-fit whitespace-normal h-auto py-4 sm:h-14 sm:py-0 hover-yellow">
                    <Link to={user ? '/simulados' : '/auth?mode=signup'} className="flex items-center justify-center gap-2">
                      Começar Agora <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="xl" asChild className="bg-white/5 text-white border-white/20 hover-yellow rounded-[5px] w-full sm:w-fit">
                    <Link to="/premium" className="flex items-center justify-center gap-2">
                      Ver Recursos
                  </Link>
                  </Button>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center lg:justify-start gap-6 md:gap-8 mt-12">
                  {[
                    { value: '500+', label: 'Questões' },
                    { value: '10+', label: 'Simulados' },
                    { value: '95%', label: 'Aprovação' },
                    { value: '24/7', label: 'Acesso' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl md:text-4xl font-bold text-accent">{stat.value}</div>
                      <div className="text-[10px] md:text-sm text-primary-foreground/60 font-bold uppercase tracking-tighter">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>

                <p className="text-[10px] text-primary-foreground/45 mt-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium text-center lg:text-left">
                  * AVISO DE ISENÇÃO: O Voo Certo é uma plataforma independente de simulados, guias de carreira e ferramentas de estudo para fins educacionais de preparação complementar. Não somos um órgão governamental, não representamos e não possuímos afiliação oficial com a ANAC, e não substituímos o curso de formação teórica ou prática obrigatório exigido por escolas oficiais de aviação homologadas.
                </p>
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
                      <div className="w-10 h-10 rounded-[5px] bg-accent/10 flex items-center justify-center">
                        <BadgeCheck className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Padrão ANAC</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Questões 100% atualizadas</p>
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

        {/* ═══════ STUDY MODES ═══════ */}
        <section className="py-16 md:py-24 bg-card border-y border-border">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-accent border-accent/20 rounded-[5px] bg-accent/5 font-bold uppercase h-6 px-3">
                <Play className="w-3 h-3 mr-2" /> Tecnologia de Estudo
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-4">
                3 Modos de Estudo Inteligentes
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Escolha a melhor forma de treinar de acordo com seu momento de preparação.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: 'Modo Banca',
                  icon: Shield,
                  desc: 'O simulado definitivo. Tempo real, 20 questões aleatórias e pressão de prova para você saber se está realmente pronto.',
                  benefit: 'Foco em Performance'
                },
                {
                  title: 'Modo Livre',
                  icon: Zap,
                  desc: 'Pratique no seu ritmo. Escolha o número de questões e veja a resposta na hora para acelerar seu aprendizado.',
                  benefit: 'Flexibilidade Total'
                },
                {
                  title: 'Modo Bloco',
                  icon: Target,
                  desc: 'Domine suas dificuldades. Treine matérias específicas como CMS, PSS, RPA ou Meteorologia até atingir a perfeição.',
                  benefit: 'Foco Dirigido'
                }
              ].map((mode, i) => (
                <Card key={i} className="bg-background border-border hover:border-accent/50 transition-all group rounded-[5px] hover:-translate-y-2 duration-300">
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
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {mode.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ PLATFORM SHOWCASE ═══════ */}
        <section className="py-16 md:py-24 bg-background overflow-hidden">
          <div className="container mx-auto">
             <div className="max-w-5xl mx-auto">
                <div className="relative group">
                   {/* Decorative elements */}
                   <div className="absolute -top-12 -left-12 w-48 h-48 bg-accent/10 rounded-full blur-3xl opacity-50" />
                   <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
                   
                   <motion.div 
                     initial={{ opacity: 0, y: 40 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     className="relative bg-card border border-border rounded-[10px] shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden">
                      {/* Browser Header */}
                      <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 gap-2">
                         <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-destructive/30" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                            <div className="w-2.5 h-2.5 rounded-full bg-success/30" />
                         </div>
                         <div className="mx-auto bg-background/50 rounded-md px-4 py-1 text-[10px] text-muted-foreground/60 font-mono">
                            app.voocerto.com.br/simulados
                         </div>
                      </div>
                      
                      {/* Dashboard Content Mockup - Can be replaced by an Image, GIF or Video */}
                      <div className="relative aspect-video w-full overflow-hidden opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000">
                         <img 
                           src="/platform_showcase_mockup_1777986775787.png" 
                           alt="Preview da Plataforma" 
                           className="w-full h-full object-cover"
                         />
                         {/* To use a video instead, uncomment below and comment the img tag above: */}
                         {/* 
                         <video 
                           src="/seu-video.mp4" 
                           autoPlay 
                           loop 
                           muted 
                           playsInline 
                           className="w-full h-full object-cover"
                         /> 
                         */}
                      </div>

                      {/* Floating CTAs over the blur */}
                      <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all duration-700">
                         <motion.div 
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           className="bg-card/90 backdrop-blur-md border border-accent/20 p-8 rounded-[10px] shadow-2xl text-center max-w-sm">
                            <Rocket className="w-12 h-12 text-accent mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Interface Intuitiva</h3>
                            <p className="text-sm text-muted-foreground mb-6">Foque apenas no que importa: seu conhecimento.</p>
                            <Button variant="hero" className="rounded-[5px] w-full" asChild>
                               <Link to="/simulados">Ver Agora</Link>
                            </Button>
                         </motion.div>
                      </div>
                   </motion.div>
                </div>
             </div>
          </div>
        </section>

        {/* ═══════ AI ASSISTANT ═══════ */}
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 skew-x-12 translate-x-20" />
          <div className="container mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-center lg:text-left">
                <Badge className="mb-4 bg-success text-success-foreground border-0 rounded-[5px] font-bold uppercase text-[10px] tracking-widest px-4 py-1.5 h-auto mx-auto lg:mx-0">
                  Exclusivo Voo Certo
                </Badge>
                <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Chat IA Contextual: <br className="hidden md:block" />
                  Sua dúvida respondida <span className="text-accent">na hora.</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Errou uma questão técnica? Nossa IA analisa a pergunta e as alternativas para explicar exatamente onde você errou e qual a base normativa da resposta correta.
                </p>
                <ul className="space-y-4 mb-10 text-left inline-block lg:block">
                  {[
                    'Explicações detalhadas por questão',
                    'Dicas para memorizar matérias complexas',
                    'Suporte 24h sem depender de instrutor',
                    'Linguagem clara e focada em aviação'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground font-bold">
                      <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="hero" size="lg" className="rounded-[5px]" asChild>
                  <Link to="/auth?mode=signup">Testar IA Grátis</Link>
                </Button>
              </motion.div>
              <div className="relative">
                 <div className="bg-card border border-border p-6 rounded-[5px] shadow-2xl relative z-10 hover:shadow-accent/5 transition-all duration-500 group/chat">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                       <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center group-hover/chat:rotate-12 transition-transform">
                          <Brain className="w-6 h-6 text-accent-foreground" />
                       </div>
                       <div>
                          <p className="text-sm font-bold">Assistente de Voo IA</p>
                          <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                             <p className="text-[10px] text-success font-bold uppercase tracking-tighter">Pronto para ajudar</p>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <motion.div 
                         initial={{ opacity: 0, x: -10 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         className="bg-muted p-3 rounded-[10px] rounded-tl-none text-xs max-w-[85%] shadow-sm">
                          "Por que a resposta 'A' está errada nesta questão de RPA?"
                       </motion.div>
                       <motion.div 
                         initial={{ opacity: 0, x: 10 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.5 }}
                         className="bg-accent/10 border border-accent/20 p-4 rounded-[10px] rounded-tr-none text-[11px] ml-auto max-w-[90%] shadow-sm">
                          <p className="font-bold text-accent mb-1.5 flex items-center gap-1">
                             <Sparkles className="w-3 h-3" /> Explicação da IA
                          </p>
                          <p className="leading-relaxed text-foreground/80">
                             A alternativa 'A' refere-se ao regime de reserva, mas o enunciado foca no limite de pousos para tripulação simples em voos domésticos...
                          </p>
                       </motion.div>
                       <motion.div 
                         initial={{ opacity: 0 }}
                         whileInView={{ opacity: 1 }}
                         transition={{ delay: 1 }}
                         className="flex gap-1 items-center pt-2">
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

        {/* ═══════ CAREER & CV ═══════ */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <img src={airplaneSunset} alt="Carreira na Aviação" className="rounded-[5px] shadow-xl border border-border" />
              </div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2 text-center lg:text-left">
                <Badge variant="outline" className="mb-4 text-accent border-accent/20 rounded-[5px] bg-accent/5 font-bold uppercase h-6 px-3 mx-auto lg:mx-0">
                  Apoio Profissional
                </Badge>
                <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-6">
                  Do simulado à sua <br className="hidden md:block" />
                  <span className="text-accent underline decoration-accent/20">primeira contratação.</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Não apenas simulados. Oferecemos o suporte que você precisa para entrar nas maiores companhias aéreas do Brasil.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="p-5 bg-card border border-border rounded-[5px]">
                      <FileText className="w-8 h-8 text-accent mb-4" />
                      <h3 className="font-bold mb-2">Gerador de Currículo</h3>
                      <p className="text-xs text-muted-foreground">Template otimizado para o padrão recrutamento de aviação.</p>
                   </div>
                   <div className="p-5 bg-card border border-border rounded-[5px]">
                      <Map className="w-8 h-8 text-accent mb-4" />
                      <h3 className="font-bold mb-2">Guia de Carreira</h3>
                      <p className="text-xs text-muted-foreground">Passo a passo completo: do curso teórico até a seleção.</p>
                   </div>
                   <div className="p-5 bg-card border border-border rounded-[5px]">
                      <Trophy className="w-8 h-8 text-accent mb-4" />
                      <h3 className="font-bold mb-2">Selo LinkedIn</h3>
                      <p className="text-xs text-muted-foreground">Comprove seu desempenho e destaque seu perfil profissional.</p>
                   </div>
                   <div className="p-5 bg-card border border-border rounded-[5px]">
                      <MessageCircle className="w-8 h-8 text-accent mb-4" />
                      <h3 className="font-bold mb-2">Fit Cultural</h3>
                      <p className="text-xs text-muted-foreground">Preparação para as entrevistas e testes psicológicos.</p>
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════ DIFFERENTIALS (EX-TESTIMONIALS) ═══════ */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-accent border-accent/20 rounded-[5px] bg-accent/5 font-bold uppercase h-6 px-3">
                <Sparkles className="w-3 h-3 mr-2" /> Excelência Técnica
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-4">
                Por que estudar com o Voo Certo?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Unimos tecnologia de ponta e metodologia focada para garantir que você chegue na prova com total confiança.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {DIFFERENTIALS.slice(0, 6).map((d, i) => {
                const Icon = d.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className="bg-card border-border h-full flex flex-col rounded-[5px] hover:shadow-xl transition-all group border-transparent hover:border-accent/20">
                      <CardContent className="pt-8 flex-1">
                        <div className="w-12 h-12 rounded-[5px] bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                           <Icon className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-lg font-bold mb-3 group-hover:text-accent transition-colors">{d.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {d.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════ PROBLEM / SOLUTION ═══════ */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Badge variant="outline" className="mb-4 text-destructive border-destructive/20 rounded-[5px] bg-destructive/5 font-bold uppercase h-6 px-3">
                  <Target className="w-3 h-3 mr-2" /> O Desafio do Aluno
                </Badge>
                <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-6">
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
                <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-6">
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
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-accent border-accent/20 rounded-[5px] bg-accent/5 font-bold uppercase h-6 px-3">
                <Map className="w-3 h-3 mr-2" /> Metodologia
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-4">
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
        <section className="py-16 md:py-24" style={{ background: 'var(--gradient-hero)' }}>
          <div className="container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <Badge className="mb-4 bg-accent text-accent-foreground border-0 rounded-[5px] font-bold uppercase text-[10px] tracking-widest px-4 py-1.5 h-auto">
                 Período de Experiência Grátis por 7 Dias
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold text-primary-foreground mb-4">Planos de Preparação</h2>
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
                            Iniciar Grátis
                          </Link>
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
                  { icon: Globe, text: 'Acesso pelo PC, Tablet e Celular' },
                  { icon: Zap, text: 'Dúvidas resolvidas na hora por IA' }
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

        {/* ═══════ TESTIMONIALS (PROVA SOCIAL) ═══════ */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-accent border-accent/20 rounded-[5px] bg-accent/5 font-bold uppercase h-6 px-3">
                <Star className="w-3 h-3 mr-2 fill-current" /> Prova Social
              </Badge>
              <h2 className="text-2xl md:text-5xl font-bold text-foreground mb-4">
                O que dizem os futuros comissários
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Mais de 1.200 alunos usam nossos simulados e guias teóricos para acelerar seus estudos rumo à aprovação na banca da ANAC.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  quote: "O Chat IA Contextual mudou completamente minha forma de estudar. Quando eu errava, ele me explicava a lógica imediatamente, economizando horas de pesquisa.",
                  author: "Mariana Silva",
                  role: "Assinante Voo Certo",
                  rating: 5,
                },
                {
                  quote: "Os simulados são muito fiéis ao formato da banca real. Treinar com a pressão do tempo me deu a segurança necessária para ser aprovado de primeira na ANAC.",
                  author: "Thiago Rocha",
                  role: "Assinante Voo Certo",
                  rating: 5,
                },
                {
                  quote: "Além de responder as questões, o construtor de currículo aeronáutico e o selo LinkedIn me ajudaram a apresentar meu perfil de forma profissional para as empresas.",
                  author: "Amanda Lima",
                  role: "Assinante Voo Certo",
                  rating: 5,
                }
              ].map((t, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} 
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-card border-border h-full flex flex-col rounded-[5px] hover:shadow-xl transition-all duration-300">
                    <CardContent className="pt-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex gap-1 mb-4 text-accent">
                          {Array.from({ length: t.rating }).map((_, idx) => (
                            <Star key={idx} className="w-4 h-4 fill-current animate-pulse" />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                          "{t.quote}"
                        </p>
                      </div>
                      <div className="mt-auto border-t border-border/50 pt-4">
                        <p className="font-bold text-foreground text-sm">{t.author}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ FAQ ═══════ */}
        <section className="py-16 md:py-24 bg-muted/20">
          <div className="container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-2xl md:text-5xl font-bold text-foreground">Dúvidas Frequentes</h2>
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
        <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `url(${airplaneSunset})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          </div>
          
          <div className="container mx-auto relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto">
              <Badge className="mb-6 bg-accent text-accent-foreground border-0 rounded-[5px] font-bold uppercase text-[10px] tracking-widest px-4 py-1.5 h-auto">
                Sua Jornada Começa Aqui
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
                Pronto para conquistar sua <span className="text-accent">aprovação na ANAC?</span>
              </h2>
              <p className="text-xl text-primary-foreground/70 mb-10 font-medium">
                Tenha acesso aos simulados mais realistas do mercado, suporte de IA em tempo real e um guia completo de carreira.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="xl" asChild className="rounded-[5px] w-full sm:w-fit whitespace-normal h-auto py-4 sm:h-14 sm:py-0 hover-yellow">
                  <Link to={user ? '/simulados' : '/auth?mode=signup'} className="flex items-center justify-center gap-2">
                    Começar Minha Preparação Agora <ArrowRight className="w-5 h-5" />
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
