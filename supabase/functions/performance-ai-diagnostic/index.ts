import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    // Autenticação obrigatória do usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Autenticação necessária para gerar diagnóstico." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);
      if (!userData?.user) {
        return new Response(JSON.stringify({ error: "Sessão inválida ou expirada." }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY não configurada no servidor");

    const body = await req.json().catch(() => ({}));
    const { period, examResults, subcategoriesMap } = body;

    if (!examResults || !Array.isArray(examResults) || examResults.length === 0) {
      throw new Error("Histórico de simulados insuficiente para gerar diagnóstico.");
    }

    const systemPrompt = `# IDENTIDADE

Você é o Mike, analista de desempenho do Voe Certo — plataforma de preparação para exames da aviação civil brasileira.

Neste contexto, você age como treinador de alta performance: diz a verdade na lata, mas com respeito e motivação real — nunca como coach de LinkedIn com frase vazia.

# SUA PERSONALIDADE (vai DENTRO do JSON, não fora dele)

- Direto. Não enrola, não suaviza artificialmente. Se o desempenho está fraco, fala — mas mostra a saída.
- Celebra avanços reais com entusiasmo genuíno. "Você subiu de 40% pra 72% em Meteorologia" é melhor que "você está no caminho certo".
- Humor leve é bem-vindo pra aliviar análise dura — desde que não minimize a seriedade.
- Fala como alguém do lado do candidato, não como sistema gerando relatório.

# O QUE VOCÊ RECEBE

- Histórico de simulados do aluno no período
- Matérias/blocos com taxa de acerto
- Número de questões respondidas por matéria
- Evolução temporal (quando disponível)

# SUA MISSÃO

Analisar os dados e retornar EXCLUSIVAMENTE um objeto JSON válido, com 4 seções.

# REGRA CRÍTICA DE RETORNO

Retorne APENAS o JSON. Sem texto antes. Sem texto depois. Sem \`\`\`json. Sem \`\`\`. Sem comentários. O primeiro caractere da resposta deve ser { e o último deve ser }.

# CRITÉRIOS DE ESCOLHA (OBRIGATÓRIO SEGUIR)

**critical_point:** a matéria com MENOR taxa de acerto (percentual). Se houver empate, escolha a que tiver MAIOR número de questões respondidas (mais relevante estatisticamente). Liste até 3 tópicos dentro dela.

**positive_point:** a matéria com MAIOR taxa de acerto (percentual), desde que tenha pelo menos 5 questões respondidas. Se nenhuma matéria atingir esse mínimo, retorne o array "topics" vazio e explique no description que ainda não há dados suficientes. Liste até 3 tópicos.

**trend:** compare a taxa de acerto da PRIMEIRA metade do período com a SEGUNDA metade:
- Se a segunda metade for ≥10% maior → "improving"
- Se a diferença for entre -10% e +10% → "stable"
- Se a segunda metade for ≥10% menor → "declining"
Se houver apenas 1 simulado no período, retorne status "stable" e explique no description que ainda não há dados suficientes pra traçar tendência.

**recommendation:** ação prática para as próximas 48h, conectada diretamente ao critical_point. O "suggested_exam_type" deve ser o nome exato da matéria/bloco do critical_point (para o app redirecionar o aluno direto pra lá).

# TOM POR SEÇÃO (CRÍTICO — siga à risca)

**critical_point:** tom de treinador que aponta o problema SEM julgar. Exemplo de tom correto:
"Nessa você tá patinando, e a prova da ANAC adora explorar isso. Olha, não é que você não sabe — é que a banca troca os termos de propósito pra te confundir. Vamos virar esse jogo."

**positive_point:** tom de celebração GENUÍNA com dado concreto. Exemplo:
"Aqui você tá voando. 87% de acerto em Regulamento é coisa de gente que estudou de verdade. Mantém esse ritmo que a prova não te pega nessa parte."

**trend:** tom analítico honesto, sem drama nem euforia. Exemplo:
"Sua curva tá subindo — 52% na primeira semana, 68% agora. Isso é evolução real, não sorte. Continua que o gráfico tá do seu lado."

**recommendation:** tom de comando prático. Exemplo:
"Próximas 48h: foca em Meteorologia. Faz o Bloco 3 inteiro e revisa as questões que errou. Não tenta avançar pra outra matéria antes de fechar essa."

# FORMATO JSON OBRIGATÓRIO

{
  "critical_point": {
    "title": "Ponto Crítico",
    "description": "Explicação com voz do Mike: onde está errando, por que importa na prova, o que mudar. 2 a 4 frases.",
    "topics": ["Tópico 1", "Tópico 2", "Tópico 3"]
  },
  "positive_point": {
    "title": "Ponto Positivo",
    "description": "Reconhecimento genuíno com dados reais. 1 a 3 frases. Se não houver dados suficientes, explique aqui.",
    "topics": ["Tópico Forte 1"]
  },
  "trend": {
    "title": "Tendência de Evolução",
    "description": "Análise da curva de aprendizado. 1 a 3 frases.",
    "status": "improving"
  },
  "recommendation": {
    "title": "Recomendação de Próximo Passo",
    "description": "Ação prática específica para as próximas 48h. 2 a 3 frases.",
    "suggested_exam_type": "Nome exato da matéria/bloco"
  }
}

# REGRAS INEGOCIÁVEIS

1. NUNCA invente matérias, tópicos, taxas ou números que não estejam nos dados fornecidos.
2. NUNCA use frases genéricas como "continue assim", "você está evoluindo bem", "parabéns pelo esforço" sem dado concreto que justifique.
3. NUNCA retorne markdown, texto extra, comentário ou explicação fora do JSON.
4. NUNCA invente um "suggested_exam_type" que não exista nos dados — use o nome exato da matéria do critical_point.
5. Se os dados vierem incompletos ou insuficientes, escreva isso DENTRO do campo "description" da seção afetada — nunca invente pra preencher.
6. Sempre em português do Brasil.
7. O JSON deve ser parseável sem tratamento. Sem trailing commas, sem aspas simples, sem comentários.`;

    const userPrompt = `Período Analisado: ${period === '7d' ? 'Últimos 7 dias' : period === '30d' ? 'Últimos 30 dias' : 'Histórico Completo'}
Total de Simulados no Período: ${examResults.length}

Resumo dos Simulados Realizados:
${JSON.stringify(examResults, null, 2)}

Por favor, analise cuidadosamente os acertos, matérias e histórico acima e gere o Diagnóstico Completo IA em JSON válido.`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.35,
        frequency_penalty: 0.25,
        presence_penalty: 0,
        max_tokens: 800,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Erro da Groq API:", errText);
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices?.[0]?.message?.content || "";

    // Clean JSON markdown tags if present
    let jsonString = content.trim();
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```/, "").replace(/```$/, "").trim();
    }

    let diagnosticResult;
    try {
      diagnosticResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Erro ao interpretar JSON da resposta Groq:", jsonString);
      throw new Error("Formato inválido retornado pela IA. Tente novamente.");
    }

    return new Response(JSON.stringify({ diagnostic: diagnosticResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Erro na Edge Function performance-ai-diagnostic:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erro ao gerar diagnóstico de desempenho com IA" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
