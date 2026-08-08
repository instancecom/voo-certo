import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Linkedin, ShieldCheck, Sparkles, Award } from 'lucide-react';

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
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Honra ao Mérito & Reconhecimento
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-6 leading-tight">
              Comprove sua aprovação na ANAC diretamente no <span className="text-accent">LinkedIn</span>.
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed mb-8">
              Ao conquistar a aprovação na banca oficial ou atingir a prontidão máxima nos simulados, você recebe o Selo de <strong>Honra ao Mérito Voe Certo</strong>. Publique a credencial oficial verificável no seu perfil do LinkedIn e destaque sua autoridade profissional perante as companhias aéreas.
            </p>

            <div className="space-y-4 mb-8">
              {[
                'Selo de Honra ao Mérito com certificação digital verificável',
                'Destaque no radar de recrutadores das principais companhias aéreas',
                'Válido para Pilotos Privados/Comerciais, Comissários de Voo e Mecânicos',
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

          {/* Right Column: Visual Mockup of LinkedIn Badge with Honra ao Mérito Seal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <Card className="bg-card border-border rounded-[5px] shadow-2xl p-8 max-w-md w-full relative overflow-hidden group hover:border-accent/40 transition-all duration-300">
              <div className="absolute top-0 right-0 w-36 h-36 bg-accent/10 rounded-full blur-3xl" />
              
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-border mb-6">
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

              {/* Center: Official Seal / Medallion */}
              <div className="text-center py-2">
                <div className="relative w-36 h-36 mx-auto mb-4 flex items-center justify-center">
                  {/* Subtle pulsing gold aura */}
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
                  
                  {/* Seal Image from Insignias */}
                  <img
                    src="/insignias/aprovado-na-banca.svg"
                    alt="Selo Honra ao Mérito - Aprovado na Banca ANAC"
                    className="w-32 h-32 relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-300 object-contain"
                    onError={(e) => {
                      // Fallback if SVG fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                <Badge variant="outline" className="mb-2 text-accent border-accent/40 rounded-[5px] bg-accent/10 font-bold uppercase text-[10px] tracking-widest px-3 py-0.5">
                  HONRA AO MÉRITO
                </Badge>

                <h3 className="text-xl font-black text-foreground mb-1">
                  Aprovado na Banca ANAC
                </h3>
                <p className="text-[11px] font-bold text-accent uppercase tracking-wider mb-4">
                  VOE CERTO · CERTIFICAÇÃO DE EXCELÊNCIA AERONÁUTICA
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed px-2 mb-6 font-normal">
                  Certifica formalmente que o aluno obteve êxito e alta proficiência na preparação para os exames teóricos regulamentados pela ANAC.
                </p>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-accent" /> Autenticidade Garantida
                </span>
                <span className="font-mono text-[11px] text-foreground/70 font-semibold">ID: VC-ANAC-2026</span>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
