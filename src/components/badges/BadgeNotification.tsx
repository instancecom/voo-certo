import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import type { Insignia, BadgeRarity } from "@/hooks/useInsignias";
import confetti from "canvas-confetti";

interface BadgeNotificationProps {
  badge: Insignia | null;
  onClose: () => void;
}

const rarityColors: Record<BadgeRarity, { bg: string; border: string; text: string }> = {
  bronze: {
    bg: "from-amber-700 to-amber-900",
    border: "border-amber-400",
    text: "text-amber-200",
  },
  silver: {
    bg: "from-slate-400 to-slate-600",
    border: "border-slate-200",
    text: "text-slate-100",
  },
  gold: {
    bg: "from-yellow-400 to-yellow-600",
    border: "border-yellow-200",
    text: "text-yellow-100",
  },
  platinum: {
    bg: "from-cyan-300 via-purple-400 to-pink-400",
    border: "border-cyan-200",
    text: "text-white",
  },
};

const rarityLabels: Record<BadgeRarity, string> = {
  bronze: "Bronze",
  silver: "Prata",
  gold: "Ouro",
  platinum: "Platina",
};

export const BadgeNotification = ({ badge, onClose }: BadgeNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (badge) {
      setIsVisible(true);
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: badge.rarity === 'platinum' 
          ? ['#22d3ee', '#a855f7', '#ec4899'] 
          : badge.rarity === 'gold'
          ? ['#fbbf24', '#f59e0b', '#d97706']
          : badge.rarity === 'silver'
          ? ['#94a3b8', '#64748b', '#475569']
          : ['#b45309', '#92400e', '#78350f']
      });

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 500);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [badge, onClose]);

  if (!badge) return null;

  const colors = rarityColors[badge.rarity];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className={cn(
              "relative px-6 py-4 rounded-2xl border-2 shadow-2xl",
              `bg-gradient-to-br ${colors.bg}`,
              colors.border
            )}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-white/10 blur-xl" />

            {/* Content */}
            <div className="relative flex items-center gap-4">
              {/* Animated icon */}
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center"
              >
                <DynamicIcon name={badge.icon} size={36} className={colors.text} />
              </motion.div>

              {/* Text */}
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/80 text-sm font-medium"
                >
                  🎉 Nova Conquista Desbloqueada!
                </motion.p>
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className={cn("text-lg font-bold", colors.text)}
                >
                  {badge.name}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/60 text-xs"
                >
                  {badge.description} • {rarityLabels[badge.rarity]}
                </motion.p>
              </div>

              {/* Close button */}
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 500);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
