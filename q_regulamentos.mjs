import fs from 'fs';

const questoes = [
  // ==================== ESPAÇO AÉREO (CLASSES A-G) ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'No espaço aéreo brasileiro, qual classe de espaço aéreo é designada para operações IFR e VFR, sendo que o serviço de controle de tráfego aéreo é prestado a ambas as operações?',
    option_a: 'Classe A',
    option_b: 'Classe C',
    option_c: 'Classe F',
    option_d: 'Classe G',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'No espaço aéreo Classe C, tanto voos IFR quanto VFR recebem serviço de controle de tráfego aéreo. Voos IFR são separados de outros IFR e VFR; voos VFR são separados de IFR e recebem informação de tráfego VFR.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual classe de espaço aéreo é reservada exclusivamente para operações IFR no Brasil?',
    option_a: 'Classe B',
    option_b: 'Classe C',
    option_c: 'Classe A',
    option_d: 'Classe D',
    correct_answer: 'c',
    difficulty: 'easy',
    explanation: 'O espaço aéreo Classe A é reservado exclusivamente para operações IFR. Todos os voos são sujeitos ao serviço de controle de tráfego aéreo e recebem separação entre si.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Em qual classe de espaço aéreo os voos VFR não precisam de autorização ATC para entrar, mas recebem apenas informações de voo (FIS)?',
    option_a: 'Classe C',
    option_b: 'Classe D',
    option_c: 'Classe E',
    option_d: 'Classe G',
    correct_answer: 'd',
    difficulty: 'medium',
    explanation: 'No espaço aéreo Classe G (não controlado), os voos VFR não precisam de autorização ATC e recebem apenas o serviço de informação de voo quando disponível. Não há separação provida.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Segundo o RBAC 91, o espaço aéreo controlado inferior no Brasil compreende o espaço aéreo desde a superfície até o nível de voo:',
    option_a: 'FL 195',
    option_b: 'FL 245',
    option_c: 'FL 285',
    option_d: 'FL 600',
    correct_answer: 'b',
    difficulty: 'hard',
    explanation: 'O espaço aéreo controlado inferior no Brasil vai da superfície até FL 245 (exclusive). Acima de FL 245 inicia-se o espaço aéreo superior, que é Classe A.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'No espaço aéreo Classe D, qual serviço é fornecido aos voos VFR?',
    option_a: 'Separação com todos os outros voos',
    option_b: 'Apenas serviço de informação de voo',
    option_c: 'Separação de IFR e informação de tráfego sobre outros VFR',
    option_d: 'Nenhum serviço ATC',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'No Classe D, voos VFR recebem separação de voos IFR e informações de tráfego sobre outros voos VFR. A separação entre VFR não é fornecida pelo ATC.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é o limite superior do espaço aéreo superior (Upper Information Region - UIR) no Brasil?',
    option_a: 'FL 450',
    option_b: 'FL 600',
    option_c: 'Ilimitado',
    option_d: 'FL 999',
    correct_answer: 'c',
    difficulty: 'hard',
    explanation: 'O espaço aéreo superior vai de FL 245 até ilimitado (unlimited). É designado como espaço aéreo Classe A, onde apenas voos IFR são permitidos.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Em qual classe de espaço aéreo o piloto VFR deve estabelecer contato com o ATC antes de entrar, mas a separação entre VFR não é garantida?',
    option_a: 'Classe B',
    option_b: 'Classe C',
    option_c: 'Classe D',
    option_d: 'Classe E',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'No espaço aéreo Classe D, voos VFR precisam de autorização prévia do ATC, porém a separação é fornecida apenas entre IFR e VFR. A separação entre VFR não é garantida.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Em espaço aéreo não controlado (Classe G) abaixo de 900 m (3.000 ft) AMSL e acima de terreno, qual é a visibilidade mínima exigida para operações VFR no Brasil?',
    option_a: '1.500 m',
    option_b: '3.000 m',
    option_c: '5.000 m',
    option_d: '8.000 m',
    correct_answer: 'a',
    difficulty: 'hard',
    explanation: 'Em espaço aéreo Classe G abaixo de 900 m AMSL ou abaixo de 300 m acima do terreno (o que for maior), a visibilidade mínima exigida é de 1.500 m. Esta é uma exceção às regras gerais de visibilidade VFR.'
  },
  // ==================== ÓRGÃOS ATC ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual órgão ATC é responsável pelo controle de tráfego aéreo em rota dentro de uma FIR?',
    option_a: 'TWR (Torre de Controle)',
    option_b: 'APP (Aproximação)',
    option_c: 'ACC (Centro de Controle de Área)',
    option_d: 'AFIS (Serviço de Informação de Voo de Aeródromo)',
    correct_answer: 'c',
    difficulty: 'easy',
    explanation: 'O ACC (Centro de Controle de Área) é responsável pelo controle de tráfego aéreo em rota, gerenciando o espaço aéreo da FIR em altitudes de cruzeiro.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O AFIS (Aerodrome Flight Information Service) difere da TWR porque:',
    option_a: 'O AFIS controla aeronaves e emite autorizações obrigatórias',
    option_b: 'O AFIS apenas fornece informações, sem autoridade para emitir autorizações de controle',
    option_c: 'O AFIS opera apenas em aeródromos com tráfego IFR',
    option_d: 'O AFIS é exclusivo para helicópteros',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'O AFIS é um serviço de informação de voo de aeródromo que fornece informações úteis para aeronaves, mas não emite autorizações de controle. A responsabilidade pela separação é do piloto.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual órgão ATC é responsável pelo controle de aeronaves na área de controle terminal (TMA)?',
    option_a: 'ACC',
    option_b: 'TWR',
    option_c: 'APP',
    option_d: 'ATIS',
    correct_answer: 'c',
    difficulty: 'easy',
    explanation: 'O APP (Órgão de Controle de Aproximação) é responsável pelo controle de tráfego aéreo na TMA (Terminal Maneuvering Area), coordenando chegadas e partidas de aeródromos controlados.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A TWR (Torre de Controle de Aeródromo) exerce controle sobre:',
    option_a: 'Apenas aeronaves em solo',
    option_b: 'Aeronaves no circuito de tráfego, na área de manobras e na CTR',
    option_c: 'Apenas aeronaves em final de pouso',
    option_d: 'Somente aeronaves IFR dentro da TMA',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'A TWR controla aeronaves em voo na CTR (incluindo circuito de tráfego e fases de decolagem/pouso) e na área de manobras do aeródromo (pistas e pistas de táxi).'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é a principal diferença entre um aeródromo controlado e um aeródromo com AFIS?',
    option_a: 'Aeródromo controlado tem pista pavimentada e AFIS não',
    option_b: 'Aeródromo controlado tem TWR que emite autorizações; aeródromo com AFIS apenas fornece informações',
    option_c: 'Aeródromo com AFIS opera 24 horas; aeródromo controlado tem horário limitado',
    option_d: 'Não há diferença operacional entre os dois tipos',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'A principal diferença é que em aeródromos controlados a TWR emite autorizações ATC obrigatórias, enquanto aeródromos com AFIS apenas fornecem informações de voo sem autoridade de controle.'
  },
  // ==================== PLANO DE VOO ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Com quanto tempo de antecedência mínima deve ser apresentado o Plano de Voo (FPL) antes do EOBT para voos em espaço aéreo controlado?',
    option_a: '30 minutos',
    option_b: '60 minutos',
    option_c: '90 minutos',
    option_d: '120 minutos',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'O FPL deve ser apresentado com no mínimo 60 minutos antes do EOBT (Estimated Off-Block Time) para voos em espaço aéreo controlado, conforme as normas do DECEA.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que significa a sigla AFIL no contexto do Plano de Voo?',
    option_a: 'Plano de voo apresentado em voo (Air Filed)',
    option_b: 'Plano de voo arquivado (Archived Flight Plan)',
    option_c: 'Autorização de Frequência de Intercomunicação em Linha',
    option_d: 'Código de Afiliação Aeronáutica',
    correct_answer: 'a',
    difficulty: 'medium',
    explanation: 'AFIL significa Air Filed, ou seja, plano de voo apresentado enquanto a aeronave já está em voo. É indicado no campo 18 do formulário de plano de voo com a abreviação AFIL.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O RPL (Repetitive Flight Plan) é utilizado para:',
    option_a: 'Voos que repetem exatamente a mesma rota regularmente',
    option_b: 'Voos de repetição de decolagem após abortagem',
    option_c: 'Plano de voo arquivado para emergências',
    option_d: 'Plano de voo simplificado para helicópteros',
    correct_answer: 'a',
    difficulty: 'medium',
    explanation: 'O RPL (Plano de Voo Repetitivo) é usado por operadores que realizam voos com a mesma rota, mesmas características e em horários regulares, evitando a necessidade de apresentar um novo FPL a cada voo.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é NTV no contexto das normas ATC brasileiras?',
    option_a: 'Notificação de Tráfego Verificado',
    option_b: 'Notificação de Tráfego Visual',
    option_c: 'Aviso de Tráfego Nocturno para VFR',
    option_d: 'Notificação de Tráfego por Voo',
    correct_answer: 'b',
    difficulty: 'hard',
    explanation: 'NTV (Notificação de Tráfego Visual) é utilizada para comunicar às aeronaves sobre outros tráfegos observados visualmente, no contexto das fraseologias e procedimentos ATC brasileiros.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual campo do formulário de Plano de Voo indica o tipo de regras de voo?',
    option_a: 'Campo 7',
    option_b: 'Campo 8',
    option_c: 'Campo 9',
    option_d: 'Campo 10',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'O Campo 8 do formulário ICAO de Plano de Voo indica o tipo de regras de voo (I=IFR, V=VFR, Y=IFR primeiro depois VFR, Z=VFR primeiro depois IFR) e o tipo de voo.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Quando um piloto VFR deve fechar seu plano de voo após a aterrissagem?',
    option_a: 'O plano é fechado automaticamente pelo ATC após a aterrissagem',
    option_b: 'Em até 30 minutos após a aterrissagem',
    option_c: 'O piloto deve informar o fechamento ao órgão ATC competente assim que possível',
    option_d: 'Apenas se solicitado pela TWR',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'O piloto é responsável por fechar o plano de voo após a aterrissagem, informando o órgão ATC competente (TWR, APP, ACC ou ARO) da chegada, pois caso contrário pode ser iniciada a fase INCERFA.'
  },
  // ==================== FASES ALRS ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é a fase do ALRS em que se suspeita que uma aeronave e seus ocupantes estão em perigo grave e iminente e necessitam de assistência imediata?',
    option_a: 'INCERFA',
    option_b: 'ALERFA',
    option_c: 'DETRESFA',
    option_d: 'MAYDAY',
    correct_answer: 'c',
    difficulty: 'easy',
    explanation: 'DETRESFA (Distress Phase) é a fase de socorro, em que se tem certeza que a aeronave e seus ocupantes estão em perigo grave e iminente, necessitando de assistência imediata.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A fase INCERFA é declarada quando:',
    option_a: 'Há certeza de que a aeronave está em perigo iminente',
    option_b: 'Há incerteza quanto à segurança da aeronave e seus ocupantes',
    option_c: 'O piloto declarou emergência pelo rádio',
    option_d: 'A aeronave desviou significativamente de sua rota',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'INCERFA (Uncertainty Phase) é declarada quando há incerteza quanto à segurança de uma aeronave e seus ocupantes. É o primeiro estágio do sistema ALRS.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Quanto tempo após o EOBT, sem notícias da aeronave, deve ser declarada a fase INCERFA?',
    option_a: '15 minutos',
    option_b: '30 minutos',
    option_c: '45 minutos',
    option_d: '60 minutos',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'A fase INCERFA é declarada quando transcorreram 30 minutos após o EOBT e a aeronave não decolou, ou após 30 minutos do horário estimado de chegada sem notícias.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O SALVAERO é o órgão responsável por coordenar as operações de busca e salvamento (SAR) no Brasil sob qual organização?',
    option_a: 'DECEA',
    option_b: 'ANAC',
    option_c: 'FAB (Força Aérea Brasileira)',
    option_d: 'INFRAERO',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'O SALVAERO (Serviço de Busca e Salvamento) opera sob a FAB (Força Aérea Brasileira), sendo responsável pela coordenação das operações SAR no Brasil.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A fase ALERFA é declarada quando:',
    option_a: 'A fase INCERFA foi considerada inadequada e há maior preocupação',
    option_b: 'O piloto declarou PAN PAN',
    option_c: 'Houve falha de comunicação por mais de 5 minutos',
    option_d: 'A aeronave pousou em aeródromo alternativo',
    correct_answer: 'a',
    difficulty: 'medium',
    explanation: 'ALERFA (Alert Phase) é declarada quando a fase INCERFA foi inadequada e há necessidade de alerta, ou seja, há mais preocupação com a segurança da aeronave, porém ainda não há certeza de perigo iminente.'
  },
  // ==================== REGRAS VFR E IFR ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é a visibilidade mínima exigida para operações VFR em espaço aéreo controlado acima de 3.050 m (10.000 ft) AMSL?',
    option_a: '3.000 m',
    option_b: '5.000 m',
    option_c: '8.000 m',
    option_d: '10.000 m',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'Em espaço aéreo controlado acima de 10.000 ft AMSL, a visibilidade mínima para VFR é de 8 km (8.000 m), com separação das nuvens de 300 m vertical e 1.500 m horizontal.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual a regra geral de separação das nuvens para voos VFR em espaço aéreo controlado entre 300 m (1.000 ft) e 3.050 m (10.000 ft)?',
    option_a: '150 m vertical e 600 m horizontal',
    option_b: '300 m vertical e 1.500 m horizontal',
    option_c: '500 m vertical e 2.000 m horizontal',
    option_d: '1.000 ft vertical e 1 NM horizontal',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'Para VFR em espaço aéreo controlado entre 1.000 ft e 10.000 ft AMSL, a separação das nuvens é de 300 m (1.000 ft) verticalmente e 1.500 m (1 NM) horizontalmente.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O voo VFR especial (SVFR) permite que uma aeronave opere:',
    option_a: 'Acima das nuvens em qualquer condição',
    option_b: 'Em uma CTR com condições meteorológicas abaixo do mínimo VFR, com autorização ATC',
    option_c: 'Em espaço aéreo Classe A sem transponder',
    option_d: 'Somente à noite em aeródromos controlados',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'O SVFR (Voo VFR Especial) permite que uma aeronave opere dentro de uma CTR com condições meteorológicas abaixo dos mínimos VFR normais, desde que autorizado pelo ATC e mantendo a aeronave livre de obstáculos.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é a altitude máxima permitida para operações VFR em espaço aéreo não controlado sem restrição de equipamentos?',
    option_a: 'FL 175',
    option_b: 'FL 195',
    option_c: 'FL 245',
    option_d: 'Não há limite para VFR em espaço não controlado',
    correct_answer: 'b',
    difficulty: 'hard',
    explanation: 'No Brasil, voos VFR são permitidos até FL 195 no espaço aéreo inferior. Acima de FL 195, o espaço aéreo superior exige IFR (espaço Classe A).'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Em operações IFR, qual é o requisito mínimo de combustível além da reserva final de 45 minutos?',
    option_a: 'Combustível para o destino mais 15 minutos',
    option_b: 'Combustível para o destino mais 30 minutos de alternância',
    option_c: 'Combustível para o destino mais combustível para o alternante',
    option_d: 'Combustível para o destino, para o alternante e reserva final de 45 minutos',
    correct_answer: 'd',
    difficulty: 'medium',
    explanation: 'Para IFR, o piloto deve carregar combustível para: (1) voar até o aeródromo de destino, (2) voar até o alternante (quando exigido), e (3) reserva final de 45 minutos a velocidade de cruzeiro.'
  },
  // ==================== CIRCUITO DE TRÁFEGO ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é o sentido padrão (convencional) do circuito de tráfego de aeródromo?',
    option_a: 'Curvas à direita',
    option_b: 'Curvas à esquerda',
    option_c: 'Pode ser em qualquer sentido, à escolha do piloto',
    option_d: 'Determinado pela direção do vento',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'O sentido padrão (convencional) do circuito de tráfego é com curvas à esquerda. O sentido oposto (curvas à direita) é denominado não convencional e deve estar publicado.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é a perna do circuito de tráfego que é paralela à pista e executada no sentido oposto à aterrissagem?',
    option_a: 'Perna do vento',
    option_b: 'Través',
    option_c: 'Perna base',
    option_d: 'Final',
    correct_answer: 'a',
    difficulty: 'easy',
    explanation: 'A perna do vento (downwind leg) é a perna do circuito paralela à pista no sentido oposto à aterrissagem. O avião voa em direção contrária ao pouso, com a pista ao lado.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Na perna de través (crosswind leg) do circuito de tráfego, em qual direção o avião voa em relação à pista?',
    option_a: 'Paralelo à pista, no sentido do pouso',
    option_b: 'Perpendicular à pista, após a decolagem',
    option_c: 'Em diagonal para o final',
    option_d: 'Em direção à cabeceira de pouso',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'A perna de través (crosswind) é perpendicular à pista e executada após a subida inicial, conectando a decolagem à perna do vento (downwind). O avião vira 90° após a decolagem.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Um piloto em perna base (base leg) está:',
    option_a: 'Em linha reta alinhado com a pista',
    option_b: 'Paralelo à pista no sentido oposto ao pouso',
    option_c: 'Em segmento perpendicular à pista, entre downwind e final',
    option_d: 'Executando a aproximação final para pouso',
    correct_answer: 'c',
    difficulty: 'easy',
    explanation: 'A perna base (base leg) conecta a perna do vento (downwind) ao final. É perpendicular à pista e o piloto está se preparando para virar para o final e alinhar com a pista.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é a altitude convencional de tráfego para aeronaves de asas fixas no circuito de aeródromo no Brasil?',
    option_a: '500 ft AAL',
    option_b: '800 ft AAL',
    option_c: '1.000 ft AAL',
    option_d: '1.500 ft AAL',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'A altitude convencional de tráfego para aeronaves de asas fixas no circuito de aeródromo é de 1.000 ft (aproximadamente 300 m) acima da elevação do aeródromo (AAL - Above Aerodrome Level).'
  },
  // ==================== SINALIZAÇÃO LUMINOSA ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que significa uma luz VERDE CONTÍNUA emitida pela TWR para uma aeronave em voo?',
    option_a: 'Autorizado para táxi',
    option_b: 'Pousem neste aeródromo',
    option_c: 'Autorizados a aterrissar',
    option_d: 'Decolem',
    correct_answer: 'c',
    difficulty: 'easy',
    explanation: 'Uma luz verde contínua emitida pela Torre de Controle para uma aeronave em voo significa "Autorizado a aterrissar" (Cleared to land).'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que significa uma luz VERMELHA CONTÍNUA emitida pela TWR para uma aeronave em voo?',
    option_a: 'Parem',
    option_b: 'Afastem-se da área de pouso',
    option_c: 'Retornem ao ponto de partida',
    option_d: 'Dêem passagem e continuem a voar em círculos',
    correct_answer: 'd',
    difficulty: 'medium',
    explanation: 'Luz vermelha contínua para aeronave em voo significa "Dêem passagem e continuem a voar em círculos" (Give way to other aircraft and continue circling). A aeronave não está autorizada a pousar.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual sinalização luminosa da TWR indica para uma aeronave em solo "Autorizados a decolar"?',
    option_a: 'Luz verde intermitente',
    option_b: 'Luz verde contínua',
    option_c: 'Luz branca intermitente',
    option_d: 'Luz vermelha intermitente',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'Para aeronave em solo, luz verde contínua significa "Autorizado a decolar" (Cleared for take-off). A mesma luz verde contínua para aeronave em voo significa "Autorizado a aterrissar".'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que significa uma luz BRANCA INTERMITENTE emitida pela TWR para uma aeronave em solo?',
    option_a: 'Retornem ao ponto de partida no aeródromo',
    option_b: 'Parem',
    option_c: 'Autorizados a decolar',
    option_d: 'Táxi proibido',
    correct_answer: 'a',
    difficulty: 'medium',
    explanation: 'Luz branca intermitente para aeronave em solo significa "Retornem ao ponto de partida no aeródromo" (Return to starting point on the aerodrome).'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que significa uma luz VERMELHA INTERMITENTE emitida pela TWR para uma aeronave em solo?',
    option_a: 'Táxi proibido',
    option_b: 'Afastem-se da pista em uso',
    option_c: 'Parem',
    option_d: 'Autorizados a cruzar a pista',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'Luz vermelha intermitente para aeronave em solo significa "Afastem-se da pista em uso" (Taxi clear of the runway in use).'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Quando a TWR utiliza sinais luminosos, em que situação o piloto deve reconhecer o recebimento das luzes durante o dia?',
    option_a: 'Acendendo e apagando as luzes de pouso',
    option_b: 'Balançando as asas',
    option_c: 'Transmitindo no rádio',
    option_d: 'Não é necessário reconhecimento',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'Durante o dia, o piloto acusa o recebimento de sinais luminosos da TWR balançando as asas da aeronave. À noite, o reconhecimento é feito acendendo e apagando as luzes de aterrissagem ou de navegação.'
  },
  // ==================== PUBLICAÇÕES AERONÁUTICAS ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é o AIP (Aeronautical Information Publication)?',
    option_a: 'Publicação temporária com informações de curta duração',
    option_b: 'Publicação permanente com informações aeronáuticas essenciais para navegação',
    option_c: 'Circular de informação aeronáutica',
    option_d: 'Publicação diária com informações de tráfego aéreo',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'O AIP (Publicação de Informação Aeronáutica) é uma publicação permanente que contém informações aeronáuticas de natureza duradoura, essenciais para a navegação aérea, emitida pelo DECEA no Brasil.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O NOTAM (Notice to Airmen) é utilizado para:',
    option_a: 'Publicar informações permanentes sobre rotas aéreas',
    option_b: 'Divulgar informações temporárias ou urgentes que afetam a navegação aérea',
    option_c: 'Emitir regulamentos permanentes de tráfego aéreo',
    option_d: 'Publicar cartas de aproximação por instrumentos',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'O NOTAM é utilizado para divulgar informações de natureza temporária ou que surgiram de forma tão rápida que não seria possível publicar no AIP, informando sobre condições e restrições temporárias que afetam a navegação.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é o ROTAER no contexto das publicações aeronáuticas brasileiras?',
    option_a: 'Roteiro Aeronáutico Brasileiro - publicação com informações sobre aeródromos nacionais',
    option_b: 'Regulamento de Operações de Tráfego Aéreo Especial',
    option_c: 'Rota Aérea de Emergência',
    option_d: 'Relatório de Ocorrências no Tráfego Aéreo',
    correct_answer: 'a',
    difficulty: 'easy',
    explanation: 'O ROTAER (Roteiro Aeronáutico Brasileiro) é uma publicação do DECEA que contém informações sobre aeródromos nacionais, incluindo características físicas, procedimentos, comunicações e serviços disponíveis.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é a diferença entre AIC (Aeronautical Information Circular) e NOTAM?',
    option_a: 'AIC contém informações urgentes; NOTAM contém informações permanentes',
    option_b: 'AIC contém informações administrativas, meteorológicas ou explicativas; NOTAM contém informações temporárias operacionais',
    option_c: 'Não há diferença prática entre AIC e NOTAM',
    option_d: 'AIC é emitido diariamente; NOTAM é emitido mensalmente',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'O AIC contém informações de natureza administrativa, meteorológica ou puramente explicativa, sem caráter operacional imediato. O NOTAM contém informações temporárias e operacionais urgentes que afetam diretamente a navegação.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual publicação aeronáutica brasileira contém os procedimentos de aproximação por instrumentos (IAP)?',
    option_a: 'ROTAER',
    option_b: 'AIP Brasil',
    option_c: 'ATCA',
    option_d: 'NOTAM',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'Os procedimentos de aproximação por instrumentos (IAP - Instrument Approach Procedures) são publicados no AIP Brasil, na seção AD (Aerodrome), juntamente com outras informações aeroportuárias permanentes.'
  },
  // ==================== CBAer e RBAC ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é o CBAer (Código Brasileiro de Aeronáutica)?',
    option_a: 'Regulamento técnico de aeronavegabilidade de aeronaves',
    option_b: 'Lei Federal nº 7.565/86 que estabelece as normas gerais da aviação civil brasileira',
    option_c: 'Manual de procedimentos ATC do DECEA',
    option_d: 'Certificado de Homologação de Tipo de aeronaves',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'O CBAer (Código Brasileiro de Aeronáutica) é a Lei Federal nº 7.565, de 19 de dezembro de 1986, que estabelece as normas gerais da aviação civil no Brasil, sendo a lei máxima da aviação nacional.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O RBAC (Regulamento Brasileiro da Aviação Civil) é emitido por qual autoridade?',
    option_a: 'DECEA',
    option_b: 'ANAC',
    option_c: 'FAB',
    option_d: 'INFRAERO',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'Os RBACs (Regulamentos Brasileiros da Aviação Civil) são emitidos pela ANAC (Agência Nacional de Aviação Civil), sendo os regulamentos técnicos que regem a aviação civil brasileira.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual RBAC regula as regras gerais de operação de aeronaves civis no Brasil (equivalente ao FAR Part 91)?',
    option_a: 'RBAC 61',
    option_b: 'RBAC 91',
    option_c: 'RBAC 117',
    option_d: 'RBAC 135',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'O RBAC 91 regulamenta as regras gerais de operação de aeronaves civis no Brasil, abrangendo regras de voo, equipamentos obrigatórios, limites de altitude e outros requisitos operacionais gerais.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual RBAC regula a certificação de pilotos no Brasil?',
    option_a: 'RBAC 61',
    option_b: 'RBAC 91',
    option_c: 'RBAC 65',
    option_d: 'RBAC 43',
    correct_answer: 'a',
    difficulty: 'easy',
    explanation: 'O RBAC 61 regulamenta a certificação de pilotos e instrutores de voo no Brasil, estabelecendo os requisitos para obtenção e manutenção de licenças aeronáuticas.'
  },
  // ==================== DECEA ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O DECEA é responsável por:',
    option_a: 'Certificar aeronaves e pilotos civis',
    option_b: 'Gerenciar o espaço aéreo brasileiro e prestar os serviços de navegação aérea',
    option_c: 'Regular as tarifas aeroportuárias',
    option_d: 'Investigar acidentes aeronáuticos',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'O DECEA (Departamento de Controle do Espaço Aéreo) é o órgão da FAB responsável por planejar, gerenciar e controlar o espaço aéreo brasileiro, além de prestar os serviços de navegação aérea (ATC, meteorologia, etc.).'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'As ICA (Instrução do Comando da Aeronáutica) são documentos emitidos por:',
    option_a: 'ANAC',
    option_b: 'INFRAERO',
    option_c: 'Comando da Aeronáutica (COMAER)',
    option_d: 'DECEA',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'As ICA (Instrução do Comando da Aeronáutica) são emitidas pelo Comando da Aeronáutica (COMAER) e regulamentam aspectos operacionais do espaço aéreo e serviços de navegação aérea gerenciados pela FAB/DECEA.'
  },
  // ==================== ÁREAS CONDICIONADAS ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é uma SBR (área proibida) no espaço aéreo brasileiro?',
    option_a: 'Área onde o voo é proibido permanentemente sem exceção',
    option_b: 'Área onde o voo é restrito sob certas condições',
    option_c: 'Área perigosa com atividades que representam risco à aviação',
    option_d: 'Área reservada para voos militares em exercícios',
    correct_answer: 'a',
    difficulty: 'easy',
    explanation: 'SBR (Área Proibida) é o espaço aéreo de dimensões definidas acima do território brasileiro onde o voo de aeronaves civis é completamente proibido. O "P" no código ICAO significa Prohibited.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é uma SBD (área perigosa) no contexto do espaço aéreo brasileiro?',
    option_a: 'Área onde o voo é completamente proibido',
    option_b: 'Área onde o voo é condicionado a autorização prévia',
    option_c: 'Área com atividades perigosas à aviação, mas sem proibição de entrada',
    option_d: 'Área exclusiva para helicópteros militares',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'SBD (Área Perigosa) é uma área com atividades que representam perigo à aviação (como tiros de artilharia, fogos de artifício), mas que não é proibida. O piloto pode entrar sob sua responsabilidade. O "D" significa Dangerous.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Uma SBP (área restrita) pode ser sobrevoada por aeronaves civis?',
    option_a: 'Nunca, pois é completamente proibida como a SBR',
    option_b: 'Sim, desde que obtida a autorização do órgão responsável pela área',
    option_c: 'Apenas por aeronaves militares a qualquer momento',
    option_d: 'Somente durante o dia e com autorização da TWR',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'SBP (Área Restrita) tem o voo condicionado a certas restrições. Aeronaves civis podem sobrevoá-la desde que obtenham autorização do órgão responsável pela área. O "R" significa Restricted.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Como é identificada uma área proibida no espaço aéreo brasileiro no código ICAO?',
    option_a: 'SBD seguido de número',
    option_b: 'SBP seguido de número',
    option_c: 'SBR seguido de número',
    option_d: 'SBA seguido de número',
    correct_answer: 'c',
    difficulty: 'easy',
    explanation: 'As áreas proibidas no Brasil são identificadas com o prefixo SBR (SB = indicativo do Brasil, R = Restricted/Prohibited) seguido de número. Por exemplo: SBR-1.'
  },
  // ==================== SEPARAÇÃO DE AERONAVES ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é a separação mínima vertical entre aeronaves em cruzeiro IFR abaixo de FL 290 no espaço aéreo brasileiro?',
    option_a: '500 ft',
    option_b: '1.000 ft',
    option_c: '2.000 ft',
    option_d: '3.000 ft',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'A separação vertical mínima entre aeronaves IFR abaixo de FL 290 é de 1.000 ft (300 m). Acima de FL 290, a separação mínima é de 2.000 ft, exceto onde o RVSM está implementado (600 m/2.000 ft).'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O RVSM (Reduced Vertical Separation Minima) reduz a separação vertical mínima entre aeronaves de:',
    option_a: '1.000 ft para 500 ft',
    option_b: '2.000 ft para 1.000 ft',
    option_c: '3.000 ft para 2.000 ft',
    option_d: '500 ft para 300 ft',
    correct_answer: 'b',
    difficulty: 'hard',
    explanation: 'O RVSM foi implementado para reduzir a separação vertical mínima de 2.000 ft para 1.000 ft entre FL 290 e FL 410, aumentando a capacidade do espaço aéreo superior. Exige equipamentos específicos certificados.'
  },
  // ==================== PRIORIDADE EM PISTA ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Quando duas aeronaves se aproximam de um aeródromo para pouso ao mesmo tempo, qual tem prioridade?',
    option_a: 'A aeronave mais rápida',
    option_b: 'A aeronave mais pesada',
    option_c: 'A aeronave que estiver em altitude mais baixa, exceto se não comprometer a segurança',
    option_d: 'A aeronave que chamar primeiro no rádio',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'A aeronave que estiver em altitude mais baixa tem prioridade para pousar, exceto se não comprometer a segurança. No entanto, essa regra não pode ser explorada por uma aeronave que deliberadamente corte a frente de outra.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Uma aeronave em emergência tem prioridade de pouso sobre outras aeronaves?',
    option_a: 'Apenas se declarar MAYDAY',
    option_b: 'Sim, sempre tem prioridade sobre todas as outras aeronaves',
    option_c: 'Apenas se autorizada pelo ATC',
    option_d: 'Somente durante o dia',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'Uma aeronave em emergência tem prioridade de pouso sobre todas as outras aeronaves. O ATC deve dar preferência imediata e clearance para pouso a qualquer aeronave que declare emergência.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Em um aeródromo não controlado, qual aeronave tem direito de passagem durante o táxi?',
    option_a: 'A aeronave maior',
    option_b: 'A aeronave que está desembarcando passageiros',
    option_c: 'A aeronave que está à frente ou à direita',
    option_d: 'Não há regras específicas para táxi em aeródromo não controlado',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'Nas regras de táxi, a aeronave que estiver à frente ou à direita tem o direito de passagem. Esta é uma regra geral de precedência similar às regras de tráfego terrestres.'
  },
  // ==================== NÍVEIS DE CRUZEIRO VFR ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Em voo VFR em rota magnética de 0° a 179°, quais são os níveis de cruzeiro corretos?',
    option_a: 'Altitudes ímpares (1.500, 3.500, 5.500 ft...)',
    option_b: 'Altitudes pares (2.000, 4.000, 6.000 ft...)',
    option_c: 'Altitudes ímpares + 500 ft (3.500, 5.500, 7.500 ft...)',
    option_d: 'Altitudes pares + 500 ft (2.500, 4.500, 6.500 ft...)',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'Para VFR em rota magnética de 0° a 179° (leste), os níveis de cruzeiro são os FL/altitudes ímpares + 500 ft (ex: 3.500, 5.500, 7.500 ft). Para 180° a 359° (oeste), são os FL/altitudes pares + 500 ft.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Em voo VFR em rota magnética de 180° a 359°, quais são os níveis de cruzeiro corretos acima de 3.000 ft AGL?',
    option_a: 'FL 35, FL 55, FL 75...',
    option_b: 'FL 45, FL 65, FL 85...',
    option_c: 'FL 25, FL 45, FL 65...',
    option_d: 'FL 30, FL 50, FL 70...',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'Para VFR em rota magnética de 180° a 359° (oeste), os níveis são FL 45, FL 65, FL 85... (pares + 500 ft). Para 0° a 179° (leste): FL 35, FL 55, FL 75... (ímpares + 500 ft).'
  },
  // ==================== TRANSPONDER ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é o código transponder (squawk) de emergência universal?',
    option_a: '7500',
    option_b: '7600',
    option_c: '7700',
    option_d: '7000',
    correct_answer: 'c',
    difficulty: 'easy',
    explanation: 'O código transponder 7700 é o código de emergência universal. Quando selecionado, alerta os radares de controle de tráfego aéreo que a aeronave está em situação de emergência.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O código transponder 7600 indica:',
    option_a: 'Emergência geral',
    option_b: 'Falha de comunicação (NORDO)',
    option_c: 'Sequestro ou ato ilícito',
    option_d: 'Código padrão VFR',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'O código transponder 7600 indica falha de comunicação (NORDO - No Radio). A aeronave não consegue se comunicar por rádio e está alertando o ATC desta condição.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O código transponder 7500 indica:',
    option_a: 'Emergência geral',
    option_b: 'Falha de rádio',
    option_c: 'Interferência ilícita/sequestro',
    option_d: 'Código padrão VFR',
    correct_answer: 'c',
    difficulty: 'easy',
    explanation: 'O código transponder 7500 indica interferência ilícita (hijacking/sequestro). É o código a ser selecionado quando a aeronave estiver sendo vítima de ato ilícito.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é o código transponder padrão para voos VFR quando não há código ATC específico atribuído no Brasil?',
    option_a: '1200',
    option_b: '2000',
    option_c: '7000',
    option_d: '0000',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'No Brasil, o código transponder padrão para voos VFR sem código ATC específico é o 7000. Nos EUA e outros países, o código padrão VFR é 1200.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O modo do transponder que fornece identificação e altitude da aeronave ao radar ATC é o:',
    option_a: 'Modo A',
    option_b: 'Modo C',
    option_c: 'Modo S',
    option_d: 'Modo B',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'O Modo C do transponder transmite o código de identificação (squawk) e a altitude pressão da aeronave, permitindo que o radar ATC visualize tanto a identidade quanto a altitude da aeronave.'
  },
  // ==================== SIPAER/CENIPA/CIPAA ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O CENIPA é responsável por:',
    option_a: 'Controlar o espaço aéreo brasileiro',
    option_b: 'Investigar acidentes e incidentes aeronáuticos',
    option_c: 'Certificar pilotos civis',
    option_d: 'Emitir cartas aeronáuticas',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'O CENIPA (Centro de Investigação e Prevenção de Acidentes Aeronáuticos) é o órgão da FAB responsável pela investigação de acidentes e incidentes aeronáuticos, com foco na prevenção de futuros eventos.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O SIPAER (Sistema de Investigação e Prevenção de Acidentes Aeronáuticos) tem como objetivo principal:',
    option_a: 'Punir os responsáveis por acidentes aeronáuticos',
    option_b: 'Prevenir acidentes aeronáuticos através de investigação técnica',
    option_c: 'Controlar o tráfego aéreo durante emergências',
    option_d: 'Certificar instrutores de voo',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'O SIPAER tem como objetivo a prevenção de acidentes aeronáuticos. As investigações do CENIPA não têm caráter punitivo, focando na identificação de causas e fatores contribuintes para evitar recorrências.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Quem deve ser notificado em caso de acidente aeronáutico no Brasil?',
    option_a: 'Somente a ANAC',
    option_b: 'Somente a Polícia Federal',
    option_c: 'CENIPA, através do sistema de notificação SIPAER',
    option_d: 'DECEA e INFRAERO',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'Em caso de acidente aeronáutico, o CENIPA deve ser notificado o mais rápido possível através do sistema SIPAER. O piloto, operador ou qualquer pessoa que tenha conhecimento do acidente tem obrigação de notificar.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é o CIPAA (Comissão de Investigação de Proteção de Acidentes Aeronáuticos)?',
    option_a: 'Órgão internacional de investigação de acidentes',
    option_b: 'Comissão formada para investigar acidentes específicos sob coordenação do CENIPA',
    option_c: 'Comitê permanente de prevenção da ANAC',
    option_d: 'Sistema informatizado de prevenção de acidentes',
    correct_answer: 'b',
    difficulty: 'hard',
    explanation: 'A CIPAA é uma comissão formada especificamente para investigar um acidente ou incidente grave, criada e coordenada pelo CENIPA. É temporária e dissolve-se após a conclusão do relatório final de investigação.'
  },
  // ==================== MÍNIMOS METEOROLÓGICOS VFR ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Quais são os mínimos meteorológicos para VFR em espaço aéreo controlado entre 300 m e 3.050 m AMSL?',
    option_a: 'Visibilidade 1.500 m, livre de nuvens',
    option_b: 'Visibilidade 3 km, teto 300 m',
    option_c: 'Visibilidade 5 km, 300 m vertical e 1.500 m horizontal das nuvens',
    option_d: 'Visibilidade 8 km, 1.000 ft vertical e 1 NM horizontal das nuvens',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'Para VFR em espaço controlado entre 1.000 ft e 10.000 ft AMSL, os mínimos são: visibilidade 5 km, separação das nuvens de 300 m (1.000 ft) verticalmente e 1.500 m (1 NM) horizontalmente.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O voo VFR noturno no Brasil requer qual visibilidade mínima?',
    option_a: '3 km',
    option_b: '5 km',
    option_c: '8 km',
    option_d: 'Voo VFR noturno não é permitido no Brasil',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'O voo VFR noturno no Brasil requer visibilidade mínima de 5 km, além de outros requisitos como equipamentos de navegação específicos. Os mínimos de separação das nuvens são os mesmos do VFR diurno em cada classe de espaço aéreo.'
  },
  // ==================== FIR, TMA, CTR, ATZ ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Quantas FIRs (Flight Information Region) existem no espaço aéreo brasileiro?',
    option_a: '3 FIRs',
    option_b: '4 FIRs',
    option_c: '5 FIRs',
    option_d: '6 FIRs',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'O Brasil possui 5 FIRs: SBAZ (Amazônica), SBBS (Brasília), SBCW (Cuiabá), SBRE (Recife) e SBAO (Atlântico). Cada FIR possui um ACC responsável.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é a diferença entre CTR (Control Zone) e TMA (Terminal Maneuvering Area)?',
    option_a: 'CTR vai da superfície ao limite superior; TMA inicia acima de 200 ft e se estende mais amplamente ao redor do aeródromo',
    option_b: 'Não há diferença; são termos sinônimos',
    option_c: 'CTR é para aeronaves a jato; TMA é para aviação geral',
    option_d: 'TMA existe apenas em grandes aeroportos internacionais',
    correct_answer: 'a',
    difficulty: 'medium',
    explanation: 'A CTR parte da superfície e tem dimensões menores ao redor do aeródromo. A TMA começa a uma altitude especificada acima da superfície (geralmente acima da CTR) e cobre uma área maior para gerenciar chegadas e partidas.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A ATZ (Aerodrome Traffic Zone) é:',
    option_a: 'Espaço aéreo controlado ao redor de grandes aeroportos',
    option_b: 'Área de tráfego de aeródromo definida ao redor de um aeródromo não controlado',
    option_c: 'Zona restrita de uso militar',
    option_d: 'Área de aproximação terminal de aeródromo',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'A ATZ é definida ao redor de aeródromos que possuem AFIS ou que são não controlados, estabelecendo uma zona onde o tráfego aéreo deve estar atento à presença de outros voos, sem serviço de controle formal.'
  },
  // ==================== SIGLAS / ACRONYMS ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que significa a sigla EOBT no contexto do Plano de Voo?',
    option_a: 'Estimated Off-Block Time - horário estimado em que a aeronave inicia o movimento de saída do pátio',
    option_b: 'Engine On-Board Test - teste de motores a bordo',
    option_c: 'Expected On-Block Time - horário estimado de chegada ao pátio',
    option_d: 'Emergency On-Board Transponder',
    correct_answer: 'a',
    difficulty: 'easy',
    explanation: 'EOBT (Estimated Off-Block Time) é o horário estimado em que a aeronave começará a se mover do pátio (off block), equivalente ao horário de partida planejado. É o ponto de referência para prazos de plano de voo.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que significa ETA no contexto de navegação aérea?',
    option_a: 'Emergency Training Area',
    option_b: 'Estimated Time of Arrival - horário estimado de chegada',
    option_c: 'Engine Thrust Approach',
    option_d: 'Estimated Terminal Altitude',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'ETA (Estimated Time of Arrival) é o horário estimado de chegada a um ponto de notificação ou ao destino. É uma das siglas fundamentais de planejamento de voo.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que significa ETD?',
    option_a: 'Estimated Time of Departure - horário estimado de partida',
    option_b: 'Emergency Traffic Dispatch',
    option_c: 'Engine Test Data',
    option_d: 'Estimated Terminal Distance',
    correct_answer: 'a',
    difficulty: 'easy',
    explanation: 'ETD (Estimated Time of Departure) é o horário estimado de partida da aeronave do aeródromo de origem. Difere do EOBT pois representa a decolagem, não o início do movimento no pátio.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que significa ETO no contexto da navegação aérea?',
    option_a: 'Emergency Take-Off Order',
    option_b: 'Estimated Time Over - horário estimado de passagem sobre um ponto',
    option_c: 'Engine Test Operation',
    option_d: 'Expected Traffic Order',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'ETO (Estimated Time Over) é o horário estimado em que a aeronave passará sobre um determinado ponto de navegação (waypoint ou VOR). É usado no plano de voo para pontos intermediários na rota.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que significa a sigla ATIS?',
    option_a: 'Aerodrome Traffic Information System',
    option_b: 'Automatic Terminal Information Service - serviço automático de informações terminais',
    option_c: 'Air Traffic Identification Signal',
    option_d: 'Aeronautical Traffic Inspection Service',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'ATIS (Automatic Terminal Information Service) é o serviço de informações automáticas do aeródromo, transmitido continuamente com informações meteorológicas, procedimentos em uso e NOTAMs relevantes, identificado por uma letra do alfabeto fonético.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que significa AWY no contexto das cartas aeronáuticas?',
    option_a: 'Airway - via aérea ou aerovia',
    option_b: 'Alternate Way Route',
    option_c: 'Aerodrome Warning Yellow',
    option_d: 'Approach Waypoint',
    correct_answer: 'a',
    difficulty: 'easy',
    explanation: 'AWY significa Airway (aerovia ou via aérea), que é uma rota aérea designada com uma largura específica, geralmente centrada em radioajudas à navegação ou waypoints, publicada nas cartas aeronáuticas.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é o FIR (Flight Information Region)?',
    option_a: 'Frequência de Informação de Rota',
    option_b: 'Região de Informação de Voo - espaço aéreo de dimensões definidas prestando serviços de informação de voo e alerta',
    option_c: 'Formulário de Identificação de Rota',
    option_d: 'Frequência Internacional de Rádio',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'FIR (Flight Information Region) é um espaço aéreo de dimensões definidas dentro do qual são prestados os serviços de informação de voo (FIS) e alerta (ALRS). No Brasil, existem 5 FIRs gerenciadas pelo DECEA.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é o significado de SIGMET?',
    option_a: 'Signal Meteorology - sistema de sinais meteorológicos',
    option_b: 'Significant Meteorological Information - informações sobre fenômenos meteorológicos significativos',
    option_c: 'Sistema Integrado de Gerenciamento Meteorológico',
    option_d: 'Simplified Meteorological Report',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'SIGMET (Significant Meteorological Information) é uma mensagem meteorológica que alerta sobre fenômenos significativos que podem afetar a segurança das aeronaves, como turbulência severa, engelamento, tempestades, etc.'
  },
  // ==================== QUESTÕES ADICIONAIS VARIADAS ====================
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O VORTAC é uma radioajuda à navegação que combina:',
    option_a: 'VOR e DME',
    option_b: 'VOR TACAN (inclui DME militar)',
    option_c: 'VOR e NDB',
    option_d: 'TACAN e ILS',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'VORTAC é a combinação de VOR (Very High Frequency Omnidirectional Range) e TACAN (Tactical Air Navigation), que inclui a função DME. Fornece navegação omnidirecional e distância, sendo usado tanto por aviação civil quanto militar.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é o horário de referência utilizado internacionalmente em aviação?',
    option_a: 'Horário local do aeródromo de origem',
    option_b: 'UTC (Coordinated Universal Time)',
    option_c: 'GMT+3 para o Brasil',
    option_d: 'Horário de Brasília',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'A aviação utiliza internacionalmente o UTC (Coordinated Universal Time) como referência de tempo. Todos os planos de voo, NOTAMs e comunicações ATC usam UTC para evitar confusões com fusos horários locais.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é a frequência de socorro e emergência de VHF em aviação?',
    option_a: '118,1 MHz',
    option_b: '121,5 MHz',
    option_c: '123,45 MHz',
    option_d: '131,8 MHz',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'A frequência de socorro e emergência em VHF é 121,5 MHz. Esta frequência é monitorada por órgãos ATC, aeronaves militares e de busca e salvamento, sendo utilizada em situações de emergência.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é o METAR?',
    option_a: 'Meteorological Terminal Air Report - relatório meteorológico de aeródromo',
    option_b: 'Manual de Especificações Técnicas Aeronáuticas de Rota',
    option_c: 'Mapa de Elementos Topográficos e Aerodinâmicos da Região',
    option_d: 'Mensagem de Emergência de Tráfego Aéreo Regional',
    correct_answer: 'a',
    difficulty: 'easy',
    explanation: 'METAR (Meteorological Terminal Air Report) é o relatório meteorológico de rotina de aeródromo, emitido de hora em hora ou a cada 30 minutos, contendo condições meteorológicas atuais no aeródromo.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Um aeródromo alternante deve ser incluído no plano de voo IFR quando:',
    option_a: 'Sempre que o voo for IFR',
    option_b: 'Quando a previsão meteorológica para o destino indicar condições abaixo dos mínimos de chegada',
    option_c: 'Apenas em voos internacionais',
    option_d: 'Quando o voo tiver duração superior a 2 horas',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'O aeródromo alternante deve ser incluído quando a previsão meteorológica para o aeródromo de destino, no período de 1 hora antes e 1 hora depois do ETA, indicar condições abaixo dos mínimos de aproximação, ou quando não há IAP disponível.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que significa a sigla TAF no contexto aerometeorológico?',
    option_a: 'Terminal Aerodrome Forecast - previsão meteorológica de aeródromo',
    option_b: 'Taxiway Access Field',
    option_c: 'Traffic Alert Flag',
    option_d: 'Temperatura Altitude Forecast',
    correct_answer: 'a',
    difficulty: 'easy',
    explanation: 'TAF (Terminal Aerodrome Forecast) é a previsão meteorológica para um aeródromo específico, geralmente válida por 24 ou 30 horas. É essencial para o planejamento de voos IFR e para determinar a necessidade de alternante.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é o significado de QNH em aviação?',
    option_a: 'Pressão atmosférica ajustada ao nível médio do mar',
    option_b: 'Pressão atmosférica ao nível do aeródromo',
    option_c: 'Altitude de pressão padrão (1013,2 hPa)',
    option_d: 'Altitude densidade',
    correct_answer: 'a',
    difficulty: 'easy',
    explanation: 'QNH é a pressão atmosférica reduzida ao nível médio do mar (MSL) usando a atmosfera padrão. Quando o altímetro é ajustado com QNH, indica a altitude acima do nível do mar.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O QFE é o ajuste do altímetro que indica:',
    option_a: 'Altitude acima do nível do mar',
    option_b: 'Nível de voo (FL)',
    option_c: 'Altitude acima do aeródromo (zero ao pousar na pista)',
    option_d: 'Pressão padrão ICAO',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'QFE é a pressão atmosférica no nível do aeródromo. Quando o altímetro é ajustado com QFE, indica zero quando a aeronave está na pista do aeródromo de referência e mostra a altura acima do aeródromo em voo.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Acima de qual altitude de transição o piloto deve ajustar o altímetro para 1013,25 hPa e passar a usar Níveis de Voo (FL)?',
    option_a: 'Altitude de transição específica de cada FIR, publicada no AIP',
    option_b: '10.000 ft em todo o Brasil',
    option_c: '18.000 ft em todo o Brasil',
    option_d: '3.000 ft acima do aeródromo',
    correct_answer: 'a',
    difficulty: 'medium',
    explanation: 'A altitude de transição varia de acordo com cada aeródromo/região e está publicada nos procedimentos aeronáuticos. Acima da altitude de transição, o piloto ajusta para 1013,25 hPa e passa a usar Níveis de Voo (FL).'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é o significado de IFR no contexto das regras de voo?',
    option_a: 'Internal Flight Regulations',
    option_b: 'Instrument Flight Rules - Regras de Voo por Instrumentos',
    option_c: 'International Flight Requirements',
    option_d: 'Inflight Frequency Radio',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'IFR (Instrument Flight Rules) são as regras de voo por instrumentos, nas quais o piloto navega e mantém separação de obstáculos e outras aeronaves usando principalmente os instrumentos da aeronave.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Para voo VFR noturno no Brasil, quais equipamentos de navegação adicionais são exigidos além dos requisitos diurnos?',
    option_a: 'Apenas luzes de navegação',
    option_b: 'Giroscópio direcional e horizonte artificial',
    option_c: 'GPS e rádio VHF',
    option_d: 'Apenas altímetro de precisão',
    correct_answer: 'b',
    difficulty: 'hard',
    explanation: 'Para voo VFR noturno, além dos instrumentos básicos VFR diurnos, são exigidos giroscópio direcional e horizonte artificial (atitude), pois a orientação espacial fica comprometida à noite sem referências visuais externas.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é um PIREP (PIlot REPort)?',
    option_a: 'Relatório de piloto sobre condições encontradas em voo',
    option_b: 'Plano de rota alternativa',
    option_c: 'Relatório de performance pós-voo',
    option_d: 'Protocolo de comunicação ATC',
    correct_answer: 'a',
    difficulty: 'easy',
    explanation: 'PIREP (Pilot Report) é o relatório feito por pilotos sobre condições meteorológicas reais encontradas durante o voo, como turbulência, engelamento, visibilidade, teto de nuvens, etc. São informações valiosas para outros voos.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que significa a sigla CAVOK?',
    option_a: 'Ceiling and Visibility OK - visibilidade acima de 10 km, sem nuvens abaixo de 5.000 ft e sem fenômenos',
    option_b: 'Código de Altitude para Voo OK',
    option_c: 'Condições Atmosféricas Verificadas como Ótimas',
    option_d: 'Clearance Automatic Visibility OK',
    correct_answer: 'a',
    difficulty: 'easy',
    explanation: 'CAVOK (Ceiling And Visibility OK) indica: visibilidade superior a 10 km, sem nuvens abaixo de 5.000 ft ou abaixo da altitude mínima de setor (o que for maior), e nenhum fenômeno meteorológico significativo.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Um voo VFR pode ser realizado acima de uma camada de nuvens no Brasil?',
    option_a: 'Sim, desde que possa descer VFR quando necessário',
    option_b: 'Não, pois exigiria atravessar a camada de nuvens que não é permitido VFR',
    option_c: 'Sim, sempre que a visibilidade horizontal for superior a 5 km',
    option_d: 'Apenas com autorização especial do DECEA',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'Voo VFR acima de camada de nuvens não é permitido porque o piloto não poderia descer e aterrissar sem atravessar a camada, o que violaria os requisitos de separação de nuvens VFR. O voo VFR deve ser realizado com referências visuais ao solo.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é o VMC (Visual Meteorological Conditions)?',
    option_a: 'Condições meteorológicas verificadas como mínimas para IFR',
    option_b: 'Condições meteorológicas que atendem ou superam os mínimos VFR estabelecidos',
    option_c: 'Visibilidade Mínima Controlada pelo ATC',
    option_d: 'Volume Máximo de Controle de tráfego',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'VMC (Visual Meteorological Conditions) são as condições meteorológicas nas quais a visibilidade, a distância das nuvens e o teto atendem ou superam os mínimos VFR especificados para a classe de espaço aéreo correspondente.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é o IMC (Instrument Meteorological Conditions)?',
    option_a: 'Condições em que a aeronave voa acima das nuvens',
    option_b: 'Condições meteorológicas abaixo dos mínimos VMC, exigindo voo por instrumentos',
    option_c: 'Temperatura mínima para operação de instrumentos',
    option_d: 'Instrução Meteorológica Complementar',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'IMC (Instrument Meteorological Conditions) são condições meteorológicas que estão abaixo dos mínimos para VMC. Em IMC, o piloto deve voar por instrumentos (IFR), pois não há referências visuais externas suficientes.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é a velocidade máxima permitida abaixo de 10.000 ft em espaço aéreo controlado?',
    option_a: '200 kt IAS',
    option_b: '250 kt IAS',
    option_c: '300 kt IAS',
    option_d: 'Não há limite de velocidade',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'A velocidade máxima em espaço aéreo controlado abaixo de 10.000 ft é de 250 kt IAS (Indicated Airspeed). Esta limitação visa garantir a separação adequada entre aeronaves e melhorar a segurança no espaço aéreo controlado inferior.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é a velocidade máxima abaixo de 3.000 ft AGL no circuito de tráfego de aeródromo?',
    option_a: '150 kt IAS',
    option_b: '180 kt IAS',
    option_c: '200 kt IAS',
    option_d: '250 kt IAS',
    correct_answer: 'c',
    difficulty: 'medium',
    explanation: 'A velocidade máxima para aeronaves dentro do circuito de tráfego e abaixo de 3.000 ft AGL é de 200 kt IAS, garantindo que a aeronave não seja rápida demais para o circuito, permitindo melhor separação com outras aeronaves.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é o significado de SELCAL?',
    option_a: 'Sistema de Enlace de Comunicação de Longa Distância',
    option_b: 'Selective Calling System - sistema de chamada seletiva para aeronaves em rota',
    option_c: 'Selected Calibration of Altimeter',
    option_d: 'Serial Electronic Communication Alarm',
    correct_answer: 'b',
    difficulty: 'hard',
    explanation: 'SELCAL (Selective Calling System) é um sistema que permite ao ATC chamar uma aeronave específica via HF sem que a tripulação precise monitorar a frequência constantemente. Quando chamada, a aeronave emite um alarme sonoro e luminoso.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é o VOLMET?',
    option_a: 'Serviço de informações meteorológicas para aeronaves em voo via radiotelefonia',
    option_b: 'Volume Meteorológico de Tráfego',
    option_c: 'Velocidade de Voo em Condições Meteorológicas Limitadas',
    option_d: 'Variação de nível de voo para condições meteorológicas',
    correct_answer: 'a',
    difficulty: 'medium',
    explanation: 'VOLMET é o serviço de radiodifusão de informações meteorológicas (METARs, TAFs, SIGMETs) para aeronaves em voo, transmitido continuamente em frequências designadas de HF e VHF.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é um aeródromo alternante no planejamento de voo?',
    option_a: 'Aeródromo reservado para uso militar em emergências',
    option_b: 'Aeródromo para o qual a aeronave poderá efetuar o voo caso não seja possível pousar no destino',
    option_c: 'Aeródromo com capacidade reduzida utilizado em horários de pico',
    option_d: 'Aeródromo de treinamento',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'O aeródromo alternante é aquele para o qual a aeronave pode se dirigir caso não seja possível pousar no destino por razões meteorológicas, operacionais ou de outra natureza. É um requisito no planejamento de voos IFR em certas condições.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Uma aeronave NORDO (sem rádio) em aeródromo controlado deve proceder como?',
    option_a: 'Não pode operar em aeródromo controlado de forma alguma',
    option_b: 'Observar as sinalizações luminosas da TWR e seguir os procedimentos específicos',
    option_c: 'Usar apenas a frequência 121,5 MHz',
    option_d: 'Solicitar escolta de aeronave com rádio',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'Uma aeronave NORDO deve observar as sinalizações luminosas da TWR para receber autorizações. O piloto deve balançar as asas para confirmar recebimento das luzes, e a TWR utilizará sinais luminosos codificados para guiar a aeronave.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é uma aerovia (Airway) no espaço aéreo brasileiro?',
    option_a: 'Espaço aéreo não controlado entre dois aeródromos',
    option_b: 'Corredor de espaço aéreo controlado definido por radioajudas ou waypoints, usado para navegação em rota',
    option_c: 'Área exclusiva para aviação comercial',
    option_d: 'Rota marítima de aproximação',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'Aerovias são corredores de espaço aéreo controlado de largura definida (geralmente 18 km/10 NM de cada lado do eixo), centrados em radioajudas ou waypoints, designados para organizar o tráfego em rota.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual documento de bordo o piloto PPAV deve obrigatoriamente portar durante o voo?',
    option_a: 'Somente a licença de piloto',
    option_b: 'Licença de piloto, laudo médico e certificado de matrícula da aeronave',
    option_c: 'Licença de piloto com habilitação válida e certidão de nascimento',
    option_d: 'Apenas o manual do proprietário da aeronave',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'O piloto deve portar durante o voo: licença de piloto com habilitação válida, laudo médico em vigor (CMA), e os documentos da aeronave incluindo Certificado de Matrícula (CM) e Certificado de Aeronavegabilidade (CA).'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é o significado da sigla CMA no contexto da certificação de pilotos?',
    option_a: 'Certificado de Matrícula Aérea',
    option_b: 'Certificado Médico Aeronáutico',
    option_c: 'Carta de Manutenção Aeronáutica',
    option_d: 'Confirmação de Mínimos de Aproximação',
    correct_answer: 'b',
    difficulty: 'easy',
    explanation: 'CMA é o Certificado Médico Aeronáutico, o documento que comprova que o piloto está apto medicamente para exercer suas funções. Deve ser renovado periodicamente conforme o tipo de licença e a idade do piloto.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é o prazo de validade do CMA de 3ª classe para pilotos com menos de 40 anos?',
    option_a: '12 meses',
    option_b: '24 meses',
    option_c: '36 meses',
    option_d: '48 meses',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'O CMA de 3ª classe para pilotos com menos de 40 anos tem validade de 24 meses. Para pilotos com 40 anos ou mais, a validade é de 12 meses. O CMA de 1ª e 2ª classe têm prazos mais curtos.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O que é o SSR (Secondary Surveillance Radar)?',
    option_a: 'Radar primário que detecta aeronaves sem colaboração da aeronave',
    option_b: 'Sistema de radar secundário que interroga o transponder da aeronave e recebe resposta codificada',
    option_c: 'Radar de solo para monitoramento de pátio',
    option_d: 'Sistema de alerta anticolisão ACAS',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'SSR (Secondary Surveillance Radar) é o sistema radar que interroga o transponder da aeronave e recebe respostas codificadas, fornecendo identificação, altitude e outras informações ao ATC, complementando o radar primário.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é a definição de nível de voo (FL - Flight Level)?',
    option_a: 'Altitude acima do nível do mar ajustada ao QNH local',
    option_b: 'Superfície de pressão atmosférica constante, com altímetro ajustado para 1013,25 hPa',
    option_c: 'Altitude acima do aeródromo de origem',
    option_d: 'Altitude em que a densidade do ar é igual à padrão',
    correct_answer: 'b',
    difficulty: 'medium',
    explanation: 'Nível de Voo (FL) é uma superfície de pressão atmosférica constante à qual corresponde uma determinada pressão barométrica, calculada com base na pressão padrão de 1013,25 hPa. Expresso em centenas de pés.'
  },
];

// Part 2 will be appended
const outputPath = 'c:\\Users\\MarceloKamimura\\Documents\\voocerto\\voo-certo\\q_regulamentos.csv';

function escapeCsv(str) {
  const s = String(str || '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function writeCsv(questions) {
  const header = 'bloco_id,text,option_a,option_b,option_c,option_d,correct_answer,difficulty,explanation\n';
  const rows = questions.map(q =>
    [q.bloco_id, q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.difficulty, q.explanation]
      .map(escapeCsv)
      .join(',')
  ).join('\n');
  fs.writeFileSync(outputPath, '\uFEFF' + header + rows, 'utf8');
  console.log(`Total de questões escritas: ${questions.length}`);
}

// PLACEHOLDER - more questions will be added before writeCsv call
export { questoes };
writeCsv(questoes);

export { questoes as q_regulamentos };
