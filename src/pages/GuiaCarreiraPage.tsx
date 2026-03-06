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
import {
  ArrowRight, Plane, Loader2, Lock, BookOpen, Crown,
} from 'lucide-react';

export default function GuiaCarreiraPage() {
  const { data: guides, isLoading } = useCareerGuides();
  const { user, isPremium, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const hasAccess = !!user && isPremium;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 md:pt-24">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Plane className="w-5 h-5 text-accent" />
                <span className="text-primary-foreground/90 text-sm font-medium">Guias de Carreira</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
                Seu Caminho para a{' '}
                <span className="text-accent">Carreira dos Sonhos</span>
              </h1>

              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
                Siga guias estruturados com etapas, simulados e microcursos para alcançar seus objetivos profissionais.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="px-4 py-2 text-sm">📚 Etapas Detalhadas</Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">🎯 Simulados Integrados</Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">🎓 Microcursos</Badge>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Access gate */}
        {!authLoading && !hasAccess && (
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-lg">
              <Card className="text-center border-accent/30">
                <CardContent className="pt-8 pb-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Conteúdo Exclusivo</h2>
                  <p className="text-muted-foreground">
                    {!user
                      ? 'Faça login para acessar os guias de carreira.'
                      : 'Assine um plano para acessar os guias de carreira completos.'}
                  </p>
                  <Button variant="hero" size="lg" asChild>
                    <Link to={!user ? '/auth' : '/premium'}>
                      {!user ? 'Fazer Login' : <><Crown className="w-4 h-4 mr-2" />Assinar Agora</>}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Guides list */}
        {(hasAccess || authLoading) && (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <Card key={i}><CardContent className="pt-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                    ))}
                  </div>
                ) : guides?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">Nenhum guia disponível ainda.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {guides?.filter(g => g.is_active).map((guide, index) => (
                      <motion.div
                        key={guide.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg hover:border-accent/50 transition-all cursor-pointer group" onClick={() => navigate(`/guia-carreira/${guide.id}`)}>
                          <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-accent" />
                              </div>
                              <CardTitle className="text-lg group-hover:text-accent transition-colors">{guide.title}</CardTitle>
                            </div>
                            {guide.description && <CardDescription>{guide.description}</CardDescription>}
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" className="w-full border-accent/30 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                              Abrir Guia <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
