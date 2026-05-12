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

    // Canvas dimensions (1200x600 for LinkedIn)
    canvas.width = 1200;
    canvas.height = 600;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 600);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 600);

    // Border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 1160, 560);

    // Inner border
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, 1140, 540);

    // Load insignia image if exists
    const imageUrl = getDriveImageUrl(insignia.model_url);
    if (imageUrl) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Draw image on the left (square)
        const size = 400;
        const x = 100;
        const y = 100;
        ctx.drawImage(img, x, y, size, size);

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

            const tagX = x + (tag.x / 100) * size;
            const tagY = y + (tag.y / 100) * size;
            
            ctx.fillStyle = tag.color || '#FFFFFF';
            ctx.font = `black ${tag.fontSize || 12}px Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.fillText(content.toUpperCase(), tagX, tagY);
            ctx.shadowBlur = 0;
          });
        }
      } catch (err) {
        console.error("Erro ao carregar imagem para o canvas:", err);
        // Fallback to old icon if image fails
        drawFallbackIcon(ctx);
      }
    } else {
      drawFallbackIcon(ctx);
    }

    // Title & Content (Right side)
    const textX = imageUrl ? 850 : 600;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICADO DE APROVAÇÃO', textX, 180);

    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('BANCA ANAC - VOO CERTO', textX, 220);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.fillText(displayName.toUpperCase(), textX, 300);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText('Concluiu com êxito a preparação e foi aprovado(a)', textX, 360);
    ctx.fillText('na Banca Oficial da ANAC para Comissário de Bordo', textX, 390);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText(`Aprovado em ${formattedDate}`, textX, 450);

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`ID: ${approvalId}`, textX, 490);

    ctx.fillStyle = '#64748b';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('Verificado pela equipe Voo Certo • voocerto.com.br', textX, 550);

    // Download
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `certificado-anac-${approvalId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsGenerating(false);
    }, 500);
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
            Gerar Certificado
          </DialogTitle>
          <DialogDescription>
            Gere sua insígnia em formato PNG para compartilhar no LinkedIn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[5px] p-6 border border-primary/30 text-center overflow-hidden"
          >
            <div className="relative w-48 h-48 mx-auto mb-4 rounded-[5px] flex items-center justify-center group">
              {insignia.model_url ? (
                <div className="relative w-full h-full">
                  <img 
                    src={getDriveImageUrl(insignia.model_url) || ''} 
                    alt={insignia.name} 
                    className="w-full h-full object-contain filter drop-shadow-2xl" 
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
                            className="absolute whitespace-nowrap font-black uppercase text-center drop-shadow-md"
                            style={{
                              left: `${tag.x}%`,
                              top: `${tag.y}%`,
                              transform: 'translate(-50%, -50%)',
                              fontSize: `${(tag.fontSize || 10) * 0.6}px`,
                              color: tag.color || '#FFFFFF',
                              textShadow: '0 1px 2px rgba(0,0,0,0.8)'
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
                <div className="w-16 h-16 rounded-[5px] bg-yellow-500/20 flex items-center justify-center">
                  <Award className="w-8 h-8 text-yellow-500" />
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">
              {displayName}
            </h3>
            <p className="text-primary text-sm font-medium mb-4">
              Aprovado(a) na Banca ANAC
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Verificado em {formattedDate}
            </div>
            
            <div className="bg-slate-900/50 rounded-[5px] py-2 px-4 inline-block">
              <span className="text-xs text-muted-foreground">ID: </span>
              <span className="font-mono text-primary text-sm">{approvalId}</span>
            </div>
          </motion.div>

          {/* Info text */}
          <p className="text-sm text-muted-foreground text-center">
            Use essa insígnia no seu LinkedIn como comprovação de aprovação na banca ANAC
          </p>

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
            Imagem PNG 1200x600px • Ideal para LinkedIn
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
