import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Plan limits for AI questions per day
const PLAN_LIMITS: Record<string, number> = {
  free: 0,
  solo: 0,
  tripulante: 5,
  comandante: 15,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { questionId, questionText, options, correctAnswer, explanation, userQuestion } = await req.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Autenticação necessária." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Create hash of user question for caching
    const encoder = new TextEncoder();
    const data = encoder.encode(userQuestion.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const questionHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 32);

    // Check cache FIRST (before plan check — cache hits are free)
    const { data: cached } = await supabase
      .from("ai_question_cache")
      .select("ai_response")
      .eq("question_id", questionId)
      .eq("question_hash", questionHash)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify({ response: cached.ai_response, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No cache hit — check plan limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type, is_premium, ai_questions_count")
      .eq("user_id", userId)
      .maybeSingle();

    // Check if user is admin (bypass limits)
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!adminRole;

    const planType = profile?.plan_type || "free";
    const limit = PLAN_LIMITS[planType] ?? 0;

    if (!isAdmin && limit === 0) {
      return new Response(JSON.stringify({
        error: "Seu plano não inclui perguntas à IA. Atualize para Tripulante ou Comandante.",
        limitReached: true,
      }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dailyCount = profile?.ai_questions_count || 0;
    if (!isAdmin && dailyCount >= limit) {
      return new Response(JSON.stringify({
        error: `Limite de ${limit} perguntas/dia atingido. Atualize seu plano para continuar.`,
        limitReached: true,
      }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Groq
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const optionsText = options
      .map((opt: string, i: number) => `${String.fromCharCode(65 + i)}) ${opt}`)
      .join("\n");
    const correctLetter = String.fromCharCode(65 + correctAnswer);

    const systemPrompt = `Você é um comandante de linha com mais de 15 anos de voo e instrutor apaixonado por formar pilotos e comissários que passam na ANAC de primeira. Fala como um cara que está no cockpit ou na sala de aula dando o papo reto, com energia, bom humor na medida certa e aquele fogo no olhar que motiva o aluno a não desistir nunca.

Regras que você NUNCA quebra:
- Só fala sobre ESTA questão específica. Não divaga, não dá aula de nada além dela.
- Usa APENAS as informações fornecidas: enunciado, alternativas, correta e explicação oficial da ANAC.
- Respostas curtas e diretas: 80–120 palavras no máximo. Sem texto bonito, sem enrolação.
- Tom natural e carismático: fala como comandante dando bronca carinhosa ou elogiando o aluno. Usa expressões leves de aviação ("bora decolar", "foca na pista", "isso cai na prova mesmo"), mas nunca exagera.
- Explica o porquê da correta e onde o aluno pisou na bola (se errou), sempre apontando a regra da ANAC ou o conceito chave de forma simples.
- Nunca inventa nada, nunca adiciona exemplo que não esteja na explicação oficial, nunca cita regulamento que não esteja no contexto.
- Termina sempre com uma frase curta, motivadora e na lata: "Fixa isso na cabeça, comandante!", "Bora treinar mais essa!", "Você consegue, agora é só repetir na prova!".`;

    const userMessage = `CONTEXTO DA QUESTÃO:
Enunciado: ${questionText}

Alternativas:
${optionsText}

Resposta correta: ${correctLetter}
${explanation ? `Explicação: ${explanation}` : ""}

PERGUNTA DO ALUNO: ${userQuestion}`;

    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("Groq API error:", aiResponse.status, errText);
      throw new Error(`Groq API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content || "Não foi possível obter resposta.";

    // Increment AI questions counter
    await supabase
      .from("profiles")
      .update({ ai_questions_count: dailyCount + 1 })
      .eq("user_id", userId);

    // Save to cache (30 days)
    await supabase.from("ai_question_cache").upsert({
      question_id: questionId,
      question_hash: questionHash,
      user_question: userQuestion,
      ai_response: responseText,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "question_id,question_hash" });

    return new Response(JSON.stringify({ response: responseText, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
