import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plane, Clock, Brain, BookOpen, Crown, ArrowRight, Loader2, Play, FileQuestion, Timer, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface CategoryWithQuestions {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean | null;
  active_modes: string[] | null;
  question_count: number;
}

export default function SimuladosPage() {
  const navigate = useNavigate();

  // Fetch categories with question counts
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-with-questions'],
    queryFn: async () => {
      const { data: cats, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Get question counts per category
      const { data: counts, error: countError } = await supabase
        .from('questions')
        .select('category_id');

      if (countError) throw countError;

      const countMap = (counts || []).reduce((acc, q) => {
        acc[q.category_id] = (acc[q.category_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Only return categories with at least 1 question
      return (cats || [])
        .map(cat => ({
          ...cat,
          question_count: countMap[cat.id] || 0,
        }))
        .filter(cat => cat.question_count > 0) as CategoryWithQuestions[];
    },
  });

  const handleStartSimulado = (categoryId: string, mode: string) => {
    // Navigate to exam with category and mode params
    navigate(`/simulado-categoria/${categoryId}?modo=${mode}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-4">
              <Plane className="w-4 h-4" />
              <span className="text-sm font-medium">Simulados Voo Certo</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Escolha sua Área de Estudo
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pratique com simulados nas diferentes áreas de conhecimento.
              Escolha entre o modo cronometrado (Banca ANAC) ou modo livre para estudar no seu ritmo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured: Simulado ANAC */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/simulado-anac" className="block">
              <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0 p-4 rounded-2xl bg-white/10">
                    <Plane className="w-10 h-10" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      Simulado ANAC Oficial
                    </h2>
                    <p className="text-primary-foreground/80 mb-4">
                      80 questões divididas em 4 blocos cronometrados. Formato oficial da prova ANAC para Comissário de Bordo.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                      <Badge className="bg-white/20 text-primary-foreground">
                        <Timer className="w-3 h-3 mr-1" />
                        2 horas
                      </Badge>
                      <Badge className="bg-white/20 text-primary-foreground">
                        <FileQuestion className="w-3 h-3 mr-1" />
                        80 questões
                      </Badge>
                      <Badge className="bg-white/20 text-primary-foreground">
                        <Brain className="w-3 h-3 mr-1" />
                        4 blocos
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button variant="secondary" size="lg" className="group">
                      <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Iniciar
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Categorias Disponíveis</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : categories?.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma categoria disponível no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories?.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-card-hover hover:border-accent/50 transition-all duration-300 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{category.icon || '📚'}</div>
                      <Badge variant="outline">
                        {category.question_count} questões
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {category.description || 'Pratique suas habilidades nesta categoria.'}
                    </p>

                    {/* Available Modes */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Modos disponíveis:</p>
                      <div className="flex flex-col gap-2">
                        {category.active_modes?.includes('banca_anac') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleStartSimulado(category.id, 'banca_anac')}
                          >
                            <Timer className="w-4 h-4 mr-2 text-primary" />
                            Modo Banca ANAC
                            <ArrowRight className="w-4 h-4 ml-auto" />
                          </Button>
                        )}
                        {category.active_modes?.includes('livre') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleStartSimulado(category.id, 'livre')}
                          >
                            <Zap className="w-4 h-4 mr-2 text-accent" />
                            Modo Livre
                            <ArrowRight className="w-4 h-4 ml-auto" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Premium */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-primary text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-accent" />
                <span className="font-semibold">Voo Certo Premium</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Acesso ilimitado a todos os simulados</h3>
              <p className="text-primary-foreground/70">
                Desbloqueie questões exclusivas, relatórios avançados e muito mais.
              </p>
            </div>
            <Button variant="hero" size="lg" asChild>
              <Link to="/premium">
                Assinar por R$ 29,90/mês
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
