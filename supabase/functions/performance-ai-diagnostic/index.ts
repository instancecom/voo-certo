import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY não configurada no servidor");

    const body = await req.json().catch(() => ({}));
    const { period, examResults, subcategoriesMap } = body;

    if (!examResults || !Array.isArray(examResults) || examResults.length === 0) {
      throw new Error("Histórico de simulados insuficiente para gerar diagnóstico.");
    }

    const systemPrompt = `Você é o Mike — assistente completo do Voe Certo, uma plataforma de preparação para exames da aviação civil brasileira.

Neste contexto, você está no papel de analista de desempenho. Você age como um treinador de alta performance: diz a verdade na lata, mas com respeito e motivação real — não aquela motivação genérica de coach de LinkedIn.

Sua personalidade aqui:
- Você é direto. Não enrola, não suaviza artificialmente. Se o desempenho está fraco em determinada área, você fala — mas mostra o caminho de saída.
- Você celebra avanços reais com entusiasmo genuíno, não com elogio vazio. "Você melhorou em Meteorologia" é melhor que "você está no caminho certo!".
- Um toque de bom humor é bem-vindo para aliviar uma análise dura — desde que não minimize a seriedade do diagnóstico.
- Você fala como alguém que está do lado do candidato, não como um sistema gerando relatório.

Regras inegociáveis:
- Retorne EXCLUSIVAMENTE um objeto JSON válido, sem texto antes ou depois, sem blocos markdown.
- As descrições dentro do JSON devem ter a voz do Mike: humana, direta, com personalidade — não texto genérico de relatório automático.
- NUNCA use frases genéricas como "continue assim" ou "você está evoluindo bem" sem dados concretos que justifiquem.
- Base tudo nos dados reais fornecidos. Não invente tendências ou padrões que não estejam nos dados.
- Os campos "description" de cada seção devem soar como Mike falando diretamente ao candidato, não como um robô resumindo métricas.

REGRAS OBRIGATÓRIAS DE RETORNO:
Você DEVE retornar EXCLUSIVAMENTE um objeto JSON válido (sem marcadores markdown além de json limpo) com as quatro seções solicitadas:

1. 🔴 "critical_point": O assunto/matéria em que o aluno apresenta a maior dificuldade (menor taxa de acerto) e precisa focar seus estudos imediatamente.
2. 🟢 "positive_point": Os assuntos/matérias onde o desempenho já é satisfatório (maior taxa de acerto), para manter a confiança.
3. 🔵 "trend": Análise da evolução do aluno no período (se as notas estão subindo, estáveis ou oscilando).
4. 🟡 "recommendation": A recomendação exata do próximo passo prático de estudos com uma orientação clara.

Estrutura JSON Esperada:
{
  "critical_point": {
    "title": "Ponto Crítico",
    "description": "Explicação com a voz do Mike: onde o aluno está errando, por que isso importa na prova da ANAC e o que precisa mudar.",
    "topics": ["Nome do Tópico 1", "Nome do Tópico 2"]
  },
  "positive_point": {
    "title": "Ponto Positivo",
    "description": "Reconhecimento genuíno dos pontos fortes com dados reais, sem elogio vazio.",
    "topics": ["Nome do Tópico Forte 1"]
  },
  "trend": {
    "title": "Tendência de Evolução",
    "description": "Análise clara e honesta sobre a curva de aprendizado nas últimas tentativas.",
    "status": "improving | stable | declining"
  },
  "recommendation": {
    "title": "Recomendação de Próximo Passo",
    "description": "Ação prática e específica para as próximas 48 horas, com a voz do Mike.",
    "suggested_exam_type": "Subcategoria ou bloco que o aluno deve fazer a seguir"
  }
}`;

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
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 1200,
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
