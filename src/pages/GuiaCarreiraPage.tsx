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

const GRADIENT_THEMES = [
  'from-indigo-600 via-indigo-950 to-slate-950',
  'from-sky-600 via-slate-900 to-indigo-950',
  'from-amber-600 via-slate-900 to-amber-950',
  'from-purple-600 via-slate-900 to-purple-950',
  'from-teal-600 via-slate-900 to-teal-950',
];

export default function GuiaCarreiraPage() {
  const { data: guides, isLoading } = useCareerGuides();
  const { user, isPremium, isLoading: authLoading } = useAuth();
  const { canAccessGuideContent } = usePlan();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'comissaria' | 'piloto' | 'mecanico' | 'geral'>('todos');

  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Free users can see guide structure but linked content is locked
  const hasAccess = true; // Everyone can see the guides list

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

  const filteredGuides = guides?.filter(g => {
    if (!g.is_active) return false;
    if (selectedCategory === 'todos') return true;
    return getGuideCategory(g.title) === selectedCategory;
  });

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
  }, [filteredGuides]);

  useEffect(() => {
    if (!isLoading && filteredGuides) {
      const timer = setTimeout(() => {
        handleScroll();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, filteredGuides]);

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
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pl-2">
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
                    className="w-full md:w-[260px] shrink-0 z-40"
                  >
                    <Select value={selectedCategory} onValueChange={(val: any) => setSelectedCategory(val)}>
                      <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white rounded-xl h-11 focus:ring-accent focus:border-accent">
                        <SelectValue placeholder="Filtrar por profissão" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
                        <SelectItem value="todos" className="hover:bg-slate-900 focus:bg-slate-900 text-white">✨ Todos ({guides.filter(g => g.is_active).length})</SelectItem>
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
                <div className="flex gap-6 overflow-hidden py-4 pl-2">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-[270px] sm:h-[310px] md:h-[340px] w-[200px] sm:w-[260px] md:w-[310px] shrink-0 rounded-xl" />
                  ))}
                </div>
              ) : guides?.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-[5px] pl-2">
                  <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Nenhum guia disponível no momento.</p>
                </div>
              ) : filteredGuides?.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-[5px] pl-2 border border-slate-800/50">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium text-sm">Nenhum guia encontrado nesta categoria no momento.</p>
                </div>
              ) : (
                <div className="relative group/slider w-full pl-2">
                  {/* Left Arrow Button */}
                  {showLeftArrow && (
                    <button
                      onClick={() => scroll('left')}
                      className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-background/95 hover:bg-background border border-border/80 text-foreground hover:text-accent rounded-full flex items-center justify-center shadow-lg hover:shadow-accent/10 transition-all duration-300 hover:scale-110 pointer-events-auto backdrop-blur-md"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}

                  {/* Right Arrow Button */}
                  {showRightArrow && (
                    <button
                      onClick={() => scroll('right')}
                      className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-background/95 hover:bg-background border border-border/80 text-foreground hover:text-accent rounded-full flex items-center justify-center shadow-lg hover:shadow-accent/10 transition-all duration-300 hover:scale-110 pointer-events-auto backdrop-blur-md"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}

                  {/* Scrollable Row */}
                  <div
                    ref={sliderRef}
                    className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-8 pt-4 px-2 -mx-2 snap-x snap-mandatory"
                  >
                    {filteredGuides?.map((guide, index) => {
                      const category = getGuideCategory(guide.title);
                      return (
                        <motion.div
                          key={guide.id}
                          layout
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                          className="snap-start shrink-0 w-[200px] sm:w-[260px] md:w-[310px]"
                        >
                          <Card 
                            className="group h-[270px] sm:h-[310px] md:h-[340px] flex flex-col bg-slate-950 border border-slate-800/80 hover:border-accent/40 shadow-lg hover:shadow-accent/10 hover:scale-[1.03] transition-all duration-300 cursor-pointer rounded-xl overflow-hidden relative" 
                            onClick={() => navigate(`/guia-carreira/${guide.id}`)}
                          >
                            {/* Premium Top Half visual thumbnail */}
                            <div className={`relative h-[100px] sm:h-[120px] md:h-[140px] w-full bg-gradient-to-br ${GRADIENT_THEMES[index % GRADIENT_THEMES.length]} flex items-center justify-center overflow-hidden shrink-0`}>
                              {/* Technical Grid Overlay */}
                              <svg className="absolute inset-0 w-full h-full opacity-10 mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                  <pattern id={`grid-${index}`} width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                  </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill={`url(#grid-${index})`} className="text-white" />
                              </svg>

                              {/* Badge */}
                              <div className="absolute top-3 left-3 z-10 px-2 py-0.5 sm:py-1 rounded bg-accent/20 border border-accent/40 backdrop-blur-md text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-accent">
                                Guia
                              </div>

                              {/* Border highlight */}
                              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

                              {/* Floating Glassmorphic Icon */}
                              <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 transform text-white group-hover:text-accent">
                                {category === 'comissaria' ? (
                                  <Plane className="w-5 h-5 -rotate-45" />
                                ) : category === 'piloto' ? (
                                  <Plane className="w-5 h-5 -rotate-45" />
                                ) : category === 'mecanico' ? (
                                  <Wrench className="w-5 h-5" />
                                ) : (
                                  <BookOpen className="w-5 h-5" />
                                )}
                              </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col justify-between">
                              <div className="space-y-1 sm:space-y-2">
                                <h3 className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-white leading-snug transition-colors group-hover:text-accent line-clamp-2">
                                  {guide.title}
                                </h3>
                                {guide.description && (
                                  <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-2 md:line-clamp-3 leading-relaxed">
                                    {guide.description}
                                  </p>
                                )}
                              </div>

                              {/* Action Footer */}
                              <div className="pt-3 flex items-center justify-between mt-auto border-t border-slate-900">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                  <BookOpen className="w-3.5 h-3.5 text-accent/80 shrink-0" />
                                  <span className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase">
                                    Começar Guia
                                  </span>
                                </div>
                                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white hover:bg-accent text-slate-950 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md">
                                  <ArrowRight className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
