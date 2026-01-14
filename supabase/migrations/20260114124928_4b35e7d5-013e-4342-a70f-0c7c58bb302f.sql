-- Create table for career guide steps with associated simulados
CREATE TABLE public.guia_etapas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_number INTEGER NOT NULL UNIQUE,
  emoji TEXT NOT NULL DEFAULT '📌',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '[]'::jsonb,
  tips JSONB NOT NULL DEFAULT '[]'::jsonb,
  simulado_ids JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guia_etapas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active guide steps"
ON public.guia_etapas
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage guide steps"
ON public.guia_etapas
FOR ALL
USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_guia_etapas_updated_at
BEFORE UPDATE ON public.guia_etapas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default 8 steps
INSERT INTO public.guia_etapas (step_number, emoji, title, description, details, tips, display_order) VALUES
(1, '📚', 'Curso Teórico Homologado pela ANAC', 
 'O primeiro passo é realizar um curso de formação de comissário de voo em uma escola homologada pela ANAC.',
 '["Carga horária mínima: 150 horas teóricas", "Disciplinas: Regulamentação, Segurança de Voo, Primeiros Socorros, Sobrevivência, CRM", "Ao final, você receberá o Certificado de Conclusão do Curso (CCC)", "O curso prepara para a prova da ANAC e para a rotina a bordo"]'::jsonb,
 '["Escolha uma escola reconhecida e com boas avaliações", "Aproveite o curso para fazer networking com futuros colegas", "Comece a estudar inglês desde já - será essencial!"]'::jsonb,
 1),
(2, '🩺', 'Exame Médico CMA (Certificado Médico Aeronáutico)',
 'Você precisará passar por uma avaliação médica rigorosa para obter o CMA Classe 2 ou 3.',
 '["Exame realizado por médicos credenciados pela ANAC", "Avalia: visão, audição, sistema cardiovascular, neurológico e psicológico", "Validade: 1 a 5 anos dependendo da idade", "Sem o CMA, não é possível exercer a função a bordo"]'::jsonb,
 '["Cuide da sua saúde antes do exame: alimentação, sono e exercícios", "Leve todos os documentos e exames anteriores", "Informe ao médico sobre qualquer condição pré-existente"]'::jsonb,
 2),
(3, '📝', 'Cadastro Online nas Companhias Aéreas',
 'Com o curso concluído, é hora de se candidatar às vagas nas companhias aéreas.',
 '["Acesse o site de carreiras das companhias (LATAM, GOL, Azul, etc.)", "Preencha o cadastro com dados atualizados", "Prepare um currículo objetivo e profissional", "Algumas empresas pedem vídeo de apresentação ou carta de motivação"]'::jsonb,
 '["Personalize seu currículo para cada companhia", "No vídeo, seja natural, sorria e demonstre paixão pela aviação", "Mantenha seu cadastro sempre atualizado"]'::jsonb,
 3),
(4, '💻', 'Testes Online (Idiomas e Psicométricos)',
 'A maioria das companhias aplica testes online para avaliar idiomas e raciocínio.',
 '["Testes de inglês: gramática, interpretação, listening", "Testes de espanhol (algumas companhias)", "Testes SHL: raciocínio lógico, verbal e numérico", "Testes psicométricos: personalidade e comportamento"]'::jsonb,
 '["Pratique testes SHL antes do dia - existem simuladores online", "Treine listening com podcasts e filmes em inglês", "Faça os testes em ambiente silencioso e com boa internet"]'::jsonb,
 4),
(5, '🧠', 'Avaliação Comportamental e Psicométrica',
 'Esta etapa avalia se você tem o perfil adequado para trabalhar como comissário(a).',
 '["Avaliação de competências: trabalho em equipe, resiliência, comunicação", "Fit cultural: alinhamento com os valores da empresa", "Pode incluir inventários de personalidade", "Algumas companhias fazem essa avaliação online, outras presencialmente"]'::jsonb,
 '["Seja autêntico nas respostas - não tente ''acertar''", "Pesquise sobre a cultura e valores da companhia", "Demonstre equilíbrio emocional e maturidade"]'::jsonb,
 5),
(6, '👥', 'Dinâmica de Grupo',
 'Algumas companhias realizam dinâmicas para observar como você interage com outras pessoas.',
 '["Atividades em grupo que simulam situações do dia a dia", "Avaliadores observam: liderança, cooperação, comunicação", "Pode incluir debates, resolução de problemas em equipe", "Duração média: 2 a 4 horas"]'::jsonb,
 '["Participe ativamente, mas saiba ouvir os outros", "Não tente se sobressair demais - trabalho em equipe é essencial", "Vista-se de forma profissional e chegue com antecedência"]'::jsonb,
 6),
(7, '🗣️', 'Entrevista Individual Comportamental',
 'A entrevista final avalia suas experiências, motivações e comportamentos passados.',
 '["Perguntas baseadas em competências (método STAR)", "Exemplos: ''Conte uma situação em que você lidou com um cliente difícil''", "Avalia: comunicação, resolução de conflitos, atendimento ao cliente", "Pode ser em português, inglês ou ambos"]'::jsonb,
 '["Use o método STAR: Situação, Tarefa, Ação, Resultado", "Prepare 5-10 histórias de experiências anteriores", "Pratique respostas em inglês sobre você e sua motivação", "Faça perguntas inteligentes sobre a empresa e a função"]'::jsonb,
 7),
(8, '✈️', 'Exame Médico Final e Treinamento Inicial',
 'Após aprovação, você fará exames médicos complementares e o treinamento da companhia.',
 '["Exames admissionais completos", "Treinamento inicial (ground school): 4 a 6 semanas", "Inclui: procedimentos da companhia, aeronave específica, emergências", "Voos de experiência supervisionados antes de voar solo"]'::jsonb,
 '["Absorva todo o conhecimento - será sua base para a carreira", "Faça anotações e revise diariamente", "Construa bons relacionamentos com instrutores e colegas"]'::jsonb,
 8);

-- Create index for better performance
CREATE INDEX idx_guia_etapas_step_number ON public.guia_etapas(step_number);
CREATE INDEX idx_guia_etapas_active ON public.guia_etapas(is_active);