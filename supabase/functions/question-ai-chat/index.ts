import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Plan limits for AI questions PER QUESTION
const PLAN_LIMITS_PER_QUESTION: Record<string, number> = {
  free: 0,
  solo: 0,
  tripulante: 5,
  comandante: 15,
};

// Daily safety cap to prevent system abuse
const DAILY_SAFETY_LIMIT: Record<string, number> = {
  free: 0,
  solo: 0,
  tripulante: 30, // Max 30 questions per day
  comandante: 100, // Max 100 questions per day
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

    // No cache hit — fetch profile and check if user is admin (bypass limits)
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type, is_premium, ai_questions_count")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!adminRole;
    const planType = profile?.plan_type || "free";

    if (!isAdmin) {
      // 1. Check daily safety limit first
      const dailySafetyMax = DAILY_SAFETY_LIMIT[planType] ?? 0;
      const currentDailyCount = profile?.ai_questions_count || 0;
      if (currentDailyCount >= dailySafetyMax) {
        return new Response(JSON.stringify({
          error: "Você atingiu o teto diário de segurança de uso de IA. Tente novamente amanhã.",
          limitType: 'daily_safety',
          limitReached: true,
        }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 2. Check per-question limit using RPC
      const limitPerQuestion = PLAN_LIMITS_PER_QUESTION[planType] ?? 0;
      const { data: perQuestionUsage } = await supabase.rpc('get_ai_usage_for_question', {
        p_user_id: userId,
        p_question_id: questionId
      });
      
      const currentQuestionUsage = perQuestionUsage || 0;
      if (currentQuestionUsage >= limitPerQuestion) {
        return new Response(JSON.stringify({
          error: `Você já atingiu o limite de ${limitPerQuestion} perguntas por questão para o seu plano.`,
          limitType: 'per_question',
          limitReached: true,
        }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Call Groq
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const optionsText = options
      .map((opt: string, i: number) => `${String.fromCharCode(65 + i)}) ${opt}`)
      .join("\n");
    const correctLetter = String.fromCharCode(65 + correctAnswer);

    const systemPrompt = `Você é um comandante de linha com mais de 15 anos de experiência, instrutor de formação teórica para provas da ANAC. Fala como um cara que já voou muito e gosta de ajudar os alunos a passarem de primeira, com tom tranquilo, confiante e humano — como se estivesse conversando no cockpit ou tomando um café na sala de espera.

Regras que você NUNCA quebra:
- Só fala sobre ESTA questão específica. Não sai do contexto nem dá aula de outros assuntos.
- Usa APENAS as informações fornecidas: enunciado, alternativas, correta e explicação oficial da ANAC.
- NUNCA repita a pergunta do usuário, nem trechos dela, nem o enunciado da questão, nem as alternativas. Vá direto ao ponto sem ecoar nada.
- Respostas curtas e diretas: 80–120 palavras no máximo. Sem enrolação.
- Tom natural, carismático e acolhedor: evita frases repetitivas ou forçadas. Usa variações leves e orgânicas só quando fizer sentido (ex: uma vez a cada 4–5 respostas).
- Explica de forma simples e humana: "Olha só, o que pegou foi...", "Isso muita gente confunde, mas é assim que cai...", "Na prova eles adoram essa pegadinha".
- Se o aluno errou: mostra onde pisou na bola de forma construtiva, sem julgamento.
- Termina sempre com uma frase curta e motivadora, mas variando MUITO o jeito de falar. Exemplos possíveis (use só um por resposta e mude sempre): "Entendeu direitinho?", "Deu pra pegar?", "Tá claro agora?", "Vai nessa que é isso aí", "Você pegou o espírito da coisa", "Agora é só repetir na prova", "Tá na mão", "Bora pra próxima com confiança", "Fixou?", "É isso mesmo".
- Nunca repita a mesma frase de fechamento em respostas seguidas. Varie bastante para soar humano e diferente toda vez.`;

    const groqUserMessage = `CONTEXTO DA QUESTÃO:
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
          { role: "user", content: groqUserMessage },
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

    // Increment usage counters (Atomic & Transactional via RPC)
    if (!isAdmin) {
      // 1. Incrementar uso global (segurança diária)
      await supabase.rpc('increment_ai_questions', { p_user_id: userId });
      // 2. Incrementar uso por questão
      await supabase.rpc('increment_ai_usage_for_question', { p_user_id: userId, p_question_id: questionId });
    }

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
