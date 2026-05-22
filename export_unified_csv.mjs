import fs from 'fs';
import { q_meteorologia } from './q_meteorologia.mjs';
import { q_meteorologia_part2 } from './q_meteorologia_part2.mjs';

import { q_regulamentos } from './q_regulamentos.mjs';
import { q_regulamentos_part2 } from './q_regulamentos_part2.mjs';

import { q1 as nav_q1 } from './nav_q1.mjs';
import { nav_q2 } from './nav_q2.mjs';
import { nav_q3 } from './nav_q3.mjs';

import { q_motores } from './q_motores.mjs';
import { q_motores_part2 } from './q_motores_part2.mjs';

import { part1 as q_tv_part1 } from './q_tv_part1.mjs';
import { q_tv_part2 } from './q_tv_part2.mjs';
import { q_tv_part3 } from './q_tv_part3.mjs';

function escapeCsv(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function mapCorrectAnswer(ans) {
  if (typeof ans === 'string') {
    const lower = ans.toLowerCase().trim();
    if (lower === 'a') return 0;
    if (lower === 'b') return 1;
    if (lower === 'c') return 2;
    if (lower === 'd') return 3;
  }
  return ans;
}

function exportCsv(filename, questoes) {
  const header = 'bloco_id,text,option_a,option_b,option_c,option_d,correct_answer,difficulty,explanation';
  const rows = questoes.map(q =>
    [q.bloco_id, q.text, q.option_a, q.option_b, q.option_c, q.option_d, mapCorrectAnswer(q.correct_answer), q.difficulty, q.explanation]
      .map(escapeCsv)
      .join(',')
  );

  const csv = '\uFEFF' + [header, ...rows].join('\n'); // BOM para Excel
  fs.writeFileSync(`./${filename}`, csv, 'utf8');
  console.log(`Gerado: ${filename} com ${questoes.length} questões.`);
}

const meteorologia = [...q_meteorologia, ...q_meteorologia_part2];
const regulamentos = [...q_regulamentos, ...q_regulamentos_part2];
const navegacao = [...nav_q1, ...nav_q2, ...nav_q3];
const motores = [...q_motores, ...q_motores_part2];
const teoria_voo = [...q_tv_part1, ...q_tv_part2, ...q_tv_part3];

exportCsv('csv_meteorologia.csv', meteorologia);
exportCsv('csv_regulamentos.csv', regulamentos);
exportCsv('csv_navegacao.csv', navegacao);
exportCsv('csv_motores_conhecimentos_tecnicos.csv', motores);
exportCsv('csv_teoria_de_voo.csv', teoria_voo);

console.log('Unificação concluída com sucesso!');
