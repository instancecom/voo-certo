-- Remove a restrição de UNIQUE(user_id) da tabela curriculum_data para permitir múltiplos currículos por usuário
ALTER TABLE public.curriculum_data DROP CONSTRAINT IF EXISTS curriculum_data_user_id_key;
