import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Send, Sparkles, Loader2, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="bg-card border border-border/80 shadow-md rounded-[5px] overflow-hidden max-w-4xl mx-auto flex flex-col my-2 h-[720px] max-h-[85vh]">
      {/* ── HEADER MINIMALISTA ESTILO CHATGPT ── */}
      <div className="bg-card/95 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-3.5 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[5px] overflow-hidden border border-border bg-slate-900 shadow-sm">
              <img
                src="/images/avatars/mike_character_curiculum.png"
                alt="Mike"
                className="w-full h-full object-cover block"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 rounded-full p-0.5 border-2 border-card">
              <Sparkles className="w-2 h-2 text-slate-950" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-foreground leading-tight">
                Mike
              </h3>
              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-[5px] px-1.5 py-0 font-bold uppercase tracking-wider">
                IA
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              Assistente de Carreira em Aviação
            </p>
          </div>
        </div>

        {/* Indicador de Progresso dos Passos */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-muted-foreground font-mono">
            {currentStep + 1}/{QUESTIONS.length}
          </span>
          <div className="flex items-center gap-1">
            {QUESTIONS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-[5px] transition-all duration-300 ${
                  idx <= currentStep ? 'w-3.5 bg-primary' : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── ÁREA DE CHAT (ESTILO CHATGPT) ── */}
      <div 
        ref={chatContainerRef} 
        className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto scroll-smooth scrollbar-thin bg-background/50"
      >
        <div className="max-w-3xl mx-auto space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 sm:gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar do Mike */}
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-[5px] overflow-hidden shrink-0 border border-border mt-0.5 shadow-sm bg-slate-900">
                    <img
                      src="/images/avatars/mike_character_curiculum.png"
                      alt="Mike"
                      className="w-full h-full object-cover block"
                    />
                  </div>
                )}

                {/* Balão de Mensagem */}
                <div
                  className={`max-w-[88%] sm:max-w-[78%] p-3.5 sm:p-4 rounded-[5px] text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
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

                {/* Avatar do Usuário */}
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-[5px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Estado de Geração / Digitação */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 sm:gap-3.5 justify-start"
            >
              <div className="w-8 h-8 rounded-[5px] overflow-hidden shrink-0 border border-border mt-0.5 shadow-sm bg-slate-900">
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
      </div>

      {/* ── BARRA DE INPUT ESTILO CHATGPT ── */}
      <div className="p-3.5 sm:p-4 border-t border-border bg-card shrink-0">
        <div className="max-w-3xl mx-auto space-y-2.5">
          
          {/* Chips de Respostas Rápidas */}
          {!isGenerating && activeQuestion?.quickOptions && activeQuestion.quickOptions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {activeQuestion.quickOptions.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendAnswer(opt)}
                  className="bg-muted/70 hover:bg-muted text-foreground border border-border/70 hover:border-primary/40 transition-colors py-1 px-2.5 sm:px-3 rounded-[5px] text-[11px] sm:text-xs font-semibold text-left"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Cápsula de Entrada Estilo ChatGPT */}
          {!isGenerating && (
            <div className="relative flex items-center bg-muted/30 border border-border rounded-[5px] p-1.5 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-sm">
              <Input
                placeholder={activeQuestion?.placeholder || 'Envie uma mensagem para o Mike...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendAnswer();
                  }
                }}
                className="border-none bg-transparent shadow-none focus-visible:ring-0 text-xs sm:text-sm h-10 px-3 flex-1 font-medium placeholder:text-muted-foreground/60"
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
                  className="h-8 w-8 rounded-[5px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shrink-0 disabled:opacity-40"
                  title="Enviar"
                >
                  {currentStep === QUESTIONS.length - 1 ? (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Rodapé limpo e discreto sem poluição */}
          <p className="text-[10px] text-center text-muted-foreground/70">
            Mike utiliza inteligência artificial especializada para estruturar currículos na aviação civil.
          </p>
        </div>
      </div>
    </div>
  );
}
