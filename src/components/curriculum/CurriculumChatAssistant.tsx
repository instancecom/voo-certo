import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Send, Sparkles, Loader2, ArrowUp, ChevronLeft, Plus,
  CheckCircle2, Circle, MessageSquare, ArrowRight, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  step?: number;
  timestamp: string;
}

const QUESTIONS = [
  {
    step: 0,
    title: 'Dados Pessoais',
    shortLabel: 'Dados e Contato',
    question: 'Para começar, qual é o seu nome completo, telefone para contato e a cidade/estado onde reside?',
    placeholder: 'Ex: Ana Silva, (11) 98888-7777, São Paulo - SP',
    quickOptions: [],
  },
  {
    step: 1,
    title: 'Cargo & Área',
    shortLabel: 'Cargo Pretendido',
    question: 'Qual é a sua área de atuação e o cargo pretendido na aviação?',
    placeholder: 'Ex: Comissário(a) de Voo, Piloto Privado / Comercial, Agente de Aeroporto...',
    quickOptions: ['Comissário(a) de Voo', 'Piloto Privado / Comercial', 'Agente de Aeroporto / Atendimento', 'Mecânico de Manutenção'],
  },
  {
    step: 2,
    title: 'Finalidade do Currículo',
    shortLabel: 'Canal de Envio',
    question: 'Qual será o principal canal de envio desse currículo (plataformas online como Gupy/LinkedIn, e-mail em PDF ou impresso)?',
    placeholder: 'Ex: Pretendo aplicar na Gupy e enviar por e-mail...',
    quickOptions: ['Plataformas Online (Gupy, Catho, LinkedIn)', 'Envio por E-mail em PDF', 'Entrega Pessoal Impressa'],
  },
  {
    step: 3,
    title: 'Formação Acadêmica',
    shortLabel: 'Escolaridade & Cursos',
    question: 'Qual é o seu nível de escolaridade e formações concluídas ou em andamento?',
    placeholder: 'Ex: Ensino Médio Completo (2021) e Ciências Aeronáuticas (Cursando)',
    quickOptions: ['Ensino Médio Completo', 'Superior em Aviação Civil / Ciências Aeronáuticas', 'Curso Homologado ANAC', 'Ensino Superior em Andamento'],
  },
  {
    step: 4,
    title: 'Experiência Profissional',
    shortLabel: 'Experiência',
    question: 'Conte-me sobre suas experiências de trabalho anteriores (empresas, funções e principais atividades desempenhadas).',
    placeholder: 'Ex: 2 anos como atendente ao cliente e 1 ano em recepção hospitalar...',
    quickOptions: ['Primeiro emprego (sem experiência formal)', 'Atendimento ao Cliente / Vendas', 'Experiência anterior na Aviação'],
  },
  {
    step: 5,
    title: 'Cursos & Idiomas',
    shortLabel: 'Certificados & Idiomas',
    question: 'Possui certificações (ex: CCT/CMS ANAC, Primeiros Socorros) ou idiomas (Inglês, Espanhol)?',
    placeholder: 'Ex: CCT ANAC aprovado, Curso de Comissário, Inglês Intermediário e Espanhol Básico',
    quickOptions: ['Banca ANAC Aprovada (CCT/CMS)', 'Inglês Intermediário / Avançado', 'Primeiros Socorros / Sobrevivência na Selva', 'Espanhol Básico'],
  },
  {
    step: 6,
    title: 'Objetivo & Diferenciais',
    shortLabel: 'Objetivo Final',
    question: 'Para concluir, qual é o seu objetivo profissional e quais pontos fortes você gostaria de destacar?',
    placeholder: 'Ex: Atuar como comissário aplicando foco em segurança operacional e excelência no atendimento...',
    quickOptions: ['Foco em Segurança e Atendimento VIP', 'Disponibilidade para viagens e mudança', 'Foco em crescimento na aviação civil'],
  },
];

