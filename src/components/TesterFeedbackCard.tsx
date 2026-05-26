import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const FEEDBACK_EMOJIS = [
  { rating: 1, char: '😢', label: 'Ruim' },
  { rating: 2, char: '😕', label: 'Regular' },
  { rating: 3, char: '😐', label: 'Ok' },
  { rating: 4, char: '🙂', label: 'Boa' },
  { rating: 5, char: '😍', label: 'Excelente' },
];

export function TesterFeedbackCard() {
  const { user, isTester } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [rating, setRating] = useState<number | null>(null);
  const [likedMost, setLikedMost] = useState('');
  const [confusedMost, setConfusedMost] = useState('');
  const [bugsFound, setBugsFound] = useState('');

  useEffect(() => {
    // Show only if user is logged in, flagged as tester, and has not submitted yet in this browser session
    const hasSubmitted = localStorage.getItem('voocerto-tester-feedback-submitted') === 'true';
    if (user && isTester && !hasSubmitted) {
      // Delay entrance slightly to feel extremely premium
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [user, isTester]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (rating === null) {
      toast.error('Por favor, selecione uma nota de avaliação de experiência!');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('strategic_tester_feedback')
        .insert({
          user_id: user.id,
          email: user.email || '',
          rating,
          liked_most: likedMost.trim() || null,
          confused_most: confusedMost.trim() || null,
          bugs_found: bugsFound.trim() || null,
        });

      if (error) throw error;

      // Celebrate!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success('Feedback enviado! Muito obrigado por nos ajudar a melhorar o Voo Certo.');
      
      // Save state to localStorage to prevent showing it again
      localStorage.setItem('voocerto-tester-feedback-submitted', 'true');
      setIsOpen(false);
      setIsVisible(false);
      
      // Reset form
      setRating(null);
      setLikedMost('');
      setConfusedMost('');
      setBugsFound('');
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      toast.error(`Erro ao enviar feedback: ${err.message || 'Tente novamente.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-40 max-w-sm w-[calc(100vw-48px)] p-4 rounded-xl border border-primary/25 bg-card/95 shadow-2xl backdrop-blur-md"
            style={{
              boxShadow: '0 12px 40px -10px rgba(29, 58, 99, 0.15), 0 0 1px 1px rgba(29, 58, 99, 0.05)',
            }}
          >
            {/* Close card button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                <FlaskConical className="w-5 h-5 text-primary animate-pulse" />
              </div>

              <div className="space-y-1 pr-6">
                <h4 className="text-sm font-extrabold text-foreground flex items-center gap-1.5 leading-none">
                  Você está testando a Voo Certo
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Sua opinião sincera de aviação ajuda a construir uma plataforma profissional muito melhor.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setIsOpen(true)}
                    className="h-8 text-xs font-semibold px-4 gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Dar feedback
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsVisible(false)}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 font-medium"
                  >
                    Mais tarde
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEEDBACK INPUT DIALOG */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" /> Conta pra gente sua experiência!
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Sem formulários gigantes. Respostas simples e focadas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            {/* Reaction Emojis Rating Selector */}
            <div className="space-y-2 text-center bg-muted/20 p-4 rounded-xl border border-border/80">
              <Label className="text-sm font-bold text-foreground block mb-2">
                Como está sendo sua experiência na Voo Certo?
              </Label>
              <div className="flex justify-around items-center gap-2 max-w-sm mx-auto">
                {FEEDBACK_EMOJIS.map((emoji) => {
                  const isSelected = rating === emoji.rating;
                  return (
                    <button
                      key={emoji.rating}
                      type="button"
                      onClick={() => setRating(emoji.rating)}
                      className="group flex flex-col items-center gap-1 focus:outline-none transition-transform active:scale-95"
                    >
                      <span
                        className={`text-3xl transition-transform duration-200 ${
                          isSelected 
                            ? 'scale-125 filter-none drop-shadow-md' 
                            : 'opacity-55 filter grayscale hover:grayscale-0 hover:opacity-100 hover:scale-115'
                        }`}
                      >
                        {emoji.char}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold uppercase tracking-wide transition-colors ${
                          isSelected 
                            ? 'text-primary font-black' 
                            : 'text-muted-foreground/60'
                        }`}
                      >
                        {emoji.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="liked" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                O que você mais gostou na plataforma?
              </Label>
              <Textarea
                id="liked"
                placeholder="Ex: Simulado muito rápido, explicações das matérias, design moderno..."
                value={likedMost}
                onChange={(e) => setLikedMost(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="confused" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                O que te deixou confuso ou com dúvidas?
              </Label>
              <Textarea
                id="confused"
                placeholder="Ex: Não entendi como funciona o Modo Bloco, filtros de busca..."
                value={confusedMost}
                onChange={(e) => setConfusedMost(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="bugs" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Encontrou algum bug, erro ou falha no sistema?
              </Label>
              <Textarea
                id="bugs"
                placeholder="Ex: Botão travou na página X, erro na questão do motor..."
                value={bugsFound}
                onChange={(e) => setBugsFound(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={rating === null || submitting}
                className="gap-2 font-semibold"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Enviar Feedback
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
