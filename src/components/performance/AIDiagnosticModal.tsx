import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
    { value: '7d' as const, label: '7 dias' },
    { value: '30d' as const, label: '30 dias' },
    { value: 'all' as const, label: 'Completo' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 rounded-[5px] border-border bg-card shadow-xl gap-0">

        {/* ── Header Minimalista ── */}
        <div className="bg-[#0f172a] text-white px-5 py-3.5 flex items-center justify-between border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-[5px] overflow-hidden border border-white/10 shrink-0 bg-[#091326]">
              <img
                src="/images/avatars/mike_character_analytic.png"
                alt="Mike"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-sm font-bold text-white tracking-tight">
                  Diagnóstico com Mike
                </DialogTitle>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-[3px] bg-white/10 text-white/80 uppercase">
                  IA
                </span>
              </div>
              <DialogDescription className="text-xs text-white/60 truncate">
                Parecer técnico e recomendações para a ANAC
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── Conteúdo Minimalista ── */}
        <div className="p-4 sm:p-5 space-y-4">

          {/* Avisos de Requisitos / Cooldown */}
          {showWarning && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-[5px] font-medium leading-relaxed">
              {!hasMinExams && !hasMinAccountAge
                ? 'Realize pelo menos 3 simulados e complete 7 dias de cadastro para liberar o diagnóstico.'
                : !hasMinExams
                ? `Você realizou ${totalCompletedExams} de 3 simulados necessários.`
                : 'Aguarde pelo menos 7 dias de cadastro na plataforma.'}
            </p>
          )}

          {isCooldownActive && diagnostic && (
            <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-[5px] font-medium">
              Próxima análise liberada em {remainingHours}h {remainingMinutes}min
            </p>
          )}

          {/* Seletor de Período e Botão de Ação */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Período</span>
              <span>{filteredResults.length} {filteredResults.length === 1 ? 'simulado' : 'simulados'}</span>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 bg-muted/30 rounded-[5px] border border-border/60">
              {PERIODS.map((p) => {
                const isActive = selectedPeriod === p.value;
                const isDisabled = isCooldownActive;
                return (
                  <button
                    key={p.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setSelectedPeriod(p.value)}
                    className={`py-1.5 text-xs font-semibold rounded-[4px] transition-all text-center ${
                      isActive
                        ? 'bg-background text-foreground shadow-xs border border-border/80'
                        : isDisabled
                        ? 'text-muted-foreground/40 cursor-not-allowed'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <Button
              onClick={handleGenerateDiagnostic}
              disabled={!canRequest}
              className={`w-full h-9 text-xs font-bold rounded-[5px] transition-all ${
                canRequest
                  ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  Analisando dados...
                </>
              ) : isCooldownActive ? (
                `Nova análise em ${remainingHours}h ${remainingMinutes}min`
              ) : (
                'Solicitar Diagnóstico'
              )}
            </Button>
          </div>

          {/* ── Parecer Técnico Consolidado ── */}
          {diagnostic && (
            <div className="space-y-3 pt-3 border-t border-border/60">
              
              {/* Barra de Status e Data */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {lastGeneratedAt ? formatDateSafe(lastGeneratedAt, "dd/MM/yyyy 'às' HH:mm", 'Atualizado') : 'Atualizado'}
                </span>
                {diagnostic.trend?.status === 'improving' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-wider">
                    Evoluindo
                  </span>
                )}
                {diagnostic.trend?.status === 'declining' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] bg-red-500/10 text-red-600 border border-red-500/20 uppercase tracking-wider">
                    Atenção
                  </span>
                )}
                {diagnostic.trend?.status === 'stable' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] bg-muted text-muted-foreground border border-border uppercase tracking-wider">
                    Estável
                  </span>
                )}
              </div>

              {diagnostic.trend?.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {sanitizeMojibake(diagnostic.trend.description)}
                </p>
              )}

              {/* Lista de Pareceres Técnicos (Minimalista com Linha Lateral Accent) */}
              <div className="space-y-2.5 pt-1">
                
                {/* 🔴 Ponto Crítico */}
                {diagnostic.critical_point && (
                  <div className="p-3.5 rounded-[5px] border border-border border-l-[3px] border-l-red-500 bg-card space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        {sanitizeMojibake(diagnostic.critical_point.title || 'Ponto Crítico')}
                      </span>
                      {Array.isArray(diagnostic.critical_point.topics) && diagnostic.critical_point.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {diagnostic.critical_point.topics.map((t, i) => (
                            <span key={i} className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-[3px] bg-red-500/10 text-red-600">
                              {sanitizeMojibake(String(t))}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sanitizeMojibake(diagnostic.critical_point.description)}
                    </p>
                  </div>
                )}

                {/* 🟢 Ponto Positivo */}
                {diagnostic.positive_point && (
                  <div className="p-3.5 rounded-[5px] border border-border border-l-[3px] border-l-emerald-500 bg-card space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        {sanitizeMojibake(diagnostic.positive_point.title || 'Ponto Forte')}
                      </span>
                      {Array.isArray(diagnostic.positive_point.topics) && diagnostic.positive_point.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {diagnostic.positive_point.topics.map((t, i) => (
                            <span key={i} className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-[3px] bg-emerald-500/10 text-emerald-600">
                              {sanitizeMojibake(String(t))}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sanitizeMojibake(diagnostic.positive_point.description)}
                    </p>
                  </div>
                )}

                {/* 🟡 Recomendação de Estudo */}
                {diagnostic.recommendation && (
                  <div className="p-3.5 rounded-[5px] border border-border border-l-[3px] border-l-amber-500 bg-card space-y-2.5">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                      {sanitizeMojibake(diagnostic.recommendation.title || 'Recomendação')}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sanitizeMojibake(diagnostic.recommendation.description)}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => { onClose(); navigate('/simulados'); }}
                      className="w-full h-8 text-xs font-bold rounded-[5px] bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Ir para Simulado Recomendado
                    </Button>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}