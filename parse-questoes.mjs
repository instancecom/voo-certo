import fs from 'fs';

// ─── 1. Extrair parágrafos do XML ────────────────────────────────────────────
const xml = fs.readFileSync('./docx_temp/word/document.xml', 'utf8');
const pMatches = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) || [];

const rawParagraphs = pMatches
  .map(p => {
    const tMatches = p.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    return tMatches.map(t => t.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '')).join('');
  })
  .map(l => l.trim())
  .filter(l => l.length > 0);

// ─── 2. Normalizar parágrafos: separar alternativas coladas ─────────────────
// Padrão OCR frequente: "a) texto Ab) texto Bc) texto Cd) texto D"
function splitAltsCombinadas(line) {
  // Quebrar em: a), b), c), d) onde cada letra é a/b/c/d precedida por texto
  // Ex: "a) de táxib) de pouso c) anticolisão d) de navegação"
  // → ["a) de táxi", "b) de pouso", "c) anticolisão", "d) de navegação"]
  const parts = line.split(/(?=[a-dA-D]\s*[\)\-])/);
  if (parts.length >= 2) return parts.map(p => p.trim()).filter(p => p.length > 0);
  return [line];
}

// Expandir parágrafos separando alternativas coladas
const paragraphs = [];
for (const line of rawParagraphs) {
  // Verificar se a linha tem padrão de múltiplas alternativas coladas
  const hasMultiAlt = /[a-d]\s*\)[^\)]{2,}[b-d]\s*\)/i.test(line);
  if (hasMultiAlt) {
    const parts = splitAltsCombinadas(line);
    paragraphs.push(...parts);
  } else {
    paragraphs.push(line);
  }
}

// ─── 3. Detectar matéria atual ───────────────────────────────────────────────
const MATERIAS_MAP = [
  [/REGULAMENTO|TRÁFEGO\s*AÉR/i, 'regulamentos_de_trafego_aereo'],
  [/METEOROLOGI/i, 'meteorologia'],
  [/NAVEGAÇ/i, 'navegacao'],
  [/CONHECIMENTO\s*TÉC|CÉLULA|MOTOR\s*A\s*PIST|ESTRUTUR/i, 'conhecimentos_tecnicos'],
  [/DESEMPENHO|PLANEJAMENTO/i, 'desempenho_e_planejamento'],
  [/COMUNICAÇ/i, 'comunicacoes'],
  [/INSTRUMENTO/i, 'instrumentos_de_bordo'],
];

function detectMateria(line) {
  if (line.length > 100) return null; // cabeçalhos são curtos
  for (const [re, mat] of MATERIAS_MAP) {
    if (re.test(line)) return mat;
  }
  return null;
}

// ─── 4. Detectar início de questão ───────────────────────────────────────────
// Padrões OCR: "01-", "Ol-", "O1.", "10-", "I0-", "IO-"
// Número pode ser: dígitos, O (zero→O), l/I (1→l/I)
const Q_START = /^([0-9OoIlL]{1,2})\s*[-–\.]\s*(.{5,})/;

function isQStart(line) {
  return Q_START.test(line);
}

function isAlt(line) {
  return /^[a-dA-D]\s*[\)\-]\s*.+/.test(line);
}

function getAltLetra(line) {
  const m = line.match(/^([a-dA-D])\s*[\)\-]\s*(.*)/);
  if (m) return { letra: m[1].toLowerCase(), texto: m[2].trim() };
  return null;
}

// ─── 5. Parse principal ──────────────────────────────────────────────────────
const questoes = [];
let currentMateria = 'regulamentos_de_trafego_aereo';
let provaCount = 0;
let currentProva = 'PP-01';

