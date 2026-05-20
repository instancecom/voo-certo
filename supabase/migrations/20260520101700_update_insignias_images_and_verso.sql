-- Migration to update all 50 insignias with their premium local SVG path and customized Portuguese motivational quote
-- Auto-generated on 2026-05-20

UPDATE public.insignias 
SET model_url = '/insignias/primeiro-voo.svg', 
    verso_texto = 'Toda grande jornada na aviação começa com a coragem de dar o primeiro passo. O céu agora é o seu limite!', 
    updated_at = now() 
WHERE name = 'Primeiro Voo';

UPDATE public.insignias 
SET model_url = '/insignias/decolagem.svg', 
    verso_texto = 'Assim como um avião decola contra o vento, suas dificuldades são o impulso para sua subida rumo ao sucesso.', 
    updated_at = now() 
WHERE name = 'Decolagem';

UPDATE public.insignias 
SET model_url = '/insignias/turbulencia-superada.svg', 
    verso_texto = 'Turbulências são passageiras, mas a sua resiliência e foco na segurança duram para sempre. Excelente controle!', 
    updated_at = now() 
WHERE name = 'Turbulência Superada';

UPDATE public.insignias 
SET model_url = '/insignias/cinto-afivelado.svg', 
    verso_texto = 'A disciplina diária é o cinto de segurança que garante um voo tranquilo rumo à aprovação. Continue firme!', 
    updated_at = now() 
WHERE name = 'Cinto Afivelado';

UPDATE public.insignias 
SET model_url = '/insignias/asa-delta.svg', 
    verso_texto = 'Aproveite as correntes de ar para planar cada vez mais alto. Cada pequeno avanço constrói sua asa para o futuro.', 
    updated_at = now() 
WHERE name = 'Asa Delta';

UPDATE public.insignias 
SET model_url = '/insignias/navegante-basico.svg', 
    verso_texto = 'Traçar a rota correta é metade do caminho. Você completou seu primeiro quadrante, mantenha o rumo!', 
    updated_at = now() 
WHERE name = 'Navegante Básico';

UPDATE public.insignias 
SET model_url = '/insignias/radio-ligado.svg', 
    verso_texto = 'Comunicação clara e precisa é a alma da tripulação. Sua voz está sintonizada na frequência da vitória.', 
    updated_at = now() 
WHERE name = 'Rádio Ligado';

UPDATE public.insignias 
SET model_url = '/insignias/emergencia-controlada.svg', 
    verso_texto = 'Manter a calma sob pressão é o que define um verdadeiro profissional de voo. Você está preparado para qualquer situação.', 
    updated_at = now() 
WHERE name = 'Emergência Controlada';

UPDATE public.insignias 
SET model_url = '/insignias/check-in-feito.svg', 
    verso_texto = 'Bem-vindo a bordo! O seu embarque foi confirmado e a sua jornada rumo ao topo da aviação civil começa hoje.', 
    updated_at = now() 
WHERE name = 'Check-in Feito';

UPDATE public.insignias 
SET model_url = '/insignias/tripulante-novato.svg', 
    verso_texto = 'Cada pergunta respondida é uma milha voada em direção ao seu grande objetivo. A prática constrói o mestre.', 
    updated_at = now() 
WHERE name = 'Tripulante Novato';

UPDATE public.insignias 
SET model_url = '/insignias/asa-prateada.svg', 
    verso_texto = 'Consistência e determinação brilham como prata no horizonte. Você está ganhando altitude de cruzeiro!', 
    updated_at = now() 
WHERE name = 'Asa Prateada';

UPDATE public.insignias 
SET model_url = '/insignias/mestre-do-radio.svg', 
    verso_texto = 'A aviação fala uma língua global, e você já domina suas frequências. Comunicação impecável e sem fronteiras!', 
    updated_at = now() 
WHERE name = 'Mestre do Rádio';

