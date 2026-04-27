
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professionsService } from '@/services/professions';
import { Profession } from '@/types/admin';
import { toast } from 'sonner';

export function useProfessionsManager() {
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

  const { data: professions, isLoading } = useQuery({
    queryKey: ['admin-professions'],
    queryFn: professionsService.getProfessions,
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof formData & { id?: string }) => 
      professionsService.saveProfession(data, selectedProfession?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-professions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(selectedProfession ? 'Profissão atualizada!' : 'Profissão criada!');
      setShowDialog(false);
      setSelectedProfession(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar profissão: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: professionsService.deleteProfession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-professions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Profissão excluída!');
      setShowDeleteDialog(false);
      setSelectedProfession(null);
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir profissão. Verifique se não há blocos vinculados.');
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
    if (!formData.name.trim()) return toast.error('O nome é obrigatório');
    if (formData.active_modes.length === 0) return toast.error('Selecione um modo');
    saveMutation.mutate({ ...formData });
  };

  return {
    professions,
    isLoading,
    showDialog,
    setShowDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedProfession,
    setSelectedProfession,
    formData,
    setFormData,
    openNewDialog,
    openEditDialog,
    closeDialog,
    handleModeToggle,
    handleSubmit,
    saveMutation,
    deleteMutation,
  };
}
