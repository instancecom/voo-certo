import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, Loader2, X, Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSubmitVerification } from "@/hooks/useBadgeVerifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface VerificationSubmitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insigniaId: string;
  insigniaName: string;
}

export const VerificationSubmitModal = ({
  open,
  onOpenChange,
  insigniaId,
  insigniaName,
}: VerificationSubmitModalProps) => {
  const { user } = useAuth();
  const [proofType, setProofType] = useState<'file' | 'code'>('file');
  const [anacCode, setAnacCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submitVerification = useSubmitVerification();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 10MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (proofType === 'file' && !file) {
      toast.error("Selecione um arquivo");
      return;
    }

    if (proofType === 'code' && !anacCode.trim()) {
      toast.error("Digite o código ANAC");
      return;
    }

    setIsUploading(true);

    try {
      let proofUrl: string | undefined;

      if (proofType === 'file' && file) {
        // Upload file to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('badge-proofs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        proofUrl = fileName;
      }

      await submitVerification.mutateAsync({
        insigniaId,
        proofType,
        proofUrl,
        anacCode: proofType === 'code' ? anacCode : undefined,
      });

      setIsSubmitted(true);
      toast.success("Comprovante enviado! Aguarde a análise.");

      setTimeout(() => {
        onOpenChange(false);
        setIsSubmitted(false);
        setFile(null);
        setAnacCode("");
      }, 2000);
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast.error("Erro ao enviar comprovante");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Solicitar Verificação
          </DialogTitle>
          <DialogDescription>
            Envie seu comprovante de aprovação na ANAC para desbloquear a insígnia "{insigniaName}"
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enviado com Sucesso!</h3>
              <p className="text-muted-foreground text-sm">
                Você receberá uma notificação quando for aprovado
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Tabs value={proofType} onValueChange={(v) => setProofType(v as 'file' | 'code')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="file" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Arquivo
                  </TabsTrigger>
                  <TabsTrigger value="code" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Código ANAC
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4">
                  <div>
                    <Label htmlFor="proof-file">Comprovante (PDF ou Imagem)</Label>
                    <div className="mt-2">
                      <label
                        htmlFor="proof-file"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        {file ? (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-5 h-5 text-primary" />
                            <span className="truncate max-w-[200px]">{file.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setFile(null);
                              }}
                              className="p-1 hover:bg-muted rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">
                              Clique para selecionar
                            </span>
                            <span className="text-xs text-muted-foreground/70">
                              PDF, PNG, JPG (máx. 10MB)
                            </span>
                          </>
                        )}
                        <input
                          id="proof-file"
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="space-y-4">
                  <div>
                    <Label htmlFor="anac-code">Código de Aprovação ANAC</Label>
                    <Input
                      id="anac-code"
                      placeholder="Ex: CMA-12345-2026"
                      value={anacCode}
                      onChange={(e) => setAnacCode(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Digite o código que consta em seu certificado de aprovação
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isUploading || (proofType === 'file' && !file) || (proofType === 'code' && !anacCode.trim())}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Comprovante"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
