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
}

export function QuestionAIChat({
  questionId,
  questionText,
  options,
  correctAnswer,
  explanation,
}: QuestionAIChatProps) {
  const { user } = useAuth();
  const { canAccessAIChat, aiChatLimit, currentPlan } = usePlan();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || limitReached) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('question-ai-chat', {
        body: {
          questionId,
          questionText,
          options,
          correctAnswer,
          explanation,
          userQuestion: userMessage,
        },
      });

      if (error) {
        // Check for FunctionsFetchError with specific status
        const errorBody = (error as any)?.context?.body;
        if (errorBody) {
          try {
            const parsed = typeof errorBody === 'string' ? JSON.parse(errorBody) : errorBody;
            if (parsed.limitReached) {
              setLimitReached(true);
              setMessages(prev => prev.slice(0, -1));
              return;
            }
            if (parsed.error) {
              toast.error(parsed.error);
              setMessages(prev => prev.slice(0, -1));
              return;
            }
          } catch {}
        }
        throw error;
      }

      if (data?.limitReached) {
        setLimitReached(true);
        toast.error(data.error);
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        cached: data.cached,
      }]);
    } catch (err) {
      toast.error('Erro ao conectar com a IA. Tente novamente.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTED = [
    'Por que essa é a resposta correta?',
    'Como isso se aplica na prática?',
    'Qual a regulamentação relacionada?',
  ];

  if (!user) return null;

  if (!canAccessAIChat) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border text-sm">
        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground flex-1">Chat IA disponível no plano Tripulante+</span>
        <Button variant="outline" size="sm" asChild>
          <Link to="/premium">Upgrade</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02, translateY: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between w-full sm:w-auto min-w-[320px] px-5 py-3 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-accent/10 border border-primary/20 hover:border-accent/40 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
      >
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <div className="flex items-center gap-3 text-primary group-hover:text-accent transition-colors relative z-10">
          <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:shadow group-hover:rotate-12 transition-all">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          </div>
          <span className="text-sm font-bold tracking-tight">Pergunte ao Instrutor IA</span>
        </div>

        {aiChatLimit < 999 && (
          <Badge 
            variant="secondary" 
            className="ml-3 bg-white/80 hover:bg-white text-accent border-accent/20 px-3 py-1 font-bold text-[10px] uppercase tracking-wider relative z-10"
          >
            {Math.max(0, aiChatLimit - messages.filter(m => m.role === 'user').length)} msgs
          </Badge>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-x-0 bottom-0 z-[100] md:absolute md:inset-auto md:bottom-full md:right-0 md:mb-3 flex flex-col md:block"
          >
            {/* Backdrop for mobile */}
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[-1] md:hidden" onClick={() => setIsOpen(false)} />

            <div className="bg-[#F5F7F9] border border-border/40 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col h-[85vh] md:h-[500px] md:w-[420px] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-white border-b border-border/30 shrink-0 shadow-sm relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150&h=150" 
                      alt="Instrutor" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-accent" 
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-foreground leading-tight">Instrutor IA</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium mt-0.5">
                      <Sparkles className="w-3 h-3 text-accent" /> Especialista ANAC
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages Viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !limitReached && (
                  <div className="flex flex-col items-center text-center py-6 px-4">
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-border/50 flex items-center justify-center mb-4 relative">
                      <img 
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150&h=150" 
                        alt="Instrutor" 
                        className="w-full h-full rounded-full object-cover" 
                      />
                      <div className="absolute -bottom-1 -right-1 bg-accent rounded-full p-1 border-2 border-white">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <h4 className="text-base font-bold text-foreground mb-1">Como posso te ajudar comandante?</h4>
                    <p className="text-sm text-muted-foreground mb-6">
                      Tire suas dúvidas sobre essa questão com seu instrutor IA focado no padrão ANAC.
                    </p>
                    <div className="w-full space-y-2">
                      {['Por que essa é a resposta correta?', 'Como isso se aplica na prática?', 'Qual a regulamentação relacionada?'].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => { setInput(q); }}
                          className="w-full text-left px-4 py-3 rounded-2xl bg-white border border-border/50 hover:border-accent/40 shadow-sm text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
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
                        <img 
                          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150&h=150"
                          alt="IA"
                          className="w-8 h-8 rounded-full object-cover border border-accent/50 shrink-0 mt-1 shadow-sm"
                        />
                        <div className="bg-white border border-accent/20 px-4 py-3 rounded-2xl rounded-tl-sm text-[15px] text-foreground shadow-sm">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-xs text-primary font-bold">Instrutor</span>
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
                      <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-sm text-[15px] bg-primary/90 text-primary-foreground shadow-sm">
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <img 
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150&h=150"
                        alt="IA"
                        className="w-8 h-8 rounded-full object-cover border border-accent/50 shrink-0 mt-1 shadow-sm opacity-70"
                      />
                      <div className="bg-white border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center justify-center shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    </div>
                  </div>
                )}

                {limitReached && (
                  <div className="text-center py-4 space-y-3">
                    <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 mb-2 shadow-sm bg-white text-left">
                      <p className="text-base text-destructive font-bold mb-1">
                        Limite de perguntas atingido
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Atualize seu plano para continuar perguntando ao Instrutor IA.
                      </p>
                      <Button asChild className="w-full gap-2 rounded-xl font-bold">
                        <Link to="/premium">
                          Fazer Upgrade <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-[#F5F7F9] border-t border-border/30 shrink-0 pb-6 md:pb-4 rounded-b-3xl">
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-accent shrink-0 shadow-sm">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150&h=150" 
                      alt="Instrutor" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <Input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder={limitReached ? "Limite atingido. Atualize seu plano." : "Digite sua dúvida sobre essa questão..."}
                      className="text-sm rounded-2xl border-border/30 shadow-sm bg-white min-h-[44px] placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-accent"
                      disabled={isLoading || limitReached}
                    />
                    <div className="flex items-center justify-between px-1">
                      <Button 
                        title="Anexar arquivo/imagem"
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-all duration-200 shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button 
                        title="Enviar mensagem"
                        onClick={sendMessage} 
                        disabled={isLoading || !input.trim() || limitReached} 
                        size="icon" 
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 shadow-sm"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
