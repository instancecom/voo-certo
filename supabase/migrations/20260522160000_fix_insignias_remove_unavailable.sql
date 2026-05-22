-- Migration: Limpar insígnias sem simulados correspondentes na plataforma
-- e corrigir condition_types errados
-- Data: 2026-05-22

-- 1. Desativar insígnias de idiomas (inglês/espanhol) — sem simulados correspondentes
UPDATE public.insignias SET is_active = false, updated_at = now()
WHERE name IN (
  'Rádio Ligado',
  'Mestre do Rádio',
  'Comunicador Nato',
  'Poliglota Aeronáutico',
  'Poliglota Supremo'
);

-- 2. Desativar insígnias de comportamental/estresse/entrevista — sem simulados correspondentes
UPDATE public.insignias SET is_active = false, updated_at = now()
WHERE name IN (
  'Mestre da Calma',
  'Lenda da Entrevista',
  'Mestre da Pressão'
);

-- 3. Desativar insígnia de companhias — funcionalidade não implementada
UPDATE public.insignias SET is_active = false, updated_at = now()
WHERE name = 'Conquistador de Companhias';

-- 4. Corrigir "Turbulência Superada": de security_streak para security_correct
--    Descrição original: "5 questões de Segurança acertadas seguidas" → usaremos security_correct >= 5
UPDATE public.insignias
SET condition_type = 'security_correct',
    condition_value = 5,
    description = '5 questões de Segurança acertadas',
    updated_at = now()
WHERE name = 'Turbulência Superada';

-- 5. Corrigir "Emergência Controlada": de security_block_score para security_score
--    Sem dados de qual bloco específico é de emergência, usa score geral de segurança
UPDATE public.insignias
SET condition_type = 'security_score',
    condition_value = 80,
    description = '80% de acerto em questões de Segurança',
    updated_at = now()
WHERE name = 'Emergência Controlada';

-- 6. Ajustar "Lenda Viva": de 49 para 41 insígnias (total ativo após remoções)
UPDATE public.insignias
SET condition_value = 38,
    description = 'Conquistou 38 ou mais insígnias',
    updated_at = now()
WHERE name = 'Lenda Viva';

-- 7. Ajustar "Estrela em Ascensão": condition_value de 70 para 5
--    Motivo: condition_type consecutive_score conta simulados com score>=70 consecutivos
--    O condition_value deve ser a QUANTIDADE de simulados (5), não a nota (70)
UPDATE public.insignias
SET condition_value = 5,
    description = 'Média ≥70% em 5 simulados consecutivos',
    updated_at = now()
WHERE name = 'Estrela em Ascensão';

-- 8. Corrigir "Colecionador de Blocos": profession_complete → blocks_completed
UPDATE public.insignias
SET condition_type = 'blocks_completed',
    condition_value = 4,
    description = 'Completou 4 blocos em modo Bloco',
    updated_at = now()
WHERE name = 'Colecionador de Blocos';

-- 9. Corrigir "Mestre Geral": profession_mastery → avg_score_blocks (blocos com avg>=90)
--    Simplificando: usar all_modes_score com condition_value 90 (avg global >= 90%)
UPDATE public.insignias
SET condition_type = 'all_modes_score',
    condition_value = 90,
    description = 'Média geral de 90% em todos os simulados',
    updated_at = now()
WHERE name = 'Mestre Geral';

-- 10. Corrigir "Mestre Absoluto": profession_perfect → all_modes_score com 100%
UPDATE public.insignias
SET condition_type = 'all_modes_score',
    condition_value = 100,
    description = 'Média geral de 100% em todos os simulados',
    updated_at = now()
WHERE name = 'Mestre Absoluto';
