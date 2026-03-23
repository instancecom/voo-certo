import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Award, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import type { BadgeRarity, Insignia } from "@/hooks/useInsignias";

const rarityColors: Record<BadgeRarity, string> = {
  bronze: "bg-amber-700 text-amber-100",
  silver: "bg-slate-500 text-slate-100",
  gold: "bg-yellow-500 text-yellow-100",
  platinum: "bg-gradient-to-r from-cyan-400 to-purple-500 text-white",
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

const conditionTypes = [
  { value: "first_exam_completed", label: "Primeiro simulado concluído" },
  { value: "first_login", label: "Primeiro login" },
  { value: "correct_answers", label: "Questões corretas (total)" },
  { value: "questions_answered", label: "Questões respondidas (total)" },
  { value: "training_streak", label: "Dias seguidos treinando" },
  { value: "training_days", label: "Dias com treino (total)" },
  { value: "blocks_completed", label: "Blocos completados" },
  { value: "anac_approvals", label: "Aprovações em Banca ANAC" },
  { value: "badges_earned", label: "Insígnias conquistadas" },
  { value: "avg_score_exams", label: "Média em simulados" },
  { value: "english_correct", label: "Questões de Inglês corretas" },
  { value: "security_streak", label: "Sequência de Segurança" },
  { value: "security_score", label: "Pontuação em Segurança" },
  { value: "security_block_score", label: "Score bloco Segurança" },
  { value: "free_exam_score", label: "Score simulado Livre" },
  { value: "profession_complete", label: "Profissão completa" },
  { value: "profession_mastery", label: "Maestria em profissão" },
  { value: "profession_perfect", label: "Profissão perfeita" },
];

const popularIcons = [
  "Award", "Trophy", "Star", "Crown", "Gem", "Medal", "Badge", "BadgeCheck",
  "Plane", "PlaneTakeoff", "Shield", "ShieldCheck", "ShieldAlert",
  "TrendingUp", "Zap", "Flame", "Sparkles", "Sparkle", "Sun", "Sunrise",
  "Calendar", "CalendarCheck", "CalendarDays", "CloudSun",
  "Radio", "Headphones", "MessageCircle", "Mic", "Languages", "Globe",
  "Heart", "Users", "User", "GraduationCap", "BookOpen",
  "Compass", "Target", "Gauge", "Infinity", "Rocket", "Feather",
  "Lock", "LogIn", "CheckCircle", "AlertTriangle", "HelpCircle",
  "Package", "Layers", "FolderCheck", "Database", "Building", "Building2",
  "Wind", "CircleDot"
];

export const InsigniasManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInsignia, setEditingInsignia] = useState<Insignia | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Award",
    condition_type: "first_exam_completed",
    condition_value: 1,
    rarity: "bronze" as BadgeRarity,
    display_order: 0,
    model_url: "",
  });

  const { data: insignias, isLoading } = useQuery({
    queryKey: ["admin-insignias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insignias")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Insignia[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("insignias").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-insignias"] });
      toast.success("Insígnia criada com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar insígnia: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("insignias")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-insignias"] });
      toast.success("Insígnia atualizada com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar insígnia: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("insignias").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-insignias"] });
      toast.success("Insígnia excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir insígnia: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "Award",
      condition_type: "first_exam_completed",
      condition_value: 1,
      rarity: "bronze",
      display_order: 0,
      model_url: "",
    });
    setEditingInsignia(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (insignia: Insignia) => {
    setEditingInsignia(insignia);
    setFormData({
      name: insignia.name,
      description: insignia.description,
      icon: insignia.icon,
      condition_type: insignia.condition_type,
      condition_value: insignia.condition_value,
      rarity: insignia.rarity,
      display_order: insignia.display_order || 0,
      model_url: insignia.model_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInsignia) {
      updateMutation.mutate({ id: editingInsignia.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Gerenciar Insígnias
          </h2>
          <p className="text-muted-foreground">
            {insignias?.length || 0} insígnias cadastradas
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Insígnia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInsignia ? "Editar Insígnia" : "Nova Insígnia"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Primeiro Voo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Raridade</Label>
                  <Select
                    value={formData.rarity}
                    onValueChange={(v) => setFormData({ ...formData, rarity: v as BadgeRarity })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">🥉 Bronze</SelectItem>
                      <SelectItem value="silver">🥈 Prata</SelectItem>
                      <SelectItem value="gold">🥇 Ouro</SelectItem>
                      <SelectItem value="platinum">💎 Platina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Complete seu primeiro simulado"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Condição</Label>
                  <Select
                    value={formData.condition_type}
                    onValueChange={(v) => setFormData({ ...formData, condition_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionTypes.map((ct) => (
                        <SelectItem key={ct.value} value={ct.value}>
                          {ct.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Valor da Condição</Label>
                  <Input
                    type="number"
                    value={formData.condition_value}
                    onChange={(e) => setFormData({ ...formData, condition_value: parseInt(e.target.value) || 1 })}
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <DynamicIcon name={formData.icon} size={24} className="text-primary" />
                  </div>
                  <Select
                    value={formData.icon}
                    onValueChange={(v) => setFormData({ ...formData, icon: v })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {popularIcons.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            <DynamicIcon name={icon} size={16} />
                            {icon}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ordem de Exibição</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label>URL da Imagem/Modelo (Opcional)</Label>
                <Input
                  value={formData.model_url}
                  onChange={(e) => setFormData({ ...formData, model_url: e.target.value })}
                  placeholder="Ex: Link do Google Drive ou URL direta"
                />
                <p className="text-[10px] text-muted-foreground">
                  Suporta links diretos ou links de compartilhamento do Google Drive.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingInsignia ? "Salvar Alterações" : "Criar Insígnia"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Insignias Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Insígnias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Insígnia</TableHead>
                  <TableHead>Condição</TableHead>
                  <TableHead>Raridade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insignias?.map((insignia) => (
                  <TableRow key={insignia.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {insignia.display_order}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden border border-border/50">
                          {insignia.model_url ? (
                            <img 
                              src={getDriveImageUrl(insignia.model_url) || ''} 
                              alt="" 
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <DynamicIcon name={insignia.icon} size={20} className="text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{insignia.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {insignia.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {conditionTypes.find((ct) => ct.value === insignia.condition_type)?.label || insignia.condition_type}
                        {" ≥ "}
                        <strong>{insignia.condition_value}</strong>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={rarityColors[insignia.rarity]}>
                        {rarityLabels[insignia.rarity]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(insignia)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Excluir esta insígnia?")) {
                              deleteMutation.mutate(insignia.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
