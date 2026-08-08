import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import airplaneSunset from '@/assets/airplane-sunset.jpg';
import { useAuth } from '@/contexts/AuthContext';

export const CTASection = () => {
  const { user } = useAuth();

  return (
    <section className="py-24 md:py-36 relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background Image Overlay */}
      <div className="absolute inset-0 opacity-15">
        <img
          src={airplaneSunset}
          alt="Aeronave voando no pôr do sol"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(215,55%,10%)] via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Badge className="mb-6 bg-accent text-accent-foreground border-0 rounded-[5px] font-black uppercase text-[11px] tracking-widest px-4 py-1.5 h-auto inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Comece Agora
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-primary-foreground mb-6 leading-tight">
            Pronto para decolar sua <span className="text-accent">carreira na aviação?</span>
          </h2>

          <p className="text-lg sm:text-xl text-primary-foreground/80 mb-10 font-normal leading-relaxed">
            Junte-se a centenas de futuros pilotos, comissários e mecânicos que escolheram a preparação mais completa e inteligente do Brasil.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="hero"
              size="xl"
              asChild
              className="rounded-[5px] w-full sm:w-fit whitespace-normal h-auto py-4 sm:h-14 sm:py-0 hover-yellow shadow-2xl font-bold"
            >
              <Link to={user ? '/simulados' : '/auth?mode=signup'} className="flex items-center justify-center gap-2">
                COMEÇAR AGORA <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              asChild
              className="bg-white/5 text-white border-white/20 hover-yellow rounded-[5px] w-full sm:w-fit font-bold h-14"
            >
              <a href="#planos" className="flex items-center justify-center gap-2">
                Ver Todos os Planos
              </a>
            </Button>
          </div>

          <p className="text-xs text-primary-foreground/60 mt-6 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-accent" /> Acesso imediato · Sem fidelidade · Cancele quando quiser
          </p>
        </motion.div>
      </div>
    </section>
  );
};
