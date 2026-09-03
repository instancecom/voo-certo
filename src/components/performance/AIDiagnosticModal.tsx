import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, TrendingDown,
  Clock, ArrowRight, Loader2, AlertCircle,
  ChevronDown, ChevronUp, Target, XCircle, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AIDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  examResults?: any[];
  subcategories?: any[];
  exams?: any[];
  userCreatedAt?: string;
  userEmail?: string;
}

interface DiagnosticResult {
  critical_point: { title: string; description: string; topics: string[] };
  positive_point: { title: string; description: string; topics: string[] };
  trend: { title: string; description: string; status: 'improving' | 'stable' | 'declining' };
  recommendation: { title: string; description: string; suggested_exam_type?: string };
}

/**
 * Função utilitária para limpar possíveis caracteres corrompidos (mojibake)
 * de dados salvos em cache ou vindos da API
 */
function sanitizeMojibake(text?: string): string {
  if (!text) return '';
  return text
    // Emojis corrompidos comuns
    .replace(/ðŸ[^\s]+/g, '')
    .replace(/âœ[^\s]+/g, '')
    .replace(/â[^\s]+/g, '')
    // Letras acentuadas corrompidas comuns em UTF-8 mal interpretado
    .replace(/Ã¡/g, 'á')
    .replace(/Ã /g, 'à')
    .replace(/Ã¢/g, 'â')
    .replace(/Ã£/g, 'ã')
    .replace(/Ã©/g, 'é')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ã´/g, 'ô')
    .replace(/Ãµ/g, 'õ')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã/g, 'Á')
    .replace(/Á¡/g, 'á')
    .replace(/Á£/g, 'ã')
    .replace(/Á©/g, 'é')
    .replace(/Á³/g, 'ó')
    .replace(/Áº/g, 'ú')
    .replace(/Á§/g, 'ç')
    .replace(/[\uFFFD\u007F-\u009F]/g, '')
    .trim();
}

