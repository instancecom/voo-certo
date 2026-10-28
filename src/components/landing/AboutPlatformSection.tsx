import { motion } from 'framer-motion';
import { 
  ClipboardCheck, Sparkles, Award, ArrowRight, 
  Brain, FileText, CheckCircle2, Plane
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const AboutPlatformSection = () => {
  const cards = [
    {
      badge: 'Treino Prático',
      title: 'Simulados reais, sem enrolação',
      desc: 'Mais de 2.000 questões atualizadas no padrão exato da banca da ANAC. Você treina com cronômetro real e aprende a desarmar as pegadinhas antes do dia oficial.',
      icon: ClipboardCheck,
      tagColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      sticker: '✈️ Prova Real',
    },
    {
      badge: 'Tira-Dúvidas 24/7',
      title: 'Mike: seu copiloto de estudos',
      desc: 'Travou em regulamentos ou meteorologia? O Mike analisa seu erro e explica em bom português por que cada alternativa está certa ou errada, sem juridiquês.',
      icon: Sparkles,
      tagColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      sticker: '💡 Direto ao Ponto',
    },
    {
      badge: 'Carreira & Contratação',
      title: 'Do exame até a vaga na companhia',
      desc: 'Passou na banca? O Mike monta seu currículo sob medida para a triagem da Azul, LATAM e GOL, e você publica seu Selo de Aprovação direto no LinkedIn.',
      icon: Award,
      tagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      sticker: '🎖️ Contratado',
    },
  ];

  return (
    <section 
      id="sobre" 
      className="py-20 md:py-32 bg-white dark:bg-[#060e1d] relative overflow-hidden border-b border-border/60"
    >
      {/* Background decorativo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── CABEÇALHO COM TÍTULO E STICKER BOMB ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          {/* Título Principal com Sticker Bomb */}
          <div className="relative inline-block mb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-black text-[#071328] dark:text-white tracking-tight leading-[1.12]">
              Tudo para dar seu<br />
              <span className="relative inline-block">
                próximo passo
                
                {/* ── STICKER BOMB (ESTRELAS + AVIÃOZINHO COM TRILHA) ── */}
                <span className="inline-flex items-center align-middle ml-2 sm:ml-3 relative -top-1 sm:-top-2">
                  
                  {/* SVG / Sticker animado com estrelas cartoon e aviãozinho */}
                  <span className="relative inline-block">
                    {/* Estrelas Cartoon com borda adesivo branca */}
                    <span className="inline-block transform rotate-12 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] hover:scale-110 transition-transform cursor-pointer">
                      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-11 sm:h-11">
                        {/* Estrela Principal */}
                        <path 
                          d="M24 2L28.5 16.5L43 21L28.5 25.5L24 40L19.5 25.5L5 21L19.5 16.5L24 2Z" 
                          fill="#FBBF24" 
                          stroke="#1E293B" 
                          strokeWidth="3.5" 
                          strokeLinejoin="round" 
                        />
                        <path 
                          d="M24 6L27 17L38 21L27 25L24 36L21 25L10 21L21 17L24 6Z" 
                          fill="#F59E0B" 
                        />
                        {/* Estrela Menor Sobreposta */}
                        <path 
                          d="M38 24L40.5 32L48 34.5L40.5 37L38 45L35.5 37L28 34.5L35.5 32L38 24Z" 
                          fill="#FDE047" 
                          stroke="#1E293B" 
                          strokeWidth="2.5" 
                          strokeLinejoin="round" 
                        />
                      </svg>
                    </span>

                    {/* Aviãozinho Azul voando em trilha curva */}
                    <span className="absolute -right-6 -bottom-3 sm:-right-8 sm:-bottom-4 transform rotate-[25deg] filter drop-shadow-[0_3px_5px_rgba(30,58,138,0.25)]">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8">
                        <path 
                          d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" 
                          fill="#3B82F6" 
                          stroke="#1E293B" 
                          strokeWidth="1.5" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    {/* Trilha de Voo Curva Sutil */}
                    <svg className="absolute -bottom-6 -left-16 sm:-left-24 w-32 sm:w-44 h-12 pointer-events-none opacity-80" viewBox="0 0 160 50" fill="none">
                      <path 
                        d="M10 40C60 45 110 35 150 15" 
                        stroke="#93C5FD" 
                        strokeWidth="2" 
                        strokeDasharray="4 4" 
                        strokeLinecap="round" 
                      />
                    </svg>
                  </span>

                </span>
              </span><br />
              na aviação.
            </h2>
          </div>

          {/* Subtítulo Descontraído e Direto */}
          <p className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Treine com simulados, entenda sua evolução e encontre orientação para seguir em frente — tudo em um só lugar.
          </p>
        </motion.div>

        {/* ── CARDS SOBRE A PLATAFORMA (BREVES, HUMANOS E SEM AI SLOP) ── */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {cards.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="h-full"
              >
                <div className="bg-slate-50/70 dark:bg-card/70 border border-slate-200/80 dark:border-border/80 rounded-[5px] h-full flex flex-col justify-between p-6 sm:p-8 hover:border-amber-400/60 dark:hover:border-amber-400/60 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 relative group">
                  
                  {/* Sticker no canto superior do card */}
                  <div className="absolute -top-3 right-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-700 dark:text-slate-300 transform rotate-2 group-hover:rotate-0 transition-transform">
                    {item.sticker}
                  </div>

                  <div>
                    {/* Ícone */}
                    <div className="w-12 h-12 rounded-[5px] bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-primary dark:text-amber-400 shadow-xs mb-5 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Tag da Etapa */}
                    <span className={`inline-block mb-3 px-2.5 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider border ${item.tagColor}`}>
                      {item.badge}
                    </span>

                    {/* Título do Card */}
                    <h3 className="text-lg sm:text-xl font-bold text-[#071328] dark:text-white mb-3 leading-snug">
                      {item.title}
                    </h3>

                    {/* Descrição Curta e Descontraída */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  {/* Detalhe no rodapé do Card */}
                  <div className="pt-6 mt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-primary dark:text-amber-400">
                    <span className="text-[11px] text-muted-foreground font-medium">100% focado na aviação</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
