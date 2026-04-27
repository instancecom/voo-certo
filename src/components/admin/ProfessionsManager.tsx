import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronRight, Loader2, Briefcase, Clock, Blocks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DriveImageUpload } from './DriveImageUpload';

interface Profession {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean | null;
  active_modes: string[] | null;
  total_time: number | null;
  display_order: number | null;
  image_url: string | null;
  created_at: string;
  block_count?: number;
  question_count?: number;
}

interface ProfessionsManagerProps {
  onSelectProfession: (professionId: string, professionName: string) => void;
}

export function ProfessionsManager({ onSelectProfession }: ProfessionsManagerProps) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '✈️',
    total_time: 120,
    display_order: 0,
    image_url: '',
    active_modes: ['livre'] as string[],
  });

  // Fetch professions with block and question counts
  const { data: professions, isLoading } = useQuery({
    queryKey: ['admin-professions'],
    queryFn: async () => {
      const { data: cats, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Get counts per profession using direct count queries to avoid row limits
      const countsMap: Record<string, { blocks: number, questions: number }> = {};
      
      await Promise.all((cats || []).map(async (cat) => {
        const [blocksRes, questionsRes] = await Promise.all([
          supabase.from('subcategories').select('*', { count: 'exact', head: true }).eq('category_id', cat.id),
          supabase.from('questions').select('*', { count: 'exact', head: true }).eq('category_id', cat.id)
        ]);
        
        countsMap[cat.id] = {
          blocks: blocksRes.count || 0,
          questions: questionsRes.count || 0
        };
      }));

      return (cats || []).map(cat => ({
        ...cat,
        block_count: countsMap[cat.id]?.blocks || 0,
        question_count: countsMap[cat.id]?.questions || 0,
      })) as Profession[];
    },
  });

  // Create/Update profession
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      if (data.id) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: data.name,
            slug,
            description: data.description || null,
            icon: data.icon || '✈️',
            active_modes: data.active_modes,
            total_time: data.total_time,
            display_order: data.display_order,
            image_url: data.image_url || null,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            name: data.name,
            slug,
            description: data.description || null,
            icon: data.icon || '✈️',
            active_modes: data.active_modes,
            total_time: data.total_time,
            display_order: data.display_order,
            image_url: data.image_url || null,
            is_active: true,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-professions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(selectedProfession ? 'Profissão atualizada!' : 'Profissão criada!');
      closeDialog();
    },
    onError: (error: any) => {
      console.error('Error saving profession:', error);
      const detailedError = error.message || error.details || 'Erro desconhecido';
      toast.error(`Erro ao salvar profissão: ${detailedError}`);
    },
  });

  // Delete profession
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-professions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Profissão excluída!');
      setShowDeleteDialog(false);
      setSelectedProfession(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao excluir profissão. Verifique se não há blocos/questões vinculados.');
    },
  });

  const openNewDialog = () => {
    setSelectedProfession(null);
    setFormData({ name: '', description: '', icon: '✈️', total_time: 120, display_order: 0, image_url: '', active_modes: ['livre'] });
    setShowDialog(true);
  };

  const openEditDialog = (profession: Profession) => {
    setSelectedProfession(profession);
    setFormData({
      name: profession.name,
      description: profession.description || '',
      icon: profession.icon || '✈️',
      total_time: profession.total_time || 120,
      display_order: profession.display_order || 0,
      image_url: profession.image_url || '',
      active_modes: profession.active_modes || ['livre'],
    });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedProfession(null);
    setFormData({ name: '', description: '', icon: '✈️', total_time: 120, display_order: 0, image_url: '', active_modes: ['livre'] });
  };

  const handleModeToggle = (mode: string) => {
    setFormData(prev => ({
      ...prev,
      active_modes: prev.active_modes.includes(mode)
        ? prev.active_modes.filter(m => m !== mode)
        : [...prev.active_modes, mode],
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('O nome da profissão é obrigatório');
      return;
    }
    if (formData.active_modes.length === 0) {
      toast.error('Selecione pelo menos um modo');
      return;
    }
    saveMutation.mutate({ ...formData, id: selectedProfession?.id });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Profissões</h2>
          <p className="text-sm text-muted-foreground">Gerencie profissões, blocos e questões</p>
        </div>
        <Button onClick={openNewDialog} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nova Profissão
        </Button>
      </div>

      {/* Professions List */}
      {professions?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma profissão cadastrada</p>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Profissão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {professions?.map((profession, index) => (
            <motion.div
              key={profession.id}
            >
              <Card className="transition-colors">
                <CardContent className="py-4 px-3 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-2xl sm:text-3xl shrink-0">{profession.icon || '✈️'}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{profession.name}</h3>
                          {!profession.is_active && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">Inativo</Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {profession.description || 'Sem descrição'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pl-9 sm:pl-0">
                      <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs">
                        <Blocks className="w-3 h-3" />
                        {profession.block_count} blocos
                      </Badge>
                      <Badge variant="outline" className="text-[10px] sm:text-xs">
                        {profession.question_count} questões
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs">
                        <Clock className="w-3 h-3" />
                        {profession.total_time || 120} min
                      </Badge>
                      {profession.active_modes?.includes('banca_anac') && (
                        <Badge className="bg-primary/10 text-primary text-[10px] sm:text-xs">Banca</Badge>
                      )}
                      {profession.active_modes?.includes('livre') && (
                        <Badge className="bg-accent/10 text-accent text-[10px] sm:text-xs">Livre</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pl-9 sm:pl-0 sm:ml-auto shrink-0">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(profession)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setSelectedProfession(profession); setShowDeleteDialog(true); }}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                      <Button size="sm" className="text-xs h-8" onClick={() => onSelectProfession(profession.id, profession.name)}>
                        Gerenciar
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedProfession ? 'Editar Profissão' : 'Nova Profissão'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <DriveImageUpload 
              label="Capa da Profissão (Google Drive)"
              value={formData.image_url}
              onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
            />

            <div className="space-y-2">
              <Label htmlFor="name">Nome da Profissão *</Label>
              <Input
                id="name"
                placeholder="Ex: Comissária de Voo, OAB, CFC..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Breve descrição da profissão..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Ícone (emoji)</Label>
                <Input
                  id="icon"
                  placeholder="✈️"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_time">Tempo Total (min)</Label>
                <Input
                  id="total_time"
                  type="number"
                  placeholder="120"
                  value={formData.total_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_time: parseInt(e.target.value) || 120 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Ordem de Exibição</Label>
              <Input
                id="display_order"
                type="number"
                placeholder="0"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-3">
              <Label>Modos Disponíveis *</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mode-banca"
                    checked={formData.active_modes.includes('banca_anac')}
                    onCheckedChange={() => handleModeToggle('banca_anac')}
                  />
                  <Label htmlFor="mode-banca" className="font-normal">
                    Modo Banca (cronometrado por bloco)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mode-livre"
                    checked={formData.active_modes.includes('livre')}
                    onCheckedChange={() => handleModeToggle('livre')}
                  />
                  <Label htmlFor="mode-livre" className="font-normal">
                    Modo Livre (sem tempo, resposta imediata)
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedProfession ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir Profissão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a profissão "{selectedProfession?.name}"? 
              Esta ação não pode ser desfeita. Todos os blocos e questões vinculados também serão excluídos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedProfession && deleteMutation.mutate(selectedProfession.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
