import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { questionId, questionText, options, correctAnswer, explanation, userQuestion } = await req.json();

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase config missing");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create a hash of the user question for caching
    const encoder = new TextEncoder();
    const data = encoder.encode(userQuestion.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const questionHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 32);

    // Check cache
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

    // Build context for AI
    const optionsText = options
      .map((opt: string, i: number) => `${String.fromCharCode(65 + i)}) ${opt}`)
      .join("\n");
    
    const correctLetter = String.fromCharCode(65 + correctAnswer);

    const systemPrompt = `Você é um instrutor especialista em aviação civil e nas normas da ANAC (Agência Nacional de Aviação Civil). 
Responda APENAS sobre a questão fornecida. Não invente informações. Use apenas os dados fornecidos no contexto.
Seja didático, claro e objetivo. Responda em português brasileiro.
Limite sua resposta a no máximo 200 palavras.`;

    const userMessage = `CONTEXTO DA QUESTÃO:
Enunciado: ${questionText}

Alternativas:
${optionsText}

Resposta correta: ${correctLetter}
${explanation ? `Explicação: ${explanation}` : ""}

PERGUNTA DO ALUNO: ${userQuestion}`;

    // Call Groq API (Llama 3.1 8B Instant)
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
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("Groq API error:", aiResponse.status, errText);
      throw new Error(`Groq API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content || "Não foi possível obter resposta.";

    // Increment AI questions counter for user
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);
      if (userData?.user) {
        await supabase.rpc("increment_ai_count", { _user_id: userData.user.id }).catch(() => {
          // Silently fail if function doesn't exist yet
        });
      }
    }

    // Save to cache
    await supabase.from("ai_question_cache").upsert({
      question_id: questionId,
      question_hash: questionHash,
      user_question: userQuestion,
      ai_response: responseText,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
