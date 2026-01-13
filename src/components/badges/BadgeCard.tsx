import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import type { Insignia, BadgeRarity } from "@/hooks/useInsignias";

interface BadgeCardProps {
  insignia: Insignia;
  earned?: boolean;
  earnedAt?: string;
  showDetails?: boolean;
  onClick?: () => void;
}

const rarityColors: Record<BadgeRarity, { bg: string; border: string; text: string; glow: string }> = {
  bronze: {
    bg: "bg-gradient-to-br from-amber-700 to-amber-900",
    border: "border-amber-600",
    text: "text-amber-200",
    glow: "shadow-amber-500/30",
  },
  silver: {
    bg: "bg-gradient-to-br from-slate-400 to-slate-600",
    border: "border-slate-300",
    text: "text-slate-100",
    glow: "shadow-slate-400/30",
  },
  gold: {
    bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    border: "border-yellow-300",
    text: "text-yellow-100",
    glow: "shadow-yellow-400/40",
  },
  platinum: {
    bg: "bg-gradient-to-br from-cyan-300 via-purple-400 to-pink-400",
    border: "border-cyan-200",
    text: "text-white",
    glow: "shadow-purple-400/50",
  },
};

const rarityLabels: Record<BadgeRarity, string> = {
  bronze: "Bronze",
  silver: "Prata",
  gold: "Ouro",
  platinum: "Platina",
};

export const BadgeCard = ({ insignia, earned = false, earnedAt, showDetails = true, onClick }: BadgeCardProps) => {
  const colors = rarityColors[insignia.rarity];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative rounded-xl p-4 border-2 cursor-pointer transition-all duration-300",
        colors.border,
        earned ? colors.bg : "bg-muted/50 border-muted-foreground/20",
        earned && `shadow-lg ${colors.glow}`,
        !earned && "opacity-50 grayscale"
      )}
      onClick={onClick}
    >
      {/* Rarity badge */}
      <div className={cn(
        "absolute -top-2 -right-2 text-[10px] font-bold px-2 py-0.5 rounded-full",
        earned ? colors.bg : "bg-muted",
        earned ? colors.text : "text-muted-foreground"
      )}>
        {rarityLabels[insignia.rarity]}
      </div>

      {/* Icon */}
      <div className={cn(
        "w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center",
        earned ? "bg-white/20" : "bg-muted-foreground/10"
      )}>
        <DynamicIcon 
          name={insignia.icon}
          size={28} 
          className={cn(
            earned ? colors.text : "text-muted-foreground"
          )} 
        />
      </div>

      {/* Name */}
      <h3 className={cn(
        "text-sm font-bold text-center mb-1 line-clamp-2",
        earned ? colors.text : "text-muted-foreground"
      )}>
        {insignia.name}
      </h3>

      {/* Description */}
      {showDetails && (
        <p className={cn(
          "text-[11px] text-center line-clamp-2",
          earned ? "text-white/70" : "text-muted-foreground/70"
        )}>
          {insignia.description}
        </p>
      )}

      {/* Earned date */}
      {earned && earnedAt && (
        <p className="text-[10px] text-center text-white/50 mt-2">
          {new Date(earnedAt).toLocaleDateString("pt-BR")}
        </p>
      )}

      {/* Locked overlay */}
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20">
          <Lock className="text-muted-foreground/50" size={20} />
        </div>
      )}
    </motion.div>
  );
};
