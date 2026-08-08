import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Star, BadgeCheck, Brain } from 'lucide-react';
import heroAttendant from '@/assets/hero-attendant.jpg';
import studyDesk from '@/assets/study-desk.jpg';
import { useAuth } from '@/contexts/AuthContext';

export const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section
      id="inicio"
      className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden"
      style={{ background: 'var(--gradient-hero)' }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroAttendant}
          alt="Comissária de bordo sorrindo com farda — prepare-se para a ANAC"
          className="w-full h-full object-cover opacity-15"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215,55%,15%)] via-[hsl(215,55%,15%/0.9)] to-transparent" />
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-[5px] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-foreground/5 rounded-[5px] blur-3xl" />
      </div>
      <motion.div
        className="absolute top-10 md:top-20 right-4 md:right-20 opacity-20 md:opacity-100"
        animate={{ y: [-10, 10, -10], rotate: [0, 2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* decorative icon could be added here */}
      </motion.div>

      <div className="container mx-auto py-20 md:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <motion.div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-[5px] text-accent mb-6 mx-auto lg:mx-0">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Transformação na Aviação</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              Do Primeiro Voo ao Primeiro Contrato.
              <span className="text-accent"> A Voe Certo acompanha você em cada passo.</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-6 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Acompanhe sua jornada desde a decisão de entrar na aviação até a primeira oportunidade profissional, com ferramentas que evolvem com você.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
              <Button
                variant="hero"
                size="xl"
                asChild
                className="rounded-[5px] w-full sm:w-fit whitespace-normal h-auto py-4 sm:h-14 sm:py-0 hover-yellow"
              >
                <Link to={user ? '/simulados' : '/auth?mode=signup'} className="flex items-center gap-2">
                  Começar Minha Jornada <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl"
                asChild
                className="bg-white/5 text-white border-white/20 hover-yellow rounded-[5px] w-full sm:w-fit"
              >
                <a href="#planos" className="flex items-center gap-2">
                  Ver Planos e Recursos
                </a>
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-8">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <span className="text-primary-foreground/70 text-sm font-medium">
                <strong className="text-accent">4.9/5</strong> · Avaliação dos alunos
              </span>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center lg:justify-start gap-6 md:gap-8"
            >
              {[
                { value: '3', label: 'Certificações' },
                { value: '2.000+', label: 'Questões' },
                { value: '95%', label: 'Aprovação' },
                { value: '24/7', label: 'IA Disponível' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-4xl font-bold text-accent">{stat.value}</div>
                  <div className="text-[10px] md:text-sm text-primary-foreground/60 font-bold uppercase tracking-tighter">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <p className="text-[10px] text-primary-foreground/45 mt-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium text-center lg:text-left">
              * O Voe Certo é uma plataforma independente de simulados e preparação para certificações aeronáuticas. Não possuímos afiliação oficial com nenhum órgão regulador da aviação civil.
            </p>
          </motion.div>

          {/* Right — floating cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              <img
                src={studyDesk}
                alt="Candidato estudando para prova ANAC com simulados online e inteligência artificial"
                className="rounded-[5px] shadow-2xl"
                loading="eager"
                decoding="async"
              />
              {/* Floating info cards */}
              <motion.div
                className="absolute -bottom-6 -left-6 bg-card rounded-[5px] p-4 shadow-xl border border-border"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[5px] bg-accent/10 flex items-center justify-center mb-4">
                    <BadgeCheck className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Alta Fidelidade</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Questões padrão ANAC</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="absolute -top-4 -right-4 bg-card rounded-[5px] p-4 shadow-xl border border-border"
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[5px] bg-accent/10 flex items-center justify-center mb-4">
                    <Brain className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Chat IA</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Dúvida resolvida!</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
