import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle2, Linkedin, Sparkles, ShieldCheck, Share2 } from 'lucide-react';

export const LinkedInBadgeSection = () => {
  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden" id="reconhecimento">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left Column: Explanatory Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 text-accent border-accent/30 rounded-[5px] bg-accent/10 font-bold uppercase text-[11px] tracking-wider px-3.5 py-1">
              <Linkedin className="w-3.5 h-3.5 mr-1.5" /> Reconhecimento Profissional
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-6 leading-tight">
              Destaque seu preparo diretamente no <span className="text-accent">LinkedIn</span>.
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed mb-8">
              Ao atingir o índice de prontidão nos simulados da plataforma, você conquista o Selo Oficial de Preparação Voe Certo. Publique no seu perfil e mostre aos recrutadores das principais companhias aéreas a sua dedicação e nível técnico.
            </p>

            <div className="space-y-4 mb-8">
              {[
                'Selo digital verificável com link direto para sua pontuação',
                'Destaque no radar de recrutadores de aviação civil',
                'Válido para Pilotos, Comissários e Mecânicos',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-[5px] bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium text-foreground/90">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Visual Mockup of LinkedIn Badge */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <Card className="bg-card border-border rounded-[5px] shadow-2xl p-8 max-w-md w-full relative overflow-hidden group hover:border-accent/40 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
              
              <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-[5px] bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2]">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Licença & Certificado</span>
                </div>
                <Badge variant="secondary" className="rounded-[5px] text-[10px] font-bold uppercase bg-success/10 text-success border-0">
                  Verificado
                </Badge>
              </div>

              <div className="text-center py-4">
                <div className="w-20 h-20 mx-auto rounded-[5px] bg-accent/10 border-2 border-accent flex items-center justify-center text-accent mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <Award className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Aprovado em Prontidão ANAC
                </h3>
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">
                  Voe Certo · Plataforma Oficial de Preparação
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed px-4 mb-6">
                  Certifica que o candidato concluiu com êxito a bateria de simulados oficiais e atingiu média superior ao padrão regulatório.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-accent" /> Autenticidade Garantida
                </span>
                <span className="font-mono text-[11px] text-foreground/70">ID: VC-2026-BR</span>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
