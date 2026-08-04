import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, Sparkles, Loader2, CheckCircle2, ArrowRight, Shield, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
}

const QUESTIONS = [
  {
    step: 0,
    title: 'Dados Pessoais',
    question: 'Para começar, qual o seu nome completo, telefone para contato e cidade onde mora?',
    placeholder: 'Ex: Ana Silva, (11) 98888-7777, São Paulo - SP',
    quickOptions: [],
  },
  {
    step: 1,
    title: 'Cargo & Área',
    question: 'Qual sua área de atuação e o cargo que você está buscando?',
    placeholder: 'Ex: Comissário(a) de Bordo, Piloto Comercial, Agente de Atendimento...',
    quickOptions: ['Comissário(a) de Bordo', 'Piloto Comercial / PP', 'Agente de Atendimento Aéreo', 'Atendimento ao Cliente / VIP'],
  },
  {
    step: 2,
    title: 'Destino do Currículo',
    question: 'Como vai usar esse currículo — plataformas online (Gupy, LinkedIn), envio por e-mail ou entrega pessoal impressa?',
    placeholder: 'Ex: Pretendo aplicar na Gupy e mandar por e-mail...',
    quickOptions: ['Plataformas Online (Gupy, Catho, LinkedIn)', 'Envio por E-mail em PDF', 'Entrega Pessoal Impressa'],
  },
  {
    step: 3,
    title: 'Formação Acadêmica',
    question: 'Qual sua formação acadêmica? (Ensino médio, faculdade, pós-graduação)',
    placeholder: 'Ex: Ensino Médio Completo no Colégio Estadual (2020) e Faculdade de Aviação Civil na Anhembi Morumbi (2023)',
    quickOptions: ['Ensino Médio Completo', 'Superior em Aviação Civil', 'Superior em Letras / Comunicação', 'Curso Homologado ANAC'],
  },
  {
    step: 4,
    title: 'Experiência Profissional',
    question: 'Tem experiência profissional anterior? Pode me contar do seu jeito (empresas, cargos e o que fazia lá).',
    placeholder: 'Ex: Trabalhei 2 anos como atendente na Latam cuidando do embarque e 1 ano em recepção de hotel...',
    quickOptions: ['Ainda não tenho experiência formal (Primeiro emprego)', 'Atendimento ao Cliente / Vendas', 'Experiência prévia em Aviação'],
  },
  {
    step: 5,
    title: 'Cursos & Idiomas',
    question: 'Tem cursos, certificações (ex: CCT/CMS ANAC, Primeiros Socorros) ou idiomas (Inglês, Espanhol)?',
    placeholder: 'Ex: CCT ANAC aprovado, Curso de Comissário na EACON, Inglês Intermediário e Espanhol Básico',
    quickOptions: ['Banca ANAC Aprovada (CCT/CMS)', 'Inglês Intermediário / Avançado', 'Primeiros Socorros / Sobrevivência', 'Espanhol Básico'],
  },
  {
    step: 6,
    title: 'Objetivo & Diferenciais',
    question: 'Para finalizar, qual o seu objetivo profissional ou algum ponto forte que deseja destacar?',
    placeholder: 'Ex: Buscar vaga de comissária para aplicar meu foco em segurança de voo e excelência em atendimento...',
    quickOptions: ['Foco em Segurança e Atendimento VIP', 'Disponibilidade para viagens e mudança', 'Paixão pela Aviação Civil'],
  },
];

