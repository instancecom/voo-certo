// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getWelcomeEmailHtml } from "./emailTemplates.ts"

// A chave da API do Resend deve ser configurada nos secrets do Supabase
// @ts-ignore
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req: any) => {
  try {
    // Permitir apenas requisições POST (Webhook do Supabase)
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405,
        headers: { "Content-Type": "application/json" }
      })
    }

    const payload = await req.json()
    
    // O Webhook do Supabase Database Trigger envia o novo registro em payload.record
    const record = payload.record
    
    // Verificamos se o email existe no payload
    // OBS: Dependendo da tabela (auth.users ou public.profiles), o campo pode mudar
    const userEmail = record?.email
    
    if (!userEmail) {
      return new Response(JSON.stringify({ error: 'Nenhum email encontrado no registro do webhook.' }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    // Tenta pegar o nome da tabela profiles, caso não exista, usa um default
    const userName = record?.full_name || record?.first_name || record?.nome || "Aeronauta"

    // Gera o HTML do email usando nossos componentes
    const htmlContent = getWelcomeEmailHtml(userName)

    // Fazemos a requisição direta para a API do Resend (mais leve que importar a lib inteira no Deno)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        // IMPORTANTE: Esse email deve ter um domínio verificado no Resend.
        // Se você ainda não verificou o domínio voocerto.com.br no Resend,
        // mude o "from" temporariamente para: 'onboarding@resend.dev'
        from: 'Voo Certo <onboarding@resend.dev>', 
        to: [userEmail],
        subject: 'Bem-vindo(a) à Voo Certo ✈️',
        html: htmlContent,
      })
    })

    if (!res.ok) {
      const errorData = await res.text()
      throw new Error(`Erro na API do Resend: ${errorData}`)
    }

    const data = await res.json()

    return new Response(
      JSON.stringify({ message: "Email enviado com sucesso!", id: data.id }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    )

  } catch (error: any) {
    console.error("Erro ao enviar email de boas-vindas:", error.message || error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    )
  }
})
