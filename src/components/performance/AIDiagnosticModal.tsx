import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Brain, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Minus,
  Clock, ArrowRight, Loader2, RefreshCw, Calendar, Target, Shield, BookOpen, AlertCircle
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
  critical_point: {
    title: string;
    description: string;
    topics: string[];
  };
  positive_point: {
    title: string;
    description: string;
    topics: string[];
  };
  trend: {
    title: string;
    description: string;
    status: 'improving' | 'stable' | 'declining';
  };
  recommendation: {
    title: string;
    description: string;
    suggested_exam_type?: string;
  };
}

export function AIDiagnosticModal({
  isOpen,
  onClose,
  examResults = [],
  subcategories = [],
  exams = [],
  userCreatedAt,
  userEmail
}: AIDiagnosticModalProps) {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'all'>('7d');
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<number | null>(null);

  // Carrega diagnóstico recente salvo no cache local
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('voecerto_ai_diagnostic_data');
      const savedTime = localStorage.getItem('voecerto_ai_diagnostic_timestamp');

      if (savedData && savedTime) {
        setDiagnostic(JSON.parse(savedData));
        setLastGeneratedAt(Number(savedTime));
      }
    } catch (e) {
      console.warn("Erro ao carregar cache do diagnóstico:", e);
    }
  }, []);

  // Safe Account Age Calculation
  let accountAgeDays = 30;
  if (userCreatedAt) {
    try {
      const d = new Date(userCreatedAt);
      if (!isNaN(d.getTime())) {
        accountAgeDays = Math.max(0, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)));
      }
    } catch {
      accountAgeDays = 30;
    }
  }

  // Safe arrays
  const safeExamResults = Array.isArray(examResults) ? examResults : [];
  const safeExams = Array.isArray(exams) ? exams : [];
  const safeSubcategories = Array.isArray(subcategories) ? subcategories : [];

  // Requisitos 1 e 2
  const totalCompletedExams = safeExamResults.length;
  const hasMinExams = totalCompletedExams >= 3;

  const isAdminUser = userEmail?.includes('admin') || userEmail?.includes('instancecom') || userEmail?.includes('kamimura');
  const hasMinAccountAge = accountAgeDays >= 7 || isAdminUser;

  // Requisito 3: Cooldown 24 Horas
  const now = Date.now();
  const hoursSinceLastDiagnostic = lastGeneratedAt ? (now - lastGeneratedAt) / (1000 * 60 * 60) : 999;
  const isCooldownActive = hoursSinceLastDiagnostic < 24;

  const remainingHours = Math.max(0, Math.floor(24 - hoursSinceLastDiagnostic));
  const remainingMinutes = Math.max(0, Math.floor((24 - hoursSinceLastDiagnostic - remainingHours) * 60));

  // Filtrar resultados pelo período selecionado de forma ultrassegura
  const getFilteredResults = () => {
    if (safeExamResults.length === 0) return [];
    if (selectedPeriod === 'all') return safeExamResults;

    const daysToSubtract = selectedPeriod === '7d' ? 7 : 30;
    const cutoffTime = Date.now() - (daysToSubtract * 24 * 60 * 60 * 1000);

    return safeExamResults.filter(r => {
      if (!r || !r.completed_at) return false;
      try {
        const completedTime = new Date(r.completed_at).getTime();
        return !isNaN(completedTime) && completedTime >= cutoffTime;
      } catch {
        return false;
      }
    });
  };

  const filteredResults = getFilteredResults();

  const handleGenerateDiagnostic = async () => {
    if (!hasMinExams) {
      toast.error('É necessário ter realizado pelo menos 3 simulados para gerar o diagnóstico.');
      return;
    }

    if (!hasMinAccountAge) {
      toast.error('É necessário ter pelo menos 7 dias de cadastro na plataforma.');
      return;
    }

    if (filteredResults.length === 0) {
      toast.error(`Nenhum simulado no período selecionado (${selectedPeriod === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias'}). Selecione 'Histórico completo'.`);
      return;
    }

    setIsGenerating(true);
    toast.info('IA Llama 3.3 70B processando seu histórico...');

    try {
      const simplifiedResults = filteredResults.map(r => {
        const exam = safeExams.find(e => e?.id === r?.exam_id);
        const sub = safeSubcategories.find(s => s?.id === exam?.subcategory_id);
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
        body: {
          period: selectedPeriod,
          examResults: simplifiedResults,
        },
      });

      if (error) throw error;
      if (!data?.diagnostic) throw new Error('Servidor não retornou a análise do diagnóstico.');

      const newDiagnostic = data.diagnostic;
      setDiagnostic(newDiagnostic);
      
      const timestamp = Date.now();
      setLastGeneratedAt(timestamp);

      localStorage.setItem('voecerto_ai_diagnostic_data', JSON.stringify(newDiagnostic));
      localStorage.setItem('voecerto_ai_diagnostic_timestamp', timestamp.toString());

      toast.success('Diagnóstico Completo de IA gerado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao gerar diagnóstico:', err);
      toast.error(`Falha na IA: ${err?.message || 'Tente novamente.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-[5px] border-border bg-card">
        {/* Top Banner */}
        <div className="bg-primary text-primary-foreground p-6 relative border-b border-primary/20">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src="/images/avatars/sofia.jpg"
                alt="Sofia - Mentora de Desempenho"
                className="w-13 h-13 rounded-full object-cover border-2 border-amber-400 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-primary">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-primary-foreground flex items-center gap-2">
                Diagnóstico de Desempenho com Sofia
                <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-300 bg-amber-400/10 rounded-[5px]">
                  Mentora IA
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-primary-foreground/80 font-medium mt-1">
                Sofia analisa o seu histórico de simulados e indica exatamente onde focar seus estudos para evoluir.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status dos Requisitos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`p-3.5 rounded-[5px] border flex items-center gap-3 text-xs font-semibold ${
              hasMinExams ? 'bg-success/10 border-success/30 text-success' : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}>
              {hasMinExams ? <CheckCircle2 className="w-5 h-5 shrink-0 text-success" /> : <AlertCircle className="w-5 h-5 shrink-0 text-destructive" />}
              <div>
                <p className="font-bold">{totalCompletedExams} / 3 Simulados Realizados</p>
                <p className="text-[11px] opacity-80">{hasMinExams ? 'Requisito atingido!' : 'Realize pelo menos 3 simulados.'}</p>
              </div>
            </div>

            <div className={`p-3.5 rounded-[5px] border flex items-center gap-3 text-xs font-semibold ${
              hasMinAccountAge ? 'bg-success/10 border-success/30 text-success' : 'bg-warning/10 border-warning/30 text-warning'
            }`}>
              {hasMinAccountAge ? <CheckCircle2 className="w-5 h-5 shrink-0 text-success" /> : <Clock className="w-5 h-5 shrink-0 text-warning" />}
              <div>
                <p className="font-bold">{accountAgeDays} Dias de Cadastro</p>
                <p className="text-[11px] opacity-80">{hasMinAccountAge ? 'Requisito atingido!' : 'Mínimo de 7 dias na plataforma.'}</p>
              </div>
            </div>
          </div>

          {/* Escolha do Período */}
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">
              Escolha o período para a análise de Sofia:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={selectedPeriod === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('7d')}
                className="font-bold text-xs gap-1.5 h-10 rounded-[5px]"
              >
                <Calendar className="w-4 h-4" /> Últimos 7 dias
              </Button>
              <Button
                variant={selectedPeriod === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('30d')}
                className="font-bold text-xs gap-1.5 h-10 rounded-[5px]"
              >
                <Calendar className="w-4 h-4" /> Últimos 30 dias
              </Button>
              <Button
                variant={selectedPeriod === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('all')}
                className="font-bold text-xs gap-1.5 h-10 rounded-[5px]"
              >
                <Clock className="w-4 h-4" /> Histórico completo
              </Button>
            </div>
          </div>

          {/* Cooldown de 24h */}
          {isCooldownActive && diagnostic && (
            <div className="p-4 rounded-[5px] bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-3">
              <Clock className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Próxima análise com Sofia em: {remainingHours}h {remainingMinutes}min</p>
                <p className="mt-1 leading-relaxed">
                  O intervalo de 24 horas garante tempo para você estudar os conteúdos recomendados antes de solicitar um novo diagnóstico à Sofia. Seu relatório atual está salvo abaixo para consulta!
                </p>
              </div>
            </div>
          )}

          {/* Botão de Gerar (Desabilitado durante o Cooldown) */}
          <Button
            onClick={handleGenerateDiagnostic}
            disabled={isGenerating || isCooldownActive || !hasMinExams || !hasMinAccountAge}
            className={`w-full h-12 text-sm font-bold gap-2 rounded-[5px] shadow-md ${
              isCooldownActive
                ? 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-primary to-sky-600 hover:from-primary/90 hover:to-sky-700 text-primary-foreground'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sofia analisando seu histórico...
              </>
            ) : isCooldownActive ? (
              <>
                <Clock className="w-5 h-5 text-amber-500" />
                Nova Análise de Sofia em {remainingHours}h {remainingMinutes}min
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-400" />
                Solicitar Análise de Sofia
              </>
            )}
          </Button>

          {/* Exibição das 4 Partes */}
          {diagnostic && (
            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="font-black text-base text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Seu Diagnóstico de Desempenho
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 🔴 Parte 1: Ponto Crítico */}
                <Card className="border-l-4 border-l-destructive border-border bg-destructive/5 rounded-[5px]">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔴</span>
                      <h4 className="font-bold text-sm text-foreground">{diagnostic.critical_point?.title || 'Ponto Crítico'}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {diagnostic.critical_point?.description}
                    </p>
                    {diagnostic.critical_point?.topics && diagnostic.critical_point.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {diagnostic.critical_point.topics.map((t, idx) => (
                          <Badge key={idx} variant="destructive" className="text-[10px] font-semibold rounded-[5px]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 🟢 Parte 2: Ponto Positivo */}
                <Card className="border-l-4 border-l-success border-border bg-success/5 rounded-[5px]">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🟢</span>
                      <h4 className="font-bold text-sm text-foreground">{diagnostic.positive_point?.title || 'Ponto Positivo'}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {diagnostic.positive_point?.description}
                    </p>
                    {diagnostic.positive_point?.topics && diagnostic.positive_point.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {diagnostic.positive_point.topics.map((t, idx) => (
                          <Badge key={idx} variant="default" className="bg-success text-success-foreground text-[10px] font-semibold rounded-[5px]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 🔵 Parte 3: Tendência */}
                <Card className="border-l-4 border-l-primary border-border bg-primary/5 rounded-[5px]">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔵</span>
                      <h4 className="font-bold text-sm text-foreground">{diagnostic.trend?.title || 'Tendência'}</h4>
                      {diagnostic.trend?.status === 'improving' && (
                        <Badge className="bg-success text-success-foreground text-[10px] gap-1 rounded-[5px]">
                          <TrendingUp className="w-3 h-3" /> Em evolução
                        </Badge>
                      )}
                      {diagnostic.trend?.status === 'declining' && (
                        <Badge variant="destructive" className="text-[10px] gap-1 rounded-[5px]">
                          <TrendingDown className="w-3 h-3" /> Precisa atenção
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {diagnostic.trend?.description}
                    </p>
                  </CardContent>
                </Card>

                {/* 🟡 Parte 4: Recomendação + Botão Direto */}
                <Card className="border-l-4 border-l-accent border-border bg-accent/10 md:col-span-2 rounded-[5px]">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🟡</span>
                      <h4 className="font-bold text-sm text-foreground">{diagnostic.recommendation?.title || 'Recomendação de Estudos'}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {diagnostic.recommendation?.description}
                    </p>

                    <div className="pt-2 flex justify-end">
                      <Button
                        onClick={() => {
                          onClose();
                          navigate('/simulados');
                        }}
                        className="gap-2 font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-[5px]"
                      >
                        Ir para o Simulado Recomendado
                        <ArrowRight className="w-4 h-4" />
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
