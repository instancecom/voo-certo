import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronRight, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean | null;
  active_modes: string[] | null;
  created_at: string;
  question_count?: number;
}

interface CategoriesManagerProps {
  onSelectCategory: (categoryId: string, categoryName: string) => void;
}

export function CategoriesManager({ onSelectCategory }: CategoriesManagerProps) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📚',
    active_modes: ['livre'] as string[],
  });

  // Fetch categories with question count
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data: cats, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      // Get question counts per category
      const { data: counts, error: countError } = await supabase
        .from('questions')
        .select('category_id');

      if (countError) throw countError;

      const countMap = (counts || []).reduce((acc, q) => {
        acc[q.category_id] = (acc[q.category_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return (cats || []).map(cat => ({
        ...cat,
        question_count: countMap[cat.id] || 0,
      })) as Category[];
    },
  });

  // Create/Update category
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
            icon: data.icon || '📚',
            active_modes: data.active_modes,
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
            icon: data.icon || '📚',
            active_modes: data.active_modes,
            is_active: true,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(selectedCategory ? 'Categoria atualizada!' : 'Categoria criada!');
      closeDialog();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao salvar categoria');
    },
  });

  // Delete category
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria excluída!');
      setShowDeleteDialog(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao excluir categoria. Verifique se não há questões vinculadas.');
    },
  });

  const openNewDialog = () => {
    setSelectedCategory(null);
    setFormData({ name: '', description: '', icon: '📚', active_modes: ['livre'] });
    setShowDialog(true);
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📚',
      active_modes: category.active_modes || ['livre'],
    });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedCategory(null);
    setFormData({ name: '', description: '', icon: '📚', active_modes: ['livre'] });
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
      toast.error('O nome da categoria é obrigatório');
      return;
    }
    if (formData.active_modes.length === 0) {
      toast.error('Selecione pelo menos um modo');
      return;
    }
    saveMutation.mutate({ ...formData, id: selectedCategory?.id });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categorias</h2>
          <p className="text-muted-foreground">Gerencie as categorias de simulados</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Categories List */}
      {categories?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma categoria cadastrada</p>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Categoria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {categories?.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:border-accent/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{category.icon || '📚'}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{category.name}</h3>
                        {!category.is_active && (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {category.description || 'Sem descrição'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{category.question_count} questões</Badge>
                        {category.active_modes?.includes('banca_anac') && (
                          <Badge className="bg-primary/10 text-primary">Banca ANAC</Badge>
                        )}
                        {category.active_modes?.includes('livre') && (
                          <Badge className="bg-accent/10 text-accent">Livre</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onSelectCategory(category.id, category.name)}
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
              {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria *</Label>
              <Input
                id="name"
                placeholder="Ex: Regulamentação de Aviação"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Breve descrição da categoria..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Ícone (emoji)</Label>
              <Input
                id="icon"
                placeholder="📚"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                maxLength={4}
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
                    Modo Banca ANAC (cronometrado, 4 blocos)
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
              {selectedCategory ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir Categoria</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a categoria "{selectedCategory?.name}"? 
              Esta ação não pode ser desfeita. Todas as questões vinculadas também serão excluídas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCategory && deleteMutation.mutate(selectedCategory.id)}
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
