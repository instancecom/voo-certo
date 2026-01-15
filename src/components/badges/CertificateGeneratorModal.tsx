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

interface CertificateGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvalId: string;
  approvedAt: string;
  userName?: string;
}

export const CertificateGeneratorModal = ({
  open,
  onOpenChange,
  approvalId,
  approvedAt,
  userName,
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

    // Award icon (simple star/badge shape)
    ctx.save();
    ctx.translate(600, 100);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 40, Math.sin((18 + i * 72) * Math.PI / 180) * 40);
      ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 20, Math.sin((54 + i * 72) * Math.PI / 180) * 20);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICADO DE APROVAÇÃO', 600, 180);

    // Subtitle
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('BANCA ANAC - VOO CERTO', 600, 220);

    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.fillText(displayName.toUpperCase(), 600, 300);

    // Description
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText('Concluiu com êxito a preparação e foi aprovado(a)', 600, 360);
    ctx.fillText('na Banca Oficial da ANAC para Comissário de Bordo', 600, 390);

    // Date
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText(`Aprovado em ${formattedDate}`, 600, 450);

    // Approval ID
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`ID: ${approvalId}`, 600, 490);

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('Verificado pela equipe Voo Certo • voocerto.com.br', 600, 550);

    // Decorative lines
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 330);
    ctx.lineTo(450, 330);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(750, 330);
    ctx.lineTo(1050, 330);
    ctx.stroke();

    // Download
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `certificado-anac-${approvalId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsGenerating(false);
    }, 500);
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
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 border border-primary/30 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Award className="w-8 h-8 text-yellow-500" />
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
            
            <div className="bg-slate-900/50 rounded-lg py-2 px-4 inline-block">
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
