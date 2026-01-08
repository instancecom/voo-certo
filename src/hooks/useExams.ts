import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DbQuestion {
  id: string;
  category_id: string;
  subcategory_id: string;
  text: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  audio_url: string | null;
  image_url: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  block_number: number | null;
  created_at: string;
}

export interface DbExam {
  id: string;
  title: string;
  description: string | null;
  category_id: string;
  subcategory_id: string;
  duration: number;
  question_count: number;
  is_premium: boolean | null;
  is_active: boolean | null;
  icon: string | null;
  random_order: boolean | null;
  created_at: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean | null;
}

export interface DbSubcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  category_id: string;
}

export interface DbExamResult {
  id: string;
  exam_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_spent: number;
  answers: { questionId: string; selectedAnswer: number; isCorrect: boolean }[];
  completed_at: string;
}

// Fetch categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as DbCategory[];
    },
  });
}

// Fetch subcategories
export function useSubcategories(categoryId?: string) {
  return useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: async () => {
      let query = supabase.from('subcategories').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as DbSubcategory[];
    },
  });
}

// Fetch exams
export function useExams(categoryId?: string) {
  return useQuery({
    queryKey: ['exams', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('exams')
        .select('*')
        .eq('is_active', true);
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as DbExam[];
    },
  });
}

// Fetch single exam with questions
export function useExamWithQuestions(examId: string) {
  return useQuery({
    queryKey: ['exam', examId],
    queryFn: async () => {
      // Fetch exam
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .maybeSingle();
      
      if (examError) throw examError;
      if (!exam) throw new Error('Exam not found');
      
      // Fetch exam questions with order
      const { data: examQuestions, error: eqError } = await supabase
        .from('exam_questions')
        .select('question_id, order_index')
        .eq('exam_id', examId)
        .order('order_index');
      
      if (eqError) throw eqError;
      
      const questionIds = examQuestions?.map(eq => eq.question_id) || [];
      
      // Fetch questions
      const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds);
      
      if (qError) throw qError;
      
      // Sort questions by order_index
      const sortedQuestions = questionIds.map(id => 
        questions?.find(q => q.id === id)
      ).filter(Boolean) as DbQuestion[];
      
      // Shuffle if random order
      const finalQuestions = exam.random_order 
        ? shuffleArray([...sortedQuestions])
        : sortedQuestions;
      
      return {
        exam: exam as DbExam,
        questions: finalQuestions.map(q => ({
          ...q,
          options: q.options as string[],
        })),
      };
    },
    enabled: !!examId,
  });
}

// Fetch user exam results
export function useUserResults() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['exam-results', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      return data.map(r => ({
        ...r,
        answers: r.answers as DbExamResult['answers'],
      })) as DbExamResult[];
    },
    enabled: !!user,
  });
}

// Fetch single result
export function useExamResult(resultId: string) {
  return useQuery({
    queryKey: ['exam-result', resultId],
    queryFn: async () => {
      const { data: result, error: resultError } = await supabase
        .from('exam_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
      
      if (resultError) throw resultError;
      if (!result) return null;
      
      // Fetch exam
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', result.exam_id)
        .maybeSingle();
      
      if (examError) throw examError;
      
      // Fetch questions from answers
      const questionIds = (result.answers as DbExamResult['answers']).map(a => a.questionId);
      
      const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds);
      
      if (qError) throw qError;
      
      return {
        result: {
          ...result,
          answers: result.answers as DbExamResult['answers'],
        } as DbExamResult,
        exam: exam as DbExam | null,
        questions: (questions || []).map(q => ({
          ...q,
          options: q.options as string[],
        })) as DbQuestion[],
      };
    },
    enabled: !!resultId,
  });
}

// Submit exam result
export function useSubmitResult() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (result: Omit<DbExamResult, 'id' | 'completed_at' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('exam_results')
        .insert({
          exam_id: result.exam_id,
          user_id: user.id,
          score: result.score,
          total_questions: result.total_questions,
          correct_answers: result.correct_answers,
          time_spent: result.time_spent,
          answers: result.answers,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
    },
  });
}

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
