import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronDown, ChevronRight, Play, Lock, CheckCircle2,
  Layers, FileText, Download, BookOpen, Menu, X, Clock, GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VideoPlayer } from '@/components/VideoPlayer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

function extractYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

export default function MicrocoursePlayerPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canAccessMicrocursos } = usePlan();
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const { data: course } = useQuery({
    queryKey: ['microcourse', courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from('microcourses').select('*').eq('id', courseId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  const { data: modules } = useQuery({
    queryKey: ['modules', courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from('modules').select('*').eq('microcourse_id', courseId!).eq('is_active', true).order('display_order');
      if (error) throw error;
      return data || [];
    },
    enabled: !!courseId,
  });

  const { data: allLessons } = useQuery({
    queryKey: ['lessons-course', courseId],
    queryFn: async () => {
      if (!modules?.length) return [];
      const moduleIds = modules.map(m => m.id);
      const { data, error } = await supabase.from('lessons').select('*').in('module_id', moduleIds).eq('is_active', true).order('display_order');
      if (error) throw error;
      return (data || []) as Lesson[];
    },
    enabled: !!modules?.length,
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
    mutationFn: async () => {
      if (!user || !courseId) return;
      const existing = (progress || []).find((p: any) => p.microcourse_id === courseId);
      if (existing) {
        await supabase.from('microcourse_progress').update({ completed: true, completed_at: new Date().toISOString() }).eq('id', (existing as any).id);
      } else {
        await supabase.from('microcourse_progress').insert({ user_id: user.id, microcourse_id: courseId, completed: true, completed_at: new Date().toISOString() });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['microcourse-progress', user?.id] });
      toast.success('Microcurso concluído! 🎉');
    },
  });

  const isCompleted = (progress || []).some((p: any) => p.microcourse_id === courseId && p.completed);

  const getLessons = (modId: string) => (allLessons || []).filter(l => l.module_id === modId);

  const totalLessons = allLessons?.length || 0;

  // Auto-expand first module & select first lesson
  useMemo(() => {
    if (modules?.length && !expandedModules.size) {
      setExpandedModules(new Set([modules[0].id]));
    }
    if (allLessons?.length && !selectedLesson) {
      setSelectedLesson(allLessons[0]);
    }
  }, [modules, allLessons]);

  const toggleModule = (id: string) => {
    const next = new Set(expandedModules);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedModules(next);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setMobileSidebarOpen(false);
  };

  const getVideoId = (lesson: Lesson) => lesson.youtube_video_id || extractYouTubeId(lesson.video_url);

  const currentVideoId = selectedLesson ? getVideoId(selectedLesson) : null;
  const currentEmbedUrl = currentVideoId ? getYouTubeEmbedUrl(currentVideoId) : selectedLesson?.video_url;

  // Find next/prev lessons
  const currentIndex = allLessons?.findIndex(l => l.id === selectedLesson?.id) ?? -1;
  const prevLesson = currentIndex > 0 ? allLessons?.[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && allLessons && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Course header */}
      <div className="p-4 border-b border-border">
        <button onClick={() => navigate('/microcursos')} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
          Voltar aos microcursos
        </button>
        <h2 className="font-bold text-foreground text-sm leading-tight">{course.title}</h2>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{modules?.length || 0} módulos</span>
          <span className="flex items-center gap-1"><Play className="w-3 h-3" />{totalLessons} aulas</span>
          {course.duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration_minutes}min</span>}
        </div>
        {user && (
          <div className="mt-3">
            <Progress value={isCompleted ? 100 : 0} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground mt-1">{isCompleted ? 'Concluído' : 'Em andamento'}</p>
          </div>
        )}
      </div>

      {/* Module list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {(modules || []).map((mod, modIndex) => {
            const lessons = getLessons(mod.id);
            const isExpanded = expandedModules.has(mod.id);

            return (
              <div key={mod.id} className="mb-1">
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {modIndex + 1}
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1 line-clamp-2">{mod.title}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">{lessons.length}</Badge>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pr-1 pb-1 space-y-0.5">
                        {lessons.map((lesson, lIdx) => {
                          const isActive = selectedLesson?.id === lesson.id;
                          const hasVideo = !!getVideoId(lesson);

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleSelectLesson(lesson)}
                              className={cn(
                                "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all text-sm",
                                isActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              )}
                            >
                              <div className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-medium border",
                                isActive ? "border-primary bg-primary text-primary-foreground" : "border-border"
                              )}>
                                {hasVideo ? <Play className="w-2.5 h-2.5" /> : <span>{lIdx + 1}</span>}
                              </div>
                              <span className="flex-1 line-clamp-2 text-xs">{lesson.title}</span>
                              {!canAccessMicrocursos && <Lock className="w-3 h-3 text-accent shrink-0" />}
                              {canAccessMicrocursos && lesson.material_url && <FileText className="w-3 h-3 text-success shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Mark completed */}
      {user && !isCompleted && (
        <div className="p-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={() => markCompletedMutation.mutate()}
            disabled={markCompletedMutation.isPending}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Marcar como concluído
          </Button>
        </div>
      )}

      {isCompleted && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-success font-medium justify-center">
            <CheckCircle2 className="w-4 h-4" /> Microcurso concluído!
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 shrink-0",
        sidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <SidebarContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center px-4 gap-3 bg-card/80 backdrop-blur-sm shrink-0">
          <button
            onClick={() => { if (window.innerWidth < 1024) setMobileSidebarOpen(true); else setSidebarOpen(!sidebarOpen); }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{selectedLesson?.title || course.title}</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link to="/microcursos">
              <X className="w-4 h-4 mr-1" /> Sair
            </Link>
          </Button>
        </header>

        {/* Video area */}
        <div className="flex-1 flex flex-col">
          <div className="w-full max-w-5xl mx-auto px-4 pt-4">
            {!canAccessMicrocursos && selectedLesson ? (
              <div className="aspect-video bg-card border border-border rounded-xl flex items-center justify-center p-6 relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm z-0" />
                <div className="relative z-10 text-center max-w-md bg-card/90 p-8 rounded-2xl shadow-xl border border-accent/20">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 border border-accent/20">
                    <Lock className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Acesso Restrito</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Assine o plano <strong className="text-foreground">Tripulante</strong> ou superior para assistir a todas as aulas e baixar os materiais complementares.
                  </p>
                  <Button
                    size="lg"
                    className="w-full font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-md shadow-accent/20"
                    onClick={() => navigate('/premium')}
                  >
                    Assinar Agora
                  </Button>
                </div>
              </div>
            ) : selectedLesson && currentEmbedUrl ? (
              <VideoPlayer
                videoUrl={currentEmbedUrl}
                thumbnailUrl={currentVideoId ? `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg` : null}
                title={selectedLesson.title}
                hasAccess={canAccessMicrocursos}
              />
            ) : (
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Selecione uma aula para começar</p>
                </div>
              </div>
            )}
          </div>

          {/* Lesson info */}
          {selectedLesson && (
            <div className="w-full max-w-5xl mx-auto px-4 py-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">{selectedLesson.title}</h1>
                  {selectedLesson.description && (
                    <p className="text-sm text-muted-foreground mt-1.5">{selectedLesson.description}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {prevLesson && (
                    <Button variant="outline" size="sm" onClick={() => handleSelectLesson(prevLesson)} className="gap-1 text-xs">
                      <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                    </Button>
                  )}
                  {nextLesson && (
                    <Button variant="default" size="sm" onClick={() => handleSelectLesson(nextLesson)} className="gap-1 text-xs">
                      Próxima <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Material Download */}
              {selectedLesson.material_url && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border mt-4">
                  <p className="text-sm font-bold mb-2 flex items-center gap-2 text-foreground">
                    <FileText className="w-4 h-4 text-primary" /> Material Complementar
                  </p>
                  
                  {canAccessMicrocursos ? (
                    <a
                      href={selectedLesson.material_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                    >
                      <Download className="w-4 h-4" />
                      {selectedLesson.material_name || 'Baixar material PDF'}
                    </a>
                  ) : (
                    <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-muted rounded-md text-muted-foreground"><FileText className="w-4 h-4"/></div>
                         <span className="text-sm font-medium text-muted-foreground line-through">{selectedLesson.material_name || 'Material PDF Restrito'}</span>
                      </div>
                      <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5">
                        <Lock className="w-3 h-3 mr-1" /> Bloqueado
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
