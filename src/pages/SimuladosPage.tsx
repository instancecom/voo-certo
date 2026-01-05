import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plane, Clock, Brain, Languages, MessageCircle, BookOpen, Users, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { exams, categories } from '@/data/mockData';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Plane,
  Clock,
  Brain,
  Languages,
  MessageCircle,
  BookOpen,
  Users,
  Headphones: Languages,
};

export default function SimuladosPage() {
  const anacCategory = categories.find((c) => c.id === 'anac');
  const anacExams = exams.filter((e) => e.category === 'anac');

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
              <span className="text-sm font-medium">Simulados ANAC</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Simulados para Comissário de Bordo
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Prepare-se com simulados realistas e cronometrados. Cada área de conhecimento
              com questões baseadas nas provas anteriores da ANAC.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Subcategories Filter */}
      <section className="py-8 border-b border-border sticky top-16 md:top-20 bg-background/95 backdrop-blur-sm z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button variant="default" size="sm">
              Todos
            </Button>
            {anacCategory?.subcategories.map((sub) => (
              <Button key={sub.id} variant="secondary" size="sm">
                {sub.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Exams Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {anacExams.map((exam, index) => {
              const Icon = iconMap[exam.icon] || BookOpen;

              return (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-card-hover hover:border-accent/50 transition-all duration-300 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      {exam.isPremium && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-accent/10 rounded-full text-accent text-xs font-medium">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{exam.description}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exam.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {exam.questionCount} questões
                      </span>
                    </div>

                    <Button
                      variant={exam.isPremium ? 'accent' : 'default'}
                      className="w-full"
                      asChild
                    >
                      <Link to={`/simulado/${exam.id}`}>
                        {exam.isPremium ? 'Desbloquear' : 'Iniciar Simulado'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
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
                Desbloqueie questões exclusivas, relatórios avançados e áudio de anúncios reais.
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
