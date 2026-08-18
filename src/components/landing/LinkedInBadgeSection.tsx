import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Linkedin, ShieldCheck, Sparkles, User, Calendar, Award } from 'lucide-react';

export const LinkedInBadgeSection = () => {
  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden" id="reconhecimento">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left Column: Explanatory Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >


            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-6 leading-tight">
              Comprove sua aprovação na ANAC diretamente no <span className="text-accent">LinkedIn</span>.
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed mb-8">
              Ao conquistar a aprovação oficial no exame da ANAC, você recebe o Selo de <strong>Honra ao Mérito Voe Certo</strong>. Publique a credencial oficial verificável no seu perfil do LinkedIn e destaque sua autoridade profissional perante as companhias aéreas.
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

          {/* Right Column: Visual Mockup of Official Emission Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex justify-center"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl items-stretch">
              {/* Left Side: Dark Shield Badge Card */}
              <div className="bg-[#0b1329] border border-border/40 rounded-[5px] p-6 sm:p-8 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 via-transparent to-transparent pointer-events-none" />

                <div className="w-full flex-1 flex items-center justify-center py-4">
                  <motion.img
                    src="/images/aprovado-anac-official-transparent.png"
                    alt="Selo Oficial Aprovado ANAC - Voe Certo"
                    className="w-44 h-48 sm:w-48 sm:h-52 object-contain drop-shadow-[0_15px_30px_rgba(2,132,199,0.4)] group-hover:scale-105 transition-transform duration-300"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  />
                </div>

                <div className="text-center mt-4">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">
                    APROVADO ANAC
                  </h3>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.25em] mt-1">
                    PLATINUM BADGE
                  </p>
                </div>
              </div>

              {/* Right Side: Emission Details Card */}
              <div className="bg-card border border-border rounded-[5px] p-6 sm:p-7 flex flex-col justify-between shadow-xl">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-6 border-b border-border pb-3 flex items-center justify-between">
                    <span>DETALHES DA EMISSÃO</span>
                    <Badge variant="secondary" className="rounded-[5px] text-[9px] font-bold uppercase bg-success/10 text-success border-0">
                      Verificado
                    </Badge>
                  </h4>

                  <div className="space-y-4">
                    {/* Emitido para */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-[5px] bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Emitido para</p>
                        <p className="font-bold text-sm text-foreground">Piloto Voe Certo</p>
                      </div>
                    </div>

                    {/* Data de Conquista */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-[5px] bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Data de Conquista</p>
                        <p className="font-bold text-sm text-foreground">12 de maio de 2026</p>
                      </div>
                    </div>

                    {/* ID de Verificação */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-[5px] bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">ID de Verificação</p>
                        <p className="font-mono font-bold text-xs text-primary uppercase">VOO-2026-7RETOD</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed font-normal">
                    "Esta credencial certifica que o profissional demonstrou domínio técnico através da metodologia de simulados de alta performance do Voe Certo, garantindo o preparo exigido para as bancas examinadoras da ANAC."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
