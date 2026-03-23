import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink, 
  Loader2,
  Eye,
  Award,
  User,
  Calendar,
  X,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  usePendingVerifications, 
  useAllVerifications,
  useApproveVerification, 
  useRejectVerification 
} from "@/hooks/useBadgeVerifications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-500", icon: Clock },
  approved: { label: "Aprovado", color: "bg-green-500/20 text-green-500", icon: CheckCircle },
  rejected: { label: "Rejeitado", color: "bg-red-500/20 text-red-500", icon: XCircle },
};

export const VerificationsManager = () => {
  const { data: pendingVerifications, isLoading: pendingLoading } = usePendingVerifications();
  const { data: allVerifications, isLoading: allLoading } = useAllVerifications();
  const approveVerification = useApproveVerification();
  const rejectVerification = useRejectVerification();

  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [viewTab, setViewTab] = useState<'pending' | 'all'>('pending');
  
  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf'>('image');
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleApprove = async (id: string) => {
    try {
      await approveVerification.mutateAsync(id);
      toast.success("Verificação aprovada com sucesso!");
    } catch (error) {
      console.error("Error approving verification:", error);
      toast.error("Erro ao aprovar verificação");
    }
  };

  const handleReject = async () => {
    if (!selectedVerification) return;
    
    try {
      await rejectVerification.mutateAsync({
        verificationId: selectedVerification.id,
        notes: rejectNotes,
      });
      toast.success("Verificação rejeitada");
      setRejectDialogOpen(false);
      setRejectNotes("");
      setSelectedVerification(null);
    } catch (error) {
      console.error("Error rejecting verification:", error);
      toast.error("Erro ao rejeitar verificação");
    }
  };

  const openRejectDialog = (verification: any) => {
    setSelectedVerification(verification);
    setRejectDialogOpen(true);
  };

  const viewProof = async (proofUrl: string) => {
    setPreviewLoading(true);
    try {
      const { data } = await supabase.storage
        .from('badge-proofs')
        .createSignedUrl(proofUrl, 3600);

      if (data?.signedUrl) {
        // Determine file type from URL
        const isPdf = proofUrl.toLowerCase().endsWith('.pdf');
        setPreviewType(isPdf ? 'pdf' : 'image');
        setPreviewUrl(data.signedUrl);
        setPreviewOpen(true);
      }
    } catch (error) {
      console.error("Error getting proof URL:", error);
      toast.error("Erro ao abrir comprovante");
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl(null);
  };

  const downloadProof = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = 'comprovante';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isLoading = pendingLoading || allLoading;
  const displayVerifications = viewTab === 'pending' ? pendingVerifications : allVerifications;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Verificações de Insígnias
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie solicitações de verificação de aprovação ANAC
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px] md:text-sm px-2 md:px-3 py-0.5 md:py-1 rounded-[5px] h-fit">
          {pendingVerifications?.length || 0} pendentes
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as 'pending' | 'all')}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pendentes ({pendingVerifications?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <FileText className="w-4 h-4" />
            Todas ({allVerifications?.length || 0})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      {!displayVerifications || displayVerifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-muted/30 rounded-[5px]"
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            {viewTab === 'pending' 
              ? "Nenhuma verificação pendente" 
              : "Nenhuma verificação registrada"}
          </p>
        </motion.div>
      ) : (
        <div className="border rounded-[5px] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Comprovante</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayVerifications.map((verification) => {
                const StatusIcon = statusConfig[verification.status as keyof typeof statusConfig].icon;
                return (
                  <TableRow key={verification.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-xs truncate max-w-[120px]">
                          {verification.user_id.slice(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {verification.proof_type === 'file' ? 'Arquivo' : 'Código'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {verification.proof_type === 'file' && verification.proof_url ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewProof(verification.proof_url)}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Button>
                      ) : (
                        <span className="font-mono text-sm">
                          {verification.anac_code || '-'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(verification.submitted_at).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[verification.status as keyof typeof statusConfig].color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[verification.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {verification.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleApprove(verification.id)}
                            disabled={approveVerification.isPending}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => openRejectDialog(verification)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {verification.approval_id || '-'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Reject Dialog */}
      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Verificação</DialogTitle>
            <DialogDescription>
              Adicione uma nota explicando o motivo da rejeição (opcional)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-notes">Motivo da Rejeição</Label>
            <Textarea
              id="reject-notes"
              placeholder="Ex: Documento ilegível, código inválido..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={rejectVerification.isPending}
            >
              {rejectVerification.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={closePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium">Visualização do Comprovante</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadProof}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={closePreview}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-center min-h-[400px] max-h-[70vh] overflow-auto bg-muted/10 p-4">
            {previewLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-muted-foreground">Carregando...</span>
              </div>
            ) : previewUrl ? (
              previewType === 'pdf' ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[65vh] rounded border"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Comprovante"
                  className="max-w-full max-h-[65vh] object-contain rounded shadow-lg"
                />
              )
            ) : (
              <div className="text-muted-foreground">
                Não foi possível carregar o comprovante
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
