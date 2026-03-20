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
  ArrowRight, Plane, Loader2, Lock, BookOpen, Crown,
} from 'lucide-react';

export default function GuiaCarreiraPage() {
  const { data: guides, isLoading } = useCareerGuides();
  const { user, isPremium, isLoading: authLoading } = useAuth();
  const { canAccessGuideContent } = usePlan();
  const navigate = useNavigate();

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
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Guias Disponíveis</h2>
                  <p className="text-muted-foreground">Escolha um guia e siga o passo a passo</p>
                </motion.div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-64 w-full rounded-[5px]" />
                    ))}
                  </div>
                ) : guides?.length === 0 ? (
                  <div className="text-center py-20 bg-muted/30 rounded-[5px]">
                    <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Nenhum guia disponível no momento.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {guides?.filter(g => g.is_active).map((guide, index) => (
                      <motion.div
                        key={guide.id}
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card 
                          className="group h-full flex flex-col hover:border-accent shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden border-2 rounded-[5px] overflow-hidden" 
                          onClick={() => navigate(`/guia-carreira/${guide.id}`)}
                        >
                          <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                            <Plane className="w-24 h-24 -rotate-45" />
                          </div>
                          
                          <CardHeader className="p-8">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-14 h-14 rounded-[5px] bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500 transform group-hover:rotate-6">
                                <BookOpen className="w-6 h-6 text-accent group-hover:text-current" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-xl md:text-2xl font-bold transition-colors group-hover:text-accent">
                                  {guide.title}
                                </CardTitle>
                                <Badge className="mt-1 bg-primary/5 text-primary border-primary/20 hover:bg-primary/5">Guia Oficial</Badge>
                              </div>
                            </div>
                            {guide.description && (
                              <CardDescription className="text-base text-muted-foreground line-clamp-2 md:line-clamp-3">
                                {guide.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          
                          <div className="mt-auto p-8 pt-0">
                            <div className="h-[2px] w-full bg-muted mb-6 group-hover:bg-accent/20 transition-colors" />
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                Começar jornada <ArrowRight className="w-4 h-4" />
                              </span>
                              <div className="w-10 h-10 rounded-[5px] border-2 border-muted flex items-center justify-center group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500">
                                <ArrowRight className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
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
