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
      return new Response(JSON.stringify({ error: "Autenticação necessária para o assistente de currículos." }), {
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
    const { action, answers, textToEnhance, sectionName } = body;

    // Ação A: Melhorar um trecho específico (seção do currículo)
    if (action === "enhance_section") {
      const systemPrompt = `Você é o Mike — assistente completo do Voe Certo, especialista em carreiras na aviação civil brasileira.

Sua função agora é reescrever o trecho que o candidato escreveu manualmente, tornando-o profissional, conciso e de alto impacto, mantendo fielmente os fatos reais informados.

Use verbos de ação fortes, vocabulário corporativo e aeronáutico apropriado. Corrija gramática e ortografia sem alterar os fatos.
Responda APENAS com o texto final melhorado — sem saudações, sem explicações adicionais.`;

      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Seção: ${sectionName || 'Resumo'}\nTexto original: ${textToEnhance}` },
          ],
          temperature: 0.6,
          max_tokens: 400,
        }),
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error("Groq API error (enhance_section):", groqResponse.status, errorText);
        throw new Error(`Groq API error ${groqResponse.status}: ${errorText}`);
      }

      const groqData = await groqResponse.json();
      const enhancedText = groqData.choices?.[0]?.message?.content?.trim() || textToEnhance;

      return new Response(JSON.stringify({ enhancedText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ação B: Gerar Currículo Completo Estruturado em JSON a partir das respostas do Chat
    if (action === "generate_curriculum") {
      const systemPrompt = `Você é o Mike — assistente completo do Voe Certo, especialista em carreiras na aviação civil brasileira.

Neste contexto, você acabou de conduzir uma conversa com o candidato e agora vai transformar as respostas dele em um currículo profissional de alto impacto. Você conhece o mercado de aviação por dentro: sabe o que os recrutadores da Azul, LATAM, GOL e empresas de aviação executiva procuram, e sabe que um currículo mal estruturado descarta um ótimo candidato antes de qualquer entrevista.

Sua personalidade aqui:
- Você trata a história do candidato com respeito e cuidado — o que ele te contou de forma simples, você transforma em texto profissional sem distorcer a realidade.
- Você é otimista com o material que recebeu, mas honesto na estrutura: não infla conquistas, mas as apresenta da melhor forma possível.
- Verbos de ação, vocabulário corporativo/aeronáutico forte, frases concisas — esse é o padrão.

Regras inegociáveis:
- Retorne EXCLUSIVAMENTE um objeto JSON válido, sem texto antes ou depois.
- Corrija erros ortográficos e gramaticais do candidato sem alterar os fatos.
- Se uma informação não foi fornecida, deixe o campo como string vazia — não invente dados.
- Recomende o template correto (ats / geral / presencial) com base em como o candidato disse que vai usar o currículo:
  - 'ats': Se ele mencionou plataformas como Gupy, Catho, Indeed, LinkedIn ou cadastro online.
  - 'geral': Se ele mencionou envio por e-mail ou uso digital geral.
  - 'presencial': Se ele mencionou entrega em mãos/impresso ou entrevista presencial.
- O campo "recommendation_reason" deve soar como o Mike falando diretamente pro candidato — curto, humano, direto.

Retorne EXCLUSIVAMENTE um objeto JSON válido com a seguinte estrutura (sem texto explicativo antes ou depois):
{
  "full_name": "Nome Completo do Candidato",
  "email": "email@exemplo.com",
  "phone": "(11) 99999-9999",
  "city": "Cidade - UF",
  "profession": "Cargo Desejado / Área de Atuação",
  "summary": "Resumo profissional convincente e de alto impacto de 3 a 5 linhas.",
  "experience": [
    { "company": "Nome da Empresa", "role": "Cargo", "start": "Ano/Mês", "end": "Ano/Mês ou Atual", "description": "Principais responsabilidades e conquistas" }
  ],
  "education": [
    { "institution": "Nome da Instituição/Escola", "degree": "Curso/Formação", "year": "Ano de Conclusão" }
  ],
  "certificates": [
    { "name": "Nome da Certificação/Curso", "issuer": "Instituição/Órgão", "year": "Ano" }
  ],
  "languages": [
    { "name": "Idioma (ex: Inglês)", "level": "Nível (ex: Fluente / Avançado / Intermediário)" }
  ],
  "skills": ["Competência 1", "Competência 2", "Competência 3"],
  "recommended_template": "ats | geral | presencial",
  "recommendation_reason": "Mike falando diretamente: justificativa curta e humana da escolha do modelo."
}`;

      const groqUserPrompt = `Aqui estão as respostas fornecidas pelo candidato na conversa de 6 etapas:

1. Nome e Contato/Cidade: ${answers?.q0 || 'Não informado'}
2. Área de atuação e cargo que busca: ${answers?.q1 || 'Não informado'}
3. Como pretende utilizar o currículo (Gupy, e-mail, impresso): ${answers?.q2 || 'Não informado'}
4. Formação acadêmica: ${answers?.q3 || 'Não informado'}
5. Experiência profissional: ${answers?.q4 || 'Não informado'}
6. Cursos, certificações e idiomas: ${answers?.q5 || 'Não informado'}
7. Objetivo profissional / Resumo pessoal: ${answers?.q6 || 'Não informado'}

Por favor, converta esses dados em um currículo profissional em JSON válido conforme especificado.`;

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
            { role: "user", content: groqUserPrompt },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error("Groq API error (generate_curriculum):", groqResponse.status, errorText);
        throw new Error(`Groq API error ${groqResponse.status}: ${errorText}`);
      }

      const groqData = await groqResponse.json();
      const content = groqData.choices?.[0]?.message?.content || "";

      // Limpar marcadores de markdown se o modelo incluir ```json ... ```
      let jsonString = content.trim();
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }

      const parsedCurriculum = JSON.parse(jsonString);

      return new Response(JSON.stringify({ curriculum: parsedCurriculum }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Ação não reconhecida");

  } catch (error: any) {
    console.error("Erro no curriculum-ai-assistant Edge Function:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erro ao processar currículo com IA" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
