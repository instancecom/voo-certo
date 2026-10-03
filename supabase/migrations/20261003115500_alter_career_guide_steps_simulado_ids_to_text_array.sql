-- Alter career_guide_steps columns from uuid[] to text[]
-- This allows storing composite format values like "<uuid>:<mode>" (e.g. "<uuid>:banca_anac", "<uuid>:livre", "<uuid>:bloco")

ALTER TABLE public.career_guide_steps 
  ALTER COLUMN simulado_ids TYPE text[] USING simulado_ids::text[],
  ALTER COLUMN simulado_ids SET DEFAULT '{}';

ALTER TABLE public.career_guide_steps 
  ALTER COLUMN microcourse_ids TYPE text[] USING microcourse_ids::text[],
  ALTER COLUMN microcourse_ids SET DEFAULT '{}';
