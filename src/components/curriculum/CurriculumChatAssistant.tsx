import React, { useState } from 'react';
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
      text: `Olá! Sou o assistente inteligente de carreiras do Voe Certo. 👋\n\nEu vou te guiar passo a passo para criar um currículo profissional de altíssimo impacto.\n\n💡 **Dica importante:** Pode responder do seu jeito, sem se preocupar com gramática ou estrutura — a nossa IA melhora o texto automaticamente, deixando tudo profissional sem alterar os seus fatos!`,
      step: -1,
    },
    {
      sender: 'ai',
      text: QUESTIONS[0].question,
      step: 0,
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

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
      // Step 6 reached -> Generate curriculum with AI!
      setMessages(newMessages);
      await generateFinalCurriculum(updatedAnswers);
    }
  };

  const generateFinalCurriculum = async (finalAnswers: Record<string, string>) => {
    setIsGenerating(true);
    toast.info('IA analisando e formatando seu currículo profissional...');

    try {
      const { data, error } = await supabase.functions.invoke('curriculum-ai-assistant', {
        body: {
          action: 'generate_curriculum',
          answers: finalAnswers,
        },
      });

      if (error) throw error;
      if (!data?.curriculum) throw new Error('Não foi possível gerar a estrutura do currículo.');

      toast.success('Currículo profissional criado com sucesso pela IA!');
      onCurriculumGenerated(data.curriculum);
    } catch (err: any) {
      console.error('Erro ao gerar currículo com IA:', err);
      toast.error(`Falha ao gerar currículo: ${err.message || 'Tente novamente.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-lg rounded-2xl overflow-hidden max-w-3xl mx-auto">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary/90 to-slate-950 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              Assistente de Currículo Voe Certo
              <Badge variant="outline" className="text-[10px] border-sky-400/40 text-sky-300">
                IA Ativa
              </Badge>
            </h3>
            <p className="text-xs text-slate-300 font-medium">Conversa guiada para montagem automática</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-sky-300 font-mono">Passo {currentStep + 1} de {QUESTIONS.length}</span>
          <Progress value={progressPercent} className="w-24 h-2 mt-1 bg-slate-800" />
        </div>
      </div>

      {/* Motivational Reassurance Card */}
      <div className="bg-sky-500/10 border-b border-sky-500/20 px-5 py-3 flex items-start gap-3 text-xs text-sky-700 dark:text-sky-300">
        <Lightbulb className="w-4 h-4 shrink-0 text-sky-500 mt-0.5" />
        <span>
          <strong>Sem estresse de escrita:</strong> Pode responder com suas palavras simples. A nossa IA refinará a gramática, ajustará os verbos de ação e escolherá o melhor layout para você.
        </span>
      </div>

      {/* Chat Conversation Body */}
      <CardContent className="p-6 space-y-4 max-h-[480px] overflow-y-auto scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground font-medium rounded-tr-none'
                    : 'bg-muted/70 text-foreground border border-border/60 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-1">
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
            className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-primary text-xs font-bold"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Formatando histórico, aplicando verbos de ação e selecionando o modelo de currículo ideal...</span>
          </motion.div>
        )}
      </CardContent>

      {/* Quick Input Options & Form Controls */}
      <div className="p-5 border-t border-border bg-muted/20 space-y-3">
        {/* Quick Suggestion Chips */}
        {!isGenerating && activeQuestion?.quickOptions && activeQuestion.quickOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-[11px] font-semibold text-muted-foreground w-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Respostas rápidas sugeridas:
            </span>
            {activeQuestion.quickOptions.map((opt, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors py-1.5 px-3 text-xs"
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
                className="h-12 px-5 gap-2 font-bold"
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
