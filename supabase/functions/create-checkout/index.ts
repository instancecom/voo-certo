import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// URLs reais da Cakto para cada plano do Voe Certo
const DEFAULT_CAKTO_URLS: Record<string, string> = {
  solo: "https://pay.cakto.com.br/659x89z_1012189",
  tripulante: "https://pay.cakto.com.br/o2twp3f_1012195",
  comandante: "https://pay.cakto.com.br/4wat335_1012197",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user?.email) {
      console.error("Auth error:", authError);
      throw new Error("Usuário não autenticado no Supabase");
    }

    const body = await req.json().catch(() => ({}));
    const { planId, priceId, couponCode } = body;
    
    // Mapeamento preciso do plano (solo, tripulante, comandante)
    let targetPlan = (planId || "").toLowerCase().trim();

    if (!targetPlan || !DEFAULT_CAKTO_URLS[targetPlan]) {
      const p = (priceId || "").toLowerCase();
      if (p.includes("solo") || p.includes("1t2s0k")) {
        targetPlan = "solo";
      } else if (p.includes("comandante") || p.includes("1t2s1m")) {
        targetPlan = "comandante";
      } else {
        targetPlan = "tripulante";
      }
    }

    // 1. Busca URL customizada no ambiente ou usa a URL oficial mapeada
    let baseUrl = Deno.env.get(`CAKTO_CHECKOUT_${targetPlan.toUpperCase()}`) || DEFAULT_CAKTO_URLS[targetPlan] || DEFAULT_CAKTO_URLS.tripulante;

    if (body.customCheckoutUrl) {
      baseUrl = body.customCheckoutUrl;
    }

    // 2. Anexa de forma segura os parâmetros do usuário (email, src=userId e cupom de desconto)
    const urlObj = new URL(baseUrl);
    urlObj.searchParams.set("email", user.email);
    urlObj.searchParams.set("src", user.id);
    if (user.user_metadata?.full_name) {
      urlObj.searchParams.set("name", user.user_metadata.full_name);
    }

    // Se houver cupom de desconto aplicado, anexa na URL do checkout da Cakto
    if (couponCode) {
      const formattedCoupon = couponCode.toUpperCase().trim();
      urlObj.searchParams.set("coupon", formattedCoupon);
      urlObj.searchParams.set("cupom", formattedCoupon);
    }

    const checkoutUrl = urlObj.toString();
    console.log(`Checkout Cakto gerado para plano [${targetPlan}] | Cupom: ${couponCode || 'Nenhum'} | Usuário ${user.id}: ${checkoutUrl}`);

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Critical Checkout error:", error);
    
    const errorMessage = error?.message || "Erro desconhecido ao gerar checkout";

    return new Response(JSON.stringify({ 
      error: errorMessage,
      hint: "Verifique as configurações de checkout no servidor."
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
