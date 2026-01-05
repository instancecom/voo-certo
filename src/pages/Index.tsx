import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plane, BookOpen, Brain, Users, Clock, Award, ArrowRight, Crown, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { categories } from '@/data/mockData';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Plane,
  BookOpen,
  Brain,
  Users,
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        {/* Plane Animation */}
        <motion.div
          className="absolute top-20 right-10 md:right-20"
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 2, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Plane className="w-16 h-16 md:w-24 md:h-24 text-accent/30" />
        </motion.div>

        <div className="container mx-auto px-4 py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent mb-6"
            >
              <Plane className="w-4 h-4" />
              <span className="text-sm font-medium">Plataforma #1 de Simulados ANAC</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              Decole na sua
              <span className="block text-accent">preparação</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Simulados realistas e cronometrados para o concurso de Comissário de Bordo ANAC. 
              Inglês, Espanhol, SHL, Conhecimentos Técnicos e Fit Cultural.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/simulados">
                  Começar Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/premium" className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Ver Plano Premium
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-8 mt-16"
            >
              {[
                { value: '500+', label: 'Questões' },
                { value: '15+', label: 'Simulados' },
                { value: '95%', label: 'Aprovação' },
                { value: '24/7', label: 'Acesso' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 bg-accent rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Categorias de Simulados
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Prepare-se para cada etapa do processo seletivo com simulados específicos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category, index) => {
              const Icon = iconMap[category.icon] || Plane;
              const isComingSoon = category.subcategories.length === 0;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={isComingSoon ? '#' : `/simulados/${category.slug}`}
                    className={`block p-6 rounded-2xl border border-border bg-card hover:shadow-card-hover transition-all duration-300 ${
                      isComingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:border-accent/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-foreground">{category.name}</h3>
                          {isComingSoon && (
                            <span className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                              Em breve
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                        
                        {category.subcategories.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {category.subcategories.map((sub) => (
                              <span
                                key={sub.id}
                                className="px-3 py-1 text-xs bg-secondary rounded-full text-secondary-foreground"
                              >
                                {sub.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {!isComingSoon && (
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que escolher o Voo Certo?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Recursos exclusivos para maximizar sua preparação
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Simulados Cronometrados',
                description: 'Pratique com tempo real, igual ao dia da prova. Gerencie seu tempo e melhore sua velocidade.',
              },
              {
                icon: Brain,
                title: 'Questões Realistas',
                description: 'Baseadas em provas anteriores e na legislação ANAC atualizada. Áudio real para inglês e espanhol.',
              },
              {
                icon: Award,
                title: 'Relatórios Detalhados',
                description: 'Acompanhe sua evolução por categoria. Identifique pontos fracos e foque onde precisa melhorar.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-card-hover transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-accent/10 w-fit mb-4">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Escolha seu plano
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comece grátis ou desbloqueie todo o potencial com o Premium
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-card border border-border"
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">Gratuito</h3>
              <p className="text-muted-foreground mb-6">Para começar sua preparação</p>
              
              <div className="text-4xl font-bold text-foreground mb-6">
                R$ 0<span className="text-lg font-normal text-muted-foreground">/mês</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  '1 simulado por categoria',
                  'Questões com gabarito',
                  'Cronômetro integrado',
                  'Histórico básico',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full" asChild>
                <Link to="/simulados">Começar Grátis</Link>
              </Button>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-primary text-primary-foreground relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <Crown className="w-8 h-8 text-accent" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-primary-foreground/70 mb-6">Preparação completa e ilimitada</p>
              
              <div className="text-4xl font-bold mb-6">
                R$ 29,90<span className="text-lg font-normal text-primary-foreground/70">/mês</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Simulados ilimitados',
                  'Questões com explicação detalhada',
                  'Áudio de anúncios reais',
                  'Relatório avançado de evolução',
                  'Simulados exclusivos SHL',
                  'Suporte prioritário',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button variant="hero" className="w-full" asChild>
                <Link to="/premium">Assinar Premium</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ background: 'var(--gradient-primary)' }}>
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Pronto para decolar?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Junte-se a milhares de candidatos que já estão se preparando com o Voo Certo.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/simulados">
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
