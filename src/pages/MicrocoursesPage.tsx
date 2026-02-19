import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen, Play, Clock, CheckCircle2, Search,
  Loader2, Zap, Lock, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Microcourse {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  category: string;
  tags: string[];
  duration_minutes: number;
  display_order: number;
}

const CATEGORIES = [
  { value: 'all', label: 'Todos', emoji: '📚' },
  { value: 'seguranca', label: 'Segurança', emoji: '🛡️' },
  { value: 'regulamentacao', label: 'Regulamentação', emoji: '📋' },
  { value: 'procedimentos', label: 'Procedimentos', emoji: '✅' },
  { value: 'emergencias', label: 'Emergências', emoji: '🚨' },
  { value: 'ingles', label: 'Inglês', emoji: '🌐' },
  { value: 'geral', label: 'Geral', emoji: '✈️' },
];

export default function MicrocoursesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Microcourse | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['microcourses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('microcourses')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as Microcourse[];
    },
  });

  const { data: progress } = useQuery({
    queryKey: ['microcourse-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('microcourse_progress')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const markCompletedMutation = useMutation({
    mutationFn: async (microcourseId: string) => {
      const existing = (progress || []).find((p: any) => p.microcourse_id === microcourseId);
      if (existing) {
        const { error } = await supabase.from('microcourse_progress')
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq('id', (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('microcourse_progress').insert({
          user_id: user!.id,
          microcourse_id: microcourseId,
          completed: true,
          completed_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['microcourse-progress', user?.id] });
      toast.success('Microcurso marcado como concluído! 🎉');
    },
    onError: () => toast.error('Erro ao marcar como concluído.'),
  });

  const completedIds = new Set((progress || []).filter((p: any) => p.completed).map((p: any) => p.microcourse_id));
  const displayCourses = courses || [];

  const filtered = displayCourses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      (c.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const completedCount = displayCourses.filter(c => completedIds.has(c.id)).length;
  const progressPct = displayCourses.length ? Math.round((completedCount / displayCourses.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">Aprenda em minutos</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Microcursos</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Conteúdos rápidos e objetivos para dominar os tópicos mais cobrados na banca ANAC.
            </p>
          </motion.div>

          {/* Progress bar for logged users */}
          {user && displayCourses.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="mb-8 p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Seu Progresso</span>
                <span className="text-sm text-muted-foreground">{completedCount}/{displayCourses.length} concluídos</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </motion.div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar microcurso..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-8 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-medium mb-2">
                {displayCourses.length === 0
                  ? 'Nenhum microcurso cadastrado ainda.'
                  : 'Nenhum microcurso encontrado para esta busca.'}
              </p>
              {displayCourses.length === 0 && (
                <p className="text-sm text-muted-foreground">Em breve novos conteúdos serão adicionados aqui pelo admin.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course, index) => {
                const isCompleted = completedIds.has(course.id);
                const catInfo = CATEGORIES.find(c => c.value === course.category);
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`h-full flex flex-col cursor-pointer hover:border-primary/50 hover:shadow-md transition-all ${
                        isCompleted ? 'border-success/30 bg-success/5' : ''
                      }`}
                      onClick={() => setSelectedCourse(course)}
                    >
                      {course.thumbnail_url ? (
                        <div className="h-36 rounded-t-xl overflow-hidden">
                          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-36 rounded-t-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          {course.video_url ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <Play className="w-6 h-6 text-primary ml-0.5" />
                              </div>
                              <span className="text-xs text-muted-foreground">Vídeo disponível</span>
                            </div>
                          ) : (
                            <span className="text-5xl">{catInfo?.emoji || '✈️'}</span>
                          )}
                        </div>
                      )}
                      <CardContent className="pt-4 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">{catInfo?.label || course.category}</Badge>
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-success" />}
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{course.title}</h3>
                        {course.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{course.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{course.duration_minutes} min</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-primary h-7 px-2">
                            {course.video_url ? <Play className="w-3 h-3 mr-1" /> : <BookOpen className="w-3 h-3 mr-1" />}
                            {isCompleted ? 'Rever' : 'Iniciar'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Course Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelectedCourse(null)}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 md:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <Badge variant="outline" className="mb-2">
                    {CATEGORIES.find(c => c.value === selectedCourse.category)?.label}
                  </Badge>
                  <h2 className="text-xl font-bold text-foreground">{selectedCourse.title}</h2>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{selectedCourse.duration_minutes} minutos</span>
                  </div>
                </div>
                <button onClick={() => setSelectedCourse(null)} className="p-2 hover:bg-muted rounded-lg shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedCourse.video_url && (
                <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-black">
                  <iframe
                    src={selectedCourse.video_url}
                    className="w-full h-full"
                    allowFullScreen
                    title={selectedCourse.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              )}

              {selectedCourse.description && (
                <p className="text-muted-foreground mb-4">{selectedCourse.description}</p>
              )}

              {selectedCourse.content && (
                <div className="bg-muted/50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedCourse.content}</p>
                </div>
              )}

              {!selectedCourse.video_url && !selectedCourse.content && (
                <div className="text-center py-8 bg-muted/50 rounded-xl mb-4">
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Conteúdo em breve</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedCourse(null)}>
                  Fechar
                </Button>
                {user ? (
                  <Button
                    className="flex-1"
                    disabled={completedIds.has(selectedCourse.id) || markCompletedMutation.isPending}
                    onClick={() => markCompletedMutation.mutate(selectedCourse.id)}
                  >
                    {completedIds.has(selectedCourse.id) ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2" />Concluído</>
                    ) : markCompletedMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4 mr-2" />Marcar como Concluído</>
                    )}
                  </Button>
                ) : (
                  <Button className="flex-1" asChild>
                    <Link to="/auth">
                      <Lock className="w-4 h-4 mr-2" />
                      Login para Salvar
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
