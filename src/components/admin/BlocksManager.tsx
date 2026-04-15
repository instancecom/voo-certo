import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2, Layers, Clock, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DriveImageUpload } from './DriveImageUpload';

interface Block {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number | null;
  time_limit: number | null;
  num_questions_expected: number | null;
  image_url: string | null;
  created_at: string;
  question_count?: number;
}

interface BlocksManagerProps {
  professionId: string;
  professionName: string;
  onBack: () => void;
  onSelectBlock: (blockId: string, blockName: string) => void;
}

export function BlocksManager({ professionId, professionName, onBack, onSelectBlock }: BlocksManagerProps) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📋',
    display_order: 0,
    time_limit: 30,
    num_questions_expected: 20,
    image_url: '',
  });

  // Fetch blocks for this profession
  const { data: blocks, isLoading } = useQuery({
    queryKey: ['admin-blocks', professionId],
    queryFn: async () => {
      const { data: blocksData, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', professionId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Get question counts per block using direct count queries to avoid row limits
      const questionCountMap: Record<string, number> = {};
      
      await Promise.all((blocksData || []).map(async (block) => {
        const { count, error: countError } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('subcategory_id', block.id);
        
        if (!countError) {
          questionCountMap[block.id] = count || 0;
        }
      }));

      return (blocksData || []).map(block => ({
        ...block,
        question_count: questionCountMap[block.id] || 0,
      })) as Block[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      if (data.id) {
        const { error } = await supabase
          .from('subcategories')
          .update({
            name: data.name,
            slug,
            description: data.description || null,
            icon: data.icon || '📋',
            display_order: data.display_order,
            time_limit: data.time_limit,
            num_questions_expected: data.num_questions_expected,
            image_url: data.image_url || null,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subcategories')
          .insert({
            category_id: professionId,
            name: data.name,
            slug,
            description: data.description || null,
            icon: data.icon || '📋',
            display_order: data.display_order,
            time_limit: data.time_limit,
            num_questions_expected: data.num_questions_expected,
            image_url: data.image_url || null,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blocks', professionId] });
      queryClient.invalidateQueries({ queryKey: ['admin-professions'] });
      toast.success(selectedBlock ? 'Bloco atualizado!' : 'Bloco criado!');
      closeDialog();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao salvar bloco');
    },
  });

  // Delete block
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subcategories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blocks', professionId] });
      queryClient.invalidateQueries({ queryKey: ['admin-professions'] });
      toast.success('Bloco excluído!');
      setShowDeleteDialog(false);
      setSelectedBlock(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao excluir bloco. Verifique se não há questões vinculadas.');
    },
  });

  const openNewDialog = () => {
    const nextOrder = (blocks?.length || 0) + 1;
    setSelectedBlock(null);
    setFormData({ 
      name: '', 
      description: '', 
      icon: '📋', 
      display_order: nextOrder,
      time_limit: 30,
      num_questions_expected: 20,
    });
    setShowDialog(true);
  };

  const openEditDialog = (block: Block) => {
    setSelectedBlock(block);
    setFormData({
      name: block.name,
      description: block.description || '',
      icon: block.icon || '📋',
      display_order: block.display_order || 0,
      time_limit: block.time_limit || 30,
      num_questions_expected: block.num_questions_expected || 20,
      image_url: block.image_url || '',
    });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedBlock(null);
    setFormData({ name: '', description: '', icon: '📋', display_order: 0, time_limit: 30, num_questions_expected: 20 });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('O nome do bloco é obrigatório');
      return;
    }
    saveMutation.mutate({ ...formData, id: selectedBlock?.id });
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Blocos: {professionName}</h2>
          <p className="text-muted-foreground">{blocks?.length || 0} blocos cadastrados</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Bloco
        </Button>
      </div>

      {/* Blocks List */}
      {blocks?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum bloco cadastrado nesta profissão</p>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Bloco
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {blocks?.map((block, index) => (
            <motion.div
              key={block.id}
            >
              <Card className="transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                      {block.icon || '📋'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-medium">#{block.display_order || index + 1}</span>
                        <h3 className="font-semibold text-foreground truncate">{block.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {block.description || 'Sem descrição'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="gap-1">
                          <FileQuestion className="w-3 h-3" />
                          {block.question_count}/{block.num_questions_expected || 20} questões
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {block.time_limit || 30} min
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(block)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBlock(block);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onSelectBlock(block.id, block.name)}
                      >
                        Ver Questões
                        <ChevronRight className="w-4 h-4 ml-1" />
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
              {selectedBlock ? 'Editar Bloco' : 'Novo Bloco'}
            </DialogTitle>
          </DialogHeader>

           <div className="space-y-4 py-4">
            <DriveImageUpload 
              label="Capa do Bloco (Google Drive)"
              value={formData.image_url}
              onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
            />

            <div className="space-y-2">
              <Label htmlFor="name">Nome do Bloco *</Label>
              <Input
                id="name"
                placeholder="Ex: Bloco 1 - Regulamentação ANAC, Inglês Técnico..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição do conteúdo do bloco..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Ícone (emoji)</Label>
                <Input
                  id="icon"
                  placeholder="📋"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Ordem</Label>
                <Input
                  id="display_order"
                  type="number"
                  placeholder="1"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time_limit">Tempo Limite (min)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  placeholder="30"
                  value={formData.time_limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, time_limit: parseInt(e.target.value) || 30 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="num_questions_expected">Nº Questões Esperado</Label>
                <Input
                  id="num_questions_expected"
                  type="number"
                  placeholder="20"
                  value={formData.num_questions_expected}
                  onChange={(e) => setFormData(prev => ({ ...prev, num_questions_expected: parseInt(e.target.value) || 20 }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedBlock ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir Bloco</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o bloco "{selectedBlock?.name}"? 
              Esta ação não pode ser desfeita. Todas as questões vinculadas também serão excluídas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedBlock && deleteMutation.mutate(selectedBlock.id)}
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
