import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen, Play, Clock, CheckCircle2, Search, Filter,
  Zap, Layers,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { PageTransition } from '@/components/PageTransition';

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
  release_date?: string | null;
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

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function MicrocoursesPage() {
  const { user } = useAuth();
  const { currentPlan } = usePlan();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      return data || [];
    },
  });

  const { data: allLessons } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('lessons').select('*').eq('is_active', true).order('display_order');
      if (error) throw error;
      return data || [];
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

  const completedIds = new Set((progress || []).filter((p: any) => p.completed).map((p: any) => p.microcourse_id));
  const displayCourses = courses || [];

  const isComandante = currentPlan === 'comandante';

  const filtered = displayCourses.filter(c => {
    // Priority logic: if it has a future release_date, only comandante sees it
    if (c.release_date && new Date(c.release_date) > new Date() && !isComandante) {
      return false;
    }

    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const completedCount = displayCourses.filter(c => completedIds.has(c.id)).length;
  const progressPct = displayCourses.length ? Math.round((completedCount / displayCourses.length) * 100) : 0;

  const getModules = (mcId: string) => (allModules || []).filter(m => m.microcourse_id === mcId);
  const getLessons = (modId: string) => (allLessons || []).filter(l => l.module_id === modId);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-[5px] text-accent mb-4">
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
              className="mb-8 p-4 rounded-[5px] bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Seu Progresso</span>
                <span className="text-sm text-muted-foreground">{completedCount}/{displayCourses.length} concluídos</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </motion.div>
          )}

          {/* Unified Filters */}
          <div className="flex items-center gap-3 mb-10 max-w-2xl mx-auto">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Buscar microcurso..." 
                className="pl-10 h-11 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-[5px]" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`h-11 w-11 rounded-[5px] transition-all ${
                    selectedCategory !== 'all' 
                    ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20' 
                    : 'bg-card/50 border-border/50 hover:bg-card/80'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  {selectedCategory !== 'all' && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-[5px] border-2 border-background" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-[5px] border-border/50 backdrop-blur-md bg-card/95">
                <DropdownMenuLabel className="px-2 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Filtrar por Categoria
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <div className="mt-1 space-y-1">
                  {CATEGORIES.map(cat => (
                    <DropdownMenuItem
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-[5px] transition-colors ${
                        selectedCategory === cat.value 
                        ? 'bg-primary/10 text-primary font-medium focus:bg-primary/20 focus:text-primary' 
                        : 'text-foreground/80 focus:bg-accent focus:text-accent-foreground'
                      }`}
                    >
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="flex-1 text-sm">{cat.label}</span>
                      {selectedCategory === cat.value && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Course Grid - Netflix Style */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-[2/3] rounded-[5px] bg-card border border-border p-4 flex flex-col justify-end space-y-2">
                  <Skeleton className="w-full h-full absolute inset-0 rounded-[5px]" />
                  <div className="relative z-10 space-y-2">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-2/3 h-4" />
                    <div className="flex gap-2">
                      <Skeleton className="w-8 h-3" />
                      <Skeleton className="w-8 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-medium">Nenhum microcurso encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filtered.map((course, index) => {
                const modules = getModules(course.id);
                const isCompleted = completedIds.has(course.id);
                const catInfo = CATEGORIES.find(c => c.value === course.category);
                const totalLessons = modules.reduce((acc, m) => acc + getLessons(m.id).length, 0);
                const ytId = course.youtube_video_id || extractYouTubeId(course.video_url);
                const thumb = course.thumbnail_url || (ytId ? getYouTubeThumbnail(ytId) : null);

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="group relative"
                  >
                    <div
                      className="relative aspect-[2/3] rounded-[5px] overflow-hidden cursor-pointer transition-all duration-300 group-hover:scale-[1.03] shadow-lg group-hover:shadow-[#F9A91F]/30 border border-transparent hover:border-[#F9A91F]/40"
                      onClick={() => navigate(`/microcursos/${course.id}`)}
                    >
                      {/* Background */}
                      {thumb ? (
                        <img src={thumb} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/50" />
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                      {/* Completed badge */}
                      {isCompleted && (
                        <div className="absolute top-2 right-2 bg-success/90 text-white rounded-[5px] p-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {/* Category badge */}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-[5px] bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium">
                          {catInfo?.emoji} {catInfo?.label}
                        </span>
                      </div>

                      {/* Play icon on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-[5px] bg-[#F9A91F] backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_rgba(249,169,31,0.4)]">
                          <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                      </div>

                      {/* Bottom info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="font-bold text-white text-sm leading-tight mb-1.5 line-clamp-2">{course.title}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-white/70">
                          <span className="flex items-center gap-0.5"><Layers className="w-3 h-3" />{modules.length}</span>
                          <span className="flex items-center gap-0.5"><Play className="w-3 h-3" />{totalLessons}</span>
                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{course.duration_minutes}min</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
