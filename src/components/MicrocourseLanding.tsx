import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Lock, CheckCircle2, Layers, Clock, 
  ChevronRight, Calendar, BookOpen, GraduationCap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface Lesson {
  id: string;
  title: string;
  is_premium: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons?: Lesson[];
}

interface MicrocourseLandingProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    duration_minutes: number;
    thumbnail_url?: string | null;
  };
  modules: any[];
  getLessons: (modId: string) => any[];
}

export function MicrocourseLanding({ course, modules, getLessons }: MicrocourseLandingProps) {
  const navigate = useNavigate();
  const totalLessons = modules.reduce((acc, m) => acc + getLessons(m.id).length, 0);

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            
            {/* Left Column: Course Info */}
            <div className="flex-1 space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                    Microcurso
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground border-border">
                    {course.category}
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
                  {course.title}
                </h1>
                
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {course.description || "Aprenda de forma rápida e eficiente os principais conceitos exigidos na banca ANAC com este microcurso estruturado."}
                </p>

                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <div className="w-8 h-8 rounded-[5px] bg-white flex items-center justify-center shadow-sm">
                      <Layers className="w-4 h-4 text-accent" />
                    </div>
                    <span><strong>{modules.length}</strong> Módulos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <div className="w-8 h-8 rounded-[5px] bg-white flex items-center justify-center shadow-sm">
                      <Play className="w-4 h-4 text-accent" />
                    </div>
                    <span><strong>{totalLessons}</strong> Aulas de vídeo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <div className="w-8 h-8 rounded-[5px] bg-white flex items-center justify-center shadow-sm">
                      <Clock className="w-4 h-4 text-accent" />
                    </div>
                    <span><strong>{course.duration_minutes}min</strong> de Conteúdo</span>
                  </div>
                </div>
              </motion.div>

              {/* Curriculum Preview */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 pt-10"
              >
                <h2 className="text-xl font-bold text-foreground">Conteúdo Programático</h2>
                
                <div className="grid gap-3">
                  {modules.map((mod, i) => {
                    const lessons = getLessons(mod.id);
                    return (
                      <div key={mod.id} className="bg-white rounded-[5px] border border-border/50 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3 border-b border-muted pb-3">
                          <h3 className="font-bold text-sm flex items-center gap-2">
                            <span className="w-6 h-6 rounded-[5px] bg-muted flex items-center justify-center text-[10px]">{i + 1}</span>
                            {mod.title}
                          </h3>
                          <span className="text-xs text-muted-foreground">{lessons.length} aulas</span>
                        </div>
                        <ul className="space-y-2">
                          {lessons.map(lesson => (
                            <li key={lesson.id} className="flex items-center justify-between text-sm text-muted-foreground/80">
                              <div className="flex items-center gap-2">
                                <Play className="w-3 h-3 opacity-50" />
                                <span>{lesson.title}</span>
                              </div>
                              <Lock className="w-3 h-3 text-accent/40" />
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Right Column: CTA Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full lg:w-[400px] sticky top-28"
            >
              <div className="bg-white rounded-[5px] border border-accent/20 shadow-2xl overflow-hidden">
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-[5px] text-accent text-xs font-bold uppercase tracking-wider">
                      Oferta Exclusiva
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Tenha Acesso Total</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Assine agora e desbloqueie todos os nossos microcursos, simulados ilimitados e suporte da nossa IA exclusiva.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-foreground/70">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      Certificado de Conclusão Voe Certo
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground/70">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      Material de apoio em PDF
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground/70">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      Perguntas à IA por questão
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/premium')}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg h-14 rounded-[5px] shadow-lg shadow-accent/20 group"
                    >
                      Assinar Plano Tripulante
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <p className="text-[11px] text-center text-muted-foreground">
                      Pagamento seguro via Cakto • Cancele quando quiser
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-[5px] bg-white flex items-center justify-center text-lg">
                    🛡️
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground">7 Dias de Garantia</p>
                    <p className="text-[10px] text-muted-foreground">Satisfação completa ou seu dinheiro de volta</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