export function CurriculumChatAssistant({ onCurriculumGenerated, userEmail, userName }: CurriculumChatAssistantProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    q0: userName ? `${userName}, ${userEmail || ''}` : '',
  });
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Olá! Sou o Lucas, analista de carreiras do Voe Certo. 👋\n\nVamos criar o seu currículo profissional de alto impacto?\n\n💡 **Dica importante:** Pode responder do seu jeito, sem se preocupar com gramática ou estrutura — eu vou cuidar da formatação, ajustar os verbos de ação e escolher o modelo ideal para o seu objetivo!`,
      step: -1,
    },
    {
      sender: 'ai',
      text: QUESTIONS[0].question,
      step: 0,
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const activeQuestion = QUESTIONS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / QUESTIONS.length) * 100);

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

    // Add user message to chat list
    const newMessages: Message[] = [
      ...messages,
      { sender: 'user', text: finalAnswer || '(Passo pulado)' },
    ];

    setInputText('');

    if (currentStep < QUESTIONS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      newMessages.push({
        sender: 'ai',
        text: QUESTIONS[nextStep].question,
        step: nextStep,
      });
      setMessages(newMessages);
    } else {
      // Step 6 reached -> Generate curriculum with IA!
      setMessages(newMessages);
      await generateFinalCurriculum(updatedAnswers);
    }
  };

  const generateFinalCurriculum = async (finalAnswers: Record<string, string>) => {
    setIsGenerating(true);
    toast.info('Lucas analisando e formatando seu currículo profissional...');

    try {
      const { data, error } = await supabase.functions.invoke('curriculum-ai-assistant', {
        body: {
          action: 'generate_curriculum',
          answers: finalAnswers,
        },
      });

      if (error) throw error;
      if (!data?.curriculum) throw new Error('Não foi possível gerar a estrutura do currículo.');

      toast.success('Currículo profissional criado com sucesso por Lucas!');
      onCurriculumGenerated(data.curriculum);
    } catch (err: any) {
      console.error('Erro ao gerar currículo com IA:', err);
      toast.warning('Lucas formatando currículo com base nas respostas enviadas...');

      // Fallback inteligente com base direta nas respostas fornecidas pelo usuário
      const fallbackCurriculum = {
        full_name: finalAnswers.q0?.split(',')[0]?.trim() || userName || 'Candidato Voe Certo',
        email: userEmail || '',
        phone: '',
        city: finalAnswers.q0?.split(',')[1]?.trim() || '',
        profession: finalAnswers.q1 || 'Profissional da Aviação Civil',
        summary: finalAnswers.q6 || 'Profissional dedicado, com foco em segurança de voo, excelência no atendimento e constante aprimoramento na aviação.',
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

  return (
    <Card className="border-border bg-card shadow-lg rounded-[5px] overflow-hidden max-w-3xl mx-auto flex flex-col my-2">
      {/* Top Header Banner */}
      <div className="bg-primary text-primary-foreground p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-primary/20">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-amber-400 shadow-sm" style={{ width: '48px', height: '48px', minWidth: '48px', maxWidth: '48px', minHeight: '48px', maxHeight: '48px' }}>
              <img
                src="/images/avatars/lucas.jpg"
                alt="Lucas - Analista de Carreiras"
                className="w-full h-full object-cover block"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 rounded-full p-1 border-2 border-primary">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
              Lucas — Analista de Carreiras
              <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-300 bg-amber-400/10 rounded-[5px]">
                Analista de Carreiras
              </Badge>
            </h3>
            <p className="text-[11px] sm:text-xs text-primary-foreground/80 font-medium">Conversa guiada para montagem e otimização do seu currículo</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-amber-300 font-mono">Passo {currentStep + 1} de {QUESTIONS.length}</span>
          <Progress value={progressPercent} className="w-24 h-2 mt-1 bg-primary-foreground/20 rounded-[5px]" />
        </div>
      </div>

      {/* Motivational Reassurance Card */}
      <div className="bg-secondary/60 border-b border-border px-4 py-2.5 flex items-start gap-2.5 text-xs text-foreground shrink-0">
        <Lightbulb className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
        <span>
          <strong>Sem estresse de escrita:</strong> Pode responder com suas palavras simples. O Lucas refinará a gramática, ajustará os verbos de ação e escolherá o melhor layout para você.
        </span>
      </div>

      {/* Chat Conversation Body (With auto-scroll ref and responsive height) */}
      <CardContent 
        ref={chatContainerRef} 
        className="p-4 sm:p-6 space-y-4 max-h-[380px] sm:max-h-[440px] min-h-[250px] overflow-y-auto scroll-smooth scrollbar-thin flex-1"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-primary/30 mt-1 shadow-sm" style={{ width: '32px', height: '32px', minWidth: '32px', maxWidth: '32px', minHeight: '32px', maxHeight: '32px' }}>
                  <img
                    src="/images/avatars/lucas.jpg"
                    alt="Lucas"
                    className="w-full h-full object-cover block"
                  />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[78%] p-3.5 sm:p-4 rounded-[5px] text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-muted/70 text-foreground border border-border/60'
                }`}
              >
                {msg.text}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[5px] bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-1">
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
            className="flex items-center gap-3 p-4 rounded-[5px] bg-primary/5 border border-primary/20 text-primary text-xs font-bold"
          >
            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            <span>Lucas formatando seu histórico, aplicando verbos de ação e selecionando o modelo ideal...</span>
          </motion.div>
        )}
      </CardContent>

      {/* Quick Input Options & Form Controls */}
      <div className="p-4 sm:p-5 border-t border-border bg-muted/20 space-y-3 shrink-0">
        {/* Quick Suggestion Chips */}
        {!isGenerating && activeQuestion?.quickOptions && activeQuestion.quickOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-1">
            <span className="text-[11px] font-semibold text-muted-foreground w-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Respostas rápidas sugeridas:
            </span>
            {activeQuestion.quickOptions.map((opt, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors py-1.5 px-2.5 text-[11px] sm:text-xs"
                onClick={() => handleSendAnswer(opt)}
              >
                {opt}
              </Badge>
            ))}
          </div>
        )}

        {/* Input Box */}
        {!isGenerating && (
          <div className="flex gap-2 items-end">
            <Textarea
              rows={2}
              placeholder={activeQuestion?.placeholder || 'Digite sua resposta...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendAnswer();
                }
              }}
              className="resize-none font-medium text-xs sm:text-sm bg-background border-border"
            />

            <div className="flex flex-col gap-1 shrink-0">
              <Button
                onClick={() => handleSendAnswer()}
                disabled={isGenerating || (!inputText.trim() && currentStep === 0)}
                className="h-12 px-4 sm:px-5 gap-2 font-bold text-xs sm:text-sm"
              >
                {currentStep === QUESTIONS.length - 1 ? (
                  <>Gerar <Sparkles className="w-4 h-4" /></>
                ) : (
                  <>Enviar <Send className="w-4 h-4" /></>
                )}
              </Button>

              {currentStep > 0 && currentStep < QUESTIONS.length - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSendAnswer('Não se aplica / Pular')}
                  className="text-[10px] text-muted-foreground hover:text-foreground h-6"
                >
                  Pular passo
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