UPDATE public.insignias 
SET model_url = '/insignias/turbulencia-mestre.svg', 
    verso_texto = 'Sua atenção irrestrita às normas de segurança faz de você o guardião da cabine. Confiança absoluta a bordo.', 
    updated_at = now() 
WHERE name = 'Turbulência Mestre';

UPDATE public.insignias 
SET model_url = '/insignias/7-dias-no-ar.svg', 
    verso_texto = 'Uma semana inteira de dedicação ininterrupta. Sua rotina de estudos é o motor que não conhece falhas.', 
    updated_at = now() 
WHERE name = '7 Dias no Ar';

UPDATE public.insignias 
SET model_url = '/insignias/aprovado-na-banca.svg', 
    verso_texto = 'A primeira grande vitória no simulado da Banca! O reconhecimento oficial está cada vez mais perto da sua realidade.', 
    updated_at = now() 
WHERE name = 'Aprovado na Banca';

UPDATE public.insignias 
SET model_url = '/insignias/colecionador-de-blocos.svg', 
    verso_texto = 'Dominar uma profissão inteira exige visão sistêmica. Você encaixou cada peça deste desafio com maestria.', 
    updated_at = now() 
WHERE name = 'Colecionador de Blocos';

UPDATE public.insignias 
SET model_url = '/insignias/piloto-de-cabine.svg', 
    verso_texto = 'Cem milhas voadas no simulador de conhecimento. A cabine está sob seu controle e o destino é a excelência.', 
    updated_at = now() 
WHERE name = 'Piloto de Cabine';

UPDATE public.insignias 
SET model_url = '/insignias/estrela-em-ascensao.svg', 
    verso_texto = 'Seu brilho e consistência nos simulados provam que sua ascensão é imparável. Continue brilhando alto!', 
    updated_at = now() 
WHERE name = 'Estrela em Ascensão';

UPDATE public.insignias 
SET model_url = '/insignias/sobrevivente-de-emergencia.svg', 
    verso_texto = 'Em situações críticas, seu conhecimento é a chama que guia e salva vidas. Desempenho perfeito e inspirador.', 
    updated_at = now() 
WHERE name = 'Sobrevivente de Emergência';

UPDATE public.insignias 
SET model_url = '/insignias/comunicador-nato.svg', 
    verso_texto = 'Falar com clareza e empatia abre portas em qualquer aeroporto do mundo. Sua oratória é exemplar.', 
    updated_at = now() 
WHERE name = 'Comunicador Nato';

UPDATE public.insignias 
SET model_url = '/insignias/30-dias-no-ceu.svg', 
    verso_texto = 'Um mês de dedicação diária. Você transformou o estudo em hábito e o horizonte em sua segunda casa.', 
    updated_at = now() 
WHERE name = '30 Dias no Céu';

UPDATE public.insignias 
SET model_url = '/insignias/conquistador-de-blocos.svg', 
    verso_texto = 'Dez blocos superados com garra. Sua bagagem teórica está repleta de conhecimentos sólidos para o voo.', 
    updated_at = now() 
WHERE name = 'Conquistador de Blocos';

UPDATE public.insignias 
SET model_url = '/insignias/aprovado-3x.svg', 
    verso_texto = 'Três aprovações consecutivas mostram que seu sucesso não é sorte, é fruto de preparação implacável.', 
    updated_at = now() 
WHERE name = 'Aprovado 3x';

UPDATE public.insignias 
SET model_url = '/insignias/mestre-da-calma.svg', 
    verso_texto = 'A inteligência emocional é o maior superpoder de um tripulante. Lidar com pessoas é a sua arte.', 
    updated_at = now() 
WHERE name = 'Mestre da Calma';

UPDATE public.insignias 
SET model_url = '/insignias/tripulante-prata.svg', 
    verso_texto = 'Quinhentas etapas superadas! Sua bagagem de voo está pesada de tanto conhecimento acumulado.', 
    updated_at = now() 
