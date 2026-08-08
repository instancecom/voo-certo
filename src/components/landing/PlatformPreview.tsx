import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Flame, Brain, ShieldCheck, CheckCircle2,
  Clock, Award, ArrowRight, LayoutDashboard, ChevronRight, Zap, Target
} from 'lucide-react';

export const PlatformPreview = () => {
  return (
    <section className="py-20 md:py-32 bg-card/40 border-y border-border relative overflow-hidden" id="plataforma">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <Badge variant="outline" className="mb-4 text-accent border-accent/30 rounded-[5px] bg-accent/10 font-bold uppercase text-[11px] tracking-wider px-3.5 py-1">
            <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" /> Experiência de Estudo
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-5 leading-tight">
            Tecnologia que transforma <span className="text-accent">tempo em aprovação</span>.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            Interface limpa, sem distrações e com métricas em tempo real para você saber exatamente quando está pronto.
          </p>
        </motion.div>

        {/* Big Interactive Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-card border border-border/80 rounded-[5px] shadow-2xl overflow-hidden p-4 sm:p-8">
            {/* Top Bar of the Mockup */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-accent/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <span className="text-xs font-bold text-muted-foreground ml-2">voecerto.app / cockpit</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-[5px] text-[10px] font-bold uppercase bg-accent/10 text-accent border-0">
                  <Flame className="w-3.5 h-3.5 text-orange-500 mr-1 fill-orange-500" /> 7 dias seguidos
                </Badge>
                <Badge variant="outline" className="rounded-[5px] text-[10px] font-bold uppercase border-success/30 text-success bg-success/5">
                  Prontidão: 88%
                </Badge>
              </div>
            </div>

            {/* Main Mockup Body */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column: Quick Stats & Chart */}
              <div className="space-y-4">
                <div className="bg-background border border-border rounded-[5px] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Desempenho Geral</span>
                    <TrendingUp className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black text-foreground">84%</span>
                    <span className="text-xs font-bold text-success">↑ +12% este mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Média acima do corte ANAC (70%)</p>

                  {/* Micro Bar Graph */}
                  <div className="flex items-end gap-1.5 h-16 mt-4 pt-2 border-t border-border">
                    {[45, 52, 60, 68, 72, 79, 84, 88].map((val, idx) => (
                      <div key={idx} className="flex-1 bg-muted/40 rounded-[2px] h-full flex flex-col justify-end">
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${val}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.05, duration: 0.4 }}
                          className={`w-full rounded-[2px] ${idx >= 6 ? 'bg-accent' : 'bg-accent/40'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-background border border-border rounded-[5px] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Matérias Dominadas</span>
                    <Target className="w-4 h-4 text-accent" />
                  </div>
                  <div className="space-y-2 mt-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span>Regulamentação (RPA)</span>
                        <span className="text-accent font-bold">92%</span>
                      </div>
                      <div className="w-full bg-muted/40 h-2 rounded-[2px] overflow-hidden">
                        <div className="bg-accent h-full w-[92%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span>Meteorologia</span>
                        <span className="text-accent font-bold">85%</span>
                      </div>
                      <div className="w-full bg-muted/40 h-2 rounded-[2px] overflow-hidden">
                        <div className="bg-accent h-full w-[85%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle & Right Column: Interactive Simulado & IA Feedback */}
              <div className="lg:col-span-2 space-y-4">
                {/* Active Question Simulation */}
                <div className="bg-background border border-border rounded-[5px] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="rounded-[5px] text-[10px] font-bold uppercase border-border text-muted-foreground">
                      Questão 14/20 · Modo Banca
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Clock className="w-3.5 h-3.5 text-accent" /> 18:42 restantes
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-foreground mb-4 leading-relaxed">
                    Em condições de turbulência severa em rota provocada por Cumulonimbus (CB), qual o procedimento operacional correto para a tripulação?
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="p-3 text-xs rounded-[5px] border border-border bg-card/50 text-muted-foreground">
                      A) Aumentar a velocidade máxima estrutural para cruzar a formação rapidamente.
                    </div>
                    <div className="p-3 text-xs rounded-[5px] border-2 border-accent bg-accent/10 text-foreground font-bold flex items-center justify-between">
                      <span>B) Manter a velocidade de penetração de turbulência (Va/Vb) e controlar atitude.</span>
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    </div>
                    <div className="p-3 text-xs rounded-[5px] border border-border bg-card/50 text-muted-foreground">
                      C) Desligar o piloto automático e iniciar descida de emergência imediata.
                    </div>
                  </div>

                  {/* Hugo's IA Live Explanation */}
                  <div className="bg-card border border-accent/20 rounded-[5px] p-4 text-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src="/images/avatars/prof_hugo.jpg"
                        alt="Prof. Hugo"
                        className="w-6 h-6 rounded-full object-cover border border-accent"
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                      />
                      <span className="font-bold text-accent">Prof. Hugo (IA):</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Explicação Técnica</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Correto! A velocidade de penetração de turbulência garante que as forças aerodinâmicas não ultrapassem os limites estruturais da aeronave antes que ela estole. Essa é uma pegadinha clássica da banca ANAC.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
