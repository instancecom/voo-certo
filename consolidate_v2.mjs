import fs from 'fs';
import path from 'path';

const migrationsDir = './supabase/migrations';
const outputFile = './consolidated_migration_v2.sql';

const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

let content = '-- CONSOLIDATED MIGRATION V2 WITH FIXES\n\n';

// Add mandatory columns that are used in policies but missing from initial builds
content += '-- FORCE COLUMNS FOR POLICIES\n';
content += 'DO $$\n';
content += 'BEGIN\n';
content += '  -- Fix questions\n';
content += '  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = \'public\' AND table_name = \'questions\' AND column_name = \'is_premium\') THEN\n';
content += '    -- We can\'t alter a table that doesn\'t exist yet, so we will do this after the tables are created or use a robust script.\n';
content += '  END IF;\n';
content += 'END $$;\n\n';

for (const file of files) {
  const filePath = path.join(migrationsDir, file);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  content += `-- FILE: ${file}\n`;
  content += fileContent;
  content += '\n\n';
  
  // Inject fixes after relevant tables are created
  if (file.startsWith('20260106104536')) {
    content += '-- FIX: Add missing columns required by later policies\n';
    content += 'ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;\n\n';
  }
  if (file.startsWith('20260218161339')) {
    content += '-- FIX: Add missing columns required by later policies\n';
    content += 'ALTER TABLE public.microcourses ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;\n\n';
  }
}

fs.writeFileSync(outputFile, content, 'utf8');
console.log('Consolidated migration v2 created.');
