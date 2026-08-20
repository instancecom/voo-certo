import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sparkles, MessageCircle, Clock, ArrowUpRight, Lock, ArrowUp } from 'lucide-react';
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
  const { canAccessAIChat, aiChatLimitPerQuestion, aiChatDailySafetyLimit } = usePlan();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [questionUsage, setQuestionUsage] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Busca o uso atual para esta questão sempre que o chat abre
  useEffect(() => {
    if (!user || !questionId || !isOpen) return;
    const fetchUsage = async () => {
      try {
        const { data, error } = await (supabase as any).rpc('get_ai_usage_for_question', {
          p_user_id: user.id,
          p_question_id: questionId,
        });
        if (!error && typeof data === 'number') {
          setQuestionUsage(data);
          if (data >= aiChatLimitPerQuestion && !isAdmin) setLimitReached(true);
        }
      } catch (err) {
        console.error('Error fetching AI usage:', err);
      }
    };
    fetchUsage();
  }, [user, questionId, isOpen, aiChatLimitPerQuestion, isAdmin]);

  const remainingForQuestion =
    questionUsage !== null ? Math.max(0, aiChatLimitPerQuestion - questionUsage) : aiChatLimitPerQuestion;

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading || (limitReached && !isAdmin)) return;

    setMessages((prev) => [...prev, { role: 'user', content: textToSend }]);
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

      // A edge function retorna { response: "..." } — suporte a ambos por segurança
      const responseText = data?.response || data?.reply;
      if (responseText) {
        setMessages((prev) => [...prev, { role: 'assistant', content: responseText, cached: data.cached }]);
        if (typeof data.questionUsage === 'number') {
          setQuestionUsage(data.questionUsage);
          if (data.questionUsage >= aiChatLimitPerQuestion && !isAdmin) setLimitReached(true);
        }
        refreshProfile();
      }
    } catch (err: any) {
      console.error('Error sending AI message:', err);
      toast.error(err.message || 'Erro ao comunicar com a IA');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  if (!canAccessAIChat) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-[5px] bg-muted/50 border border-border text-sm">
        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground flex-1">Chat IA disponível no plano Tripulante+</span>
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
      {/* ── BOTÃO INLINE — apenas no desktop (lg+) ── */}
      {showInline && (
        <div className="hidden lg:block">
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-between w-full min-w-[280px] px-5 py-3 rounded-[8px] bg-gradient-to-r from-primary/5 via-primary/10 to-accent/10 border border-primary/20 hover:border-accent/40 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="flex items-center gap-3 text-primary group-hover:text-accent transition-colors relative z-10">
              <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:rotate-12 transition-all">
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

      {/* ── BOTÃO FLUTUANTE — apenas no mobile (< lg) ── */}
      {showFloating && !isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0f172a] border-2 border-amber-400/40 shadow-2xl flex items-center justify-center hover:border-amber-400 transition-all group"
          title="Perguntar ao Mike (IA)"
        >
          <Sparkles className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform animate-pulse" />
        </motion.button>
      )}

      {/* ── MODAL / CHAT DO MIKE ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 lg:inset-auto lg:bottom-20 lg:right-6 lg:w-[420px] lg:h-[550px] z-[100] flex flex-col p-2 lg:p-0"
          >
            {/* Backdrop apenas no mobile */}
            <div
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm"
              style={{ zIndex: -1 }}
              onClick={() => setIsOpen(false)}
            />

            <div className="bg-card border border-border/60 rounded-[10px] shadow-2xl flex flex-col h-full w-full overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-[6px] overflow-hidden border-2 border-primary shadow-sm">
                      <img src="/images/avatars/mike_character_prof.png" alt="Mike" className="w-full h-full object-cover block" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-primary leading-tight">Mike</h3>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold uppercase tracking-wide">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Assistente IA
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                {messages.length === 0 && !limitReached && (
                  <div className="flex flex-col items-center text-center py-6 px-4">
                    <img src="/images/logo_chat_ia_mike.png" alt="Mike" className="w-20 h-20 object-contain drop-shadow-lg mb-3" />
                    <h4 className="text-sm font-black text-foreground mb-1">Dúvida sobre esta questão?</h4>
                    <p className="text-xs text-muted-foreground mb-5 font-medium">
                      Pergunte ao Mike! Ele explica de forma clara e bem-humorada. 😄
                    </p>
                    <div className="w-full space-y-2">
                      {['Por que essa é a resposta correta?', 'Como o erro impacta o voo?', 'Explique a regulamentação.'].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(q)}
                          className="w-full text-left px-4 py-2.5 rounded-[8px] bg-card border border-border/60 hover:border-accent/40 shadow-sm text-xs text-muted-foreground hover:text-foreground transition-all"
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
                        <div className="w-7 h-7 rounded-[5px] overflow-hidden shrink-0 border border-primary/40 mt-1 shadow-sm">
                          <img src="/images/avatars/Mike_character.png" alt="Mike" className="w-full h-full object-cover block" />
                        </div>
                        <div className="bg-card border border-primary/20 px-3 py-2.5 rounded-[8px] rounded-tl-sm text-xs text-foreground shadow-sm">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-[11px] text-primary font-bold">Mike</span>
                            {msg.cached && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-3.5 bg-muted text-muted-foreground font-normal gap-0.5 border-none">
                                <Clock className="w-2 h-2" /> cache
                              </Badge>
                            )}
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[85%] px-3 py-2.5 rounded-[8px] rounded-tr-sm text-xs bg-primary text-primary-foreground shadow-sm">
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="w-7 h-7 rounded-[5px] overflow-hidden shrink-0 border border-primary/40 mt-1 animate-pulse">
                        <img src="/images/avatars/Mike_character.png" alt="Mike" className="w-full h-full object-cover block" />
                      </div>
                      <div className="bg-card border border-border/50 rounded-[8px] rounded-tl-sm px-3 py-2.5 flex items-center gap-2 shadow-sm text-xs font-semibold text-primary">
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>Mike analisando sua dúvida...</span>
                      </div>
                    </div>
                  </div>
                )}

                {limitReached && !isAdmin && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-[8px] p-4 text-left">
                    <p className="text-sm text-destructive font-bold mb-1">Limite por questão atingido</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Você já enviou {aiChatLimitPerQuestion} perguntas para esta questão.
                    </p>
                    <Button asChild className="w-full gap-2 rounded-[6px] font-bold h-9 text-xs">
                      <Link to="/premium">
                        Fazer Upgrade <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Footer: input */}
              <div className="px-4 py-3 bg-card border-t border-border/40 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  {isAdmin ? (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Acesso Ilimitado
                    </span>
                  ) : (
                    <>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-accent" /> {remainingForQuestion} respostas restando
                      </span>
                      {profile?.ai_questions_count !== undefined && (
                        <span className="text-[10px] font-bold text-accent/80 uppercase">
                          {Math.max(0, (aiChatDailySafetyLimit || 0) - profile.ai_questions_count)} créditos hoje
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    maxLength={1000}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(); }
                    }}
                    placeholder={limitReached && !isAdmin ? 'Limite atingido.' : 'Mande sua dúvida...'}
                    className="text-xs rounded-[6px] border-border/40 bg-muted/40 h-10 pr-10 placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-accent/30 transition-all"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !input.trim() || (limitReached && !isAdmin)}
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[5px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
