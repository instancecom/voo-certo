import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Loader2, Sparkles, MessageCircle, Clock, ArrowUpRight } from 'lucide-react';
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

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="border-primary/30 text-primary hover:bg-primary/5"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Pergunte à IA sobre essa questão
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-x-4 bottom-4 z-50 md:absolute md:inset-auto md:bottom-full md:right-0 md:mb-2 md:w-96"
          >
            <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Instrutor IA</p>
                    <p className="text-xs text-muted-foreground">Especialista ANAC</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && !limitReached && (
                  <div className="text-center py-4">
                    <Bot className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Tire suas dúvidas sobre essa questão com o Instrutor IA.
                    </p>
                    <div className="space-y-2">
                      {SUGGESTED.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => { setInput(q); }}
                          className="w-full text-left px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-xs text-muted-foreground transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles className="w-3 h-3 text-primary" />
                          <span className="text-xs text-primary font-medium">Instrutor IA</span>
                          {msg.cached && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-muted-foreground/10 text-muted-foreground font-normal gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              Em cache
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl px-3 py-2 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Pensando...</span>
                    </div>
                  </div>
                )}

                {limitReached && (
                  <div className="text-center py-4 space-y-3">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                      <p className="text-sm text-destructive font-medium mb-2">
                        Limite de perguntas atingido
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Atualize seu plano para continuar perguntando ao Instrutor IA.
                      </p>
                      <Button asChild size="sm" className="gap-1">
                        <Link to="/premium">
                          Upgrade <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={limitReached ? "Limite atingido" : "Sua pergunta..."}
                  className="text-sm h-9"
                  disabled={isLoading || limitReached}
                />
                <Button size="sm" onClick={sendMessage} disabled={isLoading || !input.trim() || limitReached} className="h-9 w-9 p-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
