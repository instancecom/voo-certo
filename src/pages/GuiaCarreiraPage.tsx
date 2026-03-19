import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCareerGuides } from '@/hooks/useCareerGuides';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowRight, Plane, Loader2, BookOpen, Crown, Target, Star, Sparkles, Map,
} from 'lucide-react';

export default function GuiaCarreiraPage() {
  const { data: guides, isLoading } = useCareerGuides();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Modern Hero Section with Glassmorphism */}
        <section className="relative py-24 md:py-36 overflow-hidden bg-[#0A192F]">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-accent/30 bg-accent/10 text-accent text-[10px] font-black tracking-[0.2em] uppercase">
                <Map className="w-3 h-3 mr-2" /> Sua Rota de Voo
              </Badge>

              <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight tracking-tighter">
                Trace seu caminho para a <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-amber-300">Carreira dos Sonhos.</span>
              </h1>

              <p className="text-lg md:text-2xl text-white/70 mb-10 max-w-2xl mx-auto font-medium">
                Guias estruturados passo a passo, do zero até a sua primeira contratação em uma linha aérea.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Target className="w-5 h-5 text-accent" />
                  <span className="text-white font-bold text-sm tracking-tight">Metas Claras</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Star className="w-5 h-5 text-accent" />
                  <span className="text-white font-bold text-sm tracking-tight">Checkpoints</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span className="text-white font-bold text-sm tracking-tight">Conteúdo Premium</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Guides Grid */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 tracking-tight">Escolha seu Destino</h2>
              <p className="text-muted-foreground text-lg">Selecione o guia ideal para sua fase atual na aviação.</p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-72 w-full rounded-[2.5rem]" />
                ))}
              </div>
            ) : guides?.length === 0 ? (
              <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-muted">
                <BookOpen className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6" />
                <p className="text-muted-foreground font-bold text-xl">Nenhum guia disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {guides?.filter(g => g.is_active).map((guide, index) => (
                  <motion.div
                    key={guide.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="group relative h-72 rounded-[2.5rem] overflow-hidden border-2 border-muted hover:border-accent transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-accent/10" 
                      onClick={() => navigate(`/guia-carreira/${guide.id}`)}
                    >
                      {/* Background Decoration */}
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                        <Plane className="w-48 h-48 -rotate-45 transform group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-700" />
                      </div>

                      <div className="relative h-full flex flex-col p-10 z-10">
                        <div className="flex items-center gap-5 mb-6">
                          <div className="w-16 h-16 rounded-[1.25rem] bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm">
                            <BookOpen className="w-8 h-8 text-accent" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl md:text-3xl font-black tracking-tight group-hover:text-accent transition-colors">
                              {guide.title}
                            </CardTitle>
                            <Badge variant="secondary" className="mt-1.5 bg-primary/5 text-primary-foreground/40 border-0 text-[10px] font-black uppercase tracking-widest">
                              Guia Oficial Voo Certo
                            </Badge>
                          </div>
                        </div>

                        <CardDescription className="text-lg text-muted-foreground leading-relaxed flex-1 line-clamp-2 md:line-clamp-3">
                          {guide.description}
                        </CardDescription>

                        <div className="mt-auto pt-6 flex items-center justify-between">
                          <span className="text-sm font-black uppercase tracking-[0.1em] text-primary group-hover:translate-x-2 transition-transform duration-500 flex items-center gap-2">
                            Acessar Guia <ArrowRight className="w-4 h-4" />
                          </span>
                          <div className="w-12 h-12 rounded-2xl bg-white border border-muted flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all duration-500 shadow-sm">
                            <ArrowRight className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
