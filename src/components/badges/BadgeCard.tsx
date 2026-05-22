import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Upload, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import type { Insignia, BadgeRarity } from "@/hooks/useInsignias";
import { VerificationSubmitModal } from "./VerificationSubmitModal";
import { CertificateGeneratorModal } from "./CertificateGeneratorModal";
import { BadgePreviewModal } from "./BadgePreviewModal";
import { useUserVerifications } from "@/hooks/useBadgeVerifications";
import { useAuth } from "@/contexts/AuthContext";
import { getInsigniaFallback } from "@/hooks/useInsigniasFallback";

interface BadgeCardProps {
  insignia: Insignia;
  earned?: boolean;
  earnedAt?: string;
  showDetails?: boolean;
  large?: boolean;
  onClick?: () => void;
}

const rarityColors: Record<BadgeRarity, { text: string; bgGlow: string; badgeBg: string }> = {
  bronze: { text: "text-amber-700", bgGlow: "bg-amber-600", badgeBg: "bg-gradient-to-br from-amber-300 to-amber-600" },
  silver: { text: "text-slate-600", bgGlow: "bg-slate-400", badgeBg: "bg-gradient-to-br from-slate-200 to-slate-400" },
  gold: { text: "text-yellow-600", bgGlow: "bg-yellow-400", badgeBg: "bg-gradient-to-br from-yellow-300 to-yellow-500" },
  platinum: { text: "text-cyan-600", bgGlow: "bg-cyan-400", badgeBg: "bg-gradient-to-br from-cyan-300 to-cyan-500" },
};

const rarityLabels: Record<BadgeRarity, string> = {
  bronze: "Bronze", silver: "Prata", gold: "Ouro", platinum: "Platina",
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

export const BadgeCard = ({ insignia, earned = false, earnedAt, showDetails = true, large, onClick }: BadgeCardProps) => {
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
  const hasApprovedVerification = verification?.status === 'approved';

  const handleClick = () => {
    if (onClick) { onClick(); return; }

    if (isAnacBadge && !earned && user && !hasPendingVerification && !insignia.plano_minimo) {
      setVerificationModalOpen(true);
      return;
    }

    setPreviewModalOpen(true);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative cursor-pointer transition-all duration-300 flex flex-col items-center justify-start group mx-auto",
          large ? "w-28 sm:w-32" : "w-24 sm:w-28",
          hasPendingVerification && "opacity-90"
        )}
        onClick={handleClick}
      >
        {/* Icon Container */}
        <div className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-500",
          large ? "w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4" : "w-16 h-16 sm:w-20 sm:h-20 mb-2 sm:mb-3",
          earned ? "" : "grayscale opacity-50 group-hover:opacity-80"
        )}>
          {/* Animated Glow behind the image if earned */}
          {earned && (
            <div className={cn(
              "absolute inset-0 rounded-full blur-xl opacity-30 transition-all duration-500 group-hover:opacity-60 group-hover:scale-125 group-hover:blur-2xl",
              colors.bgGlow
            )} />
          )}

          {/* Rarity small badge */}
          {earned && (
             <div className={cn(
               "absolute -top-1 -right-2 text-[0.6rem] font-extrabold px-2 py-0.5 rounded-full shadow-lg z-20 text-white",
               colors.badgeBg
             )}>
               {rarityLabels[insignia.rarity]}
             </div>
          )}

          {/* Image / Icon */}
          <div className="relative z-10 w-full h-full flex items-center justify-center drop-shadow-xl group-hover:drop-shadow-2xl transition-all duration-500">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={insignia.name}
                className="w-full h-full object-contain transform group-hover:rotate-3 transition-transform duration-500"
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
              size={large ? 48 : 36}
              className={cn(imageUrl ? "hidden" : "transform group-hover:rotate-3 transition-transform duration-500", earned ? colors.text : "text-muted-foreground", "sm:w-[56px] sm:h-[56px]")}
            />
          </div>
        </div>

        {/* Name */}
        <h3 className={cn(
          "font-bold text-center leading-tight line-clamp-2 transition-colors duration-300",
          large ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs",
          earned ? "text-[#1A233A] group-hover:text-primary" : "text-muted-foreground group-hover:text-slate-600"
        )}>
          {insignia.name}
        </h3>

        {/* Hover info for unearned */}
        {!earned && !hasPendingVerification && (
          <div className="absolute inset-x-0 bottom-full mb-2 flex flex-col items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
            <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm border border-slate-200">
             {isAnacBadge ? <Upload size={12} /> : <Lock size={12} />}
             {isAnacBadge ? "Enviar Doc" : "Bloqueada"}
            </span>
          </div>
        )}

        {/* Pending verification info */}
        {hasPendingVerification && !earned && (
          <div className="absolute inset-x-0 bottom-full mb-2 flex flex-col items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
            <span className="text-[10px] text-yellow-700 font-semibold flex items-center gap-1 bg-yellow-100/90 px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm border border-yellow-300">
             Aguardando aprovação
            </span>
          </div>
        )}
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

      {/* Removed separate CertificateGeneratorModal as it's now integrated into BadgePreviewModal */}
    </>
  );
};
