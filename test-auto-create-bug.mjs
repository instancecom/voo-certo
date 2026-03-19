import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdmbcbdjirnhwsqbjbux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbWJjYmRqaXJuaHdzcWJqYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTY2ODgsImV4cCI6MjA4MzE5MjY4OH0.xYnN6ziiHrihDq1QG3CbfSkxNkA_kbfeO-E-yFkoCjU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAutoCreate() {
  // Try to find any category
  const { data: cat } = await supabase.from('categories').select('id, name').limit(1).single();
  if (!cat) {
    console.log('No categories found');
    return;
  }
  
  console.log('Testing auto-creation for category:', cat.name, cat.id);
  
  const { data: newExam, error: insertError } = await supabase
    .from('exams')
    .insert({
      title: `Simulado (Auto-gerado Teste)`,
      category_id: cat.id,
      duration: 120,
      question_count: 50,
      is_active: true,
      // subcategory_id: ???
    })
    .select('id')
    .single();
    
    if (insertError) {
      console.log('Insert Error:', insertError);
    } else {
      console.log('Insert SUCCESS! Created exam:', newExam);
    }
}

testAutoCreate();
