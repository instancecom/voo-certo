import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CareerGuideStep {
  id: string;
  guide_id: string;
  title: string;
  description: string | null;
  step_order: number;
  simulado_ids: string[];
  microcourse_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface CareerGuide {
  id: string;
  title: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  category?: string;
  created_at: string;
  updated_at: string;
  steps?: CareerGuideStep[];
}

export function useCareerGuides() {
  return useQuery({
    queryKey: ['career-guides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('career_guides')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as CareerGuide[];
    },
  });
}

export function useCareerGuideWithSteps(guideId: string | undefined) {
  return useQuery({
    queryKey: ['career-guide', guideId],
    enabled: !!guideId,
    queryFn: async () => {
      const [guideRes, stepsRes] = await Promise.all([
        supabase.from('career_guides').select('*').eq('id', guideId!).single(),
        supabase.from('career_guide_steps').select('*').eq('guide_id', guideId!).order('step_order'),
      ]);
      if (guideRes.error) throw guideRes.error;
      if (stepsRes.error) throw stepsRes.error;

      const steps = (stepsRes.data || []).map((s: any) => ({
        ...s,
        simulado_ids: Array.isArray(s.simulado_ids) ? s.simulado_ids : [],
        microcourse_ids: Array.isArray(s.microcourse_ids) ? s.microcourse_ids : [],
      }));

      return { ...guideRes.data, steps } as CareerGuide;
    },
  });
}

export function useCreateCareerGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description: string; category?: string }) => {
      const { data: maxOrder } = await supabase
        .from('career_guides')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single();
      const nextOrder = (maxOrder?.display_order ?? -1) + 1;

      const { data: guide, error } = await supabase
        .from('career_guides')
        .insert({ title: data.title, description: data.description, category: data.category || 'geral', display_order: nextOrder })
        .select()
        .single();
      if (error) throw error;
      return guide;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['career-guides'] }),
  });
}

export function useUpdateCareerGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; description?: string; is_active?: boolean; category?: string; display_order?: number }) => {
      const { error } = await supabase.from('career_guides').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['career-guides'] }),
  });
}

export function useDeleteCareerGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('career_guides').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['career-guides'] }),
  });
}

export function useUpsertGuideStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (step: {
      id?: string;
      guide_id: string;
      title: string;
      description?: string;
      step_order: number;
      simulado_ids: string[];
      microcourse_ids: string[];
    }) => {
      if (step.id) {
        const { error } = await supabase
          .from('career_guide_steps')
          .update({
            title: step.title,
            description: step.description || null,
            step_order: step.step_order,
            simulado_ids: step.simulado_ids,
            microcourse_ids: step.microcourse_ids,
          })
          .eq('id', step.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('career_guide_steps')
          .insert({
            guide_id: step.guide_id,
            title: step.title,
            description: step.description || null,
            step_order: step.step_order,
            simulado_ids: step.simulado_ids,
            microcourse_ids: step.microcourse_ids,
          });
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['career-guide', vars.guide_id] });
      qc.invalidateQueries({ queryKey: ['career-guides'] });
    },
  });
}

export function useDeleteGuideStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, guide_id }: { id: string; guide_id: string }) => {
      const { error } = await supabase.from('career_guide_steps').delete().eq('id', id);
      if (error) throw error;
      return guide_id;
    },
    onSuccess: (guide_id) => {
      qc.invalidateQueries({ queryKey: ['career-guide', guide_id] });
    },
  });
}

export function useGuideStepProgress(guideId: string | undefined) {
  return useQuery({
    queryKey: ['guide-step-progress', guideId],
    enabled: !!guideId,
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      
      const { data: steps } = await supabase
        .from('career_guide_steps')
        .select('id')
        .eq('guide_id', guideId!);
      
      if (!steps?.length) return [];
      
      const stepIds = steps.map(s => s.id);
      const { data, error } = await supabase
        .from('guide_step_progress')
        .select('*')
        .eq('user_id', user.user.id)
        .in('step_id', stepIds);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useToggleStepProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ stepId, guideId, completed }: { stepId: string; guideId: string; completed: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (completed) {
        const { error } = await supabase
          .from('guide_step_progress')
          .upsert({
            user_id: user.id,
            step_id: stepId,
            completed: true,
            completed_at: new Date().toISOString(),
          }, { onConflict: 'user_id,step_id' });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('guide_step_progress')
          .delete()
          .match({ user_id: user.id, step_id: stepId });
        if (error) throw error;
      }
      return { guideId, stepId, completed };
    },
    onMutate: async ({ stepId, guideId, completed }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await qc.cancelQueries({ queryKey: ['guide-step-progress', guideId] });

      // Snapshot the previous value
      const previousProgress = qc.getQueryData(['guide-step-progress', guideId]);

      // Optimistically update to the new value
      qc.setQueryData(['guide-step-progress', guideId], (old: any[] | undefined) => {
        const current = old || [];
        if (completed) {
          // Add the step if it's not there, or update if it is
          const exists = current.find(p => p.step_id === stepId);
          if (exists) {
            return current.map(p => p.step_id === stepId ? { ...p, completed: true } : p);
          }
          return [...current, { step_id: stepId, completed: true }];
        } else {
          // Remove or set completed false
          return current.filter(p => p.step_id !== stepId);
        }
      });

      // Return a context object with the snapshotted value
      return { previousProgress, guideId };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProgress) {
        qc.setQueryData(
          ['guide-step-progress', context.guideId],
          context.previousProgress
        );
      }
    },
    onSettled: (data) => {
      // Always refetch after error or success to keep server in sync
      if (data?.guideId) {
        qc.invalidateQueries({ queryKey: ['guide-step-progress', data.guideId] });
      }
    },
  });
}
