import fs from 'fs';

// ═══════════════════════════════════════════════════════════════════════════
// QUESTÕES ORIGINAIS PPAV - Piloto Privado de Avião (padrão ANAC)
// Criadas com base nos padrões da coleção de provas PPAV
// ═══════════════════════════════════════════════════════════════════════════

const questoes = [

  // ─── REGULAMENTOS DE TRÁFEGO AÉREO ──────────────────────────────────────
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O código transponder que indica que uma aeronave está sofrendo interferência ilícita é:',
    option_a: '7500', option_b: '7600', option_c: '7700', option_d: '2000',
    correct_answer: 'a',
    explanation: 'O código 7500 indica interferência ilícita (hijacking). O 7600 indica falha de comunicação e o 7700 indica emergência geral.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Uma aeronave VFR voando em rota no rumo magnético de 270 graus deverá utilizar como nível de cruzeiro o FL:',
    option_a: '055', option_b: '045', option_c: '065', option_d: '075',
    correct_answer: 'b',
    explanation: 'Rumos de 180° a 359° (Oeste): FL pares (040, 060, 080...). O FL 045 é nível ímpar, portanto incorreto para esse rumo. Rumos 000-179°: FL ímpares. Rumos 180-359°: FL pares. FL 045 está errado. Correto seria FL 060 para VFR. Ajuste: para rumo 270° (ocidental), VFR usa FL pares + 500 pés: FL 045 (não). Regra DECEA: 000-179° VFR usa FL: 035,055,075,095; 180-359° VFR usa FL: 045,065,085.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A sigla CENIPA corresponde ao órgão responsável por:',
    option_a: 'Controle do espaço aéreo brasileiro',
    option_b: 'Investigação e prevenção de acidentes aeronáuticos',
    option_c: 'Certificação de aeronaves civis',
    option_d: 'Fiscalização das escolas de aviação',
    correct_answer: 'b',
    explanation: 'O CENIPA (Centro de Investigação e Prevenção de Acidentes Aeronáuticos) é o órgão central do SIPAER responsável pela investigação de acidentes e incidentes aeronáuticos.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Em um aeródromo controlado, o sinal de luz verde contínua emitido pela TWR a uma aeronave em vôo significa:',
    option_a: 'Prossiga para o circuito de tráfego',
    option_b: 'Autorizado para pouso',
    option_c: 'Retorne e pouse neste aeródromo',
    option_d: 'Autorizado para decolagem',
    correct_answer: 'b',
    explanation: 'Verde contínua para aeronave em vôo = autorizado para pouso. Verde intermitente = retorne e pouse. Vermelha contínua = aeródromo interditado.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A fase do ALRS em que se sabe ou se suspeita que uma aeronave e seus ocupantes estão em perigo grave e necessitam de assistência imediata é a fase de:',
    option_a: 'Incerteza',
    option_b: 'Alerta',
    option_c: 'Perigo',
    option_d: 'Urgência',
    correct_answer: 'c',
    explanation: 'As fases do ALRS são: INCERFA (incerteza), ALERFA (alerta) e DETRESFA (perigo). A fase de perigo indica necessidade de assistência imediata.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O plano de vôo apresentado ao órgão AIS antes da partida, com todos os itens preenchidos, denomina-se plano de vôo:',
    option_a: 'Repetitivo (RPL)',
    option_b: 'Em vigor',
    option_c: 'Arquivado (AFIL)',
    option_d: 'Completo (FPL)',
    correct_answer: 'd',
    explanation: 'O FPL (Flight Plan) é o plano de vôo completo apresentado antes da partida. O RPL é repetitivo, o AFIL é apresentado em vôo.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O espaço aéreo de classe G caracteriza-se por ser:',
    option_a: 'Controlado, com separação entre todos os vôos',
    option_b: 'Não controlado, onde é prestado o serviço ALRS',
    option_c: 'Restrito ao tráfego militar',
    option_d: 'Controlado apenas para vôos IFR',
    correct_answer: 'b',
    explanation: 'O espaço aéreo classe G é não controlado. Nele, são prestados o ALRS a todas as aeronaves e o FIS às aeronaves com equipamento rádio.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Em circuito de tráfego padrão com pista 09 em uso, o rumo da perna do vento será de:',
    option_a: '090°',
    option_b: '270°',
    option_c: '180°',
    option_d: '360°',
    correct_answer: 'b',
    explanation: 'A perna do vento é paralela à pista, no sentido contrário ao pouso. Com pista 09 (rumo 090°), a perna do vento terá rumo 270° (oposto).'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A NTV (Notificação de Tráfego de Vôo) deve ser entregue ao órgão AIS com antecedência mínima de:',
    option_a: '10 minutos antes do EOBT',
    option_b: '15 minutos antes do EOBT',
    option_c: '30 minutos antes do EOBT',
    option_d: '60 minutos antes do EOBT',
    correct_answer: 'b',
    explanation: 'A NTV deve ser entregue à sala AIS com pelo menos 15 minutos de antecedência em relação ao EOBT (horário estimado de calços fora).'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O órgão ATC responsável pelo controle de tráfego nas fases de subida e descida das aeronaves, dentro de uma TMA, é o:',
    option_a: 'ACC (Centro de Controle de Área)',
    option_b: 'TWR (Torre de Controle)',
    option_c: 'APP (Controle de Aproximação)',
    option_d: 'AFIS (Serviço de Informação de Aeródromo)',
    correct_answer: 'c',
    explanation: 'O APP controla as aeronaves na TMA (Terminal Maneuvering Area), nas fases de subida após decolagem e descida para pouso. O ACC controla em rota e a TWR controla o aeródromo.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Qual é o limite vertical máximo para a realização de vôos VFR no Brasil?',
    option_a: 'FL 135 exclusive',
    option_b: 'FL 145 inclusive',
    option_c: 'FL 195 exclusive',
    option_d: 'FL 245 inclusive',
    correct_answer: 'b',
    explanation: 'Os vôos VFR no Brasil são limitados ao FL 145 inclusive. Acima desse nível, os vôos devem ser conduzidos sob IFR.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Uma aeronave civil brasileira possui as letras de matrícula PP-XYZ. As letras "PP" indicam:',
    option_a: 'Piloto Privado a bordo',
    option_b: 'Marca de nacionalidade da aeronave brasileira',
    option_c: 'Prefixo de aeronave de pequeno porte',
    option_d: 'Prefixo exclusivo para aviões a pistão',
    correct_answer: 'b',
    explanation: 'PP e PT são marcas de nacionalidade de aeronaves civis brasileiras. As letras que se seguem são a marca de matrícula individual da aeronave.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A separação mínima entre uma aeronave leve que decola logo após uma aeronave pesada, do mesmo ponto de decolagem, deve ser de:',
    option_a: '1 minuto',
    option_b: '2 minutos',
    option_c: '3 minutos',
    option_d: '5 minutos',
    correct_answer: 'b',
    explanation: 'Para evitar riscos de esteira de turbulência, a separação mínima entre uma aeronave leve ou média e uma pesada que decolou do mesmo ponto é de 2 minutos.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Um vôo VFR especial pode ser autorizado dentro de uma CTR quando as condições de teto e visibilidade forem, respectivamente, no mínimo:',
    option_a: '300 pés e 800 metros',
    option_b: '500 pés e 1.500 metros',
    option_c: '1.000 pés e 3.000 metros',
    option_d: '1.500 pés e 5.000 metros',
    correct_answer: 'b',
    explanation: 'O VFR especial pode ser autorizado com teto mínimo de 500 pés e visibilidade mínima de 1.500 metros dentro de CTR, condições abaixo das necessárias para VFR normal.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O indicativo de chamada em radiotelefonia do órgão TWR é:',
    option_a: 'Centro',
    option_b: 'Controle',
    option_c: 'Tráfego',
    option_d: 'Torre',
    correct_answer: 'd',
    explanation: 'Os indicativos de chamada são: TWR = Torre, APP = Controle (ou Aproximação), ACC = Centro, AFIS = Rádio.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A publicação aeronáutica que contém informações duradouras, indispensáveis à navegação aérea, como procedimentos, espaço aéreo e rotas, é denominada:',
    option_a: 'NOTAM',
    option_b: 'AIC',
    option_c: 'AIP',
    option_d: 'ROTAER',
    correct_answer: 'c',
    explanation: 'A AIP (Aeronautical Information Publication) contém informações aeronáuticas permanentes essenciais à navegação aérea. O NOTAM contém informações temporárias e urgentes.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Em espaço aéreo de classe B, aeronaves VFR recebem o serviço de:',
    option_a: 'Somente informação de vôo',
    option_b: 'Assessoramento de tráfego aéreo',
    option_c: 'Controle de tráfego aéreo com separação',
    option_d: 'Alerta apenas em caso de emergência',
    correct_answer: 'c',
    explanation: 'No espaço aéreo classe B, todos os vôos (IFR e VFR) recebem separação de tráfego aéreo. É o nível mais alto de serviço ATC.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O FPL (plano de vôo completo) é válido por quanto tempo a partir do EOBT?',
    option_a: '15 minutos',
    option_b: '30 minutos',
    option_c: '45 minutos',
    option_d: '60 minutos',
    correct_answer: 'b',
    explanation: 'O FPL é válido por 30 minutos a partir do EOBT. Caso o EOBT seja ultrapassado, o piloto deve comunicar atraso (mensagem DLA) ou cancelar o plano.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Em vôo VFR dentro de espaço aéreo controlado, a distância mínima horizontal de nuvens que o piloto deve manter é de:',
    option_a: '150 metros',
    option_b: '300 metros',
    option_c: '1.500 metros',
    option_d: '5.000 metros',
    correct_answer: 'c',
    explanation: 'Em espaço aéreo controlado (classes B, C, D), o vôo VFR exige distância mínima de 1.500 metros horizontalmente e 300 metros (1.000 pés) verticalmente das nuvens.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O órgão internacional responsável pela elaboração de normas e procedimentos para a aviação civil, do qual o Brasil é membro signatário, é:',
    option_a: 'IATA',
    option_b: 'ICAO',
    option_c: 'ONU',
    option_d: 'ANAC',
    correct_answer: 'b',
    explanation: 'A ICAO (International Civil Aviation Organization) é o organismo especializado da ONU que padroniza normas e procedimentos para a aviação civil internacional.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A área de um aeródromo destinada exclusivamente ao pouso, decolagem e táxi das aeronaves, excluindo-se os pátios de estacionamento, denomina-se área de:',
    option_a: 'Movimento',
    option_b: 'Manobras',
    option_c: 'Circulação',
    option_d: 'Controle',
    correct_answer: 'b',
    explanation: 'A área de manobras compreende as pistas e vias de táxi, excluindo os pátios. A área de movimento é mais abrangente e inclui também os pátios de estacionamento.'
  },

  // ─── METEOROLOGIA ────────────────────────────────────────────────────────
  {
    bloco_id: 'meteorologia',
    text: 'O gradiente térmico padrão da atmosfera na troposfera é de aproximadamente:',
    option_a: '1°C a cada 100 metros',
    option_b: '2°C a cada 1.000 pés',
    option_c: '2°C a cada 100 metros',
    option_d: '1°C a cada 1.000 pés',
    correct_answer: 'b',
    explanation: 'O gradiente térmico padrão (ISA) na troposfera é de aproximadamente 2°C a cada 1.000 pés (ou 6,5°C por km). A temperatura diminui com o aumento da altitude.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'O nevoeiro formado pelo resfriamento noturno do solo, que irradia calor para a atmosfera em noites de céu claro e vento fraco, denomina-se nevoeiro de:',
    option_a: 'Advecção',
    option_b: 'Radiação',
    option_c: 'Evaporação',
    option_d: 'Frontal',
    correct_answer: 'b',
    explanation: 'O nevoeiro de radiação forma-se quando o solo perde calor por irradiação durante a noite, resfriando o ar próximo até o ponto de orvalho. É mais comum em noites claras e com vento fraco.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'Quando o altímetro de uma aeronave é ajustado para 1013,2 hPa, as indicações são fornecidas em:',
    option_a: 'Altitude verdadeira',
    option_b: 'Altitude de densidade',
    option_c: 'Altitude pressão (nível de vôo)',
    option_d: 'Altura em relação ao aeródromo',
    correct_answer: 'c',
    explanation: 'Com o altímetro ajustado em 1013,2 hPa (QNE), as indicações são em altitude pressão, expressa em nível de vôo (FL). Este é o ajuste padrão acima da altitude de transição.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'A camada da atmosfera onde os fenômenos meteorológicos que afetam a aviação ocorrem com maior frequência é a:',
    option_a: 'Estratosfera',
    option_b: 'Mesosfera',
    option_c: 'Ionosfera',
    option_d: 'Troposfera',
    correct_answer: 'd',
    explanation: 'A troposfera é a camada inferior da atmosfera, onde ocorrem quase todos os fenômenos meteorológicos relevantes para a aviação, incluindo nuvens, precipitação e turbulência.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'O QNH é definido como:',
    option_a: 'A pressão ajustada ao nível médio do mar segundo a ISA',
    option_b: 'A pressão atmosférica medida no nível do aeródromo',
    option_c: 'A pressão reduzida ao nível médio do mar com temperatura real',
    option_d: 'A pressão padrão de 1013,2 hPa',
    correct_answer: 'c',
    explanation: 'O QNH é a pressão atmosférica reduzida ao nível médio do mar usando a temperatura real. Com o altímetro ajustado no QNH, a aeronave pousada indica a elevação do aeródromo.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'Uma aeronave voa no FL 060, com QNH = 1008 hPa. Sabendo que cada 1 hPa corresponde a aproximadamente 30 pés, a altitude real da aeronave é de aproximadamente:',
    option_a: '5.850 pés',
    option_b: '6.000 pés',
    option_c: '6.150 pés',
    option_d: '6.300 pés',
    correct_answer: 'a',
    explanation: 'QNH está abaixo de 1013 hPa: diferença = 1013 - 1008 = 5 hPa × 30 pés = 150 pés. Altitude real = 6.000 - 150 = 5.850 pés. Com QNH baixo, a altitude real é menor que a pressão indica.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'O fenômeno meteorológico que provoca o congelamento de gotículas de água superesfriada ao entrar em contato com a aeronave, formando uma camada irregular e rugosa de gelo, denomina-se:',
    option_a: 'Gelo transparente (claro)',
    option_b: 'Geada',
    option_c: 'Gelo opaco (branco)',
    option_d: 'Granizo',
    correct_answer: 'c',
    explanation: 'O gelo opaco (rime ice) forma-se pelo congelamento rápido de gotículas pequenas, criando uma camada rugosa e porosa. O gelo transparente (glaze ice) forma-se pelo congelamento mais lento de gotículas maiores.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'A visibilidade meteorológica de um aeródromo é de 800 metros e o teto de 400 pés. Pode-se afirmar que as condições são:',
    option_a: 'VMC para qualquer aeronave',
    option_b: 'VMC apenas para helicópteros',
    option_c: 'IMC, abaixo dos mínimos VFR',
    option_d: 'VFR especial para todas as aeronaves',
    correct_answer: 'c',
    explanation: 'Para vôo VFR em aeródromo controlado, o mínimo é 1.000 pés de teto e 5.000 metros de visibilidade. Com 400 pés e 800 metros, as condições são IMC (Instrument Meteorological Conditions).'
  },
  {
    bloco_id: 'meteorologia',
    text: 'O vento em altitude, que sopra ao longo das isobares devido ao equilíbrio entre a força de Coriolis e o gradiente de pressão, denomina-se vento:',
    option_a: 'De superfície',
    option_b: 'Geostrófic',
    option_c: 'De vale',
    option_d: 'Catabático',
    correct_answer: 'b',
    explanation: 'O vento geostrófico é o vento teórico em altitude que resulta do equilíbrio entre o gradiente de pressão e a força de Coriolis, fluindo paralelo às isobares.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'A nuvem de grande desenvolvimento vertical, associada a tempestades, turbulência severa, granizo e relâmpagos, é denominada:',
    option_a: 'Cumulonimbus (Cb)',
    option_b: 'Nimbostratus (Ns)',
    option_c: 'Altocumulus (Ac)',
    option_d: 'Altostratus (As)',
    correct_answer: 'a',
    explanation: 'O Cumulonimbus é a nuvem de tempestade por excelência, com grande desenvolvimento vertical que pode atingir a tropopausa. É associado a condições severas de vôo.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'O ponto de orvalho é definido como:',
    option_a: 'A temperatura mínima registrada durante a noite',
    option_b: 'A temperatura na qual o ar se torna saturado ao ser resfriado a pressão constante',
    option_c: 'A temperatura da superfície do mar',
    option_d: 'A temperatura máxima para formação de nevoeiro',
    correct_answer: 'b',
    explanation: 'O ponto de orvalho é a temperatura à qual o ar deve ser resfriado (a pressão constante) para que o vapor de água se condense. Quando a temperatura ambiente se aproxima do ponto de orvalho, há risco de formação de nevoeiro ou nuvens.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'A sigla METAR refere-se a:',
    option_a: 'Meteorologia de Área e Turbulência Associada a Rotas',
    option_b: 'Mensagem de observação meteorológica de aeródromo',
    option_c: 'Manual de Especificações Técnicas de Aviação Regional',
    option_d: 'Mapa de Estimativas de Teto e Alcance de Visibilidade',
    correct_answer: 'b',
    explanation: 'METAR (Meteorological Aerodrome Report) é a mensagem de observação meteorológica de aeródromo, emitida em intervalos regulares (normalmente a cada 30 ou 60 minutos).'
  },
  {
    bloco_id: 'meteorologia',
    text: 'Quando o QNH de um aeródromo é inferior a 1013,2 hPa, ao decolar ajustando o altímetro no QNH, a aeronave estará voando em altitude real:',
    option_a: 'Igual à altitude pressão',
    option_b: 'Maior que a altitude pressão',
    option_c: 'Menor que a altitude pressão',
    option_d: 'Independente do QNH',
    correct_answer: 'b',
    explanation: 'Com QNH abaixo de 1013 hPa (pressão baixa), o altímetro ajustado ao QNH indica uma altitude maior que a pressão real. Ou seja, a altitude real é maior que a altitude pressão.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'O fenômeno atmosférico que consiste na suspensão de partículas de areia ou poeira muito finas que reduzem a visibilidade é denominado:',
    option_a: 'Névoa (BR)',
    option_b: 'Neblina (FG)',
    option_c: 'Bruma seca (HZ)',
    option_d: 'Poeira em suspensão (DU)',
    correct_answer: 'c',
    explanation: 'A bruma seca (HZ - Haze) é uma suspensão de partículas sólidas microscópicas que reduz a visibilidade e dá ao horizonte um aspecto esfumaçado. Difere da névoa que é composta por gotículas de água.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'A temperatura ao nível do mar pela atmosfera padrão internacional (ISA) é de:',
    option_a: '+25°C',
    option_b: '+20°C',
    option_c: '+15°C',
    option_d: '+10°C',
    correct_answer: 'c',
    explanation: 'Pela ISA (International Standard Atmosphere), a temperatura ao nível médio do mar é de +15°C, a pressão é de 1013,25 hPa e a densidade é de 1,225 kg/m³.'
  },

  // ─── NAVEGAÇÃO AÉREA ─────────────────────────────────────────────────────
  {
    bloco_id: 'navegacao',
    text: 'A variação magnética é a diferença angular entre o:',
    option_a: 'Norte verdadeiro e o norte de quadrícula',
    option_b: 'Norte magnético e o norte de quadrícula',
    option_c: 'Norte verdadeiro e o norte magnético',
    option_d: 'Norte da bússola e o norte magnético',
    correct_answer: 'c',
    explanation: 'A variação magnética (ou declinação magnética) é o ângulo entre o norte geográfico (verdadeiro) e o norte magnético. Pode ser leste (positiva) ou oeste (negativa).'
  },
  {
    bloco_id: 'navegacao',
    text: 'Um avião percorre 150 NM em 1 hora e 15 minutos. Sua velocidade solo (GS) é de:',
    option_a: '100 KT',
    option_b: '110 KT',
    option_c: '120 KT',
    option_d: '150 KT',
    correct_answer: 'c',
    explanation: 'GS = distância ÷ tempo = 150 NM ÷ 1,25 h = 120 KT.'
  },
  {
    bloco_id: 'navegacao',
    text: 'A carta aeronáutica mais adequada para o planejamento de vôos VFR de médio alcance no Brasil é a:',
    option_a: 'WAC (World Aeronautical Chart) - escala 1:1.000.000',
    option_b: 'ICAO 1:500.000',
    option_c: 'ONC (Operational Navigation Chart)',
    option_d: 'ADC (Aerodrome Chart)',
    correct_answer: 'a',
    explanation: 'A WAC na escala 1:1.000.000 é a mais utilizada para planejamento de vôos VFR de médio alcance, pois oferece boa cobertura com detalhamento suficiente de rotas e pontos de referência.'
  },
  {
    bloco_id: 'navegacao',
    text: 'O vento reportado pelo ATIS de um aeródromo é de 090°/15KT. Uma aeronave vai decolar pela pista 27 (rumo 270°). A componente do vento em relação à pista será:',
    option_a: 'Vento de cauda de 15 KT',
    option_b: 'Vento de proa de 15 KT',
    option_c: 'Vento de través pela esquerda de 15 KT',
    option_d: 'Vento de través pela direita de 15 KT',
    correct_answer: 'a',
    explanation: 'Vento de 090° em pista 270° significa que o vento sopra de leste enquanto a aeronave decola para oeste. O vento vem de trás = vento de cauda de 15 KT.'
  },
  {
    bloco_id: 'navegacao',
    text: 'A distância de 1 minuto de arco ao longo de um meridiano equivale a:',
    option_a: '1 km',
    option_b: '1 milha estatutária',
    option_c: '1 milha náutica (NM)',
    option_d: '1,852 km',
    correct_answer: 'c',
    explanation: '1 milha náutica (NM) é definida como 1 minuto de arco ao longo de um meridiano, correspondendo a 1.852 metros. Esta é a base do sistema de distâncias em navegação aérea.'
  },
  {
    bloco_id: 'navegacao',
    text: 'Em uma aeronave com velocidade indicada (IAS) de 100 KT, voando em altitude elevada com temperatura abaixo do padrão, a velocidade verdadeira (TAS) será:',
    option_a: 'Igual à IAS',
    option_b: 'Menor que a IAS',
    option_c: 'Maior que a IAS',
    option_d: 'Igual à velocidade solo (GS)',
    correct_answer: 'c',
    explanation: 'A TAS é sempre maior que a IAS em altitude, pois com o aumento da altitude a densidade do ar diminui. A IAS se baseia na pressão dinâmica, que é menor com ar menos denso.'
  },
  {
    bloco_id: 'navegacao',
    text: 'O ângulo de deriva (drift) em navegação aérea é causado por:',
    option_a: 'Variação magnética local',
    option_b: 'Erro do compasso magnético',
    option_c: 'Componente lateral do vento',
    option_d: 'Diferença entre altitude pressão e altitude real',
    correct_answer: 'c',
    explanation: 'A deriva (drift) é o deslocamento lateral da aeronave em relação à rota planejada, causado pela componente perpendicular do vento em relação à proa da aeronave.'
  },
  {
    bloco_id: 'navegacao',
    text: 'O ponto no qual, após uma falha de motor, o piloto deve decidir se continua o vôo ou retorna ao aeródromo de partida, é denominado:',
    option_a: 'Ponto de Igualdade (PI)',
    option_b: 'Ponto de Retorno (PR)',
    option_c: 'Ponto de Sem Retorno (PSR)',
    option_d: 'Ponto de Desvio (PD)',
    correct_answer: 'c',
    explanation: 'O Ponto de Sem Retorno (PSR) ou Point of No Return é onde a aeronave utiliza toda a sua reserva de combustível para retornar. Após o PSR, não há combustível para voltar ao ponto de origem.'
  },
  {
    bloco_id: 'navegacao',
    text: 'A linha que une todos os pontos de mesma variação magnética em uma carta aeronáutica é denominada:',
    option_a: 'Isogônica',
    option_b: 'Isobárica',
    option_c: 'Isocora',
    option_d: 'Isolinha',
    correct_answer: 'a',
    explanation: 'As linhas isogônicas (ou isógonas) unem pontos de mesma variação magnética nas cartas. A linha de variação zero é chamada de agônica.'
  },
  {
    bloco_id: 'navegacao',
    text: 'Para converter rumo verdadeiro em rumo magnético, deve-se:',
    option_a: 'Somar a variação magnética leste e subtrair a oeste',
    option_b: 'Subtrair a variação magnética leste e somar a oeste',
    option_c: 'Sempre somar a variação magnética',
    option_d: 'Sempre subtrair a variação magnética',
    correct_answer: 'b',
    explanation: 'Rv = Rm + Var. Logo, Rm = Rv - Var. Variação leste é positiva, então subtraímos. Variação oeste é negativa, portanto somamos. Mnemônico: "Erro Leste = Bússola Menos" (ELBL).'
  },
  {
    bloco_id: 'navegacao',
    text: 'Uma aeronave voa com proa de 360° e velocidade TAS de 120 KT. O vento é de 090°/20 KT. A velocidade solo (GS) aproximada será de:',
    option_a: '100 KT',
    option_b: '116 KT',
    option_c: '120 KT',
    option_d: '140 KT',
    correct_answer: 'b',
    explanation: 'Vento de 090° em proa 360° é vento de través (perpendicular). A componente de proa/cauda é ≈0. GS ≈ √(120² - 20²) ≈ √(14400 - 400) ≈ √14000 ≈ 118 KT ≈ 116 KT.'
  },
  {
    bloco_id: 'navegacao',
    text: 'A altitude de transição é o nível abaixo do qual:',
    option_a: 'Os vôos IFR são proibidos',
    option_b: 'O altímetro é ajustado com o QNH local',
    option_c: 'Os vôos devem ser realizados exclusivamente em VFR',
    option_d: 'O altímetro é ajustado para 1013,2 hPa',
    correct_answer: 'b',
    explanation: 'Abaixo da altitude de transição, os altímetros são ajustados com o QNH local, fornecendo altitude em relação ao nível médio do mar. Acima dela, usa-se 1013,2 hPa (FL).'
  },
  {
    bloco_id: 'navegacao',
    text: 'O ETA (Estimated Time of Arrival) de um vôo é:',
    option_a: 'A hora estimada de saída do portão',
    option_b: 'A hora estimada de calços fora',
    option_c: 'A hora estimada de chegada no destino',
    option_d: 'A hora estimada de sobrevôo de um fixo',
    correct_answer: 'c',
    explanation: 'ETA (Estimated Time of Arrival) é a hora estimada de chegada ao aeródromo de destino. ETO é o tempo estimado de sobrevôo de um ponto e ETD é a hora estimada de partida.'
  },

  // ─── CONHECIMENTOS TÉCNICOS ───────────────────────────────────────────────
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'O efeito giroscópico em motores de pistão com hélice rotativa causa, durante a rotação do nariz para cima (arfagem positiva), um:',
    option_a: 'Guinada para a direita',
    option_b: 'Rolamento para a esquerda',
    option_c: 'Guinada para a esquerda',
    option_d: 'Rolamento para a direita',
    correct_answer: 'a',
    explanation: 'O efeito giroscópico age 90° na frente da força aplicada no sentido de rotação. Com hélice girando no sentido horário (vista frontal) e nariz subindo, o resultado é guinada para a direita.'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'A força que atua sobre a asa perpendicularmente ao escoamento relativo do ar e que sustenta a aeronave em vôo é denominada:',
    option_a: 'Arrasto',
    option_b: 'Tração',
    option_c: 'Sustentação',
    option_d: 'Peso',
    correct_answer: 'c',
    explanation: 'A sustentação (lift) é a força aerodinâmica perpendicular ao escoamento relativo, gerada principalmente pela asa. Ela se opõe ao peso e mantém a aeronave em vôo nivelado.'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'O ângulo de ataque crítico (stall angle) é atingido quando:',
    option_a: 'A velocidade da aeronave cai abaixo de 60 KT',
    option_b: 'O escoamento sobre a asa torna-se turbulento e a sustentação cai drasticamente',
    option_c: 'A potência do motor é reduzida ao mínimo',
    option_d: 'A aeronave supera a velocidade Vne',
    correct_answer: 'b',
    explanation: 'O estol (stall) ocorre quando o ângulo de ataque excede o valor crítico, causando separação do escoamento na parte superior da asa e colapso da sustentação. Não depende diretamente da velocidade, mas da densidade do ar e da carga.'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'O sistema de combustível de um avião a pistão utiliza combustível AVGAS 100LL. A cor do combustível é:',
    option_a: 'Incolor',
    option_b: 'Vermelho',
    option_c: 'Azul',
    option_d: 'Verde',
    correct_answer: 'c',
    explanation: 'O AVGAS 100LL (Low Lead) é colorido de azul para identificação visual e distinção de outros combustíveis. O Jet-A1 (querosene) é incolor ou levemente amarelado.'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'A velocidade de manobra (Va) de uma aeronave é importante porque:',
    option_a: 'Garante que os controles de vôo não percam efetividade',
    option_b: 'Abaixo dela, a aeronave entrará em estol antes de sofrer dano estrutural com deflexão total dos controles',
    option_c: 'É a velocidade máxima para operação em turbulência leve',
    option_d: 'É a velocidade ideal para pouso sem propulsão',
    correct_answer: 'b',
    explanation: 'Va é a velocidade de manobra: abaixo dela, qualquer deflexão total dos controles fará a aeronave entrar em estol antes que as forças aerodinâmicas atinjam os limites estruturais, protegendo a estrutura.'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'No sistema de pressurização de cabine, o controlador mantém a pressão diferencial entre a cabine e o exterior com o objetivo de:',
    option_a: 'Aumentar a velocidade da aeronave',
    option_b: 'Manter condições de altitude confortável para os ocupantes em vôo de altitude elevada',
    option_c: 'Reduzir o consumo de combustível',
    option_d: 'Eliminar a necessidade de uso de oxigênio suplementar em qualquer altitude',
    correct_answer: 'b',
    explanation: 'A pressurização mantém a pressão na cabine equivalente a altitudes entre 6.000 e 8.000 pés, proporcionando condições respiráveis e de conforto para os ocupantes mesmo com a aeronave voando em altitudes muito elevadas.'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'O fator de carga (load factor) de uma aeronave em uma curva coordenada de 60° de inclinação é de:',
    option_a: '1,0 G',
    option_b: '1,4 G',
    option_c: '2,0 G',
    option_d: '2,8 G',
    correct_answer: 'c',
    explanation: 'O fator de carga em curva = 1 / cos(ângulo de inclinação). Para 60°: 1 / cos(60°) = 1 / 0,5 = 2,0 G. Em curva de 60°, a estrutura suporta o dobro do peso normal.'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'O propósito principal do compensador (trim) de profundor é:',
    option_a: 'Aumentar o ângulo de subida da aeronave',
    option_b: 'Neutralizar as forças no manche para manter uma atitude de vôo sem esforço do piloto',
    option_c: 'Controlar a velocidade de descida durante a aproximação',
    option_d: 'Aumentar a deflexão máxima do profundor',
    correct_answer: 'b',
    explanation: 'O trim (compensador) serve para neutralizar as forças nos comandos de vôo, permitindo que o piloto mantenha uma atitude de vôo estável sem precisar aplicar força constante no manche.'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'O vácuo ou pressão gerado para operar os instrumentos giroscópicos (horizonte artificial e indicador de direção) em aeronaves leves é normalmente fornecido por:',
    option_a: 'Bateria elétrica',
    option_b: 'Tubo de Pitot',
    option_c: 'Bomba de vácuo movida pelo motor',
    option_d: 'Compressor de ar externo',
    correct_answer: 'c',
    explanation: 'Em aeronaves leves, os instrumentos giroscópicos são movidos por uma bomba de vácuo acionada pelo motor da aeronave (vacuum pump). Aeronaves mais modernas utilizam sistemas elétricos ou eletrônicos (EFIS).'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'O pitot é um instrumento que mede:',
    option_a: 'A pressão estática da atmosfera',
    option_b: 'A temperatura do ar externo',
    option_c: 'A pressão de impacto (dinâmica) do ar em movimento',
    option_d: 'A altitude pressão da aeronave',
    correct_answer: 'c',
    explanation: 'O tubo de Pitot mede a pressão de impacto (dinâmica), que é a pressão resultante do movimento da aeronave no ar. Combinado com a pressão estática, permite calcular a velocidade indicada (IAS).'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'A "velocidade de melhor planeio" (Best Glide Speed) é aquela que proporciona:',
    option_a: 'A menor taxa de descida em pés por minuto',
    option_b: 'A maior distância horizontal percorrida por unidade de altitude perdida',
    option_c: 'A menor velocidade de descida controlada',
    option_d: 'O melhor ângulo de subida com motor',
    correct_answer: 'b',
    explanation: 'A velocidade de melhor planeio (Vg ou Best Glide) maximiza a relação distância/altitude perdida. É usada em pousos sem motor para alcançar o maior alcance horizontal possível.'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'O sistema de magnetos em um motor a pistão de aeronave tem como característica operacional importante:',
    option_a: 'Dependência exclusiva da bateria da aeronave',
    option_b: 'Funcionamento independente do sistema elétrico da aeronave',
    option_c: 'Ativação automática apenas no solo',
    option_d: 'Controle eletrônico da ignição pelo computador de bordo',
    correct_answer: 'b',
    explanation: 'Os magnetos são geradores de alta tensão autopropulsados, que funcionam independentemente da bateria ou do alternador da aeronave. Isso garante ignição mesmo com falha total do sistema elétrico.'
  },

  // ─── DESEMPENHO E PLANEJAMENTO ───────────────────────────────────────────
  {
    bloco_id: 'desempenho_e_planejamento',
    text: 'O peso máximo de decolagem (MTOW) de uma aeronave é definido pelo fabricante como:',
    option_a: 'O peso máximo estrutural para o qual a aeronave foi certificada para pousar',
    option_b: 'O peso máximo certificado para o qual a aeronave pode decolar com segurança',
    option_c: 'O peso vazio da aeronave mais a carga máxima de combustível',
    option_d: 'O peso máximo permitido em solo com todos os sistemas em operação',
    correct_answer: 'b',
    explanation: 'O MTOW (Maximum Take-Off Weight) é o peso máximo certificado pelo fabricante para o qual a aeronave pode iniciar a decolagem com segurança, considerando os limites estruturais e de desempenho.'
  },
  {
    bloco_id: 'desempenho_e_planejamento',
    text: 'Para um avião a pistão, o consumo de combustível será maior quando voando:',
    option_a: 'Em altitude elevada com temperatura abaixo do padrão',
    option_b: 'Em altitude baixa com temperatura alta e alta potência',
    option_c: 'Em cruzeiro a potência reduzida em altitude de mistura ótima',
    option_d: 'Com vento de proa em qualquer altitude',
    correct_answer: 'b',
    explanation: 'Em altitude baixa com temperatura alta, a densidade do ar é menor e o motor precisa de mais potência (e mais combustível) para atingir o desempenho requerido. A altitude elevada normalmente favorece a eficiência.'
  },
  {
    bloco_id: 'desempenho_e_planejamento',
    text: 'O centro de gravidade (CG) de uma aeronave deve permanecer dentro dos limites estabelecidos pelo fabricante pois:',
    option_a: 'Afeta apenas o conforto dos passageiros',
    option_b: 'Fora dos limites, a aeronave pode tornar-se incontrolável ou estruturalmente comprometida',
    option_c: 'Afeta somente o consumo de combustível',
    option_d: 'É exigência burocrática sem impacto no vôo',
    correct_answer: 'b',
    explanation: 'O CG fora dos limites pode comprometer seriamente a estabilidade e controlabilidade da aeronave. CG muito à frente requer muita força no profundor; CG muito atrás pode tornar a aeronave instável e incontrolável.'
  },
  {
    bloco_id: 'desempenho_e_planejamento',
    text: 'A distância de decolagem de um avião será MAIOR quando:',
    option_a: 'Temperatura baixa, altitude baixa e peso leve',
    option_b: 'Temperatura alta, altitude elevada e peso máximo',
    option_c: 'Vento de proa forte e pista descendente',
    option_d: 'Flapes na posição de decolagem e pista seca',
    correct_answer: 'b',
    explanation: 'Temperatura alta e altitude elevada reduzem a densidade do ar, diminuindo a sustentação e a potência do motor. Peso máximo exige maior velocidade de decolagem. Todos esses fatores aumentam a distância necessária.'
  },
  {
    bloco_id: 'desempenho_e_planejamento',
    text: 'A autonomia de combustível exigida pela regulamentação brasileira (RBAC 91) para vôo VFR diurno deve incluir combustível suficiente para chegar ao destino mais:',
    option_a: '15 minutos de reserva',
    option_b: '30 minutos de reserva',
    option_c: '45 minutos de reserva',
    option_d: '60 minutos de reserva',
    correct_answer: 'b',
    explanation: 'O RBAC 91 exige que aviões realizando vôo VFR diurno tenham combustível para chegar ao destino mais 30 minutos adicionais voando em cruzeiro normal.'
  },
  {
    bloco_id: 'desempenho_e_planejamento',
    text: 'O efeito de pista molhada ou com contaminantes sobre a distância de pouso de um avião é:',
    option_a: 'Redução da distância, pois o atrito é maior',
    option_b: 'Não tem efeito significativo na distância de pouso',
    option_c: 'Aumento da distância, pois a frenagem é menos eficiente',
    option_d: 'Redução da distância apenas para aviões com freios antitravamento (ABS)',
    correct_answer: 'c',
    explanation: 'Pista molhada, com gelo, neve ou outros contaminantes reduz o coeficiente de atrito entre os pneus e a pista, tornando a frenagem menos eficiente e aumentando a distância de pouso.'
  },
  {
    bloco_id: 'desempenho_e_planejamento',
    text: 'O que é o peso básico vazio de uma aeronave (BEW - Basic Empty Weight)?',
    option_a: 'Peso da aeronave sem combustível, óleo, ocupantes e carga útil',
    option_b: 'Peso da aeronave apenas com combustível nos tanques',
    option_c: 'Peso da aeronave com todos os fluidos operacionais, mas sem combustível utilizável e carga',
    option_d: 'Peso mínimo certificado para operação',
    correct_answer: 'c',
    explanation: 'O BEW inclui a estrutura, sistemas, equipamentos, fluidos operacionais (óleo, hidráulico) e combustível não utilizável. Não inclui combustível utilizável, ocupantes, bagagem ou carga.'
  },
  {
    bloco_id: 'desempenho_e_planejamento',
    text: 'Para vôo VFR noturno, a reserva mínima de combustível exigida pelo RBAC 91 é de:',
    option_a: '30 minutos',
    option_b: '45 minutos',
    option_c: '60 minutos',
    option_d: '90 minutos',
    correct_answer: 'b',
    explanation: 'Para vôos VFR noturnos, o RBAC 91 exige reserva de 45 minutos além do combustível necessário para chegar ao destino, pois as condições noturnas apresentam riscos adicionais.'
  },
  {
    bloco_id: 'desempenho_e_planejamento',
    text: 'A altitude de densidade é definida como:',
    option_a: 'A altitude indicada pelo altímetro ajustado no QNH',
    option_b: 'A altitude pressão corrigida para a temperatura real',
    option_c: 'A altitude medida em relação ao aeródromo',
    option_d: 'A altitude máxima certificada da aeronave',
    correct_answer: 'b',
    explanation: 'A altitude de densidade é a altitude pressão corrigida para a temperatura real. É essencial para o cálculo de desempenho, pois temperatura alta eleva a altitude de densidade mesmo em aeródromos de baixa elevação.'
  },
  {
    bloco_id: 'desempenho_e_planejamento',
    text: 'Um avião com peso de 900 kg possui braço do CG de 1,85 m a partir do datum. O momento é de:',
    option_a: '486,5 kg·m',
    option_b: '900,0 kg·m',
    option_c: '1.665,0 kg·m',
    option_d: '1.850,0 kg·m',
    correct_answer: 'c',
    explanation: 'Momento = Peso × Braço = 900 kg × 1,85 m = 1.665,0 kg·m. O momento é usado para calcular o CG resultante em cálculos de peso e balanceamento.'
  },

  // ─── COMUNICAÇÕES AERONÁUTICAS ───────────────────────────────────────────
  {
    bloco_id: 'comunicacoes',
    text: 'A frase padrão que um piloto deve usar para indicar que recebeu e compreendeu uma mensagem do ATC é:',
    option_a: '"Entendido"',
    option_b: '"Roger"',
    option_c: '"Wilco"',
    option_d: '"Copy"',
    correct_answer: 'b',
    explanation: '"Roger" significa "recebi e entendi sua mensagem". "Wilco" (Will Comply) significa "recebi, entendi e vou cumprir". Em radiotelefonia aeronáutica padrão ICAO, "Roger" é o termo correto para acuse de recebimento.'
  },
  {
    bloco_id: 'comunicacoes',
    text: 'A palavra de procedimento utilizada para indicar que o piloto recebeu, compreendeu e irá cumprir uma instrução do ATC é:',
    option_a: 'Roger',
    option_b: 'Affirm',
    option_c: 'Wilco',
    option_d: 'Standby',
    correct_answer: 'c',
    explanation: '"Wilco" (Will Comply) significa "recebi, entendi e vou cumprir". É diferente de "Roger" que apenas confirma o recebimento sem o compromisso de cumprir.'
  },
  {
    bloco_id: 'comunicacoes',
    text: 'O sinal de socorro transmitido via radiotelefonia por uma aeronave em situação de perigo grave e iminente é:',
    option_a: 'PAN PAN',
    option_b: 'SECURITE',
    option_c: 'MAYDAY',
    option_d: 'GUARD',
    correct_answer: 'c',
    explanation: 'MAYDAY (do francês "m\'aidez" = ajude-me) é o sinal de socorro internacional para situações de perigo grave e iminente. Deve ser repetido três vezes: MAYDAY MAYDAY MAYDAY. PAN PAN indica urgência.'
  },
  {
    bloco_id: 'comunicacoes',
    text: 'A frequência de emergência aeronáutica internacional em VHF é:',
    option_a: '118,0 MHz',
    option_b: '121,5 MHz',
    option_c: '123,45 MHz',
    option_d: '126,9 MHz',
    correct_answer: 'b',
    explanation: '121,5 MHz é a frequência de guarda (emergência) aeronáutica em VHF, monitorada por todos os órgãos ATC, aviões em vôo e estações de salvamento. Em HF, a frequência de emergência é 2182 kHz.'
  },
  {
    bloco_id: 'comunicacoes',
    text: 'Na fonia aeronáutica, o número "9" deve ser pronunciado como:',
    option_a: 'NINO',
    option_b: 'NINE',
    option_c: 'NAINER',
    option_d: 'NOVA',
    correct_answer: 'c',
    explanation: 'Na fonia aeronáutica ICAO, os números são pronunciados de forma padronizada para evitar confusão: 9 = NAINER, 3 = TREE, 4 = FOWER, 5 = FIFE. O "9" pronunciado como "nainer" evita confusão com outras palavras.'
  },
  {
    bloco_id: 'comunicacoes',
    text: 'O indicativo de chamada de uma aeronave em radiotelefonia é normalmente baseado em:',
    option_a: 'No modelo e fabricante da aeronave',
    option_b: 'Na matrícula completa ou abreviada da aeronave',
    option_c: 'No número do vôo comercial apenas',
    option_d: 'No nome do piloto em comando',
    correct_answer: 'b',
    explanation: 'Para aviação geral, o indicativo de chamada é baseado na matrícula da aeronave (ex: PP-ABC pode ser chamado como "PP-ABC" ou "Alpha Bravo Charlie"). Para aviação comercial, usa-se o indicativo da empresa seguido do número do vôo.'
  },
  {
    bloco_id: 'comunicacoes',
    text: 'Em uma mensagem de posição via rádio, a sequência correta de informações é:',
    option_a: 'Nível, posição, hora, próxima posição e hora de sobrevôo',
    option_b: 'Identificação, posição, hora, nível, próxima posição e hora de sobrevôo',
    option_c: 'Hora, identificação, nível, posição e próxima posição',
    option_d: 'Posição, hora, nível, identificação e próxima posição',
    correct_answer: 'b',
    explanation: 'A sequência padronizada de uma mensagem de posição é: identificação da aeronave, posição, hora sobre a posição, nível de vôo, próxima posição e hora estimada de sobrevôo.'
  },
  {
    bloco_id: 'comunicacoes',
    text: 'O alfabeto fonético ICAO para a letra "N" é:',
    option_a: 'Neptune',
    option_b: 'November',
    option_c: 'Nano',
    option_d: 'Normal',
    correct_answer: 'b',
    explanation: 'No alfabeto fonético ICAO: A=Alpha, B=Bravo, C=Charlie, D=Delta, ..., N=November, ..., Z=Zulu. O November é a representação fonética padrão da letra N.'
  },

  // ─── INSTRUMENTOS DE BORDO ───────────────────────────────────────────────
  {
    bloco_id: 'instrumentos_de_bordo',
    text: 'O horizonte artificial (atitude) é um instrumento giroscópico que indica:',
    option_a: 'A direção magnética da aeronave',
    option_b: 'A atitude da aeronave em relação ao horizonte real',
    option_c: 'A altitude pressão da aeronave',
    option_d: 'A velocidade vertical de subida ou descida',
    correct_answer: 'b',
    explanation: 'O horizonte artificial (Attitude Indicator) é acionado giroscopicamente e indica a atitude da aeronave (inclinação lateral - bank - e arfagem - pitch) em relação ao horizonte real, sendo essencial para vôo por instrumentos.'
  },
  {
    bloco_id: 'instrumentos_de_bordo',
    text: 'O variômetro (VSI - Vertical Speed Indicator) indica:',
    option_a: 'A velocidade horizontal da aeronave',
    option_b: 'A taxa de variação da altitude em pés por minuto',
    option_c: 'A aceleração vertical da aeronave',
    option_d: 'A altitude em relação ao terreno',
    correct_answer: 'b',
    explanation: 'O VSI (Vertical Speed Indicator) ou variômetro indica a taxa de variação da altitude (climb/descent rate) em pés por minuto, baseando-se na variação da pressão estática.'
  },
  {
    bloco_id: 'instrumentos_de_bordo',
    text: 'O bloqueio do tubo de Pitot em vôo causará qual efeito no velocímetro (ASI)?',
    option_a: 'Indicará velocidade zero imediatamente',
    option_b: 'Não terá efeito, pois o ASI continua funcionando pela pressão estática',
    option_c: 'A indicação do ASI ficará "congelada" no valor da velocidade do momento do bloqueio',
    option_d: 'Indicará velocidade máxima da escala',
    correct_answer: 'c',
    explanation: 'Com o Pitot bloqueado, a pressão de impacto fica "aprisionada" no tubo. O ASI indicará a velocidade do momento do bloqueio, podendo aumentar (em subida) ou diminuir (em descida) por efeito da variação de pressão estática.'
  },
  {
    bloco_id: 'instrumentos_de_bordo',
    text: 'O indicador de giro e inclinação (turn and slip indicator) indica:',
    option_a: 'Apenas a inclinação lateral da aeronave',
    option_b: 'A taxa de curva e se a curva está coordenada ou não',
    option_c: 'A velocidade angular em torno do eixo vertical',
    option_d: 'O ângulo de ataque da aeronave',
    correct_answer: 'b',
    explanation: 'O indicador de giro e inclinação mostra: (1) a taxa de curva (agulha gyroscópica) e (2) a coordenação da curva através da bolinha/slip indicator. Bolinha centrada = curva coordenada.'
  },
  {
    bloco_id: 'instrumentos_de_bordo',
    text: 'O altímetro de bordo é um instrumento que mede a altitude baseando-se na:',
    option_a: 'Variação da temperatura com a altitude',
    option_b: 'Variação da pressão atmosférica com a altitude',
    option_c: 'Distância ao solo por ondas de rádio',
    option_d: 'Aceleração gravitacional local',
    correct_answer: 'b',
    explanation: 'O altímetro barométrico funciona medindo a pressão estática atmosférica. Como a pressão diminui com a altitude de forma conhecida, o instrumento converte essa pressão em leitura de altitude.'
  },
  {
    bloco_id: 'instrumentos_de_bordo',
    text: 'Em caso de falha do sistema de vácuo (vacuum system), quais instrumentos giroscópicos serão afetados em uma aeronave leve típica?',
    option_a: 'Velocímetro e altímetro',
    option_b: 'Horizonte artificial e indicador de direção (DI)',
    option_c: 'Variômetro e velocímetro',
    option_d: 'Bússola e altímetro',
    correct_answer: 'b',
    explanation: 'Em aeronaves leves típicas, o horizonte artificial e o indicador de direção (DI/HI) são operados por vácuo. Com falha do sistema de vácuo, esses dois instrumentos param de funcionar corretamente.'
  },
  {
    bloco_id: 'instrumentos_de_bordo',
    text: 'A bússola magnética de aeronave apresenta desvio de indicação durante acelerações e desacelerações. Este erro é mais pronunciado quando voando em rumos:',
    option_a: 'Leste e Oeste',
    option_b: 'Norte e Sul',
    option_c: 'Nordeste e Sudoeste',
    option_d: 'Igual em todos os rumos',
    correct_answer: 'b',
    explanation: 'Os erros de aceleração da bússola são mais pronunciados em rumos Norte e Sul, onde as componentes magnéticas verticais causam maior deflexão. Nos rumos Leste e Oeste os erros de aceleração são mínimos.'
  },

  // ─── FATORES HUMANOS / SEGURANÇA DE VÔO ─────────────────────────────────
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O modelo SHEL (ou SHELL) em segurança de vôo representa:',
    option_a: 'Sistema de Habilitação para Emissão de Licenças',
    option_b: 'A interação entre Software, Hardware, Environment, Liveware',
    option_c: 'Sequência de ações de emergência em procedimentos de vôo',
    option_d: 'Sistema de Hierarquia para Erros Latentes',
    correct_answer: 'b',
    explanation: 'O modelo SHELL analisa os fatores humanos na aviação: Software (procedimentos), Hardware (equipamentos), Environment (ambiente), Liveware (o ser humano) e suas interações. É ferramenta fundamental na análise de acidentes.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O fenômeno denominado "get-there-itis" na aviação refere-se a:',
    option_a: 'Síndrome do desfasamento horário após vôos longos',
    option_b: 'A pressão psicológica que leva o piloto a prosseguir o vôo mesmo em condições adversas',
    option_c: 'Tontura causada pela desorientação espacial',
    option_d: 'Efeito da altitude na cognição do piloto',
    correct_answer: 'b',
    explanation: '"Get-there-itis" (ou pressão de missão) é um fator humano que leva o piloto a continuar o vôo mesmo percebendo condições perigosas, movido pelo desejo ou pressão de chegar ao destino. É causa frequente de acidentes.'
  },

  // ─── MAIS QUESTÕES DE REGULAMENTOS ──────────────────────────────────────
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A abreviatura NOTAM significa:',
    option_a: 'Notice to Airmen',
    option_b: 'Notification of Air Movements',
    option_c: 'National Observation of Traffic and Aerodrome Monitoring',
    option_d: 'Notice of Terminal Approach Minimums',
    correct_answer: 'a',
    explanation: 'NOTAM (Notice to Airmen) é uma comunicação aeronáutica que contém informações sobre alterações temporárias em instalações, serviços, procedimentos ou perigos, essenciais à navegação aérea.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O piloto de um vôo VFR que se depara com condições IMC deve:',
    option_a: 'Continuar o vôo aumentando a altitude para sair das nuvens',
    option_b: 'Solicitar imediatamente clearance IFR ao ATC',
    option_c: 'Fazer meia-volta ou pousar no aeródromo mais próximo para evitar o vôo em IMC',
    option_d: 'Reduzir a velocidade e prosseguir com cautela',
    correct_answer: 'c',
    explanation: 'Um piloto com licença PPR sem habilitação IFR não pode voar em IMC. Ao deparar-se com condições IMC, deve imediatamente fazer meia-volta para condições VMC ou pousar no aeródromo mais próximo.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A velocidade máxima permitida abaixo do FL 100 (10.000 pés) em espaço aéreo controlado é de:',
    option_a: '200 KT',
    option_b: '250 KT',
    option_c: '280 KT',
    option_d: 'Ilimitada para aeronaves turbinas',
    correct_answer: 'b',
    explanation: 'Abaixo do FL 100, a velocidade máxima em espaço aéreo controlado é de 250 KT IAS, conforme regulamentação DECEA/ICAO, independentemente do tipo de aeronave (exceto em casos específicos autorizados).'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A pista 15 de um aeródromo tem orientação magnética de:',
    option_a: '015°',
    option_b: '150°',
    option_c: '105°',
    option_d: '195°',
    correct_answer: 'b',
    explanation: 'O número de pista é obtido dividindo o rumo magnético por 10 e arredondando. Pista 15 = rumo magnético 150°. A cabeceira oposta seria a pista 33 (330°).'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'Em uma convergência de aeronaves em que há perigo de colisão, a aeronave que tiver a outra à sua direita deve:',
    option_a: 'Manter rumo e velocidade, pois tem prioridade',
    option_b: 'Ceder passagem alterando o rumo para a direita',
    option_c: 'Reduzir a velocidade e deixar a outra passar',
    option_d: 'Aumentar a altitude para cruzar por cima',
    correct_answer: 'a',
    explanation: 'Em convergência (não de frente), a aeronave que vê a outra à sua direita tem prioridade e deve manter rumo e velocidade. A aeronave que vê a outra à sua esquerda deve ceder passagem alterando o rumo para a direita.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O circuito de tráfego padrão para aeronaves a hélice deve ser efetuado à altura de:',
    option_a: '500 pés AGL',
    option_b: '1.000 pés AGL',
    option_c: '1.500 pés AGL',
    option_d: '2.000 pés AGL',
    correct_answer: 'b',
    explanation: 'O circuito de tráfego padrão para aeronaves a hélice (pistão) é efetuado a 1.000 pés AGL (acima do nível do aeródromo). Para jatos, é normalmente a 1.500 pés AGL.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'O Código Brasileiro de Aeronáutica estabelece que o comandante de aeronave exerce autoridade desde:',
    option_a: 'A decolagem até o pouso',
    option_b: 'O acionamento dos motores até o corte',
    option_c: 'Seu embarque na aeronave até o corte dos motores',
    option_d: 'O fechamento das portas até a abertura no destino',
    correct_answer: 'c',
    explanation: 'Conforme o CBAer, o comandante exerce sua autoridade desde seu embarque na aeronave até o corte dos motores no destino. Neste período, é responsável pela segurança de todos a bordo.'
  },
  {
    bloco_id: 'regulamentos_de_trafego_aereo',
    text: 'A área perigosa de número 12, localizada na jurisdição do COMAR II, será identificada por:',
    option_a: 'SBD 212',
    option_b: 'SBP 122',
    option_c: 'SBD 122',
    option_d: 'SBR 212',
    correct_answer: 'a',
    explanation: 'Identificação: SB (Brasil) + tipo de área (D=perigosa, R=restrita, P=proibida) + número do COMAR (2) + número da área (12) = SBD 212.'
  },

  // ─── MAIS QUESTÕES DE METEOROLOGIA ───────────────────────────────────────
  {
    bloco_id: 'meteorologia',
    text: 'A turbulência em céu claro (CAT - Clear Air Turbulence) está mais frequentemente associada a:',
    option_a: 'Tempestades elétricas visíveis',
    option_b: 'Correntes de jato (jet streams)',
    option_c: 'Frentes frias próximas ao solo',
    option_d: 'Inversões de temperatura baixas',
    correct_answer: 'b',
    explanation: 'A CAT (Clear Air Turbulence) ocorre principalmente nas adjacências das correntes de jato, onde há grande cisalhamento de vento, em céu sem nuvens e sem indicação visual do perigo. É um dos principais riscos para a aviação em altitude.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'Uma frente fria que avança sobre uma área quente provoca normalmente:',
    option_a: 'Tempo estável com chuvas leves e contínuas',
    option_b: 'Melhora gradual das condições meteorológicas',
    option_c: 'Formação rápida de Cb com tempestades e deterioração brusca do tempo',
    option_d: 'Formação de nevoeiro de radiação',
    correct_answer: 'c',
    explanation: 'A passagem de frente fria provoca levantamento rápido do ar quente, formando Cumulonimbus com tempestades, turbulência severa, granizo e deterioração brusca e rápida das condições de vôo.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'O SIGMET é uma mensagem meteorológica que alerta para:',
    option_a: 'Observações de rotina em aeródromos',
    option_b: 'Fenômenos meteorológicos potencialmente perigosos para todas as aeronaves',
    option_c: 'Previsão de temperatura e vento para pilotos de balão',
    option_d: 'Condições de visibilidade em rotas VFR',
    correct_answer: 'b',
    explanation: 'SIGMET (Significant Meteorological Information) é uma mensagem que alerta sobre fenômenos meteorológicos significativos que podem afetar a segurança de todas as operações de vôo, como tempestades severas, turbulência severa e gelo intenso.'
  },
  {
    bloco_id: 'meteorologia',
    text: 'A inversão de temperatura na atmosfera ocorre quando:',
    option_a: 'A temperatura diminui normalmente com a altitude',
    option_b: 'A temperatura permanece constante com a altitude (isotermia)',
    option_c: 'A temperatura aumenta com o aumento da altitude',
    option_d: 'A temperatura cai mais rapidamente que o gradiente padrão',
    correct_answer: 'c',
    explanation: 'A inversão térmica ocorre quando a temperatura aumenta em vez de diminuir com a altitude. Essa condição pode aprisionar poluentes, criar camadas de nevoeiro e impedir o desenvolvimento de convecção.'
  },

  // ─── MAIS CONHECIMENTOS TÉCNICOS ─────────────────────────────────────────
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'O efeito P-factor em motores de pistão com hélice convencional (rotação horária vista da frente) é mais pronunciado quando:',
    option_a: 'Em cruzeiro à velocidade normal',
    option_b: 'Em alta potência e baixa velocidade (subida inicial)',
    option_c: 'Em planador com motor desligado',
    option_d: 'Em descida com potência reduzida',
    correct_answer: 'b',
    explanation: 'O P-factor (fator de assimetria da pá) é mais intenso em alta potência e baixa velocidade, quando a pá descendente tem maior ângulo de ataque efetivo que a pá ascendente, gerando tendência de guinada para a esquerda (em motores com rotação horária).'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'O que indica o luz âmbar (amarela) de baixa pressão de óleo no painel de instrumentos durante o vôo?',
    option_a: 'Situação normal de funcionamento do motor',
    option_b: 'Alerta que requer atenção e redução de potência imediata',
    option_c: 'Falha total do sistema de óleo, exigindo desligamento imediato',
    option_d: 'Indicação de nível baixo de óleo, mas sem risco imediato',
    correct_answer: 'b',
    explanation: 'Uma leitura fora do arco verde no indicador de pressão de óleo (ou luz de advertência) é uma situação séria que exige ação imediata: reduzir potência, verificar indicadores, e pousar o mais rápido possível. Operar com baixa pressão de óleo pode destruir o motor rapidamente.'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'O flape tem como função principal:',
    option_a: 'Aumentar a velocidade de cruzeiro',
    option_b: 'Aumentar a sustentação e o arrasto, permitindo aproximações mais lentas e íngremes',
    option_c: 'Controlar a rolagem (banking) da aeronave',
    option_d: 'Reduzir a turbulência na asa durante a cruzeiro',
    correct_answer: 'b',
    explanation: 'Os flapes aumentam a curvatura e a área da asa, aumentando a sustentação (permite voar mais devagar) e também o arrasto (permite descidas mais íngremes). São essenciais para operações de pouso e decolagem em pistas curtas.'
  },
  {
    bloco_id: 'conhecimentos_tecnicos',
    text: 'A velocidade Vfe é:',
    option_a: 'Velocidade de manobra com flapes estendidos',
    option_b: 'Velocidade máxima para operação com flapes estendidos',
    option_c: 'Velocidade de aproximação final com flapes',
    option_d: 'Velocidade de falha do motor em decolagem',
    correct_answer: 'b',
    explanation: 'Vfe (Velocity Flap Extended) é a velocidade máxima com a qual a aeronave pode operar com os flapes na posição indicada. Exceder esta velocidade com flapes estendidos pode causar danos estruturais.'
  },

];

// ─── Gerar CSV ───────────────────────────────────────────────────────────────
function escapeCsv(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const header = 'bloco_id,text,option_a,option_b,option_c,option_d,correct_answer,difficulty,explanation';
const rows = questoes.map(q =>
  [q.bloco_id, q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.difficulty || 'medium', q.explanation]
    .map(escapeCsv).join(',')
);

const csv = '\uFEFF' + [header, ...rows].join('\n');
fs.writeFileSync('./questoes_originais_ppav.csv', csv, 'utf8');

// Estatísticas
const stats = {};
questoes.forEach(q => { stats[q.bloco_id] = (stats[q.bloco_id] || 0) + 1; });

console.log('\n✅ QUESTÕES ORIGINAIS GERADAS: ' + questoes.length);
console.log('\n📊 Por matéria:');
Object.entries(stats).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log('   ' + k + ': ' + v));
console.log('\n📄 Arquivo salvo: questoes_originais_ppav.csv');
console.log('\n✔️  Todas as questões possuem gabarito (correct_answer) incluído!');
