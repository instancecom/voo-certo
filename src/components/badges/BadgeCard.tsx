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

interface BadgeCardProps {
  insignia: Insignia;
  earned?: boolean;
  earnedAt?: string;
  showDetails?: boolean;
  large?: boolean;
  onClick?: () => void;
}

const rarityColors: Record<BadgeRarity, { border: string; text: string; glow: string }> = {
  bronze: { border: "border-amber-600", text: "text-amber-700", glow: "shadow-amber-600/20" },
  silver: { border: "border-slate-400", text: "text-slate-600", glow: "shadow-slate-400/20" },
  gold: { border: "border-yellow-400", text: "text-yellow-600", glow: "shadow-yellow-400/30" },
  platinum: { border: "border-cyan-400", text: "text-cyan-600", glow: "shadow-cyan-400/30" },
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
  const imageUrl = getDriveImageUrl(insignia.model_url);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative rounded-[5px] border-2 cursor-pointer transition-all duration-300 overflow-hidden",
          large ? "p-6" : "p-4",
          earned ? `bg-white ${colors.border} ${colors.glow} shadow-md` : "bg-[#EAEFF5] border-transparent opacity-80",
          hasPendingVerification && "opacity-90 grayscale-0 border-yellow-500/50"
        )}
        onClick={handleClick}
      >
        {/* Rarity badge */}
        <div className={cn(
          "absolute -top-1.5 -right-1.5 text-[0.65rem] font-bold px-2 py-0.5 rounded-[5px] shadow-sm z-10",
          earned ? "bg-white" : "bg-[#F5F7F9]",
          earned ? colors.text : "text-muted-foreground",
          earned ? `border ${colors.border}` : "border border-border"
        )}>
          {rarityLabels[insignia.rarity]}
        </div>

        {/* Icon or Model Image */}
        <div className={cn(
          "mx-auto mb-3 rounded-[5px] flex items-center justify-center overflow-hidden drop-shadow-sm",
          large ? "w-20 h-20" : "w-14 h-14",
          earned ? "bg-[#F5F7F9]" : "bg-muted-foreground/5",
          !earned && "grayscale opacity-70"
        )}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={insignia.name}
              className="w-full h-full object-contain p-2"
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
            size={large ? 38 : 28}
            className={cn(imageUrl ? "hidden" : "", earned ? colors.text : "text-muted-foreground")}
          />
        </div>

        {/* Name */}
        <h3 className={cn(
          "font-bold text-center mb-1 line-clamp-2",
          large ? "text-base" : "text-sm",
          earned ? "text-[#1A233A]" : "text-muted-foreground"
        )}>
          {insignia.name}
        </h3>

        {/* Description */}
        {showDetails && (
          <p className={cn(
            "text-center line-clamp-2",
            large ? "text-xs mt-2" : "text-[11px]",
            earned ? "text-muted-foreground" : "text-muted-foreground/70"
          )}>
            {insignia.description}
          </p>
        )}

        {/* Earned date */}
        {earned && earnedAt && (
          <p className="text-[10px] text-center text-muted-foreground/80 mt-2 font-medium">
            {new Date(earnedAt).toLocaleDateString("pt-BR")}
          </p>
        )}

        {/* Certificate hint for ANAC */}
        {earned && isAnacBadge && hasApprovedVerification && (
          <div className="mt-2 text-center">
            <span className="text-[10px] text-white/70 flex items-center justify-center gap-1">
              <Award className="w-3 h-3" />
              Clique para gerar certificado
            </span>
          </div>
        )}

        {/* Locked overlay */}
        {!earned && !hasPendingVerification && (
          <div className="absolute inset-x-0 bottom-0 top-1/2 flex flex-col items-center justify-end pb-3 bg-gradient-to-t from-background/90 to-transparent">
            {isAnacBadge ? (
               <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 bg-[#F5F7F9] px-2 py-0.5 rounded-[5px] border border-border">
                 <Upload size={12} />
                 Enviar Doc
               </span>
            ) : (
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 bg-[#F5F7F9] px-2 py-0.5 rounded-[5px] border border-border">
                 <Lock size={12} />
                 Bloqueada
               </span>
            )}
          </div>
        )}

        {/* Pending verification overlay */}
        {hasPendingVerification && !earned && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[5px] bg-yellow-500/10">
            <span className="text-[10px] text-yellow-600 font-medium">Aguardando aprovação</span>
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