WHERE name = 'Tripulante Prata';

UPDATE public.insignias 
SET model_url = '/insignias/asa-de-ouro.svg', 
    verso_texto = 'O ouro reluz nos céus mais altos. Sua altíssima média em vinte simulados coroa sua jornada acadêmica.', 
    updated_at = now() 
WHERE name = 'Asa de Ouro';

UPDATE public.insignias 
SET model_url = '/insignias/comandante-de-cabine.svg', 
    verso_texto = 'Cinco vitórias épicas. Você lidera a cabine de estudos com a autoridade e a sabedoria de um comandante.', 
    updated_at = now() 
WHERE name = 'Comandante de Cabine';

UPDATE public.insignias 
SET model_url = '/insignias/100-dias-no-ar.svg', 
    verso_texto = 'Cem dias voando alto com disciplina de ferro. O hábito de vencer se tornou parte da sua identidade.', 
    updated_at = now() 
WHERE name = '100 Dias no Ar';

UPDATE public.insignias 
SET model_url = '/insignias/mestre-geral.svg', 
    verso_texto = 'Sua excelência em todas as disciplinas de uma profissão é digna de aplausos. Você é uma referência técnica!', 
    updated_at = now() 
WHERE name = 'Mestre Geral';

UPDATE public.insignias 
SET model_url = '/insignias/poliglota-aeronautico.svg', 
    verso_texto = 'Sem barreiras de idioma, o mundo inteiro é o seu destino. Conexão global perfeita em qualquer tripulação.', 
    updated_at = now() 
WHERE name = 'Poliglota Aeronáutico';

UPDATE public.insignias 
SET model_url = '/insignias/sobrevivente-supremo.svg', 
    verso_texto = 'Segurança inabalável e atenção máxima. Você obteve a nota máxima na disciplina que protege vidas no ar.', 
    updated_at = now() 
WHERE name = 'Sobrevivente Supremo';

UPDATE public.insignias 
SET model_url = '/insignias/1000-questoes.svg', 
    verso_texto = 'Mil decolagens intelectuais completadas! Seu cérebro está programado para o sucesso absoluto na aviação.', 
    updated_at = now() 
WHERE name = '1000 Questões';

UPDATE public.insignias 
SET model_url = '/insignias/aprovado-10x.svg', 
    verso_texto = 'Dez vezes aprovado na banca! Sua consistência comprova que você está mais do que pronto para as asas reais.', 
    updated_at = now() 
WHERE name = 'Aprovado 10x';

UPDATE public.insignias 
SET model_url = '/insignias/lenda-da-entrevista.svg', 
    verso_texto = 'Comunicação assertiva, simpatia e perfil ideal. As dinâmicas de grupo e entrevistas serão seu show particular.', 
    updated_at = now() 
WHERE name = 'Lenda da Entrevista';

UPDATE public.insignias 
SET model_url = '/insignias/treinador-epico.svg', 
    verso_texto = 'Trinta dias ininterruptos de foco implacável. A faísca da sua determinação ilumina toda a sua trajetória.', 
    updated_at = now() 
WHERE name = 'Treinador Épico';

UPDATE public.insignias 
SET model_url = '/insignias/colecionador-supremo.svg', 
    verso_texto = 'Cinquenta blocos completados! Uma biblioteca viva de regulamentos, emergências e conhecimentos aeronáuticos.', 
    updated_at = now() 
WHERE name = 'Colecionador Supremo';

UPDATE public.insignias 
SET model_url = '/insignias/estrela-do-ceu.svg', 
    verso_texto = 'Uma luz guia na imensidão azul. Sua precisão e média altíssima são inspiração para toda a tripulação.', 
    updated_at = now() 
WHERE name = 'Estrela do Céu';

UPDATE public.insignias 
SET model_url = '/insignias/mestre-da-pressao.svg', 
    verso_texto = 'Quando a pressão sobe, sua mente clareia e sua precisão cirúrgica assume o controle. Resiliência de aço!', 
    updated_at = now() 
