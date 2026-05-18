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
  ArrowRight, Plane, Loader2, Lock, BookOpen, Crown, ChevronLeft, ChevronRight,
} from 'lucide-react';

export default function GuiaCarreiraPage() {
  const { data: guides, isLoading } = useCareerGuides();
  const { user, isPremium, isLoading: authLoading } = useAuth();
  const { canAccessGuideContent } = usePlan();
  const navigate = useNavigate();

  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Free users can see guide structure but linked content is locked
  const hasAccess = true; // Everyone can see the guides list

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
      // Show left arrow if we have scrolled a bit
      setShowLeftArrow(scrollLeft > 10);
      // Show right arrow if there is still content to scroll (with some tolerance)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleScroll);
      // Run once initially
      handleScroll();
      
      // Resize observer or window listener to update arrow states when screen size changes
      window.addEventListener('resize', handleScroll);
    }
    return () => {
      if (slider) {
        slider.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleScroll);
    };
  }, [guides]);

  // Re-trigger scroll check after loading finishes
  useEffect(() => {
    if (!isLoading && guides) {
      // Timeout to ensure DOM has rendered
      const timer = setTimeout(() => {
        handleScroll();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, guides]);

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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-left mb-10 pl-2"
              >
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-2">
                  Guias Disponíveis
                </h2>
                <p className="text-muted-foreground text-sm md:text-base font-medium">
                  Escolha um guia e siga o passo a passo rumo à sua meta
                </p>
              </motion.div>

              {isLoading ? (
                <div className="flex gap-6 overflow-hidden py-4 pl-2">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-[320px] w-[290px] sm:w-[340px] md:w-[380px] shrink-0 rounded-xl" />
                  ))}
                </div>
              ) : guides?.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-[5px] pl-2">
                  <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Nenhum guia disponível no momento.</p>
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
                    {guides?.filter(g => g.is_active).map((guide, index) => (
                      <motion.div
                        key={guide.id}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                        className="snap-start shrink-0 w-[290px] sm:w-[340px] md:w-[380px]"
                      >
                        <Card 
                          className="group h-[320px] flex flex-col hover:border-accent bg-card shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.03] hover:-translate-y-1 transition-all duration-500 cursor-pointer border-2 rounded-xl overflow-hidden relative" 
                          onClick={() => navigate(`/guia-carreira/${guide.id}`)}
                        >
                          <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                            <Plane className="w-24 h-24 -rotate-45" />
                          </div>
                          
                          {/* Premium top gradient line */}
                          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          <CardHeader className="p-6 pb-2 flex-1">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500 transform group-hover:rotate-6">
                                <BookOpen className="w-5 h-5 text-accent group-hover:text-current" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg md:text-xl font-bold leading-snug transition-colors group-hover:text-accent line-clamp-2">
                                  {guide.title}
                                </CardTitle>
                              </div>
                            </div>
                            {guide.description && (
                              <CardDescription className="text-sm md:text-base text-muted-foreground line-clamp-3 leading-relaxed mt-2">
                                {guide.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          
                          <div className="p-6 pt-0 mt-auto">
                            <div className="h-[1px] w-full bg-muted mb-4 group-hover:bg-accent/20 transition-colors" />
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                Começar jornada <ArrowRight className="w-4 h-4" />
                              </span>
                              <div className="w-9 h-9 rounded-lg border border-muted flex items-center justify-center group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500">
                                <ArrowRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
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
