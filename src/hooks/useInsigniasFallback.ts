export interface InsigniaFallbackData {
  model_url: string;
  verso_texto: string;
}

export const INSIGNIAS_FALLBACK: Record<string, InsigniaFallbackData> = {
  // Bronze (10)
  "Primeiro Voo": {
    model_url: "/insignias/primeiro-voo.svg",
    verso_texto: "Toda grande jornada na aviação começa com a coragem de dar o primeiro passo. O céu agora é o seu limite!"
  },
  "Decolagem": {
    model_url: "/insignias/decolagem.svg",
    verso_texto: "Assim como um avião decola contra o vento, suas dificuldades são o impulso para sua subida rumo ao sucesso."
  },
  "Turbulência Superada": {
    model_url: "/insignias/turbulencia-superada.svg",
    verso_texto: "Turbulências são passageiras, mas a sua resiliência e foco na segurança duram para sempre. Excelente controle!"
  },
  "Cinto Afivelado": {
    model_url: "/insignias/cinto-afivelado.svg",
    verso_texto: "A disciplina diária é o cinto de segurança que garante um voo tranquilo rumo à aprovação. Continue firme!"
  },
  "Asa Delta": {
    model_url: "/insignias/asa-delta.svg",
    verso_texto: "Aproveite as correntes de ar para planar cada vez mais alto. Cada pequeno avanço constrói sua asa para o futuro."
  },
  "Navegante Básico": {
    model_url: "/insignias/navegante-basico.svg",
    verso_texto: "Traçar a rota correta é metade do caminho. Você completou seu primeiro quadrante, mantenha o rumo!"
  },
  "Rádio Ligado": {
    model_url: "/insignias/radio-ligado.svg",
    verso_texto: "Comunicação clara e precisa é a alma da tripulação. Sua voz está sintonizada na frequência da vitória."
  },
  "Emergência Controlada": {
    model_url: "/insignias/emergencia-controlada.svg",
    verso_texto: "Manter a calma sob pressão é o que define um verdadeiro profissional de voo. Você está preparado para qualquer situação."
  },
  "Check-in Feito": {
    model_url: "/insignias/check-in-feito.svg",
    verso_texto: "Bem-vindo a bordo! O seu embarque foi confirmado e a sua jornada rumo ao topo da aviação civil começa hoje."
  },
  "Tripulante Novato": {
    model_url: "/insignias/tripulante-novato.svg",
    verso_texto: "Cada pergunta respondida é uma milha voada em direção ao seu grande objetivo. A prática constrói o mestre."
  },

  // Silver (15)
  "Asa Prateada": {
    model_url: "/insignias/asa-prateada.svg",
    verso_texto: "Consistência e determinação brilham como prata no horizonte. Você está ganhando altitude de cruzeiro!"
  },
  "Mestre do Rádio": {
    model_url: "/insignias/mestre-do-radio.svg",
    verso_texto: "A aviação fala uma língua global, e você já domina suas frequências. Comunicação impecável e sem fronteiras!"
  },
  "Turbulência Mestre": {
    model_url: "/insignias/turbulencia-mestre.svg",
    verso_texto: "Sua atenção irrestrita às normas de segurança faz de você o guardião da cabine. Confiança absoluta a bordo."
  },
  "7 Dias no Ar": {
    model_url: "/insignias/7-dias-no-ar.svg",
    verso_texto: "Uma semana inteira de dedicação ininterrupta. Sua rotina de estudos é o motor que não conhece falhas."
  },
  "Aprovado na Banca": {
    model_url: "/insignias/aprovado-na-banca.svg",
    verso_texto: "A primeira grande vitória no simulado da Banca! O reconhecimento oficial está cada vez mais perto da sua realidade."
  },
  "Colecionador de Blocos": {
    model_url: "/insignias/colecionador-de-blocos.svg",
    verso_texto: "Dominar uma profissão inteira exige visão sistêmica. Você encaixou cada peça deste desafio com maestria."
  },
  "Piloto de Cabine": {
    model_url: "/insignias/piloto-de-cabine.svg",
    verso_texto: "Cem milhas voadas no simulador de conhecimento. A cabine está sob seu controle e o destino é a excelência."
  },
  "Estrela em Ascensão": {
    model_url: "/insignias/estrela-em-ascensao.svg",
    verso_texto: "Seu brilho e consistência nos simulados provam que sua ascensão é imparável. Continue brilhando alto!"
  },
  "Sobrevivente de Emergência": {
    model_url: "/insignias/sobrevivente-de-emergencia.svg",
    verso_texto: "Em situações críticas, seu conhecimento é a chama que guia e salva vidas. Desempenho perfeito e inspirador."
  },
  "Comunicador Nato": {
    model_url: "/insignias/comunicador-nato.svg",
    verso_texto: "Falar com clareza e empatia abre portas em qualquer aeroporto do mundo. Sua oratória é exemplar."
  },
  "30 Dias no Céu": {
    model_url: "/insignias/30-dias-no-ceu.svg",
    verso_texto: "Um mês de dedicação diária. Você transformou o estudo em hábito e o horizonte em sua segunda casa."
  },
  "Conquistador de Blocos": {
    model_url: "/insignias/conquistador-de-blocos.svg",
    verso_texto: "Dez blocos superados com garra. Sua bagagem teórica está repleta de conhecimentos sólidos para o voo."
  },
  "Aprovado 3x": {
    model_url: "/insignias/aprovado-3x.svg",
    verso_texto: "Três aprovações consecutivas mostram que seu sucesso não é sorte, é fruto de preparação implacável."
  },
  "Mestre da Calma": {
    model_url: "/insignias/mestre-da-calma.svg",
    verso_texto: "A inteligência emocional é o maior superpoder de um tripulante. Lidar com pessoas é a sua arte."
  },
  "Tripulante Prata": {
    model_url: "/insignias/tripulante-prata.svg",
    verso_texto: "Quinhentas etapas superadas! Sua bagagem de voo está pesada de tanto conhecimento acumulado."
  },

  // Gold (15)
  "Asa de Ouro": {
    model_url: "/insignias/asa-de-ouro.svg",
    verso_texto: "O ouro reluz nos céus mais altos. Sua altíssima média em vinte simulados coroa sua jornada acadêmica."
  },
  "Comandante de Cabine": {
    model_url: "/insignias/comandante-de-cabine.svg",
    verso_texto: "Cinco vitórias épicas. Você lidera a cabine de estudos com a autoridade e a sabedoria de um comandante."
  },
  "100 Dias no Ar": {
    model_url: "/insignias/100-dias-no-ar.svg",
    verso_texto: "Cem dias voando alto com disciplina de ferro. O hábito de vencer se tornou parte da sua identidade."
  },
  "Mestre Geral": {
    model_url: "/insignias/mestre-geral.svg",
    verso_texto: "Sua excelência em todas as disciplinas de uma profissão é digna de aplausos. Você é uma referência técnica!"
  },
  "Poliglota Aeronáutico": {
    model_url: "/insignias/poliglota-aeronautico.svg",
    verso_texto: "Sem barreiras de idioma, o mundo inteiro é o seu destino. Conexão global perfeita em qualquer tripulação."
  },
  "Sobrevivente Supremo": {
    model_url: "/insignias/sobrevivente-supremo.svg",
    verso_texto: "Segurança inabalável e atenção máxima. Você obteve a nota máxima na disciplina que protege vidas no ar."
  },
  "1000 Questões": {
    model_url: "/insignias/1000-questoes.svg",
    verso_texto: "Mil decolagens intelectuais completadas! Seu cérebro está programado para o sucesso absoluto na aviação."
  },
  "Aprovado 10x": {
    model_url: "/insignias/aprovado-10x.svg",
    verso_texto: "Dez vezes aprovado na banca! Sua consistência comprova que você está mais do que pronto para as asas reais."
  },
  "Lenda da Entrevista": {
    model_url: "/insignias/lenda-da-entrevista.svg",
    verso_texto: "Comunicação assertiva, simpatia e perfil ideal. As dinâmicas de grupo e entrevistas serão seu show particular."
  },
  "Treinador Épico": {
    model_url: "/insignias/treinador-epico.svg",
    verso_texto: "Trinta dias ininterruptos de foco implacável. A faísca da sua determinação ilumina toda a sua trajetória."
  },
  "Colecionador Supremo": {
    model_url: "/insignias/colecionador-supremo.svg",
    verso_texto: "Cinquenta blocos completados! Uma biblioteca viva de regulamentos, emergências e conhecimentos aeronáuticos."
  },
  "Estrela do Céu": {
    model_url: "/insignias/estrela-do-ceu.svg",
    verso_texto: "Uma luz guia na imensidão azul. Sua precisão e média altíssima são inspiração para toda a tripulação."
  },
  "Mestre da Pressão": {
    model_url: "/insignias/mestre-da-pressao.svg",
    verso_texto: "Quando a pressão sobe, sua mente clareia e sua precisão cirúrgica assume o controle. Resiliência de aço!"
  },
  "Piloto de Elite": {
    model_url: "/insignias/piloto-de-elite.svg",
    verso_texto: "Domínio completo de todas as situações de simulado. Você voa na classe de elite do conhecimento aeronáutico."
  },
  "Capitão de Conquistas": {
    model_url: "/insignias/capitao-de-conquistas.svg",
    verso_texto: "Quarenta troféus em sua galeria pessoal. Seu peito já está coberto de medalhas brilhantes do seu esforço."
  },

  // Platinum (10)
  "Lenda da ANAC": {
    model_url: "/insignias/lenda-da-anac.svg",
    verso_texto: "Vinte aprovações oficiais! A banca da ANAC não tem segredos para você. Sua história já se tornou lendária."
  },
  "Asa Imortal": {
    model_url: "/insignias/asa-imortal.svg",
    verso_texto: "Suas asas transcendem as nuvens. Obter noventa e cinco por cento de média é para quem nasceu para voar eternamente."
  },
  "365 Dias no Ar": {
    model_url: "/insignias/365-dias-no-ar.svg",
    verso_texto: "Um ano inteiro respirando aviação dia após dia. Sua persistência inabalável esculpiu seu caminho rumo ao estrelato."
  },
  "Mestre Absoluto": {
    model_url: "/insignias/mestre-absoluto.svg",
    verso_texto: "Perfeição absoluta em cada detalhe de sua carreira. Um diamante lapidado com dedicação extrema e paixão sem limites."
  },
  "Poliglota Supremo": {
    model_url: "/insignias/poliglota-supremo.svg",
    verso_texto: "Fluidez total em múltiplos idiomas. Suas palavras constroem pontes aéreas perfeitas entre culturas de todo o planeta."
  },
  "5000 Questões": {
    model_url: "/insignias/5000-questoes.svg",
    verso_texto: "Cinco mil desafios intelectuais superados! Uma marca monumental que simboliza foco, paixão e dedicação sem fim."
  },
  "Conquistador de Companhias": {
    model_url: "/insignias/conquistador-de-companhias.svg",
    verso_texto: "Desejado pelas maiores empresas do setor. Você conhece e domina os padrões de atendimento e segurança de todas elas."
  },
  "Lenda Viva": {
    model_url: "/insignias/lenda-viva.svg",
    verso_texto: "Você conquistou o topo absoluto. Seu nome já faz parte do hall da fama dos maiores aviadores do Voo Certo."
  },
  "Comandante Lendário": {
    model_url: "/insignias/comandante-lendario.svg",
    verso_texto: "Cinquenta aprovações! Um recorde extraordinário que reflete uma dedicação sem paralelos no ensino aeronáutico."
  },
  "Voo Eterno": {
    model_url: "/insignias/voo-eterno.svg",
    verso_texto: "Mil dias na frequência da excelência. Sua dedicação brilha como o Sol acima das nuvens, iluminando a todos."
  }
};

/**
 * Returns premium local SVG path and customized Portuguese motivational quote for an insignia.
 * Returns null values if the insignia is 'Aprovado ANAC' or not found.
 */
export function getInsigniaFallback(name: string): InsigniaFallbackData | null {
  if (name === "Aprovado ANAC") return null;
  return INSIGNIAS_FALLBACK[name] || null;
}
