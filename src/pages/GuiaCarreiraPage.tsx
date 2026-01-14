import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Stethoscope, 
  Send, 
  Brain, 
  Users, 
  MessageCircle, 
  GraduationCap,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Plane
} from 'lucide-react';

interface CareerStep {
  number: number;
  emoji: string;
  title: string;
  icon: React.ElementType;
  description: string;
  details: string[];
  tips: string[];
  relatedSimulados?: {
    label: string;
    link: string;
  }[];
}

const careerSteps: CareerStep[] = [
  {
    number: 1,
    emoji: "📚",
    title: "Curso Teórico Homologado pela ANAC",
    icon: BookOpen,
    description: "O primeiro passo é realizar um curso de formação de comissário de voo em uma escola homologada pela ANAC.",
    details: [
      "Carga horária mínima: 150 horas teóricas",
      "Disciplinas: Regulamentação, Segurança de Voo, Primeiros Socorros, Sobrevivência, CRM",
      "Ao final, você receberá o Certificado de Conclusão do Curso (CCC)",
      "O curso prepara para a prova da ANAC e para a rotina a bordo"
    ],
    tips: [
      "Escolha uma escola reconhecida e com boas avaliações",
      "Aproveite o curso para fazer networking com futuros colegas",
      "Comece a estudar inglês desde já - será essencial!"
    ],
    relatedSimulados: [
      { label: "Simulado ANAC - Banca Oficial", link: "/simulado-anac" },
      { label: "Questões de Segurança", link: "/simulados" }
    ]
  },
  {
    number: 2,
    emoji: "🩺",
    title: "Exame Médico CMA (Certificado Médico Aeronáutico)",
    icon: Stethoscope,
    description: "Você precisará passar por uma avaliação médica rigorosa para obter o CMA Classe 2 ou 3.",
    details: [
      "Exame realizado por médicos credenciados pela ANAC",
      "Avalia: visão, audição, sistema cardiovascular, neurológico e psicológico",
      "Validade: 1 a 5 anos dependendo da idade",
      "Sem o CMA, não é possível exercer a função a bordo"
    ],
    tips: [
      "Cuide da sua saúde antes do exame: alimentação, sono e exercícios",
      "Leve todos os documentos e exames anteriores",
      "Informe ao médico sobre qualquer condição pré-existente"
    ]
  },
  {
    number: 3,
    emoji: "📝",
    title: "Cadastro Online nas Companhias Aéreas",
    icon: Send,
    description: "Com o curso concluído, é hora de se candidatar às vagas nas companhias aéreas.",
    details: [
      "Acesse o site de carreiras das companhias (LATAM, GOL, Azul, etc.)",
      "Preencha o cadastro com dados atualizados",
      "Prepare um currículo objetivo e profissional",
      "Algumas empresas pedem vídeo de apresentação ou carta de motivação"
    ],
    tips: [
      "Personalize seu currículo para cada companhia",
      "No vídeo, seja natural, sorria e demonstre paixão pela aviação",
      "Mantenha seu cadastro sempre atualizado"
    ]
  },
  {
    number: 4,
    emoji: "💻",
    title: "Testes Online (Idiomas e Psicométricos)",
    icon: Brain,
    description: "A maioria das companhias aplica testes online para avaliar idiomas e raciocínio.",
    details: [
      "Testes de inglês: gramática, interpretação, listening",
      "Testes de espanhol (algumas companhias)",
      "Testes SHL: raciocínio lógico, verbal e numérico",
      "Testes psicométricos: personalidade e comportamento"
    ],
    tips: [
      "Pratique testes SHL antes do dia - existem simuladores online",
      "Treine listening com podcasts e filmes em inglês",
      "Faça os testes em ambiente silencioso e com boa internet"
    ],
    relatedSimulados: [
      { label: "Simulado de Inglês Aeronáutico", link: "/simulados" },
      { label: "Testes de Raciocínio Lógico", link: "/simulados" }
    ]
  },
  {
    number: 5,
    emoji: "🧠",
    title: "Avaliação Comportamental e Psicométrica",
    icon: Users,
    description: "Esta etapa avalia se você tem o perfil adequado para trabalhar como comissário(a).",
    details: [
      "Avaliação de competências: trabalho em equipe, resiliência, comunicação",
      "Fit cultural: alinhamento com os valores da empresa",
      "Pode incluir inventários de personalidade",
      "Algumas companhias fazem essa avaliação online, outras presencialmente"
    ],
    tips: [
      "Seja autêntico nas respostas - não tente 'acertar'",
      "Pesquise sobre a cultura e valores da companhia",
      "Demonstre equilíbrio emocional e maturidade"
    ],
    relatedSimulados: [
      { label: "Simulado Comportamental", link: "/simulados" }
    ]
  },
  {
    number: 6,
    emoji: "👥",
    title: "Dinâmica de Grupo",
    icon: Users,
    description: "Algumas companhias realizam dinâmicas para observar como você interage com outras pessoas.",
    details: [
      "Atividades em grupo que simulam situações do dia a dia",
      "Avaliadores observam: liderança, cooperação, comunicação",
      "Pode incluir debates, resolução de problemas em equipe",
      "Duração média: 2 a 4 horas"
    ],
    tips: [
      "Participe ativamente, mas saiba ouvir os outros",
      "Não tente se sobressair demais - trabalho em equipe é essencial",
      "Vista-se de forma profissional e chegue com antecedência"
    ]
  },
  {
    number: 7,
    emoji: "🗣️",
    title: "Entrevista Individual Comportamental",
    icon: MessageCircle,
    description: "A entrevista final avalia suas experiências, motivações e comportamentos passados.",
    details: [
      "Perguntas baseadas em competências (método STAR)",
      "Exemplos: 'Conte uma situação em que você lidou com um cliente difícil'",
      "Avalia: comunicação, resolução de conflitos, atendimento ao cliente",
      "Pode ser em português, inglês ou ambos"
    ],
    tips: [
      "Use o método STAR: Situação, Tarefa, Ação, Resultado",
      "Prepare 5-10 histórias de experiências anteriores",
      "Pratique respostas em inglês sobre você e sua motivação",
      "Faça perguntas inteligentes sobre a empresa e a função"
    ],
    relatedSimulados: [
      { label: "Simulado de Entrevista", link: "/simulados" }
    ]
  },
  {
    number: 8,
    emoji: "✈️",
    title: "Exame Médico Final e Treinamento Inicial",
    icon: GraduationCap,
    description: "Após aprovação, você fará exames médicos complementares e o treinamento da companhia.",
    details: [
      "Exames admissionais completos",
      "Treinamento inicial (ground school): 4 a 6 semanas",
      "Inclui: procedimentos da companhia, aeronave específica, emergências",
      "Voos de experiência supervisionados antes de voar solo"
    ],
    tips: [
      "Absorva todo o conhecimento - será sua base para a carreira",
      "Faça anotações e revise diariamente",
      "Construa bons relacionamentos com instrutores e colegas"
    ]
  }
];

