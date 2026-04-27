
import { supabase } from "@/integrations/supabase/client";
import { Profession } from "@/types/admin";

export const professionsService = {
  async getProfessions() {
    const { data: cats, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

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

  async saveProfession(data: Partial<Profession>, id?: string) {
    const slug = data.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = { ...data, slug };

    if (id) {
      const { error } = await supabase.from('categories').update(payload).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('categories').insert({ ...payload, is_active: true });
      if (error) throw error;
    }
  },

  async deleteProfession(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  }
};