let i = 0;
while (i < paragraphs.length) {
  const line = paragraphs[i];

  // Detectar mudança de matéria
  const mat = detectMateria(line);
  if (mat) {
    currentMateria = mat;
    i++;
    continue;
  }

  // Detectar início de nova prova
  if (/^[\*\s]*prov[ao]/i.test(line) && line.length < 50) {
    provaCount++;
    currentProva = `PP-${String(provaCount).padStart(2, '0')}`;
    i++;
    continue;
  }

  // Gabarito / seções que não são questões
  if (/^gabarito/i.test(line) || /^PP$|^PH$|^PA$/.test(line)) {
    i++;
    continue;
  }

  // Início de questão
  const qMatch = line.match(Q_START);
  if (qMatch) {
    let enunciado = qMatch[2].trim();
    const opts = { a: '', b: '', c: '', d: '' };
    let altDone = false;

    i++;
    while (i < paragraphs.length) {
      const next = paragraphs[i];

      // Parar condições
      if (isQStart(next)) break;
      if (/^[\*\s]*prov[ao]/i.test(next) && next.length < 50) break;
      if (detectMateria(next)) break;
      if (/^gabarito/i.test(next)) break;
      if (/^PP$|^PH$|^PA$/.test(next)) break;

      // Tentar ler como alternativa
      const altInfo = getAltLetra(next);
      if (altInfo) {
        altDone = true;
        opts[altInfo.letra] = altInfo.texto;
        i++;
        continue;
      }

      // Linha curta de continuação de alternativa (sem letra)
      if (altDone && next.length < 100 && !isQStart(next)) {
        // Tentar adicionar à última alternativa preenchida
        const lastAlt = ['d', 'c', 'b', 'a'].find(l => opts[l]);
        if (lastAlt) {
          opts[lastAlt] += ' ' + next;
        }
        i++;
        continue;
      }

      // Continuação do enunciado
      if (!altDone) {
        enunciado += ' ' + next;
        i++;
        continue;
      }

      i++;
    }

    // Validar questão
    const altCount = Object.values(opts).filter(v => v.trim().length > 0).length;
    const enunciadoClean = enunciado.trim();

    if (enunciadoClean.length >= 15 && altCount >= 2) {
      questoes.push({
        bloco_id: currentMateria,
        text: enunciadoClean,
        option_a: opts.a.trim(),
        option_b: opts.b.trim(),
        option_c: opts.c.trim(),
        option_d: opts.d.trim(),
        correct_answer: '0',
        difficulty: 'medium',
        explanation: `PPAV - ${currentProva}`
      });
    }
    continue;
  }

  i++;
}

// ─── 6. Gerar CSV ───────────────────────────────────────────────────────────
function escapeCsv(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const header = 'bloco_id,text,option_a,option_b,option_c,option_d,correct_answer,difficulty,explanation';
const rows = questoes.map(q =>
  [q.bloco_id, q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.difficulty, q.explanation]
    .map(escapeCsv)
    .join(',')
);

const csv = '\uFEFF' + [header, ...rows].join('\n'); // BOM para Excel reconhecer UTF-8
fs.writeFileSync('./questoes_ppav.csv', csv, 'utf8');

// ─── 7. Relatório ────────────────────────────────────────────────────────────
const stats = {};
questoes.forEach(q => { stats[q.bloco_id] = (stats[q.bloco_id] || 0) + 1; });

console.log(`\n✅ Total de questões extraídas: ${questoes.length}`);
console.log('\n📊 Por matéria:');
Object.entries(stats).sort((a,b) => b[1]-a[1]).forEach(([k, v]) => console.log(`   ${k}: ${v}`));
console.log('\n📄 Arquivo: questoes_ppav.csv');

// Amostra de qualidade
console.log('\n🔍 Amostra (5 questões):');
const sample = questoes.filter(q => q.option_a && q.option_b && q.option_c && q.option_d).slice(0, 5);
sample.forEach((q, idx) => {
  console.log(`\n--- Questão ${idx + 1} [${q.bloco_id}] ---`);
  console.log(`📌 ${q.text.substring(0, 100)}${q.text.length > 100 ? '...' : ''}`);
  console.log(`   A) ${q.option_a}`);
  console.log(`   B) ${q.option_b}`);
  console.log(`   C) ${q.option_c}`);
  console.log(`   D) ${q.option_d}`);
});

// Questões com 4 alternativas completas
const completas = questoes.filter(q => q.option_a && q.option_b && q.option_c && q.option_d).length;
console.log(`\n📈 Questões com 4 alternativas completas: ${completas}/${questoes.length}`);