const starMethod = {
  title: "Método STAR para Entrevistas",
  description: "Estruture suas respostas de forma clara e objetiva:",
  items: [
    { letter: "S", word: "Situação", description: "Descreva o contexto e cenário" },
    { letter: "T", word: "Tarefa", description: "Explique seu papel e responsabilidade" },
    { letter: "A", word: "Ação", description: "Detalhe o que você fez" },
    { letter: "R", word: "Resultado", description: "Apresente o resultado alcançado" }
  ]
};

const generalTips = [
  {
    icon: "👔",
    title: "Vestimenta Profissional",
    tips: [
      "Mulheres: vestido social, saia + blusa, maquiagem discreta, cabelo preso",
      "Homens: calça social, camisa, barba feita, cabelo cortado",
      "Cores neutras: preto, azul marinho, branco, cinza",
      "Evite perfumes fortes e acessórios chamativos"
    ]
  },
  {
    icon: "🎯",
    title: "Postura e Linguagem Corporal",
    tips: [
      "Mantenha contato visual com o entrevistador",
      "Sorria genuinamente - transmita simpatia",
      "Sente-se ereto, mãos visíveis sobre a mesa",
      "Evite cruzar os braços ou mexer muito nas mãos"
    ]
  },
  {
    icon: "🌍",
    title: "Preparação para Inglês Oral",
    tips: [
      "Pratique sua apresentação pessoal (2-3 minutos)",
      "Prepare respostas para: Why aviation? Why this company?",
      "Treine pronúncia de termos aeronáuticos",
      "Assista conteúdos em inglês sem legenda"
    ]
  }
];

