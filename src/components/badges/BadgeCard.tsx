import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Upload, Award, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import type { Insignia, BadgeRarity } from "@/hooks/useInsignias";
import { VerificationSubmitModal } from "./VerificationSubmitModal";
import { BadgePreviewModal } from "./BadgePreviewModal";
import { useUserVerifications } from "@/hooks/useBadgeVerifications";
import { useAuth } from "@/contexts/AuthContext";
import { getInsigniaFallback } from "@/hooks/useInsigniasFallback";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BadgeCardProps {
  insignia: Insignia;
  earned?: boolean;
  earnedAt?: string;
  showDetails?: boolean;
  large?: boolean;
  onClick?: () => void;
}

const rarityColors: Record<BadgeRarity, { text: string; bgGlow: string; badgeBg: string; borderAccent: string }> = {
  bronze: {
    text: "text-amber-700",
    bgGlow: "bg-amber-600",
    badgeBg: "bg-gradient-to-br from-amber-400 to-amber-600",
    borderAccent: "border-amber-500/30 hover:border-amber-500/60",
  },
  silver: {
    text: "text-slate-600",
    bgGlow: "bg-slate-400",
    badgeBg: "bg-gradient-to-br from-slate-300 to-slate-500",
    borderAccent: "border-slate-300 hover:border-slate-400",
  },
  gold: {
    text: "text-yellow-600",
    bgGlow: "bg-yellow-400",
    badgeBg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    borderAccent: "border-yellow-500/40 hover:border-yellow-500/70",
  },
  platinum: {
    text: "text-cyan-600",
    bgGlow: "bg-cyan-400",
    badgeBg: "bg-gradient-to-br from-cyan-400 to-cyan-600",
    borderAccent: "border-cyan-500/40 hover:border-cyan-500/70",
  },
};

const rarityLabels: Record<BadgeRarity, string> = {
  bronze: "Bronze",
  silver: "Prata",
  gold: "Ouro",
  platinum: "Platina",
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

export const BadgeCard = ({
  insignia,
  earned = false,
  earnedAt,
  showDetails = true,
  large,
  onClick
}: BadgeCardProps) => {
  const { user } = useAuth();
  const colors = rarityColors[insignia.rarity];
  const fallback = getInsigniaFallback(insignia.name);
  const imageUrl = getDriveImageUrl(insignia.model_url) || fallback?.model_url || null;
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const { data: userVerifications } = useUserVerifications();

  const isAnacBadge = insignia.condition_type === 'anac_approval';
  const verification = userVerifications?.find((v) => v.insignia_id === insignia.id);
  const hasPendingVerification = verification?.status === 'pending';

  const handleClick = () => {
    if (onClick) { onClick(); return; }

    if (isAnacBadge && !earned && user && !hasPendingVerification && !insignia.plano_minimo) {
      setVerificationModalOpen(true);
      return;
    }

    setPreviewModalOpen(true);
  };

  const formattedDate = earnedAt ? (() => {
    try {
      return format(new Date(earnedAt), "dd/MM/yy", { locale: ptBR });
    } catch {
      return null;
    }
  })() : null;

  return (
    <>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative cursor-pointer transition-all duration-300 flex flex-col items-center justify-between text-center p-2.5 sm:p-4 rounded-[5px] border bg-white dark:bg-card shadow-sm hover:shadow-md group h-full min-h-[115px] sm:min-h-[225px] w-full",
          earned
            ? `${colors.borderAccent} bg-gradient-to-b from-white to-amber-50/20 dark:from-card dark:to-card`
            : "border-border/70 hover:border-border/90 bg-slate-50/50 dark:bg-card/40 opacity-75 hover:opacity-100",
          hasPendingVerification && "border-yellow-400 bg-yellow-50/30"
        )}
        onClick={handleClick}
      >
        {/* Rarity Pill Top-Right (Desktop Only) */}
        <div className="hidden sm:flex w-full items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider truncate">
            {insignia.condition_type === 'anac_approval' ? 'ANAC' : 'Conquista'}
          </span>
          <span
            className={cn(
              "text-[9px] font-extrabold px-2 py-0.5 rounded-[4px] text-white shadow-sm shrink-0",
              colors.badgeBg
            )}
          >
            {rarityLabels[insignia.rarity]}
          </span>
        </div>

        {/* Mobile Tiny Lock Icon */}
        {!earned && (
          <div className="sm:hidden absolute top-2 right-2 text-muted-foreground/50">
            <Lock className="w-2.5 h-2.5" />
          </div>
        )}
        {hasPendingVerification && (
          <div className="sm:hidden absolute top-2 right-2 text-yellow-500">
            <Clock className="w-2.5 h-2.5" />
          </div>
        )}

        {/* Insignia Icon Container with Glow */}
        <div className={cn(
          "relative flex items-center justify-center my-1 sm:my-2",
          large ? "w-14 h-14 sm:w-24 sm:h-24" : "w-13 h-13 sm:w-20 sm:h-20",
          earned ? "" : "grayscale opacity-50 group-hover:opacity-80"
        )}>
          {/* Animated Glow behind the image if earned */}
          {earned && (
            <div className={cn(
              "absolute inset-0 rounded-full blur-xl opacity-30 transition-all duration-500 group-hover:opacity-60 group-hover:scale-125 group-hover:blur-2xl",
              colors.bgGlow
            )} />
          )}

          {/* Image / Icon */}
          <div className="relative z-10 w-full h-full flex items-center justify-center drop-shadow-md group-hover:drop-shadow-xl transition-all duration-500">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={insignia.name}
                className="w-full h-full object-contain transform group-hover:scale-105 group-hover:rotate-2 transition-transform duration-500"
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
              size={large ? 40 : 32}
              className={cn(
                imageUrl ? "hidden" : "transform group-hover:scale-105 transition-transform duration-500",
                earned ? colors.text : "text-muted-foreground"
              )}
            />
          </div>
        </div>

        {/* Text Section (Name on mobile, Name + Description on desktop) */}
        <div className="w-full space-y-1 my-0.5 sm:my-1">
          <h3 className={cn(
            "font-bold text-[11px] sm:text-sm text-center leading-tight line-clamp-1 transition-colors duration-200",
            earned ? "text-[#1A233A] dark:text-foreground group-hover:text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {insignia.name}
          </h3>

          <p className="hidden sm:flex text-[11px] text-muted-foreground line-clamp-2 leading-relaxed px-1 min-h-[30px] items-center justify-center">
            {insignia.description || "Conquista especial da jornada aeronáutica."}
          </p>
        </div>

        {/* Bottom Status Pill (Desktop Only) */}
        <div className="hidden sm:flex pt-2 w-full justify-center">
          {earned ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>{formattedDate ? `Conquistada em ${formattedDate}` : "Conquistada"}</span>
            </div>
          ) : hasPendingVerification ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-yellow-500/15 border border-yellow-500/30 text-yellow-800 dark:text-yellow-300 text-[10px] font-bold">
              <Clock className="w-3 h-3 text-yellow-600" />
              <span>Em análise</span>
            </div>
          ) : isAnacBadge ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Upload className="w-3 h-3" />
              <span>Enviar Doc</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-muted text-muted-foreground border border-border/80 text-[10px] font-medium">
              <Lock className="w-3 h-3" />
              <span>Bloqueada</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <BadgePreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        insignia={insignia}
        earnedAt={earnedAt}
        approvalId={verification?.approval_id}
      />

      <VerificationSubmitModal
        open={verificationModalOpen}
        onOpenChange={setVerificationModalOpen}
        insigniaId={insignia.id}
        insigniaName={insignia.name}
      />
    </>
  );
};
