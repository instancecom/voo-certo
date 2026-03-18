import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdmbcbdjirnhwsqbjbux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbWJjYmRqaXJuaHdzcWJqYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTY2ODgsImV4cCI6MjA4MzE5MjY4OH0.xYnN6ziiHrihDq1QG3CbfSkxNkA_kbfeO-E-yFkoCjU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: cat } = await supabase.from('categories').select('id, name').limit(1);
  if (!cat || cat.length === 0) {
      console.log('No categories');
      return;
  }
  
  const { data, error } = await supabase.from('exams').insert({
      title: 'Simulado ' + cat[0].name,
      category_id: cat[0].id,
      duration: 120,
      question_count: 20,
      is_active: true
  }).select();
  
  console.log('Insert:', data);
  console.log('Error:', error);
}

check();