export default function GuiaCarreiraPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Plane className="w-5 h-5 text-accent" />
                <span className="text-primary-foreground/90 text-sm font-medium">
                  Guia Completo de Carreira
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
                Como Ingressar na Carreira de{' '}
                <span className="text-accent">Comissário de Bordo</span>
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
                Conheça todas as etapas do processo seletivo e prepare-se para realizar 
                seu sonho de voar pelos céus do mundo.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  📚 8 Etapas Detalhadas
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  💡 Dicas Práticas
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  🎯 Simulados Integrados
                </Badge>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Career Steps */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Passo a Passo do Processo Seletivo
                </h2>
                <p className="text-muted-foreground">
                  Cada companhia pode ter variações, mas estas são as etapas mais comuns
                </p>
              </motion.div>

              <div className="space-y-8">
                {careerSteps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden border-l-4 border-l-accent hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-2xl">
                            {step.emoji}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                Etapa {step.number}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg md:text-xl">
                              {step.title}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {step.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        {/* Details */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            O que você precisa saber:
                          </h4>
                          <ul className="space-y-2">
                            {step.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="text-accent mt-1">•</span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Tips */}
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-accent" />
                            Dicas importantes:
                          </h4>
                          <ul className="space-y-2">
                            {step.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="text-accent mt-1">💡</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Related Simulados */}
                        {step.relatedSimulados && step.relatedSimulados.length > 0 && (
                          <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                              <Plane className="w-4 h-4 text-accent" />
                              Treine agora essa etapa:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {step.relatedSimulados.map((simulado, i) => (
                                <Button
                                  key={i}
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="border-accent/30 hover:bg-accent hover:text-accent-foreground"
                                >
                                  <Link to={simulado.link}>
                                    {simulado.label}
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                  </Link>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* STAR Method */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {starMethod.title}
                </h2>
                <p className="text-muted-foreground">
                  {starMethod.description}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {starMethod.items.map((item, index) => (
                  <motion.div
                    key={item.letter}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="text-center h-full hover:border-accent transition-colors">
                      <CardContent className="pt-6">
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl font-bold text-accent">{item.letter}</span>
                        </div>
                        <h3 className="font-bold text-foreground mb-2">{item.word}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* General Tips */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Dicas Gerais para o Processo
                </h2>
                <p className="text-muted-foreground">
                  Detalhes que fazem a diferença
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {generalTips.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full">
                      <CardHeader className="text-center pb-2">
                        <div className="text-4xl mb-2">{section.icon}</div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {section.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="py-8 md:py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Aviso Importante</h3>
                      <p className="text-sm text-muted-foreground">
                        Este conteúdo é genérico e baseado em processos seletivos comuns no mercado de aviação. 
                        Cada companhia aérea pode ter etapas, requisitos e critérios diferentes. 
                        <strong className="text-foreground"> Sempre consulte o site oficial da empresa</strong> para 
                        obter informações atualizadas e específicas sobre o processo seletivo.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Pronto para começar sua jornada?
              </h2>
              <p className="text-muted-foreground mb-8">
                Pratique com nossos simulados e aumente suas chances de aprovação
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/simulados">
                    <Plane className="w-5 h-5 mr-2" />
                    Começar a Treinar
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/simulado-anac">
                    Simulado ANAC Oficial
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
