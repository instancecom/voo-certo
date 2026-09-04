import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import heroAttendant from '@/assets/hero-attendant.jpg';
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
          alt="Profissional da aviação — prepare-se com a Voe Certo"
          className="w-full h-full object-cover opacity-12"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215,55%,10%)] via-[hsl(215,55%,13%/0.92)] to-[hsl(215,55%,18%/0.6)]" />
      </div>

      {/* Subtle decorative blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto py-24 md:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-primary-foreground mb-6 leading-[1.08] tracking-tight">
              Passe na{' '}
              <span className="text-accent">ANAC.</span>
              <br />
              Entre no{' '}
              <span className="text-accent">mercado aéreo.</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/75 mb-8 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Simulados no padrão real da banca, IA que explica cada erro, diagnóstico personalizado e currículo especializado em aviação — tudo em um só lugar.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
              <Button
                variant="hero"
                size="xl"
                asChild
                className="rounded-[5px] w-full sm:w-fit whitespace-normal h-auto py-4 sm:h-14 sm:py-0 hover-yellow font-bold"
              >
                <Link to={user ? '/simulados' : '/auth?mode=signup'} className="flex items-center gap-2">
                  Começar gratuitamente <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl"
                asChild
                className="bg-white/5 text-white border-white/20 hover-yellow rounded-[5px] w-full sm:w-fit font-bold"
              >
                <a href="#planos" className="flex items-center gap-2">
                  Ver planos
                </a>
              </Button>
            </div>

            {/* Social proof row */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                  ))}
                </div>
                <span className="text-primary-foreground/70 text-sm font-medium">
                  <strong className="text-accent">4.9/5</strong> · avaliação dos alunos
                </span>
              </div>
              <div className="w-px h-4 bg-white/20 hidden sm:block" />
              <span className="text-primary-foreground/60 text-sm font-medium">
                Mais de <strong className="text-primary-foreground/90">2.000 questões</strong> disponíveis
              </span>
            </div>

            <p className="text-[10px] text-primary-foreground/35 mt-8 max-w-xl mx-auto lg:mx-0 leading-relaxed text-center lg:text-left">
              * Plataforma independente de simulados e preparação para certificações aeronáuticas. Sem afiliação oficial com órgãos reguladores.
            </p>
          </motion.div>

          {/* Right — Compact Simulado Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-[5px] shadow-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="bg-card border-b border-border/60 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground ml-1.5">voecerto.app</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">Questão 5/20</span>
                  <span className="text-accent font-bold font-mono">⏱ 24:18</span>
                </div>
              </div>

              {/* Question */}
              <div className="p-6">
                <p className="text-sm font-semibold text-foreground mb-4 leading-relaxed">
                  Segundo o RBAC 91.403, qual é a responsabilidade do proprietário de uma aeronave quanto à sua aeronavegabilidade?
                </p>

                <div className="space-y-2 mb-5">
                  <div className="p-3 text-xs rounded-[5px] border border-border bg-card/60 text-muted-foreground">
                    A) Responsabilidade compartilhada com o operador e o fabricante.
                  </div>
                  <div className="p-3 text-xs rounded-[5px] border-2 border-accent bg-accent/10 text-foreground font-bold flex items-center justify-between gap-2">
                    <span>B) O proprietário é o principal responsável pela manutenção da aeronavegabilidade.</span>
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  </div>
                  <div className="p-3 text-xs rounded-[5px] border border-border bg-card/60 text-muted-foreground">
                    C) A responsabilidade é exclusiva do mecânico certificado.
                  </div>
                </div>

                {/* Mike explanation */}
                <div className="bg-background border border-accent/20 rounded-[5px] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src="/images/avatars/Mike_character.png"
                      alt="Mike"
                      className="w-6 h-6 rounded-[5px] object-cover border border-accent/30"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                    />
                    <span className="text-xs font-bold text-accent">Mike (IA):</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Correto! O RBAC 91.403(a) é claro: o proprietário é o principal responsável pela aeronavegabilidade. Essa diferença entre proprietário e operador é cobrada com frequência na banca. ✈️
                  </p>
                </div>
              </div>

              {/* Bottom stats bar */}
              <div className="border-t border-border/60 px-6 py-3 bg-card/50 flex items-center justify-between">
                <div className="flex gap-4 text-xs text-muted-foreground font-medium">
                  <span><strong className="text-foreground">4</strong> acertos seguidos</span>
                  <span className="text-accent font-bold">80% de aproveitamento</span>
                </div>
                <div className="text-[10px] text-muted-foreground">Modo Banca ANAC</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
