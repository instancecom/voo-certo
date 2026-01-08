-- Add block_number to questions for ANAC exam blocks (1-4)
ALTER TABLE public.questions 
ADD COLUMN block_number integer DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.questions.block_number IS 'Block number for ANAC exam format (1-4): 1=Regulamentação, 2=Segurança, 3=Conhecimentos Técnicos, 4=CRM/Fatores Humanos';

-- Create index for block filtering
CREATE INDEX idx_questions_block_number ON public.questions(block_number);

-- Add exam_mode type for tracking mode in results
ALTER TABLE public.exam_results 
ADD COLUMN exam_mode text DEFAULT 'standard',
ADD COLUMN block_results jsonb DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN public.exam_results.exam_mode IS 'Exam mode: standard, banca_anac, livre';
COMMENT ON COLUMN public.exam_results.block_results IS 'Results per block for ANAC mode';