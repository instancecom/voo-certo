import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdmbcbdjirnhwsqbjbux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbWJjYmRqaXJuaHdzcWJqYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTY2ODgsImV4cCI6MjA4MzE5MjY4OH0.xYnN6ziiHrihDq1QG3CbfSkxNkA_kbfeO-E-yFkoCjU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('exam_results').insert({
      user_id: 'a0000000-0000-0000-0000-000000000000', // invalid uuid might fail fk
      score: 100,
      total_questions: 10,
      correct_answers: 10,
      time_spent: 60,
      answers: []
  }).select();
  
  console.log('Insert:', data);
  console.log('Error:', error);
}

check();