export function CurriculumChatAssistant({
  onCurriculumGenerated,
  onBackToGallery,
  userEmail,
  userName
}: CurriculumChatAssistantProps) {
  const { user } = useAuth();
  const { planLabel } = usePlan();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    q0: userName ? `${userName}, ${userEmail || ''}` : '',
  });
  const [inputText, setInputText] = useState('');

  const getFormattedTime = () =>
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Olá! Sou o Mike, seu assistente de carreira do Voe Certo. ✈️\n\nVamos estruturar o seu currículo profissional de alto impacto?\n\n💡 **Dica:** Pode responder com suas próprias palavras — organizarei cada informação na estrutura correta, refinando verbos de ação e aplicando o layout ideal para processos seletivos.`,
      step: -1,
      timestamp: getFormattedTime(),
    },
    {
      sender: 'ai',
      text: QUESTIONS[0].question,
      step: 0,
      timestamp: getFormattedTime(),
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll automático suave para a última mensagem
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const activeQuestion = QUESTIONS[currentStep];
  const userMessagesCount = messages.filter(m => m.sender === 'user').length;
  const isInitialState = userMessagesCount === 0 && currentStep === 0;

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({ q0: userName ? `${userName}, ${userEmail || ''}` : '' });
    setInputText('');
    setMessages([
      {
        sender: 'ai',
        text: `Olá! Sou o Mike, seu assistente de carreira do Voe Certo. ✈️\n\nVamos estruturar o seu currículo profissional de alto impacto?\n\n💡 **Dica:** Pode responder com suas próprias palavras — organizarei cada informação na estrutura correta, refinando verbos de ação e aplicando o layout ideal para processos seletivos.`,
        step: -1,
        timestamp: getFormattedTime(),
      },
      {
        sender: 'ai',
        text: QUESTIONS[0].question,
        step: 0,
        timestamp: getFormattedTime(),
      },
    ]);
  };

  const handleSendAnswer = async (textToSend?: string) => {
    const finalAnswer = (textToSend || inputText).trim();
    if (!finalAnswer && currentStep === 0) {
      toast.error('Por favor, informe seu nome e contato para continuar.');
      return;
    }

    const updatedAnswers = {
      ...answers,
      [`q${currentStep}`]: finalAnswer || 'Não informado',
    };
    setAnswers(updatedAnswers);

    const now = getFormattedTime();

    // Adiciona mensagem do usuário
    const newMessages: Message[] = [
      ...messages,
      { sender: 'user', text: finalAnswer || '(Passo pulado)', timestamp: now },
    ];

    setInputText('');

    if (currentStep < QUESTIONS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      newMessages.push({
        sender: 'ai',
        text: QUESTIONS[nextStep].question,
        step: nextStep,
        timestamp: getFormattedTime(),
      });
      setMessages(newMessages);
    } else {
      // Passo final atingido -> Gerar currículo com IA!
      setMessages(newMessages);
      await generateFinalCurriculum(updatedAnswers);
    }
  };

  const generateFinalCurriculum = async (finalAnswers: Record<string, string>) => {
    setIsGenerating(true);
    toast.info('Mike analisando e formatando seu currículo profissional...');

    try {
      const { data, error } = await supabase.functions.invoke('curriculum-ai-assistant', {
        body: {
          action: 'generate_curriculum',
          answers: finalAnswers,
        },
      });

      if (error) throw error;
      if (!data?.curriculum) throw new Error('Não foi possível gerar a estrutura do currículo.');

      toast.success('Currículo profissional criado com sucesso por Mike!');
      onCurriculumGenerated(data.curriculum);
    } catch (err: any) {
      console.error('Erro ao gerar currículo com IA:', err);
      toast.warning('Mike formatando currículo com base nas respostas enviadas...');

      const fallbackCurriculum = {
        full_name: finalAnswers.q0?.split(',')[0]?.trim() || userName || 'Candidato Voe Certo',
        email: userEmail || '',
        phone: '',
        city: finalAnswers.q0?.split(',')[1]?.trim() || '',
        profession: finalAnswers.q1 || 'Profissional da Aviação Civil',
        summary: finalAnswers.q6 || 'Profissional dedicado, com foco em segurança operacional, excelência no atendimento e constante aprimoramento na aviação.',
        experience: finalAnswers.q4 && finalAnswers.q4 !== '(Passo pulado)' 
          ? [{ company: 'Experiência Profissional', role: finalAnswers.q1 || 'Cargo', start: 'Anterior', end: 'Atual', description: finalAnswers.q4 }] 
          : [],
        education: finalAnswers.q3 && finalAnswers.q3 !== '(Passo pulado)' 
          ? [{ institution: 'Instituição de Ensino', degree: finalAnswers.q3, year: 'Concluído' }] 
          : [],
        certificates: finalAnswers.q5 && finalAnswers.q5 !== '(Passo pulado)' 
          ? [{ name: finalAnswers.q5, issuer: 'ANAC / Escola de Aviação', year: 'Vigente' }] 
          : [],
        languages: [],
        skills: ['Segurança Operacional', 'Atendimento ao Cliente', 'Trabalho em Equipe'],
        template: 'ats',
        recommended_template: 'ats',
        recommendation_reason: 'Modelo digital ATS selecionado para triagem automática.',
      };

      toast.success('Currículo estruturado com sucesso!');
      onCurriculumGenerated(fallbackCurriculum);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper para renderizar negritos (**texto**) no formato visual da conversa
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
  const displayEmail = userEmail || user?.email || '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('') || 'VC';

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">

      {/* ── SIDEBAR LATERAL (DESKTOP ESTILO CHATGPT) ── */}
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

          {/* Etapas / Checklist do Assistente */}
          <div className="pt-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">
              Etapas da Criação
            </p>
            <div className="space-y-1">
              {QUESTIONS.map((q, idx) => {
                const isDone = idx < currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div
                    key={q.step}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-[5px] text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'bg-primary/10 text-primary font-bold'
                        : isDone
                        ? 'text-foreground/80'
                        : 'text-muted-foreground/60'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className="truncate">{q.shortLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
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
        
        {/* Header Superior (Mobile & Minimal Desktop Topbar) */}
        <header className="h-12 border-b border-border/80 px-3.5 sm:px-5 flex items-center justify-between shrink-0 bg-card/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
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
              <span className="font-bold text-sm text-foreground">Mike IA</span>
              <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-[4px] px-1 py-0 font-bold uppercase">
                Assistente
              </Badge>
            </div>
          </div>

          {/* Indicador de Passo */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <span>Passo {currentStep + 1} de {QUESTIONS.length}</span>
          </div>
        </header>

        {/* ── ÁREA CENTRAL DE MENSAGENS / HERO INICIAL ── */}
        <div 
          ref={chatContainerRef} 
          className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6"
        >
          {isInitialState ? (
            /* ── TELA INICIAL (ESTILO HERO DO CHATGPT) ── */
            <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center px-4 -mt-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 w-full"
              >
                {/* Título Principal */}
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  <span className="hidden sm:inline">Como posso estruturar seu currículo hoje?</span>
                  <span className="sm:hidden">Por onde começamos?</span>
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Vou guiar você passo a passo na criação de um currículo profissional de alto impacto para a aviação civil.
                </p>

                {/* Pergunta Ativa em destaque */}
                <div className="p-4 rounded-[5px] bg-muted/40 border border-border/80 text-left text-xs sm:text-sm leading-relaxed text-foreground shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5 text-primary font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Primeira etapa: {activeQuestion.title}</span>
                  </div>
                  {activeQuestion.question}
                </div>
              </motion.div>
            </div>
          ) : (
            /* ── FEED DE CONVERSA EM ANDAMENTO ── */
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 sm:gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar Mike */}
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-[4px] overflow-hidden shrink-0 border border-border mt-0.5 shadow-sm bg-slate-900">
                        <img
                          src="/images/avatars/mike_character_curiculum.png"
                          alt="Mike"
                          className="w-full h-full object-cover block"
                        />
                      </div>
                    )}

                    {/* Balão de Mensagem */}
                    <div
                      className={`max-w-[88%] sm:max-w-[80%] p-3.5 sm:p-4 rounded-[5px] text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'bg-card text-foreground border border-border/80'
                      }`}
                    >
                      <div>{renderFormattedText(msg.text)}</div>
                      <span className={`text-[10px] font-mono text-right block mt-1.5 ${
                        msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground/60'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Avatar Usuário */}
                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 rounded-[4px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5 font-bold text-[10px]">
                        {initials}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Digitação / Gerando */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 sm:gap-3.5 justify-start"
                >
                  <div className="w-7 h-7 rounded-[4px] overflow-hidden shrink-0 border border-border mt-0.5 shadow-sm bg-slate-900">
                    <img
                      src="/images/avatars/mike_character_curiculum.png"
                      alt="Mike"
                      className="w-full h-full object-cover block"
                    />
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-[5px] bg-card border border-border/80 text-foreground text-xs sm:text-sm flex items-center gap-3 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                    <span className="font-medium text-muted-foreground">Mike está estruturando o seu currículo...</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* ── BARRA INFERIOR DE ENTRADA (ESTILO CÁPSULA CHATGPT) ── */}
        <div className="p-3.5 sm:p-4 border-t border-border/80 bg-card shrink-0">
          <div className="max-w-2xl mx-auto space-y-2.5">

            {/* Chips de Resposta Rápida (quando a pergunta possui opções) */}
            {!isGenerating && activeQuestion?.quickOptions && activeQuestion.quickOptions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeQuestion.quickOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendAnswer(opt)}
                    className="bg-muted/70 hover:bg-muted text-foreground border border-border/70 hover:border-primary/40 transition-colors py-1 px-2.5 rounded-[5px] text-[11px] sm:text-xs font-semibold text-left"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Cápsula de Entrada */}
            {!isGenerating && (
              <div className="relative flex items-center bg-muted/40 border border-border rounded-full sm:rounded-[5px] p-1.5 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-sm">
                <input
                  type="text"
                  placeholder={activeQuestion?.placeholder || 'Responda aqui...'}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendAnswer();
                    }
                  }}
                  className="w-full bg-transparent border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-[16px] sm:text-sm h-10 px-3.5 flex-1 font-medium placeholder:text-muted-foreground/60 shadow-none"
                  style={{ fontSize: '16px', outline: 'none', border: 'none', boxShadow: 'none' }}
                />

                <div className="flex items-center gap-1.5 pr-1">
                  {currentStep > 0 && currentStep < QUESTIONS.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleSendAnswer('Não informado / Pular')}
                      className="text-[11px] text-muted-foreground hover:text-foreground font-semibold px-2 py-1 rounded-[5px] hover:bg-muted/80 transition-colors"
                    >
                      Pular
                    </button>
                  )}

                  <Button
                    type="button"
                    size="icon"
                    onClick={() => handleSendAnswer()}
                    disabled={isGenerating || (!inputText.trim() && currentStep === 0)}
                    className="h-9 w-9 rounded-full sm:rounded-[5px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shrink-0 disabled:opacity-40"
                    title="Enviar resposta"
                  >
                    {currentStep === QUESTIONS.length - 1 ? (
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
