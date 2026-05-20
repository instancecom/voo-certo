import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { cn } from '@/lib/utils';
import type { Insignia, BadgeRarity } from '@/hooks/useInsignias';
import { getInsigniaFallback } from '@/hooks/useInsigniasFallback';

interface InsigniaTag {
  x: number;
  y: number;
  enabled: boolean;
  fontSize?: number;
  color?: string;
}

interface BadgePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insignia: Insignia & {
    tag_positions?: Record<string, InsigniaTag> | null;
  };
  earnedAt?: string;
  approvalId?: string;
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

import { useAuth } from '@/contexts/AuthContext';

import { useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { bakeBadgeMetadata } from '@/lib/badge-baker';

export function BadgePreviewModal({ open, onOpenChange, insignia, earnedAt, approvalId }: BadgePreviewModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAuthenticity, setShowAuthenticity] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Piloto';
  const formattedDate = earnedAt ? new Date(earnedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) : '';
  const colors = rarityColors[insignia.rarity];
  const fallback = getInsigniaFallback(insignia.name);
  const imageUrl = getDriveImageUrl(insignia.model_url) || fallback?.model_url || null;
  const versoTexto = insignia.verso_texto || fallback?.verso_texto || null;
  const isLocked = !earnedAt;

  const generateInsignia = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;

    setIsGenerating(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resolution = 1000;
    canvas.width = resolution;
    canvas.height = resolution;
    
    // Explicitly clear canvas for transparency
    ctx.clearRect(0, 0, resolution, resolution);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Draw image with contain logic to avoid stretching
      const imgWidth = img.width;
      const imgHeight = img.height;
      const ratio = Math.min(resolution / imgWidth, resolution / imgHeight);
      const newWidth = imgWidth * ratio;
      const newHeight = imgHeight * ratio;
      const x = (resolution - newWidth) / 2;
      const y = (resolution - newHeight) / 2;
      
      ctx.drawImage(img, x, y, newWidth, newHeight);

      if (insignia.tag_positions) {
        Object.entries(insignia.tag_positions).forEach(([key, tag]) => {
          if (!tag.enabled) return;
          
          let content = '';
          switch (key) {
            case 'userName': content = displayName; break;
            case 'approvalText': content = 'APROVADO ANAC'; break;
            case 'verificationDate': content = formattedDate; break;
            case 'insigniaId': content = `ID: ${approvalId || insignia.id.slice(0, 8).toUpperCase()}`; break;
          }

          if (!content) return;

          const tagX = (tag.x / 100) * resolution;
          const tagY = (tag.y / 100) * resolution;
          
          // Style tags
          ctx.fillStyle = tag.color || '#FFFFFF';
          // Scale font size proportional to resolution (using 400 as base width)
          const fontSize = (tag.fontSize || 12) * (resolution / 400); 
          ctx.font = `900 ${fontSize}px "Plus Jakarta Sans", Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;
          ctx.fillText(content.toUpperCase(), tagX, tagY);
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        });
      }

      const finalApprovalId = approvalId || insignia.id.slice(0, 8).toUpperCase();
      
      const canvasBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      // Bake Metadata (Cisco/Open Badges style)
      const bakedBlob = await bakeBadgeMetadata(canvasBlob, {
        recipient: user?.email || 'piloto@voocerto.com.br',
        issuedOn: new Date().toISOString(),
        badgeId: insignia.id,
        approvalId: finalApprovalId,
        verifyUrl: `${window.location.origin}/verificar/${finalApprovalId}`,
        issuerName: "Voo Certo",
        origin: window.location.origin
      });

      const url = URL.createObjectURL(bakedBlob);
      const link = document.createElement('a');
      link.download = `insignia-voocerto-${finalApprovalId}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar imagem.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => onOpenChange(false)}
        >
          {/* Backdrop with strong blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-[20px]" 
          />

          {/* Floating Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 flex flex-col items-center gap-12 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* The Insignia Image/Icon */}
            <div 
              className="relative w-64 h-64 sm:w-80 sm:h-80 cursor-pointer perspective-1000 group"
              onClick={() => !isLocked && setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="w-full h-full preserve-3d"
                animate={{ 
                  rotateY: isFlipped ? 180 : 0,
                  y: [0, -15, 0]
                }}
                transition={{ 
                  rotateY: { duration: 0.8, type: 'spring', stiffness: 200, damping: 20 },
                  y: { repeat: Infinity, duration: 5, ease: "easeInOut" }
                }}
              >
                {/* Front Side: Just the PNG/Icon */}
                <div className="absolute inset-0 backface-hidden flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Glow Effect behind the insignia */}
                    <div className={cn(
                      "absolute inset-0 rounded-full blur-[60px] opacity-20 scale-75",
                      insignia.rarity === 'gold' ? 'bg-yellow-500' : 
                      insignia.rarity === 'platinum' ? 'bg-purple-500' : 
                      insignia.rarity === 'silver' ? 'bg-slate-300' : 'bg-amber-700'
                    )} />
                    
                    {imageUrl ? (
                      <div className="relative w-full h-full rounded-full overflow-hidden bg-checkerboard/10 group-hover:bg-checkerboard/20 transition-colors">
                        <img 
                          src={imageUrl} 
                          alt={insignia.name} 
                          className={cn(
                            "w-full h-full object-contain filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500",
                            isLocked && "grayscale brightness-50 opacity-40 blur-[2px]"
                          )}
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Dynamic Tags Overlay */}
                        {!isLocked && insignia.tag_positions && (
                          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                            {Object.entries(insignia.tag_positions).map(([key, tag]) => {
                              if (!tag.enabled) return null;
                              
                              let content = '';
                              switch (key) {
                                case 'userName': content = displayName; break;
                                case 'approvalText': content = 'APROVADO ANAC'; break;
                                case 'verificationDate': content = formattedDate; break;
                                case 'insigniaId': content = `ID: ${approvalId || insignia.id.slice(0, 8).toUpperCase()}`; break;
                              }

                              if (!content) return null;

                              return (
                                <div
                                  key={key}
                                  className="absolute whitespace-nowrap font-black uppercase text-center"
                                  style={{
                                    left: `${tag.x}%`,
                                    top: `${tag.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    // Proportional font size: (base / 400) * 100% of container width
                                    fontSize: `calc((${tag.fontSize || 12} / 400) * 100%)`,
                                    color: tag.color || '#FFFFFF',
                                    textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.5)'
                                  }}
                                >
                                  {content}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <DynamicIcon 
                        name={insignia.icon} 
                        size={160} 
                        className={cn(
                          "filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]",
                          colors.text, 
                          isLocked && "grayscale opacity-30 blur-[2px]"
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Back Side: Verso */}
                <div 
                  className="absolute inset-0 backface-hidden flex flex-col items-center justify-center"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-[5px] p-8 border border-white/20 shadow-2xl max-w-xs">
                    <h4 className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Significado</h4>
                    <p className="text-white text-lg font-bold italic leading-relaxed">
                      {versoTexto ? `"${versoTexto}"` : "Esta insígnia representa sua dedicação e excelência na sua jornada como aviador."}
                    </p>
                    <div className="mt-6 flex justify-center">
                      <div className="w-1 h-1 rounded-full bg-white/20 mx-1" />
                      <div className="w-1 h-1 rounded-full bg-white/40 mx-1" />
                      <div className="w-1 h-1 rounded-full bg-white/20 mx-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Interaction Hint */}
              {!isLocked && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="absolute -bottom-8 left-0 right-0 text-center"
                >
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Clique para virar</span>
                </motion.div>
              )}
            </div>

            {/* Info Section */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className={cn(
                  "inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl mb-4 bg-gradient-to-r",
                  colors.bg
                )}>
                  {rarityLabels[insignia.rarity]}
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-2xl px-4">
                  {insignia.name}
                </h2>
                <p className="text-white/60 text-sm font-medium max-w-sm mx-auto leading-relaxed px-6">
                  {insignia.description}
                </p>
              </motion.div>
              
              {isLocked ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-6 flex flex-col items-center gap-4"
                >
                  <div className="flex items-center gap-2 text-yellow-500/80 bg-yellow-500/10 px-4 py-2 rounded-[5px] border border-yellow-500/20">
                    <Lock size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">Requisito: Plano {insignia.plano_minimo || 'Tripulante'}</span>
                  </div>
                  <Button 
                    className="bg-white text-black hover:bg-[#F5F7F9] font-black uppercase text-xs tracking-widest px-8 h-12 rounded-[5px] shadow-2xl"
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/premium');
                    }}
                  >
                    Fazer Upgrade
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-4"
                >
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    Conquistada em {new Date(earnedAt!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>

                  {approvalId && (
                    <p className="text-yellow-500/60 font-mono text-[10px] mt-1 uppercase">
                      ID: {approvalId}
                    </p>
                  )}
                  
                  {/* Generate Button for ANAC badges */}
                  {insignia.condition_type === 'anac_approval' && imageUrl && (
                    <div className="mt-6 flex flex-col items-center gap-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={generateInsignia}
                          disabled={isGenerating}
                          className="bg-green-600 hover:bg-green-700 text-white font-black uppercase text-[10px] tracking-widest px-6 h-10 rounded-[5px] shadow-2xl"
                        >
                          {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          Download PNG
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => setShowAuthenticity(!showAuthenticity)}
                          className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest px-6 h-10 rounded-[5px]"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2 text-success" />
                          {showAuthenticity ? 'Ocultar Detalhes' : 'Verificar'}
                        </Button>
                      </div>

                      {showAuthenticity && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-full mt-4 p-4 rounded-[5px] bg-white/5 border border-white/10 text-left space-y-3"
                        >
                          <div className="flex items-center gap-2 text-success mb-1">
                            <CheckCircle2 size={14} />
                            <span className="text-[10px] font-black uppercase tracking-wider">Credencial Autêntica</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[9px] text-white/40 uppercase font-bold tracking-tight">Emitido para</p>
                              <p className="text-[11px] text-white font-medium truncate">{user?.email}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-white/40 uppercase font-bold tracking-tight">ID Verificação</p>
                              <p className="text-[11px] text-yellow-500 font-mono font-bold uppercase">{approvalId || 'PENDENTE'}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-white/40 uppercase font-bold tracking-tight">Data Conquista</p>
                              <p className="text-[11px] text-white font-medium">{formattedDate}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-white/40 uppercase font-bold tracking-tight">Status</p>
                              <p className="text-[11px] text-green-400 font-bold uppercase">Ativo</p>
                            </div>
                          </div>

                            <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2 h-8 text-[9px] font-black uppercase tracking-widest text-yellow-500 hover:bg-yellow-500/10 border border-yellow-500/20"
                            onClick={() => {
                              const verifyUrl = `${window.location.origin}/verificar/${approvalId || insignia.id.slice(0, 8).toUpperCase()}`;
                              navigator.clipboard.writeText(verifyUrl);
                              toast.success("Link de verificação copiado!");
                            }}
                          >
                            <ExternalLink size={12} className="mr-2" />
                            Copiar Link para LinkedIn
                          </Button>
                        </motion.div>
                      )}
                      
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Close hint */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={() => onOpenChange(false)}
              className="mt-8 text-white/30 hover:text-white/60 transition-colors flex items-center gap-2 group"
            >
              <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Fechar</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
