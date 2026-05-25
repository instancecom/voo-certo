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
  ArrowRight, Plane, Loader2, Lock, BookOpen, Crown, Wrench,
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

              {/* Barra de Filtros (Abas) */}
              {!isLoading && guides && guides.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 pl-2 overflow-x-auto pb-2 scrollbar-none">
                  {[
                    { id: 'todos', label: '✨ Todos', count: guides.filter(g => g.is_active).length },
                    { id: 'comissaria', label: '✈️ Comissários', count: guides.filter(g => g.is_active && getGuideCategory(g.title) === 'comissaria').length },
                    { id: 'piloto', label: '🛫 Pilotos', count: guides.filter(g => g.is_active && getGuideCategory(g.title) === 'piloto').length },
                    { id: 'mecanico', label: '🔧 Mecânicos', count: guides.filter(g => g.is_active && getGuideCategory(g.title) === 'mecanico').length },
                    { id: 'geral', label: '📚 Geral / Dicas', count: guides.filter(g => g.is_active && getGuideCategory(g.title) === 'geral').length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedCategory(tab.id as any)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 shrink-0 border ${
                        selectedCategory === tab.id
                          ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20 scale-105'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          selectedCategory === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-4 pl-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-[290px] sm:h-[320px] md:h-[340px] w-full rounded-xl" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-4 pl-2">
                  {filteredGuides?.map((guide, index) => {
                    const category = getGuideCategory(guide.title);
                    return (
                      <motion.div
                        key={guide.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                      >
                        <Card 
                          className="group h-[290px] sm:h-[320px] md:h-[340px] flex flex-col bg-slate-950 border border-slate-800/80 hover:border-accent/40 shadow-lg hover:shadow-accent/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer rounded-xl overflow-hidden relative" 
                          onClick={() => navigate(`/guia-carreira/${guide.id}`)}
                        >
                          {/* Premium Top Half visual thumbnail */}
                          <div className={`relative h-[110px] sm:h-[130px] md:h-[150px] w-full bg-gradient-to-br ${GRADIENT_THEMES[index % GRADIENT_THEMES.length]} flex items-center justify-center overflow-hidden shrink-0`}>
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
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
