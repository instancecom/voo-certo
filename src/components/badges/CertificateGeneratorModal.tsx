import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Download, Award, Share2, Loader2, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

import { toast } from "sonner";
import { Insignia } from "@/hooks/useInsignias";

interface CertificateGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvalId: string;
  approvedAt: string;
  userName?: string;
  insignia: Insignia & {
    tag_positions?: Record<string, {
      x: number;
      y: number;
      enabled: boolean;
      fontSize?: number;
      color?: string;
    }> | null;
  };
}

export const CertificateGeneratorModal = ({
  open,
  onOpenChange,
  approvalId,
  approvedAt,
  userName,
  insignia,
}: CertificateGeneratorModalProps) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const displayName = userName || user?.email?.split('@')[0] || 'Piloto';
  const formattedDate = new Date(approvedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const getDriveImageUrl = (url: string | null): string | null => {
    if (!url) return null;
    if (url.includes('lh3.googleusercontent.com')) return url;
    const ucMatch = url.match(/drive\.google\.com\/uc\?export=view&id=([^&]+)/);
    if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
    return url;
  };

  const generateCertificate = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use a high resolution square for the insignia
    const resolution = 1000;
    canvas.width = resolution;
    canvas.height = resolution;

    // Clear canvas (transparent background)
    ctx.clearRect(0, 0, resolution, resolution);

    // Load insignia image
    const imageUrl = getDriveImageUrl(insignia.model_url);
    if (!imageUrl) {
      toast.error("Modelo de insígnia não encontrado.");
      setIsGenerating(false);
      return;
    }

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Draw insignia to fill canvas
      ctx.drawImage(img, 0, 0, resolution, resolution);

      // Draw tags over the image
      if (insignia.tag_positions) {
        Object.entries(insignia.tag_positions).forEach(([key, tag]) => {
          if (!tag.enabled) return;
          
          let content = '';
          switch (key) {
            case 'userName': content = displayName; break;
            case 'approvalText': content = 'APROVADO ANAC'; break;
            case 'verificationDate': content = formattedDate; break;
            case 'insigniaId': content = `ID: ${approvalId}`; break;
          }

          if (!content) return;

          const tagX = (tag.x / 100) * resolution;
          const tagY = (tag.y / 100) * resolution;
          
          // Style tags
          ctx.fillStyle = tag.color || '#FFFFFF';
          // Scale font size relative to resolution
          const fontSize = (tag.fontSize || 16) * (resolution / 400); 
          ctx.font = `900 ${fontSize}px Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Stronger drop shadow for visibility
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;
          
          ctx.fillText(content.toUpperCase(), tagX, tagY);
          
          // Reset shadow
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        });
      }

      // Download
      setTimeout(() => {
        const link = document.createElement('a');
        link.download = `insignia-voocerto-${approvalId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setIsGenerating(false);
      }, 300);

    } catch (err) {
      console.error("Erro ao gerar insígnia:", err);
      toast.error("Erro ao processar imagem.");
      setIsGenerating(false);
    }
  };

  const drawFallbackIcon = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(imageUrl ? 300 : 600, 100);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 40, Math.sin((18 + i * 72) * Math.PI / 180) * 40);
      ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 20, Math.sin((54 + i * 72) * Math.PI / 180) * 20);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Compartilhar Insígnia
          </DialogTitle>
          <DialogDescription>
            Gere sua insígnia personalizada para compartilhar suas conquistas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-slate-950 rounded-[5px] p-8 border border-white/10 text-center overflow-hidden flex items-center justify-center min-h-[300px]"
          >
            {/* Soft glow background */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
            
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center z-10">
              {insignia.model_url ? (
                <div className="relative w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <img 
                    src={getDriveImageUrl(insignia.model_url) || ''} 
                    alt={insignia.name} 
                    className="w-full h-full object-contain" 
                  />
                  
                  {/* Tags Preview */}
                  {insignia.tag_positions && (
                    <div className="absolute inset-0 pointer-events-none">
                      {Object.entries(insignia.tag_positions).map(([key, tag]) => {
                        if (!tag.enabled) return null;
                        
                        let content = '';
                        switch (key) {
                          case 'userName': content = displayName; break;
                          case 'approvalText': content = 'APROVADO ANAC'; break;
                          case 'verificationDate': content = formattedDate; break;
                          case 'insigniaId': content = `ID: ${approvalId.slice(0, 8).toUpperCase()}`; break;
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
                              fontSize: `${(tag.fontSize || 10) * 0.65}px`,
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
                <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                  <Award className="w-12 h-12 text-yellow-500" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Info text */}
          <div className="text-center space-y-1">
            <h4 className="font-bold text-white uppercase tracking-wider text-sm">{insignia.name}</h4>
            <p className="text-xs text-muted-foreground">
              Aprovado em {formattedDate} • ID: {approvalId}
            </p>
          </div>

          {/* Hidden canvas for generation */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Fechar
            </Button>
            <Button
              onClick={generateCertificate}
              disabled={isGenerating}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Gerar Agora
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Imagem PNG de alta resolução • Fundo transparente
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
