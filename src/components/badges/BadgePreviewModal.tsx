import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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
  bronze: { bg: 'from-amber-700 to-amber-900', border: 'border-amber-500', text: 'text-amber-200' },
  silver: { bg: 'from-slate-400 to-slate-600', border: 'border-slate-300', text: 'text-slate-100' },
  gold: { bg: 'from-yellow-400 to-yellow-600', border: 'border-yellow-300', text: 'text-yellow-100' },
  platinum: { bg: 'from-cyan-300 via-purple-400 to-pink-400', border: 'border-cyan-200', text: 'text-white' },
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
  const colors = rarityColors[insignia.rarity];
  const versoTexto = insignia.verso_texto;

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
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${colors.bg} p-5 flex items-center justify-between`}>
              <div>
                <p className="text-xs font-medium text-white/60 uppercase tracking-wider">Insígnia {rarityLabels[insignia.rarity]}</p>
                <h2 className="text-lg font-bold text-white">{insignia.name}</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Image / Icon - Large preview */}
              <div className="flex justify-center">
                <div className={`w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-gradient-to-br ${colors.bg} ${colors.border} border-2 flex items-center justify-center overflow-hidden shadow-lg`}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={insignia.name}
                      className="w-full h-full object-contain p-3"
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
                    className={imageUrl ? 'hidden' : `${colors.text}`}
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground text-center">{insignia.description}</p>

              {/* Earned date */}
              {earnedAt && (
                <p className="text-xs text-muted-foreground text-center">
                  Conquistada em {new Date(earnedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              )}

              {/* Verso / Motivation message */}
              {versoTexto ? (
                <div className="relative rounded-xl border-2 border-accent/30 bg-accent/5 p-5">
                  <div className="absolute -top-3 left-4 bg-card px-2 text-xs font-semibold text-accent uppercase tracking-wider">
                    Mensagem
                  </div>
                  <p className="text-sm text-foreground leading-relaxed italic">
                    "{versoTexto}"
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Esta insígnia não possui mensagem de verso</p>
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
