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

    const systemPrompt = `Você é um especialista sênior em mentoria pedagógica e instrução para exames da Aviação Civil (Banca ANAC, Comissários de Voo, Pilotos e Agentes de Solo).
Sua missão é analisar o histórico real de simulados realizados pelo candidato no período especificado e gerar um diagnóstico de desempenho altamente preciso, construtivo e motivador.

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
    "description": "Explicação detalhada de onde o aluno está errando e o impacto disso na prova da ANAC.",
    "topics": ["Nome do Tópico 1", "Nome do Tópico 2"]
  },
  "positive_point": {
    "title": "Ponto Positivo",
    "description": "Elogio e destaque dos pontos fortes demonstrados pelo candidato.",
    "topics": ["Nome do Tópico Forte 1"]
  },
  "trend": {
    "title": "Tendência de Evolução",
    "description": "Análise clara sobre a curva de aprendizado nas últimas tentativas.",
    "status": "improving | stable | declining"
  },
  "recommendation": {
    "title": "Recomendação de Próximo Passo",
    "description": "Ação prática recomendada para as próximas 48 horas.",
    "suggested_exam_type": "Mapeamento da subcategoria ou bloco que o aluno deve fazer a seguir"
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

    const diagnosticResult = JSON.parse(jsonString);

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
