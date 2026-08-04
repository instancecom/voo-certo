import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Configurações do Supabase ausentes.");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const payload = await req.json().catch(() => ({}));
    console.log("Recebido Webhook Cakto:", JSON.stringify(payload, null, 2));

    // 1. Validação de Segurança do Secret do Webhook (Zero Trust)
    const CAKTO_WEBHOOK_SECRET = Deno.env.get("CAKTO_WEBHOOK_SECRET");
    if (CAKTO_WEBHOOK_SECRET && payload.secret) {
      if (payload.secret !== CAKTO_WEBHOOK_SECRET) {
        console.error("Segurança: Secret do Webhook Cakto inválido.");
        return new Response(
          JSON.stringify({ error: "Acesso não autorizado. Secret inválido." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 2. Extração de dados da transação
    const event = (payload.event || payload.type || "").toLowerCase();
    const data = payload.data || payload;

    const customerEmail = (data.customer?.email || payload.customer?.email || data.email || "").toLowerCase().trim();
    const userId = data.src || data.sck || payload.src || null;
    const offerName = (data.offer?.name || data.product?.name || payload.offer_name || "").toLowerCase();

    console.log(`Webhook Evento: ${event} | UserID: ${userId} | Email: ${customerEmail} | Oferta: ${offerName}`);

    // 3. Localizar o usuário no Supabase
    let targetUserId = userId;

    if (!targetUserId && customerEmail) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", customerEmail)
        .maybeSingle();

      if (profile?.user_id) {
        targetUserId = profile.user_id;
      } else {
        const { data: userData } = await supabase.auth.admin.listUsers();
        const foundUser = userData?.users?.find(u => u.email?.toLowerCase() === customerEmail);
        if (foundUser) {
          targetUserId = foundUser.id;
        }
      }
    }

    if (!targetUserId) {
      console.warn("Aviso: Nenhum usuário localizado no sistema para este evento de pagamento.");
      return new Response(
        JSON.stringify({ message: "Webhook recebido, mas usuário não encontrado." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Determinar o plano comprado
    let targetPlan = "tripulante";
    if (offerName.includes("comandante")) {
      targetPlan = "comandante";
    } else if (offerName.includes("solo")) {
      targetPlan = "solo";
    } else if (offerName.includes("tripulante")) {
      targetPlan = "tripulante";
    }

    // 5. Tratar Ciclo de Vida da Assinatura
    // APROVAÇÃO / RENOVAÇÃO / COMPRA
    const isApprovedEvent = [
      "purchase_approved",
      "payment_approved",
      "order_approved",
      "approved",
      "paid",
      "subscription_created",
      "subscription_renewed",
      "active"
    ].some(e => event.includes(e));

    // CANCELAMENTO APENAS DE RENOVAÇÃO FUTURA (O aluno já pagou o mês, mantemos o acesso até o fim do período)
    const isFutureCancellationEvent = [
      "subscription_cancelled",
      "cancelled"
    ].some(e => event.includes(e)) && !event.includes("expired") && !event.includes("refund");

    // EXPIRAÇÃO FINAL DO PERÍODO PAGO OU REEMBOLSO / CHARGEBACK (Revoga o acesso imediatamente)
    const isImmediateRevokeEvent = [
      "subscription_expired",
      "expired",
      "refunded",
      "chargeback",
      "refund"
    ].some(e => event.includes(e));

    if (isApprovedEvent) {
      // Define a data de expiração para 30 dias a partir do pagamento
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      console.log(`Ativando plano [${targetPlan}] para o usuário ${targetUserId} até ${expiresAt}`);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          plan_type: targetPlan,
          is_premium: true,
          plan_expires_at: expiresAt,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", targetUserId);

      if (updateError) {
        console.error("Erro ao atualizar plano no perfil:", updateError);
        throw updateError;
      }

      // Envia o e-mail transacional de confirmação de plano ativado via Resend
      if (customerEmail) {
        try {
          await supabase.functions.invoke('send-email', {
            body: {
              action: 'plan_activated',
              email: customerEmail,
              planName: targetPlan.toUpperCase()
            }
          });
          console.log(`E-mail de confirmação do plano [${targetPlan}] enviado para ${customerEmail}`);
        } catch (emailErr) {
          console.warn("Aviso: Falha não-bloqueante ao disparar e-mail via Resend:", emailErr);
        }
      }
    } else if (isFutureCancellationEvent) {
      // O aluno cancelou a renovação automática, mas MANTÉM o acesso restante do ciclo que ele já pagou!
      console.log(`Cancelamento de renovação registrado para ${targetUserId}. Acesso mantido até a expiração do ciclo.`);
    } else if (isImmediateRevokeEvent) {
      // O período pago expirou totalmente OU houve reembolso/estorno -> Revoga o acesso
      console.log(`Revogando plano e acesso para o usuário ${targetUserId}`);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          plan_type: "free",
          is_premium: false,
          plan_expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", targetUserId);

      if (updateError) {
        console.error("Erro ao revogar plano no perfil:", updateError);
        throw updateError;
      }
    }

    return new Response(
      JSON.stringify({ status: "success", event, userId: targetUserId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Erro no processamento do Webhook Cakto:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erro interno no servidor de Webhook" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
