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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowRight, Plane, Loader2, Lock, BookOpen, Crown, Wrench, ChevronLeft, ChevronRight,
} from 'lucide-react';


const getGuideCategory = (title: string) => {
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
  const [showRightArrow, setShowRightArrow] = useState(true);

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
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
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
    }, 100);
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
      <div className="relative group">
        {/* Fade esquerda */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent z-10 hidden md:block" />
        {/* Fade direita */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-background to-transparent z-10 hidden md:block" />

        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-2 top-[40%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border/85 shadow-lg items-center justify-center text-muted-foreground hover:text-primary hover:bg-background transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-2 top-[40%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border/85 shadow-lg items-center justify-center text-muted-foreground hover:text-primary hover:bg-background transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
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
            const category = getGuideCategory(guide.title);
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
                  className="p-5 md:p-6 rounded-[5px] bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all h-full flex flex-col group relative overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/guia-carreira/${guide.id}`)}
                >
                  {/* Decorative bg icon */}
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
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
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
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
                    <div className="w-8 h-8 rounded-[5px] bg-primary/5 border border-border/50 hover:bg-primary hover:border-primary text-primary hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm group-hover:bg-primary group-hover:text-white">
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
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-primary text-primary-foreground min-h-[400px] flex items-center">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-accent blur-[120px]" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[50%] rounded-full bg-sky-400 blur-[100px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-[5px] px-4 py-2 mb-8 border border-white/20 animate-float">
                <Plane className="w-5 h-5 text-accent" />
                <span className="text-primary-foreground/90 text-sm font-semibold tracking-wide">Guia de Carreira Exclusivo</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-primary-foreground mb-8 leading-[1.1] tracking-tight">
                Trace sua Rota para o{' '}
                <span className="text-accent underline decoration-accent/30 underline-offset-8">Sucesso Profissional</span>
              </h1>

              <p className="text-lg md:text-2xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto font-medium">
                Siga roteiros estruturados com simulados e microcursos focados na sua aprovação e crescimento.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="secondary" className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-white/10 text-white border-white/20">📚 Etapas</Badge>
                <Badge variant="secondary" className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-white/10 text-white border-white/20">🎯 Simulados</Badge>
                <Badge variant="secondary" className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-white/10 text-white border-white/20">🎓 Cursos</Badge>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Guides list - visible to all, content links locked for non-Tripulante+ */}
        <section className="py-16 md:py-24 overflow-hidden">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pl-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-left"
                >
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-2">
                    Guias Disponíveis
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base font-medium">
                    Escolha um guia e siga o passo a passo rumo à sua meta
                  </p>
                </motion.div>

                {/* Filter Dropdown */}
                {!isLoading && guides && guides.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="w-full md:w-[280px] shrink-0 z-40"
                  >
                    <Select value={selectedCategory} onValueChange={(val: any) => setSelectedCategory(val)}>
                      <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white rounded-xl h-11 focus:ring-accent focus:border-accent">
                        <SelectValue placeholder="Filtrar por profissão" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
                        <SelectItem value="todos" className="hover:bg-slate-900 focus:bg-slate-900 text-white">✨ Todas as Categorias ({guides.filter(g => g.is_active).length})</SelectItem>
                        <SelectItem value="comissaria" className="hover:bg-slate-900 focus:bg-slate-900 text-white">✈️ Comissários ({guides.filter(g => g.is_active && getGuideCategory(g.title) === 'comissaria').length})</SelectItem>
                        <SelectItem value="piloto" className="hover:bg-slate-900 focus:bg-slate-900 text-white">🛫 Pilotos ({guides.filter(g => g.is_active && getGuideCategory(g.title) === 'piloto').length})</SelectItem>
                        <SelectItem value="mecanico" className="hover:bg-slate-900 focus:bg-slate-900 text-white">🔧 Mecânicos ({guides.filter(g => g.is_active && getGuideCategory(g.title) === 'mecanico').length})</SelectItem>
                        <SelectItem value="geral" className="hover:bg-slate-900 focus:bg-slate-900 text-white">📚 Geral / Dicas ({guides.filter(g => g.is_active && getGuideCategory(g.title) === 'geral').length})</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
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
                const comissariaGuides = guides?.filter(g => g.is_active && getGuideCategory(g.title) === 'comissaria') || [];
                const pilotoGuides = guides?.filter(g => g.is_active && getGuideCategory(g.title) === 'piloto') || [];
                const mecanicoGuides = guides?.filter(g => g.is_active && getGuideCategory(g.title) === 'mecanico') || [];
                const geralGuides = guides?.filter(g => g.is_active && getGuideCategory(g.title) === 'geral') || [];

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
