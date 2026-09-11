import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, TrendingDown,
  Clock, ArrowRight, Loader2, AlertCircle,
  ChevronDown, ChevronUp, Target, XCircle, CheckCircle2,
  ShieldCheck, Brain, ArrowUpRight, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

function sanitizeMojibake(text?: string): string {
  if (!text) return '';
  return String(text)
    .replace(/ðŸ[^\s]+/g, '')
    .replace(/âœ[^\s]+/g, '')
    .replace(/â[^\s]+/g, '')
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

function formatDateSafe(val: any, fmt: string, fallback = ''): string {
  if (!val) return fallback;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return fallback;
    return format(d, fmt, { locale: ptBR });
  } catch {
    return fallback;
  }
}

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
        if (parsed && typeof parsed === 'object') {
          setDiagnostic(parsed);
        }
        let parsedTime = Number(savedTime);
        if (isNaN(parsedTime)) {
          parsedTime = new Date(savedTime).getTime();
        }
        if (!isNaN(parsedTime)) {
          setLastGeneratedAt(parsedTime);
        }
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
  const hoursSince = lastGeneratedAt && !isNaN(lastGeneratedAt) ? (now - lastGeneratedAt) / (1000 * 60 * 60) : 999;
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
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-[5px] border-border bg-card shadow-2xl gap-0">

        {/* ── Top Header Executivo no padrão escuro aeronáutico ── */}
        <div className="bg-gradient-to-r from-[#091326] via-[#0f172a] to-[#1e293b] text-white px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between border-b border-border/40 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_70%)] pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10 min-w-0">
            {/* Avatar Mike */}
            <div className="relative shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[5px] overflow-hidden border border-accent/40 shadow-sm bg-[#091326]">
                <img
                  src="/images/avatars/mike_character_analytic.png"
                  alt="Mike"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-accent rounded-full p-0.5 border-2 border-[#0f172a]">
                <Sparkles className="w-2.5 h-2.5 text-accent-foreground" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                  Diagnóstico com Mike
                </DialogTitle>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-[3px] border border-accent/40 text-accent bg-accent/10 uppercase tracking-wider">
                  IA
                </span>
              </div>
              <DialogDescription className="text-xs text-white/70 mt-0.5 leading-snug truncate">
                Análise preditiva e recomendações técnicas para a banca ANAC.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── Corpo do Modal ── */}
        <div className="p-5 sm:p-6 space-y-5">

          {/* Avisos de Requisitos / Cooldown */}
          {showWarning && (
            <div className="flex items-start gap-3 p-3.5 rounded-[5px] bg-amber-500/10 border border-amber-500/25">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                {!hasMinExams && !hasMinAccountAge
                  ? 'Para calibrar a inteligência do Mike, realize pelo menos 3 simulados e aguarde 7 dias de cadastro.'
                  : !hasMinExams
                  ? `Você realizou ${totalCompletedExams} de 3 simulados mínimos necessários para o diagnóstico.`
                  : 'Aguarde pelo menos 7 dias de cadastro na plataforma.'}
              </p>
            </div>
          )}

          {isCooldownActive && diagnostic && (
            <div className="flex items-start gap-3 p-3.5 rounded-[5px] bg-sky-500/10 border border-sky-500/25">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
              <div>
                <p className="text-xs font-bold text-sky-900 dark:text-sky-200">
                  Próxima análise disponível em {remainingHours}h {remainingMinutes}min
                </p>
                <p className="text-[11px] text-sky-800/80 dark:text-sky-300/80 mt-0.5 leading-relaxed">
                  O intervalo de 24h garante que você pratique as recomendações antes de uma nova avaliação.
                </p>
              </div>
            </div>
          )}

          {/* Seção de Configuração: Período + Ação Principal */}
          <div className="p-4 sm:p-4.5 rounded-[5px] bg-muted/20 border border-border/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Período de Análise
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                {filteredResults.length} {filteredResults.length === 1 ? 'simulado encontrado' : 'simulados encontrados'}
              </span>
            </div>

            {/* Segmented Control Limpo */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-background rounded-[5px] border border-border">
              {PERIODS.map((p) => {
                const isActive = selectedPeriod === p.value;
                const isDisabled = isCooldownActive;
                return (
                  <button
                    key={p.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setSelectedPeriod(p.value)}
                    className={`py-2 px-2 text-xs font-bold rounded-[4px] transition-all text-center truncate ${
                      isActive
                        ? 'bg-accent text-accent-foreground shadow-xs'
                        : isDisabled
                        ? 'text-muted-foreground/40 cursor-not-allowed'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Botão de Solicitação do Diagnóstico */}
            <Button
              onClick={handleGenerateDiagnostic}
              disabled={!canRequest}
              className={`w-full h-11 text-xs sm:text-sm font-bold gap-2 rounded-[5px] transition-all shadow-xs ${
                canRequest
                  ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                  : 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-75'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-accent-foreground" />
                  <span>Mike analisando seu padrão de respostas...</span>
                </>
              ) : isCooldownActive ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Nova análise em {remainingHours}h {remainingMinutes}min</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Solicitar Diagnóstico com Mike</span>
                </>
              )}
            </Button>
          </div>

          {/* ── Resultado do Diagnóstico (Grid Moderno Executivo) ── */}
          {diagnostic && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Diagnóstico Consolidado
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {lastGeneratedAt ? formatDateSafe(lastGeneratedAt, "dd/MM/yyyy 'às' HH:mm", 'Atualizado') : 'Atualizado'}
                </span>
              </div>

              {/* Grid 2x2 Elegante e Moderno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 🔴 Ponto Crítico */}
                <div className="p-4 rounded-[5px] border border-red-200/80 dark:border-red-950/60 bg-red-500/5 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-[4px] bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
                        <XCircle className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-bold text-xs text-foreground uppercase tracking-tight">
                        {sanitizeMojibake(diagnostic.critical_point?.title || 'Ponto Crítico')}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sanitizeMojibake(diagnostic.critical_point?.description)}
                    </p>
                  </div>

                  {Array.isArray(diagnostic.critical_point?.topics) && diagnostic.critical_point.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {diagnostic.critical_point.topics.map((t, i) => (
                        <span key={i} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-[3px] bg-red-500/10 text-red-600 border border-red-500/20">
                          {sanitizeMojibake(String(t))}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🟢 Ponto Positivo */}
                <div className="p-4 rounded-[5px] border border-emerald-200/80 dark:border-emerald-950/60 bg-emerald-500/5 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-[4px] bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-bold text-xs text-foreground uppercase tracking-tight">
                        {sanitizeMojibake(diagnostic.positive_point?.title || 'Ponto Positivo')}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sanitizeMojibake(diagnostic.positive_point?.description)}
                    </p>
                  </div>

                  {Array.isArray(diagnostic.positive_point?.topics) && diagnostic.positive_point.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {diagnostic.positive_point.topics.map((t, i) => (
                        <span key={i} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-[3px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {sanitizeMojibake(String(t))}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🔵 Tendência de Evolução */}
                <div className="p-4 rounded-[5px] border border-border bg-card flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[4px] bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="font-bold text-xs text-foreground uppercase tracking-tight">
                          {sanitizeMojibake(diagnostic.trend?.title || 'Tendência de Evolução')}
                        </h4>
                      </div>

                      {diagnostic.trend?.status === 'improving' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                          Evoluindo
                        </span>
                      )}
                      {diagnostic.trend?.status === 'declining' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] bg-red-500/10 text-red-600 border border-red-500/30">
                          Atenção
                        </span>
                      )}
                      {diagnostic.trend?.status === 'stable' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] bg-muted text-muted-foreground border border-border">
                          Estável
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sanitizeMojibake(diagnostic.trend?.description)}
                    </p>
                  </div>
                </div>

                {/* 🟡 Recomendação de Próximo Passo */}
                <div className="p-4 rounded-[5px] border border-amber-500/30 bg-amber-500/5 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-[4px] bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                        <Target className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-bold text-xs text-foreground uppercase tracking-tight">
                        {sanitizeMojibake(diagnostic.recommendation?.title || 'Recomendação')}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sanitizeMojibake(diagnostic.recommendation?.description)}
                    </p>
                  </div>

                  <div className="pt-1">
                    <Button
                      size="sm"
                      onClick={() => { onClose(); navigate('/simulados'); }}
                      className="w-full h-8 text-xs font-bold gap-1.5 rounded-[5px] bg-accent text-accent-foreground hover:bg-accent/90 shadow-2xs"
                    >
                      <span>Ir para o Simulado Recomendado</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}