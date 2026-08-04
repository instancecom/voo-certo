// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { 
  getWelcomeEmailHtml,
  getPlanConfirmationEmailHtml, 
  getInactiveEmailHtml, 
  getPasswordResetEmailHtml, 
  getStudyReminderEmailHtml 
} from "./emailTemplates.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: any) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    // Remetente oficial (Configurável via Supabase Secrets: RESEND_FROM_EMAIL)
    // Exemplo em produção: 'Voe Certo <atendimento@voecerto.com.br>'
    const configuredFrom = Deno.env.get('RESEND_FROM_EMAIL')
    const fromEmail = configuredFrom || 'Voe Certo <onboarding@resend.dev>'

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY não configurada nos secrets do Supabase.")
      return new Response(
        JSON.stringify({ 
          warning: "Chave do Resend pendente. Assim que você configurar a RESEND_API_KEY no Supabase Secrets, o disparo será automático.",
          status: "simulated" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const payload = await req.json().catch(() => ({}))
    const { action, email, name, planName, daysInactive, resetUrl, streakDays } = payload

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Endereço de e-mail de destino é obrigatório.' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const userName = name || 'Tripulante'
    let subject = 'Mensagem da Voe Certo ✈️'
    let htmlContent = ''

    // Seleciona o modelo de e-mail solicitado
    switch (action) {
      case 'welcome':
        subject = 'Bem-vindo(a) à Voe Certo ✈️ Sua jornada na aviação começa agora'
        htmlContent = getWelcomeEmailHtml(userName)
        break

      case 'plan_activated':
      case 'plan_confirmation':
        subject = `Decolagem Autorizada! 🚀 Seu plano ${planName || 'Tripulante'} foi ativado com sucesso`
        htmlContent = getPlanConfirmationEmailHtml(userName, planName || 'Tripulante')
        break

      case 'inactive_reminder':
      case 'inactive':
        subject = `Sentimos sua falta na torre de controle! 📡 Retome seus treinos, ${userName}`
        htmlContent = getInactiveEmailHtml(userName, Number(daysInactive) || 3)
        break

      case 'password_reset':
        subject = '🔑 Solicitação de Redefinição de Senha — Voe Certo'
        htmlContent = getPasswordResetEmailHtml(userName, resetUrl || 'https://voe-certo.vercel.app/reset-password')
        break

      case 'study_reminder':
      case 'study':
        subject = 'Hora do seu treino diário de voo! 🛫 Faça 1 simulado hoje'
        htmlContent = getStudyReminderEmailHtml(userName, Number(streakDays) || 1)
        break

      default:
        subject = 'Notificação — Voe Certo ✈️'
        htmlContent = getWelcomeEmailHtml(userName)
        break
    }

    // Disparo direto para a API do Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: subject,
        html: htmlContent,
      })
    })

    const resendResult = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error("Erro na API do Resend:", resendResult)
      
      // Fallback automático para sandbox de testes caso o domínio ainda esteja pendente de verificação
      if (resendResult?.message?.includes('domain') && fromEmail !== 'Voe Certo <onboarding@resend.dev>') {
        console.info("Tentando envio via fallback onboarding@resend.dev...")
        const fallbackRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'Voe Certo <onboarding@resend.dev>',
            to: [email],
            subject: subject,
            html: htmlContent,
          })
        })
        const fallbackData = await fallbackRes.json()
        return new Response(
          JSON.stringify({ success: true, fallback: true, data: fallbackData }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      return new Response(
        JSON.stringify({ error: resendResult?.message || 'Falha ao enviar e-mail via Resend' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: resendResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (err: any) {
    console.error("Erro no envio de e-mail:", err)
    return new Response(
      JSON.stringify({ error: err?.message || 'Erro interno no servidor de e-mail' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
