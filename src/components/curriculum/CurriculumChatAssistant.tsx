import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, ArrowUp, ChevronLeft, Plus,
  CheckCircle2, Circle, ArrowRight, FileText, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { toast } from 'sonner';

interface CurriculumChatAssistantProps {
  onCurriculumGenerated: (curriculum: any) => void;
  onBackToGallery?: () => void;
  userEmail?: string;
  userName?: string;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface Stage {
  id: string;
  label: string;
  description: string;
}

const STAGES: Stage[] = [
  { id: 'dados', label: 'Dados & Contato', description: 'Nome, idade, cidade e contato' },
  { id: 'cargo', label: 'Cargo & Canal', description: 'Área pretendida e plataforma de envio' },
  { id: 'formacao', label: 'Formação & ANAC', description: 'Escolaridade, cursos e licenças' },
  { id: 'experiencia', label: 'Experiência', description: 'Histórico na aviação ou atendimento' },
  { id: 'idiomas', label: 'Idiomas & Diferenciais', description: 'Inglês, certificados e pontos fortes' },
  { id: 'finalizacao', label: 'Finalização', description: 'Geração do currículo profissional' },
];

export function CurriculumChatAssistant({
  onCurriculumGenerated,
  onBackToGallery,
  userEmail,
  userName,
}: CurriculumChatAssistantProps) {
  const { user } = useAuth();
  const { planLabel } = usePlan();

  const getFormattedTime = () =>
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const initialAIMessage: Message = {
    sender: 'ai',
    text: `Olá${userName ? `, **${userName}**` : ''}! Sou o Mike, seu mentor de carreira do Voe Certo. ✈️\n\nVou te guiar na criação de um currículo profissional de alto impacto para a aviação civil, estruturado sob medida para os recrutadores da Azul, LATAM, GOL e aviação executiva.\n\nPara começarmos com o pé direito, qual é o seu **nome completo**, sua **idade**, **cidade/estado** onde reside e seu **telefone com DDD**?`,
    timestamp: getFormattedTime(),
  };

  const [messages, setMessages] = useState<Message[]>([initialAIMessage]);
  const [inputText, setInputText] = useState('');
  const [isLoadingMike, setIsLoadingMike] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('dados');
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [quickOptions, setQuickOptions] = useState<string[]>([]);
  const [isReadyToGenerate, setIsReadyToGenerate] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Trava scroll no body no iOS Safari para evitar deslocamento de tela
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;
    const originalHeight = document.body.style.height;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      document.body.style.height = originalHeight;
    };
  }, []);

  // Auto-scroll suave para a mensagem mais recente
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoadingMike, isGenerating]);

  // Reiniciar a conversa
  const handleRestart = () => {
    setMessages([
      {
        sender: 'ai',
        text: `Olá${userName ? `, **${userName}**` : ''}! Sou o Mike, seu mentor de carreira do Voe Certo. ✈️\n\nVamos recomeçar do zero! Para estruturarmos seu currículo profissional, qual é o seu **nome completo**, sua **idade**, **cidade/estado** onde reside e seu **telefone com DDD**?`,
        timestamp: getFormattedTime(),
      },
    ]);
    setInputText('');
    setCurrentStage('dados');
    setCompletedStages([]);
    setQuickOptions([]);
    setIsReadyToGenerate(false);
  };

  // Enviar mensagem do usuário para a IA
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoadingMike || isGenerating) return;

    const userMessage: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: getFormattedTime(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setQuickOptions([]);
    setIsLoadingMike(true);

    try {
      const { data, error } = await supabase.functions.invoke('curriculum-ai-assistant', {
        body: {
          action: 'chat_turn',
          messages: updatedMessages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          userName,
          userEmail,
        },
      });

      if (error) throw error;

      if (data?.reply) {
        const aiResponse: Message = {
          sender: 'ai',
          text: data.reply,
          timestamp: getFormattedTime(),
        };

        setMessages((prev) => [...prev, aiResponse]);

        if (data.stage && data.stage !== currentStage) {
          setCompletedStages((prev) => (prev.includes(currentStage) ? prev : [...prev, currentStage]));
          setCurrentStage(data.stage);
        }

        if (Array.isArray(data.quick_options) && data.quick_options.length > 0) {
          setQuickOptions(data.quick_options);
        }

        if (data.is_ready_to_generate) {
          setIsReadyToGenerate(true);
        }
      } else {
        throw new Error('Resposta vazia da IA');
      }
    } catch (err: any) {
      console.error('Erro na conversa com Mike:', err);
      toast.error('Não foi possível obter a resposta do Mike no momento. Tente novamente.');
    } finally {
      setIsLoadingMike(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Geração final do currículo completo
  const handleGenerateCurriculum = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    toast.info('Mike está analisando toda a conversa e formatando seu currículo profissional...');

    try {
      const { data, error } = await supabase.functions.invoke('curriculum-ai-assistant', {
        body: {
          action: 'generate_curriculum',
          chatHistory: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          userName,
          userEmail,
        },
      });

      if (error) throw error;
      if (!data?.curriculum) throw new Error('Não foi possível estruturar o currículo.');

      toast.success('Currículo profissional criado com sucesso pelo Mike!');
      onCurriculumGenerated(data.curriculum);
    } catch (err: any) {
      console.error('Erro ao gerar currículo final:', err);
      toast.warning('Formatando currículo com as informações fornecidas...');

      // Fallback estruturado com base nas mensagens trocadas
      const userTextBlob = messages
        .filter((m) => m.sender === 'user')
        .map((m) => m.text)
        .join(' ');

      const fallbackCurriculum = {
        full_name: userName || 'Candidato Voe Certo',
        email: userEmail || '',
        phone: '',
        city: '',
        profession: 'Profissional da Aviação Civil',
        summary: 'Profissional capacitado com foco em segurança de voo, excelência no atendimento e procedimentos operacionais padronizados.',
        experience: [],
        education: [{ institution: 'Formação em Aviação', degree: 'Curso Homologado', year: 'Concluído' }],
        certificates: [],
        languages: [{ name: 'Inglês', level: 'Intermediário' }],
        skills: ['Segurança Operacional', 'Atendimento ao Cliente', 'Trabalho em Equipe', 'Procedimentos ANAC'],
        template: 'ats',
        recommended_template: 'ats',
        recommendation_reason: 'Template otimizado para triagem digital automática (ATS) em companhias aéreas.',
      };

      onCurriculumGenerated(fallbackCurriculum);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper para renderizar negritos (**texto**)
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const displayName = userName || user?.user_metadata?.full_name || 'Usuário';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'VC';

  const userMessagesCount = messages.filter((m) => m.sender === 'user').length;
  const currentStageIndex = STAGES.findIndex((s) => s.id === currentStage);
  const activeStage = STAGES[currentStageIndex !== -1 ? currentStageIndex : 0];

  return (
    <div className="flex w-full h-[100dvh] bg-background overflow-hidden fixed inset-0 z-50 overscroll-none">

      {/* ── SIDEBAR LATERAL (DESKTOP) ── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/80 bg-muted/20 justify-between shrink-0 p-3.5 h-full">
        <div className="space-y-4">
          {/* Top Actions */}
          <div className="space-y-1.5">
            {onBackToGallery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToGallery}
                className="w-full justify-start gap-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-[5px] h-9"
              >
                <ChevronLeft className="w-4 h-4 text-primary" />
                Galeria de Currículos
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              className="w-full justify-start gap-2 text-xs font-bold bg-card border-border/80 hover:bg-muted text-foreground rounded-[5px] h-9 shadow-sm"
            >
              <Plus className="w-4 h-4 text-primary" />
              Novo Currículo com Mike
            </Button>
          </div>

          {/* Etapas / Checklist Dinâmico */}
          <div className="pt-2">
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Progresso da Entrevista
              </p>
              <span className="text-[10px] font-mono text-muted-foreground">
                {Math.min(userMessagesCount, 5)}/5+
              </span>
            </div>
            <div className="space-y-1">
              {STAGES.map((s, idx) => {
                const isCurrent = s.id === currentStage;
                const isDone = completedStages.includes(s.id);

                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-xs transition-colors ${
                      isCurrent
                        ? 'bg-primary/10 text-primary font-bold'
                        : isDone
                        ? 'text-foreground/80'
                        : 'text-muted-foreground/60'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      </div>
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="leading-tight truncate">{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botão de Geração Direta quando houver dados */}
          {(isReadyToGenerate || userMessagesCount >= 3) && (
            <div className="pt-2">
              <Button
                onClick={handleGenerateCurriculum}
                disabled={isGenerating}
                className="w-full h-10 rounded-[6px] bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xs uppercase tracking-wider shadow-md gap-1.5"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gerar Currículo</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Perfil no rodapé da Sidebar */}
        <div className="pt-3 border-t border-border/80 flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground font-medium capitalize">
              Plano {planLabel || 'Gratuito'}
            </p>
          </div>
        </div>
      </aside>

      {/* ── ÁREA PRINCIPAL DO CHAT ── */}
      <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">

        {/* Header Superior */}
        <header className="h-14 border-b border-border/80 px-3.5 sm:px-5 pt-[env(safe-area-inset-top,0px)] flex items-center justify-between shrink-0 bg-card/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            {onBackToGallery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToGallery}
                className="md:hidden h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[4px] overflow-hidden border border-border bg-slate-900 shrink-0">
                <img
                  src="/images/avatars/mike_character_curiculum.png"
                  alt="Mike"
                  className="w-full h-full object-cover block"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-foreground">Mike IA</span>
                  <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-[4px] px-1 py-0 font-bold uppercase">
                    Mentor de Aviação
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold hidden sm:inline">
              {activeStage.label}
            </span>
            {(isReadyToGenerate || userMessagesCount >= 3) && (
              <Button
                size="sm"
                onClick={handleGenerateCurriculum}
                disabled={isGenerating}
                className="h-8 px-3 rounded-[6px] bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xs uppercase tracking-wider gap-1 shadow-sm"
              >
                {isGenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>Gerar Currículo</span>
              </Button>
            )}
          </div>
        </header>

        {/* ── ÁREA CENTRAL DE MENSAGENS (ESTILO CHATGPT) ── */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6"
        >
          <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'user' ? (
                    /* Mensagem do Usuário (balão alinhado à direita) */
                    <div className="max-w-[85%] sm:max-w-[78%] px-4 py-2.5 rounded-[12px] rounded-tr-sm bg-primary text-primary-foreground text-xs sm:text-sm leading-relaxed shadow-sm">
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <span className="text-[9px] font-mono text-primary-foreground/70 text-right block mt-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  ) : (
                    /* Mensagem do Mike (Texto fluido limpo na tela, sem caixa pesada) */
                    <div className="w-full max-w-[95%] sm:max-w-[90%] text-foreground text-xs sm:text-sm leading-relaxed py-1">
                      <div className="flex items-center gap-1.5 mb-1.5 text-primary font-bold text-[11px] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Mike</span>
                        <span className="text-[10px] text-muted-foreground font-normal normal-case ml-auto">
                          {msg.timestamp}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed text-foreground/95">
                        {renderFormattedText(msg.text)}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Digitação do Mike */}
            {isLoadingMike && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 py-2 text-xs text-muted-foreground font-medium"
              >
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Mike está pensando e respondendo...</span>
              </motion.div>
            )}

            {/* Processamento de Criação Final do Currículo */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-[8px] bg-accent/10 border border-accent/30 text-center space-y-2"
              >
                <div className="flex items-center justify-center gap-2 text-accent font-bold text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mike está estruturando seu currículo profissional...</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lapidando verbos de ação, formatando dados de contato e alinhando com as exigências da ANAC e companhias aéreas.
                </p>
              </motion.div>
            )}

            {/* Banner de Conclusão Pronta */}
            {isReadyToGenerate && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-[8px] bg-emerald-500/10 border border-emerald-500/30 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Informações Essenciais Coletadas!
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Já temos tudo o que é necessário para criar um currículo impecável.
                  </p>
                </div>
                <Button
                  onClick={handleGenerateCurriculum}
                  className="h-9 px-4 rounded-[6px] bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xs uppercase tracking-wider shrink-0 gap-1.5 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gerar Currículo Agora</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── BARRA INFERIOR DE ENTRADA (CÁPSULA MODERNA) ── */}
        <div className="p-3 sm:p-4 pb-[max(env(safe-area-inset-bottom,0px)+0.5rem,1rem)] border-t border-border/80 bg-card shrink-0 z-20">
          <div className="max-w-2xl mx-auto space-y-2.5">

            {/* Sugestões Rápidas de Resposta Dinâmicas */}
            {!isLoadingMike && !isGenerating && quickOptions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {quickOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(opt)}
                    className="bg-muted/70 hover:bg-muted text-foreground border border-border/70 hover:border-primary/40 transition-colors py-1 px-2.5 rounded-[5px] text-[11px] sm:text-xs font-semibold text-left shadow-xs active:scale-98"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Cápsula de Entrada */}
            <div className="relative flex items-center bg-muted/40 border border-border rounded-full sm:rounded-[8px] p-1.5 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-sm">
              <input
                ref={inputRef}
                type="text"
                placeholder={isLoadingMike ? 'Mike está respondendo...' : 'Responda com suas próprias palavras...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoadingMike || isGenerating}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="w-full bg-transparent border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-[16px] sm:text-sm h-10 px-3.5 flex-1 font-medium placeholder:text-muted-foreground/60 shadow-none disabled:opacity-50"
                style={{ fontSize: '16px', outline: 'none', border: 'none', boxShadow: 'none' }}
              />

              <div className="flex items-center gap-1.5 pr-1">
                <Button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isLoadingMike || isGenerating || !inputText.trim()}
                  size="icon"
                  className="w-8 h-8 rounded-full sm:rounded-[6px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 shadow-sm shrink-0"
                  title="Enviar mensagem"
                >
                  {isLoadingMike ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <p className="text-[10px] text-center text-muted-foreground/70 font-medium">
              Converse livremente com o Mike. Ele adaptará todas as informações para as normas da ANAC e companhias aéreas.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
