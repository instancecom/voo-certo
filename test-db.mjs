import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file manually
const envPath = path.resolve('.env');
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      if (key === 'VITE_SUPABASE_URL') supabaseUrl = value;
      if (key === 'VITE_SUPABASE_PUBLISHABLE_KEY') supabaseKey = value;
    }
  }
} catch (err) {
  console.error('Error reading .env file:', err);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const PPA_CATEGORY_ID = '8ec4aeb3-f2f3-4f3e-9f1b-9ac210c05d7a';

async function check() {
  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, subcategory_id, block_number')
    .eq('category_id', PPA_CATEGORY_ID);

  if (error) {
    console.error('Error fetching questions:', error);
    return;
  }

  console.log(`Total questions for Piloto Privado Avião: ${questions.length}`);

  // Count by subcategory
  const counts = {};
  questions.forEach(q => {
    counts[q.subcategory_id] = (counts[q.subcategory_id] || 0) + 1;
  });

  console.log('\nQuestions count by Subcategory ID:');
  console.log(counts);
}

check();
