import { motion } from 'framer-motion';
import { 
  FileText, TrendingUp, Sparkles, Home, BookOpen, 
  User, Bell, ChevronDown, CheckCircle2, ArrowUpRight 
} from 'lucide-react';

export function DashboardPreviewSection() {
  return (
    <section 
      id="painel-desempenho"
      className="py-20 md:py-32 bg-gradient-to-b from-white via-[#f4f8ff] to-white dark:from-[#071328] dark:via-[#091a36] dark:to-[#071328] relative overflow-hidden border-b border-border/60"
    >
      {/* Elementos decorativos de fundo (nuvens/iluminação suave) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-10 right-10 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── CABEÇALHO DA SEÇÃO ── */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 relative"
        >
          {/* Aviãozinho decorativo com trilha pontilhada no topo à direita */}
          <div className="hidden md:flex items-center absolute -top-8 -right-8 lg:-right-16 pointer-events-none opacity-85">
            <svg width="140" height="70" viewBox="0 0 140 70" fill="none" className="text-blue-400 dark:text-blue-400">
              <path 
                d="M 10,60 Q 60,50 110,18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray="4 4" 
                fill="none" 
              />
            </svg>
            <span className="text-blue-500 text-2xl -ml-2 -mt-10 transform rotate-12 inline-block">✈️</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#071328] dark:text-white tracking-tight leading-tight mb-4">
            <span className="relative inline-block">
              <span className="relative z-10">Acompanhe seu progresso</span>
              {/* Marca-texto azul suave */}
              <span className="absolute inset-x-0 bottom-1.5 h-3 sm:h-4 bg-blue-200/60 dark:bg-blue-500/25 -rotate-1 rounded-sm -z-0" />
            </span>{' '}
            com o Painel de Desempenho.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Entenda onde você está, o que já evoluiu e o que ainda precisa melhorar. Tudo de forma simples e visual.
          </p>
        </motion.div>

        {/* ── COMPOSIÇÃO: DASHBOARD CENTRAL + 3 CARDS FLUTUANTES GLASSMORPHISM ── */}
        <div className="relative max-w-6xl mx-auto">

          {/* GRID DESKTOP / LAYOUT PRINCIPAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">

            {/* ── COLUNA ESQUERDA: CARDS 1 E 3 (4 cols no desktop) ── */}
            <div className="lg:col-span-3 flex flex-col gap-6 sm:gap-8 order-2 lg:order-1 relative z-20">
              
              {/* CARD 1: SIMULADOS */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
                  opacity: { duration: 0.4 }
                }}
                className="relative backdrop-blur-xl bg-white/80 dark:bg-[#0c1f44]/80 border border-white/90 dark:border-blue-400/25 shadow-xl shadow-blue-500/10 rounded-[14px] p-5 sm:p-6 transition-transform hover:scale-[1.02]"
              >
                {/* Badge numérica 1 */}
                <div className="absolute -top-3.5 -left-2.5 w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-600/30">
                  1
                </div>

                <div className="w-10 h-10 rounded-[8px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3.5 border border-blue-100 dark:border-blue-800">
                  <FileText className="w-5 h-5" />
                </div>

                <h3 className="text-base sm:text-lg font-black text-[#071328] dark:text-white tracking-tight mb-1.5">
                  Simulados
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  Treine com questões reais e veja seu desempenho em tempo real.
                </p>

                {/* Seta curva conectando ao Dashboard (desktop) */}
                <div className="hidden lg:block absolute -right-9 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400 dark:text-blue-400">
                  <svg width="34" height="24" viewBox="0 0 34 24" fill="none">
                    <path 
                      d="M 2,12 C 14,8 22,12 28,12" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeDasharray="3 3" 
                    />
                    <path d="M 26,8 L 32,12 L 26,16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </motion.div>

              {/* CARD 3: INTELIGÊNCIA ARTIFICIAL */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                animate={{ y: [0, -5, 0] }}
                transition={{
                  y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.8 },
                  opacity: { duration: 0.4 }
                }}
                className="relative backdrop-blur-xl bg-white/80 dark:bg-[#0c1f44]/80 border border-white/90 dark:border-blue-400/25 shadow-xl shadow-blue-500/10 rounded-[14px] p-5 sm:p-6 transition-transform hover:scale-[1.02]"
              >
                {/* Badge numérica 3 */}
                <div className="absolute -top-3.5 -left-2.5 w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-600/30">
                  3
                </div>

                <div className="w-10 h-10 rounded-[8px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3.5 border border-blue-100 dark:border-blue-800">
                  <Sparkles className="w-5 h-5" />
                </div>

                <h3 className="text-base sm:text-lg font-black text-[#071328] dark:text-white tracking-tight mb-1.5">
                  Inteligência Artificial
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  Receba orientações personalizadas e tire suas dúvidas com a nossa IA.
                </p>

                {/* Seta curva conectando ao Dashboard (desktop) */}
                <div className="hidden lg:block absolute -right-9 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400 dark:text-blue-400">
                  <svg width="34" height="24" viewBox="0 0 34 24" fill="none">
                    <path 
                      d="M 2,12 C 14,8 22,12 28,12" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeDasharray="3 3" 
                    />
                    <path d="M 26,8 L 32,12 L 26,16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </motion.div>

            </div>

            {/* ── CENTRO: DASHBOARD REAL DA PLATAFORMA (6 cols no desktop) ── */}
            <div className="lg:col-span-6 order-1 lg:order-2 relative z-10">
              
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-[16px] sm:rounded-[20px] bg-white dark:bg-[#071328] border border-blue-100/90 dark:border-blue-900/50 shadow-2xl shadow-blue-900/15 overflow-hidden ring-1 ring-black/5"
              >
                {/* Topbar do Dashboard (Azul Escuro Real da Plataforma) */}
                <div className="bg-[#0a234e] text-white px-4 py-3 flex items-center justify-between border-b border-[#12336c]">
                  <div className="flex items-center gap-2.5">
                    {/* Escudo Logo Voe Certo */}
                    <div className="w-7 h-7 rounded-[5px] bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                      <svg className="w-4 h-4 fill-amber-400" viewBox="0 0 24 24">
                        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"/>
                      </svg>
                    </div>
                    <span className="font-black text-sm sm:text-base tracking-tight text-white">
                      Voe Certo
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button type="button" aria-label="Notificações" className="text-slate-300 hover:text-white transition-colors relative">
                      <Bell className="w-4 h-4" />
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full absolute top-0 right-0" />
                    </button>
                    {/* Avatar do Mike */}
                    <div className="w-8 h-8 rounded-full border border-blue-300/40 bg-blue-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                      <img 
                        src="/images/mike.png" 
                        alt="Mike" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback com ícone de usuário
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }} 
                      />
                      <User className="w-4 h-4 text-blue-900 dark:text-blue-200" />
                    </div>
                  </div>
                </div>

                {/* Corpo do Dashboard: Mini Sidebar + Área Central */}
                <div className="flex flex-col sm:flex-row bg-[#f8fbff] dark:bg-[#071328]">
                  
                  {/* Mini Sidebar Esquerda */}
                  <div className="w-full sm:w-36 shrink-0 bg-white dark:bg-[#091a38] border-b sm:border-b-0 sm:border-r border-slate-200/80 dark:border-slate-800 p-2 sm:p-3 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-[5px] bg-[#2563eb] text-white text-xs font-bold shadow-xs">
                      <Home className="w-3.5 h-3.5 shrink-0" />
                      <span>Dashboard</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-[5px] text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span>Simulados</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-[5px] text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>Guias</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-[5px] text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                      <span>IA</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-[5px] text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                      <User className="w-3.5 h-3.5 shrink-0" />
                      <span>Perfil</span>
                    </div>
                  </div>

                  {/* Área Principal de Conteúdo do Dashboard */}
                  <div className="flex-1 p-4 sm:p-5 space-y-4">
                    
                    {/* Boas-vindas */}
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-[#071328] dark:text-white leading-tight">
                        Olá, Mike!
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Seu progresso até aqui está incrível!
                      </p>
                    </div>

                    {/* Linha 1: Gráfico Circular + Gráfico de Linha */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                      
                      {/* Desempenho Geral (Circular Donut 78%) */}
                      <div className="sm:col-span-5 bg-white dark:bg-card border border-slate-200/90 dark:border-border rounded-[8px] p-3.5 flex flex-col items-center justify-center text-center shadow-xs">
                        <div className="relative w-24 h-24 my-1">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Círculo fundo */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              className="text-slate-100 dark:text-slate-800"
                              fill="none"
                            />
                            {/* Círculo progresso azul */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="#2563eb"
                              strokeWidth="8"
                              strokeDasharray={251.2}
                              strokeDashoffset={251.2 * (1 - 0.78)}
                              strokeLinecap="round"
                              fill="none"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-black text-[#071328] dark:text-white">
                              78%
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          Desempenho Geral
                        </span>
                      </div>

                      {/* Evolução do Desempenho (Line Chart) */}
                      <div className="sm:col-span-7 bg-white dark:bg-card border border-slate-200/90 dark:border-border rounded-[8px] p-3.5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Evolução do Desempenho
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-[4px] flex items-center gap-0.5">
                            Últimos 30 dias <ChevronDown className="w-2.5 h-2.5" />
                          </span>
                        </div>

                        {/* Gráfico SVG com Linha e Gradiente */}
                        <div className="relative h-24 w-full pt-1">
                          {/* Badge +12% sobre o pico */}
                          <div className="absolute top-1 right-8 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                            +12%
                          </div>

                          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 80" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Área sombreada */}
                            <path
                              d="M 10,65 Q 40,65 60,50 T 110,55 T 150,30 T 190,20 L 190,75 L 10,75 Z"
                              fill="url(#blueAreaGrad)"
                            />

                            {/* Linha da curva */}
                            <path
                              d="M 10,65 Q 40,65 60,50 T 110,55 T 150,30 T 190,20"
                              fill="none"
                              stroke="#2563eb"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />

                            {/* Pontos nos meses */}
                            {[
                              { cx: 10, cy: 65 },
                              { cx: 48, cy: 55 },
                              { cx: 85, cy: 52 },
                              { cx: 120, cy: 45 },
                              { cx: 155, cy: 30 },
                              { cx: 190, cy: 20 },
                            ].map((pt, i) => (
                              <circle key={i} cx={pt.cx} cy={pt.cy} r="3" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
                            ))}
                          </svg>
                        </div>

                        {/* Meses do eixo X */}
                        <div className="flex justify-between text-[9px] text-slate-400 font-medium px-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span>Jan</span>
                          <span>Fev</span>
                          <span>Mar</span>
                          <span>Abr</span>
                          <span>Mai</span>
                          <span>Jun</span>
                        </div>
                      </div>

                    </div>

                    {/* Linha 2: 3 Cards de Métricas Inferiores */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      
                      {/* Simulados */}
                      <div className="bg-white dark:bg-card border border-slate-200/90 dark:border-border rounded-[8px] p-2.5 shadow-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                          <FileText className="w-3 h-3 text-blue-500" />
                          <span className="text-[10px] font-bold truncate">Simulados</span>
                        </div>
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-sm sm:text-base font-black text-[#071328] dark:text-white">82%</span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">▲ +5%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="w-[82%] bg-blue-600 h-full rounded-full" />
                        </div>
                      </div>

                      {/* Guias */}
                      <div className="bg-white dark:bg-card border border-slate-200/90 dark:border-border rounded-[8px] p-2.5 shadow-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                          <BookOpen className="w-3 h-3 text-blue-500" />
                          <span className="text-[10px] font-bold truncate">Guias</span>
                        </div>
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-sm sm:text-base font-black text-[#071328] dark:text-white">76%</span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">▲ +8%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="w-[76%] bg-blue-600 h-full rounded-full" />
                        </div>
                      </div>

                      {/* Currículo */}
                      <div className="bg-white dark:bg-card border border-slate-200/90 dark:border-border rounded-[8px] p-2.5 shadow-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                          <FileText className="w-3 h-3 text-blue-500" />
                          <span className="text-[10px] font-bold truncate">Currículo</span>
                        </div>
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-sm sm:text-base font-black text-[#071328] dark:text-white">69%</span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">▲ +4%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="w-[69%] bg-blue-600 h-full rounded-full" />
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

              </motion.div>

            </div>

            {/* ── COLUNA DIREITA: CARD 2 SEU PROGRESSO (3 cols no desktop) ── */}
            <div className="lg:col-span-3 flex flex-col justify-center order-3 relative z-20">
              
              {/* CARD 2: SEU PROGRESSO */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  y: { repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 0.4 },
                  opacity: { duration: 0.4 }
                }}
                className="relative backdrop-blur-xl bg-white/80 dark:bg-[#0c1f44]/80 border border-white/90 dark:border-blue-400/25 shadow-xl shadow-blue-500/10 rounded-[14px] p-5 sm:p-6 transition-transform hover:scale-[1.02]"
              >
                {/* Badge numérica 2 */}
                <div className="absolute -top-3.5 -left-2.5 w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-600/30">
                  2
                </div>

                {/* Seta curva conectando ao Dashboard (desktop) vinda da esquerda do card */}
                <div className="hidden lg:block absolute -left-9 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400 dark:text-blue-400">
                  <svg width="34" height="24" viewBox="0 0 34 24" fill="none">
                    <path 
                      d="M 32,12 C 20,8 12,12 6,12" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeDasharray="3 3" 
                    />
                    <path d="M 8,8 L 2,12 L 8,16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="w-10 h-10 rounded-[8px] bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mb-3.5 border border-amber-100 dark:border-amber-900/50">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>

                <h3 className="text-base sm:text-lg font-black text-[#071328] dark:text-white tracking-tight mb-1.5">
                  Seu progresso
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  Acompanhe sua evolução, veja seus pontos fortes e foque no que importa.
                </p>
              </motion.div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}