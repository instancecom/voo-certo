import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GuiaEtapa {
  id: string;
  step_number: number;
  emoji: string;
  title: string;
  description: string;
  details: string[];
  tips: string[];
  simulado_ids: { id: string; type: 'category' | 'subcategory'; label?: string }[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface SimuladoOption {
  id: string;
  name: string;
  type: 'category' | 'subcategory';
  parentName?: string;
  categoryId?: string;
  activeModes?: string[];
}

export function useGuiaEtapas() {
  return useQuery({
    queryKey: ['guia-etapas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guia_etapas')
        .select('*')
        .order('step_number', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        details: Array.isArray(item.details) ? item.details : [],
        tips: Array.isArray(item.tips) ? item.tips : [],
        simulado_ids: Array.isArray(item.simulado_ids) ? item.simulado_ids : [],
      })) as GuiaEtapa[];
    },
  });
}

export function useSimuladoOptions() {
  return useQuery({
    queryKey: ['simulado-options'],
    queryFn: async () => {
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        supabase.from('categories').select('id, name, active_modes').eq('is_active', true).order('display_order'),
        supabase.from('subcategories').select('id, name, category_id').order('display_order'),
      ]);
      
      if (categoriesRes.error) throw categoriesRes.error;
      if (subcategoriesRes.error) throw subcategoriesRes.error;
      
      const categories = categoriesRes.data || [];
      const subcategories = subcategoriesRes.data || [];
      
      const categoryMap = new Map(categories.map(c => [c.id, { name: c.name, active_modes: c.active_modes }]));
      
      const options: SimuladoOption[] = [
        ...categories.map(c => ({
          id: c.id,
          name: c.name,
          type: 'category' as const,
          categoryId: c.id,
          activeModes: c.active_modes || [],
        })),
        ...subcategories.map(s => {
          const parent = categoryMap.get(s.category_id);
          return {
            id: s.id,
            name: s.name,
            type: 'subcategory' as const,
            parentName: parent?.name || '',
            categoryId: s.category_id,
            activeModes: parent?.active_modes || [],
          };
        }),
      ];
      
      return options;
    },
  });
}

export function useUpdateGuiaEtapa() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      simulado_ids 
    }: { 
      id: string; 
      simulado_ids: { id: string; type: 'category' | 'subcategory'; label?: string }[] 
    }) => {
      const { error } = await supabase
        .from('guia_etapas')
        .update({ simulado_ids })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guia-etapas'] });
    },
  });
}