WHERE name = 'Mestre da Pressão';

UPDATE public.insignias 
SET model_url = '/insignias/piloto-de-elite.svg', 
    verso_texto = 'Domínio completo de todas as situações de simulado. Você voa na classe de elite do conhecimento aeronáutico.', 
    updated_at = now() 
WHERE name = 'Piloto de Elite';

UPDATE public.insignias 
SET model_url = '/insignias/capitao-de-conquistas.svg', 
    verso_texto = 'Quarenta troféus em sua galeria pessoal. Seu peito já está coberto de medalhas brilhantes do seu esforço.', 
    updated_at = now() 
WHERE name = 'Capitão de Conquistas';

UPDATE public.insignias 
SET model_url = '/insignias/lenda-da-anac.svg', 
    verso_texto = 'Vinte aprovações oficiais! A banca da ANAC não tem segredos para você. Sua história já se tornou lendária.', 
    updated_at = now() 
WHERE name = 'Lenda da ANAC';

UPDATE public.insignias 
SET model_url = '/insignias/asa-imortal.svg', 
    verso_texto = 'Suas asas transcendem as nuvens. Obter noventa e cinco por cento de média é para quem nasceu para voar eternamente.', 
    updated_at = now() 
WHERE name = 'Asa Imortal';

UPDATE public.insignias 
SET model_url = '/insignias/365-dias-no-ar.svg', 
    verso_texto = 'Um ano inteiro respirando aviação dia após dia. Sua persistência inabalável esculpiu seu caminho rumo ao estrelato.', 
    updated_at = now() 
WHERE name = '365 Dias no Ar';

UPDATE public.insignias 
SET model_url = '/insignias/mestre-absoluto.svg', 
    verso_texto = 'Perfeição absoluta em cada detalhe de sua carreira. Um diamante lapidado com dedicação extrema e paixão sem limites.', 
    updated_at = now() 
WHERE name = 'Mestre Absoluto';

UPDATE public.insignias 
SET model_url = '/insignias/poliglota-supremo.svg', 
    verso_texto = 'Fluidez total em múltiplos idiomas. Suas palavras constroem pontes aéreas perfeitas entre culturas de todo o planeta.', 
    updated_at = now() 
WHERE name = 'Poliglota Supremo';

UPDATE public.insignias 
SET model_url = '/insignias/5000-questoes.svg', 
    verso_texto = 'Cinco mil desafios intelectuais superados! Uma marca monumental que simboliza foco, paixão e dedicação sem fim.', 
    updated_at = now() 
WHERE name = '5000 Questões';

UPDATE public.insignias 
SET model_url = '/insignias/conquistador-de-companhias.svg', 
    verso_texto = 'Desejado pelas maiores empresas do setor. Você conhece e domina os padrões de atendimento e segurança de todas elas.', 
    updated_at = now() 
WHERE name = 'Conquistador de Companhias';

UPDATE public.insignias 
SET model_url = '/insignias/lenda-viva.svg', 
    verso_texto = 'Você conquistou o topo absoluto. Seu nome já faz parte do hall da fama dos maiores aviadores do Voo Certo.', 
    updated_at = now() 
WHERE name = 'Lenda Viva';

UPDATE public.insignias 
SET model_url = '/insignias/comandante-lendario.svg', 
    verso_texto = 'Cinquenta aprovações! Um recorde extraordinário que reflete uma dedicação sem paralelos no ensino aeronáutico.', 
    updated_at = now() 
WHERE name = 'Comandante Lendário';

UPDATE public.insignias 
SET model_url = '/insignias/voo-eterno.svg', 
    verso_texto = 'Mil dias na frequência da excelência. Sua dedicação brilha como o Sol acima das nuvens, iluminando a todos.', 
    updated_at = now() 
WHERE name = 'Voo Eterno';

