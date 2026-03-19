import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  LayoutDashboard,
  MessageCircle,
  Play,
  PlayCircle,
  Star,
  Users,
  Brain,
  Timer,
  BarChart3,
  Monitor,
  Plane,
  ArrowUpRight,
  Trophy,
  ShieldCheck,
  Zap,
  Globe,
  Map,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useExams';
import { Loader2 } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Solo',
    price: '0',
    icon: Plane,
    highlight: false,
    features: ['Simulados limitados (1/dia)', 'Resumos básicos', 'Suporte via e-mail'],
    cta: 'Começar Grátis',
  },
  {
    id: 'tripulante',
    name: 'Tripulante+',
    price: '49,90',
    icon: Zap,
    highlight: true,
    features: ['Simulados ilimitados', 'Instrutor IA (5 msgs/pergunta)', 'Roadmap de Carreira', 'Microcursos ANAC'],
    cta: 'Escolher Tripulante+',
  },
  {
    id: 'comandante',
    name: 'Comandante',
    price: '89,90',
    icon: Trophy,
    highlight: false,
    features: ['Tudo do Tripulante+', 'IA Ilimitada', 'Consultoria de Currículo', 'Mentoria Mensal'],
    cta: 'Seja Comandante',
  },
];

const STEPS = [
  { 
    title: 'Seu Diagnóstico', 
    desc: 'Avalie seu nível atual com nosso primeiro simulado gratuito.', 
    icon: TargetIcon 
  },
  { 
    title: 'Caminho Guiado', 
    desc: 'Siga o roadmap personalizado baseado no seu objetivo.', 
    icon: Map 
  },
  { 
    title: 'Estudo Inteligente', 
    desc: 'Use nossa IA para entender cada erro cometido.', 
    icon: Brain 
  },
  { 
    title: 'Aprovação ANAC', 
    desc: 'Chegue na prova com 100% de confiança e decole.', 
    icon: CheckCircle2 
  },
];

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  );
}

// Media assets (placeholder paths - using generate_image later if needed, but keeping text-based for now)
const heroAttendant = "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=2000";
const studyDesk = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1500";
const airplaneSunset = "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&q=80&w=2000";

const iconMap: Record<string, any> = {
  Plane,
  Monitor,
  Calendar,
  Brain,
  Timer,
  BarChart3,
};

