import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Send, Sparkles, Loader2, CheckCircle2, ShieldCheck, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CurriculumChatAssistantProps {
  onCurriculumGenerated: (curriculum: any) => void;
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
    question: 'Para começar, qual é o seu nome completo, telefone para contato e a cidade/estado onde reside?',
    placeholder: 'Ex: Ana Silva, (11) 98888-7777, São Paulo - SP',
    quickOptions: [],
  },
  {
    step: 1,
    title: 'Cargo & Área',
    question: 'Qual é a sua área de atuação e o cargo pretendido na aviação?',
    placeholder: 'Ex: Comissário(a) de Voo, Piloto Privado / Comercial, Agente de Aeroporto...',
    quickOptions: ['Comissário(a) de Voo', 'Piloto Privado / Comercial', 'Agente de Aeroporto / Atendimento', 'Mecânico de Manutenção'],
  },
  {
    step: 2,
    title: 'Finalidade do Currículo',
    question: 'Qual será o principal canal de envio desse currículo (plataformas online como Gupy/LinkedIn, e-mail em PDF ou impresso)?',
    placeholder: 'Ex: Pretendo aplicar na Gupy e enviar por e-mail...',
    quickOptions: ['Plataformas Online (Gupy, Catho, LinkedIn)', 'Envio por E-mail em PDF', 'Entrega Pessoal Impressa'],
  },
  {
    step: 3,
    title: 'Formação Acadêmica',
    question: 'Qual é o seu nível de escolaridade e formações concluídas ou em andamento?',
    placeholder: 'Ex: Ensino Médio Completo (2021) e Ciências Aeronáuticas (Cursando)',
    quickOptions: ['Ensino Médio Completo', 'Superior em Aviação Civil / Ciências Aeronáuticas', 'Curso Homologado ANAC', 'Ensino Superior em Andamento'],
  },
  {
    step: 4,
    title: 'Experiência Profissional',
    question: 'Conte-me sobre suas experiências de trabalho anteriores (empresas, funções e principais atividades desempenhadas).',
    placeholder: 'Ex: 2 anos como atendente ao cliente e 1 ano em recepção hospitalar...',
    quickOptions: ['Primeiro emprego (sem experiência formal)', 'Atendimento ao Cliente / Vendas', 'Experiência anterior na Aviação'],
  },
  {
    step: 5,
    title: 'Cursos & Idiomas',
    question: 'Possui certificações (ex: CCT/CMS ANAC, Primeiros Socorros) ou idiomas (Inglês, Espanhol)?',
    placeholder: 'Ex: CCT ANAC aprovado, Curso de Comissário, Inglês Intermediário e Espanhol Básico',
    quickOptions: ['Banca ANAC Aprovada (CCT/CMS)', 'Inglês Intermediário / Avançado', 'Primeiros Socorros / Sobrevivência na Selva', 'Espanhol Básico'],
  },
  {
    step: 6,
    title: 'Objetivo & Diferenciais',
    question: 'Para concluir, qual é o seu objetivo profissional e quais pontos fortes você gostaria de destacar?',
    placeholder: 'Ex: Atuar como comissário aplicando foco em segurança operacional e excelência no atendimento...',
    quickOptions: ['Foco em Segurança e Atendimento VIP', 'Disponibilidade para viagens e mudança', 'Foco em crescimento na aviação civil'],
  },
];

