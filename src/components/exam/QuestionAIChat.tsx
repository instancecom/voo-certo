import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Loader2, Sparkles, MessageCircle, Clock, ArrowUpRight, Lock, Plus, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  cached?: boolean;
}

interface QuestionAIChatProps {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string | null;
  mode?: 'inline' | 'floating' | 'both';
}

export function QuestionAIChat({
  questionId,
  questionText,
  options,
  correctAnswer,
  explanation,
  mode = 'both',
}: QuestionAIChatProps) {
  const { user, profile, refreshProfile, isAdmin } = useAuth();
  const { canAccessAIChat, aiChatLimitPerQuestion, aiChatDailySafetyLimit, currentPlan } = usePlan();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [questionUsage, setQuestionUsage] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current usage for this question
  useEffect(() => {
    if (!user || !questionId || !isOpen) return;

    const fetchUsage = async () => {
      try {
        const { data, error } = await (supabase as any).rpc('get_ai_usage_for_question', {
          p_user_id: user.id,
          p_question_id: questionId
        });
        if (!error && typeof data === 'number') {
          setQuestionUsage(data);
          if (data >= aiChatLimitPerQuestion && !isAdmin) {
            setLimitReached(true);
          }
        }
      } catch (err) {
        console.error('Error fetching AI usage:', err);
      }
    };

    fetchUsage();
  }, [user, questionId, isOpen, aiChatLimitPerQuestion, isAdmin]);

  const remainingForQuestion = questionUsage !== null 
    ? Math.max(0, aiChatLimitPerQuestion - questionUsage)
    : aiChatLimitPerQuestion;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading || (limitReached && !isAdmin)) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('question-ai-chat', {
        body: {
          questionId,
          questionText,
          options,
          correctAnswer,
          explanation,
          userQuestion: textToSend,
          chatHistory: messages,
        },
      });

      if (error) throw error;

      if (data?.reply) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.reply,
          cached: data.cached,
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (typeof data.questionUsage === 'number') {
          setQuestionUsage(data.questionUsage);
          if (data.questionUsage >= aiChatLimitPerQuestion && !isAdmin) {
            setLimitReached(true);
          }
        }
        
        refreshProfile();
      }
    } catch (err: any) {
      console.error('Error sending AI message:', err);
      toast.error(err.message || 'Erro ao comunicar com a IA');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  if (!canAccessAIChat) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-[5px] bg-muted/50 border border-border text-sm">
        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground flex-1">Chat IA disponível no plano Solo+</span>
        <Button variant="outline" size="sm" asChild>
          <Link to="/premium">Upgrade</Link>
        </Button>
      </div>
    );
  }

  const showInline = mode === 'inline' || mode === 'both';
  const showFloating = mode === 'floating' || mode === 'both';

  return (
    <>
      {/* Botão Inline no card */}
      {showInline && (
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-between w-full sm:w-auto min-w-[280px] px-5 py-3 rounded-[8px] bg-gradient-to-r from-primary/5 via-primary/10 to-accent/10 border border-primary/20 hover:border-accent/40 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="flex items-center gap-3 text-primary group-hover:text-accent transition-colors relative z-10">
              <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:shadow group-hover:rotate-12 transition-all">
                <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              </div>
              <span className="text-sm font-bold tracking-tight">Pergunte ao Mike</span>
            </div>

            {!isAdmin && (
              <Badge 
                variant="secondary" 
                className="ml-3 bg-white/80 hover:bg-white text-accent border-accent/20 px-3 py-1 font-bold text-[10px] uppercase tracking-wider relative z-10"
              >
                {remainingForQuestion} {remainingForQuestion === 1 ? 'msg restando' : 'msgs restando'}
              </Badge>
            )}
          </motion.button>
        </div>
      )}

      {/* Botão Flutuante do Mike no Canto Inferior Direito (Mobile / Desktop) */}
      {showFloating && !isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0f172a] text-amber-400 border-2 border-amber-400/40 shadow-2xl flex items-center justify-center hover:border-amber-400 transition-all group"
          title="Perguntar ao Mike (IA)"
        >
          <Sparkles className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform animate-pulse" />
        </motion.button>
      )}

      {/* Modal / Sheet do Chat do Mike */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-x-0 bottom-0 z-[100] md:absolute md:inset-auto md:bottom-full md:right-0 md:mb-3 flex flex-col md:block"
          >
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[-1] md:hidden" onClick={() => setIsOpen(false)} />

            <div className="bg-[#F5F7F9] border border-border/40 rounded-[5px] shadow-2xl flex flex-col h-[85vh] md:h-[500px] md:w-[420px] overflow-hidden">
              <div className="flex items-center justify-between p-5 bg-white border-b border-border/10 shrink-0 shadow-sm relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-[5px] overflow-hidden shrink-0 border-2 border-primary shadow-sm" style={{ width: '44px', height: '44px', minWidth: '44px', maxWidth: '44px', minHeight: '44px', maxHeight: '44px' }}>
                      <img 
                        src="/images/avatars/mike_character_prof.png" 
                        alt="Mike" 
                        className="w-full h-full object-cover block" 
                      />
                    </div>
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-primary leading-tight">Mike</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold tracking-wide uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Assistente Completo
                      </p>
                      <div className="h-3 w-[1px] bg-border/40" />
                      <div className="flex items-center gap-2">
                        {isAdmin ? (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                            Acesso Ilimitado
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold shadow-sm border border-accent/10">
                              {remainingForQuestion} Questões
                            </span>
                            {profile?.ai_questions_count !== undefined && (
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight opacity-70">
                                {Math.max(0, (aiChatDailySafetyLimit || 0) - profile.ai_questions_count)} CRÉDITOS HOJE
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-9 w-9 rounded-full hover:bg-muted text-muted-foreground transition-all">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !limitReached && (
                  <div className="flex flex-col items-center text-center py-6 px-4">
                    <div className="mb-3 relative shrink-0">
                      <img 
                        src="/images/logo_chat_ia_mike.png" 
                        alt="Mike" 
                        className="w-24 h-24 object-contain block drop-shadow-lg" 
                      />
                    </div>
                    <h4 className="text-base font-black text-foreground mb-1">Dúvida sobre esta questão?</h4>
                    <p className="text-sm text-muted-foreground mb-6 text-balance font-medium">
                      Pergunte ao Mike! Ele te explica de forma clara e com bom humor. 😄
                    </p>
                    <div className="w-full space-y-2">
                      {['Por que essa é a resposta correta?', 'Como o erro impacta o voo?', 'Explique a regulamentação.'].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => { setInput(q); }}
                          className="w-full text-left px-4 py-3 rounded-[5px] bg-white border border-border/50 hover:border-accent/40 shadow-sm text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="flex gap-2 max-w-[88%]">
                        <div className="w-8 h-8 rounded-[5px] overflow-hidden shrink-0 border border-primary/50 mt-1 shadow-sm" style={{ width: '32px', height: '32px', minWidth: '32px', maxWidth: '32px', minHeight: '32px', maxHeight: '32px' }}>
                          <img 
                            src="/images/avatars/Mike_character.png"
                            alt="Mike"
                            className="w-full h-full object-cover block"
                          />
                        </div>
                        <div className="bg-white border border-primary/20 px-4 py-3 rounded-[5px] rounded-tl-sm text-[15px] text-foreground shadow-sm">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-xs text-primary font-bold">Mike</span>
                            {msg.cached && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-muted text-muted-foreground font-normal gap-0.5 border-none">
                                <Clock className="w-2.5 h-2.5" /> Em cache
                              </Badge>
                            )}
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[85%] px-4 py-3 rounded-[5px] rounded-tr-sm text-[15px] bg-primary/90 text-primary-foreground shadow-sm">
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="w-8 h-8 rounded-[5px] overflow-hidden shrink-0 border border-primary/50 mt-1 shadow-sm animate-pulse" style={{ width: '32px', height: '32px', minWidth: '32px', maxWidth: '32px', minHeight: '32px', maxHeight: '32px' }}>
                        <img 
                          src="/images/avatars/Mike_character.png"
                          alt="Mike"
                          className="w-full h-full object-cover block"
                        />
                      </div>
                      <div className="bg-white border border-border/50 rounded-[5px] rounded-tl-sm px-4 py-3 flex items-center gap-2.5 shadow-sm text-xs font-semibold text-primary">
                        <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                        <span>Mike analisando sua dúvida...</span>
                      </div>
                    </div>
                  </div>
                )}

                {limitReached && !isAdmin && (
                  <div className="text-center py-4 space-y-3">
                    <div className="bg-destructive/5 border border-destructive/20 rounded-[5px] p-5 mb-2 shadow-sm bg-white text-left">
                      <p className="text-base text-destructive font-bold mb-1">
                        Limite por questão atingido
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Você já enviou {aiChatLimitPerQuestion} perguntas para esta questão. Avance para a próxima questão ou faça um upgrade para limites maiores.
                      </p>
                      <Button asChild className="w-full gap-2 rounded-[5px] font-bold">
                        <Link to="/premium">
                          Fazer Upgrade <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="px-5 py-3 bg-white border-t border-border/10 shrink-0 pb-8 md:pb-6 rounded-[5px] relative">
                <div className="flex items-center justify-between mb-3 bg-accent/5 rounded-[5px] px-3 py-2 border border-accent/10 shadow-sm">
                  {isAdmin ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Modo Admin: Uso Ilimitado</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <MessageCircle className="w-3.5 h-3.5 text-accent" />
                        <span>Respostas: {remainingForQuestion}</span>
                      </div>
                      {profile?.ai_questions_count !== undefined && (
                        <div className="text-[10px] font-bold text-accent/80 uppercase tracking-widest px-2 py-0.5 rounded-full border border-accent/10">
                          Créditos hoje: {Math.max(0, (aiChatDailySafetyLimit || 0) - profile.ai_questions_count)}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative">
                    <Input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      maxLength={1000}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder={limitReached && !isAdmin ? "Limite atingido para esta questão." : "Mande sua dúvida..."}
                      className="text-[15px] rounded-[5px] border-border/20 shadow-sm bg-muted/30 h-12 pr-12 placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-accent/30 transition-all border-none"
                      disabled={isLoading || (limitReached && !isAdmin)}
                    />
                    <Button 
                      title="Enviar mensagem"
                      onClick={sendMessage} 
                      disabled={isLoading || !input.trim() || (limitReached && !isAdmin)} 
                      size="icon" 
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[5px] bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/20"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

