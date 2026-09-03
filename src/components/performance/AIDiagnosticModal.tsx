import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Brain, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Minus,
  Clock, ArrowRight, Loader2, RefreshCw, Calendar, Target, Shield, BookOpen, AlertCircle,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

// Accordion colapsÃ¡vel para mobile
function DiagnosticCard({
  emoji, title, description, topics, badge, borderClass, bgClass, tagClass, footer,
}: {
  emoji: string; title: string; description: string; topics?: string[];
  badge?: React.ReactNode; borderClass: string; bgClass: string; tagClass: string;
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-[5px] border-l-4 border border-border ${borderClass} ${bgClass} overflow-hidden`}>
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left gap-2"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm shrink-0">{emoji}</span>
          <span className="font-bold text-sm text-foreground truncate">{title}</span>
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
            <div className="px-4 pb-4 space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              {topics && topics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {topics.map((t, i) => (
                    <Badge key={i} variant="outline" className={`text-[10px] font-semibold rounded-[5px] ${tagClass}`}>{t}</Badge>
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
        setDiagnostic(JSON.parse(savedData));
        setLastGeneratedAt(Number(savedTime));
      }
    } catch (e) {
      console.warn('Erro ao carregar cache do diagnÃ³stico:', e);
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
    if (!hasMinExams) { toast.error('Realize pelo menos 3 simulados para gerar o diagnÃ³stico.'); return; }
    if (!hasMinAccountAge) { toast.error('VocÃª precisa de pelo menos 7 dias de cadastro na plataforma.'); return; }
    if (filteredResults.length === 0) { toast.error('Nenhum simulado no perÃ­odo selecionado. Tente "HistÃ³rico".'); return; }

    setIsGenerating(true);
    toast.info('Mike analisando seu histÃ³rico de simulados...');

    try {
      const simplifiedResults = filteredResults.map((r) => {
        const exam = safeExams.find((e) => e?.id === r?.exam_id);
        const sub = safeSubcategories.find((s) => s?.id === exam?.subcategory_id);
        return {
          score: Number(r?.score) || 0, correct: Number(r?.correct_answers) || 0,
          total: Number(r?.total_questions) || 0, date: r?.completed_at || new Date().toISOString(),
          exam_title: exam?.title || 'Simulado ANAC', category: sub?.name || 'Geral',
        };
      });

      const { data, error } = await supabase.functions.invoke('performance-ai-diagnostic', {
        body: { period: selectedPeriod, examResults: simplifiedResults },
      });

      if (error) throw error;
      if (!data?.diagnostic) throw new Error('O Mike nÃ£o retornou os dados.');

      setDiagnostic(data.diagnostic);
      const ts = Date.now();
      setLastGeneratedAt(ts);
      localStorage.setItem('voecerto_ai_diagnostic_data', JSON.stringify(data.diagnostic));
      localStorage.setItem('voecerto_ai_diagnostic_timestamp', ts.toString());
      toast.success('DiagnÃ³stico do Mike gerado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao gerar diagnÃ³stico:', err);
      toast.error('O Mike nÃ£o conseguiu analisar seu histÃ³rico. Tente novamente em instantes!');
    } finally {
      setIsGenerating(false);
    }
  };

  const PERIODS = [
    { value: '7d' as const, label: 'Ãšltimos 7 dias' },
    { value: '30d' as const, label: 'Ãšltimos 30 dias' },
    { value: 'all' as const, label: 'HistÃ³rico' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto p-0 rounded-[5px] border-border bg-card">

        {/* Banner do Mike */}
        <div className="bg-primary text-primary-foreground px-5 py-4 flex items-center gap-3 border-b border-primary/20 shrink-0">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-[5px] overflow-hidden border-2 border-amber-400 shadow-md">
              <img
                src="/images/avatars/mike_character_analytic.png"
                alt="Mike"
                width={44} height={44}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5 border-2 border-primary">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle className="text-base font-black text-primary-foreground leading-tight">
                DiagnÃ³stico com Mike
              </DialogTitle>
              <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-300 bg-amber-400/10 rounded-[5px] shrink-0">
                IA
              </Badge>
            </div>
            <DialogDescription className="text-xs text-primary-foreground/70 mt-0.5 leading-snug">
              AnÃ¡lise personalizada do seu histÃ³rico de simulados.
            </DialogDescription>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-5 space-y-4">

          {/* Aviso de requisito â€” aparece SÃ“ se nÃ£o atingido */}
          {showWarning && (
            <div className="flex items-start gap-2.5 p-3 rounded-[5px] bg-amber-500/8 border border-amber-500/25">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                {!hasMinExams && !hasMinAccountAge
                  ? `Para ativar o diagnÃ³stico, realize pelo menos 3 simulados e aguarde 7 dias de cadastro.`
                  : !hasMinExams
                  ? `VocÃª realizou ${totalCompletedExams} de 3 simulados necessÃ¡rios para o diagnÃ³stico.`
                  : `Aguarde pelo menos 7 dias de cadastro para ativar o diagnÃ³stico.`}
              </p>
            </div>
          )}

          {/* Aviso de cooldown ativo */}
          {isCooldownActive && diagnostic && (
            <div className="flex items-start gap-2.5 p-3 rounded-[5px] bg-amber-500/8 border border-amber-500/25">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  PrÃ³xima anÃ¡lise disponÃ­vel em {remainingHours}h {remainingMinutes}min
                </p>
                <p className="text-xs text-amber-700/70 dark:text-amber-300/70 mt-0.5 leading-relaxed">
                  O intervalo de 24h garante tempo para absorver as recomendaÃ§Ãµes antes de uma nova anÃ¡lise.
                </p>
              </div>
            </div>
          )}

          {/* Toggle de perÃ­odo â€” segmentado */}
          <div>
            <p className="text-xs font-bold text-foreground mb-2">PerÃ­odo de anÃ¡lise</p>
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-[5px] border border-border">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  disabled={isCooldownActive}
                  onClick={() => setSelectedPeriod(p.value)}
                  className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-[5px] transition-all truncate
                    ${selectedPeriod === p.value
                      ? 'bg-[#0f172a] text-white shadow-sm'
                      : isCooldownActive
                      ? 'text-muted-foreground/40 cursor-not-allowed'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* BotÃ£o de solicitar */}
          <Button
            onClick={handleGenerateDiagnostic}
            disabled={!canRequest}
            className={`w-full h-11 text-sm font-bold gap-2 rounded-[5px] ${
              canRequest
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-70'
            }`}
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Mike analisando...</>
            ) : isCooldownActive ? (
              <><Clock className="w-4 h-4 text-amber-500" /> Nova anÃ¡lise em {remainingHours}h {remainingMinutes}min</>
            ) : (
              <><Sparkles className="w-4 h-4 text-amber-400" /> Solicitar DiagnÃ³stico com Mike</>
            )}
          </Button>

          {/* Resultado */}
          {diagnostic && (
            <div className="space-y-3 pt-1 border-t border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide pt-2">
                Seu diagnÃ³stico atual
              </p>

              {/* Mobile: accordion */}
              <div className="space-y-2 md:hidden">
                <DiagnosticCard
                  emoji="ðŸ”´" title={diagnostic.critical_point?.title || 'Ponto CrÃ­tico'}
                  description={diagnostic.critical_point?.description || ''} topics={diagnostic.critical_point?.topics}
                  borderClass="border-l-destructive" bgClass="bg-destructive/5" tagClass="border-destructive/30 text-destructive"
                />
                <DiagnosticCard
                  emoji="ðŸŸ¢" title={diagnostic.positive_point?.title || 'Ponto Positivo'}
                  description={diagnostic.positive_point?.description || ''} topics={diagnostic.positive_point?.topics}
                  borderClass="border-l-success" bgClass="bg-success/5" tagClass="border-success/30 text-success"
                />
                <DiagnosticCard
                  emoji="ðŸ”µ" title={diagnostic.trend?.title || 'TendÃªncia'}
                  description={diagnostic.trend?.description || ''}
                  badge={
                    diagnostic.trend?.status === 'improving'
                      ? <Badge className="bg-success text-success-foreground text-[10px] gap-1 rounded-[5px] ml-1"><TrendingUp className="w-3 h-3" />Evoluindo</Badge>
                      : diagnostic.trend?.status === 'declining'
                      ? <Badge variant="destructive" className="text-[10px] gap-1 rounded-[5px] ml-1"><TrendingDown className="w-3 h-3" />AtenÃ§Ã£o</Badge>
                      : undefined
                  }
                  borderClass="border-l-primary" bgClass="bg-primary/5" tagClass="border-primary/30 text-primary"
                />
                <DiagnosticCard
                  emoji="ðŸŸ¡" title={diagnostic.recommendation?.title || 'RecomendaÃ§Ã£o'}
                  description={diagnostic.recommendation?.description || ''}
                  borderClass="border-l-accent" bgClass="bg-accent/10" tagClass="border-accent/30"
                  footer={
                    <Button size="sm" onClick={() => { onClose(); navigate('/simulados'); }}
                      className="gap-2 font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-[5px] w-full">
                      Ir para Simulado Recomendado <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  }
                />
              </div>

              {/* Desktop: grid 2Ã—2 */}
              <div className="hidden md:grid md:grid-cols-2 gap-3">
                <Card className="border-l-4 border-l-destructive border-border bg-destructive/5 rounded-[5px]">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2"><span>ðŸ”´</span><h4 className="font-bold text-sm">{diagnostic.critical_point?.title}</h4></div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{diagnostic.critical_point?.description}</p>
                    {diagnostic.critical_point?.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1">{diagnostic.critical_point.topics.map((t, i) => <Badge key={i} variant="destructive" className="text-[10px] rounded-[5px]">{t}</Badge>)}</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-success border-border bg-success/5 rounded-[5px]">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2"><span>ðŸŸ¢</span><h4 className="font-bold text-sm">{diagnostic.positive_point?.title}</h4></div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{diagnostic.positive_point?.description}</p>
                    {diagnostic.positive_point?.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1">{diagnostic.positive_point.topics.map((t, i) => <Badge key={i} className="bg-success text-success-foreground text-[10px] rounded-[5px]">{t}</Badge>)}</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary border-border bg-primary/5 rounded-[5px]">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>ðŸ”µ</span><h4 className="font-bold text-sm">{diagnostic.trend?.title}</h4>
                      {diagnostic.trend?.status === 'improving' && <Badge className="bg-success text-success-foreground text-[10px] gap-1 rounded-[5px]"><TrendingUp className="w-3 h-3" />Em evoluÃ§Ã£o</Badge>}
                      {diagnostic.trend?.status === 'declining' && <Badge variant="destructive" className="text-[10px] gap-1 rounded-[5px]"><TrendingDown className="w-3 h-3" />Precisa atenÃ§Ã£o</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{diagnostic.trend?.description}</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-accent border-border bg-accent/10 rounded-[5px]">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2"><span>ðŸŸ¡</span><h4 className="font-bold text-sm">{diagnostic.recommendation?.title}</h4></div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{diagnostic.recommendation?.description}</p>
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => { onClose(); navigate('/simulados'); }}
                        className="gap-2 font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-[5px]">
                        Ir para Simulado Recomendado <ArrowRight className="w-3.5 h-3.5" />
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