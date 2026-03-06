import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Upload, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import type { Insignia, BadgeRarity } from "@/hooks/useInsignias";
import { VerificationSubmitModal } from "./VerificationSubmitModal";
import { CertificateGeneratorModal } from "./CertificateGeneratorModal";
import { useUserVerifications, BadgeVerification } from "@/hooks/useBadgeVerifications";
import { useAuth } from "@/contexts/AuthContext";

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

// Convert old Drive URLs to working format
const getDriveImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  // Already using lh3 format
  if (url.includes('lh3.googleusercontent.com')) return url;
  // Convert uc?export=view format
  const ucMatch = url.match(/drive\.google\.com\/uc\?export=view&id=([^&]+)/);
  if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  // Convert /file/d/ format
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  return url;
};

export const BadgeCard = ({ insignia, earned = false, earnedAt, showDetails = true, onClick }: BadgeCardProps) => {
  const { user } = useAuth();
  const colors = rarityColors[insignia.rarity];
  const imageUrl = getDriveImageUrl(insignia.model_url);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const { data: userVerifications } = useUserVerifications();

  // Check if this is an ANAC approval badge
  const isAnacBadge = insignia.condition_type === 'anac_approval';
  
  // Find verification for this badge
  const verification = userVerifications?.find(
    (v) => v.insignia_id === insignia.id
  );
  
  const hasPendingVerification = verification?.status === 'pending';
  const hasApprovedVerification = verification?.status === 'approved';

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    // If ANAC badge and not earned
    if (isAnacBadge && !earned && user) {
      if (!hasPendingVerification) {
        setVerificationModalOpen(true);
      }
    }
    
    // If earned ANAC badge, open certificate generator
    if (isAnacBadge && earned && hasApprovedVerification) {
      setCertificateModalOpen(true);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative rounded-xl p-4 border-2 cursor-pointer transition-all duration-300",
          colors.border,
          earned ? colors.bg : "bg-muted/50 border-muted-foreground/20",
          earned && `shadow-lg ${colors.glow}`,
          !earned && "opacity-50 grayscale",
          hasPendingVerification && "opacity-75 grayscale-0 border-yellow-500/50"
        )}
        onClick={handleClick}
      >
        {/* Rarity badge */}
        <div className={cn(
          "absolute -top-2 -right-2 text-[10px] font-bold px-2 py-0.5 rounded-full",
          earned ? colors.bg : "bg-muted",
          earned ? colors.text : "text-muted-foreground"
        )}>
          {rarityLabels[insignia.rarity]}
        </div>

        {/* Icon or Model Image */}
        <div className={cn(
          "w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center overflow-hidden",
          earned ? "bg-white/20" : "bg-muted-foreground/10"
        )}>
          {insignia.model_url ? (
            <img
              src={insignia.model_url}
              alt={insignia.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <DynamicIcon 
            name={insignia.icon}
            size={28} 
            className={cn(
              insignia.model_url ? "hidden" : "",
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

        {/* Generate certificate button for earned ANAC badges */}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/20">
            {isAnacBadge ? (
              <>
                <Upload className="text-muted-foreground/50" size={20} />
                <span className="text-[10px] text-muted-foreground/50 mt-1">Enviar comprovante</span>
              </>
            ) : (
              <Lock className="text-muted-foreground/50" size={20} />
            )}
          </div>
        )}

        {/* Pending verification overlay */}
        {hasPendingVerification && !earned && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-yellow-500/10">
            <span className="text-[10px] text-yellow-600 font-medium">Aguardando aprovação</span>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <VerificationSubmitModal
        open={verificationModalOpen}
        onOpenChange={setVerificationModalOpen}
        insigniaId={insignia.id}
        insigniaName={insignia.name}
      />

      {hasApprovedVerification && (
        <CertificateGeneratorModal
          open={certificateModalOpen}
          onOpenChange={setCertificateModalOpen}
          approvalId={verification?.approval_id || ''}
          approvedAt={verification?.reviewed_at || new Date().toISOString()}
        />
      )}
    </>
  );
};
