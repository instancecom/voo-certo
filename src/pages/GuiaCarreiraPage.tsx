import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCareerGuides } from '@/hooks/useCareerGuides';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  ArrowRight, Plane, Loader2, Lock, BookOpen, Crown, Wrench, ChevronLeft, ChevronRight,
  Filter, Check, Target, ChevronDown, CheckCircle2, MapPin,
} from 'lucide-react';


const getGuideCategory = (guide: any) => {
  if (guide?.category) return guide.category;
  
  const title = guide?.title || '';
  const t = title.toLowerCase();
  if (t.includes('comissaria') || t.includes('comissário') || t.includes('comissario') || t.includes('bordo')) {
    return 'comissaria';
  }
  if (t.includes('piloto') || t.includes('pp') || t.includes('pc') || t.includes('voar')) {
    return 'piloto';
  }
  if (t.includes('mecanico') || t.includes('mecânico') || t.includes('manutenção') || t.includes('manutencao')) {
    return 'mecanico';
  }
  return 'geral';
};

interface CareerGuideRowProps {
  title: string;
  icon: React.ReactNode;
  guides: any[];
  navigate: any;
}

function CareerGuideRow({ title, icon, guides, navigate }: CareerGuideRowProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const hasOverflow = scrollWidth > clientWidth + 5;
      setShowLeftArrow(hasOverflow && scrollLeft > 10);
      setShowRightArrow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleScroll);
      handleScroll();
      window.addEventListener('resize', handleScroll);
    }
    return () => {
      if (slider) {
        slider.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleScroll);
    };
  }, [guides]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleScroll();
    }, 150);
    return () => clearTimeout(timer);
  }, [guides]);

  if (!guides || guides.length === 0) return null;

  return (
    <div className="mb-14 relative w-full">
      {/* Row Title */}
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
        <div className="text-primary shrink-0">{icon}</div>
        <h3 className="text-base md:text-lg font-bold text-foreground uppercase tracking-tight">
          {title}
        </h3>
        <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-[5px] shrink-0">
          {guides.length}
        </span>
        <div className="h-px flex-1 bg-border/50 hidden md:block" />
      </div>

      {/* Slider Container */}
      <div className="relative group/slider">

        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-3 top-[40%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/90 backdrop-blur-md border border-border/85 shadow-lg items-center justify-center text-muted-foreground hover:text-primary hover:bg-background transition-all hover:scale-110 opacity-0 group-hover/slider:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-3 top-[40%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/90 backdrop-blur-md border border-border/85 shadow-lg items-center justify-center text-muted-foreground hover:text-primary hover:bg-background transition-all hover:scale-110 opacity-0 group-hover/slider:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable Row */}
        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-4 -mx-4 px-4"
        >
          {guides.map((guide, index) => {
            const category = getGuideCategory(guide);
            const CategoryIcon = category === 'mecanico' ? Wrench : Plane;
            return (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                className="flex-none w-[240px] sm:w-[270px] md:w-[310px]"
              >
                <div
                  className="p-5 md:p-6 rounded-[5px] bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all h-full flex flex-col group/card relative overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/guia-carreira/${guide.id}`)}
                >
                  {/* Decorative bg icon */}
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/card:opacity-[0.07] transition-opacity">
                    <CategoryIcon className="w-28 h-28 rotate-12" />
                  </div>

                  {/* Header: icon + badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-[5px] bg-primary/5 border border-border/50 flex items-center justify-center">
                      {category === 'mecanico' ? (
                        <Wrench className="w-6 h-6 text-primary" />
                      ) : category === 'geral' ? (
                        <BookOpen className="w-6 h-6 text-primary" />
                      ) : (
                        <Plane className="w-6 h-6 text-primary -rotate-45" />
                      )}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest border border-primary/20 bg-primary/5 text-primary px-2 py-1 rounded-[5px]">
                      Guia
                    </span>
                  </div>

                  {/* Title + description */}
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover/card:text-primary transition-colors line-clamp-2 leading-snug">
                    {guide.title}
                  </h3>
                  {guide.description && (
                    <p className="text-sm text-muted-foreground mb-4 flex-1 font-medium line-clamp-3 leading-relaxed">
                      {guide.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BookOpen className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                      <span className="text-[10px] font-bold tracking-wide uppercase">Começar Guia</span>
                    </div>
                    <div className="w-8 h-8 rounded-[5px] bg-primary/5 border border-border/50 hover:bg-primary hover:border-primary text-primary hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm group-hover/card:bg-primary group-hover/card:text-white">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function GuiaCarreiraPage() {
  const { data: guides, isLoading } = useCareerGuides();
  const { user, isPremium, isLoading: authLoading } = useAuth();
  const { canAccessGuideContent } = usePlan();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'comissaria' | 'piloto' | 'mecanico' | 'geral'>('todos');

  // Free users can see guide structure but linked content is locked
  const hasAccess = true; // Everyone can see the guides list

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16 md:pt-20">
        {/* Hero Section — Split Layout */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* Accent glow — apenas no canto superior esquerdo, mais contido */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-accent/20 blur-[140px] pointer-events-none z-0" />

          <div className="container mx-auto px-4 relative z-10 py-24 md:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* ── Lado Esquerdo: Texto + CTAs ─────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                {/* Eyebrow label */}
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-[5px] px-3 py-1.5 mb-6">
                  <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground/80">Guia de Carreira</span>
                </div>

                {/* Título principal */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary-foreground leading-[1.05] tracking-tight mb-5">
                  Sua rota de carreira{' '}
                  <span className="text-accent relative">
                    na aviação,
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-accent/40 rounded-full" />
                  </span>{' '}
                  passo a passo
                </h1>

                {/* Subtítulo */}
                <p className="text-base md:text-lg text-primary-foreground/70 mb-8 max-w-lg leading-relaxed font-medium">
                  Roteiros estruturados com etapas reais, simulados ANAC e dicas de mercado — tudo o que você precisa para decolar na carreira aeronáutica.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-10">
                  <Button
                    size="lg"
                    variant="hero"
                    className="rounded-[5px] h-12 px-7 font-bold text-sm gap-2 shadow-lg shadow-black/20"
                    onClick={() => {
                      const el = document.getElementById('guias-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <BookOpen className="w-4 h-4" />
                    Ver Guias de Carreira
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="rounded-[5px] h-12 px-5 font-bold text-sm gap-2 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 border border-white/10"
                    onClick={() => {
                      const el = document.getElementById('guias-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Como funciona
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* Micro-stats */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6">
                  {[
                    { icon: <BookOpen className="w-3.5 h-3.5 text-accent" />, label: 'Guias de carreira' },
                    { icon: <Target className="w-3.5 h-3.5 text-accent" />, label: 'Simulados inclusos' },
                    { icon: <CheckCircle2 className="w-3.5 h-3.5 text-accent" />, label: 'Etapas validadas' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {s.icon}
                      <span className="text-xs font-bold text-primary-foreground/60 uppercase tracking-wide">{s.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ── Lado Direito: Card Roadmap ilustrativo ───────────────── */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="hidden lg:flex justify-center"
              >
                <div className="w-full max-w-sm bg-white/8 backdrop-blur-md border border-white/15 rounded-[5px] p-6 shadow-2xl">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-0.5">Exemplo de Rota</p>
                      <h3 className="text-sm font-black text-primary-foreground">Comissário de Bordo</h3>
                    </div>
                    <div className="w-9 h-9 rounded-[5px] bg-accent/20 border border-accent/30 flex items-center justify-center">
                      <Plane className="w-4 h-4 text-accent -rotate-45" />
                    </div>
                  </div>

                  {/* Roadmap steps */}
                  <div className="space-y-0">
                    {[
                      { step: '01', label: 'Estudo Teórico', desc: 'Regulamentos ANAC e segurança de voo', done: true },
                      { step: '02', label: 'Simulados Práticos', desc: 'Questões do padrão banca ANAC', done: true },
                      { step: '03', label: 'Treinamento de CRM', desc: 'Gestão de recursos e emergências', done: false },
                      { step: '04', label: 'Certificação CCT', desc: 'Exame e obtenção do certificado', done: false },
                    ].map((item, i, arr) => (
                      <div key={i} className="flex gap-3">
                        {/* Linha vertical + círculo */}
                        <div className="flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                            item.done
                              ? 'bg-accent border-accent'
                              : 'bg-white/5 border-white/20'
                          }`}>
                            {item.done
                              ? <Check className="w-3.5 h-3.5 text-primary font-black" />
                              : <span className="text-[9px] font-black text-primary-foreground/40">{item.step}</span>
                            }
                          </div>
                          {i < arr.length - 1 && (
                            <div className={`w-px flex-1 my-1 ${item.done ? 'bg-accent/40' : 'bg-white/10'}`} style={{ minHeight: '20px' }} />
                          )}
                        </div>

                        {/* Conteúdo */}
                        <div className={`pb-4 flex-1 ${i === arr.length - 1 ? 'pb-0' : ''}`}>
                          <p className={`text-sm font-bold leading-none mb-0.5 ${item.done ? 'text-primary-foreground' : 'text-primary-foreground/50'}`}>
                            {item.label}
                          </p>
                          <p className={`text-xs leading-relaxed ${item.done ? 'text-primary-foreground/60' : 'text-primary-foreground/30'}`}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer do card */}
                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-accent rounded-full" />
                    </div>
                    <span className="text-[10px] font-bold text-accent shrink-0">50% concluído</span>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Guides list - visible to all, content links locked for non-Tripulante+ */}
        <section id="guias-section" className="py-16 md:py-24 overflow-hidden">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-12 pl-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-left"
                >
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-2 flex items-center gap-3">
                    Guias Disponíveis
                    {!isLoading && guides && guides.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className={`h-9 w-9 rounded-[5px] transition-all relative ${
                              selectedCategory !== 'todos' 
                              ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' 
                              : 'bg-card border-border hover:bg-muted text-foreground'
                            }`}
                          >
                            <Filter className="w-4 h-4" />
                            {selectedCategory !== 'todos' && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background animate-pulse" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 p-2 rounded-[5px] border-border backdrop-blur-md bg-card/95 shadow-xl">
                          <DropdownMenuLabel className="px-2 pb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Filtrar por Categoria
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border/50 mb-1" />
                          <div className="space-y-1">
                            {[
                              { value: 'todos', label: 'Todas as Categorias', emoji: '✨', count: guides.filter(g => g.is_active).length },
                              { value: 'comissaria', label: 'Comissários', emoji: '✈️', count: guides.filter(g => g.is_active && getGuideCategory(g) === 'comissaria').length },
                              { value: 'piloto', label: 'Pilotos', emoji: '🛫', count: guides.filter(g => g.is_active && getGuideCategory(g) === 'piloto').length },
                              { value: 'mecanico', label: 'Mecânicos', emoji: '🔧', count: guides.filter(g => g.is_active && getGuideCategory(g) === 'mecanico').length },
                              { value: 'geral', label: 'Geral / Dicas', emoji: '📚', count: guides.filter(g => g.is_active && getGuideCategory(g) === 'geral').length }
                            ].map(cat => (
                              <DropdownMenuItem
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value as any)}
                                className={`flex items-center gap-3 cursor-pointer py-2 px-2.5 rounded-[5px] transition-all ${
                                  selectedCategory === cat.value 
                                  ? 'bg-primary/10 text-primary font-semibold focus:bg-primary/15 focus:text-primary' 
                                  : 'text-foreground/80 font-medium focus:bg-accent focus:text-accent-foreground'
                                }`}
                              >
                                <span className="text-base shrink-0">{cat.emoji}</span>
                                <span className="flex-1 text-sm truncate">{cat.label}</span>
                                <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-[5px] shrink-0">
                                  {cat.count}
                                </span>
                                {selectedCategory === cat.value && (
                                  <Check className="w-4 h-4 text-primary shrink-0" />
                                )}
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base font-medium">
                    Escolha um guia e siga o passo a passo rumo à sua meta
                  </p>
                </motion.div>
              </div>

              {isLoading ? (
                <div className="flex flex-col gap-10">
                  {[1, 2].map(rowIndex => (
                    <div key={rowIndex} className="space-y-4 pl-2">
                      <Skeleton className="h-6 w-48 bg-slate-800 rounded" />
                      <div className="flex gap-6 overflow-hidden py-2">
                        {[1, 2, 3, 4].map(i => (
                          <Skeleton key={i} className="h-[270px] sm:h-[310px] md:h-[340px] w-[200px] sm:w-[260px] md:w-[310px] shrink-0 rounded-xl" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : guides?.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-[5px] pl-2">
                  <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Nenhum guia disponível no momento.</p>
                </div>
              ) : (() => {
                const comissariaGuides = guides?.filter(g => g.is_active && getGuideCategory(g) === 'comissaria') || [];
                const pilotoGuides = guides?.filter(g => g.is_active && getGuideCategory(g) === 'piloto') || [];
                const mecanicoGuides = guides?.filter(g => g.is_active && getGuideCategory(g) === 'mecanico') || [];
                const geralGuides = guides?.filter(g => g.is_active && getGuideCategory(g) === 'geral') || [];

                const hasVisibleGuides = guides && (
                  (selectedCategory === 'todos' && guides.some(g => g.is_active)) ||
                  (selectedCategory === 'comissaria' && comissariaGuides.length > 0) ||
                  (selectedCategory === 'piloto' && pilotoGuides.length > 0) ||
                  (selectedCategory === 'mecanico' && mecanicoGuides.length > 0) ||
                  (selectedCategory === 'geral' && geralGuides.length > 0)
                );

                if (!hasVisibleGuides) {
                  return (
                    <div className="text-center py-20 bg-muted/20 rounded-[5px] pl-2 border border-slate-800/50">
                      <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium text-sm">Nenhum guia encontrado nesta categoria no momento.</p>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-4">
                    {(selectedCategory === 'todos' || selectedCategory === 'comissaria') && (
                      <CareerGuideRow
                        title="Comissários de Bordo"
                        icon={<Plane className="w-5 h-5 -rotate-45 text-accent" />}
                        guides={comissariaGuides}
                        navigate={navigate}
                      />
                    )}

                    {(selectedCategory === 'todos' || selectedCategory === 'piloto') && (
                      <CareerGuideRow
                        title="Pilotos"
                        icon={<Plane className="w-5 h-5 -rotate-45 text-accent" />}
                        guides={pilotoGuides}
                        navigate={navigate}
                      />
                    )}

                    {(selectedCategory === 'todos' || selectedCategory === 'mecanico') && (
                      <CareerGuideRow
                        title="Mecânicos de Voo"
                        icon={<Wrench className="w-5 h-5 text-accent" />}
                        guides={mecanicoGuides}
                        navigate={navigate}
                      />
                    )}

                    {(selectedCategory === 'todos' || selectedCategory === 'geral') && (
                      <CareerGuideRow
                        title="Geral / Dicas de Carreira"
                        icon={<BookOpen className="w-5 h-5 text-accent" />}
                        guides={geralGuides}
                        navigate={navigate}
                      />
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
