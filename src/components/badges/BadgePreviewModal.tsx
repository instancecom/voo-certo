import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import type { Insignia, BadgeRarity } from '@/hooks/useInsignias';

interface BadgePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insignia: Insignia;
  earnedAt?: string;
}

const rarityColors: Record<BadgeRarity, { bg: string; border: string; text: string }> = {
  bronze: { bg: 'from-amber-600 to-amber-800', border: 'border-amber-500', text: 'text-amber-700' },
  silver: { bg: 'from-slate-400 to-slate-600', border: 'border-slate-400', text: 'text-slate-600' },
  gold: { bg: 'from-yellow-400 to-yellow-600', border: 'border-yellow-500', text: 'text-yellow-600' },
  platinum: { bg: 'from-cyan-400 to-purple-500', border: 'border-cyan-400', text: 'text-cyan-600' },
};

const rarityLabels: Record<BadgeRarity, string> = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
  platinum: 'Platina',
};

const getDriveImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.includes('lh3.googleusercontent.com')) return url;
  const ucMatch = url.match(/drive\.google\.com\/uc\?export=view&id=([^&]+)/);
  if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  return url;
};

export function BadgePreviewModal({ open, onOpenChange, insignia, earnedAt }: BadgePreviewModalProps) {
  const navigate = useNavigate();
  const colors = rarityColors[insignia.rarity];
  const imageUrl = getDriveImageUrl(insignia.model_url);
  const versoTexto = insignia.verso_texto;
  const isLocked = !earnedAt;

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => onOpenChange(false)}
          onKeyDown={(e) => e.key === 'Escape' && onOpenChange(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#F5F7F9] border border-yellow-500/20 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white border-b border-border/40 p-5 flex items-center justify-between">
              <div>
                <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 bg-gradient-to-r ${colors.bg} text-white shadow-sm`}>
                  {rarityLabels[insignia.rarity]}
                </div>
                <h2 className="text-xl font-extrabold text-[#1A233A] leading-tight">{insignia.name}</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-[#1A233A] hover:bg-muted/50 -mr-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Image / Icon - Large preview */}
              <div className="flex justify-center relative">
                {isLocked && <div className="absolute inset-0 bg-white/40 z-10 rounded-2xl" />}
                <div className={`w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-white border ${colors.border} flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.15)]`}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={insignia.name}
                      className={`w-full h-full object-contain p-3 ${isLocked ? 'grayscale opacity-60' : ''}`}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <DynamicIcon
                    name={insignia.icon}
                    size={80}
                    className={`${imageUrl ? 'hidden' : colors.text} ${isLocked ? 'grayscale opacity-60' : ''}`}
                  />
                </div>
              </div>

              {/* Detailed Description */}
              {!isLocked ? (
                <>
                  <p className="text-sm text-center text-muted-foreground font-medium px-4">{insignia.description}</p>
                  <p className="text-xs text-muted-foreground/70 text-center font-semibold">
                    Conquistada em {new Date(earnedAt!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  
                  {versoTexto && (
                    <div className="relative rounded-xl border border-yellow-500/20 bg-white p-5 mt-2 shadow-sm">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F5F7F9] px-3 font-bold text-xs text-yellow-600 uppercase tracking-widest border border-yellow-500/20 rounded-full">
                        Significado
                      </div>
                      <p className="text-sm text-[#1A233A] leading-relaxed italic text-center mt-2">
                        "{versoTexto}"
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5 text-center shadow-[inset_0_1px_10px_rgba(212,175,55,0.05)] mt-4">
                  <Lock className="w-6 h-6 mx-auto text-yellow-600 mb-2" />
                  <h3 className="text-base font-bold text-[#1A233A] mb-1">
                    Conquiste esta insígnia
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium px-2 mb-4">
                    Este selo é exclusivo para planos {insignia.plano_minimo === 'comandante' ? 'Comandante' : 'Tripulante ou superior'}. 
                    Faça upgrade para ter a chance de desbloqueá-lo no seu perfil e currículo.
                  </p>
                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-md shadow-yellow-500/20"
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/premium');
                    }}
                  >
                    Fazer Upgrade Agora
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5">
              <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