/* ------------------------------------------------------------------ */
/* Accordion Card (mobile)                                            */
/* ------------------------------------------------------------------ */
function DiagnosticCard({
  icon, title, description, topics, badge, borderClass, bgClass, tagClass, footer,
}: {
  icon: React.ReactNode; title: string; description: string; topics?: string[];
  badge?: React.ReactNode; borderClass: string; bgClass: string; tagClass: string;
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const cleanTitle = sanitizeMojibake(title);
  const cleanDescription = sanitizeMojibake(description);

  return (
    <div className={`rounded-[5px] border-l-4 border border-border ${borderClass} ${bgClass} overflow-hidden transition-colors`}>
      <button
        type="button"
        className="w-full flex items-center justify-between px-3.5 py-3 text-left gap-2 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="shrink-0">{icon}</span>
          <span className="font-bold text-[13px] text-foreground truncate">{cleanTitle}</span>
          {badge}
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-2.5">
              <p className="text-xs text-muted-foreground leading-relaxed">{cleanDescription}</p>
              {topics && topics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {topics.map((t, i) => (
                    <Badge key={i} variant="outline" className={`text-[10px] font-semibold rounded-[5px] ${tagClass}`}>
                      {sanitizeMojibake(t)}
                    </Badge>
                  ))}
                </div>
              )}
              {footer && <div className="pt-1">{footer}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal Principal                                                     */
/* ------------------------------------------------------------------ */
export function AIDiagnosticModal({
  isOpen, onClose, examResults = [], subcategories = [], exams = [], userCreatedAt, userEmail,
}: AIDiagnosticModalProps) {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'all'>('7d');
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<number | null>(null);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('voecerto_ai_diagnostic_data');
      const savedTime = localStorage.getItem('voecerto_ai_diagnostic_timestamp');
      if (savedData && savedTime) {
        const parsed = JSON.parse(savedData);
        setDiagnostic(parsed);
        setLastGeneratedAt(Number(savedTime));
      }
    } catch (e) {
      console.warn('Erro ao carregar cache do diagnóstico:', e);
    }
  }, []);

  let accountAgeDays = 30;
  if (userCreatedAt) {
    try {
      const d = new Date(userCreatedAt);
      if (!isNaN(d.getTime()))
        accountAgeDays = Math.max(0, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)));
    } catch { accountAgeDays = 30; }
  }

  const safeExamResults = Array.isArray(examResults) ? examResults : [];
  const safeExams = Array.isArray(exams) ? exams : [];
  const safeSubcategories = Array.isArray(subcategories) ? subcategories : [];

  const totalCompletedExams = safeExamResults.length;
  const hasMinExams = totalCompletedExams >= 3;
  const isAdminUser = userEmail?.includes('admin') || userEmail?.includes('instancecom') || userEmail?.includes('kamimura');
  const hasMinAccountAge = accountAgeDays >= 7 || isAdminUser;

  const now = Date.now();
  const hoursSince = lastGeneratedAt ? (now - lastGeneratedAt) / (1000 * 60 * 60) : 999;
  const isCooldownActive = hoursSince < 24;
  const remainingHours = Math.max(0, Math.floor(24 - hoursSince));
  const remainingMinutes = Math.max(0, Math.floor((24 - hoursSince - remainingHours) * 60));

  const getFilteredResults = () => {
    if (safeExamResults.length === 0) return [];
    if (selectedPeriod === 'all') return safeExamResults;
    const days = selectedPeriod === '7d' ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return safeExamResults.filter((r) => {
      if (!r?.completed_at) return false;
      try { const t = new Date(r.completed_at).getTime(); return !isNaN(t) && t >= cutoff; }
      catch { return false; }
    });
  };

  const filteredResults = getFilteredResults();
  const canRequest = hasMinExams && hasMinAccountAge && !isCooldownActive && !isGenerating;
  const showWarning = !hasMinExams || !hasMinAccountAge;

  const handleGenerateDiagnostic = async () => {
    if (!hasMinExams) { toast.error('Realize pelo menos 3 simulados para gerar o diagnóstico.'); return; }
    if (!hasMinAccountAge) { toast.error('Você precisa de pelo menos 7 dias de cadastro na plataforma.'); return; }
    if (filteredResults.length === 0) { toast.error('Nenhum simulado no período selecionado. Tente "Histórico completo".'); return; }

    setIsGenerating(true);
    toast.info('Mike analisando seu histórico de simulados...');

    try {
      const simplifiedResults = filteredResults.map((r) => {
        const exam = safeExams.find((e) => e?.id === r?.exam_id);
        const sub = safeSubcategories.find((s) => s?.id === exam?.subcategory_id);
        return {
          score: Number(r?.score) || 0,
          correct: Number(r?.correct_answers) || 0,
          total: Number(r?.total_questions) || 0,
          date: r?.completed_at || new Date().toISOString(),
          exam_title: exam?.title || 'Simulado ANAC',
          category: sub?.name || 'Geral',
        };
      });

      const { data, error } = await supabase.functions.invoke('performance-ai-diagnostic', {
        body: { period: selectedPeriod, examResults: simplifiedResults },
      });

      if (error) throw error;
      if (!data?.diagnostic) throw new Error('O Mike não retornou os dados do diagnóstico.');

      setDiagnostic(data.diagnostic);
      const ts = Date.now();
      setLastGeneratedAt(ts);
      localStorage.setItem('voecerto_ai_diagnostic_data', JSON.stringify(data.diagnostic));
      localStorage.setItem('voecerto_ai_diagnostic_timestamp', ts.toString());
      toast.success('Diagnóstico gerado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao gerar diagnóstico:', err);
      toast.error('Erro ao gerar diagnóstico. Tente novamente em instantes!');
    } finally {
      setIsGenerating(false);
    }
  };

  const PERIODS = [
    { value: '7d' as const, label: 'Últimos 7 dias' },
    { value: '30d' as const, label: 'Últimos 30 dias' },
    { value: 'all' as const, label: 'Histórico completo' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[92vh] overflow-y-auto p-0 rounded-[5px] border-border bg-card shadow-2xl gap-0">

        {/* ── Top Header Mike ─────────────────────────────────── */}
        <div className="bg-primary text-primary-foreground px-4 py-3.5 sm:px-5 sm:py-4 flex items-center gap-3 border-b border-primary/20 shrink-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[5px] overflow-hidden border-2 border-amber-400 shadow-md">
              <img
                src="/images/avatars/mike_character_analytic.png"
                alt="Mike"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5 border-2 border-primary">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-sm sm:text-base font-black text-primary-foreground leading-tight">
                Diagnóstico com Mike
              </DialogTitle>
              <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-300 bg-amber-400/10 rounded-[5px] shrink-0 font-bold px-1.5 py-0">
                IA
              </Badge>
            </div>
            <DialogDescription className="text-[11px] text-primary-foreground/70 mt-0.5 leading-snug">
              Análise personalizada do seu histórico de simulados.
            </DialogDescription>
          </div>
        </div>

        {/* ── Corpo do Modal ──────────────────────────────────── */}
        <div className="p-4 sm:p-5 space-y-4">

          {/* Aviso de requisitos (Aparece SOMENTE se não atingido) */}
          {showWarning && (
            <div className="flex items-start gap-2.5 p-3 rounded-[5px] bg-amber-500/10 border border-amber-500/25">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed font-medium">
                {!hasMinExams && !hasMinAccountAge
                  ? 'Para ativar o diagnóstico, realize pelo menos 3 simulados e aguarde 7 dias de cadastro.'
                  : !hasMinExams
                  ? `Você realizou ${totalCompletedExams} de 3 simulados necessários para o diagnóstico.`
                  : 'Aguarde pelo menos 7 dias de cadastro na plataforma.'}
              </p>
            </div>
          )}

          {/* Aviso de cooldown de 24h */}
          {isCooldownActive && diagnostic && (
            <div className="flex items-start gap-2.5 p-3 rounded-[5px] bg-amber-500/10 border border-amber-500/25">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Próxima análise disponível em {remainingHours}h {remainingMinutes}min
                </p>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                  O intervalo de 24h garante tempo para absorver as recomendações antes de uma nova análise.
                </p>
              </div>
            </div>
          )}

          {/* ── Seção Período + CTA ───────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                Período de análise
              </span>
              {isCooldownActive && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Intervalo 24h ativo
                </span>
              )}
            </div>

            {/* Segmented Control Minimalista */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 rounded-[5px] border border-border/70">
              {PERIODS.map((p) => {
                const isActive = selectedPeriod === p.value;
                const isDisabled = isCooldownActive;
                return (
                  <button
                    key={p.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setSelectedPeriod(p.value)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-[4px] transition-all truncate text-center ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isDisabled
                        ? 'text-muted-foreground/40 cursor-not-allowed'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Botão de Ação Principal — Estilo Hero da Landing Page */}
            <Button
              onClick={handleGenerateDiagnostic}
              disabled={!canRequest}
              className={`w-full h-11 text-xs sm:text-sm font-bold gap-2 rounded-[5px] transition-all shadow-sm ${
                canRequest
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-75'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Mike analisando seu histórico...</span>
                </>
              ) : isCooldownActive ? (
                <>
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Próxima análise em {remainingHours}h {remainingMinutes}min</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  <span>Solicitar Diagnóstico com Mike</span>
                </>
              )}
            </Button>
          </div>

          {/* ── Resultado do Diagnóstico ─────────────────────── */}
          {diagnostic && (
            <div className="space-y-2.5 pt-2 border-t border-border">
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest pt-1">
                Seu Diagnóstico Atual
              </p>

              {/* Mobile: Accordion Colapsável */}
              <div className="space-y-2 md:hidden">
                <DiagnosticCard
                  icon={<XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                  title={diagnostic.critical_point?.title || 'Ponto Crítico'}
                  description={diagnostic.critical_point?.description || ''}
                  topics={diagnostic.critical_point?.topics}
                  borderClass="border-l-red-500"
                  bgClass="bg-red-500/5"
                  tagClass="border-red-500/30 text-red-600 dark:text-red-400"
                />

                <DiagnosticCard
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                  title={diagnostic.positive_point?.title || 'Ponto Positivo'}
                  description={diagnostic.positive_point?.description || ''}
                  topics={diagnostic.positive_point?.topics}
                  borderClass="border-l-emerald-500"
                  bgClass="bg-emerald-500/5"
                  tagClass="border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                />

                <DiagnosticCard
                  icon={<TrendingUp className="w-4 h-4 text-primary shrink-0" />}
                  title={diagnostic.trend?.title || 'Tendência de Evolução'}
                  description={diagnostic.trend?.description || ''}
                  badge={
                    diagnostic.trend?.status === 'improving' ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[9px] gap-1 rounded-[5px] ml-auto py-0 font-bold">
                        <TrendingUp className="w-2.5 h-2.5" /> Evoluindo
                      </Badge>
                    ) : diagnostic.trend?.status === 'declining' ? (
                      <Badge className="bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30 text-[9px] gap-1 rounded-[5px] ml-auto py-0 font-bold">
                        <TrendingDown className="w-2.5 h-2.5" /> Atenção
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] rounded-[5px] ml-auto py-0 font-bold">
                        Estável
                      </Badge>
                    )
                  }
                  borderClass="border-l-primary"
                  bgClass="bg-primary/5"
                  tagClass="border-primary/30 text-primary"
                />

                <DiagnosticCard
                  icon={<Target className="w-4 h-4 text-amber-500 shrink-0" />}
                  title={diagnostic.recommendation?.title || 'Recomendação de Estudos'}
                  description={diagnostic.recommendation?.description || ''}
                  borderClass="border-l-amber-500"
                  bgClass="bg-amber-500/5"
                  tagClass="border-amber-500/30 text-amber-700 dark:text-amber-300"
                  footer={
                    <Button
                      size="sm"
                      onClick={() => { onClose(); navigate('/simulados'); }}
                      className="gap-2 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-[5px] w-full h-9"
                    >
                      <span>Ir para o Simulado Recomendado</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  }
                />
              </div>

              {/* Desktop: Grid 2x2 Elegante */}
              <div className="hidden md:grid md:grid-cols-2 gap-2.5">
                {/* 🔴 Ponto Crítico */}
                <Card className="border-l-4 border-l-red-500 border-border bg-red-500/5 rounded-[5px] shadow-none">
                  <CardContent className="p-3.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <h4 className="font-bold text-xs text-foreground">
                        {sanitizeMojibake(diagnostic.critical_point?.title || 'Ponto Crítico')}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sanitizeMojibake(diagnostic.critical_point?.description)}
                    </p>
                    {diagnostic.critical_point?.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {diagnostic.critical_point.topics.map((t, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] rounded-[5px] border-red-500/30 text-red-600 dark:text-red-400 font-medium">
                            {sanitizeMojibake(t)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 🟢 Ponto Positivo */}
                <Card className="border-l-4 border-l-emerald-500 border-border bg-emerald-500/5 rounded-[5px] shadow-none">
                  <CardContent className="p-3.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <h4 className="font-bold text-xs text-foreground">
                        {sanitizeMojibake(diagnostic.positive_point?.title || 'Ponto Positivo')}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sanitizeMojibake(diagnostic.positive_point?.description)}
                    </p>
                    {diagnostic.positive_point?.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {diagnostic.positive_point.topics.map((t, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] rounded-[5px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium">
                            {sanitizeMojibake(t)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 🔵 Tendência */}
                <Card className="border-l-4 border-l-primary border-border bg-primary/5 rounded-[5px] shadow-none">
                  <CardContent className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                        <h4 className="font-bold text-xs text-foreground">
                          {sanitizeMojibake(diagnostic.trend?.title || 'Tendência')}
                        </h4>
                      </div>
                      {diagnostic.trend?.status === 'improving' && (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[9px] gap-1 rounded-[5px] font-bold">
                          <TrendingUp className="w-2.5 h-2.5" /> Evoluindo
                        </Badge>
                      )}
                      {diagnostic.trend?.status === 'declining' && (
                        <Badge className="bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30 text-[9px] gap-1 rounded-[5px] font-bold">
                          <TrendingDown className="w-2.5 h-2.5" /> Atenção
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sanitizeMojibake(diagnostic.trend?.description)}
                    </p>
                  </CardContent>
                </Card>

                {/* 🟡 Recomendação */}
                <Card className="border-l-4 border-l-amber-500 border-border bg-amber-500/5 rounded-[5px] shadow-none">
                  <CardContent className="p-3.5 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-500 shrink-0" />
                      <h4 className="font-bold text-xs text-foreground">
                        {sanitizeMojibake(diagnostic.recommendation?.title || 'Recomendação')}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sanitizeMojibake(diagnostic.recommendation?.description)}
                    </p>
                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        onClick={() => { onClose(); navigate('/simulados'); }}
                        className="gap-2 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-[5px] h-8 px-3"
                      >
                        <span>Ir para Simulado</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}