import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen, Play, Clock, CheckCircle2, Search,
  Loader2, Zap, Lock, X, ChevronRight, ChevronDown,
  Layers, FileText, Download, GraduationCap, Crown,
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
import { usePlan } from '@/hooks/usePlan';
import { PlanGate } from '@/components/PlanGate';
import { VideoPlayer } from '@/components/VideoPlayer';
import { toast } from 'sonner';

interface Microcourse {
  id: string;
  title: string;
  description: string | null;
  category: string;
  duration_minutes: number;
  thumbnail_url: string | null;
  youtube_video_id: string | null;
  video_url: string | null;
  display_order: number;
}

interface Module {
  id: string;
  microcourse_id: string;
  title: string;
  description: string | null;
  display_order: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  display_order: number;
  video_url: string | null;
  youtube_video_id: string | null;
  material_url: string | null;
  material_name: string | null;
  is_premium: boolean;
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

function extractYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function MicrocoursesPage() {
  const { user, isPremium, hasActivePlan } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['microcourses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('microcourses').select('*').eq('is_active', true).order('display_order');
      if (error) throw error;
      return (data || []) as unknown as Microcourse[];
    },
  });

  const { data: allModules } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('modules').select('*').eq('is_active', true).order('display_order');
      if (error) throw error;
      return data as Module[];
    },
  });

  const { data: allLessons } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('lessons').select('*').eq('is_active', true).order('display_order');
      if (error) throw error;
      return data as Lesson[];
    },
  });

  const { data: progress } = useQuery({
    queryKey: ['microcourse-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('microcourse_progress').select('*').eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const markCompletedMutation = useMutation({
    mutationFn: async (microcourseId: string) => {
      const existing = (progress || []).find((p: any) => p.microcourse_id === microcourseId);
      if (existing) {
        await supabase.from('microcourse_progress').update({ completed: true, completed_at: new Date().toISOString() }).eq('id', (existing as any).id);
      } else {
        await supabase.from('microcourse_progress').insert({ user_id: user!.id, microcourse_id: microcourseId, completed: true, completed_at: new Date().toISOString() });
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['microcourse-progress', user?.id] }); toast.success('Concluído! 🎉'); },
  });

  const completedIds = new Set((progress || []).filter((p: any) => p.completed).map((p: any) => p.microcourse_id));
  const displayCourses = courses || [];

  const filtered = displayCourses.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const completedCount = displayCourses.filter(c => completedIds.has(c.id)).length;
  const progressPct = displayCourses.length ? Math.round((completedCount / displayCourses.length) * 100) : 0;

  const getModules = (mcId: string) => (allModules || []).filter(m => m.microcourse_id === mcId);
  const getLessons = (modId: string) => (allLessons || []).filter(l => l.module_id === modId);

  const toggleExpand = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  };

  const handleOpenLesson = (lesson: Lesson) => {
    if (lesson.is_premium && !hasActivePlan) {
      toast.error('Assine para acessar este conteúdo', {
        action: { label: 'Assinar', onClick: () => window.location.href = '/premium' },
      });
      return;
    }
    setSelectedLesson(lesson);
  };

  const getVideoId = (lesson: Lesson) => lesson.youtube_video_id || extractYouTubeId(lesson.video_url);

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
              Conteúdos estruturados para dominar os tópicos mais cobrados na banca ANAC.
            </p>
          </motion.div>

          {/* Progress */}
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
              <Input placeholder="Buscar microcurso..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-8 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Course List - Hierarchical */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-medium">Nenhum microcurso encontrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((course, index) => {
                const modules = getModules(course.id);
                const isExpanded = expandedCourses.has(course.id);
                const isCompleted = completedIds.has(course.id);
                const catInfo = CATEGORIES.find(c => c.value === course.category);
                const totalLessons = modules.reduce((acc, m) => acc + getLessons(m.id).length, 0);

                return (
                  <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                    <Card className={`overflow-hidden ${isCompleted ? 'border-success/30' : 'hover:border-primary/30'} transition-colors`}>
                      <CardContent className="py-4">
                        {/* Course Header */}
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => toggleExpand(expandedCourses, course.id, setExpandedCourses)}
                        >
                          <div className="p-2 rounded-lg bg-primary/10">
                            <GraduationCap className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-foreground text-sm">{course.title}</h3>
                              {isCompleted && <Badge className="text-xs bg-success/20 text-success border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Concluído</Badge>}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <Badge variant="outline" className="text-xs">{catInfo?.emoji} {catInfo?.label}</Badge>
                              <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{modules.length} módulos</span>
                              <span className="flex items-center gap-1"><Play className="w-3 h-3" />{totalLessons} aulas</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration_minutes} min</span>
                            </div>
                          </div>
                          {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />}
                        </div>

                        {/* Expanded Modules */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 ml-4 space-y-2 border-l-2 border-border pl-4">
                                {modules.length === 0 ? (
                                  <p className="text-xs text-muted-foreground py-2">Nenhum módulo disponível ainda.</p>
                                ) : modules.map(mod => {
                                  const lessons = getLessons(mod.id);
                                  const modExpanded = expandedModules.has(mod.id);

                                  return (
                                    <div key={mod.id}>
                                      <div
                                        className="flex items-center gap-2 py-2 cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2"
                                        onClick={() => toggleExpand(expandedModules, mod.id, setExpandedModules)}
                                      >
                                        {modExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                        <Layers className="w-4 h-4 text-accent" />
                                        <span className="font-medium text-sm flex-1">{mod.title}</span>
                                        <Badge variant="secondary" className="text-xs">{lessons.length} aulas</Badge>
                                      </div>

                                      <AnimatePresence>
                                        {modExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="ml-6 space-y-1 border-l border-border/50 pl-3 overflow-hidden"
                                          >
                                            {lessons.map(lesson => {
                                              const ytId = getVideoId(lesson);
                                              return (
                                                <div
                                                  key={lesson.id}
                                                  className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                                  onClick={() => handleOpenLesson(lesson)}
                                                >
                                                  {ytId ? <Play className="w-3.5 h-3.5 text-primary shrink-0" /> : <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                                                  <span className="text-sm flex-1">{lesson.title}</span>
                                                  {lesson.is_premium && !hasActivePlan && <Lock className="w-3 h-3 text-accent" />}
                                                  {lesson.material_url && <FileText className="w-3 h-3 text-success" />}
                                                </div>
                                              );
                                            })}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}

                                {/* Mark completed */}
                                {user && !isCompleted && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 gap-1 text-xs"
                                    onClick={() => markCompletedMutation.mutate(course.id)}
                                    disabled={markCompletedMutation.isPending}
                                  >
                                    <CheckCircle2 className="w-3 h-3" /> Marcar como concluído
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Lesson Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelectedLesson(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              className="bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Video Player */}
              {(() => {
                const videoSrc = selectedLesson.video_url;
                const ytId = getVideoId(selectedLesson);
                const thumbnailUrl = selectedLesson.youtube_video_id
                  ? getYouTubeThumbnail(selectedLesson.youtube_video_id)
                  : null;
                const canAccess = !selectedLesson.is_premium || hasActivePlan;

                if (videoSrc || ytId) {
                  const embedUrl = ytId ? getYouTubeEmbedUrl(ytId) : videoSrc!;
                  return (
                    <div className="p-4 pb-0">
                      <VideoPlayer
                        videoUrl={embedUrl}
                        thumbnailUrl={thumbnailUrl}
                        title={selectedLesson.title}
                        hasAccess={canAccess}
                      />
                    </div>
                  );
                }
                return null;
              })()}

              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedLesson.title}</h2>
                    {selectedLesson.description && <p className="text-sm text-muted-foreground mt-1">{selectedLesson.description}</p>}
                  </div>
                  <button onClick={() => setSelectedLesson(null)} className="p-2 hover:bg-muted rounded-lg shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Material Download */}
                {selectedLesson.material_url && (
                  <div className="p-4 rounded-xl bg-muted/50 border border-border mb-4">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> Material Complementar
                    </p>
                    <a
                      href={selectedLesson.material_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Download className="w-4 h-4" />
                      {selectedLesson.material_name || 'Baixar material'}
                    </a>
                  </div>
                )}

                {!getVideoId(selectedLesson) && !selectedLesson.material_url && (
                  <div className="text-center py-8 bg-muted/50 rounded-xl mb-4">
                    <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Conteúdo em breve</p>
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={() => setSelectedLesson(null)}>Fechar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
