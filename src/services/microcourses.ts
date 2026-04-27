
import { supabase } from "@/integrations/supabase/client";
import { Microcourse, Module, Lesson } from "@/types/admin";

export const microcoursesService = {
  async getMicrocourses() {
    const { data, error } = await supabase
      .from('microcourses')
      .select('*')
      .order('display_order');
    if (error) throw error;
    return data as unknown as Microcourse[];
  },

  async getModules() {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('display_order');
    if (error) throw error;
    return data as Module[];
  },

  async getLessons() {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('display_order');
    if (error) throw error;
    return data as Lesson[];
  },

  async saveMicrocourse(data: Partial<Microcourse>, id?: string) {
    if (id) {
      const { error } = await supabase.from('microcourses').update(data).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('microcourses').insert(data);
      if (error) throw error;
    }
  },

  async deleteMicrocourse(id: string) {
    const { error } = await supabase.from('microcourses').delete().eq('id', id);
    if (error) throw error;
  },

  async saveModule(data: Partial<Module>, id?: string) {
    if (id) {
      const { error } = await supabase.from('modules').update(data).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('modules').insert(data);
      if (error) throw error;
    }
  },

  async deleteModule(id: string) {
    const { error } = await supabase.from('modules').delete().eq('id', id);
    if (error) throw error;
  },

  async saveLesson(data: Partial<Lesson>, id?: string) {
    if (id) {
      const { error } = await supabase.from('lessons').update(data).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('lessons').insert(data);
      if (error) throw error;
    }
  },

  async deleteLesson(id: string) {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw error;
  }
};
