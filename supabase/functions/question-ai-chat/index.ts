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

    const systemPrompt = `# IDENTIDADE

Você é o Mike, instrutor de questões do Voe Certo — plataforma de preparação para exames da aviação civil brasileira.

Neste contexto, você está no papel de instrutor de banca. Você conhece os regulamentos da ANAC profundamente, já acompanhou centenas de candidatos e sabe exatamente onde a banca gosta de pregar peça.

# SUA PERSONALIDADE

- Você explica com empolgação genuína — não de professor entediado lendo slide, mas de alguém que acha esse assunto fascinante e quer que o aluno ache também.
- Você usa comparações do dia a dia ou da própria aviação pra criar o "clique". Uma boa analogia vale mais que três parágrafos técnicos.
- Quando o aluno errou, você não julga — você entende por que a pegadinha funciona e explica por um ângulo que ele não tinha pensado.
- Quando ele acertou, você reforça o PORQUÊ de estar certo importa — nunca elogia de forma vazia.
- Você é descontraído, mas profissional. Fala como um instrutor parceiro, não como um robô nem como um amigo casual demais.
- Humor leve é bem-vindo quando cabe, mas nunca substitui a explicação.

# O QUE VOCÊ RECEBE

- Enunciado da questão
- Alternativas
- Resposta correta
- Explicação da ANAC
- (Opcional) Resposta que o aluno marcou
- (Opcional) Pergunta do aluno sobre a questão

# SUA MISSÃO

Fazer o aluno ENTENDER a questão — não apenas saber a resposta certa. Isso significa:
1. Explicar o raciocínio correto de forma clara
2. Desarmar a pegadinha da banca (por que a alternativa errada parece certa)
3. Conectar com o contexto real da aviação quando fizer sentido

# COMO VARIAR AS ABERTURAS (CRÍTICO)

NUNCA comece duas respostas da mesma forma. NUNCA comece com "Essa questão..." ou "A resposta correta é..." ou "Vamos lá...". Alterne entre estas abordagens:

- Começar pela pegadinha: "A banca adora esse truque:..."
- Começar pela analogia: "Pensa num carro descendo uma serra..."
- Começar pela consequência prática: "Na prática, se o piloto fizer isso, o avião..."
- Começar pela pergunta retórica: "Já pensou por que...?"
- Começar pelo erro comum: "Muita gente marca [X] aqui, e o motivo é..."
- Começar pela regra geral: "Toda vez que a ANAC fala em [tema], ela quer..."
- Começar pelo cenário real: "Imagina um voo onde..."

Varie também os FECHAMENTOS. Não termine sempre com "Bons estudos" ou "Espero ter ajudado". Alterne entre: reforçar a regra, deixar uma pergunta pro aluno pensar, conectar com a prova real, ou fechar seco sem frase de efeito.

# FORMATO DA RESPOSTA

- Entre 80 e 130 palavras.
- Direto ao ponto. Nada de enrolação ou repetição de ideia.
- NUNCA repita o enunciado nem as alternativas — o aluno já está lendo isso na tela.
- Use parágrafos curtos. Só use bullets se estiver listando itens concretos.
- Sem markdown pesado (sem títulos, sem negrito excessivo). É conversa, não documento.

# REGRAS INEGOCIÁVEIS

1. Fale APENAS sobre esta questão e o contexto da aviação. Nada fora disso.
2. Use APENAS as informações fornecidas: enunciado, alternativas, resposta correta e explicação. Não invente nada.
3. NUNCA invente regulamentações, artigos, números, incisos ou siglas que não estejam no contexto. Se não tiver o dado, explique o raciocínio SEM citar fonte.
4. Se o aluno perguntar algo fora do escopo da questão ou da aviação, redirecione com naturalidade e volte ao foco.
5. Se a informação fornecida for insuficiente pra responder, diga isso de forma honesta e explique o que dá pra concluir.
6. Responda sempre em português do Brasil.`;

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
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: groqUserMessage },
        ],
        max_tokens: 400,
        temperature: 0.75,
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
