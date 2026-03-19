import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdmbcbdjirnhwsqbjbux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbWJjYmRqaXJuaHdzcWJqYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTY2ODgsImV4cCI6MjA4MzE5MjY4OH0.xYnN6ziiHrihDq1QG3CbfSkxNkA_kbfeO-E-yFkoCjU';
const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORY_ID = 'da049633-1a37-4219-92a5-a1d5f1aa2e2a'; // Comissário de voo

async function seed() {
  const { data: sub } = await supabase.from('subcategories').select('id, name').eq('category_id', CATEGORY_ID);
  
  const exams = [
    { title: 'Simulado Geral (Banca ANAC)', category_id: CATEGORY_ID, duration: 120, question_count: 50 },
    ...(sub || []).map(s => ({
      title: `Simulado: ${s.name}`,
      category_id: CATEGORY_ID,
      subcategory_id: s.id,
      duration: 30,
      question_count: 20
    }))
  ];
  
  console.log('Inserting', exams.length, 'exams...');
  const { data, error } = await supabase.from('exams').insert(exams).select();
  
  if (error) {
    console.log('Error seeding:', error);
  } else {
    console.log('SUCCESS! Seeded:', data.length, 'exams.');
  }
}

seed();
