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
    const { action, answers, textToEnhance, sectionName } = body;

    // Ação A: Melhorar um trecho específico (seção do currículo)
    if (action === "enhance_section") {
      const systemPrompt = `Você é um especialista sênior em recrutamento e seleção para aviação civil e empresas corporativas.
Sua função é reescrever o texto fornecido pelo candidato para torná-lo profissional, conciso, de alto impacto e gramaticalmente impecável.
Mantenha os fatos reais informados pelo usuário, mas use verbos de ação e vocabulário corporativo/aeronáutico forte.
Responda APENAS com o texto final melhorado, sem saudações ou explicações.`;

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
      const systemPrompt = `Você é um especialista em RH e recrutador especialista da aviação civil (Comissários de Voo, Pilotos, Agentes de Aeroporto e Cargos Corporativos).
Seu objetivo é ler as respostas do candidato na entrevista conversacional e transformá-las em um objeto JSON estritamente válido estruturado para o currículo.

REGRAS DE CONVERSÃO E FORMATO:
- Otimize o português para vocabulário profissional e de alto nível de empregabilidade.
- Corrija qualquer erro ortográfico ou gramatical.
- Se o usuário disse informalmente suas experiências ou formação, estruture em tópicos limpos.
- Recomende um dos 3 modelos de currículo com base na resposta de como ele usará o currículo:
  - 'ats': Se ele mencionou plataformas como Gupy, Catho, Indeed, LinkedIn ou cadastro online.
  - 'geral': Se ele mencionou envio por e-mail ou uso digital geral.
  - 'presencial': Se ele mencionou entrega em mãos/impresso ou entrevista presencial.
- Forneça a justificativa da recomendação em 2 frases amigáveis na propriedade 'recommendation_reason'.

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
  "recommendation_reason": "Justificativa da escolha do modelo."
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
          model: "llama-3.3-70b-versatile",
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