export function CurriculumChatAssistant({ onCurriculumGenerated, userEmail, userName }: CurriculumChatAssistantProps) {
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

  return (
    <Card className="border-border/80 bg-card shadow-md rounded-[5px] overflow-hidden max-w-4xl mx-auto flex flex-col my-2">
      {/* ── HEADER ESCURO DO MIKE ── */}
      <div className="bg-[#0f172a] text-white p-4 sm:p-5 rounded-t-[5px] flex items-center justify-between shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[5px] overflow-hidden shrink-0 border-2 border-amber-400/80 shadow-sm bg-slate-900">
              <img
                src="/images/avatars/mike_character_curiculum.png"
                alt="Mike - Assistente de Carreira"
                className="w-full h-full object-cover block"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-[5px] p-0.5 border border-slate-900">
              <Sparkles className="w-3 h-3 text-slate-950" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                Mike
              </h3>
              <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-300 bg-amber-400/10 rounded-[5px] px-2 py-0.5 font-bold uppercase tracking-wider">
                Assistente de Carreira
              </Badge>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1 leading-snug truncate">
              Seu assistente para estruturação e otimização de currículos
            </p>
          </div>
        </div>

        {/* Contador e Destaque dos Passos */}
        <div className="text-right shrink-0 ml-3 flex flex-col items-end">
          <span className="text-xs font-bold text-amber-300 font-mono tracking-wide">
            Passo {currentStep + 1} de {QUESTIONS.length}
          </span>
          <div className="flex items-center gap-1 mt-1.5">
            {QUESTIONS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 sm:h-2 rounded-[5px] transition-all duration-300 ${
                  idx <= currentStep ? 'w-4 sm:w-6 bg-amber-400' : 'w-2 sm:w-3 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── CARD DE ORIENTAÇÃO (MINIMALISTA) ── */}
      <div className="bg-sky-50 dark:bg-sky-950/40 border-b border-sky-200/60 dark:border-sky-900/60 px-4 py-3 sm:px-5 sm:py-3 flex items-start gap-3 text-xs sm:text-sm text-sky-950 dark:text-sky-200 shrink-0">
        <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-amber-500 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold text-sky-900 dark:text-sky-100">Criação inteligente com IA:</strong>{' '}
          <span className="hidden sm:inline">Mike organiza suas informações no padrão exigido pelo setor aéreo, aplicando verbos de ação e sugerindo a melhor formatação para sua vaga.</span>
          <span className="sm:hidden">Mike estrutura e formata seu currículo no padrão exigido pela aviação.</span>
        </p>
      </div>

      {/* ── ÁREA DE CHAT / CONVERSA ── */}
      <CardContent 
        ref={chatContainerRef} 
        className="p-4 sm:p-6 space-y-4 max-h-[360px] sm:max-h-[460px] min-h-[250px] overflow-y-auto scroll-smooth scrollbar-thin flex-1 bg-card"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-[5px] overflow-hidden shrink-0 border border-primary/30 mt-1 shadow-sm bg-slate-900">
                  <img
                    src="/images/avatars/mike_character_curiculum.png"
                    alt="Mike"
                    className="w-full h-full object-cover block"
                  />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] p-3.5 sm:p-4 rounded-[5px] text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm border ${
                  msg.sender === 'user'
                    ? 'bg-[#0f172a] text-white border-slate-800 font-medium'
                    : 'bg-card text-foreground border-border/80'
                }`}
              >
                <div>{renderFormattedText(msg.text)}</div>
                <span className={`text-[10px] font-mono text-right block mt-1.5 ${
                  msg.sender === 'user' ? 'text-slate-400' : 'text-muted-foreground/60'
                }`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-[5px] bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4 rounded-[5px] bg-primary/5 border border-primary/20 text-primary text-xs sm:text-sm font-bold shadow-sm"
          >
            <Loader2 className="w-5 h-5 animate-spin shrink-0 text-primary" />
            <span>Mike analisando suas respostas, aprimorando a estrutura e gerando seu currículo...</span>
          </motion.div>
        )}
      </CardContent>

      {/* ── ÁREA DE INPUT E RESPOSTAS RÁPIDAS ── */}
      <div className="p-4 sm:p-5 border-t border-border/80 bg-muted/20 space-y-3 shrink-0">
        {/* Chips de Respostas Rápidas */}
        {!isGenerating && activeQuestion?.quickOptions && activeQuestion.quickOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-1">
            <span className="text-[11px] font-bold text-muted-foreground w-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Sugestões de resposta rápida:
            </span>
            {activeQuestion.quickOptions.map((opt, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors py-1.5 px-3 rounded-[5px] text-xs font-semibold border-border"
                onClick={() => handleSendAnswer(opt)}
              >
                {opt}
              </Badge>
            ))}
          </div>
        )}

        {/* Input & Botão Enviar */}
        {!isGenerating && (
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <Input
                placeholder={activeQuestion?.placeholder || 'Digite sua resposta aqui...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendAnswer();
                  }
                }}
                className="flex-1 font-medium text-xs sm:text-sm bg-card border-border h-11 rounded-[5px] shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
              />

              <Button
                onClick={() => handleSendAnswer()}
                disabled={isGenerating || (!inputText.trim() && currentStep === 0)}
                className="h-11 px-5 rounded-[5px] font-bold text-xs sm:text-sm bg-[#0f172a] text-white hover:bg-slate-900 gap-2 shrink-0 shadow-sm"
              >
                {currentStep === QUESTIONS.length - 1 ? (
                  <>Gerar <Sparkles className="w-4 h-4 text-amber-400" /></>
                ) : (
                  <>Enviar <Send className="w-4 h-4" /></>
                )}
              </Button>
            </div>

            <div className="flex flex-wrap justify-between items-center text-[10px] sm:text-xs text-muted-foreground font-medium px-1 gap-2">
              <span className="truncate max-w-[260px] sm:max-w-none">
                {activeQuestion?.placeholder ? `Ex: ${activeQuestion.placeholder.split(',')[0]}...` : ''}
              </span>
              <div className="flex items-center gap-3 ml-auto">
                {currentStep > 0 && currentStep < QUESTIONS.length - 1 && (
                  <button
                    onClick={() => handleSendAnswer('Não se aplica / Pular')}
                    className="text-muted-foreground hover:text-foreground underline transition-colors"
                  >
                    Pular passo
                  </button>
                )}
                <span className="hidden sm:inline text-muted-foreground/70">Pressione Enter para enviar</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER DE DIFERENCIAIS ── */}
      <div className="border-t border-border/80 bg-muted/40 p-4 sm:p-5 rounded-b-[5px]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
          
          <div className="flex items-center sm:items-start gap-3">
            <div className="w-8 h-8 rounded-[5px] bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Privacidade garantida</h4>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                Seus dados estão seguros e protegidos.
              </p>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-3">
            <div className="w-8 h-8 rounded-[5px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">IA especializada</h4>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                Focada em aviação civil e mercado de trabalho.
              </p>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-3">
            <div className="w-8 h-8 rounded-[5px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Resultados rápidos</h4>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                Currículo pronto e formatado para download em PDF.
              </p>
            </div>
          </div>

        </div>
      </div>
    </Card>
  );
}
