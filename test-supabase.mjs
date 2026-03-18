import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdmbcbdjirnhwsqbjbux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbWJjYmRqaXJuaHdzcWJqYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTY2ODgsImV4cCI6MjA4MzE5MjY4OH0.xYnN6ziiHrihDq1QG3CbfSkxNkA_kbfeO-E-yFkoCjU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: exams, error } = await supabase.from('exams').select('*').limit(10);
  console.log('Exams:', exams);
  console.log('Error:', error);
}

check();