export default function Index() {
  const { user } = useAuth();
  const { data: categories, isLoading } = useCategories();

  const categoriesWithSubs = categories?.map(cat => ({
    ...cat,
    subcategories: cat.subcategories || []
  })) || [];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-24 overflow-hidden bg-[#0A192F]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[-5%] w-[40%] h-[70%] bg-accent/20 blur-[140px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[60%] bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-10 shadow-lg shadow-black/20"
              >
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A192F] bg-accent/30 flex items-center justify-center text-sm shadow-inner overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-black text-white/90 uppercase tracking-[0.2em] ml-2">Líder em Aprovação ANAC</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
                Sua rota segura <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-amber-300 to-accent animate-gradient-x underline decoration-accent/30 underline-offset-8">para Decolar.</span>
              </h1>

              <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-xl leading-relaxed font-medium">
                Simulados 100% atualizados, instrutor IA disponível 24/7 e o roadmap definitivo para sua contratação na aviação civil.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <Button variant="hero" size="xl" className="h-16 px-10 text-lg rounded-[1.25rem] shadow-2xl shadow-accent/20 group relative overflow-hidden" asChild>
                  <Link to={user ? '/simulados' : '/auth'}>
                    <span className="relative z-10 flex items-center">
                      Começar Jornada <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-500" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </Link>
                </Button>
                <Button variant="glass" size="xl" className="h-16 px-10 text-lg rounded-[1.25rem] border-white/10 hover:bg-white/10 transition-all font-bold group" asChild>
                  <Link to="/premium" className="flex items-center">
                    Explorar Planos <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-12 mt-20 pt-12 border-t border-white/5">
                {[
                  { value: '5k+', label: 'Questões' },
                  { value: '98%', label: 'Satisfação' },
                  { value: '10k+', label: 'Simulados' },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl font-black text-white tabular-nums tracking-tighter">{stat.value}</div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Visual Hero Element */}
            <div className="lg:col-span-1 hidden lg:block relative perspective-1000">
              <motion.div
                initial={{ opacity: 0, rotateY: 20, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1, x: 0 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
              >
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl shadow-black/40 group">
                  <img src={heroAttendant} alt="Aviation Professional" className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/80 via-transparent to-transparent" />
                  
                  {/* Floating Action Badge */}
                  <div className="absolute bottom-10 left-10 right-10 p-8 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/40">
                        <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
                      </div>
                      <div>
                        <p className="text-white font-black text-lg tracking-tight">Prepare-se</p>
                        <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Para o Sucesso</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-8 h-8 text-accent animate-bounce" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS (Timeline Section) ═══════ */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-24">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-accent/30 bg-accent/5 text-accent text-[10px] font-black tracking-[0.2em] uppercase">
              <Sparkles className="w-3 h-3 mr-2" /> Metodologia Voo Certo
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Do zero à aprovação em 4 passos</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic leading-relaxed">Simplificamos o complexo para você focar apenas no que cai na prova.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl mx-auto relative px-6 md:px-0">
            {/* Background Line for Desktop */}
            <div className="hidden md:block absolute top-[4.5rem] left-[10%] right-[10%] h-px bg-slate-100 dash-border" />
            
            {STEPS.map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative text-center group"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl border border-slate-50 flex items-center justify-center mx-auto mb-8 relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-shadow-2xl">
                  <step.icon className="w-10 h-10 text-accent" />
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-[#0A192F] text-white text-sm font-black flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform">
                    0{i+1}
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-accent transition-colors">{step.title}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ DIFFERENTIALS (Modern Bento Grid) ═══════ */}
      <section className="py-32 bg-slate-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 text-center md:text-left">
            <div>
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 rounded-full bg-accent/10 border-accent/20 text-accent text-[10px] font-black tracking-[0.2em] uppercase">
                <ShieldCheck className="w-3 h-3 mr-2" /> Plataforma Exclusiva
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">A tecnologia ao lado <br /><span className="text-accent underline decoration-accent/20 underline-offset-8">do seu Sonho.</span></h2>
            </div>
            <p className="text-lg text-slate-500 font-medium max-w-md md:pb-2">Recursos desenvolvidos por quem entende de aviação, para quem quer se tornar profissional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto md:auto-rows-[220px]">
            {/* Bento Card 1: AI Assistant */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="md:col-span-2 md:row-span-2 bg-[#0A192F] text-white p-12 rounded-[3.5rem] flex flex-col justify-end relative overflow-hidden group shadow-2xl shadow-blue-900/10"
            >
              <div className="absolute top-12 left-12 w-20 h-20 rounded-3xl bg-accent flex items-center justify-center shadow-lg shadow-accent/40 group-hover:scale-110 transition-transform duration-500">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent/20 blur-[120px] rounded-full group-hover:bg-accent/30 transition-colors" />
              
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-4 tracking-tight">Experiência de Sala de Aula com IA</h3>
                <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-sm">Tire dúvidas em tempo real. Nossa IA explica cada questão como um instrutor humano faria.</p>
              </div>
            </motion.div>

            {/* Bento Card 2: Roadmap */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="md:col-span-2 md:row-span-1 bg-white border border-slate-100 p-10 rounded-[3rem] flex items-center gap-8 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="w-20 h-20 rounded-[1.5rem] bg-accent/5 flex items-center justify-center shrink-0">
                <Map className="w-10 h-10 text-accent" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-slate-900 tracking-tight">Roadmap de Carreira</h3>
                <p className="text-slate-500 font-medium mt-1">Sabemos exatamente o que você precisa em cada etapa, do PP ao PC-IFR.</p>
              </div>
            </motion.div>

            {/* Bento Card 3: Performance */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="md:col-span-1 md:row-span-1 bg-white border border-slate-100 p-8 rounded-[3rem] flex flex-col items-center justify-center text-center shadow-xl hover:shadow-2xl transition-all group"
            >
              <BarChart3 className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-black text-slate-900 tracking-tight">Métricas</h3>
              <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest">Acompanhamento Real</p>
            </motion.div>

            {/* Bento Card 4: Multiplatform */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="md:col-span-1 md:row-span-1 bg-accent p-8 rounded-[3rem] flex flex-col items-start justify-end text-white shadow-2xl shadow-accent/20 relative overflow-hidden group"
            >
              <Monitor className="w-8 h-8 mb-4 relative z-10" />
              <h3 className="font-black text-lg relative z-10 leading-tight">Voe em qualquer dispositivo</h3>
              <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-white/20 blur-2xl rounded-full" />
            </motion.div>

            {/* Bento Card 5: Smart Timer */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="md:col-span-2 md:row-span-1 bg-white border border-slate-100 p-8 rounded-[3rem] flex items-center justify-between shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-primary/5 rounded-2xl"><Timer className="w-8 h-8 text-primary" /></div>
                <div><h3 className="font-black text-xl text-slate-900">Simulação Sob Medida</h3><p className="text-slate-500 text-sm">Controle seu tempo e melhore seu ritmo.</p></div>
              </div>
              <div className="flex gap-1.5">{[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{animationDelay: `${i*150}ms`}} />)}</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ IA HIGHLIGHT (Modern Tech Section) ═══════ */}
      <section className="py-32 bg-[#0A192F] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}>
              <div className="relative">
                <img src={studyDesk} alt="IA Study Experience" className="rounded-[3.5rem] border-4 border-white/5 shadow-3xl grayscale-[0.5] hover:grayscale-0 transition-all duration-1000" />
                <div className="absolute top-10 right-[-30px] p-6 rounded-[2.5rem] bg-accent shadow-3xl animate-float">
                  <div className="flex items-center gap-4 text-white">
                    <Brain className="w-10 h-10 fill-white/20" />
                    <div><p className="text-xl font-black leading-tight">Explicação Instantânea</p><p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Engine v3.0 Ativa</p></div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-accent/40 bg-accent/10 text-accent text-[10px] font-black tracking-[0.2em] uppercase">
                <Globe className="w-3 h-3 mr-2" /> Inteligência Integrada
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight">O fim das dúvidas sem resposta.</h2>
              <p className="text-xl text-white/50 mb-12 font-medium leading-relaxed italic">"Não é só sobre saber a correta, é sobre entender o porquê de cada vírgula. É isso que te faz passar no exame da ANAC e ser um piloto melhor."</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                {[
                  { title: 'Conhecimento Profundo', desc: 'Regulamentação e teoria pura.', icon: BookOpen },
                  { title: 'Lógica Pura', desc: 'Nada de decoreba, aprenda o porquê.', icon: ShieldCheck },
                ].map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10"><f.icon className="w-6 h-6 text-accent" /></div>
                    <div><h4 className="font-black text-lg mb-1">{f.title}</h4><p className="text-white/40 text-sm leading-relaxed">{f.desc}</p></div>
                  </div>
                ))}
              </div>
              <Button variant="hero" size="xl" className="h-16 px-10 rounded-2xl group" asChild>
                <Link to="/auth">
                  Testar com uma Questão <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ CATEGORIES SECTION ═══════ */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-24">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-primary/20 text-primary text-[10px] font-black tracking-[0.2em] uppercase">Grade Curricular</Badge>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Matérias Oficiais ANAC</h2>
            <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto italic leading-relaxed">Conteúdo rigorosamente alinhado com o banco oficial de questões.</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-accent" />
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Carregando Banco de Dados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categoriesWithSubs.map((cat, i) => {
                const Icon = iconMap[cat.icon || 'Plane'] || Plane;
                const isSoon = cat.subcategories.length === 0;
                return (
                  <Link 
                    key={cat.id} 
                    to={isSoon ? '#' : '/simulados'} 
                    className={`group p-10 rounded-[3rem] border-2 border-slate-50 flex items-center gap-8 hover:shadow-2xl hover:border-accent/30 transition-all bg-white relative overflow-hidden ${isSoon ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                      <Icon className="w-40 h-40 -rotate-12 transform group-hover:-translate-x-4 transition-transform" />
                    </div>
                    
                    <div className="w-20 h-20 rounded-[1.75rem] bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-sm relative z-10">
                      <Icon className="w-10 h-10" />
                    </div>
                    
                    <div className="flex-1 text-left relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-accent transition-colors">{cat.name}</h3>
                        {isSoon && <Badge variant="secondary" className="h-6 rounded-full px-3 text-[9px] font-black uppercase tracking-wider">Em breve</Badge>}
                      </div>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm line-clamp-2">{cat.description}</p>
                    </div>
                    
                    {!isSoon && (
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shrink-0">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════ PRICING SECTION ═══════ */}
      <section className="py-32 bg-slate-50 relative overflow-hidden" id="planos">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-background to-transparent" />
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-24">
            <Badge className="bg-accent/10 text-accent border-accent/20 px-6 py-2 rounded-full mb-6 font-black uppercase text-[11px] tracking-widest">Investimento</Badge>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">O melhor custo-benefício.</h2>
            <p className="text-xl text-slate-500 font-medium">Planos desenhados para cada fase da sua trajetória.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {PLANS.map((plan, i) => (
              <Card 
                key={plan.id} 
                className={`group relative flex flex-col rounded-[3.5rem] p-10 transition-all duration-500 border-none hover:translate-y-[-10px] ${
                  plan.highlight 
                    ? 'bg-[#0A192F] text-white shadow-3xl shadow-blue-900/30 ring-4 ring-accent' 
                    : 'bg-white shadow-xl hover:shadow-2xl'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-accent text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                    Mais Popular
                  </div>
                )}
                
                <div className="mb-10 text-center">
                  <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center mx-auto mb-6 shadow-xl relative overflow-hidden transition-transform duration-500 group-hover:scale-110 ${
                    plan.highlight ? 'bg-accent text-white' : 'bg-primary/5 text-primary'
                  }`}>
                    <plan.icon className="w-10 h-10 relative z-10" />
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
                  </div>
                  <h3 className={`text-4xl font-black mb-2 tracking-tighter ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                  <div className={`flex items-baseline justify-center gap-1 ${plan.highlight ? 'text-white/60' : 'text-slate-500'}`}>
                    <span className="text-lg font-bold">R$</span>
                    <span className={`text-5xl font-black tabular-nums tracking-tighter ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                    <span className="text-sm font-bold">/mês</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-accent/20' : 'bg-primary/5'}`}>
                        <CheckCircle2 className={`w-4 h-4 ${plan.highlight ? 'text-accent' : 'text-primary'}`} />
                      </div>
                      <span className={`text-sm font-bold ${plan.highlight ? 'text-white/80 transition-colors group-hover:text-white' : 'text-slate-600'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant={plan.highlight ? 'hero' : 'outline'} 
                  size="xl" 
                  className={`w-full h-16 rounded-2xl font-black text-lg transition-all ${
                    plan.highlight 
                      ? 'shadow-xl shadow-accent/20' 
                      : 'border-2 border-slate-100 hover:border-accent hover:text-accent'
                  }`} 
                  asChild
                >
                  <Link to="/auth">{plan.cta}</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CALL TO ACTION ═══════ */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-16 md:p-24 rounded-[4rem] bg-gradient-to-br from-primary to-slate-900 relative overflow-hidden text-center text-white shadow-3xl"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
            <div className="absolute top-20 right-20 w-80 h-80 bg-accent/20 blur-[130px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-black mb-10 leading-[0.95] tracking-tighter">Preparado para sua <br /><span className="text-accent underline decoration-accent/30 underline-offset-[12px]">Próxima Decolagem?</span></h2>
              <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-2xl mx-auto font-medium">Junte-se a milhares de pilotos que usam a melhor tecnologia para conquistar a CHT.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Button variant="hero" size="xl" className="h-18 px-12 text-xl rounded-2xl shadow-2xl shadow-accent/30" asChild>
                  <Link to="/auth">Criar Conta Grátis</Link>
                </Button>
                <div className="flex items-center justify-center gap-4 px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-slate-800" />)}
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-white/60">Mais de 10k alunos ativos</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
