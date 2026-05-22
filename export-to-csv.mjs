import fs from 'fs';
import { q_motores } from './q_motores.mjs';
import { nav_q2 } from './nav_q2.mjs';
import { q_tv_part2 } from './q_tv_part2.mjs';

function escapeCsv(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function exportCsv(filename, questoes) {
  const header = 'bloco_id,text,option_a,option_b,option_c,option_d,correct_answer,difficulty,explanation';
  const rows = questoes.map(q =>
    [q.bloco_id, q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.difficulty, q.explanation]
      .map(escapeCsv)
      .join(',')
  );

  const csv = '\uFEFF' + [header, ...rows].join('\n'); // BOM para Excel
  fs.writeFileSync(`./${filename}`, csv, 'utf8');
  console.log(`Gerado: ${filename} com ${questoes.length} questões.`);
}

// Exporta as matérias que geramos hoje
exportCsv('import_motores.csv', q_motores);
exportCsv('import_nav_part2.csv', nav_q2);
exportCsv('import_tv_part2.csv', q_tv_part2);

// Também podemos tentar carregar os anteriores se existirem e quisermos (neste caso exportando os novos)
console.log('Arquivos CSV prontos para importação manual!');
